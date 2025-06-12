
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AdData } from '@/pages/Dashboard';

interface SpendTableProps {
  data: AdData[];
}

export const SpendTable: React.FC<SpendTableProps> = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'shoot' | 'ad_name'>('shoot');

  const aggregatedData = useMemo(() => {
    const spendByGroup = data.reduce((acc, row) => {
      const groupKey = groupBy === 'shoot' ? (row.shoot || 'Unknown') : (row.ad_name || 'Unknown');
      if (!acc[groupKey]) {
        acc[groupKey] = 0;
      }
      acc[groupKey] += row.spend;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total spend for percentage calculation
    const totalSpend = Object.values(spendByGroup).reduce((sum, spend) => sum + spend, 0);

    return Object.entries(spendByGroup)
      .map(([itemName, absoluteSpend]) => ({ 
        itemName, 
        percentage: totalSpend > 0 ? (absoluteSpend / totalSpend) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [data, groupBy]);

  // Get the file_link for the selected ad
  const selectedAdFileLink = useMemo(() => {
    if (!selectedItem || groupBy !== 'ad_name') return null;
    const adData = data.find(row => row.ad_name === selectedItem);
    return adData?.file_link || null;
  }, [selectedItem, data, groupBy]);

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  // Convert Google Drive share link to embeddable format
  const getEmbedUrl = (driveUrl: string) => {
    const fileId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : driveUrl;
  };

  // Show Ad Creative only when Ad Name tab is active
  const showAdCreative = groupBy === 'ad_name';

  return (
    <div className={`grid grid-cols-1 ${showAdCreative ? 'lg:grid-cols-4' : ''} gap-6`}>
      {/* Main table section */}
      <div className={showAdCreative ? 'lg:col-span-3' : ''}>
        <Card className="shadow-sm border border-border bg-card">
          <CardHeader className="bg-muted border-b border-border py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Top Ads by Spend
              </CardTitle>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aggregatedData.map((item, index) => (
                      <TableRow 
                        key={item.itemName}
                        className={`
                          hover:bg-secondary/10 transition-colors cursor-pointer
                          ${index < 3 ? 'bg-primary/5' : 'bg-card'}
                          ${selectedItem === item.itemName ? 'bg-primary/20' : ''}
                        `}
                        onClick={() => setSelectedItem(item.itemName)}
                      >
                        <TableCell className="font-medium py-2 px-4">
                          <div className="flex items-center gap-2">
                            {index < 3 && (
                              <div className={`
                                w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white
                                ${index === 0 ? 'bg-primary' : ''}
                                ${index === 1 ? 'bg-primary/80' : ''}
                                ${index === 2 ? 'bg-primary/60' : ''}
                              `}>
                                {index + 1}
                              </div>
                            )}
                            {index >= 3 && (
                              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                {index + 1}
                              </div>
                            )}
                            <span className={`text-sm ${index < 3 ? 'font-medium' : ''} text-foreground`}>{item.itemName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-sm py-2 px-4">
                          <span className="text-black">
                            {formatPercentage(item.percentage)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {aggregatedData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Ad Creative section - only show when Ad Name tab is active */}
      {showAdCreative && (
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
                  {selectedItem ? 'No creative available for this ad' : 'Click on an item to view ad creative'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
