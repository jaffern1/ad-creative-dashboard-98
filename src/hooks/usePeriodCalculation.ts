
import { useMemo } from 'react';
import { AdData } from '@/pages/Dashboard';

interface PeriodData {
  currentPeriodData: AdData[];
  previousPeriodData: AdData[];
}

interface Filters {
  startDate?: Date;
  endDate?: Date;
  country: string | string[];
  objective: string | string[];
  shoot: string | string[];
}

export const usePeriodCalculation = (data: AdData[], filters: Filters): PeriodData => {
  return useMemo(() => {
    if (!filters.startDate || !filters.endDate) {
      return { currentPeriodData: data, previousPeriodData: [] };
    }

    // Calculate previous period
    const normalize = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const startDate = normalize(filters.startDate);
    const endDate = normalize(filters.endDate);
    
    const ONE_DAY_MS = 1000 * 60 * 60 * 24;
    const currentPeriodLength = Math.round((endDate.getTime() - startDate.getTime()) / ONE_DAY_MS) + 1;
    
    const previousEndDate = new Date(startDate.getTime() - ONE_DAY_MS);
    const previousStartDate = new Date(previousEndDate.getTime() - (currentPeriodLength - 1) * ONE_DAY_MS);


    console.log('Period calculation:', {
      currentStart: filters.startDate,
      currentEnd: filters.endDate,
      currentLength: currentPeriodLength,
      previousStart: previousStartDate,
      previousEnd: previousEndDate
    });

    const applyFilters = (row: AdData) => {
      if (filters.country) {
        const selectedCountries = Array.isArray(filters.country) ? filters.country : [filters.country];
        if (selectedCountries.length > 0 && !selectedCountries.includes(row.country)) return false;
      }
      
      if (filters.objective) {
        const selectedObjectives = Array.isArray(filters.objective) ? filters.objective : [filters.objective];
        if (selectedObjectives.length > 0 && !selectedObjectives.includes(row.Objective)) return false;
      }
      
      if (filters.shoot) {
        const selectedShoots = Array.isArray(filters.shoot) ? filters.shoot : [filters.shoot];
        if (selectedShoots.length > 0 && !selectedShoots.includes(row.shoot)) return false;
      }
      
      return true;
    };

    // Filter data for current period
    const currentData = data.filter(row => {
      const rowDate = new Date(row.day);
      if (rowDate < filters.startDate! || rowDate > filters.endDate!) return false;
      return applyFilters(row);
    });

    // Filter data for previous period
    const previousData = data.filter(row => {
      const rowDate = new Date(row.day);
      if (rowDate < previousStartDate || rowDate > previousEndDate) return false;
      return applyFilters(row);
    });

    return { currentPeriodData: currentData, previousPeriodData: previousData };
  }, [data, filters]);
};
