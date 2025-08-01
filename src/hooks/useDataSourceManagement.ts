
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdData } from '@/pages/Dashboard';

export const useDataSourceManagement = () => {
  const [data, setData] = useState<AdData[]>([]);
  const [dataSource, setDataSource] = useState<'supabase-db' | 'auto-sheets' | 'manual-csv' | null>(null);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(false);
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
    setIsLoadingMore(false);
    setHasMoreData(false);
  }, []);

  const setSupabaseData = useCallback((csvData: AdData[]) => {
    setData(csvData);
    setDataSource('supabase-db');
    setIsLoadingMore(false);
    setHasMoreData(false);
  }, []);

  const setFirstBatch = useCallback((csvData: AdData[], source: 'supabase-db' | 'auto-sheets' = 'supabase-db') => {
    setData(csvData);
    setDataSource(source);
    setIsLoadingMore(true);
    setHasMoreData(true);
  }, []);

  const appendBatch = useCallback((newData: AdData[], isComplete: boolean) => {
    setData(prevData => [...prevData, ...newData]);
    setIsLoadingMore(!isComplete);
    setHasMoreData(!isComplete);
  }, []);

  const setShowManualUploadState = useCallback((show: boolean) => {
    setShowManualUpload(show);
  }, []);

  return {
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
  };
};
