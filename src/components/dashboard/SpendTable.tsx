
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
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          Top Ad Spend by Shoot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="rounded-b-lg border-0">
            <Table>
              <TableHeader className="sticky top-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <TableRow className="border-b border-blue-200 dark:border-blue-800">
                  <TableHead className="font-semibold text-blue-900 dark:text-blue-100">Shoot</TableHead>
                  <TableHead className="font-semibold text-blue-900 dark:text-blue-100 w-48">Video</TableHead>
                  <TableHead className="text-right font-semibold text-blue-900 dark:text-blue-100">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedData.map((item, index) => (
                  <TableRow 
                    key={item.shootName}
                    className={`
                      hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors
                      ${index < 10 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                      ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' : ''}
                      ${index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50' : ''}
                      ${index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20' : ''}
                    `}
                  >
                    <TableCell className="font-medium py-4 px-6">
                      <div className="flex items-center gap-3">
                        {index < 3 && (
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                            ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : ''}
                            ${index === 1 ? 'bg-gradient-to-r from-gray-400 to-slate-500' : ''}
                            ${index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' : ''}
                          `}>
                            {index + 1}
                          </div>
                        )}
                        {index >= 3 && (
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
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
                        ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}
                        ${index === 1 ? 'text-gray-600 dark:text-gray-400' : ''}
                        ${index === 2 ? 'text-orange-600 dark:text-orange-400' : ''}
                        ${index >= 3 ? 'text-blue-600 dark:text-blue-400' : ''}
                      `}>
                        {formatPercentage(item.percentage)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {aggregatedData.length === 0 && (
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
      </CardContent>
    </Card>
  );
};
