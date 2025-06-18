
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
        <div className="space-y-6">
          {/* Date Range Filter - Full width */}
          <DateRangeFilter
            filters={filters}
            onFiltersChange={onFiltersChange}
          />

          {/* Bottom row: Country, Objectives, Shoot, Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            <FilterActions
              onFiltersChange={onFiltersChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
