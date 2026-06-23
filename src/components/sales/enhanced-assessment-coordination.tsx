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
import { MoreHorizontal, Clipboard, CheckCircle, Clock, Calendar, FileText, Search, Filter, Phone, Mail } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

const assessmentConfig = {
  PENDING: { label: "Pending", color: "bg-amber-100 text-amber-800", icon: Clock },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
}

interface EnhancedAssessmentCoordinationProps {
  data: Lead[]
}

export function EnhancedAssessmentCoordination({ data }: EnhancedAssessmentCoordinationProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const filteredData = React.useMemo(() => {
    return data.filter((lead) => {
      const matchesSearch =
        lead.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.campaign.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || lead.assessmentStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [data, searchTerm, statusFilter])

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
        accessorKey: "assessmentStatus",
        header: "Assessment Status",
        cell: ({ row }) => {
          const config = assessmentConfig[row.original.assessmentStatus as keyof typeof assessmentConfig]
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
        accessorKey: "lastContactedAt",
        header: "Last Contact",
        cell: ({ row }) => (
          <div className="text-[13px] font-semibold text-foreground">
            {formatDate(row.original.lastContactedAt, "MMM dd, yyyy")}
          </div>
        ),
      },
      {
        accessorKey: "nextFollowUpAt",
        header: "Next Follow-up",
        cell: ({ row }) => (
          <div className="text-[13px] font-bold">
            {row.original.nextFollowUpAt ? (
              <div className="text-primary tracking-tight">
                {formatDate(row.original.nextFollowUpAt, "MMM dd, HH:mm")}
              </div>
            ) : (
              <div className="text-slate-400 font-medium">Not scheduled</div>
            )}
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
                <Clipboard className="mr-2 h-4 w-4" />
                Schedule Assessment
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                View Assessment
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Call Lead
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                View Lead Details
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
    const pending = filteredData.filter(lead => lead.assessmentStatus === "PENDING").length
    const completed = filteredData.filter(lead => lead.assessmentStatus === "COMPLETED").length
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : "0"

    const totalValue = filteredData.reduce((sum, lead) => sum + (lead.programValue || 0), 0)
    const completedValue = filteredData
      .filter(lead => lead.assessmentStatus === "COMPLETED")
      .reduce((sum, lead) => sum + (lead.programValue || 0), 0)
    const valueCompletionRate = totalValue > 0 ? ((completedValue / totalValue) * 100).toFixed(1) : "0"

    return {
      total,
      pending,
      completed,
      completionRate,
      totalValue,
      completedValue,
      valueCompletionRate
    }
  }, [filteredData])

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Assessments</p>
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                <Clipboard className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight mb-1">
                <span className="text-muted-foreground">Pending</span>
                <span className="text-amber-500">{stats.pending}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((stats.pending / stats.total) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Completed</p>
                <p className="text-xl font-bold text-emerald-500 tracking-tight">{stats.completed}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center ring-1 ring-emerald-500/20">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight mb-1">
                <span className="text-muted-foreground">Rate</span>
                <span className="text-emerald-500">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Value</p>
                <p className="text-xl font-bold text-foreground tracking-tight">₹{stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                <FileText className="h-4 w-4 text-primary" />
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
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Completed Value</p>
                <p className="text-xl font-bold text-emerald-500 tracking-tight">₹{stats.completedValue.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center ring-1 ring-emerald-500/20">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight mb-1">
                <span className="text-muted-foreground">Value Rate</span>
                <span className="text-emerald-500">{stats.valueCompletionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.valueCompletionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(assessmentConfig).map(([status, config]) => {
          const count = filteredData.filter(lead => lead.assessmentStatus === status).length
          const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0"
          const Icon = config.icon

          return (
            <Card key={status} className="fresh-card card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-border/50", config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[13px] text-foreground tracking-tight">{config.label}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{count} assessments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-foreground tabular-nums">{percentage}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 shadow-sm", config.color.replace("text-", "bg-"))}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
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
                    <Clipboard className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No assessment data found</p>
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
