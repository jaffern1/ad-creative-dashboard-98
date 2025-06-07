
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
import { useToast } from '@/hooks/use-toast';

export interface AdData {
  day: string;
  account_name: string;
  campaign_name: string;
  country: string;
  adset_name: string;
  old_ad_name: string;
  ad_name: string;
  spend: number;
  season: string;
  production_type: string;
  shoot: string;
  ad_unique: string;
  copy_hook: string;
  visual_hook: string;
}

export interface FilterState {
  startDate?: Date;
  endDate?: Date;
  country: string;
}

const Dashboard = () => {
  const [data, setData] = useState<AdData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    country: '',
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
      
      return true;
    });
  }, [data, filters]);

  const countries = useMemo(() => {
    return Array.from(new Set(data.map(row => row.country))).filter(Boolean);
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Ffern style */}
        <div className="px-6 py-8 border-b border-border/30">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/f14283ba-f6f3-4fa7-8ef8-f2953e8c3ac5.png" 
                alt="Ffern Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="flex-1 pt-1">
              <h1 className="text-2xl font-light text-foreground mb-1 tracking-tight">
                Ads Creative Dashboard
              </h1>
              <p className="text-muted-foreground text-sm font-light mb-2">
                Best performing ads at Ffern
              </p>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs font-light">Last updated: {lastUpdated}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {data.length === 0 ? (
            <Card className="border border-border/50 bg-card shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="p-8 bg-primary/5 rounded-full mb-8">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-light mb-3 text-foreground tracking-tight">Upload your data</h3>
                <p className="text-muted-foreground mb-8 text-center max-w-md font-light text-sm">
                  Upload a CSV file with your Meta Ads data to begin analyzing performance
                </p>
                <CSVUploader onDataLoad={handleDataUpload} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                countries={countries}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendTable data={filteredData} />
                <MostRecentAds data={filteredData} />
              </div>
              
              <NewAdsChart data={filteredData} />
              
              <CategoryBreakdown data={filteredData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
