
import React, { useState, useEffect } from 'react';
import { FilterState } from '@/pages/Dashboard';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { DateRangeFilter } from './filters/DateRangeFilter';
import { CountryFilter } from './filters/CountryFilter';
import { ObjectiveFilter } from './filters/ObjectiveFilter';
import { ShootFilter } from './filters/ShootFilter';
import { FilterActions } from './filters/FilterActions';
import { ViewActions } from './filters/ViewActions';
import { useUrlFilters } from '@/hooks/useUrlFilters';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

interface FixedFilterBarProps {
  filters: FilterState;
  isVisible: boolean;
  onFiltersChange: (filters: FilterState) => void;
  countries: FilterOption[];
  objectives: FilterOption[];
  shoots: FilterOption[];
}

export const FixedFilterBar: React.FC<FixedFilterBarProps> = ({
  filters,
  isVisible,
  onFiltersChange,
  countries,
  objectives,
  shoots
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { generateShareableUrl } = useUrlFilters();

  const getDateRangeDisplay = () => {
    if (!filters.startDate || !filters.endDate) return 'No date range';
    
    const start = format(filters.startDate, 'MMM dd');
    const end = format(filters.endDate, 'MMM dd');
    
    if (start === end) {
      return start;
    }
    
    return `${start} - ${end}`;
  };

  const getSelectedCountries = () => {
    if (!filters.country) return [];
    return Array.isArray(filters.country) ? filters.country : [filters.country];
  };

  const getSelectedObjectives = () => {
    if (!filters.objective) return [];
    return Array.isArray(filters.objective) ? filters.objective : [filters.objective];
  };

  const getSelectedShoots = () => {
    if (!filters.shoot) return [];
    return Array.isArray(filters.shoot) ? filters.shoot : [filters.shoot];
  };

  const hasFilters = getSelectedCountries().length > 0 || 
                   getSelectedObjectives().length > 0 || 
                   getSelectedShoots().length > 0;

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-full relative">
        {/* Collapsed state - only toggle button visible */}
        {isCollapsed ? (
          <div className="absolute left-0 top-0 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(false)}
              className="px-2 py-2 h-auto bg-card/80 border border-border/30 rounded-r-md rounded-l-none shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Expanded state - full filter bar */
          <div className="px-6 py-3">
            <Card className="bg-card/50 border-border/30">
              <div className="flex items-center">
                {/* Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(true)}
                  className="px-2 py-1 h-auto mr-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Filter Content */}
                <div className="px-2 py-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {/* Date Range */}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Date:</span>
                      <Badge variant="outline" className="text-xs">
                        {getDateRangeDisplay()}
                      </Badge>
                    </div>

                    {/* Countries */}
                    {getSelectedCountries().length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Countries:</span>
                        <div className="flex flex-wrap gap-1">
                          {getSelectedCountries().map((country) => (
                            <Badge key={country} variant="secondary" className="text-xs">
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Objectives */}
                    {getSelectedObjectives().length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Objectives:</span>
                        <div className="flex flex-wrap gap-1">
                          {getSelectedObjectives().map((objective) => (
                            <Badge key={objective} variant="secondary" className="text-xs">
                              {objective}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shoots */}
                    {getSelectedShoots().length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Shoots:</span>
                        <div className="flex flex-wrap gap-1">
                          {getSelectedShoots().map((shoot) => (
                            <Badge key={shoot} variant="secondary" className="text-xs">
                              {shoot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No additional filters message */}
                    {!hasFilters && (
                      <span className="text-muted-foreground text-xs ml-2">No additional filters applied</span>
                    )}
                  </div>
                </div>

                {/* Filter Settings Button */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="w-full h-auto max-h-[80vh] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filter Settings</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Date Range and Actions */}
                        <div className="space-y-3">
                          <DateRangeFilter
                            filters={filters}
                            onFiltersChange={onFiltersChange}
                          />
                          <div className="flex justify-between items-center">
                            <FilterActions onFiltersChange={onFiltersChange} />
                            <ViewActions 
                              filters={filters}
                              generateShareableUrl={generateShareableUrl}
                            />
                          </div>
                        </div>

                        {/* Right Column - Other Filters */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <CountryFilter
                              filters={filters}
                              onFiltersChange={onFiltersChange}
                              countries={countries}
                            />

                            <ObjectiveFilter
                              filters={filters}
                              onFiltersChange={onFiltersChange}
                              objectives={objectives}
                            />

                            <ShootFilter
                              filters={filters}
                              onFiltersChange={onFiltersChange}
                              shoots={shoots}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
