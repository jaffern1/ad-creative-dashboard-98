
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterState } from '@/pages/Dashboard';

interface ShootFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  shoots: string[];
}

export const ShootFilter: React.FC<ShootFilterProps> = ({
  filters,
  onFiltersChange,
  shoots,
}) => {
  // Filter out URLs, empty strings, and other invalid values
  const validShoots = shoots.filter(shoot => 
    shoot && 
    shoot.trim() !== '' && 
    !shoot.startsWith('http') && 
    !shoot.includes('drive.google.com')
  );

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">Shoot</Label>
      <Select
        value={filters.shoot || "all"}
        onValueChange={(value) => onFiltersChange({ ...filters, shoot: value === "all" ? "" : value })}
      >
        <SelectTrigger className="border-primary/20">
          <SelectValue placeholder="All shoots" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All shoots</SelectItem>
          {validShoots.map((shoot) => (
            <SelectItem key={shoot} value={shoot}>
              {shoot}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
