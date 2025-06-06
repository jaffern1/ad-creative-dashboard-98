
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
    const categories = ['season', 'production_type', 'ad_unique', 'copy_hook', 'visual_hook'] as const;
    const categoryColors = [
      'hsl(220, 98%, 61%)', // Blue
      'hsl(142, 76%, 36%)', // Green  
      'hsl(262, 83%, 58%)', // Purple
      'hsl(346, 87%, 43%)', // Pink
      'hsl(32, 98%, 56%)',  // Orange
    ];
    
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
        .map(([name, spend]) => ({ name, spend }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 10); // Top 10 items

      return {
        category: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        data: chartData,
        color: categoryColors[index],
      };
    });
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-light text-foreground bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Category Performance
        </h2>
        <p className="text-muted-foreground mt-2">Breakdown of ad spend across key categories</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryData.map((category, index) => {
          const chartConfig = {
            spend: {
              label: "Spend",
              color: category.color,
            },
          };

          return (
            <Card 
              key={category.category} 
              className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
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
                          fill={category.color}
                          radius={[6, 6, 0, 0]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <div className="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded"></div>
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
