
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterState } from '@/pages/Dashboard';

interface FilterActionsProps {
  onFiltersChange: (filters: FilterState) => void;
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  onFiltersChange
}) => {
  const getDefaultDateRange = () => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 2); // Last 3 days
    startDate.setHours(0, 0, 0, 0);
    
    return { startDate, endDate };
  };

  const handleClear = () => {
    const defaultRange = getDefaultDateRange();
    onFiltersChange({
      ...defaultRange,
      country: '',
      objective: '',
      shoot: '',
      season: ''
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleClear} 
      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
    >
      Clear
    </Button>
  );
};
