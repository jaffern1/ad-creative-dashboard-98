import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdData } from '@/pages/Dashboard';

interface LoadingProgress {
  current: number;
  total: number;
  percentage: number;
  stage: string;
}

export const useSupabaseBatchDataLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    stage: 'Initializing...'
  });

  const BATCH_SIZE = 500;
  const CACHE_KEY = 'supabase_dashboard_data_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getCachedData = (): { data: AdData[]; timestamp: number } | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsed = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
      
      return isExpired ? null : parsed;
    } catch {
      return null;
    }
  };

  const setCachedData = (data: AdData[]) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  };

  const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  };

  const fetchBatch = async (offset: number, limit: number): Promise<AdData[]> => {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('creative_dash_v1')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('day', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Transform the data to match the expected AdData interface
      return (data || []).map(row => ({
        ...row,
        // Ensure numeric fields are properly typed
        spend: typeof row.spend === 'number' ? row.spend : parseFloat(row.spend || '0') || 0,
        is_first_instance: typeof row.is_first_instance === 'number' ? row.is_first_instance : parseInt(row.is_first_instance || '0') || 0,
        is_first_instance_non_test: typeof row.is_first_instance_non_test === 'number' ? row.is_first_instance_non_test : parseInt(row.is_first_instance_non_test || '0') || 0,
        // Handle the extra field that might not exist in AdData interface
        is_first_appearance_overall: row.is_first_appearance_overall || 0
      })) as AdData[];
    });
  };

  const getTotalCount = async (): Promise<number> => {
    return retryWithBackoff(async () => {
      const { count, error } = await supabase
        .from('creative_dash_v1')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Failed to get count: ${error.message}`);
      }

      return count || 0;
    });
  };

  const loadDataInBatches = useCallback(async (
    onFirstBatch: (data: AdData[]) => void,
    onAdditionalBatch: (data: AdData[], isComplete: boolean) => void
  ) => {
    // Check cache first
    const cached = getCachedData();
    if (cached) {
      console.log('Using cached data:', cached.data.length, 'records');
      onFirstBatch(cached.data);
      return;
    }

    setIsLoading(true);
    setLoadingProgress({ current: 0, total: 0, percentage: 0, stage: 'Connecting to database...' });

    try {
      // Get total count
      const totalCount = await getTotalCount();
      console.log('Total records in database:', totalCount);

      if (totalCount === 0) {
        throw new Error('No data found in database');
      }

      setLoadingProgress({ 
        current: 0, 
        total: totalCount, 
        percentage: 0, 
        stage: 'Loading data...' 
      });

      // Load first batch
      const firstBatch = await fetchBatch(0, BATCH_SIZE);
      const loadedCount = firstBatch.length;

      console.log('Loaded first batch:', loadedCount, 'records');
      onFirstBatch(firstBatch);

      setLoadingProgress({ 
        current: loadedCount, 
        total: totalCount, 
        percentage: Math.round((loadedCount / totalCount) * 100),
        stage: `Loaded ${loadedCount} of ${totalCount} records` 
      });

      // If we have more data, load remaining batches
      if (totalCount > BATCH_SIZE) {
        let allData = [...firstBatch];
        let offset = BATCH_SIZE;

        while (offset < totalCount) {
          await new Promise(resolve => requestAnimationFrame(resolve));

          const batch = await fetchBatch(offset, BATCH_SIZE);
          allData = [...allData, ...batch];
          
          const currentCount = allData.length;
          const isComplete = offset + BATCH_SIZE >= totalCount;

          console.log('Loaded additional batch:', batch.length, 'records, total:', currentCount);
          onAdditionalBatch(batch, isComplete);

          setLoadingProgress({ 
            current: currentCount, 
            total: totalCount, 
            percentage: Math.round((currentCount / totalCount) * 100),
            stage: `Loaded ${currentCount} of ${totalCount} records` 
          });

          offset += BATCH_SIZE;

          if (isComplete) {
            setCachedData(allData);
            break;
          }
        }
      } else {
        setCachedData(firstBatch);
      }

      console.log('Batch loading completed successfully');
    } catch (error) {
      console.error('Error in batch loading:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    loadingProgress,
    loadDataInBatches
  };
};