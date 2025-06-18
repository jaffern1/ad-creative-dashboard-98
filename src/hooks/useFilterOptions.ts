
import { useMemo } from 'react';
import { AdData, FilterState } from '@/pages/Dashboard';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

export const useFilterOptions = (dateFilteredData: AdData[], currentFilters: FilterState) => {
  // Helper function to apply filters except the one being calculated
  const getFilteredDataExcluding = (excludeFilter: 'country' | 'objective' | 'shoot') => {
    return dateFilteredData.filter(row => {
      // Apply all filters except the excluded one
      if (excludeFilter !== 'country' && currentFilters.country) {
        const selectedCountries = Array.isArray(currentFilters.country) 
          ? currentFilters.country 
          : [currentFilters.country];
        if (selectedCountries.length > 0 && !selectedCountries.includes(row.country)) return false;
      }
      
      if (excludeFilter !== 'objective' && currentFilters.objective) {
        const allowedObjectives = ['Prospecting', 'Remarketing', 'Testing', 'Brand'];
        if (!allowedObjectives.includes(row.Objective)) return false;
        
        const selectedObjectives = Array.isArray(currentFilters.objective) 
          ? currentFilters.objective 
          : [currentFilters.objective];
        if (selectedObjectives.length > 0 && !selectedObjectives.includes(row.Objective)) return false;
      }
      
      if (excludeFilter !== 'shoot' && currentFilters.shoot) {
        const validShoots = row.shoot && 
          row.shoot.trim() !== '' && 
          !row.shoot.startsWith('http') && 
          !row.shoot.includes('drive.google.com');
        if (!validShoots) return false;
        
        const selectedShoots = Array.isArray(currentFilters.shoot) 
          ? currentFilters.shoot 
          : [currentFilters.shoot];
        if (selectedShoots.length > 0 && !selectedShoots.includes(row.shoot)) return false;
      }
      
      return true;
    });
  };

  // Calculate spend by country (excluding country filter to show available options)
  const countries = useMemo(() => {
    const filteredData = getFilteredDataExcluding('country');
    const countrySpend = filteredData.reduce((acc, row) => {
      if (row.country) {
        acc[row.country] = (acc[row.country] || 0) + row.spend;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countrySpend)
      .filter(([, spend]) => spend > 0)
      .sort(([,a], [,b]) => b - a)
      .map(([country, spend]) => ({
        value: country,
        label: country,
        spend
      }));
  }, [dateFilteredData, currentFilters.objective, currentFilters.shoot]);

  // Calculate spend by objective (excluding objective filter to show available options)
  const objectives = useMemo(() => {
    const filteredData = getFilteredDataExcluding('objective');
    const allowedObjectives = ['Prospecting', 'Remarketing', 'Testing', 'Brand'];
    const objectiveSpend = filteredData.reduce((acc, row) => {
      if (row.Objective && allowedObjectives.includes(row.Objective)) {
        acc[row.Objective] = (acc[row.Objective] || 0) + row.spend;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(objectiveSpend)
      .filter(([, spend]) => spend > 0)
      .sort(([,a], [,b]) => b - a)
      .map(([objective, spend]) => ({
        value: objective,
        label: objective,
        spend
      }));
  }, [dateFilteredData, currentFilters.country, currentFilters.shoot]);

  // Calculate spend by shoot (excluding shoot filter to show available options)
  const shoots = useMemo(() => {
    const filteredData = getFilteredDataExcluding('shoot');
    const validShoots = filteredData.filter(row => 
      row.shoot && 
      row.shoot.trim() !== '' && 
      !row.shoot.startsWith('http') && 
      !row.shoot.includes('drive.google.com')
    );

    const shootSpend = validShoots.reduce((acc, row) => {
      acc[row.shoot] = (acc[row.shoot] || 0) + row.spend;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(shootSpend)
      .filter(([, spend]) => spend > 0)
      .sort(([,a], [,b]) => b - a)
      .map(([shoot, spend]) => ({
        value: shoot,
        label: shoot,
        spend
      }));
  }, [dateFilteredData, currentFilters.country, currentFilters.objective]);

  return {
    countries,
    objectives,
    shoots
  };
};
