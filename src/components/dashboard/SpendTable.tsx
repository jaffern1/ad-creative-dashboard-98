import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AdData } from '@/pages/Dashboard';

interface SpendTableProps {
  data: AdData[];
  filters: {
    startDate?: Date;
    endDate?: Date;
    country: string | string[];
    objective: string | string[];
    shoot: string | string[];
  };
  allData: AdData[];
}

export const SpendTable: React.FC<SpendTableProps> = ({ data, filters, allData }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'shoot' | 'ad_name'>('shoot');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Calculate previous period data
  const previousPeriodData = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return [];

    const periodDuration = filters.endDate.getTime() - filters.startDate.getTime();
    const previousStartDate = new Date(filters.startDate.getTime() - periodDuration);
    const previousEndDate = new Date(filters.startDate.getTime() - 1); // Day before current period starts

    return allData.filter(row => {
      const rowDate = new Date(row.day);
      if (rowDate < previousStartDate || rowDate > previousEndDate) return false;

      // Apply same filters as current period (except date)
      if (filters.country) {
        const selectedCountries = Array.isArray(filters.country) ? filters.country : [filters.country];
        if (selectedCountries.length > 0 && !selectedCountries.includes(row.country)) return false;
      }
      
      if (filters.objective) {
        const selectedObjectives = Array.isArray(filters.objective) ? filters.objective : [filters.objective];
        if (selectedObjectives.length > 0 && !selectedObjectives.includes(row.Objective)) return false;
      }
      
      if (filters.shoot) {
        const selectedShoots = Array.isArray(filters.shoot) ? filters.shoot : [filters.shoot];
        if (selectedShoots.length > 0 && !selectedShoots.includes(row.shoot)) return false;
      }

      return true;
    });
  }, [allData, filters]);

  const aggregatedData = useMemo(() => {
    const spendByGroup = data.reduce((acc, row) => {
      const groupKey = groupBy === 'shoot' ? (row.shoot || 'Unknown') : (row.ad_name || 'Unknown');
      if (!acc[groupKey]) {
        acc[groupKey] = 0;
      }
      acc[groupKey] += row.spend;
      return acc;
    }, {} as Record<string, number>);

    // Calculate previous period spend by group
    const previousSpendByGroup = previousPeriodData.reduce((acc, row) => {
      const groupKey = groupBy === 'shoot' ? (row.shoot || 'Unknown') : (row.ad_name || 'Unknown');
      if (!acc[groupKey]) {
        acc[groupKey] = 0;
      }
      acc[groupKey] += row.spend;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total spend for percentage calculation
    const totalSpend = Object.values(spendByGroup).reduce((sum, spend) => sum + spend, 0);
    const totalPreviousSpend = Object.values(previousSpendByGroup).reduce((sum, spend) => sum + spend, 0);

    return Object.entries(spendByGroup)
      .map(([itemName, absoluteSpend]) => {
        const percentage = totalSpend > 0 ? (absoluteSpend / totalSpend) * 100 : 0;
        const previousAbsoluteSpend = previousSpendByGroup[itemName] || 0;
        const previousPercentage = totalPreviousSpend > 0 ? (previousAbsoluteSpend / totalPreviousSpend) * 100 : 0;
        
        // Calculate percentage change
        let percentageChange = 0;
        if (previousPercentage > 0) {
          percentageChange = ((percentage - previousPercentage) / previousPercentage) * 100;
        } else if (percentage > 0) {
          percentageChange = 100; // New item, 100% increase
        }

        return { 
          itemName, 
          percentage,
          percentageChange,
          hasPreviousData: previousPercentage > 0 || percentage > 0
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [data, previousPeriodData, groupBy]);

  const paginatedData = useMemo(() => {
    if (itemsPerPage === 0) return aggregatedData; // Show all
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return aggregatedData.slice(startIndex, endIndex);
  }, [aggregatedData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === 0) return 1; // Show all means 1 page
    return Math.ceil(aggregatedData.length / itemsPerPage);
  }, [aggregatedData.length, itemsPerPage]);

  // Get the file_link for the selected item
  const selectedAdFileLink = useMemo(() => {
    if (!selectedItem) return null;
    
    if (groupBy === 'ad_name') {
      // If Ad Name is selected, find the exact ad
      const adData = data.find(row => row.ad_name === selectedItem);
      return adData?.file_link || null;
    } else {
      // If Shoot is selected, find the ad with highest spend in that shoot
      const shootAds = data.filter(row => row.shoot === selectedItem);
      if (shootAds.length === 0) return null;
      
      // Find the ad with highest spend in this shoot
      const highestSpendAd = shootAds.reduce((highest, current) => 
        current.spend > highest.spend ? current : highest
      );
      
      return highestSpendAd.file_link || null;
    }
  }, [selectedItem, data, groupBy]);

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatPercentageChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // Convert Google Drive share link to embeddable format
  const getEmbedUrl = (driveUrl: string) => {
    const fileId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : driveUrl;
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === 'all' ? 0 : parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index && page !== 1 || index === 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main table section */}
      <div className="lg:col-span-3">
        <Card className="shadow-sm border border-border bg-card">
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
                    onClick={() => setGroupBy('shoot')}
                    className="text-xs border-primary/20 hover:bg-primary/10"
                  >
                    Shoot
                  </Button>
                  <Button
                    variant={groupBy === 'ad_name' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGroupBy('ad_name')}
                    className="text-xs border-primary/20 hover:bg-primary/10"
                  >
                    Ad Name
                  </Button>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select value={itemsPerPage === 0 ? 'all' : itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="border-0">
                <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow className="border-b border-border">
                      <TableHead className="font-medium text-foreground text-sm">
                        {groupBy === 'shoot' ? 'Shoot' : 'Ad Name'}
                      </TableHead>
                      <TableHead className="text-right font-medium text-foreground text-sm">Percentage</TableHead>
                      <TableHead className="text-right font-medium text-foreground text-sm">vs Previous</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item, index) => {
                      // Calculate the actual index in the full dataset for ranking
                      const actualIndex = (currentPage - 1) * (itemsPerPage || aggregatedData.length) + index;
                      return (
                        <TableRow 
                          key={item.itemName}
                          className={`
                            hover:bg-secondary/10 transition-colors cursor-pointer
                            ${actualIndex < 3 ? 'bg-primary/5' : 'bg-card'}
                            ${selectedItem === item.itemName ? 'bg-primary/20' : ''}
                          `}
                          onClick={() => setSelectedItem(item.itemName)}
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
                            {item.hasPreviousData ? (
                              <div className="flex items-center justify-end gap-1">
                                {item.percentageChange > 0 ? (
                                  <TrendingUp className="w-3 h-3 text-green-600" />
                                ) : item.percentageChange < 0 ? (
                                  <TrendingDown className="w-3 h-3 text-red-600" />
                                ) : null}
                                <span className={`
                                  ${item.percentageChange > 0 ? 'text-green-600' : 
                                    item.percentageChange < 0 ? 'text-red-600' : 
                                    'text-gray-500'}
                                `}>
                                  {formatPercentageChange(item.percentageChange)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {paginatedData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
            
            {/* Pagination */}
            {itemsPerPage > 0 && totalPages > 1 && (
              <div className="border-t border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, aggregatedData.length)} of {aggregatedData.length} results
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {getVisiblePages().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === '...' ? (
                            <span className="px-3 py-2">...</span>
                          ) : (
                            <PaginationLink
                              onClick={() => handlePageChange(page as number)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ad Creative section - always show */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm border border-border bg-card">
          <CardHeader className="bg-muted border-b border-border py-3">
            <CardTitle className="text-base font-medium">
              Ad Creative
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {selectedItem && selectedAdFileLink ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">{selectedItem}</h3>
                <div className="w-full aspect-[4/5] rounded-md overflow-hidden shadow-sm border border-border">
                  <iframe
                    src={getEmbedUrl(selectedAdFileLink)}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    title={`Creative for ${selectedItem}`}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                {selectedItem ? 'No creative available for this item' : 'Click on an item to view ad creative'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
