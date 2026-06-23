"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import type { Lead } from "@/components/sales/types"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, DollarSign, Link, CheckCircle, XCircle, Clock, AlertCircle, Search, Filter } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

const paymentStageConfig = {
  INTERESTED: { label: "Interested", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  LINK_SENT: { label: "Link Sent", color: "bg-amber-100 text-amber-800", icon: Link },
  RECEIVED: { label: "Received", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800", icon: XCircle },
  DROPPED: { label: "Dropped", color: "bg-gray-100 text-gray-800", icon: Clock },
}

interface EnhancedPaymentFunnelProps {
  data: Lead[]
}

export function EnhancedPaymentFunnel({ data }: EnhancedPaymentFunnelProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [stageFilter, setStageFilter] = React.useState<string>("all")

  const filteredData = React.useMemo(() => {
    return data.filter((lead) => {
      const matchesSearch =
        lead.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.campaign.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStage = stageFilter === "all" || lead.paymentStage === stageFilter

      return matchesSearch && matchesStage
    })
  }, [data, searchTerm, stageFilter])

  const columns = React.useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "patientName",
        header: "Lead",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-600">
                {row.original.patientName.charAt(0)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="font-bold text-[13px] text-slate-900 tracking-tight">{row.original.patientName}</div>
              <div className="text-[11px] text-slate-500 font-medium">{row.original.email}</div>
              <div className="text-[11px] text-slate-400 font-mono tracking-tighter">{row.original.phone}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "campaign",
        header: "Campaign",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.campaign}
          </Badge>
        ),
      },
      {
        accessorKey: "assignedTo",
        header: "Assigned To",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.assignedTo ? (
              <>
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    {row.original.assignedTo.charAt(0)}
                  </span>
                </div>
                <span className="text-xs">{row.original.assignedTo}</span>
              </>
            ) : (
              <Badge variant="secondary" className="text-xs">Unassigned</Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "stage",
        header: "Lead Stage",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.stage}
          </Badge>
        ),
      },
      {
        accessorKey: "paymentStage",
        header: "Payment Stage",
        cell: ({ row }) => {
          const config = paymentStageConfig[row.original.paymentStage as keyof typeof paymentStageConfig]
          const Icon = config.icon
          return (
            <Badge variant="outline" className={cn("text-xs", config.color)}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "programValue",
        header: "Program Value",
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {row.original.programValue ? `₹${row.original.programValue.toLocaleString()}` : "-"}
          </div>
        ),
      },
      {
        accessorKey: "amountRecovered",
        header: "Recovered",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-emerald-600">
            {row.original.amountRecovered ? `₹${row.original.amountRecovered.toLocaleString()}` : "-"}
          </div>
        ),
      },
      {
        accessorKey: "paymentLinks",
        header: "Payment Links",
        cell: ({ row }) => {
          const links = row.original.paymentLinks
          if (!links || links.length === 0) {
            return <div className="text-xs text-gray-400">No links sent</div>
          }

          return (
            <div className="space-y-1">
              {links.slice(0, 2).map((link, index) => (
                <div key={link.id} className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      link.status === "PAID" ? "bg-emerald-100 text-emerald-800" :
                        link.status === "OPENED" ? "bg-amber-100 text-amber-800" :
                          link.status === "EXPIRED" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                    )}
                  >
                    {link.status}
                  </Badge>
                  <span className="text-xs text-gray-500">₹{link.amount.toLocaleString()}</span>
                </div>
              ))}
              {links.length > 2 && (
                <div className="text-xs text-gray-500">+{links.length - 2} more</div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "lastContactedAt",
        header: "Last Contact",
        cell: ({ row }) => (
          <div className="text-[13px] font-semibold text-foreground">
            {formatDate(row.original.lastContactedAt, "MMM dd, yyyy")}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link className="mr-2 h-4 w-4" />
                Send Payment Link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Received
              </DropdownMenuItem>
              <DropdownMenuItem>
                <XCircle className="mr-2 h-4 w-4" />
                Mark as Failed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                View Lead Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                View Payment History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = filteredData.length
    const interested = filteredData.filter(lead => lead.paymentStage === "INTERESTED").length
    const linkSent = filteredData.filter(lead => lead.paymentStage === "LINK_SENT").length
    const received = filteredData.filter(lead => lead.paymentStage === "RECEIVED").length
    const failed = filteredData.filter(lead => lead.paymentStage === "FAILED").length
    const dropped = filteredData.filter(lead => lead.paymentStage === "DROPPED").length

    const totalValue = filteredData.reduce((sum, lead) => sum + (lead.programValue || 0), 0)
    const recoveredValue = filteredData.reduce((sum, lead) => sum + (lead.amountRecovered || 0), 0)
    const recoveryRate = totalValue > 0 ? ((recoveredValue / totalValue) * 100).toFixed(1) : "0"

    return {
      total,
      interested,
      linkSent,
      received,
      failed,
      dropped,
      totalValue,
      recoveredValue,
      recoveryRate
    }
  }, [filteredData])

  // Funnel data for visualization
  const funnelData = [
    { stage: "Interested", count: stats.interested, color: "#3b82f6" },
    { stage: "Link Sent", count: stats.linkSent, color: "#f59e0b" },
    { stage: "Received", count: stats.received, color: "#22c55e" },
    { stage: "Failed", count: stats.failed, color: "#ef4444" },
    { stage: "Dropped", count: stats.dropped, color: "#6b7280" },
  ]

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-[28px] border border-white/60 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Value</p>
                <p className="text-xl font-bold text-foreground tracking-tight">₹{stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Recovered</span>
                <span className="font-bold text-emerald-500">₹{stats.recoveredValue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.recoveryRate}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5 font-bold tracking-tight uppercase">{stats.recoveryRate}% recovery rate</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-white/60 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Conversion</p>
                <p className="text-xl font-bold text-emerald-500 tracking-tight">{stats.recoveryRate}%</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center ring-1 ring-emerald-500/20">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground font-bold uppercase tracking-wider border-t border-border/40 pt-3">
              {stats.received} of {stats.total} leads converted
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-white/60 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">In Funnel</p>
                <p className="text-xl font-bold text-primary tracking-tight">{stats.interested + stats.linkSent}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground font-bold uppercase tracking-wider border-t border-border/40 pt-3">
              {stats.interested} interested • {stats.linkSent} sent
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Funnel Visualization */}
      <Card className="overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
        <CardHeader className="border-b border-slate-100/80 bg-slate-50/70 px-6 py-5">
          <CardTitle className="text-lg font-bold tracking-tight text-slate-900">Payment Funnel Overview</CardTitle>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Revenue conversion pipeline</p>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <div className="space-y-5">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-[13px] font-bold text-foreground/80">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[14px] font-black text-foreground tabular-nums">{stage.count}</span>
                    <Badge variant="outline" className="ml-2.5 scale-90 border-none bg-muted/50 text-[9px] font-black">
                      {index === 0 || funnelData[0].count === 0 ? "100%" : `${((stage.count / funnelData[0].count) * 100).toFixed(1)}%`}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 ring-1 ring-border/50">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{
                      backgroundColor: stage.color,
                      width: `${index === 0 || funnelData[0].count === 0 ? "100%" : (stage.count / funnelData[0].count) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="rounded-[28px] border border-white/40 bg-gradient-to-r from-white via-white/95 to-slate-50/85 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone, or campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200/70 bg-white/80 pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 md:flex-nowrap">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="h-12 min-w-[160px] rounded-2xl border border-slate-200/80 bg-white px-4 text-[13px] font-medium text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="all">All Stages</option>
              <option value="INTERESTED">Interested</option>
              <option value="LINK_SENT">Link Sent</option>
              <option value="RECEIVED">Received</option>
              <option value="FAILED">Failed</option>
              <option value="DROPPED">Dropped</option>
            </select>

            <Button variant="outline" size="sm" className="h-12 rounded-full border-slate-200/70 bg-white/90 px-4 shadow-sm">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        <div className="border-b border-slate-100/80 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Payment recovery registry</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Collections pipeline and payment stage view</p>
            </div>
            <Badge variant="outline" className="w-fit rounded-full border-slate-200/80 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              {filteredData.length} records
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
                        <DollarSign className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">No payment data found</p>
                        <p className="mt-1 text-sm text-slate-500">Payment-linked leads will appear here as the pipeline updates.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100/80 bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-medium text-slate-500">
          Showing {table.getRowModel().rows.length} of {filteredData.length} leads
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
