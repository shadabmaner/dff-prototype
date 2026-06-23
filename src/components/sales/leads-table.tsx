"use client"

import * as React from "react"
import Link from "next/link"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import type { Lead } from "@/components/sales/types"
import { LeadActions } from "@/components/sales/lead-actions"
import { Card } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle } from "lucide-react"

export function LeadsTable({ data }: { data: Lead[] }) {
  const columns = React.useMemo<ColumnDef<Lead>[]>(
    () => [
      // { accessorKey: "id", header: "Lead ID" },
      {
        accessorKey: "patientName",
        header: "Patient",
        cell: ({ row }) => (
          <Link className="underline" href={`/dashboard/sales/leads/${encodeURIComponent(row.original.id)}?name=${encodeURIComponent(row.original.patientName || "")}`}>
            {row.original.patientName}
          </Link>
        ),
      },
      { accessorKey: "campaign", header: "Campaign" },
      { accessorKey: "assignedTo", header: "Assigned" },
      {
        accessorKey: "stage",
        header: "Stage",
        cell: ({ row }) => <Badge variant="secondary">{row.original.stage}</Badge>,
      },
      {
        accessorKey: "paymentStage",
        header: "Payment",
        cell: ({ row }) => <Badge variant="outline">{row.original.paymentStage}</Badge>,
      },
      {
        accessorKey: "assessmentStatus",
        header: "Assessment",
        cell: ({ row }) => <Badge variant="outline">{row.original.assessmentStatus}</Badge>,
      },
      {
        id: "actions",
        cell: ({ row }) => <LeadActions lead={row.original} />,
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        <div className="border-b border-slate-100/80 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Lead registry</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Core pipeline overview</p>
            </div>
            <Badge variant="outline" className="w-fit rounded-full border-slate-200/80 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              {data.length} records
            </Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b border-slate-100/80 bg-slate-50/40 hover:bg-slate-50/40">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 first:pl-6 last:pr-6">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b border-slate-100/70 transition-colors hover:bg-primary/5/40">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-4 align-middle first:pl-6 last:pr-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">No leads found</p>
                      <p className="mt-1 text-sm text-slate-500">Leads will appear here as they are added to the pipeline.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100/80 bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-medium text-slate-500">
          Showing {table.getRowModel().rows.length} of {data.length} leads
        </div>
        <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-full border-slate-200/80 px-4" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" className="rounded-full border-slate-200/80 px-4" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
        </div>
      </div>
    </div>
  )
}
