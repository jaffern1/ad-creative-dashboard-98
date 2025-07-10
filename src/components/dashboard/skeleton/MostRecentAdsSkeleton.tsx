import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const MostRecentAdsSkeleton: React.FC = () => {
  return (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="bg-muted border-b border-border py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              {/* Ad image skeleton */}
              <Skeleton className="aspect-square w-full rounded-lg" />
              {/* Ad details skeleton */}
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};