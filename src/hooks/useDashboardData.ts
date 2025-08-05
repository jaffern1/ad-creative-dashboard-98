
import { useEffect, useRef } from 'react';
import { useBatchDataLoading } from './useBatchDataLoading';
import { useSupabaseBatchDataLoading } from './useSupabaseBatchDataLoading';
import { useDataSourceManagement } from './useDataSourceManagement';
import { useLastUpdated } from './useLastUpdated';

export const useDashboardData = () => {
  // Use CSV as primary, keep Supabase for future use
  const supabaseLoader = useSupabaseBatchDataLoading();
  const csvLoader = useBatchDataLoading();
  
  // Use CSV by default
  const { isLoading, loadingProgress, loadDataInBatches } = csvLoader;
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
        console.log('Starting CSV batch data load...');
        hasLoadedInitialData.current = true;
        
        await loadDataInBatches(
          // First batch callback - show data immediately
          (firstBatch) => {
            console.log('Received first batch from CSV:', firstBatch.length, 'records');
            setFirstBatch(firstBatch, 'auto-sheets');
          },
          // Additional batches callback - append progressively
          (additionalBatch, isComplete) => {
            console.log('Received additional batch from CSV:', additionalBatch.length, 'records, complete:', isComplete);
            appendBatch(additionalBatch, isComplete);
          }
        );
      } catch (error) {
        console.error('Failed to load data from CSV:', error);
        setShowManualUploadState(true);
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
