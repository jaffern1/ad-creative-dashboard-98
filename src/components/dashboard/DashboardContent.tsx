
import React from 'react';
import { FilterPanel } from './FilterPanel';
import { FixedFilterBar } from './fixed-filter-bar/FixedFilterBar';
import { SpendTable } from './SpendTable';
import { CategoryBreakdown } from './CategoryBreakdown';
import { MostRecentAds } from './MostRecentAds';
import { DataSourceSwitcher } from './DataSourceSwitcher';
import { SpendTableSkeleton } from './skeleton/SpendTableSkeleton';
import { CategoryBreakdownSkeleton } from './skeleton/CategoryBreakdownSkeleton';
import { MostRecentAdsSkeleton } from './skeleton/MostRecentAdsSkeleton';
import { useDataFiltering } from '@/hooks/useDataFiltering';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { useProgressiveLoading } from '@/hooks/useProgressiveLoading';
import { useAdSelection } from '@/hooks/useAdSelection';
import { AdData, FilterState } from '@/pages/Dashboard';

interface DashboardContentProps {
  data: AdData[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  dataSource: 'auto-sheets' | 'manual-csv' | null;
  onSwitchToManual: () => void;
  isLoadingMore?: boolean;
  hasMoreData?: boolean;
  recordsLoaded?: number;
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
  const { showSpendTable, showMostRecentAds, showCategoryBreakdown } = useProgressiveLoading(data.length > 0);
  const adSelection = useAdSelection();

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
        
        {/* Progressive loading: Show SpendTable first */}
        {showSpendTable ? (
          <SpendTable data={filteredData} allData={data} filters={filters} onFiltersChange={onFiltersChange} adSelection={adSelection} />
        ) : (
          <SpendTableSkeleton />
        )}
        
        {/* Progressive loading: Show MostRecentAds after delay */}
        {showMostRecentAds ? (
          <MostRecentAds data={filteredData} allData={data} adSelection={adSelection} />
        ) : (
          <MostRecentAdsSkeleton />
        )}
        
        {/* Progressive loading: Show CategoryBreakdown last */}
        {showCategoryBreakdown ? (
          <CategoryBreakdown data={filteredData} />
        ) : (
          <CategoryBreakdownSkeleton />
        )}
      </div>
    </>
  );
};
