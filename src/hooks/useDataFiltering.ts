
import { useMemo } from 'react';
import { AdData, FilterState } from '@/pages/Dashboard';

export const useDataFiltering = (data: AdData[], filters: FilterState) => {
  // Filter data based on date range only (for getting available filter options)
  const dateFilteredData = useMemo(() => {
    if (!filters.startDate && !filters.endDate) {
      return data;
    }

    return data.filter(row => {
      const rowDate = new Date(row.day);
      if (filters.startDate && rowDate < filters.startDate) return false;
      if (filters.endDate && rowDate > filters.endDate) return false;
      return true;
    });
  }, [data, filters.startDate, filters.endDate]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Date filter
      if (filters.startDate || filters.endDate) {
        const rowDate = new Date(row.day);
        if (filters.startDate && rowDate < filters.startDate) return false;
        if (filters.endDate && rowDate > filters.endDate) return false;
      }
      
      // Country filter - support multiple selection
      if (filters.country) {
        const selectedCountries = Array.isArray(filters.country) 
          ? filters.country 
          : [filters.country];
        if (selectedCountries.length > 0 && !selectedCountries.includes(row.country)) return false;
      }
      
      // Objective filter - support multiple selection
      if (filters.objective) {
        const selectedObjectives = Array.isArray(filters.objective) 
          ? filters.objective 
          : [filters.objective];
        if (selectedObjectives.length > 0 && !selectedObjectives.includes(row.Objective)) return false;
      }
      
      // Shoot filter - support multiple selection
      if (filters.shoot) {
        const selectedShoots = Array.isArray(filters.shoot) 
          ? filters.shoot 
          : [filters.shoot];
        if (selectedShoots.length > 0 && !selectedShoots.includes(row.shoot)) return false;
      }
      
      return true;
    });
  }, [data, filters]);

  return {
    dateFilteredData,
    filteredData
  };
};
