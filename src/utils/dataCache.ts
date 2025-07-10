import { AdData } from '@/pages/Dashboard';

export interface CacheEntry {
  data: AdData[];
  timestamp: number;
  version: string;
  checksum: string;
}

export class DataCache {
  private static readonly CACHE_KEY = 'ffern_dashboard_data';
  private static readonly CACHE_VERSION = '1.0';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Generate simple checksum for data validation
  private static generateChecksum(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  static async set(data: AdData[], csvText: string): Promise<void> {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
        checksum: this.generateChecksum(csvText),
      };

      // Try localStorage first (faster)
      try {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(entry));
        console.log('Data cached in localStorage');
      } catch (localStorageError) {
        // If localStorage fails (quota exceeded), try IndexedDB
        await this.setIndexedDB(entry);
        console.log('Data cached in IndexedDB');
      }
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static async get(csvChecksum: string): Promise<AdData[] | null> {
    try {
      // Try localStorage first
      const localData = localStorage.getItem(this.CACHE_KEY);
      if (localData) {
        const entry: CacheEntry = JSON.parse(localData);
        if (this.isValidCache(entry, csvChecksum)) {
          console.log('Data loaded from localStorage cache');
          return entry.data;
        }
      }

      // Try IndexedDB
      const indexedData = await this.getIndexedDB();
      if (indexedData && this.isValidCache(indexedData, csvChecksum)) {
        console.log('Data loaded from IndexedDB cache');
        return indexedData.data;
      }

      return null;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  private static isValidCache(entry: CacheEntry, csvChecksum: string): boolean {
    const now = Date.now();
    return (
      entry.version === this.CACHE_VERSION &&
      entry.checksum === csvChecksum &&
      (now - entry.timestamp) < this.CACHE_DURATION
    );
  }

  private static async setIndexedDB(entry: CacheEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FfernDashboardCache', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        store.put(entry, this.CACHE_KEY);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      };
    });
  }

  private static async getIndexedDB(): Promise<CacheEntry | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FfernDashboardCache', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains('cache')) {
          resolve(null);
          return;
        }
        
        const transaction = db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const getRequest = store.get(this.CACHE_KEY);
        
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      
      // Clear IndexedDB as well
      const request = indexedDB.open('FfernDashboardCache', 1);
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('cache')) {
          const transaction = db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          store.delete(this.CACHE_KEY);
        }
      };
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}