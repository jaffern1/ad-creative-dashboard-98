import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Link, Database } from 'lucide-react';

interface LoadingProgressProps {
  stage: 'fetching' | 'parsing' | 'processing';
  progress: number;
  recordsProcessed?: number;
  totalRecords?: number;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  stage,
  progress,
  recordsProcessed = 0,
  totalRecords = 0,
}) => {
  const getStageInfo = () => {
    switch (stage) {
      case 'fetching':
        return {
          icon: <Link className="h-12 w-12 text-primary" />,
          title: 'Fetching data...',
          description: 'Downloading data from Google Sheets'
        };
      case 'parsing':
        return {
          icon: <Database className="h-12 w-12 text-primary" />,
          title: 'Parsing data...',
          description: `Processing ${recordsProcessed.toLocaleString()} of ${totalRecords.toLocaleString()} records`
        };
      case 'processing':
        return {
          icon: <RefreshCw className="h-12 w-12 animate-spin text-primary" />,
          title: 'Processing data...',
          description: 'Preparing dashboard components'
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="p-6 bg-primary/10 rounded-full mb-6">
          {stageInfo.icon}
        </div>
        <h3 className="text-2xl font-medium text-foreground mb-3">
          {stageInfo.title}
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {stageInfo.description}
        </p>
        
        <div className="w-full max-w-md space-y-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            {totalRecords > 0 && (
              <span>{recordsProcessed.toLocaleString()} / {totalRecords.toLocaleString()}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};