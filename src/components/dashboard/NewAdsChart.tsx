import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AdData } from '@/pages/Dashboard';
import { TrendingUp } from 'lucide-react';

interface NewAdsChartProps {
  data: AdData[];
}

const chartConfig = {
  newAds: {
    label: "New Ads",
    color: "hsl(25, 56%, 39%)",
  },
};

export const NewAdsChart: React.FC<NewAdsChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const adsByDay = data.reduce((acc, row) => {
      const day = row.day;
      if (!acc[day]) {
        acc[day] = new Set();
      }
      acc[day].add(row.ad_name);
      return acc;
    }, {} as Record<string, Set<string>>);

    return Object.entries(adsByDay)
      .map(([day, adSet]) => ({
        day: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        newAds: adSet.size,
        fullDate: day
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data]);

  return (
    <Card className="shadow-none border border-border/50 bg-card">
      <CardHeader className="bg-card border-b border-border/30 py-4">
        <CardTitle className="text-lg font-light flex items-center gap-2 text-foreground tracking-tight">
          <TrendingUp className="h-4 w-4 text-primary" />
          New Ads Per Day
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: 'hsl(25, 15%, 45%)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(25, 15%, 45%)' }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="newAds" 
                stroke="hsl(25, 56%, 39%)" 
                strokeWidth={2}
                dot={{ fill: "hsl(25, 56%, 39%)", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "hsl(25, 56%, 39%)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
