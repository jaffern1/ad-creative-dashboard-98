
import { useState } from 'react';

export const useFilterBarState = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return {
    isCollapsed,
    setIsCollapsed,
    isSheetOpen,
    setIsSheetOpen,
  };
};
