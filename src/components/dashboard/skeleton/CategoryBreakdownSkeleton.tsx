import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CategoryBreakdownSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto mt-2" />
      </div>
      
      {/* Display only 2 charts per row for better visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card 
            key={index} 
            className="shadow-sm border border-border bg-card"
          >
            <CardHeader className="bg-muted border-b border-border py-2 px-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-[250px] flex items-center justify-center">
                <div className="w-full space-y-2">
                  {/* Chart bars skeleton */}
                  <div className="flex items-end gap-2 h-32">
                    {Array.from({ length: 6 }).map((_, barIndex) => (
                      <div key={barIndex} className="flex-1 flex flex-col items-center gap-1">
                        <Skeleton 
                          className="w-full" 
                          style={{ height: `${Math.random() * 80 + 20}px` }}
                        />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                  {/* X-axis labels skeleton */}
                  <div className="flex gap-2">
                    {Array.from({ length: 6 }).map((_, labelIndex) => (
                      <Skeleton key={labelIndex} className="h-3 flex-1" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};