import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdData } from '@/pages/Dashboard';
import { DEFAULT_SHEETS_URL } from '@/constants/dataConstants';
import { fetchGoogleSheetsDataImproved, testGoogleSheetsConnectivity } from '@/utils/googleSheetsUtilsImproved';

interface BatchLoadingProgress {
  stage: 'fetching' | 'parsing' | 'processing' | 'loading-more' | 'complete' | 'retrying' | 'health-check';
  progress: number;
  currentBatch: number;
  totalBatches: number;
  recordsLoaded: number;
  totalRecords: number;
  batchSize: number;
  retryAttempt?: number;
  maxRetries?: number;
  healthCheck?: {
    isHealthy: boolean;
    responseTime?: number;
    error?: string;
  };
}

interface CachedData {
  data: string;
  timestamp: number;
  url: string;
  checksum: string;
}

interface StreamingCSVParser {
  headers: string[];
  parseRow: (line: string) => AdData | null;
}

// Improved configuration
const BATCH_SIZE = 500;
const MAX_RETRIES = 5; // Increased retries
const TIMEOUT_MS = 45000; // Increased timeout to 45 seconds
const CACHE_DURATION = 10 * 60 * 1000; // Increased cache to 10 minutes
const CACHE_KEY = 'sheets_data_cache_improved';
const HEALTH_CHECK_TIMEOUT = 10000; // 10 seconds for health check

// Enhanced fallback URLs with more options
const generateFallbackUrls = (baseUrl: string): string[] => {
  const urls = [baseUrl];
  
  // Try different export formats if the base URL fails
  if (baseUrl.includes('/export?format=csv')) {
    const baseWithoutParams = baseUrl.split('/export?')[0];
    urls.push(`${baseWithoutParams}/export?format=csv&gid=0`);
    urls.push(`${baseWithoutParams}/export?exportFormat=csv`);
    urls.push(`${baseWithoutParams}/export?format=csv&gid=0&exportFormat=csv`);
  }
  
  if (baseUrl.includes('/pub?gid=')) {
    const baseWithoutParams = baseUrl.split('/pub?')[0];
    urls.push(`${baseWithoutParams}/pub?gid=0&single=true&output=csv`);
    urls.push(`${baseWithoutParams}/pub?output=csv&gid=0`);
  }
  
  return urls;
};

// Simple checksum function for cache validation
const calculateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

export const useBatchDataLoadingImproved = () => {
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

  // Enhanced cache management with checksum validation
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
      
      // Validate checksum
      const currentChecksum = calculateChecksum(data.data);
      if (currentChecksum !== data.checksum) {
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
        url,
        checksum: calculateChecksum(data)
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      // Ignore storage errors
    }
  };

  // Enhanced CSV parser with better error handling
  const createStreamingParser = (headers: string[]): StreamingCSVParser => {
    const parseRow = (line: string): AdData | null => {
      if (!line.trim()) return null;

      try {
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

        // Convert spend to number with better error handling
        if (obj.spend) {
          const spendStr = obj.spend.toString().replace(/[^0-9.-]/g, '');
          obj.spend = parseFloat(spendStr) || 0;
        } else {
          obj.spend = 0;
        }
        
        // Convert is_first_instance to number
        obj.is_first_instance = obj.is_first_instance ? parseInt(obj.is_first_instance) || 0 : 0;
        
        // Convert is_first_instance_non_test to number
        obj.is_first_instance_non_test = obj.is_first_instance_non_test ? parseInt(obj.is_first_instance_non_test) || 0 : 0;

        // Only return rows that have an ad_name
        return (obj.ad_name && obj.ad_name.trim()) ? obj as AdData : null;
      } catch (error) {
        console.warn('Error parsing CSV row:', line, error);
        return null;
      }
    };

    return { headers, parseRow };
  };

  // Enhanced batch processing with better error handling
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
    let errorCount = 0;
    const maxErrors = Math.min(100, totalLines * 0.1); // Allow up to 10% error rate

    const processBatch = async (): Promise<void> => {
      return new Promise((resolve) => {
        const batchEnd = Math.min(currentIndex + BATCH_SIZE, lines.length);
        
        // Process lines in this batch
        for (let i = currentIndex; i < batchEnd; i++) {
          try {
            const row = parser.parseRow(lines[i]);
            if (row) {
              currentBatch.push(row);
              totalProcessed++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
            console.warn(`Error processing line ${i}:`, error);
          }
        }

        // Check if error rate is too high
        if (errorCount > maxErrors) {
          throw new Error(`Too many parsing errors (${errorCount}/${totalProcessed + errorCount}). Data may be corrupted.`);
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

  // Health check before attempting download
  const performHealthCheck = async (url: string): Promise<boolean> => {
    setLoadingProgress(prev => ({
      ...prev,
      stage: 'health-check',
      progress: 5
    }));

    try {
      const healthResult = await testGoogleSheetsConnectivity(url);
      
      setLoadingProgress(prev => ({
        ...prev,
        healthCheck: healthResult
      }));

      if (!healthResult.isHealthy) {
        console.warn('Health check failed:', healthResult.error);
        return false;
      }

      console.log('Health check passed, response time:', healthResult.responseTime);
      return true;
    } catch (error) {
      console.warn('Health check error:', error);
      return false;
    }
  };

  // Enhanced fetch with multiple strategies and better error handling
  const fetchWithRetry = async (urls: string[], retryAttempt = 0): Promise<string> => {
    const currentUrl = urls[retryAttempt % urls.length];
    
    setLoadingProgress(prev => ({
      ...prev,
      stage: retryAttempt > 0 ? 'retrying' : 'fetching',
      progress: 10,
      retryAttempt,
      maxRetries: MAX_RETRIES
    }));

    try {
      // Perform health check on first attempt
      if (retryAttempt === 0) {
        const isHealthy = await performHealthCheck(currentUrl);
        if (!isHealthy) {
          console.log('Health check failed, trying next URL...');
          if (urls.length > 1) {
            return fetchWithRetry(urls, retryAttempt + 1);
          }
        }
      }

      // Use the improved fetch function
      const csvText = await fetchGoogleSheetsDataImproved(currentUrl, (progress, downloaded, total) => {
        setLoadingProgress(prev => ({
          ...prev,
          progress: Math.min(90, 10 + (progress * 0.8)), // Scale progress to 10-90%
          recordsLoaded: downloaded
        }));
      });
      
      setLoadingProgress(prev => ({
        ...prev,
        stage: 'processing',
        progress: 90
      }));
      
      // Cache successful result
      setCachedData(csvText, currentUrl);
      
      return csvText;
    } catch (error) {
      console.error(`Fetch attempt ${retryAttempt + 1} failed:`, error);
      
      if (retryAttempt < MAX_RETRIES - 1) {
        const delay = Math.min(5000, Math.pow(2, retryAttempt) * 1000); // Max 5 second delay
        console.log(`Retrying in ${delay}ms...`);
        
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
      console.log('Starting improved batch data loading...');
      
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
      
      // Fetch fresh data with improved error handling
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
      console.error('Error in improved batch loading:', error);
      
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
          description: `Couldn't load data: ${error instanceof Error ? error.message : 'Unknown error'}. Please try manual upload.`,
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
