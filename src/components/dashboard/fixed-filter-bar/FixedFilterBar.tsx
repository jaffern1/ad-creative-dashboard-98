
import React from 'react';
import { Card } from '@/components/ui/card';
import { FilterState } from '@/pages/Dashboard';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useFilterBarState } from './useFilterBarState';
import { FilterBarToggle } from './FilterBarToggle';
import { FilterBarContent } from './FilterBarContent';
import { FilterBarSheet } from './FilterBarSheet';
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
  seasons: FilterOption[];
}
export const FixedFilterBar: React.FC<FixedFilterBarProps> = ({
  filters,
  isVisible,
  onFiltersChange,
  countries,
  objectives,
  shoots,
  seasons
}) => {
  const {
    isCollapsed,
    setIsCollapsed,
    isSheetOpen,
    setIsSheetOpen
  } = useFilterBarState();
  const {
    generateShareableUrl
  } = useUrlFilters();
  if (!isVisible) return null;
  return <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-full relative">
        {isCollapsed ? <div className="absolute left-0 top-0 z-10">
            <FilterBarToggle isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
          </div> : <div className="px-6 py-3">
            <Card className="bg-card/50 border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <FilterBarToggle isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
                </div>

                <FilterBarContent filters={filters} />

                <div className="flex items-center">
                  <FilterBarSheet filters={filters} onFiltersChange={onFiltersChange} countries={countries} objectives={objectives} shoots={shoots} seasons={seasons} isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} generateShareableUrl={generateShareableUrl} />
                </div>
              </div>
            </Card>
          </div>}
      </div>
    </div>;
};
