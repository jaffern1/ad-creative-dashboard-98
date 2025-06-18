
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterState } from '@/pages/Dashboard';

interface FilterActionsProps {
  onFiltersChange: (filters: FilterState) => void;
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  onFiltersChange
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => onFiltersChange({
        country: '',
        objective: '',
        shoot: ''
      })} 
      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
    >
      Clear
    </Button>
  );
};
