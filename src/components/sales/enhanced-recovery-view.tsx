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
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, DollarSign, TrendingUp, Users, Search, Filter, Eye, Download, FileText } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

interface EnhancedRecoveryViewProps {
  data: Lead[]
}

export function EnhancedRecoveryView({ data }: EnhancedRecoveryViewProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [stageFilter, setStageFilter] = React.useState<string>("all")

  const filteredData = React.useMemo(() => {
    return data.filter((lead) => {
      const matchesSearch =
        lead.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.campaign.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStage = stageFilter === "all" || lead.stage === stageFilter

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
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.paymentStage}
          </Badge>
        ),
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
        header: "Amount Recovered",
        cell: ({ row }) => {
          const recovered = row.original.amountRecovered || 0
          const programValue = row.original.programValue || 0
          const recoveryRate = programValue > 0 ? ((recovered / programValue) * 100).toFixed(1) : "0"

          return (
            <div className="space-y-1">
              <div className="text-sm font-medium text-emerald-600">
                ₹{recovered.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">{recoveryRate}% of program value</div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-emerald-500 h-1 rounded-full"
                  style={{ width: `${recoveryRate}%` }}
                />
              </div>
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
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                View History
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Data
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
    const totalProgramValue = filteredData.reduce((sum, lead) => sum + (lead.programValue || 0), 0)
    const totalRecovered = filteredData.reduce((sum, lead) => sum + (lead.amountRecovered || 0), 0)
    const overallRecoveryRate = totalProgramValue > 0 ? ((totalRecovered / totalProgramValue) * 100).toFixed(1) : "0"

    const converted = filteredData.filter(lead => lead.stage === "CONVERTED").length
    const dropped = filteredData.filter(lead => lead.stage === "DROPPED").length
    const hot = filteredData.filter(lead => lead.stage === "HOT").length
    const followUp = filteredData.filter(lead => lead.stage === "FOLLOW_UP").length

    return {
      total,
      totalProgramValue,
      totalRecovered,
      overallRecoveryRate,
      converted,
      dropped,
      hot,
      followUp
    }
  }, [filteredData])

  // Stage distribution data
  const stageData = [
    { stage: "CONVERTED", count: stats.converted, color: "#22c55e" },
    { stage: "HOT", count: stats.hot, color: "#f59e0b" },
    { stage: "FOLLOW_UP", count: stats.followUp, color: "#3b82f6" },
    { stage: "DROPPED", count: stats.dropped, color: "#ef4444" },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Program Value</p>
                <p className="text-xl font-bold text-foreground tracking-tight">₹{stats.totalProgramValue.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
              From {stats.total} leads
            </div>
          </CardContent>
        </Card>

        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Amount Recovered</p>
                <p className="text-xl font-bold text-emerald-500 tracking-tight">₹{stats.totalRecovered.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center ring-1 ring-emerald-500/20">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase mb-1">
                <span className="text-muted-foreground">Rate</span>
                <span className="text-emerald-500">{stats.overallRecoveryRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.overallRecoveryRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Converted</p>
                <p className="text-xl font-bold text-emerald-500 tracking-tight">{stats.converted}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center ring-1 ring-emerald-500/20">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
              {((stats.converted / stats.total) * 100).toFixed(1)}% conversion rate
            </div>
          </CardContent>
        </Card>

        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Pipeline</p>
                <p className="text-xl font-bold text-primary tracking-tight">{stats.hot + stats.followUp}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
              {stats.hot} hot • {stats.followUp} follow-up
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Overview Chart */}
      <Card className="fresh-card-alt card-hover border-none">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-lg font-bold tracking-tight">Recovery Overview</CardTitle>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Total recovery progress</p>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-foreground opacity-80 uppercase tracking-wider">Overall Progress</span>
              <span className="text-sm font-black text-emerald-500 tabular-nums">{stats.overallRecoveryRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 ring-1 ring-border/50 shadow-inner overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary via-purple-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.overallRecoveryRate}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="text-center p-4 bg-primary/5 rounded-2xl ring-1 ring-primary/10">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">Program Value</p>
                <p className="text-xl font-black text-primary tabular-nums">₹{stats.totalProgramValue.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-emerald-500/5 rounded-2xl ring-1 ring-emerald-500/10">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">Recovered</p>
                <p className="text-xl font-black text-emerald-600 tabular-nums">₹{stats.totalRecovered.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Distribution */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold">Lead Stage Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {stageData.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-medium">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{stage.count}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({((stage.count / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: stage.color,
                      width: `${(stage.count / stats.total) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, email, phone, or campaign..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        >
          <option value="all">All Stages</option>
          <option value="CONVERTED">Converted</option>
          <option value="HOT">Hot</option>
          <option value="FOLLOW_UP">Follow Up</option>
          <option value="DROPPED">Dropped</option>
        </select>

        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Table */}
      <Card className="fresh-card-alt border-none shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent border-b border-border/50">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/20 py-3">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
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
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No recovery data found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Showing {table.getRowModel().rows.length} of {filteredData.length} leads
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
