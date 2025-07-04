
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings } from 'lucide-react';
import { DateRangeFilter } from '../filters/DateRangeFilter';
import { CountryFilter } from '../filters/CountryFilter';
import { ObjectiveFilter } from '../filters/ObjectiveFilter';
import { ShootFilter } from '../filters/ShootFilter';
import { FilterActions } from '../filters/FilterActions';
import { ViewActions } from '../filters/ViewActions';
import { FilterState } from '@/pages/Dashboard';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

interface FilterBarSheetProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  countries: FilterOption[];
  objectives: FilterOption[];
  shoots: FilterOption[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  generateShareableUrl: (filters: FilterState) => string;
}

export const FilterBarSheet: React.FC<FilterBarSheetProps> = ({
  filters,
  onFiltersChange,
  countries,
  objectives,
  shoots,
  isOpen,
  onOpenChange,
  generateShareableUrl,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
  );
};
