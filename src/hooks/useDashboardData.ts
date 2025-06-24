
import { useEffect } from 'react';
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

  // Auto-load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const csvData = await loadGoogleSheetsData();
        setAutoSheetsData(csvData);
      } catch (error) {
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
