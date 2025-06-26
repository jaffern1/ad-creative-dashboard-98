
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterState } from '@/pages/Dashboard';
import { DateRange } from 'react-day-picker';

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

  // Helper function to check if current date range matches a preset
  const getActivePreset = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return null;

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Check for "Today"
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    if (filters.startDate.getTime() === todayStart.getTime() && 
        filters.endDate.getTime() === todayEnd.getTime()) {
      return 'today';
    }

    // Check for "Yesterday"
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    if (filters.startDate.getTime() === yesterdayStart.getTime() && 
        filters.endDate.getTime() === yesterdayEnd.getTime()) {
      return 'yesterday';
    }

    // Check for "Last 3 days"
    const last3Start = new Date();
    last3Start.setDate(today.getDate() - 2);
    last3Start.setHours(0, 0, 0, 0);
    const last3End = new Date(today);
    last3End.setHours(23, 59, 59, 999);

    if (filters.startDate.getTime() === last3Start.getTime() && 
        filters.endDate.getTime() === last3End.getTime()) {
      return 'last3';
    }

    // Check for "Last 7 days"
    const last7Start = new Date();
    last7Start.setDate(today.getDate() - 6);
    last7Start.setHours(0, 0, 0, 0);
    const last7End = new Date(today);
    last7End.setHours(23, 59, 59, 999);

    if (filters.startDate.getTime() === last7Start.getTime() && 
        filters.endDate.getTime() === last7End.getTime()) {
      return 'last7';
    }

    // Check for "Last 30 days"
    const last30Start = new Date();
    last30Start.setDate(today.getDate() - 29);
    last30Start.setHours(0, 0, 0, 0);
    const last30End = new Date(today);
    last30End.setHours(23, 59, 59, 999);

    if (filters.startDate.getTime() === last30Start.getTime() && 
        filters.endDate.getTime() === last30End.getTime()) {
      return 'last30';
    }

    return null;
  }, [filters.startDate, filters.endDate]);

  // Convert filters to DateRange format for the calendar
  const dateRange: DateRange | undefined = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return undefined;
    return {
      from: filters.startDate,
      to: filters.endDate
    };
  }, [filters.startDate, filters.endDate]);

  // Handle date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range) {
      // Reset selection
      onFiltersChange({
        ...filters,
        startDate: undefined,
        endDate: undefined,
      });
      return;
    }

    if (range.from && range.to) {
      // Both dates selected - set proper times
      const startDate = new Date(range.from);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(range.to);
      endDate.setHours(23, 59, 59, 999);
      
      onFiltersChange({
        ...filters,
        startDate,
        endDate,
      });
    } else if (range.from) {
      // Only start date selected
      const startDate = new Date(range.from);
      startDate.setHours(0, 0, 0, 0);
      
      onFiltersChange({
        ...filters,
        startDate,
        endDate: undefined,
      });
    }
  };

  // Format display text for the button
  const getDisplayText = () => {
    if (!filters.startDate && !filters.endDate) {
      return "Select date range";
    }
    if (filters.startDate && !filters.endDate) {
      return `${format(filters.startDate, "MMM dd")} - ...`;
    }
    if (filters.startDate && filters.endDate) {
      return `${format(filters.startDate, "MMM dd")} - ${format(filters.endDate, "MMM dd")}`;
    }
    return "Select date range";
  };

  return (
    <div className="space-y-4">
      {/* Single Date Range Picker */}
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-start text-left font-normal border-primary/20",
                (!filters.startDate || !filters.endDate) && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {getDisplayText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={1}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Quick Date Buttons - All 5 on one line */}
      <div className="grid grid-cols-5 gap-1">
        <Button
          variant={getActivePreset === 'today' ? "default" : "outline"}
          size="sm"
          onClick={setToday}
          className={cn(
            "text-xs px-1",
            getActivePreset === 'today' 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "border-primary/20 hover:bg-primary/10"
          )}
        >
          Today
        </Button>
        <Button
          variant={getActivePreset === 'yesterday' ? "default" : "outline"}
          size="sm"
          onClick={setYesterday}
          className={cn(
            "text-xs px-1",
            getActivePreset === 'yesterday' 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "border-primary/20 hover:bg-primary/10"
          )}
        >
          Yesterday
        </Button>
        <Button
          variant={getActivePreset === 'last3' ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange(2)}
          className={cn(
            "text-xs px-1",
            getActivePreset === 'last3' 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "border-primary/20 hover:bg-primary/10"
          )}
        >
          Last 3 days
        </Button>
        <Button
          variant={getActivePreset === 'last7' ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange(6)}
          className={cn(
            "text-xs px-1",
            getActivePreset === 'last7' 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "border-primary/20 hover:bg-primary/10"
          )}
        >
          Last 7 days
        </Button>
        <Button
          variant={getActivePreset === 'last30' ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange(29)}
          className={cn(
            "text-xs px-1",
            getActivePreset === 'last30' 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "border-primary/20 hover:bg-primary/10"
          )}
        >
          Last 30 days
        </Button>
      </div>
    </div>
  );
};
