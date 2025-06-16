
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
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  };

  const isValidGoogleSheetsUrl = (url: string) => {
    return url.includes('docs.google.com/spreadsheets') && extractSheetId(url) !== null;
  };

  const parseCsvText = (csvText: string): AdData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or invalid');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('CSV Headers:', headers);

    const data: AdData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line properly handling quoted values
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      // Convert spend to number
      if (obj.spend) {
        obj.spend = parseFloat(obj.spend.toString().replace(/[^0-9.-]/g, '')) || 0;
      } else {
        obj.spend = 0;
      }

      // Convert is_first_instance to number
      if (obj.is_first_instance) {
        obj.is_first_instance = parseInt(obj.is_first_instance) || 0;
      } else {
        obj.is_first_instance = 0;
      }

      // Only add rows that have an ad_name
      if (obj.ad_name && obj.ad_name.trim()) {
        data.push(obj as AdData);
      }
    }

    return data;
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
      console.log('Fetching data from:', csvUrl);
      
      // Try to fetch with different approaches to handle CORS
      let response;
      try {
        response = await fetch(csvUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'text/csv',
          }
        });
      } catch (corsError) {
        console.log('CORS error, trying alternative approach');
        // Fallback: try the publish to web URL format
        const publishUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
        response = await fetch(publishUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'text/csv',
          }
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('CSV data received, length:', csvText.length);
      
      if (!csvText || csvText.length < 10) {
        throw new Error('No data received from Google Sheets');
      }

      const data = parseCsvText(csvText);
      
      if (data.length === 0) {
        throw new Error('No valid data rows found in the sheet');
      }

      // Store the URL in localStorage for next time
      localStorage.setItem('lastGoogleSheetsUrl', sheetUrl);
      
      onDataLoad(data);
      
      toast({
        title: "Data loaded successfully",
        description: `Loaded ${data.length} records from Google Sheets`,
      });
      
    } catch (error) {
      console.error('Error loading Google Sheets data:', error);
      let errorMessage = 'Failed to load data from Google Sheets.';
      
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          errorMessage += ' CORS error - make sure the sheet is published to web and publicly accessible.';
        } else if (error.message.includes('HTTP error')) {
          errorMessage += ' The sheet may not be publicly accessible or the URL is incorrect.';
        } else {
          errorMessage += ` ${error.message}`;
        }
      }
      
      toast({
        title: "Error loading data",
        description: errorMessage,
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
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Make sure your Google Sheet is:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Published to web (File → Share → Publish to web)</li>
              <li>Set to "Anyone with the link" can view</li>
              <li>Has the correct column headers matching your data format</li>
            </ul>
          </div>
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
