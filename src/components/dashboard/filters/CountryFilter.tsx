
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterState } from '@/pages/Dashboard';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

interface CountryFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  countries: FilterOption[];
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
            <SelectItem key={country.value} value={country.value}>
              <div className="flex w-full justify-between items-center">
                <span>{country.label}</span>
                <span className="text-muted-foreground ml-2">£{Math.round(country.spend / 1000)}K</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
