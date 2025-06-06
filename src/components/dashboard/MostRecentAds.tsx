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
    <Card className="shadow-lg border-0 bg-gradient-to-br from-stone-50 to-neutral-50 dark:from-stone-950/20 dark:to-neutral-950/20">
      <CardHeader className="bg-gradient-to-r from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-700 text-stone-800 dark:text-stone-200 rounded-t-lg">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Most Recent Ads
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="rounded-b-lg border-0">
            <Table>
              <TableHeader className="sticky top-0 bg-white/80 backdrop-blur-sm dark:bg-stone-900/80">
                <TableRow className="border-b border-stone-200 dark:border-stone-800">
                  <TableHead className="font-semibold text-stone-800 dark:text-stone-200">Ad Name</TableHead>
                  <TableHead className="font-semibold text-stone-800 dark:text-stone-200">Launch Date</TableHead>
                  <TableHead className="font-semibold text-stone-800 dark:text-stone-200">Campaign</TableHead>
                  <TableHead className="font-semibold text-stone-800 dark:text-stone-200">Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAdsData.slice(0, 10).map((item, index) => (
                  <TableRow 
                    key={`${item.ad_name}-${index}`}
                    className="hover:bg-stone-100/50 dark:hover:bg-stone-800/20 transition-colors bg-white dark:bg-stone-900"
                  >
                    <TableCell className="font-medium py-4 px-6 max-w-xs">
                      <div className="truncate" title={item.ad_name}>
                        {item.ad_name}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 font-mono text-sm">
                      {formatDate(item.launch_date)}
                    </TableCell>
                    <TableCell className="py-4 px-6 max-w-xs">
                      <div className="truncate" title={item.campaign_name}>
                        {item.campaign_name}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                        {item.country}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {recentAdsData.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-stone-500 dark:text-stone-400 py-4">
                      Scroll to see more ads...
                    </TableCell>
                  </TableRow>
                )}
                {recentAdsData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-stone-500 dark:text-stone-400 py-8">
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
