
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { InitialLoadingState } from '@/components/dashboard/InitialLoadingState';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { LoadingProgress } from '@/components/dashboard/LoadingProgress';
import { DashboardSkeleton } from '@/components/dashboard/skeleton/DashboardSkeleton';

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
  is_first_instance_non_test: number;
}

export interface FilterState {
  startDate?: Date;
  endDate?: Date;
  country: string | string[];
  objective: string | string[];
  shoot: string | string[];
  groupBy?: 'shoot' | 'ad_name';
}

const Dashboard = () => {
  const {
    data,
    dataSource,
    isInitialLoading,
    loadingProgress,
    showManualUpload,
    lastUpdated,
    handleDataUpload,
    handleSwitchToManual
  } = useDashboardData();

  const { filters, setFilters } = useDashboardFilters();

  // Show progressive loading state
  if (isInitialLoading) {
    // Show skeleton if we have some data or detailed progress if still loading
    if (data.length > 0 && loadingProgress.progress < 100) {
      return (
        <DashboardLayout lastUpdated={lastUpdated}>
          <DashboardSkeleton />
        </DashboardLayout>
      );
    }
    
    return (
      <DashboardLayout lastUpdated={null}>
        <LoadingProgress
          stage={loadingProgress.stage}
          progress={loadingProgress.progress}
          recordsProcessed={loadingProgress.recordsProcessed}
          totalRecords={loadingProgress.totalRecords}
        />
      </DashboardLayout>
    );
  }

  // Show manual upload state
  if (showManualUpload || (data.length === 0 && !isInitialLoading)) {
    return (
      <DashboardLayout lastUpdated={lastUpdated}>
        <EmptyState onDataUpload={handleDataUpload} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout lastUpdated={lastUpdated}>
      <DashboardContent
        data={data}
        filters={filters}
        onFiltersChange={setFilters}
        dataSource={dataSource}
        onSwitchToManual={handleSwitchToManual}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
