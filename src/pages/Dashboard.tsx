import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, BarChart3, Clock } from 'lucide-react';
import { CSVUploader } from '@/components/dashboard/CSVUploader';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { SpendTable } from '@/components/dashboard/SpendTable';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { MostRecentAds } from '@/components/dashboard/MostRecentAds';
import { NewAdsChart } from '@/components/dashboard/NewAdsChart';
import { ActiveAdsChart } from '@/components/dashboard/ActiveAdsChart';
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
  country: string;
  objective: string | string[];
  shoot: string;
}

const Dashboard = () => {
  const [data, setData] = useState<AdData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    country: '',
    objective: '',
    shoot: '',
  });
  const { toast } = useToast();

  const handleDataUpload = (csvData: AdData[]) => {
    setData(csvData);
    toast({
      title: "Data uploaded successfully",
      description: `Loaded ${csvData.length} records`,
    });
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Date filter
      if (filters.startDate || filters.endDate) {
        const rowDate = new Date(row.day);
        if (filters.startDate && rowDate < filters.startDate) return false;
        if (filters.endDate && rowDate > filters.endDate) return false;
      }
      
      // Country filter
      if (filters.country && row.country !== filters.country) return false;
      
      // Objective filter - support multiple selection
      if (filters.objective) {
        const selectedObjectives = Array.isArray(filters.objective) 
          ? filters.objective 
          : [filters.objective];
        if (selectedObjectives.length > 0 && !selectedObjectives.includes(row.Objective)) return false;
      }
      
      // Shoot filter
      if (filters.shoot && row.shoot !== filters.shoot) return false;
      
      return true;
    });
  }, [data, filters]);

  // Data for Category Performance that ignores Objective filter
  const categoryData = useMemo(() => {
    return data.filter(row => {
      // Date filter
      if (filters.startDate || filters.endDate) {
        const rowDate = new Date(row.day);
        if (filters.startDate && rowDate < filters.startDate) return false;
        if (filters.endDate && rowDate > filters.endDate) return false;
      }
      
      // Country filter
      if (filters.country && row.country !== filters.country) return false;
      
      // Shoot filter
      if (filters.shoot && row.shoot !== filters.shoot) return false;
      
      // NOTE: Objective filter is ignored for Category Performance
      
      return true;
    });
  }, [data, filters.startDate, filters.endDate, filters.country, filters.shoot]);

  const countries = useMemo(() => {
    return Array.from(new Set(data.map(row => row.country))).filter(Boolean);
  }, [data]);

  const objectives = useMemo(() => {
    const allowedObjectives = ['Prospecting', 'Remarketing', 'Testing', 'Brand'];
    const dataObjectives = Array.from(new Set(data.map(row => row.Objective))).filter(Boolean);
    return dataObjectives.filter(objective => allowedObjectives.includes(objective));
  }, [data]);

  const shoots = useMemo(() => {
    return Array.from(new Set(data.map(row => row.shoot))).filter(Boolean);
  }, [data]);

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
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <img 
              src="/lovable-uploads/f14283ba-f6f3-4fa7-8ef8-f2953e8c3ac5.png" 
              alt="Ffern Logo" 
              className="h-16 w-auto"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-medium text-foreground">
              Ffern Ads Creative Dashboard
            </h1>
            <p className="text-muted-foreground text-base">
              Best performing ads at Ffern
            </p>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Last updated: {lastUpdated}</span>
              </div>
            )}
          </div>
        </div>

        {data.length === 0 ? (
          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-6 bg-primary/10 rounded-full mb-6">
                <Upload className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-medium mb-3 text-foreground">Upload your data</h3>
              <p className="text-muted-foreground mb-8 text-center max-w-md">
                Upload a CSV file with your Meta Ads data
              </p>
              <CSVUploader onDataLoad={handleDataUpload} />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              countries={countries}
              objectives={objectives}
              shoots={shoots}
            />
            
            {/* Full width Top Ad Spend */}
            <SpendTable data={filteredData} />
            
            {/* Side by side: Most Recent Ads (left), Active Ads Chart (middle), and New Ads Chart (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MostRecentAds data={filteredData} />
              <ActiveAdsChart data={filteredData} />
              <NewAdsChart data={filteredData} />
            </div>
            
            {/* Category Performance using data that ignores Objective filter */}
            <CategoryBreakdown data={categoryData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
