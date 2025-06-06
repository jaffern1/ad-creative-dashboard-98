
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdData } from '@/pages/Dashboard';

interface SpendTableProps {
  data: AdData[];
}

export const SpendTable: React.FC<SpendTableProps> = ({ data }) => {
  const aggregatedData = useMemo(() => {
    const spendByShoot = data.reduce((acc, row) => {
      const shootName = row.shoot || 'Unknown';
      if (!acc[shootName]) {
        acc[shootName] = 0;
      }
      acc[shootName] += row.spend;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total spend for percentage calculation
    const totalSpend = Object.values(spendByShoot).reduce((sum, spend) => sum + spend, 0);

    return Object.entries(spendByShoot)
      .map(([shootName, absoluteSpend]) => ({ 
        shootName, 
        percentage: totalSpend > 0 ? (absoluteSpend / totalSpend) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [data]);

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  // Convert Google Drive share link to embeddable format
  const getEmbedUrl = (driveUrl: string) => {
    const fileId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : '';
  };

  const videoUrl = getEmbedUrl('https://drive.google.com/file/d/1PiCiQio-fDWvT-R53SjxZF-kZ7QPvpD9/view?usp=sharing');

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-stone-50 to-neutral-50 dark:from-stone-950/20 dark:to-neutral-950/20">
      <CardHeader className="bg-gradient-to-r from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-700 text-stone-800 dark:text-stone-200 rounded-t-lg py-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-stone-600 dark:bg-stone-300 rounded-full"></div>
          Top Ad Spend by Shoot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="rounded-b-lg border-0">
            <Table>
              <TableHeader className="sticky top-0 bg-white/80 backdrop-blur-sm dark:bg-stone-900/80">
                <TableRow className="border-b border-stone-200 dark:border-stone-800">
                  <TableHead className="font-semibold text-stone-800 dark:text-stone-200">Shoot</TableHead>
                  <TableHead className="font-semibold text-stone-800 dark:text-stone-200 w-48">Video</TableHead>
                  <TableHead className="text-right font-semibold text-stone-800 dark:text-stone-200">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedData.map((item, index) => (
                  <TableRow 
                    key={item.shootName}
                    className={`
                      hover:bg-stone-100/50 dark:hover:bg-stone-800/20 transition-colors
                      ${index < 10 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50/50 dark:bg-stone-800/50'}
                      ${index === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' : ''}
                      ${index === 1 ? 'bg-gradient-to-r from-stone-50 to-neutral-50 dark:from-stone-800/50 dark:to-neutral-800/50' : ''}
                      ${index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' : ''}
                    `}
                  >
                    <TableCell className="font-medium py-4 px-6">
                      <div className="flex items-center gap-3">
                        {index < 3 && (
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                            ${index === 0 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : ''}
                            ${index === 1 ? 'bg-gradient-to-r from-stone-400 to-neutral-500' : ''}
                            ${index === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-500' : ''}
                          `}>
                            {index + 1}
                          </div>
                        )}
                        {index >= 3 && (
                          <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-600 dark:text-stone-300">
                            {index + 1}
                          </div>
                        )}
                        <span className={index < 3 ? 'font-semibold' : ''}>{item.shootName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="w-40 h-24 rounded-lg overflow-hidden shadow-md">
                        <iframe
                          src={videoUrl}
                          className="w-full h-full border-0"
                          allow="autoplay; encrypted-media"
                          title={`Video for ${item.shootName}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-lg py-4 px-6">
                      <span className={`
                        ${index === 0 ? 'text-amber-600 dark:text-amber-400' : ''}
                        ${index === 1 ? 'text-stone-600 dark:text-stone-400' : ''}
                        ${index === 2 ? 'text-orange-600 dark:text-orange-400' : ''}
                        ${index >= 3 ? 'text-stone-600 dark:text-stone-400' : ''}
                      `}>
                        {formatPercentage(item.percentage)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {aggregatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-stone-500 dark:text-stone-400 py-8">
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
  );
};
