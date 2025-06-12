
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterState } from '@/pages/Dashboard';

interface DateRangeFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  filters,
  onFiltersChange,
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

  return (
    <div className="md:col-span-2 space-y-3">
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
  );
};
