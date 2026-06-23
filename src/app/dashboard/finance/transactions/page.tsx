"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { mapInvoiceForPdf } from "@/hooks/use-invoices-api";
import {
  Search, Filter, CreditCard, IndianRupee,
  CheckCircle2, Clock, XCircle, RefreshCw,
  Copy, Download, Eye, TrendingUp, Wallet,
  ReceiptText, AlertTriangle, ChevronLeft, ChevronRight,
  Loader2, PlusCircle, Banknote, FileText, ExternalLink, User,
} from "lucide-react"
import { toast } from "sonner"
import type { Transaction, GetTransactionsResponse } from "@/types/transactions"
import { useTransactionsApi, type ManualPaymentPayload } from "@/hooks/use-transactions-api"
import { useSpecialities, useProgramsDropdown, usePlansDropdown } from "@/hooks/use-dropdowns"
import { usePhaseConfigs, type PhaseConfig } from "@/hooks/use-phase-config"
import {
  useInvoicesApi,
  type Invoice,
  type GetInvoicesResponse,
  type GenerateInvoicePayload,
} from "@/hooks/use-invoices-api"
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store"

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

// ── Transaction helpers ───────────────────────────────────────────────────────

const getStatusCfg = (status?: string) => {
  const s = status?.toLowerCase() ?? ""
  if (["success", "paid", "captured"].includes(s))
    return { label: "Success",  cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> }
  if (["pending", "created"].includes(s))
    return { label: "Pending",  cls: "bg-amber-50 text-amber-700 border border-amber-200",       icon: <Clock className="h-3 w-3" /> }
  if (s === "failed")
    return { label: "Failed",   cls: "bg-rose-50 text-rose-700 border border-rose-200",          icon: <XCircle className="h-3 w-3" /> }
  if (s === "refunded")
    return { label: "Refunded", cls: "bg-slate-50 text-slate-600 border border-slate-200",       icon: <RefreshCw className="h-3 w-3" /> }
  return   { label: status ?? "Unknown", cls: "bg-slate-50 text-slate-600 border border-slate-200", icon: null }
}

// ── Payment mode icon ─────────────────────────────────────────────────────────
const getModeIcon = (mode?: string) => {
  const m = (mode ?? "").toLowerCase()
  if (m.includes("upi"))        return <span className="text-[10px] font-bold text-violet-700 bg-violet-100 rounded px-1.5 py-0.5">UPI</span>
  if (m.includes("card"))       return <CreditCard className="h-3.5 w-3.5 text-blue-600" />
  if (m.includes("net"))        return <span className="text-[10px] font-bold text-sky-700 bg-sky-100 rounded px-1.5 py-0.5">NB</span>
  if (m.includes("cash"))       return <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
  if (m.includes("wallet"))     return <Wallet className="h-3.5 w-3.5 text-orange-500" />
  if (m.includes("razorpay"))   return <span className="text-[10px] font-bold text-blue-700 bg-blue-100 rounded px-1.5 py-0.5">Razorpay</span>
  if (m.includes("cheque"))     return <span className="text-[10px] font-bold text-slate-700 bg-slate-100 rounded px-1.5 py-0.5">Cheque</span>
  if (m.includes("bank") || m.includes("transfer")) return <span className="text-[10px] font-bold text-teal-700 bg-teal-100 rounded px-1.5 py-0.5">Bank</span>
  return <CreditCard className="h-3.5 w-3.5 text-slate-400" />
}

// ── Patient name ──────────────────────────────────────────────────────────────
const getPatientName = (tx: Transaction) => {
  // Check for nested patient object first (new API structure)
  if ((tx as any).patient?.name?.trim()) {
    return (tx as any).patient.name.trim()
  }
  // Fallback to existing structure
  if (tx.patient_name?.trim()) return tx.patient_name.trim()
  const parts = [tx.first_name, tx.last_name].filter(Boolean)
  if (parts.length) return parts.join(" ").trim()
  if ((tx as any).patient?.phone) return (tx as any).patient.phone
  if (tx.phone) return tx.phone
  const pid = tx.patient_id ?? tx.id ?? ""
  return pid ? `Patient …${pid.slice(-8)}` : "Unknown"
}

const getInitials = (name: string) => {
  const words = (name ?? "").trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// ── Payment mode string ───────────────────────────────────────────────────────
const getPaymentMode = (tx: Transaction) => tx.payment_method ?? tx.payment_mode ?? ""

// ── Transaction ID ────────────────────────────────────────────────────────────
const getTxId = (tx: Transaction) =>
  tx.razorpay_payment_id ?? tx.razorpay_order_id ?? tx.reference_id ?? tx.id ?? ""

// ── Short display of TX ID ────────────────────────────────────────────────────
const getTxIdShort = (tx: Transaction) => {
  const full = getTxId(tx)
  if (!full) return "—"
  return full.length > 16 ? `…${full.slice(-12)}` : full
}

// ── Program / plan ────────────────────────────────────────────────────────────
const getProgram = (tx: Transaction) => {
  // Check for nested program object first (new API structure)
  if ((tx as any).program?.name) return (tx as any).program.name
  // Check for nested plan object
  if ((tx as any).plan?.name) return (tx as any).plan.name
  // Fallback to existing structure
  if (tx.program) return tx.program
  if (tx.program_name) return tx.program_name
  const meta = (tx as any).metadata
  if (meta?.program_id) return `Program …${String(meta.program_id).slice(-8)}`
  return tx.payment_type ? tx.payment_type.charAt(0).toUpperCase() + tx.payment_type.slice(1) : "—"
}

// ── Amount ────────────────────────────────────────────────────────────────────
const getAmount = (tx: Transaction): number => {
  const n = Number(tx.amount)
  return isNaN(n) ? 0 : n
}

const isSuccessfulTx = (tx: Transaction) =>
  ["success", "paid", "captured"].includes(tx.status?.toLowerCase() ?? "")

const DEFAULT_META = { page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false }

// ─── Manual Payment Form ──────────────────────────────────────────────────────

const EMPTY_MANUAL_FORM: ManualPaymentPayload = {
  patientId:     "",
  paymentType:   "program",
  amount:        0,
  paymentMethod: "manual_cash",
  referenceId:   "",
  leadId:        "",
  notes:         "",
  receipt:       "",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TransactionsListClient() {

  // ── Transactions state ────────────────────────────────────────────────────
  const [txPage, setTxPage]           = useState(1)
  const [txApiData, setTxApiData]     = useState<GetTransactionsResponse | null>(null)
  const [txLoading, setTxLoading]     = useState(true)
  const [txSearch, setTxSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [modeFilter, setModeFilter]   = useState("all")
  const [typeFilter, setTypeFilter]   = useState("all")

  // Detail dialog
  const [showDetailSheet, setShowDetailSheet] = useState(false)
  const [selectedTx, setSelectedTx]     = useState<Transaction | null>(null)

  // Manual payment dialog
  const [manualDialog, setManualDialog]         = useState(false)
  const [manualTx, setManualTx]                 = useState<Transaction | null>(null)
  const [manualForm, setManualForm]             = useState<ManualPaymentPayload>(EMPTY_MANUAL_FORM)
  const [manualFormErrors, setManualFormErrors] = useState<Partial<Record<keyof ManualPaymentPayload, string>>>({})

  // Manual payment form - speciality, program, plan selection
  const [selectedSpecialityId, setSelectedSpecialityId] = useState<string>("")
  const [selectedProgramId, setSelectedProgramId] = useState<string>("")
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [installmentType, setInstallmentType] = useState<'one-time' | 'phase'>('one-time')
  const [phaseValidationErrors, setPhaseValidationErrors] = useState<string[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [patientSearch, setPatientSearch] = useState<string>("")

  // ── FIX: track invoice loading per tx.id (not invoice_number / patient_id)
  // The hook's generateLoading holds invoice_number which is internal to the hook.
  // We use our own state here so the row spinner is keyed by tx.id.
  const [invoiceLoadingTxId, setInvoiceLoadingTxId] = useState<string | null>(null)

  // ── API hooks ─────────────────────────────────────────────────────────────
  const {
    loading: txFetching,
    error: txError,
    invoiceLoading,
    manualPayLoading,
    getTransactions,
    downloadInvoice,
    recordManualPayment,
  } = useTransactionsApi()

  const {
    loading: invFetching,
    getInvoices,
    generateInvoicesFromPatientData,
  } = useInvoicesApi()

  // Dropdown hooks for speciality, program, plan selection
  const { data: specialities } = useSpecialities()
  const { data: programs } = useProgramsDropdown({ speciality_id: selectedSpecialityId })
  const { data: plans } = usePlansDropdown({ program_id: selectedProgramId })
  const { data: phaseConfigs, isLoading: isLoadingPhases } = usePhaseConfigs(selectedPlanId)

  const limit = 10

  // ── Fetch transactions ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setTxLoading(true)
      const result = await getTransactions({ page: txPage, limit })
      if (result) {
        setTxApiData(result)
      }
      setTxLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txPage])

  // ── Derived data ──────────────────────────────────────────────────────────
  const transactions: Transaction[] = txApiData?.data ?? []
  const txMeta = txApiData?.meta ?? DEFAULT_META

  // Derive patients from transactions data with search filtering and limit of 100
  const patients = useMemo(() => {
    const uniquePatients = new Map<string, { id: string; name: string; phone: string }>()
    transactions.forEach((tx) => {
      const patientId = tx.patient_id || (tx as any).patient?.id
      if (patientId) {
        const name = getPatientName(tx)
        const phone = (tx as any).patient?.phone || tx.phone || ""
        if (!uniquePatients.has(patientId)) {
          uniquePatients.set(patientId, { id: patientId, name, phone })
        }
      }
    })
    const patientList = Array.from(uniquePatients.values())
    const filtered = patientList.filter(p =>
      !patientSearch ||
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.toLowerCase().includes(patientSearch.toLowerCase())
    )
    return filtered.slice(0, 100)
  }, [transactions, patientSearch])

  // ── Transaction filters ───────────────────────────────────────────────────
  const filteredTx = useMemo(() => {
    const q = txSearch.toLowerCase()
    return transactions.filter((tx) => {
      const matchSearch =
        !q ||
        getPatientName(tx).toLowerCase().includes(q) ||
        getProgram(tx).toLowerCase().includes(q) ||
        getTxId(tx).toLowerCase().includes(q) ||
        (tx.patient_id ?? "").toLowerCase().includes(q) ||
        ((tx as any).patient?.email ?? "").toLowerCase().includes(q) ||
        ((tx as any).patient?.phone ?? "").toLowerCase().includes(q) ||
        (tx.receipt ?? "").toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || tx.status?.toLowerCase() === statusFilter
      const matchMode   = modeFilter === "all"   || getPaymentMode(tx).toLowerCase().includes(modeFilter)
      const matchType   = typeFilter === "all"   || (tx.payment_type ?? "").toLowerCase() === typeFilter
      return matchSearch && matchStatus && matchMode && matchType
    })
  }, [transactions, txSearch, statusFilter, modeFilter, typeFilter])

  // ── Transaction stats ─────────────────────────────────────────────────────
  const txSuccessCount = transactions.filter(isSuccessfulTx).length
  const txPendingCount = transactions.filter((t) => ["pending", "created"].includes(t.status?.toLowerCase() ?? "")).length
  const txFailedCount  = transactions.filter((t) => t.status?.toLowerCase() === "failed").length
  const txRevenue = transactions
    .filter(isSuccessfulTx)
    .reduce((sum, tx) => sum + getAmount(tx), 0)

  // ── Manual payment helpers ────────────────────────────────────────────────
  const openManualDialog = (tx?: Transaction) => {
    setManualTx(tx ?? null)
    setManualForm({ ...EMPTY_MANUAL_FORM, patientId: tx?.patient_id ?? "" })
    setManualFormErrors({})
    setSelectedSpecialityId("")
    setSelectedProgramId("")
    setSelectedPlanId("")
    setInstallmentType('one-time')
    setPhaseValidationErrors([])
    setShowConfirmation(false)
    setPatientSearch("")
    setManualDialog(true)
  }

  // Handle patient selection
  const handlePatientChange = (value: string) => {
    updateManualForm('patientId', value)
  }

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
    if (selectedPlan?.base_price) {
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
    }
  }

  const validateManualForm = (): boolean => {
    const errs: Partial<Record<keyof ManualPaymentPayload, string>> = {}
    if (!manualForm.patientId.trim()) errs.patientId = "Patient ID is required"
    if (!manualForm.amount || manualForm.amount <= 0) errs.amount = "Enter a valid amount"
    setManualFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleManualSubmit = async () => {
    if (!validateManualForm()) return
    
    // Add phase-related fields to the payload
    const payload: ManualPaymentPayload = {
      ...manualForm,
      specialityId: selectedSpecialityId,
      programId: selectedProgramId,
      planId: selectedPlanId,
      installmentType: installmentType,
      phaseNumber: installmentType === 'phase' ? 1 : undefined,
      totalPhases: installmentType === 'phase' ? phaseConfigs?.data?.length : undefined,
    }
    
    const success = await recordManualPayment(payload)
    if (success) {
      setManualDialog(false)
      setManualTx(null)
      const result = await getTransactions({ page: txPage, limit })
      if (result) setTxApiData(result)
    }
  }

  const updateManualForm = (field: keyof ManualPaymentPayload, value: string | number) => {
    setManualForm((prev) => ({ ...prev, [field]: value }))
    if (manualFormErrors[field]) setManualFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // ── Invoice download handler ──────────────────────────────────────────────
  const handleInvoiceDownload = async (tx: Transaction) => {
    try {
      setInvoiceLoadingTxId(tx.id); // show spinner on this row

      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(tx.id.slice(-8)).toUpperCase()}`;
      
      // Get patient information from nested object or fallback
      const patientName = (tx as any).patient?.name || getPatientName(tx);
      const patientEmail = (tx as any).patient?.email || "—";
      const patientPhone = (tx as any).patient?.phone || tx.phone || "—";
      
      // Get program/plan description
      const programName = (tx as any).program?.name || (tx as any).plan?.name || getProgram(tx);
      const description = programName || tx.payment_type || "Payment";

      // Generate invoice using external API
      const response = await fetch('https://drpdf.onpointsoft.com/generate-invoice', {
        method: 'POST',
        headers: {
          'X-API-Key': 'FxK7hDbgtkeqCgnmDmv4GC1SS9pDLYgdD1pFVmckAZM=',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNumber,
          date: tx.created_at ? new Date(tx.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: tx.status?.toUpperCase() || "PAID",
          billToName: patientName,
          billToEmail: patientEmail,
          billToPhone: patientPhone,
          items: [
            {
              description: description.charAt(0).toUpperCase() + description.slice(1),
              quantity: 1,
              total: getAmount(tx)
            }
          ],
          totalAmount: getAmount(tx),
          notes: tx.notes || `Payment received via ${getPaymentMode(tx).replace(/_/g, " ")}`
        })
      });

      if (!response.ok) {
        throw new Error(`Invoice generation failed: ${response.statusText}`);
      }

      // Parse JSON response to get URL and filename
      const data = await response.json();
      const { url, filename } = data;

      // Download the PDF from the returned URL
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${invoiceNumber}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Invoice downloaded successfully");

    } catch (err) {
      console.error("Invoice download error:", err);
      toast.error("Failed to generate invoice PDF");
    } finally {
      setInvoiceLoadingTxId(null); // hide spinner
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Clinic Portal / Payments
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Payments</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Track transactions from a single place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm"
              onClick={() => openManualDialog()}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Record Manual Payment
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Revenue (Page)</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{txLoading ? "—" : fmt(txRevenue)}</p>
                <p className="text-xs text-blue-700/80 font-medium">Successful payments</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
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
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Successful</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{txLoading ? "—" : txSuccessCount}</p>
                <p className="text-xs text-emerald-700/80 font-medium">This page</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-white" />
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
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Pending</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{txLoading ? "—" : txPendingCount}</p>
                <p className="text-xs text-amber-700/80 font-medium">Awaiting confirmation</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6 text-white" />
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
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">Failed</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{txLoading ? "—" : txFailedCount}</p>
                <p className="text-xs text-rose-700/80 font-medium">Require follow-up</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient ID, receipt, program or transaction ID..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="captured">Captured</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="net">Net Banking</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="program">Program</SelectItem>
                  <SelectItem value="installment">Installment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(txSearch || statusFilter !== "all" || modeFilter !== "all" || typeFilter !== "all") && (
            <p className="text-[11px] text-amber-600 font-medium mt-3 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Filters apply to the current page only.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-900 hover:to-slate-800 border-b-0">
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Patient</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Type / Program</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Amount</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Method</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Razorpay ID</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Date</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-slate-200 rounded w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredTx.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-slate-500">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTx.map((tx) => {
                    const statusCfg = getStatusCfg(tx.status)
                    // FIX: keyed by tx.id — never mismatches with hook internals
                    const isInvLoading = invoiceLoadingTxId === tx.id
                    return (
                      <TableRow key={tx.id} className="hover:bg-slate-50/60 transition-colors">

                        {/* Patient */}
                        <TableCell className="font-medium text-slate-900">
                          {getPatientName(tx)}
                          {/* {(tx.patient_id || (tx as any).patient?.phone) && (
                            <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate max-w-[140px]">
                              {tx.patient_id || (tx as any).patient?.phone}
                            </p>
                          )} */}
                        </TableCell>

                        {/* Type / Program */}
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {/* Show Phase Payment label if it's a phase payment */}
                            {(tx as any).installment_type === 'phase' ? (
                              <>
                                <span className="text-xs font-semibold text-blue-700">
                                  Phase Payment
                                </span>
                                {(tx as any).phase_number && (
                                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Phase {tx.phase_number} Paid — {fmt(getAmount(tx))}
                                  </span>
                                )}
                                {(tx as any).total_phases && tx.phase_number && (
                                  <span className="text-[10px] text-slate-500">
                                    of {tx.total_phases} phases
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-semibold text-slate-700 capitalize">
                                  {tx.payment_type ?? "—"}
                                </span>
                              </>
                            )}
                            {(tx as any).program?.name && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {(tx as any).program.name}
                              </span>
                            )}
                            {(tx as any).plan?.name && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {(tx as any).plan.name}
                              </span>
                            )}
                            {!(tx as any).program?.name && !(tx as any).plan?.name && (tx as any).metadata?.program_id && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                …{String((tx as any).metadata.program_id).slice(-8)}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="font-semibold text-slate-900">
                          {fmt(getAmount(tx))}
                        </TableCell>

                        {/* Method */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getModeIcon(getPaymentMode(tx))}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge className={statusCfg.cls} variant="outline">
                            <span className="flex items-center gap-1">{statusCfg.icon} {statusCfg.label}</span>
                          </Badge>
                        </TableCell>

                        {/* Payment ID */}
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-mono text-slate-700">
                              {tx.razorpay_payment_id
                                ? `…${tx.razorpay_payment_id.slice(-10)}`
                                : tx.razorpay_order_id
                                  ? `…${tx.razorpay_order_id.slice(-10)}`
                                  : tx.reference_id ?? "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-slate-600 text-sm">
                          {formatDate(tx.created_at)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right space-x-2">
                          <Button
  size="sm"
  variant="outline"
  disabled={invoiceLoadingTxId === tx.id}
  onClick={() => handleInvoiceDownload(tx)}
>
  {invoiceLoadingTxId === tx.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4 mr-1" />}
  Invoice
</Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setSelectedTx(tx); setShowDetailSheet(true) }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              {txLoading ? "Loading…" : (
                <>Page <span className="font-bold text-slate-900">{txMeta.page}</span> of <span className="font-bold text-slate-900">{txMeta.totalPages}</span> · <span className="font-bold text-slate-900">{txMeta.total}</span> total</>
              )}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-9 px-3 border-slate-300 font-semibold shadow-sm"
                disabled={!txMeta.hasPrev || txFetching || txLoading}
                onClick={() => setTxPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4 mr-1" />Prev
              </Button>
              <Button size="sm" variant="outline" className="h-9 px-3 border-slate-300 font-semibold shadow-sm"
                disabled={!txMeta.hasNext || txFetching || txLoading}
                onClick={() => setTxPage((p) => p + 1)}>
                Next<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Transaction Detail Dialog ── */}
      {/* Transaction Detail Sheet */}
      <Sheet open={showDetailSheet} onOpenChange={(open) => { setShowDetailSheet(open); if (!open) setSelectedTx(null) }}>
        <SheetContent className="sm:max-w-md p-0 overflow-hidden bg-slate-50 flex flex-col border-l shadow-2xl">
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-slate-900" />
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">Transaction Report</p>
              </div>
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <ReceiptText className="h-6 w-6 text-slate-900" />
                Details
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {selectedTx && (
              <>
                {/* Status & Amount Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Transaction Amount</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{fmt(getAmount(selectedTx))}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <IndianRupee className="h-6 w-6 text-slate-900" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Status</p>
                    {(() => {
                      const s = getStatusCfg(selectedTx.status)
                      return (
                        <Badge className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${s.cls}`}>
                          <span className="flex items-center gap-1.5">{s.icon} {s.label}</span>
                        </Badge>
                      )
                    })()}
                  </div>
                </div>

                {/* Primary Info */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 ml-1">Payment Information</h4>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
                    {[
                      { label: "Patient Name",    value: getPatientName(selectedTx), icon: <User className="h-3.5 w-3.5" /> },
                      { label: "Payment ID",      value: selectedTx.razorpay_payment_id ?? "—" },
                      { label: "Order ID",        value: selectedTx.razorpay_order_id ?? "—" },
                      { label: "Patient ID",      value: selectedTx.patient_id ?? "—" },
                      { label: "Payment Method",  value: getPaymentMode(selectedTx).replace(/_/g, " ") || "—", isCapitalize: true },
                      { label: "Date & Time",     value: formatDate(selectedTx.created_at) },
                    ].map(({ label, value, icon, isCapitalize }) => (
                      <div key={label} className="p-4 flex items-start justify-between gap-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                        <p className={cn("text-sm font-bold text-slate-900 text-right truncate flex items-center gap-2", isCapitalize && "capitalize")}>
                          {icon && <span className="text-slate-400">{icon}</span>}
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Program/Plan Info */}
                {((selectedTx as any).program || (selectedTx as any).plan) && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 ml-1">Service Details</h4>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
                      {(selectedTx as any).program && (
                        <div className="flex items-start justify-between">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program</p>
                          <p className="text-sm font-bold text-slate-900">{(selectedTx as any).program.name ?? "—"}</p>
                        </div>
                      )}
                      {(selectedTx as any).plan && (
                        <>
                          <div className="flex items-start justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</p>
                            <p className="text-sm font-bold text-slate-900">{(selectedTx as any).plan.name ?? "—"}</p>
                          </div>
                          <div className="flex items-start justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                            <p className="text-sm font-bold text-slate-900">{(selectedTx as any).plan.durationDays ? `${(selectedTx as any).plan.durationDays} days` : "—"}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {(selectedTx as any).metadata && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 ml-1">Additional Metadata</h4>
                    <div className="bg-slate-100/50 rounded-2xl border border-slate-200 p-4 grid grid-cols-2 gap-4">
                      {Object.entries((selectedTx as any).metadata).map(([k, v]) => (
                        <div key={k} className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{k.replace(/_/g, " ")}</p>
                          <p className="text-xs font-bold text-slate-700 break-all leading-relaxed">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedTx.notes && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 ml-1">Payment Notes</h4>
                    <div className="bg-amber-50 rounded-2xl border border-amber-200/50 p-4">
                      <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{selectedTx.notes}"</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-6 bg-white border-t space-y-3">
            {selectedTx && isSuccessfulTx(selectedTx) && selectedTx.patient_id && (
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                disabled={invoiceLoadingTxId === selectedTx.id || invFetching}
                onClick={async () => {
                  await handleInvoiceDownload(selectedTx)
                  setShowDetailSheet(false)
                }}
              >
                {(invoiceLoadingTxId === selectedTx.id || invFetching)
                  ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  : <Download className="h-4 w-4 mr-2" />
                }
                Download Invoice
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDetailSheet(false)}
              className="w-full border-slate-200 text-slate-500 h-11 font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-slate-50 transition-all rounded-xl"
            >
              Close Details
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Manual Payment Drawer (Right Side Sheet) ── */}
      <Sheet open={manualDialog} onOpenChange={(open) => { if (!open) { setManualDialog(false); setManualTx(null) } }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />Record Manual Payment
            </SheetTitle>
            {manualTx && (
              <p className="text-sm text-slate-500 mt-1">
                For patient <span className="font-semibold text-slate-700">{manualTx.patient_id}</span>
              </p>
            )}
          </SheetHeader>
          <div className="space-y-4 py-4">
            {/* Patient ID */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Patient <span className="text-rose-500">*</span></Label>
              <Select value={manualForm.patientId} onValueChange={handlePatientChange}>
                <SelectTrigger className="h-10 w-full border-slate-300">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="h-9 pl-9 border-slate-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {!patients || patients.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500">No patients found</div>
                  ) : (
                    patients?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-[10px] text-slate-500">{p.phone}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {manualFormErrors.patientId && <p className="text-xs text-rose-500">{manualFormErrors.patientId}</p>}
            </div>

            {/* Speciality, Program, Plan Dropdowns */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Speciality</Label>
                <Select value={selectedSpecialityId} onValueChange={handleSpecialityChange}>
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
                <Select value={selectedProgramId} onValueChange={handleProgramChange} disabled={!selectedSpecialityId}>
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
                <Select value={selectedPlanId} onValueChange={handlePlanChange} disabled={!selectedProgramId}>
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
                    <RadioGroupItem value="one-time" id="one-time" />
                    <Label htmlFor="one-time" className="text-sm font-medium cursor-pointer">One-time</Label>
                  </div>
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
                              className={phase.phase_number === 1 ? "bg-blue-50" : ""}
                            >
                              <TableCell className="text-xs font-medium">
                                {phase.phase_number === 1 && <span className="text-blue-600">Phase {phase.phase_number} (Selected)</span>}
                                {phase.phase_number !== 1 && <span className="text-slate-600">Phase {phase.phase_number}</span>}
                              </TableCell>
                              <TableCell className="text-xs font-semibold text-slate-900">{fmt(phase.amount)}</TableCell>
                              <TableCell className="text-xs">
                                {phase.phase_number === 1 ? (
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Amount (₹) <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number" 
                  min={1} 
                  value={manualForm.amount || ""} 
                  onChange={(e) => updateManualForm("amount", parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5000"
                  readOnly={installmentType === 'phase'}
                  className={`h-10 border-slate-300 ${manualFormErrors.amount ? "border-rose-400" : ""} ${installmentType === 'phase' ? 'bg-slate-50' : ''}`} 
                />
                {manualFormErrors.amount && <p className="text-xs text-rose-500">{manualFormErrors.amount}</p>}
                {installmentType === 'phase' && (
                  <p className="text-[10px] text-slate-500">Auto-populated from Phase 1 amount</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Payment Type</Label>
                <Select value={manualForm.paymentType} onValueChange={(v) => updateManualForm("paymentType", v)}>
                  <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="program">Program</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="installment">Installment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Payment Method</Label>
              <Select value={manualForm.paymentMethod} onValueChange={(v) => updateManualForm("paymentMethod", v)}>
                <SelectTrigger className="h-10 w-1/2 border-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_cash">Cash</SelectItem>
                  <SelectItem value="manual_cheque">Cheque</SelectItem>
                  <SelectItem value="manual_bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="manual_upi">UPI (Manual)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference ID and Lead ID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Reference ID</Label>
                <Input value={manualForm.referenceId} onChange={(e) => updateManualForm("referenceId", e.target.value)} placeholder="Cheque no., UTR…" className="h-10 border-slate-300" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Lead ID</Label>
                <Input value={manualForm.leadId} onChange={(e) => updateManualForm("leadId", e.target.value)} placeholder="Optional" className="h-10 border-slate-300" />
              </div>
            </div>

            {/* Receipt No. */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Receipt No.</Label>
              <Input value={manualForm.receipt} onChange={(e) => updateManualForm("receipt", e.target.value)} placeholder="Optional" className="h-10 border-slate-300" />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Notes</Label>
              <Textarea value={manualForm.notes} onChange={(e) => updateManualForm("notes", e.target.value)} placeholder="Any additional info…" className="border-slate-300 resize-none" rows={3} />
            </div>
          </div>
          <SheetFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setManualDialog(false); setManualTx(null) }} className="border-slate-300" disabled={manualPayLoading}>Cancel</Button>
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