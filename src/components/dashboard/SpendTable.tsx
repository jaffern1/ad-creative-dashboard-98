
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdData } from '@/pages/Dashboard';

interface SpendTableProps {
  data: AdData[];
}

export const SpendTable: React.FC<SpendTableProps> = ({ data }) => {
  const aggregatedData = useMemo(() => {
    const spendByAd = data.reduce((acc, row) => {
      const adName = row.ad_name;
      if (!acc[adName]) {
        acc[adName] = 0;
      }
      acc[adName] += row.spend;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(spendByAd)
      .map(([adName, totalSpend]) => ({ adName, totalSpend }))
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-medium">Ad Spend by Ad Name</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Name</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aggregatedData.map((item, index) => (
                <TableRow key={item.adName}>
                  <TableCell className="font-medium">{item.adName}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.totalSpend)}
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
      </CardContent>
    </Card>
  );
};
