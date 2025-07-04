
import React from 'react';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  lastUpdated: string | null;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  lastUpdated,
  children
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Add padding-top to account for potential fixed filter bar */}
      <div className="pt-0">
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <DashboardHeader lastUpdated={lastUpdated} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
