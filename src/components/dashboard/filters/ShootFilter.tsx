
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterState } from '@/pages/Dashboard';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

interface ShootFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  shoots: FilterOption[];
}

export const ShootFilter: React.FC<ShootFilterProps> = ({
  filters,
  onFiltersChange,
  shoots,
}) => {
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
          {shoots.map((shoot) => (
            <SelectItem key={shoot.value} value={shoot.value}>
              {shoot.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
