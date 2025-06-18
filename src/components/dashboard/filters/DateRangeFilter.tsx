import React from 'react';
import { Button } from '@/components/ui/button';
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
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    onFiltersChange({
      ...filters,
      startDate,
      endDate,
    });
  };

  const setToday = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    
    onFiltersChange({
      ...filters,
      startDate,
      endDate,
    });
  };

  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startDate = new Date(yesterday);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(yesterday);
    endDate.setHours(23, 59, 59, 999);
    
    onFiltersChange({
      ...filters,
      startDate,
      endDate,
    });
  };

  return (
    <div className="space-y-4">
      {/* Date Pickers */}
      <div className="grid grid-cols-2 gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "justify-start text-left font-normal border-primary/20",
                !filters.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {filters.startDate ? format(filters.startDate, "MMM dd") : "Start"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.startDate}
              onSelect={(date) => {
                if (date) {
                  date.setHours(0, 0, 0, 0);
                }
                onFiltersChange({ ...filters, startDate: date });
              }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "justify-start text-left font-normal border-primary/20",
                !filters.endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {filters.endDate ? format(filters.endDate, "MMM dd") : "End"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.endDate}
              onSelect={(date) => {
                if (date) {
                  date.setHours(23, 59, 59, 999);
                }
                onFiltersChange({ ...filters, endDate: date });
              }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Quick Date Buttons - All 5 on one line */}
      <div className="grid grid-cols-5 gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={setToday}
          className="text-xs border-primary/20 hover:bg-primary/10 px-1"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={setYesterday}
          className="text-xs border-primary/20 hover:bg-primary/10 px-1"
        >
          Yesterday
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDateRange(2)}
          className="text-xs border-primary/20 hover:bg-primary/10 px-1"
        >
          Last 3 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDateRange(6)}
          className="text-xs border-primary/20 hover:bg-primary/10 px-1"
        >
          Last 7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDateRange(29)}
          className="text-xs border-primary/20 hover:bg-primary/10 px-1"
        >
          Last 30 days
        </Button>
      </div>
    </div>
  );
};
