import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CountrySpendData } from '@/types/demographicData';
import { COUNTRY_SPEND_SHEETS_URL } from '@/constants/dataConstants';

interface BatchLoadingProgress {
  stage: 'fetching' | 'parsing' | 'processing' | 'complete';
  progress: number;
  recordsLoaded: number;
  totalRecords: number;
}

interface CachedData {
  data: string;
  timestamp: number;
  url: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const CACHE_KEY = 'country_spend_data_cache';

export const useCountrySpendDataLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<BatchLoadingProgress>({
    stage: 'fetching',
    progress: 0,
    recordsLoaded: 0,
    totalRecords: 0
  });

  const { toast } = useToast();

  // Cache management
  const getCachedData = (): CachedData | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedData = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  };

  const setCachedData = (data: string, url: string): void => {
    try {
      const cached: CachedData = {
        data,
        timestamp: Date.now(),
        url
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      // Ignore storage errors
    }
  };

  // Parse CSV data to CountrySpendData
  const parseCountrySpendData = (csvText: string): CountrySpendData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Country spend CSV file appears to be empty or invalid');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: CountrySpendData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

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

      // Convert spend to number
      obj.spend = obj.spend ? parseFloat(obj.spend.toString().replace(/[^0-9.-]/g, '')) || 0 : 0;

      // Only add rows that have country and spend data
      if (obj.country && obj.country.trim() && obj.spend > 0) {
        data.push({
          day: obj.day || '',
          country: obj.country.trim(),
          spend: obj.spend
        });
      }
    }

    return data;
  };

  const loadCountrySpendData = useCallback(async (): Promise<CountrySpendData[]> => {
    if (isLoading) return [];

    setIsLoading(true);
    
    try {
      console.log('Loading country spend data...');
      
      setLoadingProgress({
        stage: 'fetching',
        progress: 10,
        recordsLoaded: 0,
        totalRecords: 0
      });

      const response = await fetch(COUNTRY_SPEND_SHEETS_URL, { 
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      setLoadingProgress(prev => ({
        ...prev,
        stage: 'parsing',
        progress: 50
      }));
      
      const data = parseCountrySpendData(csvText);
      
      setLoadingProgress({
        stage: 'complete',
        progress: 100,
        recordsLoaded: data.length,
        totalRecords: data.length
      });
      
      // Cache successful result
      setCachedData(csvText, COUNTRY_SPEND_SHEETS_URL);
      
      return data;
    } catch (error) {
      console.error('Error loading country spend data:', error);
      
      // Try to use cached data as fallback
      const cached = getCachedData();
      if (cached) {
        console.log('Using cached country spend data as fallback...');
        const data = parseCountrySpendData(cached.data);
        return data;
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return {
    isLoading,
    loadingProgress,
    loadCountrySpendData
  };
};