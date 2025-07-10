import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdData } from '@/pages/Dashboard';
import { DEFAULT_SHEETS_URL } from '@/constants/dataConstants';

interface BatchLoadingProgress {
  stage: 'fetching' | 'parsing' | 'processing' | 'loading-more' | 'complete';
  progress: number;
  currentBatch: number;
  totalBatches: number;
  recordsLoaded: number;
  totalRecords: number;
  downloadedBytes: number;
  totalBytes: number;
  batchSize: number;
}

interface StreamingCSVParser {
  headers: string[];
  parseRow: (line: string) => AdData | null;
}

const BATCH_SIZE = 1000;

export const useBatchDataLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<BatchLoadingProgress>({
    stage: 'fetching',
    progress: 0,
    currentBatch: 0,
    totalBatches: 0,
    recordsLoaded: 0,
    totalRecords: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    batchSize: BATCH_SIZE
  });

  const { toast } = useToast();

  // Create CSV parser that can handle streaming
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

  // Stream and parse CSV data in batches
  const streamAndParseBatches = async (
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

    for (let i = 1; i < lines.length; i++) {
      const row = parser.parseRow(lines[i]);
      
      if (row) {
        currentBatch.push(row);
        totalProcessed++;
      }

      // Process batch when it reaches BATCH_SIZE or we're at the end
      if (currentBatch.length >= BATCH_SIZE || i === lines.length - 1) {
        const progress = Math.round((i / lines.length) * 100);
        const isComplete = i === lines.length - 1;

        setLoadingProgress(prev => ({
          ...prev,
          progress,
          currentBatch: batchNumber,
          recordsLoaded: totalProcessed
        }));

        // Send batch to callback
        await onBatchReady(currentBatch, {
          batchNumber,
          totalRecords: totalProcessed,
          isComplete
        });

        // Reset for next batch
        currentBatch = [];
        batchNumber++;

        // Add small delay to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    setLoadingProgress(prev => ({
      ...prev,
      stage: 'complete',
      progress: 100
    }));
  };

  // Fetch CSV with streaming download progress
  const fetchWithStreamingProgress = async (url: string): Promise<string> => {
    setLoadingProgress(prev => ({
      ...prev,
      stage: 'fetching',
      progress: 0
    }));

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    if (!response.body) {
      throw new Error('Response body is not available for streaming');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let downloaded = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        downloaded += value.length;
        
        if (total > 0) {
          const progress = Math.round((downloaded / total) * 100);
          setLoadingProgress(prev => ({
            ...prev,
            progress: Math.min(progress, 99), // Keep at 99% until parsing starts
            downloadedBytes: downloaded,
            totalBytes: total
          }));
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    const decoder = new TextDecoder();
    return chunks.map(chunk => decoder.decode(chunk, { stream: true })).join('');
  };

  const loadDataInBatches = useCallback(async (
    onFirstBatch: (data: AdData[]) => void,
    onAdditionalBatch: (data: AdData[], isComplete: boolean) => void
  ): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      console.log('Starting batch data loading...');
      
      // Fetch CSV data with progress
      const csvText = await fetchWithStreamingProgress(DEFAULT_SHEETS_URL);
      
      let isFirstBatch = true;
      
      // Stream and parse in batches
      await streamAndParseBatches(csvText, async (batch, batchInfo) => {
        if (isFirstBatch) {
          console.log(`First batch ready: ${batch.length} records`);
          onFirstBatch(batch);
          isFirstBatch = false;
          
          toast({
            title: "First batch loaded",
            description: `Showing ${batch.length} most recent records. Loading more in background...`,
          });
        } else {
          console.log(`Additional batch ${batchInfo.batchNumber}: ${batch.length} records`);
          onAdditionalBatch(batch, batchInfo.isComplete);
          
          if (batchInfo.isComplete) {
            // Only set loading to false when ALL batches are complete
            setIsLoading(false);
            
            toast({
              title: "All data loaded",
              description: `Successfully loaded ${batchInfo.totalRecords} total records`,
            });
          }
        }
      });

    } catch (error) {
      console.error('Error in batch loading:', error);
      
      toast({
        title: "Loading failed",
        description: "Couldn't load data. Please try manual upload.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      throw error;
    }
    // Removed the finally block that was setting isLoading to false too early
  }, [isLoading, toast]);

  return {
    isLoading,
    loadingProgress,
    loadDataInBatches
  };
};