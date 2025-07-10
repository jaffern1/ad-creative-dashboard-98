
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdData } from '@/pages/Dashboard';
import { usePeriodCalculation } from '@/hooks/usePeriodCalculation';
import { useSpendAggregation } from '@/hooks/useSpendAggregation';
import { usePagination } from '@/hooks/usePagination';
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
}

export const SpendTable: React.FC<SpendTableProps> = ({ data, filters, onFiltersChange }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
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

  // Get the file_link for the selected item
  const selectedAdFileLink = useMemo(() => {
    if (!selectedItem) return null;
    
    if (groupBy === 'ad_name') {
      const adData = currentPeriodData.find(row => row.ad_name === selectedItem);
      return adData?.file_link || null;
    } else {
      const shootAds = currentPeriodData.filter(row => row.shoot === selectedItem);
      if (shootAds.length === 0) return null;
      
      const highestSpendAd = shootAds.reduce((highest, current) => 
        current.spend > highest.spend ? current : highest
      );
      
      return highestSpendAd.file_link || null;
    }
  }, [selectedItem, currentPeriodData, groupBy]);

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
                  onItemSelect={setSelectedItem}
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
        <AdCreativeViewer
          selectedItem={selectedItem}
          selectedAdFileLink={selectedAdFileLink}
        />
      </div>
    </div>
  );
};
