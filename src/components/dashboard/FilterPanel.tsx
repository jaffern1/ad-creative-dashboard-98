
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterState } from '@/pages/Dashboard';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  countries: string[];
  objectives: string[];
  shoots: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  countries,
  objectives,
  shoots,
}) => {
  const setDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    onFiltersChange({
      ...filters,
      startDate,
      endDate,
    });
  };

  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    onFiltersChange({
      ...filters,
      startDate: yesterday,
      endDate: yesterday,
    });
  };

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

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Date Range</Label>
            <div className="flex gap-2 mb-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={setYesterday}
                className="text-xs border-primary/20 hover:bg-primary/10"
              >
                Yesterday
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange(3)}
                className="text-xs border-primary/20 hover:bg-primary/10"
              >
                Last 3 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange(7)}
                className="text-xs border-primary/20 hover:bg-primary/10"
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange(30)}
                className="text-xs border-primary/20 hover:bg-primary/10"
              >
                Last 30 days
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal border-primary/20",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => onFiltersChange({ ...filters, startDate: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal border-primary/20",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => onFiltersChange({ ...filters, endDate: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Country Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Country</Label>
            <Select
              value={filters.country || "all"}
              onValueChange={(value) => onFiltersChange({ ...filters, country: value === "all" ? "" : value })}
            >
              <SelectTrigger className="border-primary/20">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Actions</Label>
            <Button
              variant="outline"
              onClick={() => onFiltersChange({ country: '', objective: '', shoot: '' })}
              className="w-full border-primary/20 hover:bg-primary/10"
            >
              Clear Filters
            </Button>
          </div>

          {/* Shoot Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Shoot</Label>
            <Select
              value={filters.shoot || "all"}
              onValueChange={(value) => onFiltersChange({ ...filters, shoot: value === "all" ? "" : value })}
            >
              <SelectTrigger className="border-primary/20">
                <SelectValue placeholder="All shoots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All shoots</SelectItem>
                {shoots.map((shoot) => (
                  <SelectItem key={shoot} value={shoot}>
                    {shoot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Objective Filter - Multiple Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Objectives</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-primary/20"
                >
                  {getSelectedObjectives().length === 0 
                    ? "All objectives"
                    : `${getSelectedObjectives().length} selected`
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Select Objectives</div>
                  {objectives.map((objective) => (
                    <div key={objective} className="flex items-center space-x-2">
                      <Checkbox
                        id={objective}
                        checked={getSelectedObjectives().includes(objective)}
                        onCheckedChange={(checked) => handleObjectiveChange(objective, checked as boolean)}
                      />
                      <Label 
                        htmlFor={objective}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {objective}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
