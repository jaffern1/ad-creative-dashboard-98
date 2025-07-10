import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AdData } from '@/pages/Dashboard';

interface CategoryBreakdownProps {
  data: AdData[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => {
  // Memoize total spend calculation for better performance
  const totalSpend = useMemo(() => {
    return data.reduce((sum, row) => sum + row.spend, 0);
  }, [data]);

  const categoryData = useMemo(() => {
    const categories = ['season', 'production_type', 'copy_hook', 'visual_hook', 'Objective'] as const;
    const categoryColors = [
      '#C8B5D1',   // Pastel violet
      '#B5D1B5',   // Pastel green
      '#D1C8B5',   // Pastel beige
      '#B5C8D1',   // Pastel blue
      '#D1B5C8',   // Pastel pink
    ];
    
    return categories.map((category, index) => {
      // Memoize category spend calculations
      const spendByCategory = data.reduce((acc, row) => {
        let categoryValue = row[category] || 'Unknown';
        
        // For Objective category, filter to only allowed values
        if (category === 'Objective') {
          const allowedObjectives = ['Prospecting', 'Remarketing', 'Testing', 'Brand'];
          if (!allowedObjectives.includes(categoryValue)) {
            return acc; // Skip this row if objective is not in allowed list
          }
        }
        
        if (!acc[categoryValue]) {
          acc[categoryValue] = 0;
        }
        acc[categoryValue] += row.spend;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(spendByCategory)
        .map(([name, spend]) => ({ 
          name: name.length > 12 ? name.substring(0, 12) + '...' : name,
          fullName: name,
          spend,
          percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0
        }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 6); // Limit to 6 items for better visibility

      // Swap the display names - copy_hook data should show as "Visual Hook" and visual_hook data should show as "Copy Hook"
      let displayCategory = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      if (category === 'copy_hook') {
        displayCategory = 'Visual Hook';
      } else if (category === 'visual_hook') {
        displayCategory = 'Copy Hook';
      }

      return {
        category: displayCategory,
        data: chartData,
        color: categoryColors[index],
      };
    });
  }, [data, totalSpend]);

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
      
      {/* Display only 2 charts per row for better visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <CardHeader className="bg-muted border-b border-border py-2 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {category.data.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={category.data} 
                        margin={{ top: 5, right: 5, left: 5, bottom: 40 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 9, fill: 'currentColor' }}
                          angle={-45}
                          textAnchor="end"
                          height={40}
                          interval={0}
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: 'currentColor' }}
                          tickFormatter={(value) => `${value.toFixed(0)}%`}
                          width={30}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value) => [
                                `${Number(value).toFixed(0)}%`, 
                                ""
                              ]}
                              labelFormatter={(label, payload) => {
                                // Show full name in tooltip
                                const fullName = payload?.[0]?.payload?.fullName || label;
                                return fullName;
                              }}
                            />
                          }
                        />
                        <Bar 
                          dataKey="percentage" 
                          fill={category.color}
                          radius={[2, 2, 0, 0]}
                          className="transition-opacity"
                          style={{
                            filter: 'none'
                          }}
                          onMouseEnter={(data, index, e) => {
                            const bar = e.target as SVGElement;
                            if (bar) {
                              // Create a slightly darker version of the color
                              const rgb = hexToRgb(category.color);
                              if (rgb) {
                                const darkerColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`;
                                bar.setAttribute('fill', darkerColor);
                              }
                            }
                          }}
                          onMouseLeave={(data, index, e) => {
                            const bar = e.target as SVGElement;
                            if (bar) {
                              bar.setAttribute('fill', category.color);
                            }
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
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

// Helper function to convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
