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
import { MoreHorizontal, Calendar, Users, CheckCircle, XCircle, Clock, Video, Mail, Phone, Search, Filter } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

const webinarStatusConfig = {
  INVITED: { label: "Invited", color: "bg-blue-100 text-blue-800", icon: Mail },
  ATTENDED: { label: "Attended", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  NOT_ATTENDED: { label: "Not Attended", color: "bg-red-100 text-red-800", icon: XCircle },
}

interface EnhancedWebinarStatusProps {
  data: Lead[]
}

export function EnhancedWebinarStatus({ data }: EnhancedWebinarStatusProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const filteredData = React.useMemo(() => {
    return data.filter((lead) => {
      const matchesSearch =
        lead.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.campaign.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || (lead.webinarStatus || "INVITED") === statusFilter

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
              <Users className="h-4 w-4 text-blue-600" />
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
                  <Users className="h-3 w-3 text-gray-600" />
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
        header: "Stage",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.stage}
          </Badge>
        ),
      },
      {
        accessorKey: "webinarStatus",
        header: "Webinar Status",
        cell: ({ row }) => {
          const status = row.original.webinarStatus || "INVITED"
          const config = webinarStatusConfig[status as keyof typeof webinarStatusConfig]
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
                <Phone className="mr-2 h-4 w-4" />
                Call Lead
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Video className="mr-2 h-4 w-4" />
                Schedule Webinar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                View Lead Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                Update Status
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
    const invited = filteredData.filter(lead => (lead.webinarStatus || "INVITED") === "INVITED").length
    const attended = filteredData.filter(lead => lead.webinarStatus === "ATTENDED").length
    const notAttended = filteredData.filter(lead => lead.webinarStatus === "NOT_ATTENDED").length
    const attendanceRate = total > 0 ? ((attended / total) * 100).toFixed(1) : "0"

    return {
      total,
      invited,
      attended,
      notAttended,
      attendanceRate
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
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Leads</p>
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Invited</p>
                <p className="text-xl font-bold text-primary tracking-tight">{stats.invited}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                <Mail className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Attended</p>
                <p className="text-xl font-bold text-emerald-500 tracking-tight">{stats.attended}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center ring-1 ring-emerald-500/20">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fresh-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Rate</p>
                <p className="text-xl font-bold text-purple-500 tracking-tight">{stats.attendanceRate}%</p>
              </div>
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center ring-1 ring-purple-500/20">
                <Video className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
          <option value="INVITED">Invited</option>
          <option value="ATTENDED">Attended</option>
          <option value="NOT_ATTENDED">Not Attended</option>
        </select>

        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>


      {/* Table */}
      <Card className="overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        <div className="border-b border-slate-100/80 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Webinar lead registry</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Attendance and follow-up view</p>
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
                      <Video className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">No webinar data found</p>
                      <p className="mt-1 text-sm text-slate-500">Try changing filters or sync new webinar leads.</p>
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
