
import { useMemo } from 'react';
import { AdData } from '@/pages/Dashboard';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

export const useFilterOptions = (dateFilteredData: AdData[]) => {
  // Calculate spend by country and sort by spend descending
  const countries = useMemo(() => {
    const countrySpend = dateFilteredData.reduce((acc, row) => {
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
  }, [dateFilteredData]);

  // Calculate spend by objective and sort by spend descending
  const objectives = useMemo(() => {
    const allowedObjectives = ['Prospecting', 'Remarketing', 'Testing', 'Brand'];
    const objectiveSpend = dateFilteredData.reduce((acc, row) => {
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
  }, [dateFilteredData]);

  // Calculate spend by shoot and sort by spend descending
  const shoots = useMemo(() => {
    const validShoots = dateFilteredData.filter(row => 
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
  }, [dateFilteredData]);

  return {
    countries,
    objectives,
    shoots
  };
};
