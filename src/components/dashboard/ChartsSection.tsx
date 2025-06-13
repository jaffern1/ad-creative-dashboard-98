
import React from 'react';
import { ActiveAdsChart } from './ActiveAdsChart';
import { NewAdsChart } from './NewAdsChart';
import { AdData } from '@/pages/Dashboard';

interface ChartsSectionProps {
  filteredData: AdData[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ filteredData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ActiveAdsChart data={filteredData} />
      <NewAdsChart data={filteredData} />
    </div>
  );
};
