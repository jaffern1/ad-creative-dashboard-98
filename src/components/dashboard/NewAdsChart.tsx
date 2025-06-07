
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
    <Card className="shadow-sm border border-border bg-card rounded-xl">
      <CardHeader className="bg-[#e7e2d6] border-b border-border py-3 rounded-t-xl">
        <CardTitle className="text-base font-medium flex items-center gap-2 text-[#b46032]">
          <TrendingUp className="h-5 w-5 text-[#b46032]" />
          New Ads Per Day
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
