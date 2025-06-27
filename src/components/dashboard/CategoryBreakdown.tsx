
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdData } from '@/pages/Dashboard';
import { formatSpend } from '@/utils/formatSpend';

interface CategoryBreakdownProps {
  data: AdData[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => {
  // Calculate copy hook breakdown (using copy_hook field)
  const copyHookBreakdown = data.reduce((acc, row) => {
    const copyHook = row.copy_hook || 'Unknown';
    if (!acc[copyHook]) {
      acc[copyHook] = 0;
    }
    acc[copyHook] += row.spend;
    return acc;
  }, {} as Record<string, number>);

  // Calculate visual hook breakdown (using visual_hook field)
  const visualHookBreakdown = data.reduce((acc, row) => {
    const visualHook = row.visual_hook || 'Unknown';
    if (!acc[visualHook]) {
      acc[visualHook] = 0;
    }
    acc[visualHook] += row.spend;
    return acc;
  }, {} as Record<string, number>);

  // Sort and format copy hook data
  const sortedCopyHooks = Object.entries(copyHookBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10

  // Sort and format visual hook data
  const sortedVisualHooks = Object.entries(visualHookBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10

  const renderTable = (title: string, data: [string, number][]) => (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="font-medium text-foreground text-sm">Name</TableHead>
              <TableHead className="text-right font-medium text-foreground text-sm">Spend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(([name, spend], index) => (
              <TableRow key={name} className={index < 3 ? 'bg-primary/5' : 'bg-card'}>
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
                    <span className={`text-sm ${index < 3 ? 'font-medium' : ''} text-foreground`}>{name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-sm py-2 px-4">
                  <span className="text-black">
                    {formatSpend(spend)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {renderTable('Copy Hook Performance', sortedCopyHooks)}
      {renderTable('Visual Hook Performance', sortedVisualHooks)}
    </div>
  );
};
