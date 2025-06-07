
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
    <Card className="shadow-none border border-border/50 bg-card">
      <CardHeader className="bg-card border-b border-border/30 py-4">
        <CardTitle className="text-lg font-light flex items-center gap-2 text-foreground tracking-tight">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          Top Ad Spend by Shoot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="border-0">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow className="border-b border-border/30">
                  <TableHead className="font-light text-foreground text-sm tracking-tight">Shoot</TableHead>
                  <TableHead className="font-light text-foreground w-32 text-sm tracking-tight">Video</TableHead>
                  <TableHead className="text-right font-light text-foreground text-sm tracking-tight">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedData.map((item, index) => (
                  <TableRow 
                    key={item.shootName}
                    className={`
                      hover:bg-muted/30 transition-colors border-b border-border/20
                      ${index < 3 ? 'bg-primary/3' : 'bg-card'}
                    `}
                  >
                    <TableCell className="font-light py-4 px-6">
                      <div className="flex items-center gap-3">
                        {index < 3 && (
                          <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center text-xs font-light text-white
                            ${index === 0 ? 'bg-primary' : ''}
                            ${index === 1 ? 'bg-primary/80' : ''}
                            ${index === 2 ? 'bg-primary/60' : ''}
                          `}>
                            {index + 1}
                          </div>
                        )}
                        {index >= 3 && (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-light text-muted-foreground">
                            {index + 1}
                          </div>
                        )}
                        <span className={`text-sm font-light text-foreground tracking-tight ${index < 3 ? 'font-normal' : ''}`}>
                          {item.shootName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="w-28 h-16 rounded-md overflow-hidden shadow-sm border border-border/50">
                        <iframe
                          src={videoUrl}
                          className="w-full h-full border-0"
                          allow="autoplay; encrypted-media"
                          title={`Video for ${item.shootName}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-light text-sm py-4 px-6">
                      <span className={`
                        ${index === 0 ? 'text-primary font-normal' : ''}
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
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-12 font-light">
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
