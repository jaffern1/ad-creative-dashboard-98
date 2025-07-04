
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FilterBarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const FilterBarToggle: React.FC<FilterBarToggleProps> = ({
  isCollapsed,
  onToggle,
}) => {
  if (isCollapsed) {
    return (
      <div className="absolute left-0 top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="px-2 py-2 h-auto bg-card/80 border border-border/30 rounded-r-md rounded-l-none shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="px-2 py-1 h-auto mr-2"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
};
