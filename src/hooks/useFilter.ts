import { useState, useMemo } from 'react';

type FilterConfig<T> = {
  id: string;
  label: string;
  predicate: (item: T, value: any) => boolean;
  options?: { label: string; value: any }[];
  type?: 'select' | 'text' | 'date' | 'boolean';
};

export function useFilter<T>(
  items: T[],
  configs: FilterConfig<T>[]
) {
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const config = configs.find((c) => c.id === key);
        return config?.predicate(item, value);
      })
    );
  }, [items, filters, configs]);

  const setFilter = (id: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    filters,
    setFilter,
    clearFilters,
    filteredItems
  };
}