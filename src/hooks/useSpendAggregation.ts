
import { useMemo } from 'react';
import { AdData } from '@/pages/Dashboard';

export interface SpendItem {
  itemName: string;
  percentage: number;
  change: number | null;
  currentSpend: number;
  previousSpend: number;
}

export const useSpendAggregation = (
  currentPeriodData: AdData[], 
  previousPeriodData: AdData[], 
  groupBy: 'shoot' | 'ad_name'
): SpendItem[] => {
  return useMemo(() => {
    // Aggregate current period data
    const currentSpendByGroup = currentPeriodData.reduce((acc, row) => {
      const groupKey = groupBy === 'shoot' ? (row.shoot || 'Unknown') : (row.ad_name || 'Unknown');
      if (!acc[groupKey]) {
        acc[groupKey] = 0;
      }
      acc[groupKey] += row.spend;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate previous period data
    const previousSpendByGroup = previousPeriodData.reduce((acc, row) => {
      const groupKey = groupBy === 'shoot' ? (row.shoot || 'Unknown') : (row.ad_name || 'Unknown');
      if (!acc[groupKey]) {
        acc[groupKey] = 0;
      }
      acc[groupKey] += row.spend;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total spend for percentage calculation
    const currentTotalSpend = Object.values(currentSpendByGroup).reduce((sum, spend) => sum + spend, 0);
    const previousTotalSpend = Object.values(previousSpendByGroup).reduce((sum, spend) => sum + spend, 0);

    console.log('Spend aggregation:', {
      currentTotalSpend,
      previousTotalSpend,
      currentGroups: Object.keys(currentSpendByGroup).length,
      previousGroups: Object.keys(previousSpendByGroup).length
    });

    // Get all unique group names
    const allGroups = new Set([
      ...Object.keys(currentSpendByGroup),
      ...Object.keys(previousSpendByGroup)
    ]);

    return Array.from(allGroups)
      .map(itemName => {
        const currentSpend = currentSpendByGroup[itemName] || 0;
        const previousSpend = previousSpendByGroup[itemName] || 0;
        
        const currentPercentage = currentTotalSpend > 0 ? (currentSpend / currentTotalSpend) * 100 : 0;
        const previousPercentage = previousTotalSpend > 0 ? (previousSpend / previousTotalSpend) * 100 : 0;
        
        let change: number | null = null;
        if (previousPercentage > 0) {
          change = ((currentPercentage - previousPercentage) / previousPercentage) * 100;
        } else if (currentPercentage > 0) {
          change = 100; // New item, show +100%
        }

        return {
          itemName,
          percentage: currentPercentage,
          change,
          currentSpend,
          previousSpend
        } as SpendItem;
      })
      .filter(item => item.currentSpend > 0) // Only show items with current spend
      .sort((a, b) => b.percentage - a.percentage);
  }, [currentPeriodData, previousPeriodData, groupBy]);
};
