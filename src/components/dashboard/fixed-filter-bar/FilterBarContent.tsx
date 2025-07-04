
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FilterState } from '@/pages/Dashboard';
import { 
  getDateRangeDisplay, 
  getSelectedCountries, 
  getSelectedObjectives, 
  getSelectedShoots, 
  hasActiveFilters 
} from './filterBarUtils';

interface FilterBarContentProps {
  filters: FilterState;
}

export const FilterBarContent: React.FC<FilterBarContentProps> = ({ filters }) => {
  const selectedCountries = getSelectedCountries(filters);
  const selectedObjectives = getSelectedObjectives(filters);
  const selectedShoots = getSelectedShoots(filters);
  const hasFilters = hasActiveFilters(filters);

  return (
    <div className="px-2 py-2 flex-1">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Date:</span>
          <Badge variant="outline" className="text-xs">
            {getDateRangeDisplay(filters)}
          </Badge>
        </div>

        {/* Countries */}
        {selectedCountries.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Countries:</span>
            <div className="flex flex-wrap gap-1">
              {selectedCountries.map((country) => (
                <Badge key={country} variant="secondary" className="text-xs">
                  {country}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Objectives */}
        {selectedObjectives.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Objectives:</span>
            <div className="flex flex-wrap gap-1">
              {selectedObjectives.map((objective) => (
                <Badge key={objective} variant="secondary" className="text-xs">
                  {objective}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Shoots */}
        {selectedShoots.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Shoots:</span>
            <div className="flex flex-wrap gap-1">
              {selectedShoots.map((shoot) => (
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
  );
};
