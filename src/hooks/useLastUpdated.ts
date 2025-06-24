
import { useMemo } from 'react';
import { AdData } from '@/pages/Dashboard';

export const useLastUpdated = (data: AdData[]) => {
  const lastUpdated = useMemo(() => {
    if (data.length === 0) return null;
    const maxDate = Math.max(...data.map(row => new Date(row.day).getTime()));
    return new Date(maxDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [data]);

  return lastUpdated;
};
