
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link } from 'lucide-react';
import { CSVUploader } from './CSVUploader';
import { GoogleSheetsLoader } from './GoogleSheetsLoader';
import { AdData } from '@/pages/Dashboard';

interface DataSourceSelectorProps {
  onDataLoad: (data: AdData[]) => void;
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ onDataLoad }) => {
  const [activeTab, setActiveTab] = useState('csv');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="csv" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload CSV
        </TabsTrigger>
        <TabsTrigger value="sheets" className="flex items-center gap-2">
          <Link className="h-4 w-4" />
          Google Sheets
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="csv" className="mt-6">
        <div className="flex justify-center">
          <CSVUploader onDataLoad={onDataLoad} />
        </div>
      </TabsContent>
      
      <TabsContent value="sheets" className="mt-6">
        <GoogleSheetsLoader onDataLoad={onDataLoad} />
      </TabsContent>
    </Tabs>
  );
};
