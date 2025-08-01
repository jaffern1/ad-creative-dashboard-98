
import { useEffect, useRef } from 'react';
import { useBatchDataLoading } from './useBatchDataLoading';
import { useSupabaseBatchDataLoading } from './useSupabaseBatchDataLoading';
import { useDataSourceManagement } from './useDataSourceManagement';
import { useLastUpdated } from './useLastUpdated';

export const useDashboardData = () => {
  // Try Supabase first, fallback to CSV if needed
  const supabaseLoader = useSupabaseBatchDataLoading();
  const csvLoader = useBatchDataLoading();
  
  // Use Supabase by default
  const { isLoading, loadingProgress, loadDataInBatches } = supabaseLoader;
  const {
    data,
    dataSource,
    showManualUpload,
    isLoadingMore,
    hasMoreData,
    handleDataUpload,
    handleSwitchToManual,
    setAutoSheetsData,
    setSupabaseData,
    setFirstBatch,
    appendBatch,
    setShowManualUploadState
  } = useDataSourceManagement();
  const lastUpdated = useLastUpdated(data);
  
  // Use ref to prevent multiple data loads
  const hasLoadedInitialData = useRef(false);

  // Auto-load data on component mount
  useEffect(() => {
    if (hasLoadedInitialData.current) {
      return;
    }

    const loadInitialData = async () => {
      try {
        console.log('Starting Supabase batch data load...');
        hasLoadedInitialData.current = true;
        
        await loadDataInBatches(
          // First batch callback - show data immediately
          (firstBatch) => {
            console.log('Received first batch from Supabase:', firstBatch.length, 'records');
            setFirstBatch(firstBatch, 'supabase-db');
          },
          // Additional batches callback - append progressively
          (additionalBatch, isComplete) => {
            console.log('Received additional batch from Supabase:', additionalBatch.length, 'records, complete:', isComplete);
            appendBatch(additionalBatch, isComplete);
          }
        );
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
        console.log('Falling back to CSV loading...');
        
        try {
          // Fallback to CSV loading
          await csvLoader.loadDataInBatches(
            (firstBatch) => {
              console.log('Received first batch from CSV:', firstBatch.length, 'records');
              setFirstBatch(firstBatch, 'auto-sheets');
            },
            (additionalBatch, isComplete) => {
              console.log('Received additional batch from CSV:', additionalBatch.length, 'records, complete:', isComplete);
              appendBatch(additionalBatch, isComplete);
            }
          );
        } catch (csvError) {
          console.error('Both Supabase and CSV loading failed:', csvError);
          setShowManualUploadState(true);
        }
      }
    };

    loadInitialData();
  }, [loadDataInBatches, csvLoader, setFirstBatch, appendBatch, setShowManualUploadState]);

  return {
    data,
    dataSource,
    isInitialLoading: isLoading,
    loadingProgress,
    showManualUpload,
    isLoadingMore,
    hasMoreData,
    lastUpdated,
    handleDataUpload,
    handleSwitchToManual
  };
};
