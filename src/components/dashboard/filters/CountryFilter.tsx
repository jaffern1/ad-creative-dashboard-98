
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterState } from '@/pages/Dashboard';

interface CountryFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  countries: string[];
}

export const CountryFilter: React.FC<CountryFilterProps> = ({
  filters,
  onFiltersChange,
  countries,
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">Country</Label>
      <Select
        value={filters.country || "all"}
        onValueChange={(value) => onFiltersChange({ ...filters, country: value === "all" ? "" : value })}
      >
        <SelectTrigger className="border-primary/20">
          <SelectValue placeholder="All countries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All countries</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
