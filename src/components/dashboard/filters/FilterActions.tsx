
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterState } from '@/pages/Dashboard';

interface FilterActionsProps {
  onFiltersChange: (filters: FilterState) => void;
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  onFiltersChange,
}) => {
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={() => onFiltersChange({ country: '', objective: '', shoot: '' })}
        className="w-full border-primary/20 hover:bg-primary/10"
      >
        Clear Filters
      </Button>
    </div>
  );
};
