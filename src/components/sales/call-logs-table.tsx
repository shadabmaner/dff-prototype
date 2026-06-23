"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import type { CallLog } from "@/components/sales/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function CallLogsTable({ data }: { data: CallLog[] }) {
  const [pageSize] = React.useState(10)

  const columns = React.useMemo<ColumnDef<CallLog>[]>(
    () => [
      { accessorKey: "leadName", header: "Lead" },
      { accessorKey: "phone", header: "Phone" },
      {
        accessorKey: "callAt",
        header: "Call Date",
        cell: ({ row }) => new Date(row.original.callAt).toLocaleString(),
      },
      {
        accessorKey: "durationSec",
        header: "Duration",
        cell: ({ row }) => `${row.original.durationSec}s`,
      },
      { accessorKey: "outcome", header: "Outcome" },
      {
        accessorKey: "nextFollowUpAt",
        header: "Next follow-up",
        cell: ({ row }) => row.original.nextFollowUpAt ?? "—",
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const paginationInfo = React.useMemo(() => {
    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize
    const total = data.length
    if (total === 0) return { start: 0, end: 0, total: 0 }
    const start = pageIndex * pageSize + 1
    const end = Math.min(total, start + table.getRowModel().rows.length - 1)
    return { start, end, total }
  }, [data.length, table])

  return (
    <div className="space-y-3">
      <Card className="fresh-card-alt border-none shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent border-b border-border/50">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/20 py-3">
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-primary/5 border-b border-border/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <p className="text-muted-foreground font-medium">No calls.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {paginationInfo.total === 0
            ? "No calls to display"
            : `Showing ${paginationInfo.start}-${paginationInfo.end} of ${paginationInfo.total} calls`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
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
    </div>
  )
}
