
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AdData } from '@/pages/Dashboard';

interface CategoryBreakdownProps {
  data: AdData[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => {
  const categoryData = useMemo(() => {
    const categories = ['season', 'production_type', 'shoot', 'ad_unique', 'copy_hook', 'visual_hook'] as const;
    
    return categories.map(category => {
      const spendByCategory = data.reduce((acc, row) => {
        const categoryValue = row[category] || 'Unknown';
        if (!acc[categoryValue]) {
          acc[categoryValue] = 0;
        }
        acc[categoryValue] += row.spend;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(spendByCategory)
        .map(([name, spend]) => ({ name, spend }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 10); // Top 10 items

      return {
        category: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        data: chartData,
      };
    });
  }, [data]);

  const chartConfig = {
    spend: {
      label: "Spend",
      color: "hsl(var(--primary))",
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-foreground">Category Breakdown</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryData.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="text-lg font-medium">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              {category.data.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={category.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatCurrency}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => [formatCurrency(Number(value)), "Spend"]}
                          />
                        }
                      />
                      <Bar 
                        dataKey="spend" 
                        fill="var(--color-spend)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
