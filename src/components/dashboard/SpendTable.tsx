
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
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card/80 to-secondary/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/20 rounded-t-lg py-2">
        <CardTitle className="text-base font-medium flex items-center gap-2 text-foreground">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          Top Ad Spend by Shoot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="rounded-b-lg border-0">
            <Table>
              <TableHeader className="sticky top-0 bg-card/90 backdrop-blur-sm">
                <TableRow className="border-b border-border/50">
                  <TableHead className="font-semibold text-foreground text-sm">Shoot</TableHead>
                  <TableHead className="font-semibold text-foreground w-32 text-sm">Video</TableHead>
                  <TableHead className="text-right font-semibold text-foreground text-sm">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedData.map((item, index) => (
                  <TableRow 
                    key={item.shootName}
                    className={`
                      hover:bg-primary/5 transition-colors
                      ${index < 10 ? 'bg-card/50' : 'bg-secondary/30'}
                      ${index === 0 ? 'bg-gradient-to-r from-primary/20 to-secondary/30' : ''}
                      ${index === 1 ? 'bg-gradient-to-r from-primary/15 to-secondary/25' : ''}
                      ${index === 2 ? 'bg-gradient-to-r from-primary/10 to-secondary/20' : ''}
                    `}
                  >
                    <TableCell className="font-medium py-2 px-4">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white
                            ${index === 0 ? 'bg-gradient-to-r from-primary to-primary/80' : ''}
                            ${index === 1 ? 'bg-gradient-to-r from-primary/80 to-primary/60' : ''}
                            ${index === 2 ? 'bg-gradient-to-r from-primary/60 to-primary/40' : ''}
                          `}>
                            {index + 1}
                          </div>
                        )}
                        {index >= 3 && (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {index + 1}
                          </div>
                        )}
                        <span className={`text-sm ${index < 3 ? 'font-semibold' : ''} text-foreground`}>{item.shootName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <div className="w-28 h-16 rounded-lg overflow-hidden shadow-md">
                        <iframe
                          src={videoUrl}
                          className="w-full h-full border-0"
                          allow="autoplay; encrypted-media"
                          title={`Video for ${item.shootName}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-sm py-2 px-4">
                      <span className={`
                        ${index === 0 ? 'text-primary' : ''}
                        ${index === 1 ? 'text-primary/80' : ''}
                        ${index === 2 ? 'text-primary/60' : ''}
                        ${index >= 3 ? 'text-foreground' : ''}
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
