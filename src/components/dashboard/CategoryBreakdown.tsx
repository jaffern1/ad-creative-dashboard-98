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
    const categories = ['season', 'production_type', 'copy_hook', 'visual_hook'] as const;
    const categoryColors = [
      'hsl(25, 56%, 39%)',   // Primary
      'hsl(28, 59%, 66%)',   // Secondary
      'hsl(25, 40%, 50%)',   // Darker variant
      'hsl(28, 50%, 55%)',   // Lighter variant
    ];

    // Calculate total spend for percentage calculation
    const totalSpend = data.reduce((sum, row) => sum + row.spend, 0);
    
    return categories.map((category, index) => {
      const spendByCategory = data.reduce((acc, row) => {
        const categoryValue = row[category] || 'Unknown';
        if (!acc[categoryValue]) {
          acc[categoryValue] = 0;
        }
        acc[categoryValue] += row.spend;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(spendByCategory)
        .map(([name, spend]) => ({ 
          name, 
          spend,
          percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0
        }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 10); // Top 10 items

      return {
        category: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        data: chartData,
        color: categoryColors[index],
      };
    });
  }, [data]);

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(0)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-medium text-foreground">
          Category Performance
        </h2>
        <p className="text-muted-foreground mt-2">Percentage breakdown of ad spend across key categories</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryData.map((category, index) => {
          const chartConfig = {
            percentage: {
              label: "Percentage",
              color: category.color,
            },
          };

          return (
            <Card 
              key={category.category} 
              className="shadow-sm border border-border bg-card"
            >
              <CardHeader className="bg-card border-b border-border py-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {category.data.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={category.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                          tickFormatter={formatPercentage}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value) => [
                                formatPercentage(Number(value)), 
                                "Percentage"
                              ]}
                            />
                          }
                        />
                        <Bar 
                          dataKey="percentage" 
                          fill={category.color}
                          radius={[3, 3, 0, 0]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                        <div className="w-6 h-6 bg-muted-foreground/30 rounded"></div>
                      </div>
                      No data available
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
