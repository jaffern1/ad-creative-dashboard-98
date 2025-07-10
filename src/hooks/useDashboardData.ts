
import { useEffect, useRef } from 'react';
import { useBatchDataLoading } from './useBatchDataLoading';
import { useDataSourceManagement } from './useDataSourceManagement';
import { useLastUpdated } from './useLastUpdated';

export const useDashboardData = () => {
  const { isLoading, loadingProgress, loadDataInBatches } = useBatchDataLoading();
  const {
    data,
    dataSource,
    showManualUpload,
    isLoadingMore,
    hasMoreData,
    handleDataUpload,
    handleSwitchToManual,
    setAutoSheetsData,
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
        console.log('Starting batch data load...');
        hasLoadedInitialData.current = true;
        
        await loadDataInBatches(
          // First batch callback - show data immediately
          (firstBatch) => {
            console.log('Received first batch:', firstBatch.length, 'records');
            setFirstBatch(firstBatch);
          },
          // Additional batches callback - append progressively
          (additionalBatch, isComplete) => {
            console.log('Received additional batch:', additionalBatch.length, 'records, complete:', isComplete);
            appendBatch(additionalBatch, isComplete);
          }
        );
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setShowManualUploadState(true);
      }
    };

    loadInitialData();
  }, [loadDataInBatches, setFirstBatch, appendBatch, setShowManualUploadState]);

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
