import React, { useState, useEffect } from 'react';
import { CountrySpendChart } from './charts/CountrySpendChart';
import { AgeSpendChart } from './charts/AgeSpendChart';
import { GenderSpendChart } from './charts/GenderSpendChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCountrySpendDataLoading } from '@/hooks/useCountrySpendDataLoading';
import { useAgeGenderSpendDataLoading } from '@/hooks/useAgeGenderSpendDataLoading';
import { CountrySpendData, AgeGenderSpendData } from '@/types/demographicData';
import { FilterState } from '@/pages/Dashboard';

interface DemographicsSectionProps {
  filters: FilterState;
}

const DemographicsSkeleton = () => (
  <Card className="shadow-sm border border-border bg-card">
    <CardHeader className="bg-muted border-b border-border py-3 px-4">
      <CardTitle className="text-base font-medium flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="h-[300px] flex items-center justify-center">
        <div className="space-y-4 w-full">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <div className="flex justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({ filters }) => {
  const [countryData, setCountryData] = useState<CountrySpendData[]>([]);
  const [ageGenderData, setAgeGenderData] = useState<AgeGenderSpendData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const { isLoading: isCountryLoading, loadCountrySpendData } = useCountrySpendDataLoading();
  const { isLoading: isAgeGenderLoading, loadAgeGenderSpendData } = useAgeGenderSpendDataLoading();

  // Load demographic data on mount
  useEffect(() => {
    const loadDemographicData = async () => {
      try {
        console.log('Loading demographic data...');
        
        const [countryResult, ageGenderResult] = await Promise.all([
          loadCountrySpendData(),
          loadAgeGenderSpendData()
        ]);

        setCountryData(countryResult);
        setAgeGenderData(ageGenderResult);
        setIsInitialized(true);
        
        console.log('Demographic data loaded:', {
          countries: countryResult.length,
          ageGender: ageGenderResult.length
        });
      } catch (error) {
        console.error('Failed to load demographic data:', error);
        setIsInitialized(true); // Still mark as initialized to show error states
      }
    };

    if (!isInitialized && !isCountryLoading && !isAgeGenderLoading) {
      loadDemographicData();
    }
  }, [isInitialized, isCountryLoading, isAgeGenderLoading, loadCountrySpendData, loadAgeGenderSpendData]);

  if (!isInitialized || isCountryLoading || isAgeGenderLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-foreground">
            Demographics Analysis
          </h2>
          <p className="text-muted-foreground mt-2">Ad spend breakdown by audience demographics</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DemographicsSkeleton />
          <DemographicsSkeleton />
          <DemographicsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-medium text-foreground">
          Demographics Analysis
        </h2>
        <p className="text-muted-foreground mt-2">Ad spend breakdown by audience demographics</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CountrySpendChart data={countryData} filters={filters} />
        <AgeSpendChart data={ageGenderData} filters={filters} />
        <GenderSpendChart data={ageGenderData} filters={filters} />
      </div>
    </div>
  );
};