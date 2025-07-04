
import React, { useState, useEffect } from 'react';
import { FilterState } from '@/pages/Dashboard';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FixedFilterBarProps {
  filters: FilterState;
  isVisible: boolean;
}

export const FixedFilterBar: React.FC<FixedFilterBarProps> = ({
  filters,
  isVisible
}) => {
  const getDateRangeDisplay = () => {
    if (!filters.startDate || !filters.endDate) return 'No date range';
    
    const start = format(filters.startDate, 'MMM dd');
    const end = format(filters.endDate, 'MMM dd');
    
    if (start === end) {
      return start;
    }
    
    return `${start} - ${end}`;
  };

  const getFilterCounts = () => {
    const counts: { [key: string]: number } = {};
    
    if (filters.country) {
      const countries = Array.isArray(filters.country) ? filters.country : [filters.country];
      counts.countries = countries.filter(c => c).length;
    }
    
    if (filters.objective) {
      const objectives = Array.isArray(filters.objective) ? filters.objective : [filters.objective];
      counts.objectives = objectives.filter(o => o).length;
    }
    
    if (filters.shoot) {
      const shoots = Array.isArray(filters.shoot) ? filters.shoot : [filters.shoot];
      counts.shoots = shoots.filter(s => s).length;
    }
    
    return counts;
  };

  const counts = getFilterCounts();

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <Card className="bg-card/50 border-border/30">
          <div className="px-4 py-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Filters:</span>
                <Badge variant="outline" className="text-xs">
                  {getDateRangeDisplay()}
                </Badge>
              </div>
              
              {counts.countries > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {counts.countries} {counts.countries === 1 ? 'Country' : 'Countries'}
                </Badge>
              )}
              
              {counts.objectives > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {counts.objectives} {counts.objectives === 1 ? 'Objective' : 'Objectives'}
                </Badge>
              )}
              
              {counts.shoots > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {counts.shoots} {counts.shoots === 1 ? 'Shoot' : 'Shoots'}
                </Badge>
              )}
              
              {counts.countries === 0 && counts.objectives === 0 && counts.shoots === 0 && (
                <span className="text-muted-foreground text-xs">No additional filters applied</span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
