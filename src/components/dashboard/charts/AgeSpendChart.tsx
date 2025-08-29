import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AgeGenderSpendData, DemographicChartData } from '@/types/demographicData';
import { FilterState } from '@/pages/Dashboard';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

interface AgeSpendChartProps {
  data: AgeGenderSpendData[];
  filters: FilterState;
}

export const AgeSpendChart: React.FC<AgeSpendChartProps> = ({ data, filters }) => {
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter(item => {
      // Apply date filter
      if (filters.startDate && filters.endDate && item.day) {
        try {
          const itemDate = startOfDay(parseISO(item.day));
          const startDate = startOfDay(filters.startDate);
          const endDate = startOfDay(filters.endDate);
          
          if (isBefore(itemDate, startDate) || isAfter(itemDate, endDate)) {
            return false;
          }
        } catch (error) {
          console.warn('Date parsing error:', error);
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  const chartData = useMemo((): DemographicChartData[] => {
    if (!filteredData || filteredData.length === 0) return [];

    // Group by age and sum spend
    const ageSpend = filteredData.reduce((acc, item) => {
      if (!acc[item.age]) {
        acc[item.age] = 0;
      }
      acc[item.age] += item.spend;
      return acc;
    }, {} as Record<string, number>);

    const totalSpend = Object.values(ageSpend).reduce((sum, spend) => sum + spend, 0);

    return Object.entries(ageSpend)
      .map(([age, spend]) => ({
        name: age,
        spend,
        percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0,
      }))
      .sort((a, b) => {
        // Sort age ranges properly (18-24, 25-34, etc.)
        const aNum = parseInt(a.name.split('-')[0]);
        const bNum = parseInt(b.name.split('-')[0]);
        return aNum - bNum;
      });
  }, [filteredData]);

  const chartConfig = {
    spend: {
      label: "Spend",
      color: "hsl(var(--chart-2))",
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="shadow-sm border border-border bg-card">
        <CardHeader className="bg-muted border-b border-border py-3 px-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            👥 Age Group Spend Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-6 h-6 bg-muted-foreground/30 rounded"></div>
              </div>
              No age data available
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="bg-muted border-b border-border py-3 px-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          👥 Age Group Spend Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 5, right: 5, left: 5, bottom: 40 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'currentColor' }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                width={50}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Spend"
                    ]}
                    labelFormatter={(label) => `Age: ${label}`}
                  />
                }
              />
              <Bar 
                dataKey="spend" 
                fill="hsl(var(--chart-2))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};