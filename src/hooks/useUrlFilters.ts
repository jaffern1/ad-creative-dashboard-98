
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterState } from '@/pages/Dashboard';

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getFiltersFromUrl = (): Partial<FilterState> => {
    const filters: Partial<FilterState> = {};
    
    // Parse date range
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    
    if (startDateStr) {
      const startDate = new Date(startDateStr);
      if (!isNaN(startDate.getTime())) {
        startDate.setHours(0, 0, 0, 0);
        filters.startDate = startDate;
      }
    }
    
    if (endDateStr) {
      const endDate = new Date(endDateStr);
      if (!isNaN(endDate.getTime())) {
        endDate.setHours(23, 59, 59, 999);
        filters.endDate = endDate;
      }
    }
    
    // Parse other filters
    const country = searchParams.get('country');
    if (country) {
      filters.country = country.includes(',') ? country.split(',') : country;
    }
    
    const objective = searchParams.get('objective');
    if (objective) {
      filters.objective = objective.includes(',') ? objective.split(',') : objective;
    }
    
    const shoot = searchParams.get('shoot');
    if (shoot) {
      filters.shoot = shoot.includes(',') ? shoot.split(',') : shoot;
    }
    
    return filters;
  };

  const updateUrlWithFilters = (filters: FilterState) => {
    const params = new URLSearchParams();
    
    // Add date range
    if (filters.startDate) {
      params.set('startDate', filters.startDate.toISOString().split('T')[0]);
    }
    if (filters.endDate) {
      params.set('endDate', filters.endDate.toISOString().split('T')[0]);
    }
    
    // Add other filters
    if (filters.country) {
      const countryValue = Array.isArray(filters.country) 
        ? filters.country.join(',') 
        : filters.country;
      if (countryValue) {
        params.set('country', countryValue);
      }
    }
    
    if (filters.objective) {
      const objectiveValue = Array.isArray(filters.objective) 
        ? filters.objective.join(',') 
        : filters.objective;
      if (objectiveValue) {
        params.set('objective', objectiveValue);
      }
    }
    
    if (filters.shoot) {
      const shootValue = Array.isArray(filters.shoot) 
        ? filters.shoot.join(',') 
        : filters.shoot;
      if (shootValue) {
        params.set('shoot', shootValue);
      }
    }
    
    setSearchParams(params);
  };

  const generateShareableUrl = (filters: FilterState): string => {
    const params = new URLSearchParams();
    
    if (filters.startDate) {
      params.set('startDate', filters.startDate.toISOString().split('T')[0]);
    }
    if (filters.endDate) {
      params.set('endDate', filters.endDate.toISOString().split('T')[0]);
    }
    
    if (filters.country) {
      const countryValue = Array.isArray(filters.country) 
        ? filters.country.join(',') 
        : filters.country;
      if (countryValue) {
        params.set('country', countryValue);
      }
    }
    
    if (filters.objective) {
      const objectiveValue = Array.isArray(filters.objective) 
        ? filters.objective.join(',') 
        : filters.objective;
      if (objectiveValue) {
        params.set('objective', objectiveValue);
      }
    }
    
    if (filters.shoot) {
      const shootValue = Array.isArray(filters.shoot) 
        ? filters.shoot.join(',') 
        : filters.shoot;
      if (shootValue) {
        params.set('shoot', shootValue);
      }
    }
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  return {
    getFiltersFromUrl,
    updateUrlWithFilters,
    generateShareableUrl
  };
};
