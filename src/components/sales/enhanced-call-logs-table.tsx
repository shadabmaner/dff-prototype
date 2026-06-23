"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  fetchCallLogs,
  type ApiCallLog,
  type ApiCallLogsResponse,
  type CallLogSummary,
} from "@/lib/call-desk-api"

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
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoreHorizontal,
  Phone,
  LucideCalendar,
  CalendarDays,
  Clock,
  User,
  MessageSquare,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

// ─── Outcome Display Config ───────────────────────────────────────────────────
const outcomeConfig: Record<string, { label: string; color: string; icon: any }> = {
  connected: { label: "Connected", color: "bg-emerald-50 text-emerald-700 ring-emerald-600/10", icon: CheckCircle },
  not_connected: { label: "Not Answered", color: "bg-amber-50 text-amber-700 ring-amber-600/10", icon: XCircle },
  busy: { label: "Busy", color: "bg-red-50 text-red-700 ring-red-600/10", icon: XCircle },
  wrong_number: { label: "Wrong Number", color: "bg-gray-50 text-gray-700 ring-gray-600/10", icon: AlertCircle },
  call_back_requested: { label: "Callback Requested", color: "bg-blue-50 text-blue-700 ring-blue-600/10", icon: Phone },
  not_interested: { label: "Not Interested", color: "bg-gray-50 text-gray-700 ring-gray-600/10", icon: XCircle },
  follow_up_required: { label: "Follow-up Required", color: "bg-indigo-50 text-indigo-700 ring-indigo-600/10", icon: Clock },
  interested: { label: "Interested", color: "bg-emerald-50 text-emerald-700 ring-emerald-600/10", icon: CheckCircle },
  converted: { label: "Converted", color: "bg-purple-50 text-purple-700 ring-purple-600/10", icon: CheckCircle },
  // legacy
  no_response: { label: "No Response", color: "bg-red-50 text-red-700 ring-red-600/10", icon: XCircle },
  call_back_later: { label: "Call Back Later", color: "bg-blue-50 text-blue-700 ring-blue-600/10", icon: Calendar },
  CONNECTED: { label: "Connected", color: "bg-emerald-50 text-emerald-700 ring-emerald-600/10", icon: CheckCircle },
  INTERESTED: { label: "Interested", color: "bg-emerald-50 text-emerald-700 ring-emerald-600/10", icon: CheckCircle },
  NOT_ANSWERED: { label: "Not Answered", color: "bg-amber-50 text-amber-700 ring-amber-600/10", icon: XCircle },
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CallLogStats {
  total: number
  connected: number
  notAnswered: number
  callbacks: number
  overdueFollowUps: number
  connectionRate: number
}

interface EnhancedCallLogsTableProps {
  /** If provided, render against this static data instead of fetching from API */
  data?: ApiCallLog[]
  /** Filter by specific lead */
  leadId?: string
  /** Called after a new call was logged (for refresh) */
  refreshKey?: number
  /** Optional custom class for the root wrapper */
  className?: string
  /** Surface stats to parent components */
  onStatsChange?: (stats: CallLogStats) => void
  /** Summary data from API */
  summaryData?: CallLogSummary
}

// ─── Column definitions ───────────────────────────────────────────────────────
const buildColumns = (): ColumnDef<ApiCallLog>[] => [
  {
    accessorKey: "called_at",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="font-semibold text-[13px] text-foreground">
          {formatDate(row.original.called_at, "MMM dd, yyyy")}
        </div>
        <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
          {formatDate(row.original.called_at, "hh:mm aa")}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "lead_name",
    header: "Lead",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center ring-1 ring-blue-500/20">
          <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="font-bold text-[13px] text-foreground tracking-tight leading-none mb-0.5">
            {row.original.lead_name || "Unknown Lead"}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono tracking-tighter uppercase">
            {row.original.phone}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "duration_seconds",
    header: "Duration",
    cell: ({ row }) => {
      const sec = row.original.duration_seconds
      if (!sec) return <div className="text-[12px] text-muted-foreground/40 italic">—</div>
      if (sec < 60) return <div className="text-[12px] font-bold text-foreground">&lt;1 min</div>
      const mins = Math.round(sec / 60)
      return <div className="text-[12px] font-bold text-foreground tabular-nums">{mins} min</div>
    },
  },
  {
    accessorKey: "outcome",
    header: "Outcome",
    cell: ({ row }) => {
      const outcome = row.original.outcome ?? ""
      const config = outcomeConfig[outcome] || {
        label: outcome || "—",
        color: "bg-gray-100 text-gray-700",
        icon: AlertCircle,
      }
      const Icon = config.icon
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0 h-5 border-none ring-1 ring-inset",
            config.color
          )}
        >
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="max-w-[260px]">
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
          {row.original.notes || <span className="italic opacity-40">No notes</span>}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "follow_up_date",
    header: "Callback",
    cell: ({ row }) => {
      const d = row.original.follow_up_date
      if (!d) return <div className="text-[12px] text-muted-foreground/30 font-medium italic">None</div>
      const isPast = new Date(d) < new Date()
      return (
        <div className="flex flex-col gap-0.5">
          <div className={cn("font-bold text-[12px]", isPast ? "text-red-500" : "text-primary")}>
            {formatDate(d, "MMM dd, yyyy")}
            {isPast && <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Overdue</span>}
          </div>
          <div className="text-[10px] text-muted-foreground font-bold tracking-tight">
            {formatDate(d, "hh:mm aa")}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "assignee_name",
    header: "Called By",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center ring-1 ring-border/50">
          <User className="h-2.5 w-2.5 text-muted-foreground" />
        </div>
        <span className="text-[12px] font-bold text-foreground tracking-tight">
          {row.original.caller_name || row.original.telecaller_email || "Current User"}
        </span>
      </div>
    ),
  },
  {
    id: "attempt_count",
    header: "Calls Attempted",
    cell: ({ row }) => {
      // Calculate attempt count from the data or use a default
      const count = 1 // Default to 1 for now, can be calculated from data later
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center ring-1 ring-blue-200">
            <Phone className="h-3 w-3 text-blue-600" />
          </div>
          <span className="text-[12px] font-bold text-foreground tabular-nums">{count}</span>
        </div>
      )
    },
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <Button variant="ghost" size="sm">
  //       <MoreHorizontal className="h-4 w-4" />
  //     </Button>
  //   ),
  // },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function EnhancedCallLogsTable({
  data: staticData,
  leadId,
  refreshKey,
  className,
  onStatsChange,
  summaryData,
}: EnhancedCallLogsTableProps) {
  const [apiData, setApiData] = React.useState<ApiCallLog[]>([])
  const [apiSummary, setApiSummary] = React.useState<CallLogSummary | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [totalLogs, setTotalLogs] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)

  const [searchTerm, setSearchTerm] = React.useState("")
  const [outcomeFilter, setOutcomeFilter] = React.useState<string>("all")
  const [telecallerFilter, setTelecallerFilter] = React.useState<string>("all")
  const [telecallers, setTelecallers] = React.useState<any[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [dateFilter, setDateFilter] = React.useState<string>("")
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date } | undefined>(undefined)
  const [clientPagination, setClientPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [paginationMeta, setPaginationMeta] = React.useState<ApiCallLogsResponse["meta"] | null>(null)
  
  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to })
    } else {
      setDateRange(undefined)
    }
  }

  // Trim search term to handle leading and trailing spaces
  const trimmedSearchTerm = searchTerm.trim()

  const isStaticMode = !!staticData
  const displayData = React.useMemo(() => {
    const source = isStaticMode ? staticData ?? [] : apiData
    return [...source].sort((a, b) => new Date(b.called_at).getTime() - new Date(a.called_at).getTime())
  }, [apiData, isStaticMode, staticData])

  // Load telecallers list for filter
  const loadTelecallers = React.useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/sales/telecallers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      const data = await res.json();
      setTelecallers(data);
    } catch (e) { console.error("Failed to load telecallers", e); }
  }, []);

  const loadCallLogs = React.useCallback(async () => {
    if (isStaticMode) return
    setIsLoading(true)
    setError(null)
    try {
      const limit = pageSize
      // Calculate date range for API
      let startDate: string | undefined
      let endDate: string | undefined
      
      if (dateFilter === "today") {
        const today = new Date()
        startDate = today.toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
      } else if (dateFilter === "last7days") {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        startDate = sevenDaysAgo.toISOString().split('T')[0]
        endDate = new Date().toISOString().split('T')[0]
      } else if (dateFilter === "last1month") {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        startDate = oneMonthAgo.toISOString().split('T')[0]
        endDate = new Date().toISOString().split('T')[0]
      } else if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
        startDate = dateRange.from.toISOString().split('T')[0]
        endDate = dateRange.to.toISOString().split('T')[0]
      }

      const res = await fetchCallLogs({
        page: currentPage,
        limit,
        leadId,
        outcome: outcomeFilter !== "all" ? outcomeFilter : undefined,
        telecallerId: telecallerFilter !== "all" ? telecallerFilter : undefined,
        search: trimmedSearchTerm || undefined,
        startDate,
        endDate,
      })

      if (!res || !res.data) {
        throw new Error("Invalid API response structure")
      }

      // Extract summary from the last item in data array if it exists
      const lastItem = res.data[res.data.length - 1]
      const summary = 'summary' in lastItem ? lastItem.summary : null
      const callLogsData = 'summary' in lastItem ? res.data.slice(0, -1) as ApiCallLog[] : res.data as ApiCallLog[]

      const pagination = res.meta
      const resolvedTotal = pagination?.total ?? callLogsData.length ?? 0
      const resolvedLimit = pagination?.limit ?? limit

      setApiData(callLogsData)
      setApiSummary(summary)
      setTotalLogs(resolvedTotal)
      setPaginationMeta(pagination ?? null)
      if (typeof resolvedLimit === "number" && resolvedLimit > 0) {
        setPageSize(resolvedLimit)
      }
      if (pagination?.page) {
        setCurrentPage(pagination.page)
      }
    } catch (err: any) {
      console.error("Call logs fetch error:", err)
      setError(err.message ?? "Failed to load call logs")
    } finally {
      setIsLoading(false)
    }
  }, [isStaticMode, currentPage, leadId, outcomeFilter, telecallerFilter, trimmedSearchTerm, dateFilter, dateRange, pageSize])

  React.useEffect(() => {
    loadCallLogs()
    if (!isStaticMode) loadTelecallers()
  }, [loadCallLogs, isStaticMode, loadTelecallers, refreshKey])

  // Client-side filter for static data
  const filteredData = React.useMemo(() => {
    if (!isStaticMode) return displayData
    return displayData.filter((call) => {
      const matchesSearch =
        trimmedSearchTerm === "" ||
        (call.lead_name ?? "").toLowerCase().includes(trimmedSearchTerm.toLowerCase()) ||
        (call.notes ?? "").toLowerCase().includes(trimmedSearchTerm.toLowerCase()) ||
        (call.lead_id ?? "").toLowerCase().includes(trimmedSearchTerm.toLowerCase())
      const matchesOutcome = outcomeFilter === "all" || call.outcome === outcomeFilter
      
      // Date filtering logic
      const callDate = new Date(call.created_at)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let matchesDate = true
      if (dateFilter === "today") {
        const todayStart = new Date(today)
        const todayEnd = new Date(today)
        todayEnd.setHours(23, 59, 59, 999)
        matchesDate = callDate >= todayStart && callDate <= todayEnd
      } else if (dateFilter === "last7days") {
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        matchesDate = callDate >= sevenDaysAgo
      } else if (dateFilter === "last1month") {
        const oneMonthAgo = new Date(today)
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        matchesDate = callDate >= oneMonthAgo
      } else if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        matchesDate = callDate >= fromDate && callDate <= toDate
      }
      
      return matchesSearch && matchesOutcome && matchesDate
    })
  }, [isStaticMode, displayData, trimmedSearchTerm, outcomeFilter, dateFilter, dateRange])

  const columns = React.useMemo(() => buildColumns(), [])

  const derivedTotalPages = React.useMemo(() => {
    if (isStaticMode) return Math.max(1, Math.ceil(filteredData.length / clientPagination.pageSize))
    if (paginationMeta?.totalPages) return paginationMeta.totalPages
    return Math.max(1, Math.ceil((totalLogs || 0) / pageSize))
  }, [filteredData.length, isStaticMode, clientPagination.pageSize, paginationMeta, totalLogs, pageSize])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(isStaticMode ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    manualPagination: !isStaticMode,
    pageCount: isStaticMode ? undefined : derivedTotalPages,
    state: isStaticMode ? { pagination: clientPagination } : undefined,
    onPaginationChange: isStaticMode ? setClientPagination : undefined,
  })

  const paginationSummary = React.useMemo(() => {
    if (isStaticMode) {
      const start = filteredData.length === 0 ? 0 : (clientPagination.pageIndex * clientPagination.pageSize) + 1
      const end = filteredData.length === 0 ? 0 : Math.min(filteredData.length, start + table.getRowModel().rows.length - 1)
      return { start, end, total: filteredData.length }
    }
    const total = totalLogs
    if (total === 0) return { start: 0, end: 0, total: 0 }
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(total, start + apiData.length - 1)
    return { start, end, total }
  }, [apiData.length, currentPage, filteredData.length, isStaticMode, pageSize, table, totalLogs])

  // Statistics
  const stats = React.useMemo<CallLogStats>(() => {
    // Use API summary data if available, otherwise fall back to client-side calculation
    if (apiSummary && !isStaticMode) {
      const connectionRate = apiSummary.totalCalls > 0 ? (apiSummary.connected / apiSummary.totalCalls) * 100 : 0
      return {
        total: apiSummary.totalCalls,
        connected: apiSummary.connected,
        notAnswered: apiSummary.notConnected,
        callbacks: apiSummary.followUps,
        overdueFollowUps: apiSummary.overdueFollowUps,
        connectionRate
      }
    }

    // Fallback to client-side calculation
    const all = isStaticMode ? filteredData : apiData
    const total = isStaticMode ? filteredData.length : totalLogs
    const connected = all.filter(c => (c.outcome ?? "").toLowerCase() === "connected").length
    const notAnswered = all.filter(c => ["not_connected", "no_answer"].includes((c.outcome ?? "").toLowerCase())).length
    const callbacks = all.filter(c => (c.outcome ?? "").toLowerCase() === "call_back_requested").length
    const overdueFollowUps = all.filter(c => {
      if (!c.follow_up_date) return false
      return new Date(c.follow_up_date) < new Date()
    }).length
    const connectionRate = all.length > 0 ? (connected / all.length) * 100 : 0
    return { total, connected, notAnswered, callbacks, overdueFollowUps, connectionRate }
  }, [isStaticMode, filteredData, apiData, totalLogs, apiSummary])

  React.useEffect(() => {
    if (onStatsChange) {
      onStatsChange(stats)
    }
  }, [onStatsChange, stats])

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Statistics Cards - Now displayed in parent page */}
      {/* 
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total Calls", value: stats.total, icon: Phone, color: "primary" },
          { label: "Connected", value: stats.connected, icon: CheckCircle, color: "emerald" },
          { label: "Not Connected", value: stats.notAnswered, icon: XCircle, color: "amber" },
          { label: "Follow-ups", value: stats.callbacks, icon: Clock, color: "primary" },
          {
            label: "Overdue Follow-ups",
            value: stats.overdueFollowUps,
            icon: AlertCircle,
            color: "purple",
          },
        ].map((stat) => {
          const Icon = stat.icon
          const colorMap: Record<string, string> = {
            primary: "bg-primary/10 ring-primary/20 text-primary",
            emerald: "bg-emerald-50 ring-emerald-500/20 text-emerald-600",
            amber: "bg-amber-50 ring-amber-500/20 text-amber-600",
            purple: "bg-purple-50 ring-purple-500/20 text-purple-600",
          }
          const valueColorMap: Record<string, string> = {
            primary: "text-primary",
            emerald: "text-emerald-500",
            amber: "text-amber-500",
            purple: "text-purple-500",
          }
          return (
            <Card key={stat.label} className="fresh-card card-hover">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className={cn("text-xl font-bold tracking-tight", valueColorMap[stat.color])}>{stat.value}</p>
                </div>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center ring-1", colorMap[stat.color])}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      */}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, mobile number or email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (!isStaticMode) setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>

        <select
          value={outcomeFilter}
          onChange={(e) => {
            setOutcomeFilter(e.target.value)
            if (!isStaticMode) setCurrentPage(1)
          }}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <option value="all">All outcomes</option>
          <option value="connected">Connected</option>
          <option value="not_connected">Not Connected</option>
          <option value="interested">Interested</option>
          <option value="not_interested">Not Interested</option>
          <option value="follow_up_required">Follow-up Required</option>
        </select>

        {/* {!isStaticMode && (
          <select
            value={telecallerFilter}
            onChange={(e) => {
              setTelecallerFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm max-w-[180px]"
          >
            <option value="all">All Telecallers</option>
            {telecallers.map((t) => (
              <option key={t.id} value={t.id}>{t.name || t.email}</option>
            ))}
          </select>
        )} */}

      

        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value)
            if (!isStaticMode) setCurrentPage(1)
          }}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <option value="">All Dates</option>
          <option value="today">Today</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last1month">Last 1 Month</option>
          <option value="custom">Custom Range</option>
        </select>

        {dateFilter === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {formatDate(dateRange.from, "LLL dd, y")} - {formatDate(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    formatDate(dateRange.from, "LLL dd, y")
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
                className="rounded-md"
              />
              <div className="p-3 border-t">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (dateRange?.from && dateRange?.to) {
                      if (!isStaticMode) setCurrentPage(1)
                    }
                  }}
                  disabled={!dateRange?.from || !dateRange?.to}
                >
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {trimmedSearchTerm && (
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <span>Search: {trimmedSearchTerm}</span>
            <button
              onClick={() => {
                setSearchTerm("")
                if (!isStaticMode) setCurrentPage(1)
              }}
              className="ml-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        {outcomeFilter !== "all" && (
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <span>Outcome: {outcomeFilter === "connected" ? "Connected" : outcomeFilter === "not_connected" ? "Not Connected" : outcomeFilter === "interested" ? "Interested" : outcomeFilter === "not_interested" ? "Not Interested" : "Follow-up Required"}</span>
            <button
              onClick={() => {
                setOutcomeFilter("all")
                if (!isStaticMode) setCurrentPage(1)
              }}
              className="ml-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        {dateFilter && (
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <span>Date: {dateFilter === "today" ? "Today" : dateFilter === "last7days" ? "Last 7 Days" : dateFilter === "last1month" ? "Last 1 Month" : dateFilter === "custom" && dateRange?.from && dateRange?.to ? `${formatDate(dateRange.from, "MMM dd")} - ${formatDate(dateRange.to, "MMM dd")}` : "All Dates"}</span>
            <button
              onClick={() => {
                setDateFilter("")
                setDateRange(undefined)
                if (!isStaticMode) setCurrentPage(1)
              }}
              className="ml-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        {(searchTerm || outcomeFilter !== "all" || dateFilter) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setOutcomeFilter("all")
              setDateFilter("")
              setDateRange(undefined)
              if (!isStaticMode) setCurrentPage(1)
            }}
            className="h-7 rounded-full border-slate-200 text-xs"
          >
            Reset All
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={loadCallLogs} className="ml-auto">Retry</Button>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        {/* <div className="border-b border-slate-100/80 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Call log registry</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Conversation outcomes and callbacks</p>
            </div>
            <Badge variant="outline" className="w-fit rounded-full border-slate-200/80 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              {paginationSummary.total} records
            </Badge>
          </div>
        </div> */}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-slate-500">Loading call logs…</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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
                      <Phone className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">No call logs found</p>
                      <p className="mt-1 text-sm text-slate-500">Logged conversations and callbacks will appear here.</p>
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
        <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:gap-4">
          <span>
            {isStaticMode ? (
              paginationSummary.total === 0 ? (
                "No call logs to display"
              ) : (
                <>
                  Showing {paginationSummary.start}-{paginationSummary.end} of {paginationSummary.total} call logs
                  <span className="ml-2">
                    (Page {clientPagination.pageIndex + 1} of {Math.max(1, Math.ceil(paginationSummary.total / clientPagination.pageSize))})
                  </span>
                </>
              )
            ) : paginationMeta ? (
              paginationMeta.total === 0 ? (
                "No call logs to display"
              ) : (
                <>
                  Showing {apiData.length} of {paginationMeta.total} call logs
                  {paginationMeta.totalPages > 0 && (
                    <span className="ml-2">(Page {paginationMeta.page} of {paginationMeta.totalPages})</span>
                  )}
                </>
              )
            ) : (
              "Loading pagination..."
            )}
          </span>
          <div className="flex items-center gap-2">
            <span>Per page</span>
            <Select
              value={`${isStaticMode ? clientPagination.pageSize : pageSize}`}
              onValueChange={(value) => {
                const nextSize = Number(value)
                if (isStaticMode) {
                  setClientPagination((prev) => ({ ...prev, pageSize: nextSize, pageIndex: 0 }))
                } else {
                  setPageSize(nextSize)
                  setCurrentPage(1)
                }
              }}
            >
              <SelectTrigger className="h-8 w-[80px] rounded-full border-slate-200/80 bg-white">
                <SelectValue placeholder={isStaticMode ? clientPagination.pageSize : pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={`call-log-page-size-${size}`} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStaticMode ? (
            <>
              <Button variant="outline" size="sm" className="rounded-full border-slate-200/80 px-4" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-slate-200/80 px-4" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!paginationMeta?.hasPrev || isLoading}
                className="rounded-full border-slate-200/80 px-4"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <span>Page</span>
                <span className="font-medium text-slate-900">{paginationMeta?.page ?? currentPage}</span>
                <span>of {derivedTotalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!paginationMeta?.hasNext || isLoading}
                className="rounded-full border-slate-200/80 px-4"
              >
                Next
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
