
import { useMemo } from 'react';
import { AdData } from '@/pages/Dashboard';

export interface SpendItem {
  itemName: string;
  percentage: number;
  change: number | null;
  currentSpend: number;
  previousSpend: number;
  daysSinceLaunch: number | null;
}

export const useSpendAggregation = (
  currentPeriodData: AdData[], 
  previousPeriodData: AdData[], 
  groupBy: 'shoot' | 'ad_name',
  allData: AdData[],
  isTestingInObjectives: boolean,
  objectives: string[]
): SpendItem[] => {
  // Memoize expensive aggregations
  const currentSpendByGroup = useMemo(() => {
    return currentPeriodData.reduce((acc, row) => {
      const groupKey = groupBy === 'shoot' ? (row.shoot || 'Unknown') : (row.ad_name || 'Unknown');
      if (!acc[groupKey]) {
        acc[groupKey] = 0;
      }
      acc[groupKey] += row.spend;
      return acc;
    }, {} as Record<string, number>);
  }, [currentPeriodData, groupBy]);

  const previousSpendByGroup = useMemo(() => {
    return previousPeriodData.reduce((acc, row) => {
      const groupKey = groupBy === 'shoot' ? (row.shoot || 'Unknown') : (row.ad_name || 'Unknown');
      if (!acc[groupKey]) {
        acc[groupKey] = 0;
      }
      acc[groupKey] += row.spend;
      return acc;
    }, {} as Record<string, number>);
  }, [previousPeriodData, groupBy]);

  return useMemo(() => {

    // Calculate total spend for percentage calculation
    const currentTotalSpend = Object.values(currentSpendByGroup).reduce((sum, spend) => sum + spend, 0);
    const previousTotalSpend = Object.values(previousSpendByGroup).reduce((sum, spend) => sum + spend, 0);

    // Helper function to calculate days since launch
    const calculateDaysSinceLaunch = (itemName: string): number | null => {
      // Filter data for the specific item
      const itemData = allData.filter(row => {
        const groupKey = groupBy === 'shoot' ? row.shoot : row.ad_name;
        return groupKey === itemName;
      });

      if (itemData.length === 0) return null;

      // Find the launch date based on objectives
      let launchDate: string | null = null;
      
      // Check if any of Prospecting, Remarketing, or Brand are selected
      const hasNonTestingObjectives = objectives.some(obj => 
        ['Prospecting', 'Remarketing', 'Brand'].includes(obj)
      );
      
      if (hasNonTestingObjectives) {
        // Use is_first_instance_non_test = 1
        const firstInstanceRow = itemData.find(row => row.is_first_instance_non_test === 1);
        launchDate = firstInstanceRow?.day || null;
      } else {
        // Use is_first_instance = 1 (when Testing is selected or nothing is selected)
        const firstInstanceRow = itemData.find(row => row.is_first_instance === 1);
        launchDate = firstInstanceRow?.day || null;
      }

      if (!launchDate) return null;

      // Calculate days difference - subtract 1 to fix the calculation
      const launch = new Date(launchDate);
      const today = new Date();
      const diffTime = today.getTime() - launch.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
      
      return Math.max(0, diffDays); // Ensure it's not negative
    };

    console.log('Spend aggregation:', {
      currentTotalSpend,
      previousTotalSpend,
      currentGroups: Object.keys(currentSpendByGroup).length,
      previousGroups: Object.keys(previousSpendByGroup).length,
      objectives,
      hasNonTestingObjectives: objectives.some(obj => ['Prospecting', 'Remarketing', 'Brand'].includes(obj))
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
        
        // Calculate absolute percentage point change
        let change: number | null = null;
        if (previousTotalSpend > 0) {
          change = currentPercentage - previousPercentage;
        } else if (currentPercentage > 0) {
          change = currentPercentage; // New item, show the full percentage as change
        }

        const daysSinceLaunch = calculateDaysSinceLaunch(itemName);

        return {
          itemName,
          percentage: currentPercentage,
          change,
          currentSpend,
          previousSpend,
          daysSinceLaunch
        } as SpendItem;
      })
      .filter(item => item.currentSpend > 0) // Only show items with current spend
      .sort((a, b) => b.percentage - a.percentage);
  }, [currentSpendByGroup, previousSpendByGroup, groupBy, allData, objectives]);
};
