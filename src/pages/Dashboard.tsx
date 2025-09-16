
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
  country: string;
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
  season: string | string[];
  groupBy?: 'shoot' | 'ad_name';
}

export type DataSource = 'supabase-db' | 'auto-sheets' | 'manual-csv';

const Dashboard = () => {
  const {
    data,
    dataSource,
    isInitialLoading,
    loadingProgress,
    showManualUpload,
    isLoadingMore,
    hasMoreData,
    lastUpdated,
    handleDataUpload,
    handleSwitchToManual
  } = useDashboardData();

  const { filters, setFilters } = useDashboardFilters();

  // Show loading state until first batch is ready
  if (isInitialLoading || (data.length === 0 && !showManualUpload)) {
    return (
      <DashboardLayout lastUpdated={null}>
        <LoadingProgress
          stage={loadingProgress.stage}
          progress={loadingProgress.progress}
          recordsProcessed={loadingProgress.recordsLoaded}
          totalRecords={loadingProgress.totalRecords}
          currentBatch={loadingProgress.currentBatch}
          totalBatches={loadingProgress.totalBatches}
          recordsLoaded={loadingProgress.recordsLoaded}
          retryAttempt={loadingProgress.retryAttempt || 0}
          maxRetries={loadingProgress.maxRetries || 3}
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
        dataSource={dataSource as DataSource}
        onSwitchToManual={handleSwitchToManual}
        isLoadingMore={isLoadingMore}
        hasMoreData={hasMoreData}
        recordsLoaded={data.length}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
