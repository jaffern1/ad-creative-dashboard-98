
import { useMemo } from 'react';
import { AdData } from '@/pages/Dashboard';

export const useFilterOptions = (dateFilteredData: AdData[]) => {
  // Filter options based on date range
  const countries = useMemo(() => {
    return Array.from(new Set(dateFilteredData.map(row => row.country))).filter(Boolean);
  }, [dateFilteredData]);

  const objectives = useMemo(() => {
    const allowedObjectives = ['Prospecting', 'Remarketing', 'Testing', 'Brand'];
    const dataObjectives = Array.from(new Set(dateFilteredData.map(row => row.Objective))).filter(Boolean);
    return dataObjectives.filter(objective => allowedObjectives.includes(objective));
  }, [dateFilteredData]);

  const shoots = useMemo(() => {
    return Array.from(new Set(dateFilteredData.map(row => row.shoot))).filter(Boolean);
  }, [dateFilteredData]);

  return {
    countries,
    objectives,
    shoots
  };
};
