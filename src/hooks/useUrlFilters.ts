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
      // Parse the date string directly as YYYY-MM-DD to avoid timezone issues
      const [year, month, day] = startDateStr.split('-').map(Number);
      const startDate = new Date(year, month - 1, day); // month is 0-indexed
      startDate.setHours(0, 0, 0, 0);
      filters.startDate = startDate;
    }
    
    if (endDateStr) {
      // Parse the date string directly as YYYY-MM-DD to avoid timezone issues
      const [year, month, day] = endDateStr.split('-').map(Number);
      const endDate = new Date(year, month - 1, day); // month is 0-indexed
      endDate.setHours(23, 59, 59, 999);
      filters.endDate = endDate;
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
    const season = searchParams.get('season');
    if (season) {
      filters.season = season.includes(',') ? season.split(',') : season;
    }
    
    const groupBy = searchParams.get('groupBy');
    if (groupBy && (groupBy === 'shoot' || groupBy === 'ad_name')) {
      filters.groupBy = groupBy;
    }
    
    return filters;
  };

  const formatDateForUrl = (date: Date): string => {
    // Format date as YYYY-MM-DD in local timezone to avoid timezone shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updateUrlWithFilters = (filters: FilterState) => {
    const params = new URLSearchParams();
    
    // Add date range using local timezone formatting
    if (filters.startDate) {
      params.set('startDate', formatDateForUrl(filters.startDate));
    }
    if (filters.endDate) {
      params.set('endDate', formatDateForUrl(filters.endDate));
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
    
    if (filters.season) {
      const seasonValue = Array.isArray(filters.season) 
        ? filters.season.join(',') 
        : filters.season;
      if (seasonValue) {
        params.set('season', seasonValue);
      }
    }
    
    if (filters.groupBy) {
      params.set('groupBy', filters.groupBy);
    }
    
    setSearchParams(params);
  };

  const generateShareableUrl = (filters: FilterState): string => {
    const params = new URLSearchParams();
    
    if (filters.startDate) {
      params.set('startDate', formatDateForUrl(filters.startDate));
    }
    if (filters.endDate) {
      params.set('endDate', formatDateForUrl(filters.endDate));
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
    
    if (filters.season) {
      const seasonValue = Array.isArray(filters.season) 
        ? filters.season.join(',') 
        : filters.season;
      if (seasonValue) {
        params.set('season', seasonValue);
      }
    }
    
    if (filters.groupBy) {
      params.set('groupBy', filters.groupBy);
    }
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  return {
    getFiltersFromUrl,
    updateUrlWithFilters,
    generateShareableUrl
  };
};
