
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FilterState } from '@/pages/Dashboard';
import { DateRangeFilter } from './filters/DateRangeFilter';
import { CountryFilter } from './filters/CountryFilter';
import { ObjectiveFilter } from './filters/ObjectiveFilter';
import { ShootFilter } from './filters/ShootFilter';
import { FilterActions } from './filters/FilterActions';

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
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Row 1: Date Range (spans 2 cols), Country, Actions */}
          <DateRangeFilter
            filters={filters}
            onFiltersChange={onFiltersChange}
          />

          <CountryFilter
            filters={filters}
            onFiltersChange={onFiltersChange}
            countries={countries}
          />

          <FilterActions
            onFiltersChange={onFiltersChange}
          />

          {/* Row 2: Empty, Empty, Objectives, Shoot */}
          <div className="md:col-span-2"></div>

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
      </CardContent>
    </Card>
  );
};
