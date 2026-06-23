"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search, Filter, IndianRupee,
  CheckCircle2, Clock, XCircle, RefreshCw,
  Download, Eye, TrendingUp, Wallet,
  AlertTriangle, ChevronLeft, ChevronRight,
  Loader2, PlusCircle, Banknote, Calendar, User, Phone, Mail, Bell,
} from "lucide-react"
import { toast } from "sonner"
import { useTransactionsApi, type ManualPaymentPayload } from "@/hooks/use-transactions-api"
import { useRecoveryStats, useRecoveryPatients } from "@/hooks/use-payment-recovery"
import { apiClient } from "@/lib/api-client"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useSpecialities, useProgramsDropdown, usePlansDropdown } from "@/hooks/use-dropdowns"
import { usePhaseConfigs, type PhaseConfig } from "@/hooks/use-phase-config"

// ─── Types ───────────────────────────────────────────────────────────────────

import type { RecoveryPatient } from "@/lib/api/payment-recovery-client"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n)

const formatDate = (value?: string) => {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(value))
  } catch { return value }
}

const getDaysDiff = (dateStr?: string) => {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(dateStr)
  dueDate.setHours(0, 0, 0, 0)
  const diffTime = dueDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getInitials = (name: string) => {
  const words = (name ?? "").trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const getPatientName = (item: RecoveryPatient) => {
  if (item.patient?.name?.trim()) return item.patient.name.trim()
  if (item.patient?.email) return item.patient.email
  if (item.patient?.phone) return item.patient.phone
  const pid = item.patient?.id ?? ""
  return pid ? `Patient …${pid.slice(-8)}` : "Unknown"
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { label: "Pending", cls: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Clock className="h-3 w-3" /> }
    case 'OVERDUE':
      return { label: "Overdue", cls: "bg-rose-50 text-rose-700 border border-rose-200", icon: <AlertTriangle className="h-3 w-3" /> }
    case 'DUE_SOON':
      return { label: "Due Soon", cls: "bg-orange-50 text-orange-700 border border-orange-200", icon: <AlertTriangle className="h-3 w-3" /> }
    default:
      return { label: status, cls: "bg-slate-50 text-slate-600 border border-slate-200", icon: null }
  }
}

const DEFAULT_META = { page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false }

// ─── Manual Payment Form ──────────────────────────────────────────────────────

const EMPTY_MANUAL_FORM: any = {
  paymentType: "installment",
  amount: 0,
  paymentMethod: "manual_cash",
  referenceId: "",
  patientId: "",
  notes: "",
  receipt: "",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecoveryPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<RecoveryPatient | null>(null)
  const [reminderDialog, setReminderDialog] = useState(false)
  
  // Manual payment drawer state
  const [manualDrawer, setManualDrawer] = useState(false)
  const [manualItem, setManualItem] = useState<RecoveryPatient | null>(null)
  const [manualForm, setManualForm] = useState<any>(EMPTY_MANUAL_FORM)
  const [manualFormErrors, setManualFormErrors] = useState<Partial<Record<string, string>>>({})
  
  // Manual payment form - speciality, program, plan selection
  const [selectedSpecialityId, setSelectedSpecialityId] = useState<string>("")
  const [selectedProgramId, setSelectedProgramId] = useState<string>("")
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [selectedPhaseNumber, setSelectedPhaseNumber] = useState<number>(1)
  const [installmentType, setInstallmentType] = useState<'one-time' | 'phase'>('phase')
  const [phaseValidationErrors, setPhaseValidationErrors] = useState<string[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [dropdownLeadSearch, setDropdownLeadSearch] = useState<string>("")

  // ── API hooks ─────────────────────────────────────────────────────────────
  const { recordManualPayment, manualPayLoading } = useTransactionsApi()
  
  // Payment recovery API hooks
  const { data: statsData, isLoading: statsLoading, error: statsError } = useRecoveryStats({ dueSoonDays: 14 })
  const { data: patientsData, isLoading: patientsLoading, error: patientsError } = useRecoveryPatients({
    page,
    limit: 10,
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase() as any,
    search: search || undefined,
  })
  
  // Dropdown hooks for speciality, program, plan selection
  const { data: specialities } = useSpecialities()
  const { data: programs } = useProgramsDropdown({ speciality_id: selectedSpecialityId })
  const { data: plans } = usePlansDropdown({ program_id: selectedProgramId })
  const { data: phaseConfigs, isLoading: isLoadingPhases } = usePhaseConfigs(selectedPlanId)

  // ── Derived data from API ───────────────────────────────────────────────────
  const stats = statsData?.data
  const items = patientsData?.data ?? []
  const meta = patientsData?.meta ?? DEFAULT_META
  const loading = statsLoading || patientsLoading

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return items.filter((item: RecoveryPatient) => {
      const matchSearch = !search || 
        getPatientName(item).toLowerCase().includes(search.toLowerCase()) ||
        item.program.name.toLowerCase().includes(search.toLowerCase()) ||
        item.patient.id.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || item.status === statusFilter.toUpperCase()
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalItems = stats?.totalPending ?? items.length
  const totalPendingAmount = stats?.pendingAmount ?? items.reduce((sum: number, item: RecoveryPatient) => sum + item.amount, 0)
  const overdueCount = stats?.overdue ?? items.filter((item: RecoveryPatient) => item.status === 'OVERDUE').length
  const dueSoonCount = stats?.dueSoon ?? items.filter((item: RecoveryPatient) => item.status === 'DUE_SOON').length

  // ── Send reminder handler ─────────────────────────────────────────────────────
  const handleSendReminder = async (item: RecoveryPatient) => {
    setSelectedItem(item)
    setReminderDialog(true)
  }

  const confirmSendReminder = async () => {
    if (!selectedItem) return
    
    try {
      // API call to send reminder
      await apiClient.post(`/payments/recovery/${selectedItem.currentPhase.id}/reminder`)
      toast.success("Reminder sent successfully")
      setReminderDialog(false)
      setSelectedItem(null)
    } catch (error) {
      console.error("Error sending reminder:", error)
      toast.error("Failed to send reminder")
    }
  }

  // ── Manual payment handlers ────────────────────────────────────────────────────
  const openManualDialog = (item: RecoveryPatient) => {
    setManualItem(item)
    setManualForm({ 
      ...EMPTY_MANUAL_FORM, 
      patientId: item.patient.id,
      amount: item.amount,
      notes: `Phase ${item.currentPhase.phaseNumber} payment for ${item.program.name}`
    })
    setManualFormErrors({})
    // Auto-populate specialty, program, plan from item.program
    setSelectedSpecialityId(item.program.specialty_id || "")
    setSelectedProgramId(item.program.program_id || "")
    setSelectedPlanId(item.program.plan_id || "")
    setSelectedPhaseNumber(item.currentPhase.phaseNumber)
    setInstallmentType('phase')
    setPhaseValidationErrors([])
    setShowConfirmation(false)
    setDropdownLeadSearch("")
    setManualDrawer(true)
  }

  const validateManualForm = (): boolean => {
    const errs: Partial<Record<keyof any, string>> = {}
    if (!manualForm.patientId?.trim()) errs.patientId = "Patient ID is required"
    if (!manualForm.amount || manualForm.amount <= 0) errs.amount = "Enter a valid amount"
    setManualFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleManualSubmit = async () => {
    if (!validateManualForm()) return

    const { referenceId, ...formWithoutReferenceId } = manualForm

    const payload: ManualPaymentPayload = {
      ...formWithoutReferenceId,
      amount: Number(manualForm.amount),
      programId: selectedProgramId,
      planId: selectedPlanId,
      paymentType: 'phase',
      phaseId: manualItem?.currentPhase.id,
    }

    const success = await recordManualPayment(payload)
    if (success) {
      setManualDrawer(false)
      setManualItem(null)
      // Refetch data
      // refetch()
    }
  }

  const updateManualForm = (field: string, value: string | number) => {
    setManualForm((prev:any) => ({ ...prev, [field]: value }))
    if (manualFormErrors[field]) setManualFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // Auto-populate amount from selected phase when phase configs are loaded
  useEffect(() => {
    if (phaseConfigs?.data && phaseConfigs.data.length > 0 && selectedPhaseNumber) {
      const selectedPhase = phaseConfigs.data.find((p: PhaseConfig) => p.phase_number === selectedPhaseNumber)
      if (selectedPhase) {
        updateManualForm('amount', selectedPhase.amount)
      }
    }
  }, [phaseConfigs, selectedPhaseNumber])

  // Handle speciality selection - reset dependent dropdowns
  const handleSpecialityChange = (value: string) => {
    setSelectedSpecialityId(value)
    setSelectedProgramId("")
    setSelectedPlanId("")
    setPhaseValidationErrors([])
  }

  // Handle program selection - reset plan dropdown
  const handleProgramChange = (value: string) => {
    setSelectedProgramId(value)
    setSelectedPlanId("")
    setPhaseValidationErrors([])
  }

  // Handle plan selection - update amount based on plan price
  const handlePlanChange = (value: string) => {
    setSelectedPlanId(value)
    const selectedPlan = plans?.find(p => p.id === value)
    if (selectedPlan?.current_pricing?.base_price) {
      updateManualForm('amount', parseFloat(selectedPlan.current_pricing.base_price))
      updateManualForm('planId', value)
    } else if (selectedPlan?.base_price) {
      updateManualForm('amount', parseFloat(selectedPlan.base_price))
      updateManualForm('planId', value)
    }
    setPhaseValidationErrors([])
  }

  // Validate phase configurations
  const validatePhases = (): boolean => {
    const errors: string[] = []
    const phases = phaseConfigs?.data || []
    
    if (!phases || phases.length === 0) {
      errors.push("No phases found for this plan.")
    } else if (phases.length < 2) {
      errors.push("Minimum 2 phases are required for installment payment.")
    }
    
    // Check if any phase amount is 0
    const hasZeroAmount = phases.some((p: PhaseConfig) => p.amount === 0)
    if (hasZeroAmount) {
      errors.push("Phase amount cannot be zero.")
    }
    
    // Check if sum of phase amounts equals plan price
    const totalPhaseAmount = phases.reduce((sum: number, p: PhaseConfig) => sum + p.amount, 0)
    if (Math.abs(totalPhaseAmount - manualForm.amount) > 0.01) {
      errors.push(`Total phase amounts (${fmt(totalPhaseAmount)}) must equal the plan price (${fmt(manualForm.amount)}).`)
    }
    
    setPhaseValidationErrors(errors)
    return errors.length === 0
  }

  // Handle installment type change
  const handleInstallmentTypeChange = (value: 'one-time' | 'phase') => {
    setInstallmentType(value)
    setPhaseValidationErrors([])
    setShowConfirmation(false)
    
    if (value === 'phase' && selectedPlanId) {
      validatePhases()
      // Auto-select Phase 1 and update amount
      const phases = phaseConfigs?.data || []
      if (phases.length > 0) {
        const phase1 = phases.find((p: PhaseConfig) => p.phase_number === 1)
        if (phase1) {
          updateManualForm('amount', phase1.amount)
          updateManualForm('phaseNumber', 1)
          updateManualForm('totalPhases', phases.length)
        }
      }
    } else if (value === 'one-time' && selectedPlanId) {
      // Restore amount from plan base_price when switching to one-time
      const selectedPlan = plans?.find(p => p.id === selectedPlanId)
      if (selectedPlan?.current_pricing?.base_price) {
        updateManualForm('amount', parseFloat(selectedPlan?.current_pricing?.base_price))
      }
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Clinic Portal / Finance / Recovery
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Payment Recovery</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Track and recover pending phase payments from patients.
            </p>
          </div>
          {/* <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm"
            >
              <Bell className="mr-2 h-4 w-4" />
              Send Bulk Reminders
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div> */}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-3 w-3 text-blue-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Total Pending</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : totalItems}</p>
                <p className="text-xs text-blue-700/80 font-medium">Phase payments</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Pending Amount</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : fmt(totalPendingAmount)}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Next phase dues</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
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
                  <AlertTriangle className="h-3 w-3 text-rose-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">Overdue</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : overdueCount}</p>
                <p className="text-xs text-rose-700/80 font-medium">Require attention</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Due Soon</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : dueSoonCount}</p>
                <p className="text-xs text-amber-700/80 font-medium">Within 7 days</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-3 w-full">
          <div className="relative flex-1 max-w-md flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by patient name, ID, program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-slate-300 focus:ring-2 focus:ring-blue-500 h-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-slate-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="due_soon">Due Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Wallet className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">No pending payments found</p>
              <p className="text-sm text-slate-400 mt-1">No pending phase payments match your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="text-left font-semibold text-slate-700">Patient</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Contact</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Program</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Phase</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Due Date</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Days</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Amount</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item: RecoveryPatient) => {
                    return (
                      <TableRow key={item.currentPhase.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-800 to-indigo-900 flex items-center justify-center text-white text-xs font-semibold">
                              {getInitials(getPatientName(item))}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{getPatientName(item)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {item.patient.email && (
                              <div className="flex items-center gap-1 text-xs text-slate-600">
                                <Mail className="h-3 w-3" />
                                {item.patient.email}
                              </div>
                            )}
                            {item.patient.phone && (
                              <div className="flex items-center gap-1 text-xs text-slate-600">
                                <Phone className="h-3 w-3" />
                                {item.patient.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-slate-900">{item.program.name}</p>
                          <p className="text-xs text-slate-500">{fmt(item.program.totalAmount)} total</p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-900">
                            {item.currentPhase.phaseNumber} / {item.currentPhase.totalPhases}
                          </div>
                          <p className="text-xs text-slate-500">{item.currentPhase.completedPhases} completed</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {item.dueDate ? formatDate(item.dueDate) : "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="text-xs border bg-slate-50 text-slate-700 border-slate-200">
                            {item.daysString}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-slate-900">{fmt(item.amount)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusConfig(item.status).cls}>
                            {getStatusConfig(item.status).icon}
                            {getStatusConfig(item.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openManualDialog(item)}
                              className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                            >
                              <Banknote className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                            {/* <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendReminder(item)}
                              className="border-blue-300 hover:bg-blue-50 text-blue-700"
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              Remind
                            </Button> */}
                            <Button size="sm" variant="outline" className="border-slate-300 hover:bg-slate-50">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {((page - 1) * meta.limit) + 1} to {Math.min(page * meta.limit, meta.total)} of {meta.total} items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!meta.hasPrev}
              className="border-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-slate-600 px-3">
              Page {page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!meta.hasNext}
              className="border-slate-300"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reminder Dialog */}
      <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-900 mb-2">Payment Details</p>
              <div className="space-y-1 text-sm text-slate-600">
                <p><strong>Patient:</strong> {selectedItem && getPatientName(selectedItem)}</p>
                <p><strong>Program:</strong> {selectedItem?.program.name || "Unknown"}</p>
                <p><strong>Phase:</strong> {selectedItem?.currentPhase.phaseNumber} of {selectedItem?.currentPhase.totalPhases}</p>
                <p><strong>Amount:</strong> {selectedItem && fmt(selectedItem.amount)}</p>
                <p><strong>Due Date:</strong> {selectedItem && formatDate(selectedItem.dueDate)}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a custom message to the reminder..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSendReminder}>
              <Bell className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Payment Drawer */}
      <Sheet open={manualDrawer} onOpenChange={(open) => { if (!open) { setManualDrawer(false); setManualItem(null) } }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />Record Phase Payment
            </SheetTitle>
            {manualItem && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-900">{getPatientName(manualItem)}</p>
                <p className="text-xs text-slate-600">Phase {manualItem.currentPhase.phaseNumber} of {manualItem.currentPhase.totalPhases}</p>
                <p className="text-xs text-slate-600">{manualItem.program.name}</p>
                {manualItem.patient.email && (
                  <p className="text-xs text-slate-600">{manualItem.patient.email}</p>
                )}
                {manualItem.patient.phone && (
                  <p className="text-xs text-slate-600">{manualItem.patient.phone}</p>
                )}
              </div>
            )}
          </SheetHeader>
          <div className="space-y-4 py-4">
            {/* Speciality, Program, Plan Dropdowns */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Speciality</Label>
                <Select value={selectedSpecialityId} onValueChange={handleSpecialityChange} disabled={!!selectedSpecialityId}>
                  <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {specialities?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Program</Label>
                <Select value={selectedProgramId} onValueChange={handleProgramChange} disabled={!selectedSpecialityId || !!selectedProgramId}>
                  <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {programs?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Plan</Label>
                <Select value={selectedPlanId} onValueChange={handlePlanChange} disabled={!selectedProgramId || !!selectedPlanId}>
                  <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {plans?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Type Radio Toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Payment Type</Label>
              <RadioGroup value={installmentType} onValueChange={handleInstallmentTypeChange} disabled={!selectedPlanId}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phase" id="phase" />
                    <Label htmlFor="phase" className="text-sm font-medium cursor-pointer">Phase / Installment</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Phase Details Section */}
            {installmentType === 'phase' && (
              <div className="space-y-3">
                {isLoadingPhases ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : !phaseConfigs?.data || phaseConfigs.data.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700">No installment schedule found for this plan.</p>
                  </div>
                ) : phaseValidationErrors.length > 0 ? (
                  <div className="space-y-2">
                    {phaseValidationErrors.map((error, idx) => (
                      <div key={idx} className="bg-rose-50 border border-rose-200 rounded-lg p-2">
                        <p className="text-xs text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3" />
                          {error}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-xs font-semibold text-slate-700">Phase</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">Amount</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {phaseConfigs.data
                          .sort((a: PhaseConfig, b: PhaseConfig) => a.phase_number - b.phase_number)
                          .map((phase: PhaseConfig) => (
                            <TableRow 
                              key={phase.id} 
                              className={phase.phase_number === selectedPhaseNumber ? "bg-blue-50" : ""}
                            >
                              <TableCell className="text-xs font-medium">
                                {phase.phase_number === selectedPhaseNumber && <span className="text-blue-600">Phase {phase.phase_number} (Selected)</span>}
                                {phase.phase_number !== selectedPhaseNumber && <span className="text-slate-600">Phase {phase.phase_number}</span>}
                              </TableCell>
                              <TableCell className="text-xs font-semibold text-slate-900">{fmt(phase.amount)}</TableCell>
                              <TableCell className="text-xs">
                                {phase.phase_number === selectedPhaseNumber ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">Current</Badge>
                                ) : (
                                  <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px]">Upcoming</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Amount Field */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Amount (₹) <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number" 
                  min={1} 
                  value={manualForm.amount || ""} 
                  onChange={(e) => updateManualForm("amount", parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5000"
                  readOnly={true}
                  className={`h-10 cursor-not-allowed border-slate-300 ${manualFormErrors.amount ? "border-rose-400" : ""} bg-slate-50`} 
                />
                {manualFormErrors.amount && <p className="text-xs text-rose-500">{manualFormErrors.amount}</p>}
                <p className="text-[10px] text-slate-500">Auto-populated from selected plan</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Payment Method</Label>
              <Select value={manualForm.paymentMethod} onValueChange={(v) => updateManualForm("paymentMethod", v)}>
                <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_cash">Cash</SelectItem>
                  <SelectItem value="manual_cheque">Cheque</SelectItem>
                  <SelectItem value="manual_bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="manual_upi">UPI (Manual)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference ID and Receipt */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Reference ID</Label>
                <Input value={manualForm.referenceId} onChange={(e) => updateManualForm("referenceId", e.target.value)} placeholder="Cheque no., UTR…" className="h-10 border-slate-300" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Receipt No.</Label>
                <Input value={manualForm.receipt} onChange={(e) => updateManualForm("receipt", e.target.value)} placeholder="Optional" className="h-10 border-slate-300" />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Notes</Label>
              <Textarea value={manualForm.notes} onChange={(e) => updateManualForm("notes", e.target.value)} placeholder="Any additional info…" className="border-slate-300 resize-none" rows={3} />
            </div>
          </div>
          <SheetFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setManualDrawer(false); setManualItem(null) }} className="border-slate-300" disabled={manualPayLoading}>Cancel</Button>
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg"
              onClick={handleManualSubmit} 
              disabled={manualPayLoading || (installmentType === 'phase' && phaseValidationErrors.length > 0)}
            >
              {manualPayLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Recording…</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Record Payment</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
