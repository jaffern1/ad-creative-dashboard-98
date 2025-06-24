
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpendTableHeaderProps {
  groupBy: 'shoot' | 'ad_name';
  onGroupByChange: (value: 'shoot' | 'ad_name') => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: string) => void;
}

export const SpendTableHeader: React.FC<SpendTableHeaderProps> = ({
  groupBy,
  onGroupByChange,
  itemsPerPage,
  onItemsPerPageChange
}) => {
  return (
    <CardHeader className="bg-muted border-b border-border py-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          {groupBy === 'shoot' ? 'Top Shoots by Spend' : 'Top Ads by Spend'}
        </CardTitle>
        <div className="flex gap-2 items-center">
          <div className="flex gap-2">
            <Button
              variant={groupBy === 'shoot' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGroupByChange('shoot')}
              className="text-xs border-primary/20 hover:bg-primary/10"
            >
              Shoot
            </Button>
            <Button
              variant={groupBy === 'ad_name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGroupByChange('ad_name')}
              className="text-xs border-primary/20 hover:bg-primary/10"
            >
              Ad Name
            </Button>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={itemsPerPage === 0 ? 'all' : itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};
