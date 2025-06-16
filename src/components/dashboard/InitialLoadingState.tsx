
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Link } from 'lucide-react';

export const InitialLoadingState: React.FC = () => {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="p-6 bg-primary/10 rounded-full mb-6">
          <Link className="h-12 w-12 text-primary" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <h3 className="text-2xl font-medium text-foreground">Loading data...</h3>
        </div>
        <p className="text-muted-foreground text-center max-w-md">
          Loading data from Google Sheets
        </p>
      </CardContent>
    </Card>
  );
};
