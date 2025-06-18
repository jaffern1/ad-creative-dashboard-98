
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FilterState } from '@/pages/Dashboard';
import { DateRangeFilter } from './filters/DateRangeFilter';
import { CountryFilter } from './filters/CountryFilter';
import { ObjectiveFilter } from './filters/ObjectiveFilter';
import { ShootFilter } from './filters/ShootFilter';
import { FilterActions } from './filters/FilterActions';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  countries: FilterOption[];
  objectives: FilterOption[];
  shoots: FilterOption[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  countries,
  objectives,
  shoots,
}) => {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Date Range */}
          <div>
            <DateRangeFilter
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
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

        {/* Clear button in bottom left */}
        <div className="mt-4">
          <FilterActions onFiltersChange={onFiltersChange} />
        </div>
      </CardContent>
    </Card>
  );
};
