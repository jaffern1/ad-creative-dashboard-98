
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, RefreshCw } from 'lucide-react';
import { isValidGoogleSheetsUrl } from '@/utils/googleSheetsUtils';

interface GoogleSheetsUrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export const GoogleSheetsUrlInput: React.FC<GoogleSheetsUrlInputProps> = ({ onSubmit, loading }) => {
  const [sheetUrl, setSheetUrl] = useState('');

  useEffect(() => {
    // Load last used URL from localStorage
    const lastUrl = localStorage.getItem('lastGoogleSheetsUrl');
    if (lastUrl) {
      setSheetUrl(lastUrl);
    }
  }, []);

  const handleSubmit = () => {
    if (!sheetUrl.trim()) {
      return;
    }

    if (!isValidGoogleSheetsUrl(sheetUrl)) {
      return;
    }

    onSubmit(sheetUrl);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sheets-url">Google Sheets URL or CSV Export Link</Label>
        <Input
          id="sheets-url"
          type="url"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Supported formats:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Regular sheet URLs: docs.google.com/spreadsheets/d/...</li>
            <li>Published CSV export links: .../pub?...output=csv</li>
            <li>Make sure your sheet is publicly accessible</li>
          </ul>
        </div>
      </div>
      
      <Button
        onClick={handleSubmit}
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
    </div>
  );
};
