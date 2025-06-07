import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdData } from '@/pages/Dashboard';
import { Calendar } from 'lucide-react';

interface MostRecentAdsProps {
  data: AdData[];
}

export const MostRecentAds: React.FC<MostRecentAdsProps> = ({ data }) => {
  const recentAdsData = useMemo(() => {
    // Group by ad_name and find the earliest day for each
    const adGroups = data.reduce((acc, row) => {
      const adName = row.ad_name || 'Unknown';
      if (!acc[adName]) {
        acc[adName] = {
          ad_name: adName,
          launch_date: row.day,
          account_name: row.account_name,
          campaign_name: row.campaign_name,
          adset_name: row.adset_name,
          country: row.country
        };
      } else {
        // Keep the earliest date
        if (new Date(row.day) < new Date(acc[adName].launch_date)) {
          acc[adName].launch_date = row.day;
          acc[adName].account_name = row.account_name;
          acc[adName].campaign_name = row.campaign_name;
          acc[adName].adset_name = row.adset_name;
          acc[adName].country = row.country;
        }
      }
      return acc;
    }, {} as Record<string, {
      ad_name: string;
      launch_date: string;
      account_name: string;
      campaign_name: string;
      adset_name: string;
      country: string;
    }>);

    // Convert to array and sort by launch date descending
    return Object.values(adGroups)
      .sort((a, b) => new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime());
  }, [data]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="shadow-sm border border-border bg-card rounded-xl">
      <CardHeader className="bg-[#e7e2d6] border-b border-border py-3 rounded-t-xl">
        <CardTitle className="text-base font-medium flex items-center gap-2 text-[#b46032]">
          <Calendar className="h-4 w-4 text-[#b46032]" />
          Most Recent Ads
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="border-0">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow className="border-b border-border">
                  <TableHead className="font-medium text-foreground text-sm">Ad Name</TableHead>
                  <TableHead className="font-medium text-foreground text-sm">Launch Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAdsData.map((item, index) => (
                  <TableRow 
                    key={`${item.ad_name}-${index}`}
                    className="hover:bg-secondary/10 transition-colors bg-card"
                  >
                    <TableCell className="font-medium py-3 px-4">
                      <div className="text-sm text-foreground" title={item.ad_name}>
                        {item.ad_name}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 font-mono text-sm text-foreground">
                      {formatDate(item.launch_date)}
                    </TableCell>
                  </TableRow>
                ))}
                {recentAdsData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8 text-sm">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
