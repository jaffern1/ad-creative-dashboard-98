
import React from 'react';
import { Clock } from 'lucide-react';

interface DashboardHeaderProps {
  lastUpdated: string | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ lastUpdated }) => {
  return (
    <div className="flex items-center gap-6">
      <div className="flex-shrink-0">
        <img 
          src="/lovable-uploads/f14283ba-f6f3-4fa7-8ef8-f2953e8c3ac5.png" 
          alt="Ffern Logo" 
          className="h-16 w-auto"
        />
      </div>
      <div className="flex-1">
        <h1 className="text-2xl font-medium text-foreground">
          Ffern Ads Creative Dashboard
        </h1>
        <p className="text-muted-foreground text-base">
          Best performing ads at Ffern
        </p>
        {lastUpdated && (
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Last updated: {lastUpdated}</span>
          </div>
        )}
      </div>
    </div>
  );
};
