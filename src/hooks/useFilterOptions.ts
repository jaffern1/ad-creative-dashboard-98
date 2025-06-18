
import { useMemo } from 'react';
import { AdData, FilterState } from '@/pages/Dashboard';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

export const useFilterOptions = (dateFilteredData: AdData[], currentFilters: FilterState) => {
  // Helper function to get filtered data for a specific filter type
  const getFilteredDataForType = (excludeFilter: keyof FilterState) => {
    return dateFilteredData.filter(row => {
      // Apply all filters except the one we're calculating options for
      
      // Country filter
      if (excludeFilter !== 'country' && currentFilters.country) {
        const selectedCountries = Array.isArray(currentFilters.country) 
          ? currentFilters.country 
          : [currentFilters.country];
        if (selectedCountries.length > 0 && !selectedCountries.includes(row.country)) return false;
      }
      
      // Objective filter
      if (excludeFilter !== 'objective' && currentFilters.objective) {
        const selectedObjectives = Array.isArray(currentFilters.objective) 
          ? currentFilters.objective 
          : [currentFilters.objective];
        if (selectedObjectives.length > 0 && !selectedObjectives.includes(row.Objective)) return false;
      }
      
      // Shoot filter
      if (excludeFilter !== 'shoot' && currentFilters.shoot) {
        const selectedShoots = Array.isArray(currentFilters.shoot) 
          ? currentFilters.shoot 
          : [currentFilters.shoot];
        if (selectedShoots.length > 0 && !selectedShoots.includes(row.shoot)) return false;
      }
      
      return true;
    });
  };

  // Calculate spend by country and sort by spend descending
  const countries = useMemo(() => {
    const filteredData = getFilteredDataForType('country');
    const countrySpend = filteredData.reduce((acc, row) => {
      if (row.country) {
        acc[row.country] = (acc[row.country] || 0) + row.spend;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countrySpend)
      .filter(([, spend]) => spend > 0) // Filter out countries with zero spend
      .sort(([,a], [,b]) => b - a)
      .map(([country, spend]) => ({
        value: country,
        label: country,
        spend
      }));
  }, [dateFilteredData, currentFilters.objective, currentFilters.shoot]);

  // Calculate spend by objective and sort by spend descending
  const objectives = useMemo(() => {
    const filteredData = getFilteredDataForType('objective');
    const allowedObjectives = ['Prospecting', 'Remarketing', 'Testing', 'Brand'];
    const objectiveSpend = filteredData.reduce((acc, row) => {
      if (row.Objective && allowedObjectives.includes(row.Objective)) {
        acc[row.Objective] = (acc[row.Objective] || 0) + row.spend;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(objectiveSpend)
      .filter(([, spend]) => spend > 0) // Filter out objectives with zero spend
      .sort(([,a], [,b]) => b - a)
      .map(([objective, spend]) => ({
        value: objective,
        label: objective,
        spend
      }));
  }, [dateFilteredData, currentFilters.country, currentFilters.shoot]);

  // Calculate spend by shoot and sort by spend descending
  const shoots = useMemo(() => {
    const filteredData = getFilteredDataForType('shoot');
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
      .filter(([, spend]) => spend > 0) // Filter out shoots with zero spend
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
