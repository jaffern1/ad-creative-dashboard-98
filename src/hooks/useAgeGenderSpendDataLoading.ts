import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AgeGenderSpendData } from '@/types/demographicData';
import { AGE_GENDER_SPEND_SHEETS_URL } from '@/constants/dataConstants';

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
const CACHE_KEY = 'age_gender_spend_data_cache';

export const useAgeGenderSpendDataLoading = () => {
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

  // Parse CSV data to AgeGenderSpendData
  const parseAgeGenderSpendData = (csvText: string): AgeGenderSpendData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Age gender spend CSV file appears to be empty or invalid');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: AgeGenderSpendData[] = [];
    
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

      // Only add rows that have age, gender and spend data
      if (obj.age && obj.age.trim() && obj.gender && obj.gender.trim() && obj.spend > 0) {
        data.push({
          day: obj.day || '',
          age: obj.age.trim(),
          gender: obj.gender.trim(),
          spend: obj.spend
        });
      }
    }

    return data;
  };

  const loadAgeGenderSpendData = useCallback(async (): Promise<AgeGenderSpendData[]> => {
    if (isLoading) return [];

    setIsLoading(true);
    
    try {
      console.log('Loading age/gender spend data...');
      
      setLoadingProgress({
        stage: 'fetching',
        progress: 10,
        recordsLoaded: 0,
        totalRecords: 0
      });

      const response = await fetch(AGE_GENDER_SPEND_SHEETS_URL, { 
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
      
      const data = parseAgeGenderSpendData(csvText);
      
      setLoadingProgress({
        stage: 'complete',
        progress: 100,
        recordsLoaded: data.length,
        totalRecords: data.length
      });
      
      // Cache successful result
      setCachedData(csvText, AGE_GENDER_SPEND_SHEETS_URL);
      
      return data;
    } catch (error) {
      console.error('Error loading age/gender spend data:', error);
      
      // Try to use cached data as fallback
      const cached = getCachedData();
      if (cached) {
        console.log('Using cached age/gender spend data as fallback...');
        const data = parseAgeGenderSpendData(cached.data);
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
    loadAgeGenderSpendData
  };
};