
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterState } from '@/pages/Dashboard';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

interface ShootFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  shoots: FilterOption[];
}

export const ShootFilter: React.FC<ShootFilterProps> = ({
  filters,
  onFiltersChange,
  shoots,
}) => {
  const handleShootChange = (shoot: string, checked: boolean) => {
    const currentShoots = Array.isArray(filters.shoot) 
      ? filters.shoot 
      : filters.shoot ? [filters.shoot] : [];
    
    let newShoots;
    if (checked) {
      newShoots = [...currentShoots, shoot];
    } else {
      newShoots = currentShoots.filter(s => s !== shoot);
    }
    
    onFiltersChange({
      ...filters,
      shoot: newShoots.length > 0 ? newShoots : '',
    });
  };

  const getSelectedShoots = () => {
    if (Array.isArray(filters.shoot)) {
      return filters.shoot;
    }
    return filters.shoot ? [filters.shoot] : [];
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">Shoot</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal border-primary/20"
          >
            {getSelectedShoots().length === 0 
              ? "All shoots"
              : `${getSelectedShoots().length} selected`
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium">Select Shoots</div>
            {shoots.map((shoot) => (
              <div key={shoot.value} className="flex items-center space-x-2">
                <Checkbox
                  id={shoot.value}
                  checked={getSelectedShoots().includes(shoot.value)}
                  onCheckedChange={(checked) => handleShootChange(shoot.value, checked as boolean)}
                />
                <Label 
                  htmlFor={shoot.value}
                  className="text-sm font-normal cursor-pointer flex-1 flex justify-between items-center"
                >
                  <span>{shoot.label}</span>
                  <span className="text-muted-foreground ml-2">£{Math.round(shoot.spend / 1000)}K</span>
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
