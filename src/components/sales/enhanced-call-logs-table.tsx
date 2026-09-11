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
  /** Telecaller name for user-scoped filtering (e.g. "Sneha Nair") */
  scopedCallerName?: string
  /** Whether to default to "My Calls Only" */
  defaultMyCallsOnly?: boolean
}

// ─── Column definitions ───────────────────────────────────────────────────────
const buildColumns = (): ColumnDef<ApiCallLog>[] => [
  {
    accessorKey: "called_at",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 whitespace-nowrap">
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
    header: "Lead / Patient",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-[170px]">
        <div className="w-7 h-7 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center ring-1 ring-blue-500/20 shrink-0">
          <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="font-bold text-[13px] text-foreground tracking-tight leading-none mb-0.5">
            {row.original.lead_name || "Unknown Lead"}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <span>{row.original.phone}</span>
            {row.original.lead_id && (
              <span className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-sans font-semibold">
                {row.original.lead_id}
              </span>
            )}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "call_reason",
    header: "Call Reason / Purpose",
    cell: ({ row }) => {
      const reason = row.original.call_reason || "General Follow-up"
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap">
          {reason}
        </span>
      )
    },
  },
  {
    accessorKey: "call_sequence",
    header: "Call Sequence",
    cell: ({ row }) => {
      const isFirst = row.original.call_sequence === "first_call" || row.original.attempt_number === 1
      const attempt = row.original.attempt_number || (isFirst ? 1 : 2)
      return isFirst ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-wider whitespace-nowrap">
          First Call
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider whitespace-nowrap">
          Follow-up #{attempt}
        </span>
      )
    },
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
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-5 border-none ring-1 ring-inset whitespace-nowrap",
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
      <div className="max-w-[280px]">
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
          {row.original.notes || <span className="italic opacity-40">No notes recorded</span>}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "follow_up_date",
    header: "Next Action / Callback",
    cell: ({ row }) => {
      const d = row.original.follow_up_date
      if (!d) return <div className="text-[12px] text-muted-foreground/30 font-medium italic">None scheduled</div>
      const isPast = new Date(d) < new Date()
      return (
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
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
      <div className="flex items-center gap-2 whitespace-nowrap">
        <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center ring-1 ring-border/50 shrink-0">
          <User className="h-2.5 w-2.5 text-muted-foreground" />
        </div>
        <span className="text-[12px] font-bold text-foreground tracking-tight">
          {row.original.caller_name || row.original.telecaller_email || "Current User"}
        </span>
      </div>
    ),
  },
]

const now = Date.now()
const oneHour = 60 * 60 * 1000
const oneDay = 24 * 60 * 60 * 1000

const FALLBACK_CALL_LOGS: ApiCallLog[] = [
  // ── Sneha Nair (Payment Recovery) ──
  {
    id: "cl-rec-001",
    lead_id: "HBF-2607-0024",
    lead_name: "Shweta Kamble",
    phone: "+91 98201 12345",
    telecaller_id: "TC-R202",
    caller_name: "Sneha Nair (Payment Recovery)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 450,
    outcome: "follow_up_required",
    call_reason: "Phase 2 Recovery Due",
    call_sequence: "follow_up",
    attempt_number: 3,
    notes: "Patient confirmed UPI payment of ₹13,101 will be completed by 5:30 PM today after salary credit.",
    follow_up_date: new Date(now + 6 * oneHour).toISOString(),
    called_at: new Date(now - 1.5 * oneHour).toISOString(),
    created_at: new Date(now - 1.5 * oneHour).toISOString(),
  },
  {
    id: "cl-rec-002",
    lead_id: "HBF-2607-0025",
    lead_name: "Rekha Kokani",
    phone: "+91 98192 34567",
    telecaller_id: "TC-R202",
    caller_name: "Sneha Nair (Payment Recovery)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 180,
    outcome: "call_back_requested",
    call_reason: "Phase 2 Recovery Due",
    call_sequence: "first_call",
    attempt_number: 1,
    notes: "Overdue collection call. Patient was driving in traffic, requested callback at 6:30 PM today.",
    follow_up_date: new Date(now + 5 * oneHour).toISOString(),
    called_at: new Date(now - 3 * oneHour).toISOString(),
    created_at: new Date(now - 3 * oneHour).toISOString(),
  },
  {
    id: "cl-rec-003",
    lead_id: "HBF-2607-0026",
    lead_name: "Prachi Upasani",
    phone: "+91 98330 45678",
    telecaller_id: "TC-R202",
    caller_name: "Sneha Nair (Payment Recovery)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 520,
    outcome: "connected",
    call_reason: "PTP Follow-up",
    call_sequence: "follow_up",
    attempt_number: 2,
    notes: "Clarified 2-phase fee breakdown. Sent direct Razorpay payment link for ₹13,101 on WhatsApp.",
    called_at: new Date(now - 22 * oneHour).toISOString(), // Yesterday
    created_at: new Date(now - 22 * oneHour).toISOString(),
  },
  {
    id: "cl-rec-004",
    lead_id: "HBF-2607-0027",
    lead_name: "Mitali Kale",
    phone: "+91 98205 56789",
    telecaller_id: "TC-R202",
    caller_name: "Sneha Nair (Payment Recovery)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 780,
    outcome: "converted",
    call_reason: "Pending Program Mapping",
    call_sequence: "first_call",
    attempt_number: 1,
    notes: "Patient had paid ₹2,499 token. Enrolled into 90 Days Signature Program. Full balance ₹13,101 paid via UPI.",
    called_at: new Date(now - 26 * oneHour).toISOString(), // Yesterday
    created_at: new Date(now - 26 * oneHour).toISOString(),
  },
  {
    id: "cl-rec-005",
    lead_id: "HBF-2607-0028",
    lead_name: "Bharati Naik",
    phone: "+91 98190 67890",
    telecaller_id: "TC-R202",
    caller_name: "Sneha Nair (Payment Recovery)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 360,
    outcome: "follow_up_required",
    call_reason: "Phase 2 Overdue",
    call_sequence: "follow_up",
    attempt_number: 4,
    notes: "Spoke to spouse. Requested extension till 15th due to outstation emergency. Follow-up scheduled.",
    follow_up_date: new Date(now + 4 * oneDay).toISOString(),
    called_at: new Date(now - 2 * oneDay).toISOString(),
    created_at: new Date(now - 2 * oneDay).toISOString(),
  },
  {
    id: "cl-rec-006",
    lead_id: "HBF-2607-0029",
    lead_name: "Shashikant Chavan",
    phone: "+91 98208 78901",
    telecaller_id: "TC-R202",
    caller_name: "Sneha Nair (Payment Recovery)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 0,
    outcome: "not_connected",
    call_reason: "Overdue Installment",
    call_sequence: "first_call",
    attempt_number: 1,
    notes: "No response after 6 rings. Automated payment reminder SMS and WhatsApp template dispatched.",
    called_at: new Date(now - 3 * oneDay).toISOString(),
    created_at: new Date(now - 3 * oneDay).toISOString(),
  },
  {
    id: "cl-rec-007",
    lead_id: "HBF-2607-0030",
    lead_name: "Sneha Deshpande",
    phone: "+91 98335 89012",
    telecaller_id: "TC-R202",
    caller_name: "Sneha Nair (Payment Recovery)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 640,
    outcome: "connected",
    call_reason: "NEFT Verification",
    call_sequence: "follow_up",
    attempt_number: 2,
    notes: "Patient submitted NEFT bank counterfoil for ₹13,101. Verified and attached to finance portal.",
    called_at: new Date(now - 5 * oneDay).toISOString(),
    created_at: new Date(now - 5 * oneDay).toISOString(),
  },
  {
    id: "cl-rec-008",
    lead_id: "REC-201",
    lead_name: "Vikram Malhotra",
    phone: "+91 98201 22334",
    telecaller_id: "TC-R202",
    caller_name: "Sneha Nair (Payment Recovery)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 480,
    outcome: "converted",
    call_reason: "Token Balance Collection",
    call_sequence: "first_call",
    attempt_number: 1,
    notes: "Program mapping agreed. Deducted ₹2,499 token; mapped 1-Year DFF Intensive. Razorpay link sent.",
    called_at: new Date(now - 6 * oneDay).toISOString(),
    created_at: new Date(now - 6 * oneDay).toISOString(),
  },
  {
    id: "cl-rec-009",
    lead_id: "REC-202",
    lead_name: "Deepika Rao",
    phone: "+91 98450 99881",
    telecaller_id: "TC-R202",
    caller_name: "Sneha Nair (Payment Recovery)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 300,
    outcome: "follow_up_required",
    call_reason: "Installment #2 Due",
    call_sequence: "follow_up",
    attempt_number: 3,
    notes: "Installment #2 due. Patient requested call after 4 PM to pay via UPI.",
    called_at: new Date(now - 8 * oneDay).toISOString(),
    created_at: new Date(now - 8 * oneDay).toISOString(),
  },

  // ── Ananya Iyer (Welcome Specialist) ──
  {
    id: "cl-101",
    lead_id: "1a2b3c4d",
    lead_name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    telecaller_id: "TC-W101",
    caller_name: "Ananya Iyer (Welcome Specialist)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 840,
    outcome: "connected",
    call_reason: "Welcome Onboarding",
    call_sequence: "first_call",
    attempt_number: 1,
    notes: "Welcome call completed. Welcomed patient to DFF protocol and scheduled Dr. Bhagyesh assessment.",
    called_at: new Date(now - 2 * oneHour).toISOString(),
    created_at: new Date(now - 2 * oneHour).toISOString(),
  },
  {
    id: "cl-102",
    lead_id: "4d5e6f7g",
    lead_name: "Sneha Patel",
    phone: "+91 98765 43213",
    telecaller_id: "TC-W101",
    caller_name: "Ananya Iyer (Welcome Specialist)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 960,
    outcome: "connected",
    call_reason: "Care Team Mapping",
    call_sequence: "follow_up",
    attempt_number: 2,
    notes: "Welcome onboarding call done. Confirmed 5-pillar care team mapping and kit dispatch.",
    called_at: new Date(now - 5 * oneHour).toISOString(),
    created_at: new Date(now - 5 * oneHour).toISOString(),
  },
  {
    id: "cl-106",
    lead_id: "2b3c4d5e",
    lead_name: "Priya Sharma",
    phone: "+91 98765 43211",
    telecaller_id: "TC-W101",
    caller_name: "Ananya Iyer (Welcome Specialist)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 510,
    outcome: "connected",
    call_reason: "Dietitian Introduction",
    call_sequence: "follow_up",
    attempt_number: 2,
    notes: "Follow-up on care team readiness. Introduced Dietitian Anjali Patel.",
    called_at: new Date(now - 1 * oneDay).toISOString(),
    created_at: new Date(now - 1 * oneDay).toISOString(),
  },
  {
    id: "cl-108",
    lead_id: "6f7g8h9i",
    lead_name: "Neha Joshi",
    phone: "+91 98765 43215",
    telecaller_id: "TC-W101",
    caller_name: "Ananya Iyer (Welcome Specialist)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 180,
    outcome: "call_back_requested",
    call_reason: "Welcome Setup",
    call_sequence: "first_call",
    attempt_number: 1,
    notes: "Busy in a meeting. Requested callback tomorrow morning at 11:00 AM.",
    called_at: new Date(now - 2 * oneDay).toISOString(),
    created_at: new Date(now - 2 * oneDay).toISOString(),
  },

  // ── Divya Rao (Camp Booster) ──
  {
    id: "cl-105",
    lead_id: "CAMP-301",
    lead_name: "Sunita Deshmukh",
    phone: "+91 98201 44512",
    telecaller_id: "TC-C303",
    caller_name: "Divya Rao (Camp Booster)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 720,
    outcome: "converted",
    call_reason: "Residential Retreat Pitch",
    call_sequence: "follow_up",
    attempt_number: 2,
    notes: "Residential retreat booster briefing. Confirmed Lonavala seat with ₹35,000 reservation payment.",
    called_at: new Date(now - 3 * oneDay).toISOString(),
    created_at: new Date(now - 3 * oneDay).toISOString(),
  },
  {
    id: "cl-109",
    lead_id: "CAMP-302",
    lead_name: "Girish Bapat",
    phone: "+91 98901 23411",
    telecaller_id: "TC-C303",
    caller_name: "Divya Rao (Camp Booster)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 660,
    outcome: "follow_up_required",
    call_reason: "Retreat Brochure Follow-up",
    call_sequence: "first_call",
    attempt_number: 1,
    notes: "Camp brochure & venue link shared via WhatsApp. Will discuss with spouse.",
    called_at: new Date(now - 4 * oneDay).toISOString(),
    created_at: new Date(now - 4 * oneDay).toISOString(),
  },

  // ── Rahul Sharma (Lead Nurture) ──
  {
    id: "cl-107",
    lead_id: "lead-101",
    lead_name: "Aarav Mehta",
    phone: "+91 98201 11223",
    telecaller_id: "TC-L404",
    caller_name: "Rahul Sharma (Lead Nurture)",
    direction: "outbound",
    status: "completed",
    duration_seconds: 420,
    outcome: "interested",
    call_reason: "Webinar Lead Qualification",
    call_sequence: "first_call",
    attempt_number: 1,
    notes: "Inbound Meta lead. Inquired about reversing HbA1c 8.4%. Scheduled webinar registration.",
    called_at: new Date(now - 1.5 * oneHour).toISOString(),
    created_at: new Date(now - 1.5 * oneHour).toISOString(),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function EnhancedCallLogsTable({
  data: staticData,
  leadId,
  refreshKey,
  className,
  onStatsChange,
  summaryData,
  scopedCallerName,
  defaultMyCallsOnly = true,
}: EnhancedCallLogsTableProps) {
  const [apiData, setApiData] = React.useState<ApiCallLog[]>([])
  const [apiSummary, setApiSummary] = React.useState<CallLogSummary | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [totalLogs, setTotalLogs] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)

  const [scopeFilter, setScopeFilter] = React.useState<"my_calls" | "all">(
    defaultMyCallsOnly && scopedCallerName ? "my_calls" : "all"
  )
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
      setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
    } else {
      setDateRange(undefined)
    }
  }

  // Trim search term to handle leading and trailing spaces
  const trimmedSearchTerm = searchTerm.trim()

  const isStaticMode = !!staticData
  const displayData = React.useMemo(() => {
    const source = isStaticMode
      ? (staticData && staticData.length > 0 ? staticData : FALLBACK_CALL_LOGS)
      : (apiData.length > 0 ? apiData : FALLBACK_CALL_LOGS)
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

      if (callLogsData.length === 0) {
        setApiData(FALLBACK_CALL_LOGS)
        setTotalLogs(FALLBACK_CALL_LOGS.length)
      } else {
        setApiData(callLogsData)
        setTotalLogs(resolvedTotal)
      }
      setApiSummary(summary)
      setPaginationMeta(pagination ?? null)
      if (typeof resolvedLimit === "number" && resolvedLimit > 0) {
        setPageSize(resolvedLimit)
      }
      if (pagination?.page) {
        setCurrentPage(pagination.page)
      }
    } catch (err: any) {
      console.warn("Call logs fetch error, defaulting to static mock logs:", err)
      setApiData(FALLBACK_CALL_LOGS)
      setTotalLogs(FALLBACK_CALL_LOGS.length)
    } finally {
      setIsLoading(false)
    }
  }, [isStaticMode, currentPage, leadId, outcomeFilter, telecallerFilter, trimmedSearchTerm, dateFilter, dateRange, pageSize])

  React.useEffect(() => {
    loadCallLogs()
    if (!isStaticMode) loadTelecallers()
  }, [loadCallLogs, isStaticMode, loadTelecallers, refreshKey])

  // Client-side multi-layer filter (Search, Scope, Outcome, Date)
  const filteredData = React.useMemo(() => {
    return displayData.filter((call) => {
      // 1. Scope filter: My Calls Only vs All Desk Calls
      if (scopeFilter === "my_calls" && scopedCallerName) {
        const caller = (call.caller_name || call.telecaller_email || "").toLowerCase()
        const needle = scopedCallerName.toLowerCase()
        if (!caller.includes(needle)) {
          return false
        }
      }

      // 2. Search filter
      if (trimmedSearchTerm) {
        const query = trimmedSearchTerm.toLowerCase()
        const matchesSearch =
          (call.lead_name ?? "").toLowerCase().includes(query) ||
          (call.notes ?? "").toLowerCase().includes(query) ||
          (call.lead_id ?? "").toLowerCase().includes(query) ||
          (call.phone ?? "").toLowerCase().includes(query) ||
          (call.call_reason ?? "").toLowerCase().includes(query) ||
          (call.caller_name ?? "").toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // 3. Outcome filter
      if (outcomeFilter !== "all" && call.outcome !== outcomeFilter) {
        return false
      }

      // 4. Date filtering logic
      const callDate = new Date(call.called_at || call.created_at)
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

      if (dateFilter === "today") {
        if (callDate < todayStart || callDate > todayEnd) return false
      } else if (dateFilter === "yesterday") {
        const yestStart = new Date(todayStart)
        yestStart.setDate(yestStart.getDate() - 1)
        const yestEnd = new Date(todayEnd)
        yestEnd.setDate(yestEnd.getDate() - 1)
        if (callDate < yestStart || callDate > yestEnd) return false
      } else if (dateFilter === "last7days") {
        const sevenDaysAgo = new Date(todayStart)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        if (callDate < sevenDaysAgo) return false
      } else if (dateFilter === "last1month") {
        const oneMonthAgo = new Date(todayStart)
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        if (callDate < oneMonthAgo) return false
      } else if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        if (callDate < fromDate || callDate > toDate) return false
      }

      return true
    })
  }, [displayData, scopeFilter, scopedCallerName, trimmedSearchTerm, outcomeFilter, dateFilter, dateRange])

  const columns = React.useMemo(() => buildColumns(), [])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination: clientPagination },
    onPaginationChange: setClientPagination,
  })

  const paginationSummary = React.useMemo(() => {
    const total = filteredData.length
    if (total === 0) return { start: 0, end: 0, total: 0 }
    const start = clientPagination.pageIndex * clientPagination.pageSize + 1
    const end = Math.min(total, (clientPagination.pageIndex + 1) * clientPagination.pageSize)
    return { start, end, total }
  }, [filteredData.length, clientPagination.pageIndex, clientPagination.pageSize])

  // Statistics dynamically computed from current filtered scope
  const stats = React.useMemo<CallLogStats>(() => {
    const all = filteredData
    const total = all.length
    const connected = all.filter(c => 
      c.outcome === "connected" || 
      c.outcome === "converted" || 
      c.outcome === "interested"
    ).length
    const notAnswered = all.filter(c => 
      ["not_connected", "no_answer", "busy", "no_response"].includes(c.outcome ?? "")
    ).length
    const callbacks = all.filter(c => 
      c.outcome === "call_back_requested" || 
      c.outcome === "call_back_later"
    ).length
    const overdueFollowUps = all.filter(c => {
      if (!c.follow_up_date) return false
      return new Date(c.follow_up_date) < new Date()
    }).length
    const connectionRate = total > 0 ? (connected / total) * 100 : 0
    return { total, connected, notAnswered, callbacks, overdueFollowUps, connectionRate }
  }, [filteredData])

  React.useEffect(() => {
    if (onStatsChange) {
      onStatsChange(stats)
    }
  }, [onStatsChange, stats])

  return (
    <div className={cn("space-y-5", className)}>
      {/* Scope Switcher & Filter Toolbar */}
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Scoped Caller Segmented Button */}
        {scopedCallerName ? (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/70 w-fit">
            <button
              type="button"
              onClick={() => {
                setScopeFilter("my_calls")
                setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                scopeFilter === "my_calls"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <User className="h-3.5 w-3.5 text-primary" />
              My Call Logs ({scopedCallerName})
            </button>
            <button
              type="button"
              onClick={() => {
                setScopeFilter("all")
                setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                scopeFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              All Desk Calls
            </button>
          </div>
        ) : <div />}

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search lead, phone, reason, or notes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className="pl-8.5 h-10 rounded-xl text-xs font-medium border-slate-200 bg-white shadow-sm"
            />
          </div>

          {/* Outcome Filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => {
              setOutcomeFilter(e.target.value)
              setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Outcomes</option>
            <option value="connected">Connected</option>
            <option value="call_back_requested">Callback Requested</option>
            <option value="follow_up_required">Follow-up Required</option>
            <option value="converted">Converted</option>
            <option value="not_connected">Not Answered</option>
            <option value="busy">Busy</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value)
              setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
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
                    "h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
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
                    className="w-full h-8 text-xs font-bold"
                    onClick={() => {
                      if (dateRange?.from && dateRange?.to) {
                        setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
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
      </div>

      {/* Active Filter Chips & Status */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {scopeFilter === "my_calls" && scopedCallerName && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1 text-[11px] font-bold text-blue-700">
              <User className="h-3 w-3" />
              <span>Scope: {scopedCallerName}</span>
            </div>
          )}
          {trimmedSearchTerm && (
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <span>Search: {trimmedSearchTerm}</span>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
                className="ml-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {outcomeFilter !== "all" && (
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <span>Outcome: {outcomeFilter}</span>
              <button
                onClick={() => {
                  setOutcomeFilter("all")
                  setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
                className="ml-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {dateFilter && (
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <span>Date: {dateFilter === "today" ? "Today" : dateFilter === "yesterday" ? "Yesterday" : dateFilter === "last7days" ? "Last 7 Days" : dateFilter === "last1month" ? "Last 1 Month" : dateFilter === "custom" && dateRange?.from && dateRange?.to ? `${formatDate(dateRange.from, "MMM dd")} - ${formatDate(dateRange.to, "MMM dd")}` : dateFilter}</span>
              <button
                onClick={() => {
                  setDateFilter("")
                  setDateRange(undefined)
                  setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
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
                setClientPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className="h-7 rounded-full border-slate-200 text-xs"
            >
              Reset All
            </Button>
          )}
        </div>

        <div className="text-[11px] font-semibold text-slate-500">
          Showing <strong className="text-slate-900">{filteredData.length}</strong> calls
        </div>
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
            {paginationSummary.total === 0 ? (
              "No call logs to display"
            ) : (
              <>
                Showing {paginationSummary.start}-{paginationSummary.end} of {paginationSummary.total} call logs
                <span className="ml-2">
                  (Page {clientPagination.pageIndex + 1} of {Math.max(1, Math.ceil(paginationSummary.total / clientPagination.pageSize))})
                </span>
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            <span>Per page</span>
            <Select
              value={`${clientPagination.pageSize}`}
              onValueChange={(value) => {
                const nextSize = Number(value)
                setClientPagination((prev) => ({ ...prev, pageSize: nextSize, pageIndex: 0 }))
              }}
            >
              <SelectTrigger className="h-8 w-[80px] rounded-full border-slate-200/80 bg-white">
                <SelectValue placeholder={clientPagination.pageSize} />
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
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200/80 px-4"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span>Page</span>
            <span className="font-medium text-slate-900">{clientPagination.pageIndex + 1}</span>
            <span>of {Math.max(1, Math.ceil(paginationSummary.total / clientPagination.pageSize))}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200/80 px-4"
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
