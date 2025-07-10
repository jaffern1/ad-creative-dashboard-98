
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AdData } from '@/pages/Dashboard';
import { useAdSelection } from '@/hooks/useAdSelection';
import { Calendar } from 'lucide-react';

interface MostRecentAdsProps {
  data: AdData[];
}

export const MostRecentAds: React.FC<MostRecentAdsProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const adSelection = useAdSelection();

  const recentAdsData = useMemo(() => {
    // Group by ad_name and find the earliest day for each
    const adGroups = data.reduce((acc, row) => {
      const adName = row.ad_name || 'Unknown';
      if (!acc[adName]) {
        acc[adName] = {
          ad_name: adName,
          launch_date: row.day,
          country: row.country
        };
      } else {
        // Keep the earliest date
        if (new Date(row.day) < new Date(acc[adName].launch_date)) {
          acc[adName].launch_date = row.day;
          acc[adName].country = row.country;
        }
      }
      return acc;
    }, {} as Record<string, {
      ad_name: string;
      launch_date: string;
      country: string;
    }>);

    // Convert to array and sort by launch date descending
    return Object.values(adGroups)
      .sort((a, b) => new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime());
  }, [data]);

  const paginatedData = useMemo(() => {
    if (itemsPerPage === 0) return recentAdsData; // Show all
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return recentAdsData.slice(startIndex, endIndex);
  }, [recentAdsData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === 0) return 1; // Show all means 1 page
    return Math.ceil(recentAdsData.length / itemsPerPage);
  }, [recentAdsData.length, itemsPerPage]);

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === 'all' ? 0 : parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="bg-muted border-b border-border py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Most Recent Ads
          </CardTitle>
          <div className="flex items-center gap-2">
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
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-card border-b border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="font-medium text-foreground text-sm">Ad Name</TableHead>
                  <TableHead className="font-medium text-foreground text-sm w-32 text-center">Launch Date</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          
          {/* Scrollable Content */}
          <ScrollArea className="h-[340px]">
            <Table>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow 
                    key={`${item.ad_name}-${index}`}
                    className={`hover:bg-secondary/10 transition-colors cursor-pointer ${
                      adSelection.selectedAdName === item.ad_name 
                        ? 'bg-primary/10 border-l-4 border-l-primary' 
                        : 'bg-card'
                    }`}
                    onClick={() => adSelection.selectByAdName(item.ad_name, data)}
                  >
                    <TableCell className="font-medium py-3 px-4">
                      <div className="text-sm text-foreground" title={item.ad_name}>
                        {item.ad_name}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 font-mono text-sm text-foreground text-center w-32">
                      {formatDate(item.launch_date)}
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8 text-sm">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        
        {/* Pagination */}
        {itemsPerPage > 0 && totalPages > 1 && (
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, recentAdsData.length)} of {recentAdsData.length} results
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
  );
};
