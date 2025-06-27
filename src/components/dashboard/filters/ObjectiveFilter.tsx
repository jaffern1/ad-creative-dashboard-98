
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

interface ObjectiveFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  objectives: FilterOption[];
}

export const ObjectiveFilter: React.FC<ObjectiveFilterProps> = ({
  filters,
  onFiltersChange,
  objectives,
}) => {
  const handleObjectiveChange = (objective: string, checked: boolean) => {
    const currentObjectives = Array.isArray(filters.objective) 
      ? filters.objective 
      : filters.objective ? [filters.objective] : [];
    
    let newObjectives;
    if (checked) {
      newObjectives = [...currentObjectives, objective];
    } else {
      newObjectives = currentObjectives.filter(obj => obj !== objective);
    }
    
    onFiltersChange({
      ...filters,
      objective: newObjectives.length > 0 ? newObjectives : '',
    });
  };

  const getSelectedObjectives = () => {
    if (Array.isArray(filters.objective)) {
      return filters.objective;
    }
    return filters.objective ? [filters.objective] : [];
  };

  const getDisplayText = () => {
    const selected = getSelectedObjectives();
    if (selected.length === 0) {
      return "All objectives";
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
      <Label className="text-sm font-medium text-foreground min-w-[80px]">Objectives</Label>
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
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium">Select Objectives</div>
            {objectives.map((objective) => (
              <div key={objective.value} className="flex items-center space-x-2">
                <Checkbox
                  id={objective.value}
                  checked={getSelectedObjectives().includes(objective.value)}
                  onCheckedChange={(checked) => handleObjectiveChange(objective.value, checked as boolean)}
                />
                <Label 
                  htmlFor={objective.value}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {objective.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
