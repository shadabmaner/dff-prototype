"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input as InputField } from "@/components/ui/input"
import {
  Search, Filter, CreditCard, CheckCircle2,
  AlertTriangle, IndianRupee, Calendar, User, Eye,
  Ban, ChevronLeft, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useInstallmentsApi } from "@/hooks/use-installments-api"

// ─── Types ────────────────────────────────────────────────────────────────────

type InstallmentStatus = "pending" | "paid" | "overdue" | "waived"

interface Installment {
  installment_id: string
  patient_id: string
  patient_name: string
  phone?: string
  plan_name: string
  installment_number: number
  total_installments: number
  amount_due: number
  amount_paid?: number
  due_date: string
  paid_at?: string
  status: InstallmentStatus
  payment_method?: string
  notes?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value?: string) => {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(value))
  } catch { return value }
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount)

const statusConfig: Record<InstallmentStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  paid:    { label: "Paid",    className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  overdue: { label: "Overdue", className: "bg-rose-50 text-rose-700 border border-rose-200" },
  waived:  { label: "Waived",  className: "bg-slate-50 text-slate-600 border border-slate-200" },
}

const DEFAULT_META = { page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false }

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  patientProgramId?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InstallmentsListClient({ patientProgramId }: Props) {
  const [apiData, setApiData]     = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage]           = useState(1)

  const [searchQuery, setSearchQuery]   = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [planFilter, setPlanFilter]     = useState<string>("all")

  const [markPaidDialog, setMarkPaidDialog]           = useState(false)
  const [waiveDialog, setWaiveDialog]                 = useState(false)
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null)
  const [paymentMethod, setPaymentMethod]             = useState("UPI")
  const [waiveReason, setWaiveReason]                 = useState("")

  const { getInstallments, loading: fetching, error } = useInstallmentsApi()

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const result = await getInstallments({ patientProgramId, page, limit: 10 })
      if (result) setApiData(result)
      setIsLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, patientProgramId])

  const installments: Installment[] = apiData?.data ?? []
  const meta = apiData?.meta ?? DEFAULT_META

  // ── Client-side filters ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return installments.filter((i) => {
      const matchesSearch = !q || i.patient_name.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || i.status === statusFilter
      const matchesPlan   = planFilter === "all"   || i.plan_name === planFilter
      return matchesSearch && matchesStatus && matchesPlan
    })
  }, [installments, searchQuery, statusFilter, planFilter])

  const uniquePlans = useMemo(
    () => Array.from(new Set(installments.map((i) => i.plan_name))),
    [installments]
  )

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalDue = installments
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount_due, 0)

  const overdueCount = installments.filter((i) => i.status === "overdue").length

  const currentMonth = new Date().toISOString().slice(0, 7)
  const collectedThisMonth = installments
    .filter((i) => i.status === "paid" && i.paid_at?.startsWith(currentMonth))
    .reduce((sum, i) => sum + (i.amount_paid ?? 0), 0)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMarkPaid = (inst: Installment) => { setSelectedInstallment(inst); setMarkPaidDialog(true) }
  const handleWaive    = (inst: Installment) => { setSelectedInstallment(inst); setWaiveDialog(true) }

  const confirmMarkPaid = () => {
    toast.success(`Installment marked as paid for ${selectedInstallment?.patient_name}`)
    setMarkPaidDialog(false)
    setSelectedInstallment(null)
    setPaymentMethod("UPI")
  }

  const confirmWaive = () => {
    if (!waiveReason.trim()) { toast.error("Please provide a reason for waiving"); return }
    toast.success(`Installment waived for ${selectedInstallment?.patient_name}`)
    setWaiveDialog(false)
    setSelectedInstallment(null)
    setWaiveReason("")
  }

  // ── Error state (non-auth errors only) ────────────────────────────────────
  if (!isLoading && error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-rose-600">Unable to load installments</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Clinic Portal / Finance / Installments
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Installments</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Track installment schedules, due payments, and collection history.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Outstanding Due</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{isLoading ? "—" : formatAmount(totalDue)}</p>
                <p className="text-xs text-amber-700/80 font-medium">Pending + overdue</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <IndianRupee className="h-6 w-6 text-white" />
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
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">Overdue</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{isLoading ? "—" : overdueCount}</p>
                <p className="text-xs text-rose-700/80 font-medium">Require immediate action</p>
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
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">
                    Collected — {new Date().toLocaleString("en-IN", { month: "short" })}
                  </p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">
                  {isLoading ? "—" : formatAmount(collectedThisMonth)}
                </p>
                <p className="text-xs text-emerald-700/80 font-medium">This month's receipts</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters ── */}
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
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="waived">Waived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[200px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {uniquePlans.map((plan) => (
                    <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-900 hover:to-slate-800 border-b-0">
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Patient</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Plan</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Installment</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Amount</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Due Date</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Payment Info</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="border-b border-slate-100">
                      <TableCell colSpan={8} className="py-5">
                        <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="font-medium">No installments found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inst) => {
                    const cfg = statusConfig[inst.status]
                    const isActionable = inst.status === "pending" || inst.status === "overdue"
                    return (
                      <TableRow
                        key={inst.installment_id}
                        className={`hover:bg-slate-50/80 border-b border-slate-100 transition-colors ${fetching ? "opacity-60" : ""}`}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{inst.patient_name}</p>
                              <p className="text-xs text-slate-500">
                                #{inst.patient_id.slice(-6)} · {inst.phone ?? "No phone"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <Badge variant="outline" className="border-slate-300 text-slate-700 font-medium max-w-[160px] truncate block">
                            {inst.plan_name}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {inst.installment_number}/{inst.total_installments}
                            </span>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                style={{ width: `${(inst.installment_number / inst.total_installments) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <p className="text-sm font-bold text-slate-900">{formatAmount(inst.amount_due)}</p>
                          {inst.amount_paid && inst.amount_paid !== inst.amount_due && (
                            <p className="text-xs text-emerald-600 font-medium">
                              Paid: {formatAmount(inst.amount_paid)}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span className={`text-sm font-medium ${inst.status === "overdue" ? "text-rose-600" : "text-slate-700"}`}>
                              {formatDate(inst.due_date)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <Badge className={`text-xs font-medium px-3 py-1 ${cfg.className}`}>
                            {cfg.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4">
                          {inst.status === "paid" ? (
                            <div>
                              <p className="text-xs font-medium text-slate-700">{inst.payment_method ?? "—"}</p>
                              <p className="text-xs text-slate-500">{formatDate(inst.paid_at)}</p>
                            </div>
                          ) : inst.status === "waived" ? (
                            <p className="text-xs text-slate-500 max-w-[140px] truncate" title={inst.notes}>
                              {inst.notes ?? "—"}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right py-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/dietitian/patients/${inst.patient_id}`}>
                              <Button size="sm" className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg shadow-slate-900/20 h-9 px-3">
                                <Eye className="h-4 w-4 mr-1.5" />
                                View
                              </Button>
                            </Link>
                            {isActionable && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 font-semibold shadow-sm h-9 px-3"
                                  onClick={() => handleMarkPaid(inst)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                  Mark Paid
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 font-semibold shadow-sm h-9 px-3"
                                  onClick={() => handleWaive(inst)}
                                >
                                  <Ban className="h-4 w-4 mr-1.5" />
                                  Waive
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

          {/* ── Pagination ── */}
          {!isLoading && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-900">{meta.page}</span> of{" "}
                <span className="font-bold text-slate-900">{meta.totalPages}</span>
                {" "}· {meta.total} total installments
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm"
                  disabled={!meta.hasPrev || fetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm"
                  disabled={!meta.hasNext || fetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Mark Paid Dialog ── */}
      <Dialog open={markPaidDialog} onOpenChange={(open) => { setMarkPaidDialog(open); if (!open) setSelectedInstallment(null) }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Mark Installment as Paid</DialogTitle>
            <DialogDescription>
              Record payment for{" "}
              <span className="font-semibold text-slate-900">{selectedInstallment?.patient_name}</span>
              {" "}— Installment {selectedInstallment?.installment_number}/{selectedInstallment?.total_installments} of{" "}
              {selectedInstallment ? formatAmount(selectedInstallment.amount_due) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paid-date">Payment Date</Label>
              <InputField
                id="paid-date"
                type="date"
                className="h-10"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidDialog(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={confirmMarkPaid}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Waive Dialog ── */}
      <Dialog open={waiveDialog} onOpenChange={(open) => { setWaiveDialog(open); if (!open) setSelectedInstallment(null) }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Waive Installment</DialogTitle>
            <DialogDescription>
              Waive installment {selectedInstallment?.installment_number} of{" "}
              <span className="font-semibold text-slate-900">{selectedInstallment?.patient_name}</span>
              {" "}({selectedInstallment ? formatAmount(selectedInstallment.amount_due) : ""}). Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="waive-reason">Reason for waiving</Label>
              <textarea
                id="waive-reason"
                rows={3}
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="e.g. Financial hardship, clinic error, promotional discount..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaiveDialog(false)}>Cancel</Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={confirmWaive}>
              <Ban className="h-4 w-4 mr-2" />
              Waive Installment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
