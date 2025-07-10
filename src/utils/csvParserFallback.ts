// Fallback CSV parser for when Web Worker fails
import { AdData } from '@/pages/Dashboard';

export const parseCSVFallback = (csvText: string): AdData[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or invalid');
  }

  // Optimized header parsing
  const headerLine = lines[0];
  const headers: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      headers.push(current.trim().replace(/"/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  headers.push(current.trim().replace(/"/g, ''));

  const data: AdData[] = [];
  
  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Optimized CSV line parsing
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
    for (let k = 0; k < headers.length; k++) {
      obj[headers[k]] = values[k] || '';
    }

    // Optimized number conversions
    if (obj.spend) {
      const spendStr = obj.spend.toString();
      const numMatch = spendStr.match(/[\d.-]+/);
      obj.spend = numMatch ? parseFloat(numMatch[0]) : 0;
    } else {
      obj.spend = 0;
    }

    // Convert integer fields
    obj.is_first_instance = obj.is_first_instance ? parseInt(obj.is_first_instance) || 0 : 0;
    obj.is_first_instance_non_test = obj.is_first_instance_non_test ? parseInt(obj.is_first_instance_non_test) || 0 : 0;

    // Only add valid rows
    if (obj.ad_name && obj.ad_name.trim()) {
      data.push(obj as AdData);
    }
  }

  return data;
};