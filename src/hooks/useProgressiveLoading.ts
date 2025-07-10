import { useState, useEffect } from 'react';

interface ProgressiveLoadingState {
  showSpendTable: boolean;
  showMostRecentAds: boolean;
  showCategoryBreakdown: boolean;
}

export const useProgressiveLoading = (hasData: boolean) => {
  const [loadingState, setLoadingState] = useState<ProgressiveLoadingState>({
    showSpendTable: false,
    showMostRecentAds: false,
    showCategoryBreakdown: false,
  });

  useEffect(() => {
    if (!hasData) {
      // Reset loading state when no data
      setLoadingState({
        showSpendTable: false,
        showMostRecentAds: false,
        showCategoryBreakdown: false,
      });
      return;
    }

    // Progressive loading sequence when data is available
    const sequence = [
      { key: 'showSpendTable', delay: 0 },
      { key: 'showMostRecentAds', delay: 150 },
      { key: 'showCategoryBreakdown', delay: 300 },
    ] as const;

    const timeouts: NodeJS.Timeout[] = [];

    sequence.forEach(({ key, delay }) => {
      const timeout = setTimeout(() => {
        setLoadingState(prev => ({ ...prev, [key]: true }));
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [hasData]);

  return loadingState;
};