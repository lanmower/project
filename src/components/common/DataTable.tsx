import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useFilter } from '@/hooks/useFilter';
import { useSort } from '@/hooks/useSort';
import { usePagination } from '@/hooks/usePagination';

interface Column<T> {
  id: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterConfig?: {
    type: 'select' | 'text' | 'date';
    options?: { label: string; value: any }[];
  };
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
}

export function DataTable<T>({
  data,
  columns,
  itemsPerPage = 10
}: DataTableProps<T>) {
  const filterConfigs = columns
    .filter((col) => col.filterable)
    .map((col) => ({
      id: col.id,
      label: col.header,
      predicate: (item: T, value: any) => {
        const cellValue = String(col.cell(item));
        return cellValue.toLowerCase().includes(String(value).toLowerCase());
      },
      ...col.filterConfig
    }));

  const sortConfigs = columns
    .filter((col) => col.sortable)
    .map((col) => ({
      id: col.id,
      label: col.header,
      getValue: (item: T) => col.cell(item)
    }));

  const { filters, setFilter, filteredItems } = useFilter(data, filterConfigs);
  const { items: sortedItems, sortConfig, requestSort } = useSort(filteredItems, sortConfigs);
  const {
    items: paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    hasNextPage,
    hasPrevPage
  } = usePagination(sortedItems, itemsPerPage);

  return (
    <div className="space-y-4">
      <FilterSection
        configs={filterConfigs}
        filters={filters}
        onFilterChange={setFilter}
      />

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id}>
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => requestSort(column.id)}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((item, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!hasNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
