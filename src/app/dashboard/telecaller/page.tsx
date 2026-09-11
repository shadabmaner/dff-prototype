"use client"

import * as React from "react"
import {
  PhoneCall,
  IndianRupee,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Search,
  ExternalLink,
  Receipt,
  MapPin,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/ui/stat-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DateRangeFilter, type DateRangeFilterValue } from "@/components/shared/date-range-filter"
import {
  useTelecallerRoleStore,
  type TelecallerRoleType,
} from "@/store/telecaller-role-store"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"

// Modals
import { CareTeamAssignmentModal, type CareTeamData } from "@/components/telecaller/care-team-assignment-modal"
import { WelcomeCallModal } from "@/components/telecaller/welcome-call-modal"
import { ProgramMappingModal, type ProgramMappingResult } from "@/components/telecaller/program-mapping-modal"
import { CollectPaymentModal } from "@/components/telecaller/collect-payment-modal"
import { CampReminderModal, type CampReminderData } from "@/components/telecaller/camp-reminder-modal"
import { CampCallLogModal } from "@/components/telecaller/camp-call-log-modal"

// Types
interface WelcomeItem {
  id: string
  name: string
  phone: string
  specialty: string
  amountPaid: number
  paymentDate: string
  city: string
  careTeamAssigned: boolean
  careTeam?: CareTeamData
  welcomeCallStatus: "pending" | "scheduled" | "completed"
  callDuration?: number
}

interface RecoveryItem {
  id: string
  name: string
  phone: string
  programName: string
  totalPlanValue: number
  amountPaidSoFar: number
  pendingBalance: number
  dueDate: string
  overdueDays: number
  status: "pending_program_mapping" | "active_recovery" | "paid" | "follow_up"
  installmentNumber: number
  totalInstallments: number
  isEnrollmentTokenOnly?: boolean
  doctorName?: string
  doctorNotes?: string
}

interface CampItem {
  id: string
  name: string
  phone: string
  protocol: string
  tenureDays: number
  clinicalImprovement: string
  campLocation: string
  status: "eligible" | "reminder_sent" | "call_logged" | "seat_reserved"
  city: string
  callNotes?: string
}

// Initial Mock Datasets
const INITIAL_WELCOME_QUEUE: WelcomeItem[] = [
  {
    id: "WP-101",
    name: "Sunita Deshmukh",
    phone: "+91 98201 44512",
    specialty: "Diabetes Free Forever",
    amountPaid: 24999,
    paymentDate: "Today, 10:30 AM",
    city: "Mumbai",
    careTeamAssigned: false,
    welcomeCallStatus: "pending",
  },
  {
    id: "WP-102",
    name: "Rameshwar Patil",
    phone: "+91 98450 78123",
    specialty: "Diabetes Free Forever",
    amountPaid: 24999,
    paymentDate: "Today, 09:15 AM",
    city: "Pune",
    careTeamAssigned: true,
    careTeam: {
      doctor: "Dr. Ritu Agarwal",
      dietitian: "Sneha Phadke",
      fitnessCoach: "Rahul Patil",
      mindsetCoach: "Dr. Manisha Joshi",
      mentor: "Kavita Kulkarni",
    },
    welcomeCallStatus: "pending",
  },
  {
    id: "WP-103",
    name: "Kavita Iyer",
    phone: "+91 98231 66789",
    specialty: "PCOS Care",
    amountPaid: 14999,
    paymentDate: "Yesterday",
    city: "Bengaluru",
    careTeamAssigned: true,
    careTeam: {
      doctor: "Dr. Anil Deshpande",
      dietitian: "Pooja Sharma",
      fitnessCoach: "Pooja Nair",
      mindsetCoach: "Aarav Mehta",
      mentor: "Suresh Sawant",
    },
    welcomeCallStatus: "completed",
    callDuration: 15,
  },
]

const INITIAL_RECOVERY_QUEUE: RecoveryItem[] = [
  {
    id: "HBF-2607-0024",
    name: "Shweta Kamble",
    phone: "+91 9876767696",
    programName: "The Signature 90 days weight loss program",
    totalPlanValue: 15000,
    amountPaidSoFar: 1899,
    pendingBalance: 13101,
    dueDate: "38 Days Overdue",
    overdueDays: 38,
    status: "active_recovery",
    installmentNumber: 2,
    totalInstallments: 2,
  },
  {
    id: "HBF-2607-0046",
    name: "Rekha Kokani",
    phone: "+91 98788311252",
    programName: "The Signature 90 days weight loss program",
    totalPlanValue: 15000,
    amountPaidSoFar: 1899,
    pendingBalance: 13101,
    dueDate: "32 Days Overdue",
    overdueDays: 32,
    status: "active_recovery",
    installmentNumber: 2,
    totalInstallments: 2,
  },
  {
    id: "REC-201",
    name: "Vikram Malhotra",
    phone: "+91 98201 98112",
    programName: "Pending Mapping (Dr. Recommended: 50K Intensive)",
    totalPlanValue: 50000,
    amountPaidSoFar: 2499,
    pendingBalance: 47501,
    dueDate: "Immediate Mapping Required",
    overdueDays: 0,
    status: "pending_program_mapping",
    installmentNumber: 1,
    totalInstallments: 3,
    isEnrollmentTokenOnly: true,
    doctorName: "Dr. Ritu Agarwal",
    doctorNotes: "HbA1c 8.9, 12 years diabetic. Needs 6-month intensive care. Coordinate agreed program with patient.",
  },
  {
    id: "REC-202",
    name: "Deepika Rao",
    phone: "+91 98450 67341",
    programName: "Pending Mapping (Dr. Recommended: 1 Lakh VIP)",
    totalPlanValue: 100000,
    amountPaidSoFar: 2499,
    pendingBalance: 97501,
    dueDate: "Assessment Completed Today",
    overdueDays: 0,
    status: "pending_program_mapping",
    installmentNumber: 1,
    totalInstallments: 3,
    isEnrollmentTokenOnly: true,
    doctorName: "Dr. Anil Deshpande",
    doctorNotes: "Severe diabetic neuropathy. Doctor advised VIP continuous monitoring. Reconcile 2499 token.",
  },
  {
    id: "HBF-2607-0043",
    name: "Prachi Upasani",
    phone: "+91 9768999554",
    programName: "The Signature 90 days weight loss program",
    totalPlanValue: 15000,
    amountPaidSoFar: 1899,
    pendingBalance: 13101,
    dueDate: "32 Days Overdue",
    overdueDays: 32,
    status: "active_recovery",
    installmentNumber: 2,
    totalInstallments: 2,
  },
  {
    id: "HBF-2607-0044",
    name: "Mitali Kale",
    phone: "+91 97875703918",
    programName: "The Signature 90 days weight loss program",
    totalPlanValue: 15000,
    amountPaidSoFar: 1899,
    pendingBalance: 13101,
    dueDate: "32 Days Overdue",
    overdueDays: 32,
    status: "active_recovery",
    installmentNumber: 2,
    totalInstallments: 2,
  },
]

const INITIAL_CAMP_QUEUE: CampItem[] = [
  {
    id: "CP-301",
    name: "Harishchandra Mehta",
    phone: "+91 98210 55432",
    protocol: "DFF VIP Annual Reversal Care",
    tenureDays: 110,
    clinicalImprovement: "HbA1c: 9.1 → 6.9% (-4.5 kg, Insulin stopped)",
    campLocation: "Lonavala Wellness Retreat",
    status: "eligible",
    city: "Mumbai",
  },
  {
    id: "CP-302",
    name: "Sunanda Kadam",
    phone: "+91 98450 12908",
    protocol: "DFF Standard Care (6 Months)",
    tenureDays: 98,
    clinicalImprovement: "HbA1c: 8.4 → 6.7% (Fasting 104 mg/dL)",
    campLocation: "Lonavala Wellness Retreat",
    status: "reminder_sent",
    city: "Pune",
  },
  {
    id: "CP-303",
    name: "Ashok Singhania",
    phone: "+91 98190 77654",
    protocol: "DFF VIP Annual Reversal Care",
    tenureDays: 125,
    clinicalImprovement: "Off 40 units Lantus insulin, HbA1c 6.5%",
    campLocation: "Mahabaleshwar Mountain Healing Camp",
    status: "seat_reserved",
    city: "Delhi",
    callNotes: "Seat reserved @ ₹35,000. Flight to Pune booked for Oct 12.",
  },
]

export default function TelecallerDashboardPage() {
  const { currentRole, setCurrentRole, getProfile } = useTelecallerRoleStore()
  const profile = getProfile()

  const [dateFilter, setDateFilter] = React.useState<DateRangeFilterValue>({
    preset: "last_7_days",
    label: "Last 7 Days",
  })

  const [search, setSearch] = React.useState("")

  // Queues State
  const [welcomeQueue, setWelcomeQueue] = React.useState<WelcomeItem[]>(INITIAL_WELCOME_QUEUE)
  const [recoveryQueue, setRecoveryQueue] = React.useState<RecoveryItem[]>(INITIAL_RECOVERY_QUEUE)
  const [campQueue, setCampQueue] = React.useState<CampItem[]>(INITIAL_CAMP_QUEUE)

  // Modal Triggers
  const [activeWelcomePatient, setActiveWelcomePatient] = React.useState<WelcomeItem | null>(null)
  const [isCareTeamModalOpen, setIsCareTeamModalOpen] = React.useState(false)
  const [isWelcomeCallModalOpen, setIsWelcomeCallModalOpen] = React.useState(false)

  const [activeRecoveryPatient, setActiveRecoveryPatient] = React.useState<RecoveryItem | null>(null)
  const [isProgramMappingModalOpen, setIsProgramMappingModalOpen] = React.useState(false)
  const [isCollectPaymentModalOpen, setIsCollectPaymentModalOpen] = React.useState(false)

  const [activeCampPatient, setActiveCampPatient] = React.useState<CampItem | null>(null)
  const [isCampReminderModalOpen, setIsCampReminderModalOpen] = React.useState(false)
  const [isCampCallLogModalOpen, setIsCampCallLogModalOpen] = React.useState(false)

  // Welcome Handlers
  const handleSaveCareTeam = (patientId: string, team: CareTeamData) => {
    setWelcomeQueue((prev) =>
      prev.map((item) => (item.id === patientId ? { ...item, careTeamAssigned: true, careTeam: team } : item))
    )
  }

  const handleCompleteWelcomeCall = (patientId: string, log: any) => {
    setWelcomeQueue((prev) =>
      prev.map((item) =>
        item.id === patientId
          ? {
              ...item,
              welcomeCallStatus: "completed",
              callDuration: log.durationMins,
            }
          : item
      )
    )
  }

  // Recovery Handlers
  const handleConfirmProgramMapping = (patientId: string, mapping: ProgramMappingResult) => {
    setRecoveryQueue((prev) =>
      prev.map((item) =>
        item.id === patientId
          ? {
              ...item,
              programName: mapping.programName,
              totalPlanValue: mapping.totalFee,
              pendingBalance: mapping.netBalanceDue,
              status: "active_recovery",
              isEnrollmentTokenOnly: false,
              dueDate: "Phase 1 Due Now",
            }
          : item
      )
    )
  }

  const handleRecordPayment = (patientId: string, payment: any) => {
    setRecoveryQueue((prev) =>
      prev.map((item) =>
        item.id === patientId
          ? {
              ...item,
              amountPaidSoFar: item.amountPaidSoFar + payment.amount,
              pendingBalance: Math.max(0, item.pendingBalance - payment.amount),
              status: item.pendingBalance - payment.amount <= 0 ? "paid" : "active_recovery",
            }
          : item
      )
    )
  }

  // Camp Handlers
  const handleSendCampReminder = (patientId: string, data: CampReminderData) => {
    setCampQueue((prev) =>
      prev.map((item) =>
        item.id === patientId
          ? {
              ...item,
              status: "reminder_sent",
              campLocation: data.location.split("(")[0].trim(),
            }
          : item
      )
    )
  }

  const handleCompleteCampCall = (patientId: string, log: any) => {
    setCampQueue((prev) =>
      prev.map((item) =>
        item.id === patientId
          ? {
              ...item,
              status: log.status === "seat_reserved" ? "seat_reserved" : "call_logged",
              callNotes: log.notes,
            }
          : item
      )
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header & Role Switcher */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Telecaller Operations Cockpit
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-[#1F56A3] border-blue-200 font-bold text-xs py-0.5">
              {profile.roleTitle}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-bold text-slate-800">{profile.name}</span> · {profile.department}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Universal Date Range Filter */}
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />

          {/* Quick Role Switcher Pill */}
          <TelecallerRoleHeaderBadge />
        </div>
      </div>

      {/* VIEW 1: WELCOME CALL SPECIALIST */}
      {currentRole === "welcome_call" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Today's Assignments for Me"
              value="18"
              icon={PhoneCall}
              gradient="from-[#1F56A3] to-[#192B42]"
              subtitle={`Allocated by manager (${dateFilter.label})`}
            />
            <StatCard
              title="Care Teams Assigned"
              value="42"
              icon={UserCheck}
              gradient="from-blue-600 to-indigo-800"
              subtitle="5 specialists mapped to patient"
            />
            <StatCard
              title="Welcome Calls Done"
              value="85"
              icon={CheckCircle2}
              gradient="from-emerald-600 to-teal-800"
              subtitle="Bonding & onboarding active"
            />
            <StatCard
              title="Marked for Follow-ups"
              value="12"
              icon={Clock}
              gradient="from-amber-500 to-rose-600"
              subtitle="Scheduled callbacks & clarifications"
            />
          </div>

          {/* Actionable Patient Queue Card */}
          <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-5 w-5 text-emerald-700" />
                    <CardTitle className="text-base font-bold text-slate-900">
                      Newly Enrolled Patients — 2-Step Welcome Call Queue
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    Step 1: Assign 5-Pillar Care Team · Step 2: Conduct Onboarding Call & Complete
                  </CardDescription>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search patient or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="text-xs font-bold text-slate-700">Patient Details</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Payment & City</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Step 1: Care Team Status</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Step 2: Welcome Call</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {welcomeQueue
                    .filter((p) =>
                      search
                        ? p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
                        : true
                    )
                    .map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-slate-50/60">
                        <TableCell>
                          <p className="text-xs font-bold text-slate-900">{patient.name}</p>
                          <p className="text-[11px] text-slate-500">{patient.phone} · ID: {patient.id}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-bold text-slate-900">₹{patient.amountPaid.toLocaleString("en-IN")}</p>
                          <p className="text-[11px] text-slate-500">{patient.city} · {patient.paymentDate}</p>
                        </TableCell>
                        <TableCell>
                          {patient.careTeamAssigned ? (
                            <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <ShieldCheck className="mr-1 h-3 w-3" />
                              Assigned (5/5 Pillars)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 text-[10px] font-bold">
                              <Clock className="mr-1 h-3 w-3" />
                              Care Team Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.welcomeCallStatus === "completed" ? (
                            <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Completed ({patient.callDuration || 14}m)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50 text-[10px] font-medium">
                              Ready to Call
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant={patient.careTeamAssigned ? "outline" : "default"}
                              onClick={() => {
                                setActiveWelcomePatient(patient)
                                setIsCareTeamModalOpen(true)
                              }}
                              className={`h-8 text-xs font-bold rounded-xl ${
                                patient.careTeamAssigned
                                  ? "border-slate-200 text-slate-700"
                                  : "bg-[#1F56A3] hover:bg-[#192B42] text-white shadow-sm"
                              }`}
                            >
                              <UserCheck className="mr-1 h-3.5 w-3.5" />
                              {patient.careTeamAssigned ? "Edit Team" : "1. Assign Team"}
                            </Button>

                            <Button
                              size="sm"
                              disabled={patient.welcomeCallStatus === "completed"}
                              onClick={() => {
                                setActiveWelcomePatient(patient)
                                setIsWelcomeCallModalOpen(true)
                              }}
                              className="h-8 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50"
                            >
                              <PhoneCall className="mr-1 h-3.5 w-3.5" />
                              {patient.welcomeCallStatus === "completed" ? "Done" : "2. Welcome Call"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW 2: PAYMENT RECOVERY SPECIALIST */}
      {currentRole === "payment_recovery" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Pending Amount"
              value="₹3,27,525"
              icon={IndianRupee}
              gradient="from-emerald-600 to-teal-800"
              subtitle={`Next phase dues (${dateFilter.label})`}
            />
            <StatCard
              title="Overdue (Require Attention)"
              value="14"
              icon={AlertTriangle}
              gradient="from-rose-600 to-red-800"
              subtitle="25+ days overdue"
            />
            <StatCard
              title="Due Soon"
              value="4"
              icon={Clock}
              gradient="from-amber-500 to-orange-600"
              subtitle="Within 7 days"
            />
            <StatCard
              title="Recovered This Month"
              value="₹4.2L"
              icon={CheckCircle2}
              gradient="from-purple-600 to-indigo-800"
              subtitle="Cash, UPI & Razorpay links"
            />
          </div>

          {/* Operational Assignment & Mapping Strip */}
          <div className="grid gap-4 sm:grid-cols-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 p-2">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">New Assignments for Me</p>
                <p className="text-base font-black text-slate-900">18 Patients</p>
                <p className="text-[10px] text-blue-600">Assigned by sales manager</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 border-l border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Program Mapping</p>
                <p className="text-base font-black text-slate-900">12 Patients</p>
                <p className="text-[10px] text-amber-600">₹2,499 token paid · doctor reviewed</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 border-l border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Collection Quick Link</p>
                <Link href="/dashboard/telecaller/payment-recovery">
                  <Button size="sm" variant="outline" className="h-7 text-xs font-bold mt-1 text-[#2563EB] border-blue-200 hover:bg-blue-50">
                    Open Recovery Roster →
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Recovery Patients Table */}
          <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-amber-700" />
                    <CardTitle className="text-base font-bold text-slate-900">
                      Payment Recovery Roster & Program Assignment
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    Top static rows: Coordinate Doctor Assessment recommendation, reconcile ₹2,499 token, and record payments
                  </CardDescription>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search patient or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="text-xs font-bold text-slate-700">Patient Details</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Program & Clinical Status</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Paid So Far</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Pending Balance</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Recovery Status</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recoveryQueue
                    .filter((p) =>
                      search
                        ? p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
                        : true
                    )
                    .map((item) => (
                      <TableRow
                        key={item.id}
                        className={
                          item.isEnrollmentTokenOnly
                            ? "bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500"
                            : "hover:bg-slate-50/60"
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{item.name}</p>
                              <p className="text-[11px] text-slate-500">{item.phone} · {item.id}</p>
                            </div>
                            {item.isEnrollmentTokenOnly && (
                              <Badge className="bg-amber-100 text-amber-800 text-[9px] font-bold">
                                Token ₹2,499
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-bold text-slate-800">{item.programName}</p>
                          {item.doctorNotes && (
                            <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                              {item.doctorName}: "{item.doctorNotes}"
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-emerald-600">
                            ₹{item.amountPaidSoFar.toLocaleString("en-IN")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-rose-600">
                            ₹{item.pendingBalance.toLocaleString("en-IN")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.status === "pending_program_mapping" ? (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                              Pending Program Mapping
                            </Badge>
                          ) : item.status === "paid" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Fully Settled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 text-[10px] font-bold">
                              {item.dueDate}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "pending_program_mapping" ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setActiveRecoveryPatient(item)
                                  setIsProgramMappingModalOpen(true)
                                }}
                                className="h-8 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                              >
                                <Layers className="mr-1 h-3.5 w-3.5" />
                                Map Agreed Program
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setActiveRecoveryPatient(item)
                                  setIsCollectPaymentModalOpen(true)
                                }}
                                className="h-8 text-xs font-bold rounded-xl bg-[#1F56A3] hover:bg-[#192B42] text-white shadow-sm"
                              >
                                <IndianRupee className="mr-1 h-3.5 w-3.5" />
                                Pay Now / Invoices
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW 3: RESIDENTIAL CAMP BOOSTER */}
      {currentRole === "residential_camp" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Eligible Camp Patients"
              value="180"
              icon={Sparkles}
              gradient="from-purple-600 to-indigo-800"
              subtitle={`>3 months tenure completed (${dateFilter.label})`}
            />
            <StatCard
              title="Reminders Sent"
              value="112"
              icon={Layers}
              gradient="from-blue-600 to-[#1F56A3]"
              subtitle="WhatsApp & Mobile App cards"
            />
            <StatCard
              title="Boost Calls Logged"
              value="89"
              icon={PhoneCall}
              gradient="from-teal-600 to-emerald-800"
              subtitle="Counseling & itinerary briefed"
            />
            <StatCard
              title="Seats Reserved"
              value="24"
              icon={CheckCircle2}
              gradient="from-purple-700 to-pink-700"
              subtitle="₹35,000 retreat booster fee"
            />
          </div>

          {/* Camp Boosting Patients Table */}
          <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-700" />
                    <CardTitle className="text-base font-bold text-slate-900">
                      Residential Camp Boosting & Retention Queue (&gt;3 Months)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    Eligible patients in DFF Standard & VIP care with significant clinical milestones
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="relative w-56">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Search patient or phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 h-9 text-xs rounded-xl"
                    />
                  </div>
                  <Link href="/dashboard/telecaller/residential-camp">
                    <Button
                      size="sm"
                      className="bg-purple-700 hover:bg-purple-800 text-white font-bold h-9 text-xs rounded-xl shadow-sm"
                    >
                      Open Camp Queue & Bulk Actions →
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="text-xs font-bold text-slate-700">Patient Details</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Protocol & Tenure</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Clinical Milestone</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Outreach Status</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campQueue
                    .filter((p) =>
                      search
                        ? p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
                        : true
                    )
                    .map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/60">
                        <TableCell>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500">{item.phone} · {item.city}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-bold text-slate-800">{item.protocol}</p>
                          <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold mt-0.5">
                            {item.tenureDays} Days Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-bold text-emerald-700">{item.clinicalImprovement}</p>
                          <p className="text-[10px] text-slate-500">Target Venue: {item.campLocation}</p>
                        </TableCell>
                        <TableCell>
                          {item.status === "seat_reserved" ? (
                            <Badge className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold">
                              🌟 Seat Reserved (₹35K)
                            </Badge>
                          ) : item.status === "reminder_sent" ? (
                            <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold">
                              WhatsApp & App Sent
                            </Badge>
                          ) : item.status === "call_logged" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Call Logged
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-slate-200 text-slate-700 text-[10px] font-semibold">
                              Eligible for Boost
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActiveCampPatient(item)
                                setIsCampReminderModalOpen(true)
                              }}
                              className="h-8 text-xs font-bold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
                            >
                              <Sparkles className="mr-1 h-3.5 w-3.5" />
                              Send Reminder
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveCampPatient(item)
                                setIsCampCallLogModalOpen(true)
                              }}
                              className="h-8 text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-sm"
                            >
                              <PhoneCall className="mr-1 h-3.5 w-3.5" />
                              Log Call
                            </Button>
                            <Link href={`/dashboard/telecaller/residential-camp/${item.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                              >
                                Details
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW 4: LEAD NURTURE SPECIALIST */}
      {currentRole === "lead_nurture" && (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Assigned Inbound Leads"
              value="120"
              icon={Users}
              gradient="from-[#1F56A3] to-[#192B42]"
              subtitle={`Allocated pool (${dateFilter.label})`}
            />
            <StatCard
              title="Contacted Today"
              value="34"
              icon={PhoneCall}
              gradient="from-emerald-600 to-teal-800"
              subtitle="Outbound dials"
            />
            <StatCard
              title="Pending Follow-ups"
              value="18"
              icon={Clock}
              gradient="from-amber-500 to-[#1F56A3]"
              subtitle="Scheduled callbacks"
            />
            <StatCard
              title="Conversion Rate"
              value="14.2%"
              icon={TrendingUp}
              gradient="from-[#1F56A3] to-[#FFC20E]"
              subtitle="Webinar & Meta leads"
            />
          </div>

          <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg p-6 text-center space-y-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-[#1F56A3] w-fit mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Lead Nurture Pipeline Active</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You are viewing the Lead Nurture Specialist view. Access your full roster of fresh leads from Meta, Google Ads, and Webinars.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => window.location.href = "/dashboard/telecaller/assigned-leads"}
                className="bg-[#1F56A3] hover:bg-[#192B42] text-white font-bold rounded-xl text-xs"
              >
                Open Assigned Leads Table
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Care Team Assignment */}
      {activeWelcomePatient && (
        <CareTeamAssignmentModal
          open={isCareTeamModalOpen}
          onOpenChange={setIsCareTeamModalOpen}
          patientId={activeWelcomePatient.id}
          patientName={activeWelcomePatient.name}
          programName={activeWelcomePatient.specialty}
          currentCareTeam={activeWelcomePatient.careTeam}
          onSave={handleSaveCareTeam}
        />
      )}

      {/* 2. Welcome Call */}
      {activeWelcomePatient && (
        <WelcomeCallModal
          open={isWelcomeCallModalOpen}
          onOpenChange={setIsWelcomeCallModalOpen}
          patientId={activeWelcomePatient.id}
          patientName={activeWelcomePatient.name}
          patientPhone={activeWelcomePatient.phone}
          careTeam={activeWelcomePatient.careTeam}
          onComplete={handleCompleteWelcomeCall}
        />
      )}

      {/* 3. Program Mapping */}
      {activeRecoveryPatient && (
        <ProgramMappingModal
          open={isProgramMappingModalOpen}
          onOpenChange={setIsProgramMappingModalOpen}
          patientId={activeRecoveryPatient.id}
          patientName={activeRecoveryPatient.name}
          doctorName={activeRecoveryPatient.doctorName}
          doctorRecommendation={{
            program: activeRecoveryPatient.programName,
            fee: activeRecoveryPatient.totalPlanValue,
            notes: activeRecoveryPatient.doctorNotes || "Doctor recommended intensive care.",
          }}
          enrollmentFeePaid={activeRecoveryPatient.amountPaidSoFar}
          onConfirm={handleConfirmProgramMapping}
        />
      )}

      {/* 4. Collect Payment */}
      {activeRecoveryPatient && (
        <CollectPaymentModal
          open={isCollectPaymentModalOpen}
          onOpenChange={setIsCollectPaymentModalOpen}
          patientId={activeRecoveryPatient.id}
          patientName={activeRecoveryPatient.name}
          patientPhone={activeRecoveryPatient.phone}
          programName={activeRecoveryPatient.programName}
          totalPlanValue={activeRecoveryPatient.totalPlanValue}
          amountPaidSoFar={activeRecoveryPatient.amountPaidSoFar}
          pendingBalance={activeRecoveryPatient.pendingBalance}
          installmentNumber={activeRecoveryPatient.installmentNumber}
          onPaymentSuccess={handleRecordPayment}
        />
      )}

      {/* 5. Camp Reminder */}
      {activeCampPatient && (
        <CampReminderModal
          open={isCampReminderModalOpen}
          onOpenChange={setIsCampReminderModalOpen}
          patientId={activeCampPatient.id}
          patientName={activeCampPatient.name}
          patientPhone={activeCampPatient.phone}
          tenureDays={activeCampPatient.tenureDays}
          programName={activeCampPatient.protocol}
          clinicalImprovement={activeCampPatient.clinicalImprovement}
          onSend={handleSendCampReminder}
        />
      )}

      {/* 6. Camp Call Log */}
      {activeCampPatient && (
        <CampCallLogModal
          open={isCampCallLogModalOpen}
          onOpenChange={setIsCampCallLogModalOpen}
          patientId={activeCampPatient.id}
          patientName={activeCampPatient.name}
          patientPhone={activeCampPatient.phone}
          campName={activeCampPatient.campLocation}
          onComplete={handleCompleteCampCall}
        />
      )}
    </div>
  )
}
