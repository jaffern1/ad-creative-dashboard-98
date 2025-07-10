import { useState, useMemo } from 'react';
import { AdData } from '@/pages/Dashboard';

interface AdSelection {
  selectedAdName: string | null;
  selectedShoot: string | null;
  selectedFileLink: string | null;
  selectByAdName: (adName: string, data: AdData[]) => void;
  selectByShoot: (shoot: string, data: AdData[]) => void;
  clearSelection: () => void;
}

export const useAdSelection = (): AdSelection => {
  const [selectedAdName, setSelectedAdName] = useState<string | null>(null);
  const [selectedShoot, setSelectedShoot] = useState<string | null>(null);
  const [selectedFileLink, setSelectedFileLink] = useState<string | null>(null);

  const selectByAdName = (adName: string, data: AdData[]) => {
    setSelectedAdName(adName);
    
    // Find the ad data to get the shoot and file link
    const adData = data.find(row => row.ad_name === adName);
    if (adData) {
      setSelectedShoot(adData.shoot);
      setSelectedFileLink(adData.file_link || null);
    } else {
      setSelectedShoot(null);
      setSelectedFileLink(null);
    }
  };

  const selectByShoot = (shoot: string, data: AdData[]) => {
    setSelectedShoot(shoot);
    
    // Find the highest spend ad in this shoot
    const shootAds = data.filter(row => row.shoot === shoot);
    if (shootAds.length > 0) {
      const highestSpendAd = shootAds.reduce((highest, current) => 
        current.spend > highest.spend ? current : highest
      );
      setSelectedAdName(highestSpendAd.ad_name);
      setSelectedFileLink(highestSpendAd.file_link || null);
    } else {
      setSelectedAdName(null);
      setSelectedFileLink(null);
    }
  };

  const clearSelection = () => {
    setSelectedAdName(null);
    setSelectedShoot(null);
    setSelectedFileLink(null);
  };

  return {
    selectedAdName,
    selectedShoot,
    selectedFileLink,
    selectByAdName,
    selectByShoot,
    clearSelection
  };
};