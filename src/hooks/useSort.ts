import { useState, useMemo } from 'react';

type SortConfig<T> = {
  id: string;
  label: string;
  getValue: (item: T) => any;
};

export function useSort<T>(
  items: T[],
  configs: SortConfig<T>[]
) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;

    const config = configs.find((c) => c.id === sortConfig.key);
    if (!config) return items;

    return [...items].sort((a, b) => {
      const aValue = config.getValue(a);
      const bValue = config.getValue(b);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig, configs]);

  const requestSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  return {
    items: sortedItems,
    sortConfig,
    requestSort
  };
}