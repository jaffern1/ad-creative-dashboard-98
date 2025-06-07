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
    <Card className="shadow-none border border-border/50 bg-card">
      <CardHeader className="bg-card border-b border-border/30 py-4">
        <CardTitle className="text-lg font-light flex items-center gap-2 text-foreground tracking-tight">
          <Calendar className="h-4 w-4 text-primary" />
          Most Recent Ads
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="border-0">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow className="border-b border-border/30">
                  <TableHead className="font-light text-foreground text-sm tracking-tight">Ad Name</TableHead>
                  <TableHead className="font-light text-foreground text-sm tracking-tight">Launch Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAdsData.slice(0, 10).map((item, index) => (
                  <TableRow 
                    key={`${item.ad_name}-${index}`}
                    className="hover:bg-muted/30 transition-colors bg-card border-b border-border/20"
                  >
                    <TableCell className="font-light py-4 px-6">
                      <div className="text-sm text-foreground tracking-tight" title={item.ad_name}>
                        {item.ad_name}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 font-mono text-sm text-muted-foreground font-light">
                      {formatDate(item.launch_date)}
                    </TableCell>
                  </TableRow>
                ))}
                {recentAdsData.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6 text-sm font-light">
                      Scroll to see more ads...
                    </TableCell>
                  </TableRow>
                )}
                {recentAdsData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-12 text-sm font-light">
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
