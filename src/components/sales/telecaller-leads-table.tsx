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
import { useLeads } from "@/hooks/use-leads"
import { useQueryClient } from "@tanstack/react-query"

import { EnhancedCallLogForm } from "@/components/sales/enhanced-call-log-form"
import { EnhancedCallLogsTable } from "@/components/sales/enhanced-call-logs-table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Phone, PhoneCall, Mail, History, User, List, Search, X, CalendarDays } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const leadStatusFilters = [
  { value: "new", label: "New Lead" },
  { value: "not_connected", label: "Not Connected" },
  { value: "connected", label: "Connected" },
  { value: "follow_up_required", label: "Follow-up Required" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not-Interested" },
  { value: "assessment_paid", label: "Assessment Paid" },
  { value: "assessment_done", label: "Assessment Done" },
  { value: "converted", label: "Converted" },
]

const notConnectedOutcomes = ["not_connected", "not_answered", "no_response", "busy", "wrong_number"]
const followUpRequiredOutcomes = ["follow_up_required", "call_back_requested"]

interface TelecallerLeadsTableProps {
  data: Lead[]
  paginationMeta?: {
    total: number
    totalPages: number
    page: number
    limit: number
    hasNext: boolean
    hasPrev: boolean
  }
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function TelecallerLeadsTable({ data, paginationMeta, pageSize, onPageChange, onPageSizeChange }: TelecallerLeadsTableProps) {
  const queryClient = useQueryClient()
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<Set<string>>(new Set())
  const [showAssignDialog, setShowAssignDialog] = React.useState(false)
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
  const [isClient, setIsClient] = React.useState(false)
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [leadForCallLog, setLeadForCallLog] = React.useState<Lead | null>(null)
  const [isCallLogSheetOpen, setIsCallLogSheetOpen] = React.useState(false)
  const [leadForCallHistory, setLeadForCallHistory] = React.useState<Lead | null>(null)
  const [isCallHistorySheetOpen, setIsCallHistorySheetOpen] = React.useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dateFilter, setDateFilter] = React.useState<string>("")
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date } | undefined>(undefined)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [data])

  const formatDate = (date: string | undefined) => {
    if (!date) return "Never"
    try {
      const d = new Date(date)
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return "Invalid Date"
    }
  }

  const handleSelectLead = (leadId: string, checked: boolean) => {
    setSelectedLeadIds(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(leadId)
      } else {
        newSet.delete(leadId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(new Set(data.map(lead => lead.id)))
    } else {
      setSelectedLeadIds(new Set())
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "NEW":
      case "UNASSIGNED":
        return "bg-gray-100 text-gray-800"
      case "CONTACTED":
      case "connected":
        return "bg-blue-100 text-blue-800"
      case "INTERESTED":
      case "interested":
        return "bg-green-100 text-green-800"
      case "NOT_INTERESTED":
      case "not_interested":
        return "bg-red-100 text-red-800"
      case "ASSESSMENT_PAID":
      case "assessment_paid":
        return "bg-blue-100 text-blue-800"
      case "ASSESSMENT_DONE":
      case "assessment_done":
        return "bg-indigo-100 text-indigo-800"
      case "FOLLOW_UP":
      case "follow_up_required":
        return "bg-yellow-100 text-yellow-800"
      case "not_connected":
        return "bg-slate-100 text-slate-800"
      case "HOT":
        return "bg-red-100 text-red-800"
      case "CONVERTED":
        return "bg-emerald-100 text-emerald-800"
      case "DROPPED":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Handle date range selection
  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to })
    } else {
      setDateRange(undefined)
    }
  }

  // Filter data based on filters
  const filteredData = React.useMemo(() => {
    return data.filter((lead) => {
      const trimmedSearchTerm = searchTerm.trim()
      
      // Search filter
      const matchesSearch = trimmedSearchTerm
        ? [lead.patientName, lead.phone, lead.email]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(trimmedSearchTerm.toLowerCase()))
        : true

      // Status filter
      const matchesStatus = (() => {
        if (statusFilter === "all") return true
        
        const leadStatus = lead.status || lead.stage || ""
        
        switch (statusFilter) {
          case "new":
            return leadStatus === "NEW" || leadStatus === "UNASSIGNED"
          case "not_connected":
            return notConnectedOutcomes.includes(leadStatus.toLowerCase())
          case "connected":
            return leadStatus.toLowerCase() === "connected"
          case "follow_up_required":
            return followUpRequiredOutcomes.includes(leadStatus.toLowerCase()) || leadStatus === "FOLLOW_UP"
          case "interested":
            return leadStatus.toLowerCase() === "interested"
          case "not_interested":
            return leadStatus.toLowerCase() === "not_interested"
          case "assessment_paid":
            return leadStatus.toLowerCase() === "assessment_paid"
          case "assessment_done":
            return leadStatus.toLowerCase() === "assessment_done"
          case "converted":
            return leadStatus === "CONVERTED"
          default:
            return false
        }
      })()

      // Date filter
      const matchesDate = (() => {
        const leadDate = lead.created_at ? new Date(lead.created_at) : null
        if (!leadDate) return true
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (dateFilter === "today") {
          const todayStart = new Date(today)
          const todayEnd = new Date(today)
          todayEnd.setHours(23, 59, 59, 999)
          return leadDate >= todayStart && leadDate <= todayEnd
        } else if (dateFilter === "last7days") {
          const sevenDaysAgo = new Date(today)
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          return leadDate >= sevenDaysAgo
        } else if (dateFilter === "last1month") {
          const oneMonthAgo = new Date(today)
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          return leadDate >= oneMonthAgo
        } else if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
          const fromDate = new Date(dateRange.from)
          fromDate.setHours(0, 0, 0, 0)
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          return leadDate >= fromDate && leadDate <= toDate
        }
        
        return true
      })()

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [data, searchTerm, statusFilter, dateFilter, dateRange])

  // Active filter chips
  const activeFilterChips = React.useMemo(() => {
    const chips: { id: string; label: string; value: string }[] = []
    const trimmedSearch = searchTerm.trim()
    if (trimmedSearch) chips.push({ id: "search", label: "Search", value: trimmedSearch })
    
    if (statusFilter !== "all") {
      const label = leadStatusFilters.find((option) => option.value === statusFilter)?.label || statusFilter
      chips.push({ id: "status", label: "Status", value: label })
    }
    
    if (dateFilter && dateFilter !== "all") {
      chips.push({ 
        id: "dateFilter", 
        label: "Date", 
        value: dateFilter === "today" ? "Today" : dateFilter === "last7days" ? "Last 7 Days" : dateFilter === "last1month" ? "Last 1 Month" : dateFilter === "custom" && dateRange?.from && dateRange?.to ? `${dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : "Custom Range"
      })
    }
    
    return chips
  }, [searchTerm, statusFilter, dateFilter, dateRange])

  // Clear filter
  const clearFilter = (id: string) => {
    switch (id) {
      case "search":
        setSearchTerm("")
        break
      case "status":
        setStatusFilter("all")
        break
      case "dateFilter":
        setDateFilter("all")
        setDateRange(undefined)
        break
      default:
        break
    }
  }

  // Reset all filters
  const resetAllFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateFilter("all")
    setDateRange(undefined)
  }

  const handleOpenCallHistory = React.useCallback((lead: Lead) => {
    setLeadForCallHistory(lead)
    setIsCallHistorySheetOpen(true)
  }, [])

  const handleDirectCall = (phone?: string | null) => {
    if (!phone) return
    if (typeof window !== "undefined") {
      window.open(`tel:${phone}`, "_self")
    }
  }

  const columns: ColumnDef<Lead>[] = [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={table.getIsAllPageRowsSelected()}
    //       onCheckedChange={(value) => {
    //         table.toggleAllPageRowsSelected(!!value)
    //         handleSelectAll(!!value)
    //       }}
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={selectedLeadIds.has(row.original.id)}
    //       onCheckedChange={(value) => handleSelectLead(row.original.id, !!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: "patientName",
      header: "Patient",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex flex-col gap-0.5">
            <Link className="font-bold text-[13px] text-primary hover:underline hover:text-primary/80 transition-colors tracking-tight" href={`/dashboard/telecaller/leads/${encodeURIComponent(row.original.id)}`}>
              {row.original.patientName}
            </Link>
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
          {row.original.campaign || "Direct"}
        </Badge>
      ),
    },
    // {
    //   accessorKey: "assignedTo",
    //   header: "Assigned To",
    //   cell: ({ row }) => {
    //     const assigned = row.original.assignedTo
    //     return (
    //       <div className="flex items-center gap-2">
    //         {assigned ? (
    //           <>
    //             <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
    //               <UserCheck className="h-3 w-3 text-green-600" />
    //             </div>
    //             <div className="text-sm">{assigned}</div>
    //           </>
    //         ) : (
    //           <>
    //             <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
    //               <User className="h-3 w-3 text-gray-600" />
    //             </div>
    //             <div className="text-sm text-gray-500">Unassigned</div>
    //           </>
    //         )}
    //       </div>
    //     )
    //   },
    // },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || row.original.stage
        let displayText = status
        
        // Format call log form status values for better display
        switch (status) {
          case "connected":
            displayText = "Connected"
            break
          case "not_connected":
            displayText = "Not Connected"
            break
          case "interested":
            displayText = "Interested"
            break
          case "not_interested":
          case "NOT_INTERESTED":
            displayText = "Not Interested"
            break
          case "assessment_paid":
          case "ASSESSMENT_PAID":
            displayText = "Assessment Paid"
            break
          case "assessment_done":
          case "ASSESSMENT_DONE":
            displayText = "Assessment Done"
            break
          case "follow_up_required":
            displayText = "Follow-up Required"
            break
          default:
            displayText = status ? status.replace("_", " ") : "Unknown"
        }
        
        return (
          <Badge className={cn("text-xs", getStageColor(status))}>
            {displayText}
          </Badge>
        )
      },
    },
    // {
    //   accessorKey: "priority",
    //   header: "Priority",
    //   cell: ({ row }) => (
    //     <Badge className={cn("text-xs capitalize", getPriorityColor(row.original.priority || 'medium'))}>
    //       {row.original.priority || 'medium'}
    //     </Badge>
    //   ),
    // },
    {
      accessorKey: "lastContactedAt",
      header: "Last Contacted",
      cell: ({ row }) => {
        const lastContacted = row.original.lastContactedAt
        return (
          <div className="text-sm">
            {isClient ? formatDate(lastContacted) : "Loading..."}
          </div>
        )
      },
    },
    {
      id: "callActions",
      header: "Call Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="rounded-full bg-slate-900 text-white px-3 text-xs font-semibold shadow-sm hover:bg-slate-800"
            onClick={() => {
              // Prefetch leads list when opening call log to make list refresh feel instant
              queryClient.prefetchQuery({
                queryKey: ["leads", paginationMeta?.page || 1, pageSize || 10, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
                staleTime: 1000 * 30, // 30 seconds
              })
              setLeadForCallLog(row.original)
              setIsCallLogSheetOpen(true)
            }}
          >
            Log Call
          </Button>
          
        </div>
      ),
    },
    // {
    //   id: "actions",
    //   enableHiding: false,
    //   cell: ({ row }) => (
    //     <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button variant="ghost" className="h-8 w-8 p-0">
    //           <span className="sr-only">Open menu</span>
    //           <MoreHorizontal className="h-4 w-4" />
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent align="end">
    //         <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //         <DropdownMenuItem
    //           onClick={() => navigator.clipboard.writeText(row.original.phone)}
    //         >
    //           <Phone className="mr-2 h-4 w-4" />
    //           Copy Phone
    //         </DropdownMenuItem>
    //         <DropdownMenuItem
    //           onClick={() => row.original.email && navigator.clipboard.writeText(row.original.email)}
    //         >
    //           <Mail className="mr-2 h-4 w-4" />
    //           Copy Email
    //         </DropdownMenuItem>
    //         <DropdownMenuSeparator />
    //         <DropdownMenuItem
    //           onClick={() => {
    //             setLeadForCallLog(row.original)
    //             setIsCallLogSheetOpen(true)
    //           }}
    //         >
    //           <Phone className="mr-2 h-4 w-4" />
    //           Log Call
    //         </DropdownMenuItem>
    //         <DropdownMenuItem
    //           onClick={() => handleOpenCallHistory(row.original)}
    //         >
    //           <List className="mr-2 h-4 w-4" />
    //           View Call Logs
    //         </DropdownMenuItem>
    //         <DropdownMenuItem>
    //           <Link href={`/dashboard/telecaller/leads/${row.original.id}`} className="flex items-center">
    //             <History className="mr-2 h-4 w-4" />
    //             View Details
    //           </Link>
    //         </DropdownMenuItem>
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   ),
    // },
  ]

  const isServerPaginated = Boolean(paginationMeta)

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerPaginated ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    state: isServerPaginated ? undefined : { pagination },
    onPaginationChange: isServerPaginated ? undefined : setPagination,
  })

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="rounded-[32px] border border-white/40 bg-gradient-to-r from-white via-white/95 to-slate-50/85 p-5 shadow-[0_30px_70px_rgba(15,23,42,0.14)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Name / Mobile"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200/70 bg-white/80 pl-10 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3 md:flex-nowrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 min-w-[140px] rounded-2xl border-slate-200/80 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {leadStatusFilters.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-12 min-w-[140px] rounded-2xl border-slate-200/80 text-sm">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last1month">Last 1 Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 rounded-2xl border border-slate-200/80 bg-white/80 justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </>
                      ) : (
                        dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    className="rounded-md border"
                  />
                  <div className="p-3 border-t border-border">
                    <Button 
                      onClick={() => {
                        // Keep the current dateFilter value, just ensure the dateRange is applied
                        if (dateRange) {
                          // The dateRange is already set, no need to change dateFilter
                        }
                      }} 
                      className="w-full" 
                      size="sm"
                      disabled={!dateRange}
                    >
                      Apply Filter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => clearFilter(chip.id)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span>{chip.label}:</span>
                <span className="font-semibold">{chip.value}</span>
                <span className="text-slate-400">✕</span>
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full border border-dashed border-slate-200/80 bg-white/80 text-xs"
              onClick={resetAllFilters}
            >
              <X className="mr-1 h-3 w-3" />
              Reset All
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedLeadIds.size > 0 && (
            <span>{selectedLeadIds.size} lead{selectedLeadIds.size !== 1 ? 's' : ''} selected</span>
          )}
        </div>
      
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-slate-100/80 bg-slate-50/40 hover:bg-slate-50/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 first:pl-6 last:pr-6">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-slate-100/70 transition-colors hover:bg-primary/5/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-4 align-middle first:pl-6 last:pr-6">
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
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <Phone className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">No leads found</p>
                      <p className="mt-1 text-sm text-slate-500">Assigned leads will appear here for calling actions.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100/80 bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:gap-4">
          <span>
            {paginationMeta ? (
              <>
                Showing {table.getRowModel().rows.length} of {paginationMeta.total} telecaller leads
                {paginationMeta.totalPages > 0 && (
                  <span className="ml-2">(Page {paginationMeta.page} of {paginationMeta.totalPages})</span>
                )}
              </>
            ) : (
              <>
                Showing {table.getRowModel().rows.length} of {filteredData.length} leads
                {table.getPageCount() > 0 && (
                  <span className="ml-2">(Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()})</span>
                )}
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            <span>Per page</span>
            <Select
              value={`${paginationMeta ? (pageSize ?? paginationMeta.limit) : pagination.pageSize}`}
              onValueChange={(value) => {
                const nextSize = Number(value)
                if (paginationMeta) {
                  onPageSizeChange?.(nextSize)
                } else {
                  setPagination((prev) => ({ ...prev, pageSize: nextSize, pageIndex: 0 }))
                }
              }}
            >
              <SelectTrigger className="h-8 w-[80px] rounded-full border-slate-200/80 bg-white">
                <SelectValue placeholder={paginationMeta ? (pageSize ?? paginationMeta.limit) : pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={`tele-page-size-${size}`} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {paginationMeta ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(paginationMeta.page - 1)}
                disabled={!paginationMeta.hasPrev || !onPageChange}
                className="rounded-full border-slate-200/80 px-4"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <span>Page</span>
                <span className="font-medium text-slate-900">{paginationMeta.page}</span>
                <span>of {paginationMeta.totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(paginationMeta.page + 1)}
                disabled={!paginationMeta.hasNext || !onPageChange}
                className="rounded-full border-slate-200/80 px-4"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-full border-slate-200/80 px-4"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-full border-slate-200/80 px-4"
              >
                Next
              </Button>
            </>
          )}
        </div>
      </div>

      <Sheet open={isCallLogSheetOpen} onOpenChange={setIsCallLogSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="text-left space-y-2">
            <SheetTitle className="text-2xl font-bold text-slate-900">Log a Call</SheetTitle>
            <SheetDescription className="text-sm text-slate-500">
              {leadForCallLog ? `Logging for ${leadForCallLog.patientName}` : "Select a lead to begin"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 pb-10">
            <EnhancedCallLogForm
              defaultLeadId={leadForCallLog?.id}
              onSuccess={() => {
                setIsCallLogSheetOpen(false)
                setLeadForCallLog(null)
              }}
            />
          </div>
        </SheetContent>
        <SheetTrigger asChild>
          <span className="sr-only">Hidden trigger</span>
        </SheetTrigger>
      </Sheet>
      <Sheet
        open={isCallHistorySheetOpen}
        onOpenChange={(open) => {
          setIsCallHistorySheetOpen(open)
          if (!open) {
            setLeadForCallHistory(null)
          }
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader className="text-left space-y-2">
            <SheetTitle className="text-2xl font-bold text-slate-900">Call History</SheetTitle>
            <SheetDescription className="text-sm text-slate-500">
              {leadForCallHistory ? `Viewing logs for ${leadForCallHistory.patientName}` : "Select a lead to see their call history."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 pb-10">
            {leadForCallHistory ? (
              <EnhancedCallLogsTable
                key={leadForCallHistory.id}
                leadId={leadForCallHistory.id}
                className="-mx-4 sm:mx-0"
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500">
                Select any lead to preview their complete call log timeline.
              </div>
            )}
          </div>
        </SheetContent>
        <SheetTrigger asChild>
          <span className="sr-only">Hidden trigger</span>
        </SheetTrigger>
      </Sheet>
    </div>
  )
}
