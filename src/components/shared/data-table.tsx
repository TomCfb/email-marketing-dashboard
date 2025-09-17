"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { DataTableProps, DataTableColumn } from '@/lib/types';

export function DataTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  loading = false,
  pagination,
  sorting,
  onRowClick
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSorting, setLocalSorting] = useState<{
    column: keyof T | null;
    direction: 'asc' | 'desc';
  }>({
    column: null,
    direction: 'asc',
  });

  // Filter data based on search term
  const filteredData = data.filter((row) =>
    columns.some((column) => {
      const value = row[column.key];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const sortColumn = sorting?.column || localSorting.column;
    const sortDirection = sorting?.direction || localSorting.direction;
    
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: keyof T) => {
    if (sorting?.onSort) {
      const newDirection = sorting.column === column && sorting.direction === 'asc' ? 'desc' : 'asc';
      sorting.onSort(column, newDirection);
    } else {
      setLocalSorting(prev => ({
        column,
        direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
    }
  };

  const getSortIcon = (column: keyof T) => {
    const sortColumn = sorting?.column || localSorting.column;
    const sortDirection = sorting?.direction || localSorting.direction;
    
    if (sortColumn !== column) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                {columns.map((_, j) => (
                  <div key={j} className="h-4 bg-muted animate-pulse rounded flex-1" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Table</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[250px]"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.key)}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <span className="flex items-center space-x-1">
                          <span>{column.header}</span>
                          {getSortIcon(column.key)}
                        </span>
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row, index) => (
                  <TableRow 
                    key={index}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {pagination && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page * pagination.pageSize >= pagination.total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
