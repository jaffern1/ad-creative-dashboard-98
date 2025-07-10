import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchGoogleSheetsData } from '@/utils/googleSheetsUtils';
import { AdData } from '@/pages/Dashboard';
import { DEFAULT_SHEETS_URL } from '@/constants/dataConstants';

export interface LoadingProgress {
  stage: 'fetching' | 'parsing' | 'processing';
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
}

export const useProgressiveDataLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    stage: 'fetching',
    progress: 0,
    recordsProcessed: 0,
    totalRecords: 0,
  });
  const { toast } = useToast();

  const parseCSVProgressively = useCallback(async (csvText: string): Promise<AdData[]> => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or invalid');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const totalLines = lines.length - 1; // Exclude header
    const data: AdData[] = [];
    const chunkSize = 100; // Process 100 rows at a time

    setLoadingProgress(prev => ({
      ...prev,
      stage: 'parsing',
      totalRecords: totalLines,
      recordsProcessed: 0,
    }));

    for (let i = 1; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, Math.min(i + chunkSize, lines.length));
      
      // Process chunk
      for (const line of chunk) {
        if (!line.trim()) continue;

        // Parse CSV line properly handling quoted values
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });

        // Convert fields
        obj.spend = parseFloat(obj.spend?.toString().replace(/[^0-9.-]/g, '')) || 0;
        obj.is_first_instance = parseInt(obj.is_first_instance) || 0;
        obj.is_first_instance_non_test = parseInt(obj.is_first_instance_non_test) || 0;

        // Only add rows that have an ad_name
        if (obj.ad_name && obj.ad_name.trim()) {
          data.push(obj as AdData);
        }
      }

      // Update progress
      const processed = Math.min(i + chunkSize - 1, totalLines);
      const progress = Math.round((processed / totalLines) * 100);
      
      setLoadingProgress(prev => ({
        ...prev,
        progress,
        recordsProcessed: processed,
      }));

      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return data;
  }, []);

  const loadGoogleSheetsData = useCallback(async (): Promise<AdData[]> => {
    try {
      setIsLoading(true);
      setLoadingProgress({
        stage: 'fetching',
        progress: 0,
        recordsProcessed: 0,
        totalRecords: 0,
      });

      console.log('Loading data from Google Sheets...');
      
      // Fetch data
      setLoadingProgress(prev => ({ ...prev, progress: 30 }));
      const csvText = await fetchGoogleSheetsData(DEFAULT_SHEETS_URL);
      
      setLoadingProgress(prev => ({ ...prev, progress: 50 }));
      
      // Parse progressively
      const csvData = await parseCSVProgressively(csvText);
      
      // Final processing
      setLoadingProgress(prev => ({
        ...prev,
        stage: 'processing',
        progress: 90,
      }));

      await new Promise(resolve => setTimeout(resolve, 200)); // Brief pause for final processing

      setLoadingProgress(prev => ({ ...prev, progress: 100 }));

      if (csvData.length === 0) {
        throw new Error('No valid data rows found in the sheet');
      }

      toast({
        title: "Data loaded successfully",
        description: `Loaded ${csvData.length.toLocaleString()} records from Google Sheets`,
      });

      return csvData;
    } catch (error) {
      console.error('Error loading Google Sheets data:', error);
      
      toast({
        title: "Auto-load failed",
        description: "Couldn't load default data. Please upload manually or try again.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [parseCSVProgressively, toast]);

  return {
    isLoading,
    loadingProgress,
    loadGoogleSheetsData,
  };
};