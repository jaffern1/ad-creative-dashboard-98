import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdData } from '@/pages/Dashboard';
import { DEFAULT_SHEETS_URL } from '@/constants/dataConstants';

interface BatchLoadingProgress {
  stage: 'fetching' | 'parsing' | 'processing' | 'loading-more' | 'complete' | 'retrying';
  progress: number;
  currentBatch: number;
  totalBatches: number;
  recordsLoaded: number;
  totalRecords: number;
  batchSize: number;
  retryAttempt?: number;
  maxRetries?: number;
}

interface CachedData {
  data: string;
  timestamp: number;
  url: string;
}

interface StreamingCSVParser {
  headers: string[];
  parseRow: (line: string) => AdData | null;
}

// Reduced batch size for faster first paint
const BATCH_SIZE = 500;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 15000; // Reduced timeout for faster failure detection
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const CACHE_KEY = 'sheets_data_cache';

// Fallback URLs for different Google Sheets export formats
const generateFallbackUrls = (baseUrl: string): string[] => {
  const urls = [baseUrl];
  
  // Try different export formats if the base URL fails
  if (baseUrl.includes('/export?format=csv')) {
    const baseWithoutParams = baseUrl.split('/export?')[0];
    urls.push(`${baseWithoutParams}/export?format=csv&gid=0`);
    urls.push(`${baseWithoutParams}/export?exportFormat=csv`);
  }
  
  return urls;
};

export const useBatchDataLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<BatchLoadingProgress>({
    stage: 'fetching',
    progress: 0,
    currentBatch: 0,
    totalBatches: 0,
    recordsLoaded: 0,
    totalRecords: 0,
    batchSize: BATCH_SIZE
  });

  const { toast } = useToast();

  // Cache management
  const getCachedData = (): CachedData | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedData = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  };

  const setCachedData = (data: string, url: string): void => {
    try {
      const cached: CachedData = {
        data,
        timestamp: Date.now(),
        url
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      // Ignore storage errors
    }
  };

  // Create CSV parser
  const createStreamingParser = (headers: string[]): StreamingCSVParser => {
    const parseRow = (line: string): AdData | null => {
      if (!line.trim()) return null;

      // Parse CSV line properly handling quoted values
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      // Convert spend to number
      obj.spend = obj.spend ? parseFloat(obj.spend.toString().replace(/[^0-9.-]/g, '')) || 0 : 0;
      
      // Convert is_first_instance to number
      obj.is_first_instance = obj.is_first_instance ? parseInt(obj.is_first_instance) || 0 : 0;
      
      // Convert is_first_instance_non_test to number
      obj.is_first_instance_non_test = obj.is_first_instance_non_test ? parseInt(obj.is_first_instance_non_test) || 0 : 0;

      // Only return rows that have an ad_name
      return (obj.ad_name && obj.ad_name.trim()) ? obj as AdData : null;
    };

    return { headers, parseRow };
  };

  // Optimized batch processing with requestAnimationFrame
  const processBatchesWithScheduling = async (
    csvText: string,
    onBatchReady: (batch: AdData[], batchInfo: { batchNumber: number, totalRecords: number, isComplete: boolean }) => void
  ): Promise<void> => {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or invalid');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const parser = createStreamingParser(headers);
    const totalLines = lines.length - 1; // Exclude header
    const totalBatches = Math.ceil(totalLines / BATCH_SIZE);

    setLoadingProgress(prev => ({
      ...prev,
      stage: 'parsing',
      totalBatches,
      totalRecords: totalLines
    }));

    let currentBatch: AdData[] = [];
    let batchNumber = 1;
    let totalProcessed = 0;
    let currentIndex = 1;

    const processBatch = async (): Promise<void> => {
      return new Promise((resolve) => {
        const batchEnd = Math.min(currentIndex + BATCH_SIZE, lines.length);
        
        // Process lines in this batch
        for (let i = currentIndex; i < batchEnd; i++) {
          const row = parser.parseRow(lines[i]);
          if (row) {
            currentBatch.push(row);
            totalProcessed++;
          }
        }

        currentIndex = batchEnd;
        const progress = Math.round((currentIndex / lines.length) * 100);
        const isComplete = currentIndex >= lines.length;

        setLoadingProgress(prev => ({
          ...prev,
          progress,
          currentBatch: batchNumber,
          recordsLoaded: totalProcessed
        }));

        // Send batch to callback
        onBatchReady(currentBatch, {
          batchNumber,
          totalRecords: totalProcessed,
          isComplete
        });

        // Reset for next batch
        currentBatch = [];
        batchNumber++;

        if (!isComplete) {
          // Use requestAnimationFrame for better performance
          requestAnimationFrame(() => {
            processBatch().then(resolve);
          });
        } else {
          setLoadingProgress(prev => ({
            ...prev,
            stage: 'complete',
            progress: 100
          }));
          resolve();
        }
      });
    };

    await processBatch();
  };

  // Improved fetch with retry and exponential backoff
  const fetchWithRetry = async (urls: string[], retryAttempt = 0): Promise<string> => {
    const currentUrl = urls[retryAttempt % urls.length];
    
    setLoadingProgress(prev => ({
      ...prev,
      stage: retryAttempt > 0 ? 'retrying' : 'fetching',
      progress: 10,
      retryAttempt,
      maxRetries: MAX_RETRIES
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, { 
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Simple, reliable text fetch
      const csvText = await response.text();
      
      setLoadingProgress(prev => ({
        ...prev,
        stage: 'processing',
        progress: 90
      }));
      
      // Cache successful result
      setCachedData(csvText, currentUrl);
      
      return csvText;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retryAttempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, retryAttempt) * 1000; // Exponential backoff
        console.log(`Fetch attempt ${retryAttempt + 1} failed, retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(urls, retryAttempt + 1);
      }
      
      throw error;
    }
  };

  const loadDataInBatches = useCallback(async (
    onFirstBatch: (data: AdData[]) => void,
    onAdditionalBatch: (data: AdData[], isComplete: boolean) => void
  ): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      console.log('Starting optimized batch data loading...');
      
      // Check for cached data first
      const cached = getCachedData();
      if (cached && cached.url === DEFAULT_SHEETS_URL) {
        console.log('Using cached data while fetching fresh data...');
        
        // Show cached data immediately
        let isFirstBatch = true;
        await processBatchesWithScheduling(cached.data, async (batch, batchInfo) => {
          if (isFirstBatch) {
            onFirstBatch(batch);
            isFirstBatch = false;
          } else {
            onAdditionalBatch(batch, batchInfo.isComplete);
          }
        });
        
        toast({
          title: "Cached data loaded",
          description: "Showing recent data. Checking for updates...",
        });
      }
      
      // Fetch fresh data
      const fallbackUrls = generateFallbackUrls(DEFAULT_SHEETS_URL);
      const csvText = await fetchWithRetry(fallbackUrls);
      
      // Only process fresh data if it's different from cached
      if (!cached || cached.data !== csvText) {
        let isFirstBatch = true;
        
        await processBatchesWithScheduling(csvText, async (batch, batchInfo) => {
          if (isFirstBatch) {
            console.log(`First batch ready: ${batch.length} records`);
            onFirstBatch(batch);
            isFirstBatch = false;
            
            toast({
              title: "Fresh data loaded",
              description: `Showing ${batch.length} most recent records. Loading more in background...`,
            });
            
            if (batchInfo.isComplete) {
              setIsLoading(false);
              toast({
                title: "All data loaded",
                description: `Successfully loaded ${batchInfo.totalRecords} total records`,
              });
            }
          } else {
            console.log(`Additional batch ${batchInfo.batchNumber}: ${batch.length} records`);
            onAdditionalBatch(batch, batchInfo.isComplete);
            
            if (batchInfo.isComplete) {
              setIsLoading(false);
              toast({
                title: "All data loaded",
                description: `Successfully loaded ${batchInfo.totalRecords} total records`,
              });
            }
          }
        });
      } else {
        console.log('Fresh data is same as cached, no update needed');
        setIsLoading(false);
      }

    } catch (error) {
      console.error('Error in optimized batch loading:', error);
      
      // Try to use cached data as fallback
      const cached = getCachedData();
      if (cached) {
        console.log('Using cached data as fallback...');
        
        let isFirstBatch = true;
        await processBatchesWithScheduling(cached.data, async (batch, batchInfo) => {
          if (isFirstBatch) {
            onFirstBatch(batch);
            isFirstBatch = false;
          } else {
            onAdditionalBatch(batch, batchInfo.isComplete);
          }
        });
        
        toast({
          title: "Using cached data",
          description: "Network failed, showing last successful download.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Loading failed",
          description: "Couldn't load data. Please try manual upload.",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
      throw error;
    }
  }, [isLoading, toast]);

  return {
    isLoading,
    loadingProgress,
    loadDataInBatches
  };
};