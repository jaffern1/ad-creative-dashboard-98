import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { FilterState } from '@/pages/Dashboard';
import { X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  spend: number;
}

interface SeasonFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  seasons: FilterOption[];
}

export const SeasonFilter: React.FC<SeasonFilterProps> = ({
  filters,
  onFiltersChange,
  seasons = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSeasonChange = (season: string, checked: boolean) => {
    const currentSeasons = Array.isArray(filters.season) 
      ? filters.season 
      : (filters.season ? [filters.season] : []);
    
    let updatedSeasons;
    if (checked) {
      updatedSeasons = [...currentSeasons, season];
    } else {
      updatedSeasons = currentSeasons.filter(s => s !== season);
    }
    
    onFiltersChange({
      ...filters,
      season: updatedSeasons.length > 0 ? updatedSeasons : ''
    });
  };

  const handleClearSeason = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onFiltersChange({
      ...filters,
      season: ''
    });
  };

  const getSelectedSeasons = () => {
    if (!filters.season) return [];
    return Array.isArray(filters.season) ? filters.season : [filters.season];
  };

  const selectedSeasons = getSelectedSeasons();

  const getDisplayText = () => {
    if (selectedSeasons.length === 0) {
      return "All seasons";
    }
    
    let text = selectedSeasons.length === 1 
      ? selectedSeasons[0]
      : `${selectedSeasons.length} seasons`;
    
    if (text.length > 20) {
      text = text.substring(0, 20) + '...';
    }
    
    return text;
  };

  const filteredSeasons = seasons.filter(season => 
    season.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    season.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex items-center gap-4">
      <Label className="text-sm font-medium text-foreground min-w-[80px]">Season</Label>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex-1 justify-between text-left font-normal"
          >
            <span className="truncate">{getDisplayText()}</span>
            {selectedSeasons.length > 0 && (
              <X 
                className="h-4 w-4 opacity-50 hover:opacity-100 ml-2 flex-shrink-0" 
                onClick={handleClearSeason}
              />
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="p-4" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <div className="space-y-3">
            <div className="text-sm font-medium">Select Seasons</div>
            <Input
              placeholder="Search seasons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
            {filteredSeasons.map((season) => (
              <div key={season.value} className="flex items-center space-x-2">
                <Checkbox
                  id={season.value}
                  checked={selectedSeasons.includes(season.value)}
                  onCheckedChange={(checked) => handleSeasonChange(season.value, checked as boolean)}
                />
                <label 
                  htmlFor={season.value} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                >
                  {season.label}
                </label>
              </div>
            ))}
            
            {selectedSeasons.length > 0 && (
              <div className="border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSeason}
                  className="w-full text-xs"
                >
                  Clear all seasons
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};