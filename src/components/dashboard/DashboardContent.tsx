
import React from 'react';
import { FilterPanel } from './FilterPanel';
import { FixedFilterBar } from './fixed-filter-bar/FixedFilterBar';
import { SpendTable } from './SpendTable';
import { CategoryBreakdown } from './CategoryBreakdown';
import { MostRecentAds } from './MostRecentAds';
import { DataSourceSwitcher } from './DataSourceSwitcher';
import { useDataFiltering } from '@/hooks/useDataFiltering';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { AdData, FilterState } from '@/pages/Dashboard';

interface DashboardContentProps {
  data: AdData[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  dataSource: 'auto-sheets' | 'manual-csv' | null;
  onSwitchToManual: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  data,
  filters,
  onFiltersChange,
  dataSource,
  onSwitchToManual
}) => {
  const { dateFilteredData, filteredData } = useDataFiltering(data, filters);
  const { countries, objectives, shoots } = useFilterOptions(dateFilteredData, filters, onFiltersChange);
  const [filterPanelRef, isFilterPanelVisible] = useScrollVisibility<HTMLDivElement>();

  return (
    <>
      {/* Fixed Filter Bar - only visible when main filter panel is out of view */}
      <FixedFilterBar 
        filters={filters} 
        isVisible={!isFilterPanelVisible} 
        onFiltersChange={onFiltersChange}
        countries={countries}
        objectives={objectives}
        shoots={shoots}
      />
      
      <div className="space-y-6">
        {/* Data Source Switcher */}
        {dataSource && (
          <DataSourceSwitcher
            currentSource={dataSource}
            onSwitchToManual={onSwitchToManual}
            recordCount={data.length}
          />
        )}
        
        <div ref={filterPanelRef}>
          <FilterPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            countries={countries}
            objectives={objectives}
            shoots={shoots}
          />
        </div>
        
        {/* Full width Top Ad Spend */}
        <SpendTable data={data} filters={filters} />
        
        {/* Most Recent Ads (full width) */}
        <MostRecentAds data={filteredData} />
        
        {/* Category Performance using filtered data */}
        <CategoryBreakdown data={filteredData} />
      </div>
    </>
  );
};
