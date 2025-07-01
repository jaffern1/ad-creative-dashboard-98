
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterState } from '@/pages/Dashboard';
import { X } from 'lucide-react';

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

  const handleClearShoot = () => {
    onFiltersChange({
      ...filters,
      shoot: '',
    });
  };

  const getSelectedShoots = () => {
    if (Array.isArray(filters.shoot)) {
      return filters.shoot;
    }
    return filters.shoot ? [filters.shoot] : [];
  };

  const getDisplayText = () => {
    const selected = getSelectedShoots();
    if (selected.length === 0) {
      return "All shoots";
    }
    
    const text = `${selected.length} selected: ${selected.join(', ')}`;
    // Truncate if too long (approximately 60 characters)
    if (text.length > 60) {
      const truncated = text.substring(0, 57) + '...';
      return truncated;
    }
    return text;
  };

  return (
    <div className="flex items-center gap-4">
      <Label className="text-sm font-medium text-foreground min-w-[80px]">Shoot</Label>
      <div className="flex-1 flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-start text-left font-normal border-primary/20 truncate"
              title={getDisplayText()}
            >
              {getDisplayText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-4" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
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
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {shoot.label}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {getSelectedShoots().length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearShoot}
            className="px-2 py-1 h-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
