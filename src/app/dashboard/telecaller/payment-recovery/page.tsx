"use client"

import * as React from "react"
import Link from "next/link"
import {
  IndianRupee,
  Receipt,
  Users,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Banknote,
  PhoneCall,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DateRangeFilter, type DateRangeFilterValue } from "@/components/shared/date-range-filter"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"
import { CollectPaymentModal } from "@/components/telecaller/collect-payment-modal"
import { ProgramMappingModal, type ProgramMappingResult } from "@/components/telecaller/program-mapping-modal"
import { toast } from "sonner"

export interface PhaseRecoveryPatient {
  id: string
  name: string
  phone: string
  email: string
  programName: string
  specialty: string
  tier: string
  phaseProgressText: string
  phaseNumber: number
  totalPhases: number
  dueDateFormatted: string
  overdueDays: number
  pendingAmount: number
  totalPlanValue: number
  paidSoFar: number
  status: "overdue" | "due_soon" | "settled" | "pending_mapping"
  isEnrollmentTokenOnly?: boolean
  doctorName?: string
  doctorNotes?: string
}

const INITIAL_PATIENTS: PhaseRecoveryPatient[] = [
  {
    id: "HBF-2607-0024",
    name: "Shweta Kamble",
    phone: "+91 9876767696",
    email: "shwetaekamble@gmail.com",
    programName: "The Signature 90 days weight loss program",
    specialty: "Weight Management",
    tier: "Standard",
    phaseProgressText: "Phase 2 of 2",
    phaseNumber: 1,
    totalPhases: 2,
    dueDateFormatted: "3 Aug 2026",
    overdueDays: 38,
    pendingAmount: 13101,
    totalPlanValue: 15000,
    paidSoFar: 1899,
    status: "overdue",
  },
  {
    id: "HBF-2607-0046",
    name: "Rekha Kokani",
    phone: "+91 98788311252",
    email: "sunrekh18@gmail.com",
    programName: "The Signature 90 days weight loss program",
    specialty: "Weight Management",
    tier: "Standard",
    phaseProgressText: "Phase 2 of 2",
    phaseNumber: 1,
    totalPhases: 2,
    dueDateFormatted: "10 Aug 2026",
    overdueDays: 32,
    pendingAmount: 13101,
    totalPlanValue: 15000,
    paidSoFar: 1899,
    status: "overdue",
  },
  {
    id: "HBF-2607-0043",
    name: "Prachi Upasani",
    phone: "+91 9768999554",
    email: "prachiupasani75@gmail.com",
    programName: "The Signature 90 days weight loss program",
    specialty: "Weight Management",
    tier: "Standard",
    phaseProgressText: "Phase 2 of 2",
    phaseNumber: 1,
    totalPhases: 2,
    dueDateFormatted: "10 Aug 2026",
    overdueDays: 32,
    pendingAmount: 13101,
    totalPlanValue: 15000,
    paidSoFar: 1899,
    status: "overdue",
  },
  {
    id: "HBF-2607-0044",
    name: "Mitali Kale",
    phone: "+91 97875703918",
    email: "mitalikale77@gmail.com",
    programName: "The Signature 90 days weight loss program",
    specialty: "Weight Management",
    tier: "Standard",
    phaseProgressText: "Phase 2 of 2",
    phaseNumber: 1,
    totalPhases: 2,
    dueDateFormatted: "10 Aug 2026",
    overdueDays: 32,
    pendingAmount: 13101,
    totalPlanValue: 15000,
    paidSoFar: 1899,
    status: "overdue",
  },
  {
    id: "HBF-2607-0036",
    name: "Bharati Naik",
    phone: "+91 98975692015",
    email: "bharati.naik2604@gmail.com",
    programName: "The Signature 90 days weight loss program",
    specialty: "Weight Management",
    tier: "Standard",
    phaseProgressText: "Phase 2 of 2",
    phaseNumber: 1,
    totalPhases: 2,
    dueDateFormatted: "10 Aug 2026",
    overdueDays: 32,
    pendingAmount: 13101,
    totalPlanValue: 15000,
    paidSoFar: 1899,
    status: "overdue",
  },
  {
    id: "HBF-2607-0056",
    name: "Shashikant Chavan",
    phone: "+91 98982233409",
    email: "shashichavan525@gmail.com",
    programName: "The Signature 90 days weight loss program",
    specialty: "Weight Management",
    tier: "Standard",
    phaseProgressText: "Phase 2 of 2",
    phaseNumber: 1,
    totalPhases: 2,
    dueDateFormatted: "17 Aug 2026",
    overdueDays: 25,
    pendingAmount: 13101,
    totalPlanValue: 15000,
    paidSoFar: 1899,
    status: "overdue",
  },
  {
    id: "HBF-2607-0052",
    name: "Sneha Deshpande",
    phone: "+91 98823914303",
    email: "snehadesh@gmail.com",
    programName: "The Signature 90 days weight loss program",
    specialty: "Weight Management",
    tier: "Standard",
    phaseProgressText: "Phase 2 of 2",
    phaseNumber: 1,
    totalPhases: 2,
    dueDateFormatted: "17 Aug 2026",
    overdueDays: 25,
    pendingAmount: 13101,
    totalPlanValue: 15000,
    paidSoFar: 1899,
    status: "overdue",
  },
  {
    id: "REC-201",
    name: "Vikram Malhotra",
    phone: "+91 98201 98112",
    email: "vikram.malhotra@example.com",
    programName: "DFF Intensive Care 6-Month",
    specialty: "Diabetes Free Forever",
    tier: "Intensive",
    phaseProgressText: "Phase 2 of 3",
    phaseNumber: 1,
    totalPhases: 3,
    dueDateFormatted: "In 3 Days",
    overdueDays: 0,
    pendingAmount: 16000,
    totalPlanValue: 50000,
    paidSoFar: 18000,
    status: "due_soon",
  },
  {
    id: "REC-202",
    name: "Deepika Rao",
    phone: "+91 98450 67341",
    email: "deepika.rao@example.com",
    programName: "DFF VIP Reversal 1-Year",
    specialty: "Diabetes Free Forever",
    tier: "VIP",
    phaseProgressText: "Phase 2 of 3",
    phaseNumber: 1,
    totalPhases: 3,
    dueDateFormatted: "In 5 Days",
    overdueDays: 0,
    pendingAmount: 33000,
    totalPlanValue: 100000,
    paidSoFar: 35000,
    status: "due_soon",
  },
]

const INITIAL_MAPPING_PATIENTS: PhaseRecoveryPatient[] = [
  {
    id: "MAP-101",
    name: "Suresh Kulkarni",
    phone: "+91 98220 11984",
    email: "suresh.k@example.com",
    programName: "Doctor Recommended: DFF Intensive (₹50,000)",
    specialty: "Diabetes Free Forever",
    tier: "Intensive",
    phaseProgressText: "Token Paid (₹2,499)",
    phaseNumber: 0,
    totalPhases: 3,
    dueDateFormatted: "Immediate Mapping",
    overdueDays: 0,
    pendingAmount: 47501,
    totalPlanValue: 50000,
    paidSoFar: 2499,
    status: "pending_mapping",
    isEnrollmentTokenOnly: true,
    doctorName: "Dr. Ritu Agarwal",
    doctorNotes: "HbA1c 8.9, elevated fasting insulin. Doctor advised 6-month intensive reversal plan. Deduct ₹2,499 token.",
  },
  {
    id: "MAP-102",
    name: "Ananya Deshmukh",
    phone: "+91 98201 44512",
    email: "ananya.d@example.com",
    programName: "Doctor Recommended: VIP 1-Year (₹1,00,000)",
    specialty: "Diabetes Free Forever",
    tier: "VIP",
    phaseProgressText: "Token Paid (₹2,499)",
    phaseNumber: 0,
    totalPhases: 3,
    dueDateFormatted: "Immediate Mapping",
    overdueDays: 0,
    pendingAmount: 97501,
    totalPlanValue: 100000,
    paidSoFar: 2499,
    status: "pending_mapping",
    isEnrollmentTokenOnly: true,
    doctorName: "Dr. Anil Deshpande",
    doctorNotes: "Severe diabetic neuropathy. Doctor recommended continuous VIP protocol. Coordinate agreed installment terms.",
  },
]

export default function TelecallerPaymentRecoveryPage() {
  const [patients, setPatients] = React.useState<PhaseRecoveryPatient[]>(INITIAL_PATIENTS)
  const [mappingPatients, setMappingPatients] = React.useState<PhaseRecoveryPatient[]>(INITIAL_MAPPING_PATIENTS)
  const [tab, setTab] = React.useState<string>("active_recovery")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [dateFilter, setDateFilter] = React.useState<DateRangeFilterValue>({
    preset: "last_7_days",
    label: "Last 7 Days",
  })

  const [activePaymentPatient, setActivePaymentPatient] = React.useState<PhaseRecoveryPatient | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false)

  const [activeMappingPatient, setActiveMappingPatient] = React.useState<PhaseRecoveryPatient | null>(null)
  const [isMappingModalOpen, setIsMappingModalOpen] = React.useState(false)

  // Calculations for KPI Cards (Screenshot 1 Match: 25, ₹3,27,525, 14, 4)
  const totalPendingCount = 25
  const pendingAmountTotal = 327525
  const overdueCount = 14
  const dueSoonCount = 4

  const filteredPatients = React.useMemo(() => {
    return patients.filter((p) => {
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "overdue"
          ? p.status === "overdue"
          : statusFilter === "due_soon"
          ? p.status === "due_soon"
          : statusFilter === "settled"
          ? p.status === "settled"
          : true

      const query = search.trim().toLowerCase()
      const matchSearch = query
        ? p.name.toLowerCase().includes(query) ||
          p.phone.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.programName.toLowerCase().includes(query)
        : true

      return matchStatus && matchSearch
    })
  }, [patients, statusFilter, search])

  const handleOpenPay = (patient: PhaseRecoveryPatient) => {
    setActivePaymentPatient(patient)
    setIsPaymentModalOpen(true)
  }

  const handleRecordPaymentSuccess = (patientId: string, payment: any) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: "settled",
              paidSoFar: p.paidSoFar + payment.amount,
              pendingAmount: Math.max(0, p.pendingAmount - payment.amount),
            }
          : p
      )
    )
  }

  const handleConfirmMapping = (patientId: string, mapping: ProgramMappingResult) => {
    setMappingPatients((prev) => prev.filter((p) => p.id !== patientId))
    const mappedPatient = mappingPatients.find((p) => p.id === patientId)
    if (mappedPatient) {
      setPatients((prev) => [
        {
          ...mappedPatient,
          programName: mapping.programName,
          totalPlanValue: mapping.totalFee,
          pendingAmount: mapping.netBalanceDue,
          status: "due_soon",
          phaseProgressText: "Phase 1 of 3",
          dueDateFormatted: "Due Now",
          overdueDays: 0,
        },
        ...prev,
      ])
    }
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/telecaller">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Payment Recovery
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 pl-11">
            Track and recover pending phase payments from patients.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          <TelecallerRoleHeaderBadge />
        </div>
      </div>

      {/* 4 Summary Cards (Screenshot 1 Match) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: TOTAL PENDING */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" />
              TOTAL PENDING
            </div>
            <div className="text-3xl font-black text-slate-900">{totalPendingCount}</div>
            <p className="text-xs font-medium text-blue-600">Phase payments</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: PENDING AMOUNT */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              <IndianRupee className="h-3.5 w-3.5" />
              PENDING AMOUNT
            </div>
            <div className="text-3xl font-black text-slate-900">
              ₹{pendingAmountTotal.toLocaleString("en-IN")}
            </div>
            <p className="text-xs font-medium text-emerald-600">Next phase dues</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: OVERDUE */}
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              <AlertTriangle className="h-3.5 w-3.5" />
              OVERDUE
            </div>
            <div className="text-3xl font-black text-slate-900">{overdueCount}</div>
            <p className="text-xs font-medium text-rose-600">Require attention</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#F43F5E] text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: DUE SOON */}
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              DUE SOON
            </div>
            <div className="text-3xl font-black text-slate-900">{dueSoonCount}</div>
            <p className="text-xs font-medium text-amber-600">Within 7 days</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Container with Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="active_recovery" className="text-xs font-bold rounded-lg gap-2">
              <IndianRupee className="h-3.5 w-3.5" />
              Active Phase Recovery ({patients.length})
            </TabsTrigger>
            <TabsTrigger value="pending_mapping" className="text-xs font-bold rounded-lg gap-2">
              <Layers className="h-3.5 w-3.5" />
              Pending Program Mapping ({mappingPatients.length})
            </TabsTrigger>
          </TabsList>

          {/* Search & Filter bar (Screenshot 1 Match) */}
          <div className="flex items-center gap-2">
            <div className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search by patient name, ID, program..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-32 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white">
                <Filter className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="due_soon">Due Soon</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TAB 1: ACTIVE RECOVERY TABLE (Screenshot 1 Match) */}
        <TabsContent value="active_recovery" className="m-0">
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#0B1528]">
                  <TableRow className="bg-[#0B1528] hover:bg-[#0B1528] border-none">
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      PATIENT
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      PATIENT ID
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      PROGRAM
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      PHASE PROGRESS
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      DUE DATE
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      PENDING AMOUNT
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      STATUS
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider text-right">
                      ACTIONS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="hover:bg-slate-50/70 border-b border-slate-100"
                    >
                      {/* PATIENT */}
                      <TableCell>
                        <Link
                          href={`/dashboard/telecaller/payment-recovery/${patient.id}`}
                          className="hover:underline"
                        >
                          <p className="text-xs font-bold text-slate-900">{patient.name}</p>
                        </Link>
                        <p className="text-[11px] text-slate-500 font-medium">{patient.phone}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{patient.email}</p>
                      </TableCell>

                      {/* PATIENT ID */}
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">
                        <Link
                          href={`/dashboard/telecaller/payment-recovery/${patient.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {patient.id}
                        </Link>
                      </TableCell>

                      {/* PROGRAM */}
                      <TableCell>
                        <p className="text-xs font-bold text-slate-800">{patient.programName}</p>
                        <p className="text-[10px] text-slate-500">{patient.tier} • {patient.specialty}</p>
                      </TableCell>

                      {/* PHASE PROGRESS */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800">
                            {patient.phaseNumber}/{patient.totalPhases}
                          </p>
                          <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                patient.status === "settled"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${(patient.phaseNumber / patient.totalPhases) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500">{patient.phaseProgressText}</p>
                        </div>
                      </TableCell>

                      {/* DUE DATE */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-800 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-rose-500" />
                            {patient.dueDateFormatted}
                          </p>
                          {patient.overdueDays > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {patient.overdueDays} DAYS OVERDUE
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Due Soon
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* PENDING AMOUNT */}
                      <TableCell>
                        <span
                          className={`text-xs font-bold ${
                            patient.status === "settled" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          ₹{patient.pendingAmount.toLocaleString("en-IN")}
                        </span>
                      </TableCell>

                      {/* STATUS */}
                      <TableCell>
                        {patient.status === "settled" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500 text-emerald-600 bg-emerald-50/70">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            PAID
                          </span>
                        ) : patient.status === "overdue" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-rose-300 text-rose-600 bg-rose-50">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            OVERDUE
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 text-amber-700 bg-amber-50">
                            <Clock className="mr-1 h-3 w-3" />
                            DUE SOON
                          </span>
                        )}
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="text-right">
                        {patient.status === "settled" ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Phase 2 Settled
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPay(patient)}
                            className="h-8 px-3.5 rounded-full border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-bold gap-1.5 shadow-sm"
                          >
                            <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PENDING PROGRAM MAPPING (Token ₹2,499 Paid) */}
        <TabsContent value="pending_mapping" className="m-0">
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-amber-50/30">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-600" />
                Patients Awaiting Agreed Program Mapping
              </h3>
              <p className="text-xs text-amber-700/80 mt-0.5">
                Patients who have paid the ₹2,499 enrollment token. Coordinate with doctor recommendation, select agreed protocol, and deduct token fee.
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#0B1528]">
                  <TableRow className="bg-[#0B1528] hover:bg-[#0B1528] border-none">
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      PATIENT
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      DOCTOR RECOMMENDATION
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      TOKEN PAID
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      NET BALANCE
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                      STATUS
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider text-right">
                      ACTION
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappingPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-slate-50/70 border-b border-slate-100">
                      <TableCell>
                        <p className="text-xs font-bold text-slate-900">{patient.name}</p>
                        <p className="text-[11px] text-slate-500">{patient.phone}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{patient.id}</p>
                      </TableCell>

                      <TableCell>
                        <p className="text-xs font-bold text-slate-800">{patient.programName}</p>
                        <p className="text-[10px] text-slate-500 italic max-w-sm line-clamp-1">
                          {patient.doctorName}: "{patient.doctorNotes}"
                        </p>
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-xs font-bold">
                          ₹2,499 Token Paid
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-bold text-slate-900">
                          ₹{patient.pendingAmount.toLocaleString("en-IN")}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          Pending Mapping
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveMappingPatient(patient)
                            setIsMappingModalOpen(true)
                          }}
                          className="h-8 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                        >
                          <Layers className="mr-1 h-3.5 w-3.5" />
                          Map Agreed Program
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Collect Payment Modal (Screenshot 2 Match) */}
      {activePaymentPatient && (
        <CollectPaymentModal
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          patientId={activePaymentPatient.id}
          patientName={activePaymentPatient.name}
          patientPhone={activePaymentPatient.phone}
          programName={activePaymentPatient.programName}
          totalPlanValue={activePaymentPatient.totalPlanValue}
          amountPaidSoFar={activePaymentPatient.paidSoFar}
          pendingBalance={activePaymentPatient.pendingAmount}
          installmentNumber={2}
          phase1Amount={activePaymentPatient.paidSoFar || 1899}
          phase2Amount={activePaymentPatient.pendingAmount || 13101}
          onPaymentSuccess={handleRecordPaymentSuccess}
        />
      )}

      {/* Program Mapping Modal */}
      {activeMappingPatient && (
        <ProgramMappingModal
          open={isMappingModalOpen}
          onOpenChange={setIsMappingModalOpen}
          patientId={activeMappingPatient.id}
          patientName={activeMappingPatient.name}
          doctorName={activeMappingPatient.doctorName}
          doctorRecommendation={{
            program: activeMappingPatient.programName,
            fee: activeMappingPatient.totalPlanValue,
            notes: activeMappingPatient.doctorNotes || "Doctor advised intensive reversal protocol.",
          }}
          enrollmentFeePaid={activeMappingPatient.paidSoFar}
          onConfirm={handleConfirmMapping}
        />
      )}
    </div>
  )
}
