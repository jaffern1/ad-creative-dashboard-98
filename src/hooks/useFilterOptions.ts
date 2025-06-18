
import { useMemo } from 'react';
import { AdData, FilterState } from '@/pages/Dashboard';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

export const useFilterOptions = (dateFilteredData: AdData[], filters: FilterState) => {
  // Get data that matches current filters (excluding the filter we're calculating options for)
  const getFilteredDataExcluding = (excludeFilter: 'country' | 'objective' | 'shoot') => {
    return dateFilteredData.filter(row => {
      // Apply all filters except the one we're excluding
      if (excludeFilter !== 'country' && filters.country) {
        const selectedCountries = Array.isArray(filters.country) 
          ? filters.country 
          : [filters.country];
        if (selectedCountries.length > 0 && !selectedCountries.includes(row.country)) return false;
      }
      
      if (excludeFilter !== 'objective' && filters.objective) {
        const selectedObjectives = Array.isArray(filters.objective) 
          ? filters.objective 
          : [filters.objective];
        if (selectedObjectives.length > 0 && !selectedObjectives.includes(row.Objective)) return false;
      }
      
      if (excludeFilter !== 'shoot' && filters.shoot) {
        const selectedShoots = Array.isArray(filters.shoot) 
          ? filters.shoot 
          : [filters.shoot];
        if (selectedShoots.length > 0 && !selectedShoots.includes(row.shoot)) return false;
      }
      
      return true;
    });
  };

  // Calculate spend by country and sort by spend descending
  const countries = useMemo(() => {
    const filteredData = getFilteredDataExcluding('country');
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
  }, [dateFilteredData, filters.objective, filters.shoot]);

  // Calculate spend by objective and sort by spend descending
  const objectives = useMemo(() => {
    const allowedObjectives = ['Prospecting', 'Remarketing', 'Testing', 'Brand'];
    const filteredData = getFilteredDataExcluding('objective');
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
  }, [dateFilteredData, filters.country, filters.shoot]);

  // Calculate spend by shoot and sort by spend descending
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
      .filter(([, spend]) => spend > 0) // Filter out shoots with zero spend
      .sort(([,a], [,b]) => b - a)
      .map(([shoot, spend]) => ({
        value: shoot,
        label: shoot,
        spend
      }));
  }, [dateFilteredData, filters.country, filters.objective]);

  return {
    countries,
    objectives,
    shoots
  };
};
