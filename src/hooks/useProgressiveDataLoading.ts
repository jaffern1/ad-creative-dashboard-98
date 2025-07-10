import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchGoogleSheetsData } from '@/utils/googleSheetsUtils';
import { AdData } from '@/pages/Dashboard';
import { DEFAULT_SHEETS_URL } from '@/constants/dataConstants';
import { DataCache } from '@/utils/dataCache';
import { parseCSVFallback } from '@/utils/csvParserFallback';

export interface LoadingProgress {
  stage: 'fetching' | 'parsing' | 'processing';
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
}

export const useProgressiveDataLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    stage: 'fetching',
    progress: 0,
    recordsProcessed: 0,
    totalRecords: 0,
  });
  const { toast } = useToast();
  const workerRef = useRef<Worker | null>(null);

  // Generate simple checksum for cache validation
  const generateChecksum = useCallback((text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }, []);

  const parseCSVWithWorker = useCallback(async (csvText: string): Promise<AdData[]> => {
    // Try Web Worker first
    try {
      return new Promise((resolve, reject) => {
        const worker = new Worker(
          new URL('../workers/csvParser.worker.ts', import.meta.url),
          { type: 'module' }
        );
        workerRef.current = worker;

        worker.onmessage = (e) => {
          const message = e.data;
          
          switch (message.type) {
            case 'PROGRESS':
              setLoadingProgress(prev => ({
                ...prev,
                stage: message.stage,
                progress: message.progress,
                recordsProcessed: message.recordsProcessed,
                totalRecords: message.totalRecords,
              }));
              break;
              
            case 'COMPLETE':
              worker.terminate();
              workerRef.current = null;
              resolve(message.data);
              break;
              
            case 'ERROR':
              worker.terminate();
              workerRef.current = null;
              reject(new Error(message.error));
              break;
          }
        };

        worker.onerror = (error) => {
          worker.terminate();
          workerRef.current = null;
          reject(error);
        };

        // Start parsing
        worker.postMessage({
          type: 'PARSE_CSV',
          csvText,
          chunkSize: 200,
        });
      });
    } catch (workerError) {
      console.warn('Web Worker failed, using fallback parser:', workerError);
      
      // Fall back to main thread parsing
      setLoadingProgress(prev => ({
        ...prev,
        stage: 'parsing',
        progress: 50,
      }));
      
      const data = parseCSVFallback(csvText);
      
      setLoadingProgress(prev => ({
        ...prev,
        progress: 85,
        recordsProcessed: data.length,
        totalRecords: data.length,
      }));
      
      return data;
    }
  }, []);

  const loadGoogleSheetsData = useCallback(async (): Promise<AdData[]> => {
    try {
      setIsLoading(true);
      setLoadingProgress({
        stage: 'fetching',
        progress: 0,
        recordsProcessed: 0,
        totalRecords: 0,
      });

      console.log('Loading data from Google Sheets...');
      
      // Fetch data
      setLoadingProgress(prev => ({ ...prev, progress: 20 }));
      const csvText = await fetchGoogleSheetsData(DEFAULT_SHEETS_URL);
      console.log(`CSV data received, length: ${csvText.length}`);
      
      // Generate checksum for cache validation
      const checksum = generateChecksum(csvText);
      
      // Check cache first
      setLoadingProgress(prev => ({ ...prev, progress: 30 }));
      const cachedData = await DataCache.get(checksum);
      
      if (cachedData) {
        setLoadingProgress(prev => ({ ...prev, progress: 100 }));
        
        toast({
          title: "Data loaded from cache",
          description: `Loaded ${cachedData.length.toLocaleString()} records from cache`,
        });
        
        return cachedData;
      }

      // Parse with Web Worker
      setLoadingProgress(prev => ({ ...prev, progress: 40 }));
      const csvData = await parseCSVWithWorker(csvText);
      
      // Final processing
      setLoadingProgress(prev => ({
        ...prev,
        stage: 'processing',
        progress: 90,
      }));

      // Cache the results
      await DataCache.set(csvData, csvText);

      setLoadingProgress(prev => ({ ...prev, progress: 100 }));

      if (csvData.length === 0) {
        throw new Error('No valid data rows found in the sheet');
      }

      toast({
        title: "Data loaded successfully",
        description: `Loaded ${csvData.length.toLocaleString()} records from Google Sheets`,
      });

      return csvData;
    } catch (error) {
      console.error('Error loading Google Sheets data:', error);
      
      toast({
        title: "Auto-load failed",
        description: "Couldn't load default data. Please upload manually or try again.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [parseCSVWithWorker, generateChecksum, toast]);

  // Cleanup worker on unmount
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    isLoading,
    loadingProgress,
    loadGoogleSheetsData,
    cleanup,
  };
};