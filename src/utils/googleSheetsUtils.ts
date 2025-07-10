
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

export const fetchGoogleSheetsData = async (
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
  
  // Try to fetch the data
  let response;
  try {
    response = await fetch(csvUrl, {
      mode: 'cors',
      headers: {
        'Accept': 'text/csv',
      }
    });
  } catch (corsError) {
    console.log('CORS error, trying alternative approach');
    // If the original URL fails and we have sheet info, try building alternative URLs
    if (sheetInfo) {
      const alternativeCsvUrl = sheetInfo.type === 'published' 
        ? `https://docs.google.com/spreadsheets/d/${sheetInfo.id}/export?format=csv&gid=${sheetInfo.gid}`
        : `https://docs.google.com/spreadsheets/d/e/${sheetInfo.id}/pub?gid=${sheetInfo.gid}&single=true&output=csv`;
      
      response = await fetch(alternativeCsvUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'text/csv',
        }
      });
    } else {
      throw corsError;
    }
  }
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
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
};
