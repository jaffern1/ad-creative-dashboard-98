
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
    const newAdsByDay = data.reduce((acc, row) => {
      const day = row.day;
      const isFirstInstance = Number(row.is_first_instance) || 0; // Default to 0 if undefined
      
      if (!acc[day]) {
        acc[day] = 0;
      }
    
      acc[day] += isFirstInstance; // Sum the is_first_instance values (0 or 1)
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(newAdsByDay)
      .map(([day, newAds]) => ({
        day: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        newAds,
        fullDate: day
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data]);

  return (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="bg-muted border-b border-border py-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
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
                dot={false}
                activeDot={{ r: 4, stroke: "hsl(25, 56%, 39%)", strokeWidth: 1, fill: "hsl(25, 56%, 39%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
