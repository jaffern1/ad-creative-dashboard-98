import React, { useState, useMemo, useEffect } from 'react';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { SpendTable } from '@/components/dashboard/SpendTable';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { MostRecentAds } from '@/components/dashboard/MostRecentAds';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { DataSourceSwitcher } from '@/components/dashboard/DataSourceSwitcher';
import { InitialLoadingState } from '@/components/dashboard/InitialLoadingState';
import { useDataFiltering } from '@/hooks/useDataFiltering';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useToast } from '@/hooks/use-toast';
import { fetchGoogleSheetsData } from '@/utils/googleSheetsUtils';
import { parseCsvText } from '@/utils/csvParser';

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

const DEFAULT_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmTUDR12i75AFLRf0Fp1XkTOrtyvLWbvC6uU7Us6nqUACQUjiWRO1f1WWceMEMXakQ3h_NJU0q9j6u/pub?gid=112874240&single=true&output=csv';

const Dashboard = () => {
  const [data, setData] = useState<AdData[]>([]);
  const [dataSource, setDataSource] = useState<'auto-sheets' | 'manual-csv' | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    country: '',
    objective: '',
    shoot: '',
  });
  const { toast } = useToast();

  // Auto-load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Loading initial data from Google Sheets...');
        const csvText = await fetchGoogleSheetsData(DEFAULT_SHEETS_URL);
        const csvData = parseCsvText(csvText);
        
        if (csvData.length === 0) {
          throw new Error('No valid data rows found in the sheet');
        }

        setData(csvData);
        setDataSource('auto-sheets');
        
        toast({
          title: "Data loaded successfully",
          description: `Auto-loaded ${csvData.length} records from Google Sheets`,
        });
        
      } catch (error) {
        console.error('Error loading initial Google Sheets data:', error);
        setShowManualUpload(true);
        
        toast({
          title: "Auto-load failed",
          description: "Couldn't load default data. Please upload manually or try again.",
          variant: "destructive",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  const handleDataUpload = (csvData: AdData[]) => {
    setData(csvData);
    setDataSource('manual-csv');
    setShowManualUpload(false);
    toast({
      title: "Data uploaded successfully",
      description: `Loaded ${csvData.length} records`,
    });
  };

  const handleSwitchToManual = () => {
    setShowManualUpload(true);
    setData([]);
    setDataSource(null);
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

  // Show initial loading state
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <DashboardHeader lastUpdated={null} />
          <InitialLoadingState />
        </div>
      </div>
    );
  }

  // Show manual upload state
  if (showManualUpload || (data.length === 0 && !isInitialLoading)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <DashboardHeader lastUpdated={lastUpdated} />
          <EmptyState onDataUpload={handleDataUpload} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader lastUpdated={lastUpdated} />

        <div className="space-y-6">
          {/* Data Source Switcher */}
          {dataSource && (
            <DataSourceSwitcher
              currentSource={dataSource}
              onSwitchToManual={handleSwitchToManual}
              recordCount={data.length}
            />
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
          
          {/* Category Performance using data that ignores Objective filter */}
          <CategoryBreakdown data={categoryData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
