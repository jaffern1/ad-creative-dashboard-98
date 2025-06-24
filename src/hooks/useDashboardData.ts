
import { useEffect, useRef } from 'react';
import { useDataLoading } from './useDataLoading';
import { useDataSourceManagement } from './useDataSourceManagement';
import { useLastUpdated } from './useLastUpdated';

export const useDashboardData = () => {
  const { isInitialLoading, setIsInitialLoading, loadGoogleSheetsData } = useDataLoading();
  const {
    data,
    dataSource,
    showManualUpload,
    handleDataUpload,
    handleSwitchToManual,
    setAutoSheetsData,
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
        console.log('Starting initial data load...');
        hasLoadedInitialData.current = true;
        const csvData = await loadGoogleSheetsData();
        setAutoSheetsData(csvData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setShowManualUploadState(true);
      }
    };

    loadInitialData();
  }, [loadGoogleSheetsData, setAutoSheetsData, setShowManualUploadState]);

  return {
    data,
    dataSource,
    isInitialLoading,
    showManualUpload,
    lastUpdated,
    handleDataUpload,
    handleSwitchToManual
  };
};
