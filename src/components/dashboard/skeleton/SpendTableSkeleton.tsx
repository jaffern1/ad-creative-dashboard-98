import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export const SpendTableSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main table section */}
      <div className="lg:col-span-3">
        <Card className="shadow-sm border border-border bg-card">
          {/* Header skeleton */}
          <div className="border-b border-border p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="border-0">
                {/* Table header skeleton */}
                <div className="border-b border-border bg-muted px-4 py-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                
                {/* Table rows skeleton */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="border-b border-border px-4 py-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Pagination skeleton */}
            <div className="border-t border-border p-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Creative section skeleton */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm border border-border bg-card">
          <div className="border-b border-border p-4">
            <Skeleton className="h-5 w-24" />
          </div>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};