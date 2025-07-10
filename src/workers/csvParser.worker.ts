// CSV Parser Web Worker
interface ParseMessage {
  type: 'PARSE_CSV';
  csvText: string;
  chunkSize: number;
}

interface ProgressMessage {
  type: 'PROGRESS';
  stage: 'parsing';
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
}

interface CompleteMessage {
  type: 'COMPLETE';
  data: any[];
}

interface ErrorMessage {
  type: 'ERROR';
  error: string;
}

type WorkerMessage = ProgressMessage | CompleteMessage | ErrorMessage;

// Optimized CSV parsing function
function parseCSVOptimized(csvText: string, chunkSize: number = 200): any[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or invalid');
  }

  // Clean and parse headers
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

  const totalLines = lines.length - 1;
  const data: any[] = [];
  let processedRows = 0;

  // Process in chunks
  for (let i = 1; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, Math.min(i + chunkSize, lines.length));
    
    for (const line of chunk) {
      if (!line.trim()) continue;

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

      // Create object with type conversion
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
        data.push(obj);
      }
    }

    processedRows = Math.min(i + chunkSize - 1, totalLines);
    const progress = Math.round((processedRows / totalLines) * 100);
    
    // Send progress update
    self.postMessage({
      type: 'PROGRESS',
      stage: 'parsing',
      progress,
      recordsProcessed: processedRows,
      totalRecords: totalLines,
    } as ProgressMessage);
  }

  return data;
}

// Worker message handler
self.onmessage = function(e: MessageEvent<ParseMessage>) {
  try {
    const { csvText, chunkSize } = e.data;
    const data = parseCSVOptimized(csvText, chunkSize);
    
    self.postMessage({
      type: 'COMPLETE',
      data,
    } as CompleteMessage);
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    } as ErrorMessage);
  }
};