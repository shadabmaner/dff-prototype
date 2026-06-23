"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import type { Prescription, PrescriptionStatus } from "@/components/pharmacy/types"
import { usePharmacy } from "@/components/pharmacy/pharmacy-context"
import { GenerateBillDialog } from "@/components/pharmacy/generate-bill-dialog"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function statusBadgeVariant(status: PrescriptionStatus) {
  switch (status) {
    case "NEW":
      return "secondary"
    case "PROCESSING":
      return "default"
    case "READY":
      return "outline"
    case "DISPATCHED":
      return "default"
  }
}

export function PrescriptionsTable({
  data,
}: {
  data: Prescription[]
}) {
  const { updateStatus } = usePharmacy()
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo<ColumnDef<Prescription>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Prescription ID",
      },
      {
        accessorKey: "patientName",
        header: "Patient",
      },
      {
        accessorKey: "doctorName",
        header: "Doctor",
      },
      {
        accessorKey: "date",
        header: "Date",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <Badge variant={statusBadgeVariant(status)}>{status}</Badge>
          )
        },
      },
      {
        id: "billing",
        header: "Billing",
        cell: ({ row }) => {
          const p = row.original
          if (p.amount && p.transactionId) {
            return (
              <div className="text-sm text-muted-foreground">
                ₹{p.amount} ({p.transactionId})
              </div>
            )
          }
          return <div className="text-sm text-muted-foreground">—</div>
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const p = row.original

          return (
            <div className="flex items-center justify-end gap-2">
              <GenerateBillDialog prescriptionId={p.id} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => updateStatus(p.id, "PROCESSING")}>
                    Mark Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatus(p.id, "READY")}>
                    Mark Ready
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatus(p.id, "DISPATCHED")}>
                    Dispatch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [updateStatus]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No prescriptions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
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
  )
}
