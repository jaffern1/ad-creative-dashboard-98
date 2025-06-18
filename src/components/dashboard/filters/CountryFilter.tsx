
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
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
  const handleCountryChange = (country: string, checked: boolean) => {
    const currentCountries = Array.isArray(filters.country) 
      ? filters.country 
      : filters.country ? [filters.country] : [];
    
    let newCountries;
    if (checked) {
      newCountries = [...currentCountries, country];
    } else {
      newCountries = currentCountries.filter(c => c !== country);
    }
    
    onFiltersChange({
      ...filters,
      country: newCountries.length > 0 ? newCountries : '',
    });
  };

  const getSelectedCountries = () => {
    if (Array.isArray(filters.country)) {
      return filters.country;
    }
    return filters.country ? [filters.country] : [];
  };

  return (
    <div className="flex items-center gap-4">
      <Label className="text-sm font-medium text-foreground min-w-[80px]">Country</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start text-left font-normal border-primary/20"
          >
            {getSelectedCountries().length === 0 
              ? "All countries"
              : `${getSelectedCountries().length} selected`
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium">Select Countries</div>
            {countries.map((country) => (
              <div key={country.value} className="flex items-center space-x-2">
                <Checkbox
                  id={country.value}
                  checked={getSelectedCountries().includes(country.value)}
                  onCheckedChange={(checked) => handleCountryChange(country.value, checked as boolean)}
                />
                <Label 
                  htmlFor={country.value}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {country.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
