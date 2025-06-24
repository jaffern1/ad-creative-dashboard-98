
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { SpendItem } from '@/hooks/useSpendAggregation';

interface SpendTableBodyProps {
  data: SpendItem[];
  groupBy: 'shoot' | 'ad_name';
  selectedItem: string | null;
  onItemSelect: (itemName: string) => void;
  currentPage: number;
  itemsPerPage: number;
}

export const SpendTableBody: React.FC<SpendTableBodyProps> = ({
  data,
  groupBy,
  selectedItem,
  onItemSelect,
  currentPage,
  itemsPerPage
}) => {
  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatChange = (change: number | null) => {
    if (change === null) return '-';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const formatDaysSinceLaunch = (days: number | null) => {
    if (days === null) return '-';
    return `${days}d`;
  };

  const getChangeColor = (change: number | null) => {
    if (change === null) return 'text-muted-foreground';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number | null) => {
    if (change === null) return null;
    return change >= 0 ? (
      <TrendingUp className="w-3 h-3 text-green-600" />
    ) : (
      <TrendingDown className="w-3 h-3 text-red-600" />
    );
  };

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-card">
        <TableRow className="border-b border-border">
          <TableHead className="font-medium text-foreground text-sm">
            {groupBy === 'shoot' ? 'Shoot' : 'Ad Name'}
          </TableHead>
          <TableHead className="text-right font-medium text-foreground text-sm">Percentage</TableHead>
          <TableHead className="text-right font-medium text-foreground text-sm">Change</TableHead>
          <TableHead className="text-right font-medium text-foreground text-sm">Days since launch</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => {
          const actualIndex = (currentPage - 1) * (itemsPerPage || data.length) + index;
          return (
            <TableRow 
              key={item.itemName}
              className={`
                hover:bg-secondary/10 transition-colors cursor-pointer
                ${actualIndex < 3 ? 'bg-primary/5' : 'bg-card'}
                ${selectedItem === item.itemName ? 'bg-primary/20' : ''}
              `}
              onClick={() => onItemSelect(item.itemName)}
            >
              <TableCell className="font-medium py-2 px-4">
                <div className="flex items-center gap-2">
                  {actualIndex < 3 && (
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white
                      ${actualIndex === 0 ? 'bg-primary' : ''}
                      ${actualIndex === 1 ? 'bg-primary/80' : ''}
                      ${actualIndex === 2 ? 'bg-primary/60' : ''}
                    `}>
                      {actualIndex + 1}
                    </div>
                  )}
                  {actualIndex >= 3 && (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {actualIndex + 1}
                    </div>
                  )}
                  <span className={`text-sm ${actualIndex < 3 ? 'font-medium' : ''} text-foreground`}>{item.itemName}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono font-medium text-sm py-2 px-4">
                <span className="text-black">
                  {formatPercentage(item.percentage)}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono font-medium text-sm py-2 px-4">
                <div className="flex items-center justify-end gap-1">
                  {getChangeIcon(item.change)}
                  <span className={getChangeColor(item.change)}>
                    {formatChange(item.change)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono font-medium text-sm py-2 px-4">
                <span className="text-foreground">
                  {formatDaysSinceLaunch(item.daysSinceLaunch)}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No data available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
