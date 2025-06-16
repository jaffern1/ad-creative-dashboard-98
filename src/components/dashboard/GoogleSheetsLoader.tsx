
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AdData } from '@/pages/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { GoogleSheetsUrlInput } from './GoogleSheetsUrlInput';
import { fetchGoogleSheetsData, isValidGoogleSheetsUrl } from '@/utils/googleSheetsUtils';
import { parseCsvText } from '@/utils/csvParser';

interface GoogleSheetsLoaderProps {
  onDataLoad: (data: AdData[]) => void;
}

export const GoogleSheetsLoader: React.FC<GoogleSheetsLoaderProps> = ({ onDataLoad }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLoadData = async (sheetUrl: string) => {
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
        description: "Please enter a valid Google Sheets URL or CSV export link",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const csvText = await fetchGoogleSheetsData(sheetUrl);
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

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <GoogleSheetsUrlInput onSubmit={handleLoadData} loading={loading} />
      </CardContent>
    </Card>
  );
};
