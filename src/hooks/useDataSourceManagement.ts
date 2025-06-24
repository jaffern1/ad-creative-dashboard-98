
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdData } from '@/pages/Dashboard';

export const useDataSourceManagement = () => {
  const [data, setData] = useState<AdData[]>([]);
  const [dataSource, setDataSource] = useState<'auto-sheets' | 'manual-csv' | null>(null);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const { toast } = useToast();

  const handleDataUpload = useCallback((csvData: AdData[]) => {
    setData(csvData);
    setDataSource('manual-csv');
    setShowManualUpload(false);
    toast({
      title: "Data uploaded successfully",
      description: `Loaded ${csvData.length} records`,
    });
  }, [toast]);

  const handleSwitchToManual = useCallback(() => {
    setShowManualUpload(true);
    setData([]);
    setDataSource(null);
  }, []);

  const setAutoSheetsData = useCallback((csvData: AdData[]) => {
    setData(csvData);
    setDataSource('auto-sheets');
  }, []);

  const setShowManualUploadState = useCallback((show: boolean) => {
    setShowManualUpload(show);
  }, []);

  return {
    data,
    dataSource,
    showManualUpload,
    handleDataUpload,
    handleSwitchToManual,
    setAutoSheetsData,
    setShowManualUploadState
  };
};
