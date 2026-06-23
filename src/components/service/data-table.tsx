"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface ServerMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  searchValue?: string
  itemsPerPage?: number
  getRowId?: (row: T) => string | number
  onRowClick?: (row: T) => void
  showSearch?: boolean
  enablePagination?: boolean
  /** When provided, pagination is driven by the server response meta */
  serverMeta?: ServerMeta
  /** Callback when user changes page (for server-driven pagination) */
  onPageChange?: (page: number) => void
  /** Current page override (for server-driven pagination) */
  currentPage?: number
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue,
  itemsPerPage = 10,
  getRowId = (row: any) => row.id || row.patient_id || row.enrollment_id || JSON.stringify(row),
  onRowClick,
  showSearch = true,
  enablePagination = true,
  serverMeta,
  onPageChange,
  currentPage: currentPageProp,
}: DataTableProps<T>) {
  const [localPage, setLocalPage] = useState(1)
  const searchTerm = searchValue || ""

  const isServerPaginated = Boolean(serverMeta)
  const currentPage = isServerPaginated ? (currentPageProp ?? 1) : localPage
  const setCurrentPage = isServerPaginated
    ? (pageOrFn: number | ((p: number) => number)) => {
        const newPage = typeof pageOrFn === "function" ? pageOrFn(currentPage) : pageOrFn
        onPageChange?.(newPage)
      }
    : setLocalPage

  const totalPages = isServerPaginated
    ? (serverMeta?.totalPages ?? 1)
    : enablePagination
    ? Math.ceil(data.length / itemsPerPage)
    : 1
  const totalItems = isServerPaginated ? (serverMeta?.total ?? data.length) : data.length

  const startIndex = isServerPaginated
    ? ((serverMeta?.page ?? 1) - 1) * (serverMeta?.limit ?? itemsPerPage)
    : enablePagination
    ? (currentPage - 1) * itemsPerPage
    : 0
  const endIndex = isServerPaginated
    ? startIndex + data.length
    : enablePagination
    ? startIndex + itemsPerPage
    : data.length

  // For server-side pagination, data is already the current page
  const currentData = isServerPaginated ? data : enablePagination ? data.slice(startIndex, endIndex) : data

  const handleSearch = (value: string) => {
    setCurrentPage(1)
    onSearch?.(value.trim())
  }

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900 hover:bg-slate-900 pointer-events-none transition-none">
              {columns.map((column, index) => (
                <TableHead key={index} className="h-11 font-semibold text-white/90 uppercase tracking-wider text-[11px]">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <TableRow
                  key={getRowId(row)}
                  className={cn("hover:bg-slate-50/50", onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column, index) => (
                    <TableCell key={index}>
                      {column.cell
                        ? column.cell(row)
                        : column.accessorKey
                        ? String(row[column.accessorKey])
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-slate-500">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
          </p>
          <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={isServerPaginated ? !serverMeta?.hasPrev : currentPage === 1}
              className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-sm">…</span>
                ) : (
                  <Button
                    key={page}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(page as number)}
                    className={currentPage === page
                      ? "h-8 w-8 rounded-lg bg-slate-900 p-0 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800"
                      : "h-8 w-8 rounded-lg p-0 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
                    }
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={isServerPaginated ? !serverMeta?.hasNext : currentPage === totalPages}
              className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Generates page numbers with ellipsis for large page counts */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = [1]

  if (current > 3) {
    pages.push("...")
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push("...")
  }

  pages.push(total)
  return pages
}
