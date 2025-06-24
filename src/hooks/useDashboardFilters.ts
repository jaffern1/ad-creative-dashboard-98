
import { useState } from 'react';
import { FilterState } from '@/pages/Dashboard';

export const useDashboardFilters = () => {
  // Set default date range to last 3 days
  const getDefaultDateRange = () => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 2); // Last 3 days (today + 2 previous days)
    startDate.setHours(0, 0, 0, 0);
    
    return { startDate, endDate };
  };

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...getDefaultDateRange(),
    country: '',
    objective: '',
    shoot: '',
  }));

  return {
    filters,
    setFilters
  };
};
