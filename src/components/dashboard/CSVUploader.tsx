
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { AdData } from '@/pages/Dashboard';
import { useToast } from '@/hooks/use-toast';

interface CSVUploaderProps {
  onDataLoad: (data: AdData[]) => void;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim());
        
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

        onDataLoad(data);
      } catch (error) {
        toast({
          title: "Error parsing CSV",
          description: "Please check your file format",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="bg-primary hover:bg-primary/90"
        size="lg"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload CSV File
      </Button>
    </div>
  );
};
