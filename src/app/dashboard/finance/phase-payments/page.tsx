"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Search, Filter, CreditCard, IndianRupee,
  CheckCircle2, Clock, XCircle, RefreshCw,
  Copy, Download, Eye, TrendingUp, Wallet,
  ReceiptText, AlertTriangle, ChevronLeft, ChevronRight,
  Loader2, PlusCircle, Banknote, FileText, ExternalLink,
  Calendar, User, Phone, Mail, Target, Layers, Zap, Edit, X,
} from "lucide-react"
import { toast } from "sonner"
import type { Transaction, GetTransactionsResponse } from "@/types/transactions"
import { useTransactionsApi, type ManualPaymentPayload } from "@/hooks/use-transactions-api"
import { usePhaseConfigs, useCreatePhaseConfig, useUpdatePhaseConfig, useDeletePhaseConfig } from "@/hooks/use-phase-config"
import { usePlans } from "@/hooks/use-plans"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"

// ─── Types ───────────────────────────────────────────────────────────────────

interface PhasePayment {
  id: string
  patient_id: string
  patient_name: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  program: string
  total_amount: number
  total_phases: number
  completed_phases: number
  current_phase: number
  phase_amount: number
  next_phase_amount: number
  next_phase_date?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  phases: Phase[]
  created_at: string
  updated_at: string
}

interface Phase {
  phase_number: number
  amount: number
  due_date?: string
  status: 'pending' | 'paid' | 'overdue'
  paid_date?: string
  transaction_id?: string
}

interface PhaseConfigForm {
  planId: string
  phaseNumber: string
  label: string
  amount: string
  accessDays: string
  dueGapDays: string
  gracePeriodDays: string
  isActive: boolean
}

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

const getInitials = (name: string) => {
  const words = (name ?? "").trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const getPatientName = (payment: PhasePayment) => {
  if (payment.patient_name?.trim()) return payment.patient_name.trim()
  const parts = [payment.first_name, payment.last_name].filter(Boolean)
  if (parts.length) return parts.join(" ").trim()
  if (payment.phone) return payment.phone
  const pid = payment.patient_id ?? payment.id ?? ""
  return pid ? `Patient …${pid.slice(-8)}` : "Unknown"
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return { label: "Active", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> }
    case 'completed':
      return { label: "Completed", cls: "bg-blue-50 text-blue-700 border border-blue-200", icon: <CheckCircle2 className="h-3 w-3" /> }
    case 'paused':
      return { label: "Paused", cls: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Clock className="h-3 w-3" /> }
    case 'cancelled':
      return { label: "Cancelled", cls: "bg-rose-50 text-rose-700 border border-rose-200", icon: <XCircle className="h-3 w-3" /> }
    default:
      return { label: status, cls: "bg-slate-50 text-slate-600 border border-slate-200", icon: null }
  }
}

const getPhaseStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return { label: "Paid", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
    case 'pending':
      return { label: "Pending", cls: "bg-amber-50 text-amber-700 border border-amber-200" }
    case 'overdue':
      return { label: "Overdue", cls: "bg-rose-50 text-rose-700 border border-rose-200" }
    default:
      return { label: status, cls: "bg-slate-50 text-slate-600 border border-slate-200" }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhasePaymentsPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [apiData, setApiData] = useState<PhasePayment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [phaseFilter, setPhaseFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<PhasePayment | null>(null)
  const [detailsDialog, setDetailsDialog] = useState(false)
  
  // Phase Config Management State
  const [activeTab, setActiveTab] = useState<'payments' | 'config'>('config')
  const [configDialog, setConfigDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null)
  const [configForm, setConfigForm] = useState<PhaseConfigForm>({
    planId: '',
    phaseNumber: '',
    label: '',
    amount: '',
    accessDays: '',
    dueGapDays: '',
    gracePeriodDays: '',
    isActive: true
  })
  const [selectedPlanId, setSelectedPlanId] = useState<string>('b3645b2d-d0ff-4682-bef5-921927639d97')

  const limit = 10

  // ── Hooks ────────────────────────────────────────────────────────────────
  // const { data: plans, isLoading: isLoadingPlans } = usePlans()
  const plans=[
    {
      id: 'b3645b2d-d0ff-4682-bef5-921927639d97',
      name: 'Standard Plan',
      description: 'Basic plan with essential features',
    }
  ]
  const { data: phaseConfigs, isLoading: isLoadingConfigs } = usePhaseConfigs(selectedPlanId)
  const createPhaseConfig = useCreatePhaseConfig()
  const updatePhaseConfig = useUpdatePhaseConfig()
  const deletePhaseConfig = useDeletePhaseConfig()
  console.log(phaseConfigs,"phaseConfigs")
  // ── Phase Config Handlers ───────────────────────────────────────────────────
  const handleCreateConfig = () => {
    setEditingConfig(null)
    setConfigForm({
      planId: 'b3645b2d-d0ff-4682-bef5-921927639d97',
      phaseNumber: '',
      label: '',
      amount: '',
      accessDays: '',
      dueGapDays: '',
      gracePeriodDays: '',
      isActive: true
    })
    setConfigDialog(true)
  }

  const handleEditConfig = (config: any) => {
    setEditingConfig(config)
    setConfigForm({
      planId: config.plan_id,
      phaseNumber: config.phase_number.toString(),
      label: config.label,
      amount: config.amount.toString(),
      accessDays: config.access_days.toString(),
      dueGapDays: config.due_gap_days.toString(),
      gracePeriodDays: config.grace_period_days.toString(),
      isActive: config.is_active
    })
    setConfigDialog(true)
  }

  const handleNumberInput = (value: string, field: keyof PhaseConfigForm) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '')
    setConfigForm(prev => ({ ...prev, [field]: numericValue }))
  }

  const handleDecimalInput = (value: string, field: keyof PhaseConfigForm) => {
    // Allow numbers and decimal point
    const decimalValue = value.replace(/[^0-9.]/g, '')
    // Prevent multiple decimal points
    const parts = decimalValue.split('.')
    if (parts.length > 2) {
      setConfigForm(prev => ({ ...prev, [field]: parts[0] + '.' + parts.slice(1).join('') }))
    } else {
      setConfigForm(prev => ({ ...prev, [field]: decimalValue }))
    }
  }

  const getTotalAmount = () => {
    const currentPhaseAmount = configForm.amount ? parseFloat(configForm.amount) : 0
    const existingPhasesTotal = phaseConfigs?.data?.reduce((sum: number, phase: any) => {
      // Skip the current editing phase if updating
      if (editingConfig && phase.id === editingConfig.id) {
        return sum
      }
      // Only include active phases
      if (phase.is_active) {
        return sum + Number(phase.amount)
      }
      return sum
    }, 0) || 0

    return existingPhasesTotal + currentPhaseAmount
  }

  const handleSaveConfig = () => {
    if (!configForm.planId || !configForm.phaseNumber || !configForm.label || !configForm.amount || !configForm.accessDays) {
      toast.error('Please fill all required fields')
      return
    }

    const newAmount = parseFloat(configForm.amount)
    const totalAmount = getTotalAmount()

    // Check if total exceeds 15,000
    if (totalAmount > 15000) {
      toast.error(`Total amount cannot exceed ₹15,000. Current total: ₹${totalAmount.toLocaleString('en-IN')}`)
      return
    }

    const payload = {
      planId: configForm.planId,
      phaseNumber: parseInt(configForm.phaseNumber),
      label: configForm.label,
      amount: newAmount,
      accessDays: parseInt(configForm.accessDays),
      dueGapDays: configForm.dueGapDays ? parseInt(configForm.dueGapDays) : undefined,
      gracePeriodDays: configForm.gracePeriodDays ? parseInt(configForm.gracePeriodDays) : undefined,
    }

    if (editingConfig) {
      updatePhaseConfig.mutate({
        id: editingConfig.id,
        payload: {
          phaseNumber: parseInt(configForm.phaseNumber),
          label: configForm.label,
          amount: newAmount,
          accessDays: parseInt(configForm.accessDays),
          dueGapDays: configForm.dueGapDays ? parseInt(configForm.dueGapDays) : undefined,
          gracePeriodDays: configForm.gracePeriodDays ? parseInt(configForm.gracePeriodDays) : undefined,
          isActive: configForm.isActive
        }
      })
    } else {
      createPhaseConfig.mutate(payload)
    }
    
    setConfigDialog(false)
  }

  const handleDeleteConfig = (id: string) => {
    setDeletingConfigId(id)
    setDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (deletingConfigId) {
      deletePhaseConfig.mutate(deletingConfigId)
      setDeleteDialog(false)
      setDeletingConfigId(null)
    }
  }

  // ── Mock data fetch (replace with actual API call) ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Mock data - replace with actual API call
        const mockData: PhasePayment[] = [
          {
            id: "1",
            patient_id: "P001",
            patient_name: "John Doe",
            email: "john@example.com",
            phone: "+91 9876543210",
            program: "Weight Loss Program",
            total_amount: 50000,
            total_phases: 4,
            completed_phases: 2,
            current_phase: 3,
            phase_amount: 12500,
            next_phase_amount: 12500,
            next_phase_date: "2024-02-15",
            status: "active",
            created_at: "2024-01-01",
            updated_at: "2024-01-15",
            phases: [
              { phase_number: 1, amount: 12500, status: "paid", paid_date: "2024-01-05" },
              { phase_number: 2, amount: 12500, status: "paid", paid_date: "2024-01-20" },
              { phase_number: 3, amount: 12500, status: "pending", due_date: "2024-02-15" },
              { phase_number: 4, amount: 12500, status: "pending", due_date: "2024-03-15" },
            ]
          },
          {
            id: "2",
            patient_id: "P002",
            patient_name: "Jane Smith",
            email: "jane@example.com",
            phone: "+91 9876543211",
            program: "Diabetes Management",
            total_amount: 30000,
            total_phases: 3,
            completed_phases: 1,
            current_phase: 2,
            phase_amount: 10000,
            next_phase_amount: 10000,
            next_phase_date: "2024-02-10",
            status: "active",
            created_at: "2024-01-10",
            updated_at: "2024-01-25",
            phases: [
              { phase_number: 1, amount: 10000, status: "paid", paid_date: "2024-01-15" },
              { phase_number: 2, amount: 10000, status: "overdue", due_date: "2024-02-10" },
              { phase_number: 3, amount: 10000, status: "pending", due_date: "2024-03-10" },
            ]
          },
          {
            id: "3",
            patient_id: "P003",
            patient_name: "Mike Johnson",
            email: "mike@example.com",
            phone: "+91 9876543212",
            program: "Fitness Program",
            total_amount: 40000,
            total_phases: 4,
            completed_phases: 4,
            current_phase: 4,
            phase_amount: 10000,
            next_phase_amount: 0,
            status: "completed",
            created_at: "2023-12-01",
            updated_at: "2024-01-30",
            phases: [
              { phase_number: 1, amount: 10000, status: "paid", paid_date: "2023-12-05" },
              { phase_number: 2, amount: 10000, status: "paid", paid_date: "2023-12-20" },
              { phase_number: 3, amount: 10000, status: "paid", paid_date: "2024-01-05" },
              { phase_number: 4, amount: 10000, status: "paid", paid_date: "2024-01-30" },
            ]
          },
        ]
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setApiData(mockData)
      } catch (error) {
        console.error("Error fetching phase payments:", error)
        toast.error("Failed to load phase payments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filteredPayments = useMemo(() => {
    const q = search.toLowerCase()
    return apiData.filter((payment) => {
      const matchSearch =
        !q ||
        getPatientName(payment).toLowerCase().includes(q) ||
        payment.patient_id.toLowerCase().includes(q) ||
        (payment.email ?? "").toLowerCase().includes(q) ||
        (payment.phone ?? "").toLowerCase().includes(q) ||
        payment.program.toLowerCase().includes(q)
      
      const matchStatus = statusFilter === "all" || payment.status === statusFilter
      const matchPhase = phaseFilter === "all" || 
        (phaseFilter === "overdue" && payment.phases.some(p => p.status === 'overdue')) ||
        (phaseFilter === "pending" && payment.phases.some(p => p.status === 'pending'))
      
      return matchSearch && matchStatus && matchPhase
    })
  }, [apiData, search, statusFilter, phaseFilter])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalPrograms = apiData.length
  const activePrograms = apiData.filter(p => p.status === 'active').length
  const completedPrograms = apiData.filter(p => p.status === 'completed').length
  const totalRevenue = apiData.reduce((sum, payment) => sum + payment.total_amount, 0)
  const collectedRevenue = apiData.reduce((sum, payment) => 
    sum + (payment.completed_phases * payment.phase_amount), 0)
  const pendingRevenue = totalRevenue - collectedRevenue

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleViewDetails = (payment: PhasePayment) => {
    setSelectedPayment(payment)
    setDetailsDialog(true)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">

      {/* ── Header ── */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-slate-900" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
              Clinic Portal / Finance / Phase Payments
            </p>
          </div>
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Phase Payments & Configuration</h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                Manage installment-based payment programs and configure payment phases.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {activeTab === 'config' && (
                <Button 
                  onClick={handleCreateConfig}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-900/20"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Phase Config
                </Button>
              )}
              <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'config'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Phase Configuration
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Total Programs</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : totalPrograms}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Active payment plans</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-3 w-3 text-blue-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Active</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : activePrograms}</p>
                <p className="text-xs text-blue-700/80 font-medium">Ongoing programs</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee className="h-3 w-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Collected</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : fmt(collectedRevenue)}</p>
                <p className="text-xs text-amber-700/80 font-medium">Total collected</p>
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
                  <Target className="h-3 w-3 text-rose-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">Pending</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : fmt(pendingRevenue)}</p>
                <p className="text-xs text-rose-700/80 font-medium">To be collected</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === 'payments' ? (
        <>
          {/* Search & Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by patient name, ID, program..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 border-slate-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="w-32 border-slate-300">
                  <SelectValue placeholder="Phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="pending">Has Pending</SelectItem>
                  <SelectItem value="overdue">Has Overdue</SelectItem>
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
              ) : filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Layers className="h-12 w-12 mb-4 text-slate-300" />
                  <p className="text-lg font-medium">No phase programs found</p>
                  <p className="text-sm text-slate-400 mt-1">Create your first phase-based payment program</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 border-b border-slate-200">
                        <TableHead className="w-12 text-left font-semibold text-slate-700">ID</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Patient</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Program</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Progress</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Total Amount</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Collected</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Pending</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => {
                        const progress = (payment.completed_phases / payment.total_phases) * 100
                        const collected = payment.completed_phases * payment.phase_amount
                        const pending = payment.total_amount - collected
                        
                        return (
                          <TableRow key={payment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <TableCell className="text-slate-600 text-sm">…{String(payment.id).slice(-8)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                                  {getInitials(getPatientName(payment))}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{getPatientName(payment)}</p>
                                  <p className="text-xs text-slate-500">ID: {payment.patient_id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">{payment.program}</TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600">{payment.completed_phases}/{payment.total_phases} phases</span>
                                  <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-slate-900">{fmt(payment.total_amount)}</TableCell>
                            <TableCell className="font-semibold text-emerald-600">{fmt(collected)}</TableCell>
                            <TableCell className="font-semibold text-rose-600">{fmt(pending)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusConfig(payment.status).cls}>
                                {getStatusConfig(payment.status).icon}
                                {getStatusConfig(payment.status).label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(payment)}
                                  className="border-slate-300 hover:bg-slate-50"
                                >
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
        </>
      ) : (
        /* Phase Configuration Tab */
        <>
          {/* Plan Selection */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-sm">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Select Plan</Label>
              <Select value="b3645b2d-d0ff-4682-bef5-921927639d97">
                <SelectTrigger className="border-slate-300 bg-slate-50">
                  <SelectValue placeholder="Standard Plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phase Configurations Table */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              { isLoadingConfigs ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : !phaseConfigs?.data?.length ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Layers className="h-12 w-12 mb-4 text-slate-300" />
                  <p className="text-lg font-medium">No phase configurations found</p>
                  <p className="text-sm text-slate-400 mt-1">Create your first phase configuration for this plan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 border-b border-slate-200">
                        <TableHead className="text-left font-semibold text-slate-700">Phase</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Label</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Amount</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Access Days</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Due Gap</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Grace Period</TableHead>
                        <TableHead className="text-left font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {phaseConfigs.data.map((config: any) => (
                        <TableRow key={config.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <TableCell className="font-medium text-slate-900">{config.phase_number}</TableCell>
                          <TableCell className="text-sm text-slate-600">{config.label}</TableCell>
                          <TableCell className="font-semibold text-slate-900">{fmt(config.amount)}</TableCell>
                          <TableCell className="text-sm text-slate-600">{config.access_days} days</TableCell>
                          <TableCell className="text-sm text-slate-600">{config.due_gap_days} days</TableCell>
                          <TableCell className="text-sm text-slate-600">{config.grace_period_days} days</TableCell>
                          <TableCell>
                            <Badge className={config.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-600 border border-slate-200"}>
                              {config.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditConfig(config)}
                                className="border-slate-300 hover:bg-slate-50"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteConfig(config.id)}
                                className="border-red-300 hover:bg-red-50 text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Phase Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Name</p>
                    <p className="font-medium text-slate-900">{getPatientName(selectedPayment)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Patient ID</p>
                    <p className="font-medium text-slate-900">{selectedPayment.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Email</p>
                    <p className="font-medium text-slate-900">{selectedPayment.email || "â"}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Phone</p>
                    <p className="font-medium text-slate-900">{selectedPayment.phone || "â"}</p>
                  </div>
                </div>
              </div>

              {/* Program Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Program Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Program</p>
                    <p className="font-medium text-slate-900">{selectedPayment.program}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Status</p>
                    <Badge className={getStatusConfig(selectedPayment.status).cls}>
                      {getStatusConfig(selectedPayment.status).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-slate-600">Total Amount</p>
                    <p className="font-medium text-slate-900">{fmt(selectedPayment.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Phase Amount</p>
                    <p className="font-medium text-slate-900">{fmt(selectedPayment.phase_amount)}</p>
                  </div>
                </div>
              </div>

              {/* Phases */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Phase Breakdown</h3>
                <div className="space-y-2">
                  {selectedPayment.phases.map((phase) => (
                    <div key={phase.phase_number} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                          {phase.phase_number}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Phase {phase.phase_number}</p>
                          <p className="text-sm text-slate-600">{fmt(phase.amount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          {phase.due_date && (
                            <p className="text-slate-600">Due: {formatDate(phase.due_date)}</p>
                          )}
                          {phase.paid_date && (
                            <p className="text-emerald-600">Paid: {formatDate(phase.paid_date)}</p>
                          )}
                        </div>
                        <Badge className={getPhaseStatusConfig(phase.status).cls}>
                          {getPhaseStatusConfig(phase.status).label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phase Configuration Drawer */}
      <Sheet open={configDialog} onOpenChange={setConfigDialog}>
        <SheetContent className="sm:max-w-[500px] p-0 bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              {editingConfig ? 'Edit Phase Configuration' : 'Create Phase Configuration'}
            </SheetTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
              {editingConfig ? 'Modify existing phase settings' : 'Configure new payment phase for Standard Plan'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Existing Phases Summary */}
            {phaseConfigs?.data && phaseConfigs.data.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Active Phases
                </h4>
                <div className="space-y-2">
                  {phaseConfigs.data.filter((phase: any) => phase.is_active).map((phase: any) => (
                    <div key={phase.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-800">Phase {phase.phase_number}</span>
                        <span className="text-blue-600">{phase.label}</span>
                      </div>
                      <span className="font-semibold text-blue-900">
                        {fmt(phase.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-900">Current Total:</span>
                      <span className="font-bold text-blue-900 text-lg">
                        {fmt(phaseConfigs.data.filter((phase: any) => phase.is_active).reduce((sum: number, phase: any) =>
                            sum + Number(phase.amount), 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Plan *</Label>
                <Select
                  value={configForm.planId}
                  onValueChange={(value) => setConfigForm(prev => ({ ...prev, planId: value }))}
                >
                  <SelectTrigger className="border-slate-300 bg-white">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">Select the plan for this phase</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Phase Number *</Label>
                <Input
                  value={configForm.phaseNumber}
                  onChange={(e) => handleNumberInput(e.target.value, 'phaseNumber')}
                  placeholder="1"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Sequence number (1, 2, 3...)</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Phase Label *</Label>
                <Input
                  value={configForm.label}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Phase 1: Initial Consultation"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Name displayed to patients</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Amount (INR) *</Label>
                  <Input
                    value={configForm.amount}
                    onChange={(e) => handleDecimalInput(e.target.value, 'amount')}
                    placeholder="5000"
                    className={`border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${
                      getTotalAmount() > 15000 ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                  />
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-slate-500">Price of the phase</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Total with this phase:</span>
                      <span className={`font-semibold ${
                        getTotalAmount() > 15000 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {fmt(getTotalAmount())}
                      </span>
                    </div>
                    {getTotalAmount() > 15000 && (
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ Exceeds ₹15,000 limit by {fmt(getTotalAmount() - 15000)}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Access Days *</Label>
                  <Input
                    value={configForm.accessDays}
                    onChange={(e) => handleNumberInput(e.target.value, 'accessDays')}
                    placeholder="30"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Duration of access</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Due Gap Days</Label>
                  <Input
                    value={configForm.dueGapDays}
                    onChange={(e) => handleNumberInput(e.target.value, 'dueGapDays')}
                    placeholder="0"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Days wait before due (Default: 30)</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">Grace Period Days</Label>
                  <Input
                    value={configForm.gracePeriodDays}
                    onChange={(e) => handleNumberInput(e.target.value, 'gracePeriodDays')}
                    placeholder="3"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Extra days before soft-lock (Default: 3)</p>
                </div>
              </div>
              
              {editingConfig && (
                <div className="flex items-center space-x-3 p-4 bg-slate-100 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={configForm.isActive}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                    Active
                  </Label>
                  <p className="text-xs text-slate-500">Enable this phase configuration</p>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t p-6 flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setConfigDialog(false)}
              className="flex-1 border-slate-300 hover:bg-slate-50 h-11 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveConfig}
              disabled={createPhaseConfig.isPending || updatePhaseConfig.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-11 font-semibold"
            >
              {createPhaseConfig.isPending || updatePhaseConfig.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingConfig ? 'Update' : 'Create'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Delete Phase Configuration</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this phase configuration? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialog(false)
                setDeletingConfigId(null)
              }}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deletePhaseConfig.isPending}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePhaseConfig.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
