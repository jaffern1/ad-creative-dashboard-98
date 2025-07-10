
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdData } from '@/pages/Dashboard';
import { usePeriodCalculation } from '@/hooks/usePeriodCalculation';
import { useSpendAggregation } from '@/hooks/useSpendAggregation';
import { usePagination } from '@/hooks/usePagination';
import { useAdSelection } from '@/hooks/useAdSelection';
import { SpendTableHeader } from './spend-table/SpendTableHeader';
import { SpendTableBody } from './spend-table/SpendTableBody';
import { AdCreativeViewer } from './spend-table/AdCreativeViewer';
import { SpendTablePagination } from './spend-table/SpendTablePagination';

interface SpendTableProps {
  data: AdData[];
  filters: {
    startDate?: Date;
    endDate?: Date;
    country: string | string[];
    objective: string | string[];
    shoot: string | string[];
    groupBy?: 'shoot' | 'ad_name';
  };
  onFiltersChange: (filters: any) => void;
  adSelection: ReturnType<typeof useAdSelection>;
}

export const SpendTable: React.FC<SpendTableProps> = ({ data, filters, onFiltersChange, adSelection }) => {
  const groupBy = filters.groupBy || 'shoot';
  
  const handleGroupByChange = (newGroupBy: 'shoot' | 'ad_name') => {
    onFiltersChange({ ...filters, groupBy: newGroupBy });
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const { currentPeriodData, previousPeriodData } = usePeriodCalculation(data, filters);
  
  // Check if Testing is in the objectives filter
  const isTestingInObjectives = useMemo(() => {
    if (!filters.objective) return false;
    const objectives = Array.isArray(filters.objective) ? filters.objective : [filters.objective];
    return objectives.includes('Testing');
  }, [filters.objective]);

  // Get all selected objectives
  const selectedObjectives = useMemo(() => {
    if (!filters.objective) return [];
    return Array.isArray(filters.objective) ? filters.objective : [filters.objective];
  }, [filters.objective]);

  const aggregatedData = useSpendAggregation(currentPeriodData, previousPeriodData, groupBy, data, isTestingInObjectives, selectedObjectives);
  const { paginatedData, totalPages, visiblePages } = usePagination(aggregatedData, currentPage, itemsPerPage);

  // Handle item selection based on groupBy
  const handleItemSelect = (itemName: string) => {
    if (groupBy === 'ad_name') {
      adSelection.selectByAdName(itemName, currentPeriodData);
    } else {
      adSelection.selectByShoot(itemName, currentPeriodData);
    }
  };

  // Get selected item based on groupBy
  const selectedItem = groupBy === 'ad_name' ? adSelection.selectedAdName : adSelection.selectedShoot;

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === 'all' ? 0 : parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main table section */}
      <div className="lg:col-span-3">
        <Card className="shadow-sm border border-border bg-card">
          <SpendTableHeader
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="border-0">
                <SpendTableBody
                  data={paginatedData}
                  groupBy={groupBy}
                  selectedItem={selectedItem}
                  onItemSelect={handleItemSelect}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </ScrollArea>
            
            <SpendTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={aggregatedData.length}
              onPageChange={handlePageChange}
              visiblePages={visiblePages}
            />
          </CardContent>
        </Card>
      </div>

      {/* Ad Creative section */}
      <div className="lg:col-span-1">
        <AdCreativeViewer adSelection={adSelection} />
      </div>
    </div>
  );
};
