
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
      'hsl(25, 15%, 45%)',   // Warm stone
      'hsl(35, 20%, 50%)',   // Neutral brown
      'hsl(15, 25%, 55%)',   // Warm taupe
      'hsl(45, 18%, 48%)',   // Muted gold
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
        <h2 className="text-3xl font-light text-stone-800 dark:text-stone-200">
          Category Performance
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mt-2">Percentage breakdown of ad spend across key categories</p>
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
              className="shadow-lg border-0 bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-800 hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-stone-50 to-white dark:from-stone-800 dark:to-stone-700 border-b border-stone-200 dark:border-stone-600">
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
                          radius={[6, 6, 0, 0]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-stone-500 dark:text-stone-400">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-stone-200 dark:bg-stone-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <div className="w-6 h-6 bg-stone-400 dark:bg-stone-500 rounded"></div>
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
