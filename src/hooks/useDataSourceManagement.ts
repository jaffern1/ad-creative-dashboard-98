
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdData } from '@/pages/Dashboard';

export const useDataSourceManagement = () => {
  const [data, setData] = useState<AdData[]>([]);
  const [dataSource, setDataSource] = useState<'auto-sheets' | 'manual-csv' | null>(null);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const { toast } = useToast();

  const handleDataUpload = (csvData: AdData[]) => {
    setData(csvData);
    setDataSource('manual-csv');
    setShowManualUpload(false);
    toast({
      title: "Data uploaded successfully",
      description: `Loaded ${csvData.length} records`,
    });
  };

  const handleSwitchToManual = () => {
    setShowManualUpload(true);
    setData([]);
    setDataSource(null);
  };

  const setAutoSheetsData = (csvData: AdData[]) => {
    setData(csvData);
    setDataSource('auto-sheets');
  };

  const setShowManualUploadState = (show: boolean) => {
    setShowManualUpload(show);
  };

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
