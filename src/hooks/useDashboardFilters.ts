
import { useState, useEffect } from 'react';
import { FilterState } from '@/pages/Dashboard';
import { useUrlFilters } from './useUrlFilters';

export const useDashboardFilters = () => {
  const { getFiltersFromUrl, updateUrlWithFilters } = useUrlFilters();
  
  // Set default date range to last 3 days
  const getDefaultDateRange = () => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 2); // Last 3 days (today + 2 previous days)
    startDate.setHours(0, 0, 0, 0);
    
    return { startDate, endDate };
  };

  // Initialize with URL filters or defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlFilters = getFiltersFromUrl();
    const defaultRange = getDefaultDateRange();
    
    // If URL has filters, use them, otherwise use defaults
    if (Object.keys(urlFilters).length > 0) {
      return {
        startDate: urlFilters.startDate || defaultRange.startDate,
        endDate: urlFilters.endDate || defaultRange.endDate,
        country: urlFilters.country || '',
        objective: urlFilters.objective || '',
        shoot: urlFilters.shoot || '',
      };
    }
    
    return {
      ...defaultRange,
      country: '',
      objective: '',
      shoot: '',
    };
  });

  // Update URL when filters change
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  };

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const urlFilters = getFiltersFromUrl();
      const defaultRange = getDefaultDateRange();
      
      if (Object.keys(urlFilters).length > 0) {
        setFilters({
          startDate: urlFilters.startDate || defaultRange.startDate,
          endDate: urlFilters.endDate || defaultRange.endDate,
          country: urlFilters.country || '',
          objective: urlFilters.objective || '',
          shoot: urlFilters.shoot || '',
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getFiltersFromUrl]);

  return {
    filters,
    setFilters: handleFiltersChange
  };
};
