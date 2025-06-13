
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { CSVUploader } from './CSVUploader';
import { AdData } from '@/pages/Dashboard';

interface EmptyStateProps {
  onDataUpload: (csvData: AdData[]) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onDataUpload }) => {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="p-6 bg-primary/10 rounded-full mb-6">
          <Upload className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-medium mb-3 text-foreground">Upload your data</h3>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Upload a CSV file with your Meta Ads data
        </p>
        <CSVUploader onDataLoad={onDataUpload} />
      </CardContent>
    </Card>
  );
};
