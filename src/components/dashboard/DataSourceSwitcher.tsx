
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Link, Upload } from 'lucide-react';

interface DataSourceSwitcherProps {
  currentSource: 'auto-sheets' | 'manual-csv';
  onSwitchToManual: () => void;
  recordCount: number;
}

export const DataSourceSwitcher: React.FC<DataSourceSwitcherProps> = ({
  currentSource,
  onSwitchToManual,
  recordCount,
}) => {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentSource === 'auto-sheets' ? (
              <Link className="h-5 w-5 text-primary" />
            ) : (
              <Database className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="text-sm font-medium">
                {currentSource === 'auto-sheets' 
                  ? 'Auto-loaded from Google Sheets' 
                  : 'Manual CSV Upload'}
              </p>
              <p className="text-xs text-muted-foreground">
                {recordCount} records loaded
              </p>
            </div>
          </div>
          
          {currentSource === 'auto-sheets' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToManual}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Switch to Manual Upload
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
