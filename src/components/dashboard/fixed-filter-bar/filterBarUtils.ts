
import { format } from 'date-fns';
import { FilterState } from '@/pages/Dashboard';

export const getDateRangeDisplay = (filters: FilterState) => {
  if (!filters.startDate || !filters.endDate) return 'No date range';
  
  const start = format(filters.startDate, 'MMM dd');
  const end = format(filters.endDate, 'MMM dd');
  
  if (start === end) {
    return start;
  }
  
  return `${start} - ${end}`;
};

export const getSelectedCountries = (filters: FilterState) => {
  if (!filters.country) return [];
  return Array.isArray(filters.country) ? filters.country : [filters.country];
};

export const getSelectedObjectives = (filters: FilterState) => {
  if (!filters.objective) return [];
  return Array.isArray(filters.objective) ? filters.objective : [filters.objective];
};

export const getSelectedShoots = (filters: FilterState) => {
  if (!filters.shoot) return [];
  return Array.isArray(filters.shoot) ? filters.shoot : [filters.shoot];
};

export const hasActiveFilters = (filters: FilterState) => {
  return getSelectedCountries(filters).length > 0 || 
         getSelectedObjectives(filters).length > 0 || 
         getSelectedShoots(filters).length > 0;
};
