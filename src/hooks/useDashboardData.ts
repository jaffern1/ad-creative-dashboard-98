
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchGoogleSheetsData } from '@/utils/googleSheetsUtils';
import { parseCsvText } from '@/utils/csvParser';
import { AdData } from '@/pages/Dashboard';

const DEFAULT_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmTUDR12i75AFLRf0Fp1XkTOrtyvLWbvC6uU7Us6nqUACQUjiWRO1f1WWceMEMXakQ3h_NJU0q9j6u/pub?gid=112874240&single=true&output=csv';

export const useDashboardData = () => {
  const [data, setData] = useState<AdData[]>([]);
  const [dataSource, setDataSource] = useState<'auto-sheets' | 'manual-csv' | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const { toast } = useToast();

  // Auto-load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Loading initial data from Google Sheets...');
        const csvText = await fetchGoogleSheetsData(DEFAULT_SHEETS_URL);
        const csvData = parseCsvText(csvText);
        
        if (csvData.length === 0) {
          throw new Error('No valid data rows found in the sheet');
        }

        setData(csvData);
        setDataSource('auto-sheets');
        
        toast({
          title: "Data loaded successfully",
          description: `Auto-loaded ${csvData.length} records from Google Sheets`,
        });
        
      } catch (error) {
        console.error('Error loading initial Google Sheets data:', error);
        setShowManualUpload(true);
        
        toast({
          title: "Auto-load failed",
          description: "Couldn't load default data. Please upload manually or try again.",
          variant: "destructive",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

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

  const lastUpdated = useMemo(() => {
    if (data.length === 0) return null;
    const maxDate = Math.max(...data.map(row => new Date(row.day).getTime()));
    return new Date(maxDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [data]);

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
