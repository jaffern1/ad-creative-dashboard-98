export interface SheetInfo {
  type: 'published' | 'regular';
  id: string;
  gid: string;
  isDirectCsv: boolean;
}

export const extractSheetInfo = (url: string): SheetInfo | null => {
  // Handle publish-to-web CSV URLs
  const publishMatch = url.match(/\/d\/e\/([a-zA-Z0-9-_]+)\/pub.*output=csv/);
  if (publishMatch) {
    const gidMatch = url.match(/gid=(\d+)/);
    return {
      type: 'published',
      id: publishMatch[1],
      gid: gidMatch ? gidMatch[1] : '0',
      isDirectCsv: true
    };
  }

  // Handle regular spreadsheet URLs
  const regularMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (regularMatch) {
    const gidMatch = url.match(/gid=(\d+)/);
    return {
      type: 'regular',
      id: regularMatch[1],
      gid: gidMatch ? gidMatch[1] : '0',
      isDirectCsv: false
    };
  }

  return null;
};

export const buildCsvUrl = (sheetInfo: SheetInfo): string => {
  if (sheetInfo.type === 'published') {
    return `https://docs.google.com/spreadsheets/d/e/${sheetInfo.id}/pub?gid=${sheetInfo.gid}&single=true&output=csv`;
  } else {
    return `https://docs.google.com/spreadsheets/d/${sheetInfo.id}/export?format=csv&gid=${sheetInfo.gid}`;
  }
};

export const isValidGoogleSheetsUrl = (url: string): boolean => {
  return (url.includes('docs.google.com/spreadsheets') && extractSheetInfo(url) !== null) ||
         (url.includes('output=csv') && url.includes('docs.google.com'));
};

// Enhanced fetch with better error handling and multiple strategies
export const fetchGoogleSheetsDataImproved = async (
  url: string, 
  onProgress?: (progress: number, downloaded: number, total: number) => void
): Promise<string> => {
  const sheetInfo = extractSheetInfo(url);
  let csvUrl = url;

  // If it's not already a direct CSV URL, build one
  if (sheetInfo && !sheetInfo.isDirectCsv) {
    csvUrl = buildCsvUrl(sheetInfo);
  }

  console.log('Fetching data from:', csvUrl);
  
  // Strategy 1: Try direct fetch with timeout
  try {
    return await fetchWithTimeout(csvUrl, onProgress);
  } catch (error) {
    console.log('Direct fetch failed, trying alternative approaches...', error);
  }

  // Strategy 2: Try alternative URL formats
  if (sheetInfo) {
    const alternativeUrls = generateAlternativeUrls(sheetInfo);
    
    for (const altUrl of alternativeUrls) {
      try {
        console.log('Trying alternative URL:', altUrl);
        return await fetchWithTimeout(altUrl, onProgress);
      } catch (error) {
        console.log('Alternative URL failed:', altUrl, error);
        continue;
      }
    }
  }

  // Strategy 3: Try with different headers and CORS settings
  try {
    return await fetchWithCorsFallback(csvUrl, onProgress);
  } catch (error) {
    console.log('CORS fallback failed:', error);
  }

  // Strategy 4: Try with proxy or different approach
  try {
    return await fetchWithProxy(csvUrl, onProgress);
  } catch (error) {
    console.log('Proxy approach failed:', error);
  }

  throw new Error('All fetch strategies failed. Please check the Google Sheets URL and permissions.');
};

// Generate multiple alternative URLs for different export formats
const generateAlternativeUrls = (sheetInfo: SheetInfo): string[] => {
  const urls: string[] = [];
  
  if (sheetInfo.type === 'published') {
    // Try different published formats
    urls.push(`https://docs.google.com/spreadsheets/d/e/${sheetInfo.id}/pub?gid=${sheetInfo.gid}&single=true&output=csv`);
    urls.push(`https://docs.google.com/spreadsheets/d/e/${sheetInfo.id}/pub?gid=${sheetInfo.gid}&output=csv`);
    urls.push(`https://docs.google.com/spreadsheets/d/e/${sheetInfo.id}/pub?output=csv&gid=${sheetInfo.gid}`);
  } else {
    // Try different export formats
    urls.push(`https://docs.google.com/spreadsheets/d/${sheetInfo.id}/export?format=csv&gid=${sheetInfo.gid}`);
    urls.push(`https://docs.google.com/spreadsheets/d/${sheetInfo.id}/export?exportFormat=csv&gid=${sheetInfo.gid}`);
    urls.push(`https://docs.google.com/spreadsheets/d/${sheetInfo.id}/export?format=csv`);
  }
  
  return urls;
};

// Enhanced fetch with configurable timeout
const fetchWithTimeout = async (
  url: string, 
  onProgress?: (progress: number, downloaded: number, total: number) => void,
  timeoutMs: number = 30000 // Increased timeout to 30 seconds
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    throw new Error(`Request timeout after ${timeoutMs}ms`);
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'text/csv,text/plain,*/*',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    // Check if response is actually CSV
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('text/csv') && !contentType.includes('text/plain')) {
      console.warn('Unexpected content type:', contentType);
    }

    // Get content length for progress tracking
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    if (!response.body) {
      throw new Error('Response body is not available for streaming');
    }

    // Stream the response with progress tracking
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let downloaded = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        downloaded += value.length;
        
        // Report progress if callback provided and total size is known
        if (onProgress && total > 0) {
          const progress = Math.round((downloaded / total) * 100);
          onProgress(progress, downloaded, total);
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    // Convert chunks to text
    const decoder = new TextDecoder();
    const csvText = chunks.map(chunk => decoder.decode(chunk, { stream: true })).join('');
    
    console.log('CSV data received, length:', csvText.length);
    
    if (!csvText || csvText.length < 10) {
      throw new Error('No data received from Google Sheets');
    }

    return csvText;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// CORS fallback with different headers
const fetchWithCorsFallback = async (
  url: string, 
  onProgress?: (progress: number, downloaded: number, total: number) => void
): Promise<string> => {
  const response = await fetch(url, {
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Accept': 'text/csv',
      'User-Agent': 'Mozilla/5.0 (compatible; CSV-Downloader/1.0)',
      'Referer': 'https://docs.google.com/'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const csvText = await response.text();
  
  if (!csvText || csvText.length < 10) {
    throw new Error('No data received from Google Sheets');
  }

  return csvText;
};

// Proxy approach (if you have a backend proxy)
const fetchWithProxy = async (
  url: string, 
  onProgress?: (progress: number, downloaded: number, total: number) => void
): Promise<string> => {
  // This would require a backend proxy endpoint
  // For now, we'll just throw an error to indicate this strategy isn't implemented
  throw new Error('Proxy approach not implemented - requires backend proxy endpoint');
};

// Health check function to test Google Sheets connectivity
export const testGoogleSheetsConnectivity = async (url: string): Promise<{
  isHealthy: boolean;
  error?: string;
  responseTime?: number;
}> => {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for health check
    
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'HEAD', // Just check if the resource exists
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    return {
      isHealthy: response.ok,
      responseTime,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error) {
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
