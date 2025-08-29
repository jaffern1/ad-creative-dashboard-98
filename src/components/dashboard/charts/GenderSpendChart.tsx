import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AgeGenderSpendData, DemographicChartData } from '@/types/demographicData';
import { FilterState } from '@/pages/Dashboard';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

interface GenderSpendChartProps {
  data: AgeGenderSpendData[];
  filters: FilterState;
}

const GENDER_COLORS = {
  'Male': 'hsl(var(--chart-1))',
  'Female': 'hsl(var(--chart-2))',
};

export const GenderSpendChart: React.FC<GenderSpendChartProps> = ({ data, filters }) => {
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

    // Group by gender and sum spend (exclude Unknown)
    const genderSpend = filteredData.reduce((acc, item) => {
      const gender = item.gender;
      if (!gender || gender.toLowerCase() === 'unknown') return acc;
      if (!acc[gender]) {
        acc[gender] = 0;
      }
      acc[gender] += item.spend;
      return acc;
    }, {} as Record<string, number>);

    const totalSpend = Object.values(genderSpend).reduce((sum, spend) => sum + spend, 0);

    return Object.entries(genderSpend)
      .map(([gender, spend]) => ({
        name: gender,
        spend,
        percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0,
        color: GENDER_COLORS[gender as keyof typeof GENDER_COLORS] || 'hsl(var(--chart-6))',
      }))
      .sort((a, b) => b.spend - a.spend);
  }, [filteredData]);

  const chartConfig = {
    spend: {
      label: "Spend",
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
            ⚥ Gender Spend Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-6 h-6 bg-muted-foreground/30 rounded"></div>
              </div>
              No gender data available
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
           ⚥ Gender Spend Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="spend"
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || 'hsl(var(--muted))'} 
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Spend"
                    ]}
                    labelFormatter={(label) => `${label}`}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};