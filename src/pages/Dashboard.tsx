
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, BarChart3 } from 'lucide-react';
import { CSVUploader } from '@/components/dashboard/CSVUploader';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { SpendTable } from '@/components/dashboard/SpendTable';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { MostRecentAds } from '@/components/dashboard/MostRecentAds';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100 dark:from-stone-900 dark:via-neutral-900 dark:to-stone-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
              <img 
                src="/lovable-uploads/f14283ba-f6f3-4fa7-8ef8-f2953e8c3ac5.png" 
                alt="Ffern Logo" 
                className="h-12 w-auto"
              />
            </div>
          </div>
          <h1 className="text-4xl font-light text-stone-800 dark:text-stone-200 tracking-tight">
            Ffern Ads Creative Dashboard
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-lg max-w-2xl mx-auto">
            Best performing ads at Ffern
          </p>
        </div>

        {data.length === 0 ? (
          <Card className="border-2 border-dashed border-stone-300 dark:border-stone-700 bg-gradient-to-br from-stone-50 to-neutral-50 dark:from-stone-950/20 dark:to-neutral-950/20 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-6 bg-stone-200 dark:bg-stone-700 rounded-full mb-6 shadow-lg">
                <Upload className="h-12 w-12 text-stone-600 dark:text-stone-300" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-stone-800 dark:text-stone-200">Upload your data</h3>
              <p className="text-stone-600 dark:text-stone-400 mb-8 text-center max-w-md text-lg">
                Upload a CSV file with your Meta Ads data
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
            
            <SpendTable data={filteredData} />
            
            <MostRecentAds data={filteredData} />
            
            <CategoryBreakdown data={filteredData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
