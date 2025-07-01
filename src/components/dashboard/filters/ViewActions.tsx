
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Save, Copy, Check } from 'lucide-react';
import { FilterState } from '@/pages/Dashboard';
import { useToast } from '@/hooks/use-toast';

interface ViewActionsProps {
  filters: FilterState;
  generateShareableUrl: (filters: FilterState) => string;
}

export const ViewActions: React.FC<ViewActionsProps> = ({
  filters,
  generateShareableUrl
}) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const shareableUrl = generateShareableUrl(filters);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setIsCopied(true);
      toast({
        title: "Link copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getFilterSummary = () => {
    const parts = [];
    
    if (filters.startDate && filters.endDate) {
      const start = filters.startDate.toLocaleDateString();
      const end = filters.endDate.toLocaleDateString();
      parts.push(`${start} - ${end}`);
    }
    
    if (filters.country) {
      const countries = Array.isArray(filters.country) ? filters.country : [filters.country];
      if (countries.length > 0) {
        parts.push(`Countries: ${countries.join(', ')}`);
      }
    }
    
    if (filters.objective) {
      const objectives = Array.isArray(filters.objective) ? filters.objective : [filters.objective];
      if (objectives.length > 0) {
        parts.push(`Objectives: ${objectives.join(', ')}`);
      }
    }
    
    if (filters.shoot) {
      const shoots = Array.isArray(filters.shoot) ? filters.shoot : [filters.shoot];
      if (shoots.length > 0) {
        parts.push(`Shoots: ${shoots.join(', ')}`);
      }
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'No filters applied';
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share View
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Current View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Current Filters</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {getFilterSummary()}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shareUrl" className="text-sm font-medium">
                Shareable Link
              </Label>
              <div className="flex gap-2">
                <Input
                  id="shareUrl"
                  value={shareableUrl}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleCopyUrl}
                  className="px-3"
                >
                  {isCopied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link will see the dashboard with these exact filter settings.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
