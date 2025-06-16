import React, { useState, useMemo } from 'react';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { SpendTable } from '@/components/dashboard/SpendTable';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { MostRecentAds } from '@/components/dashboard/MostRecentAds';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { useDataFiltering } from '@/hooks/useDataFiltering';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useToast } from '@/hooks/use-toast';

export interface AdData {
  day: string;
  account_name: string;
  campaign_name: string;
  country: string;
  adset_name: string;
  old_ad_name: string;
  ad_name: string;
  file_link: string;
  spend: number;
  season: string;
  production_type: string;
  shoot: string;
  ad_unique: string;
  copy_hook: string;
  visual_hook: string;
  Objective: string;
  is_first_instance: number;
}

export interface FilterState {
  startDate?: Date;
  endDate?: Date;
  country: string | string[];
  objective: string | string[];
  shoot: string | string[];
}

const Dashboard = () => {
  const [data, setData] = useState<AdData[]>([]);
  const [dataSource, setDataSource] = useState<'csv' | 'sheets' | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    country: '',
    objective: '',
    shoot: '',
  });
  const { toast } = useToast();

  const handleDataUpload = (csvData: AdData[]) => {
    setData(csvData);
    setDataSource('csv');
    toast({
      title: "Data uploaded successfully",
      description: `Loaded ${csvData.length} records`,
    });
  };

  const { dateFilteredData, filteredData, categoryData } = useDataFiltering(data, filters);
  const { countries, objectives, shoots } = useFilterOptions(dateFilteredData);

  const lastUpdated = useMemo(() => {
    if (data.length === 0) return null;
    const maxDate = Math.max(...data.map(row => new Date(row.day).getTime()));
    return new Date(maxDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [data]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader lastUpdated={lastUpdated} />

        {data.length === 0 ? (
          <EmptyState onDataUpload={handleDataUpload} />
        ) : (
          <div className="space-y-6">
            {/* Data source indicator */}
            {dataSource && (
              <div className="text-sm text-muted-foreground">
                Data source: {dataSource === 'csv' ? 'CSV Upload' : 'Google Sheets'}
              </div>
            )}
            
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              countries={countries}
              objectives={objectives}
              shoots={shoots}
            />
            
            {/* Full width Top Ad Spend */}
            <SpendTable data={filteredData} />
            
            {/* Most Recent Ads (full width) */}
            <MostRecentAds data={filteredData} />
            
            {/* Side by side: Active Ads Chart and New Ads Chart */}
            <ChartsSection filteredData={filteredData} />
            
            {/* Category Performance using data that ignores Objective filter */}
            <CategoryBreakdown data={categoryData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
