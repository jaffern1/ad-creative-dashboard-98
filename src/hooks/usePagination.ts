
import { useMemo } from 'react';

interface PaginationData<T> {
  paginatedData: T[];
  totalPages: number;
  visiblePages: (number | string)[];
}

export const usePagination = <T>(
  data: T[], 
  currentPage: number, 
  itemsPerPage: number
): PaginationData<T> => {
  const paginatedData = useMemo(() => {
    if (itemsPerPage === 0) return data;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === 0) return 1;
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage]);

  const visiblePages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index && page !== 1 || index === 0);
  }, [currentPage, totalPages]);

  return { paginatedData, totalPages, visiblePages };
};
