
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchGoogleSheetsData } from '@/utils/googleSheetsUtils';
import { parseCsvText } from '@/utils/csvParser';
import { AdData } from '@/pages/Dashboard';
import { DEFAULT_SHEETS_URL } from '@/constants/dataConstants';

export const useDataLoading = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();

  const loadGoogleSheetsData = async (): Promise<AdData[]> => {
    try {
      console.log('Loading initial data from Google Sheets...');
      const csvText = await fetchGoogleSheetsData(DEFAULT_SHEETS_URL);
      const csvData = parseCsvText(csvText);
      
      if (csvData.length === 0) {
        throw new Error('No valid data rows found in the sheet');
      }

      toast({
        title: "Data loaded successfully",
        description: `Auto-loaded ${csvData.length} records from Google Sheets`,
      });

      return csvData;
    } catch (error) {
      console.error('Error loading initial Google Sheets data:', error);
      
      toast({
        title: "Auto-load failed",
        description: "Couldn't load default data. Please upload manually or try again.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsInitialLoading(false);
    }
  };

  return {
    isInitialLoading,
    setIsInitialLoading,
    loadGoogleSheetsData
  };
};
