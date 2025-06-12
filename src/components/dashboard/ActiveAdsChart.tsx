
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AdData } from '@/pages/Dashboard';
import { BarChart3 } from 'lucide-react';

interface ActiveAdsChartProps {
  data: AdData[];
}

const chartConfig = {
  activeAds: {
    label: "Active Ads",
    color: "hsl(210, 40%, 60%)",
  },
};

export const ActiveAdsChart: React.FC<ActiveAdsChartProps> = ({ data }) => {
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
        activeAds: adSet.size,
        fullDate: day
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data]);

  return (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="bg-muted border-b border-border py-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Active Ads Per Day
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="activeAds" 
                stroke="hsl(210, 40%, 60%)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "hsl(210, 40%, 60%)", strokeWidth: 1, fill: "hsl(210, 40%, 60%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
