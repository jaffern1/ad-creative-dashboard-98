
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Link, RefreshCw, Check } from 'lucide-react';
import { AdData } from '@/pages/Dashboard';
import { useToast } from '@/hooks/use-toast';

interface GoogleSheetsLoaderProps {
  onDataLoad: (data: AdData[]) => void;
}

export const GoogleSheetsLoader: React.FC<GoogleSheetsLoaderProps> = ({ onDataLoad }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const extractSheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const buildCsvUrl = (sheetId: string) => {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
  };

  const isValidGoogleSheetsUrl = (url: string) => {
    return url.includes('docs.google.com/spreadsheets') && extractSheetId(url) !== null;
  };

  const handleLoadData = async () => {
    if (!sheetUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidGoogleSheetsUrl(sheetUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const sheetId = extractSheetId(sheetUrl);
      if (!sheetId) throw new Error('Could not extract sheet ID');
      
      const csvUrl = buildCsvUrl(sheetId);
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets');
      }
      
      const csvText = await response.text();
      const rows = csvText.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data: AdData[] = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        
        // Convert spend to number
        obj.spend = parseFloat(obj.spend) || 0;
        
        return obj as AdData;
      }).filter(row => row.ad_name); // Filter out empty rows

      // Store the URL in localStorage for next time
      localStorage.setItem('lastGoogleSheetsUrl', sheetUrl);
      
      onDataLoad(data);
      
      toast({
        title: "Data loaded successfully",
        description: `Loaded ${data.length} records from Google Sheets`,
      });
      
    } catch (error) {
      console.error('Error loading Google Sheets data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load data from Google Sheets. Make sure the sheet is published to web.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Load last used URL from localStorage
    const lastUrl = localStorage.getItem('lastGoogleSheetsUrl');
    if (lastUrl) {
      setSheetUrl(lastUrl);
    }
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sheets-url">Google Sheets URL</Label>
          <Input
            id="sheets-url"
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Make sure your Google Sheet is published to web (File → Share → Publish to web)
          </p>
        </div>
        
        <Button
          onClick={handleLoadData}
          disabled={loading || !sheetUrl.trim()}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Link className="mr-2 h-4 w-4" />
              Load from Google Sheets
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
