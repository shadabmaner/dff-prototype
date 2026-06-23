"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Filter,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

export type RefundStatus = "pending" | "approved" | "rejected"
export type RefundPriority = "low" | "medium" | "high"

export interface RefundRequest {
  id: string
  patientName: string
  patientId: string
  phone?: string
  requestDate: Date
  reason: string
  amount: number
  paymentMethod: string
  status: RefundStatus
  priority: RefundPriority
  planName?: string
  resolvedAt?: Date
  rejectionReason?: string
}

interface RefundRequestListProps {
  onApprove: (request: RefundRequest) => void
  onReject: (request: RefundRequest) => void
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const refunds: RefundRequest[] = []

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value?: Date | string) => {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
  } catch {
    return String(value)
  }
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)

const statusConfig: Record<RefundStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border border-amber-200",   icon: <Clock className="h-3 w-3" /> },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 border border-rose-200",     icon: <XCircle className="h-3 w-3" /> },
}

const priorityConfig: Record<RefundPriority, { label: string; className: string }> = {
  high:   { label: "High",   className: "bg-rose-50 text-rose-700 border border-rose-200" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  low:    { label: "Low",    className: "bg-slate-50 text-slate-600 border border-slate-200" },
}

const PAGE_SIZE = 6

// ─── Component ────────────────────────────────────────────────────────────────

export function RefundRequestList({ onApprove, onReject }: RefundRequestListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  // ── Stats ──
  const pendingCount   = refunds.filter((r) => r.status === "pending").length
const pendingAmount  = refunds.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0)
const approvedAmount = refunds.filter((r) => r.status === "approved").reduce((s, r) => s + r.amount, 0)
const highPriorityCount = refunds.filter((r) => r.priority === "high" && r.status === "pending").length

  // ── Filters ──
  const filtered = useMemo(() => {
  return refunds.filter((r) => {
    const matchesSearch   = r.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus   = statusFilter === "all"   || r.status === statusFilter
    const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })
}, [searchQuery, statusFilter, priorityFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Pending Requests</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{pendingCount}</p>
                <p className="text-xs text-amber-700/80 font-medium">Awaiting review</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">High Priority</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{highPriorityCount}</p>
                <p className="text-xs text-rose-700/80 font-medium">Need immediate action</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Approved Total</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{formatAmount(approvedAmount)}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Refunds processed</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                  <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-900 hover:to-slate-800 border-b-0">
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Patient</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Plan</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Reason</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Amount</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Requested</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Priority</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="font-medium">No refund requests found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((req) => {
                    const sCfg = statusConfig[req.status]
                    const pCfg = priorityConfig[req.priority]
                    const isPending = req.status === "pending"
                    return (
                      <TableRow key={req.id} className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors">
                        {/* Patient */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{req.patientName}</p>
                              <p className="text-xs text-slate-500">#{req.patientId.slice(-6)} · {req.phone ?? "No phone"}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Plan */}
                        <TableCell className="py-4">
                          <Badge variant="outline" className="border-slate-300 text-slate-700 font-medium max-w-[150px] truncate block">
                            {req.planName ?? "—"}
                          </Badge>
                        </TableCell>

                        {/* Reason */}
                        <TableCell className="py-4 max-w-[200px]">
                          <p className="text-sm text-slate-700 truncate" title={req.reason}>{req.reason}</p>
                          {req.rejectionReason && (
                            <p className="text-xs text-rose-500 mt-0.5 truncate" title={req.rejectionReason}>
                              ↳ {req.rejectionReason}
                            </p>
                          )}
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-bold text-slate-900">{formatAmount(req.amount)}</p>
                          </div>
                          <p className="text-xs text-slate-500">{req.paymentMethod}</p>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="py-4">
                          <p className="text-sm font-medium text-slate-700">{formatDate(req.requestDate)}</p>
                          {req.resolvedAt && (
                            <p className="text-xs text-slate-500">Resolved {formatDate(req.resolvedAt)}</p>
                          )}
                        </TableCell>

                        {/* Priority */}
                        <TableCell className="py-4">
                          <Badge className={`text-xs font-medium px-3 py-1 ${pCfg.className}`}>
                            {pCfg.label}
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-4">
                          <Badge className={`text-xs font-medium px-3 py-1 inline-flex items-center gap-1.5 ${sCfg.className}`}>
                            {sCfg.icon}
                            {sCfg.label}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right py-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/dietitian/patients/${req.patientId}`}>
                              <Button size="sm" className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg shadow-slate-900/20 h-9 px-3">
                                <Eye className="h-4 w-4 mr-1.5" />
                                View
                              </Button>
                            </Link>
                            {isPending && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 font-semibold shadow-sm h-9 px-3"
                                  onClick={() => onApprove(req)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 font-semibold shadow-sm h-9 px-3"
                                  onClick={() => onReject(req)}
                                >
                                  <XCircle className="h-4 w-4 mr-1.5" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm" variant="outline"
                  className="h-8 w-8 p-0 border-slate-300"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p} size="sm"
                    variant={p === page ? "default" : "outline"}
                    className={`h-8 w-8 p-0 text-xs font-semibold ${
                      p === page ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-600"
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  size="sm" variant="outline"
                  className="h-8 w-8 p-0 border-slate-300"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}