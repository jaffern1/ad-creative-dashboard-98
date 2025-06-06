
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, BarChart3 } from 'lucide-react';
import { CSVUploader } from '@/components/dashboard/CSVUploader';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { SpendTable } from '@/components/dashboard/SpendTable';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-light text-foreground tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Ffern Ads Creative Dashboard
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Best performing ads at Ffern
          </p>
        </div>

        {data.length === 0 ? (
          <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-lg">
                <Upload className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-blue-900 dark:text-blue-100">Upload your data</h3>
              <p className="text-muted-foreground mb-8 text-center max-w-md text-lg">
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
            
            <CategoryBreakdown data={filteredData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
