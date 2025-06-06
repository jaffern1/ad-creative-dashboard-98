
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-light text-foreground tracking-tight">
            Meta Ads Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Analyze ad performance and spending patterns
          </p>
        </div>

        {data.length === 0 ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Upload your data</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Upload a CSV file with your Meta Ads data to get started with the analysis
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
