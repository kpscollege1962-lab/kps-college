import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * DataTable — reusable TanStack Table wrapper for EduSphere
 *
 * Props:
 *  columns           - ColumnDef[] from @tanstack/react-table
 *  data              - row data array
 *  loading           - shows skeleton rows while true
 *  searchable        - shows a global search input above the table
 *  searchPlaceholder - placeholder text for the search input
 *  paginate          - enable built-in client-side pagination (default true)
 *  pageSize          - rows per page when paginate=true; skeleton row count otherwise (default 10)
 *  toolbar           - optional JSX rendered to the right of the search input
 *  emptyMessage      - message shown when there are no rows
 */
export function DataTable({
  columns,
  data,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  paginate = false,
  pageSize = 10,
  toolbar,
  emptyMessage = 'No results found.',
}) {
  const [sorting, setSorting]           = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      ...(paginate && { pagination }),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    ...(paginate && { onPaginationChange: setPagination }),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(paginate && { getPaginationRowModel: getPaginationRowModel() }),
  })

  const totalFiltered = table.getFilteredRowModel().rows.length
  const pageCount     = table.getPageCount()
  const currentPage   = table.getState().pagination.pageIndex + 1

  return (
    <div className="space-y-3">

      {/* Toolbar row: search + optional extra actions */}
      {(searchable || toolbar) && (
        <div className="flex items-center gap-2">
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value)
                if (paginate) setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className="max-w-xs"
            />
          )}
          {toolbar && (
            <div className="flex items-center gap-2 ml-auto">
              {toolbar}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted()
                  const canSort  = header.column.getCanSort()

                  return (
                    <TableHead
                      key={header.id}
                      style={header.column.columnDef.size ? { width: header.column.columnDef.size } : undefined}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={canSort ? 'cursor-pointer select-none' : ''}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-muted-foreground/60">
                              {isSorted === 'asc'
                                ? <ChevronUpIcon className="size-3.5" />
                                : isSorted === 'desc'
                                ? <ChevronDownIcon className="size-3.5" />
                                : <ChevronsUpDownIcon className="size-3.5" />}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              /* Skeleton rows */
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              /* Empty state */
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              /* Data rows */
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Internal pagination — only when paginate=true and there is more than one page */}
      {paginate && !loading && pageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {pageCount} · {totalFiltered} result{totalFiltered !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
