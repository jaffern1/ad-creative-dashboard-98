
import { AdData } from '@/pages/Dashboard';

export const parseCsvText = (csvText: string): AdData[] => {
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
