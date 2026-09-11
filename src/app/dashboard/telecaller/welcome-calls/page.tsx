"use client"

import * as React from "react"
import Link from "next/link"
import {
  Users,
  PhoneCall,
  CheckCircle2,
  Activity,
  Filter,
  Search,
  Eye,
  Check,
  ArrowLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { DateRangeFilter, type DateRangeFilterValue } from "@/components/shared/date-range-filter"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"
import { CareTeamAssignmentModal, type CareTeamData } from "@/components/telecaller/care-team-assignment-modal"
import { WelcomeCallModal } from "@/components/telecaller/welcome-call-modal"

export interface WelcomeCallPatient {
  id: string
  name: string
  phone: string
  email: string
  city: string
  specialty: string
  paymentStatus: "PAID"
  assessmentStatus: "COMPLETED"
  doctor: string | null
  dietitian: string | null
  fitnessCoach: string | null
  mentor: string | null
  welcomeCallStatus: "pending" | "completed"
  callDuration?: number
}

const INITIAL_PATIENTS: WelcomeCallPatient[] = [
  {
    id: "1a2b3c4d",
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@example.com",
    city: "Mumbai",
    specialty: "Diabetes Free Forever",
    paymentStatus: "PAID",
    assessmentStatus: "COMPLETED",
    doctor: null,
    dietitian: null,
    fitnessCoach: null,
    mentor: null,
    welcomeCallStatus: "pending",
  },
  {
    id: "2b3c4d5e",
    name: "Priya Sharma",
    phone: "+91 98765 43211",
    email: "priya.sharma@example.com",
    city: "Pune",
    specialty: "Diabetes Free Forever",
    paymentStatus: "PAID",
    assessmentStatus: "COMPLETED",
    doctor: "Dr. Bhagyesh Kulkarni",
    dietitian: "Anjali Patel",
    fitnessCoach: null,
    mentor: null,
    welcomeCallStatus: "pending",
  },
  {
    id: "3c4d5e6f",
    name: "Amit Singh",
    phone: "+91 98765 43212",
    email: "amit.singh@example.com",
    city: "Delhi",
    specialty: "Diabetes Free Forever",
    paymentStatus: "PAID",
    assessmentStatus: "COMPLETED",
    doctor: null,
    dietitian: null,
    fitnessCoach: null,
    mentor: null,
    welcomeCallStatus: "completed",
  },
  {
    id: "4d5e6f7g",
    name: "Sneha Patel",
    phone: "+91 98765 43213",
    email: "sneha.patel@example.com",
    city: "Ahmedabad",
    specialty: "Diabetes Free Forever",
    paymentStatus: "PAID",
    assessmentStatus: "COMPLETED",
    doctor: "Dr. Ramesh Gupta",
    dietitian: "Pooja Verma",
    fitnessCoach: "Vikram Singh",
    mentor: "Rahul Mehta",
    welcomeCallStatus: "completed",
  },
  {
    id: "5e6f7g8h",
    name: "Vikram Reddy",
    phone: "+91 98765 43214",
    email: "vikram.reddy@example.com",
    city: "Hyderabad",
    specialty: "Diabetes Free Forever",
    paymentStatus: "PAID",
    assessmentStatus: "COMPLETED",
    doctor: null,
    dietitian: null,
    fitnessCoach: null,
    mentor: null,
    welcomeCallStatus: "pending",
  },
  {
    id: "6f7g8h9i",
    name: "Neha Joshi",
    phone: "+91 98765 43215",
    email: "neha.joshi@example.com",
    city: "Bengaluru",
    specialty: "Diabetes Free Forever",
    paymentStatus: "PAID",
    assessmentStatus: "COMPLETED",
    doctor: null,
    dietitian: null,
    fitnessCoach: null,
    mentor: null,
    welcomeCallStatus: "pending",
  },
  {
    id: "7g8h9i0j",
    name: "Suresh Nair",
    phone: "+91 98765 43216",
    email: "suresh.nair@example.com",
    city: "Chennai",
    specialty: "Diabetes Free Forever",
    paymentStatus: "PAID",
    assessmentStatus: "COMPLETED",
    doctor: "Dr. Bhagyesh Kulkarni",
    dietitian: "Anjali Patel",
    fitnessCoach: "Vikram Singh",
    mentor: null,
    welcomeCallStatus: "completed",
  },
  {
    id: "8h9i0j1k",
    name: "Anita Desai",
    phone: "+91 98765 43217",
    email: "anita.desai@example.com",
    city: "Nagpur",
    specialty: "Diabetes Free Forever",
    paymentStatus: "PAID",
    assessmentStatus: "COMPLETED",
    doctor: null,
    dietitian: null,
    fitnessCoach: null,
    mentor: null,
    welcomeCallStatus: "pending",
  },
]

export default function TelecallerWelcomeCallsPage() {
  const [patients, setPatients] = React.useState<WelcomeCallPatient[]>(INITIAL_PATIENTS)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [dateFilter, setDateFilter] = React.useState<DateRangeFilterValue>({
    preset: "last_7_days",
    label: "Last 7 Days",
  })

  const [activePatient, setActivePatient] = React.useState<WelcomeCallPatient | null>(null)
  const [isCareTeamOpen, setIsCareTeamOpen] = React.useState(false)
  const [isWelcomeCallOpen, setIsWelcomeCallOpen] = React.useState(false)

  // Calculations for KPI Cards
  const totalPatients = patients.length
  const pendingCalls = patients.filter((p) => p.welcomeCallStatus === "pending").length
  const completedCalls = patients.filter((p) => p.welcomeCallStatus === "completed").length
  const totalAssignmentsDone = patients.filter(
    (p) => Boolean(p.doctor && p.dietitian && p.fitnessCoach && p.mentor)
  ).length

  // Filtered patient list
  const filteredPatients = React.useMemo(() => {
    return patients.filter((p) => {
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
          ? p.welcomeCallStatus === "pending"
          : statusFilter === "completed"
          ? p.welcomeCallStatus === "completed"
          : true

      const query = search.trim().toLowerCase()
      const matchSearch = query
        ? p.name.toLowerCase().includes(query) ||
          p.phone.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query)
        : true

      return matchStatus && matchSearch
    })
  }, [patients, statusFilter, search])

  const handleInitiateWelcomeCall = (patient: WelcomeCallPatient) => {
    setActivePatient(patient)
    // If care team is not yet assigned, start with care team assignment
    if (!patient.doctor || !patient.dietitian) {
      setIsCareTeamOpen(true)
    } else {
      setIsWelcomeCallOpen(true)
    }
  }

  const handleSaveCareTeam = (patientId: string, team: CareTeamData) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              doctor: team.doctor || p.doctor,
              dietitian: team.dietitian || p.dietitian,
              fitnessCoach: team.fitnessCoach || p.fitnessCoach,
              mentor: team.mentor || p.mentor,
            }
          : p
      )
    )
    // Automatically transition to Welcome Call step
    setIsCareTeamOpen(false)
    setIsWelcomeCallOpen(true)
  }

  const handleCompleteWelcomeCall = (patientId: string, log: any) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              welcomeCallStatus: "completed",
              callDuration: log.durationMins || 15,
            }
          : p
      )
    )
    setIsWelcomeCallOpen(false)
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
              Welcome Call Management
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 pl-11">
            Assign care team to patients after 2499 payment and assessment completion
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          <TelecallerRoleHeaderBadge />
        </div>
      </div>

      {/* 4 Summary Cards (Exact screenshot match) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: TOTAL PATIENTS */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" />
              TOTAL PATIENTS
            </div>
            <div className="text-3xl font-black text-slate-900">{totalPatients}</div>
            <p className="text-xs font-medium text-blue-600">Payment + Assessment done</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: PENDING WELCOME CALLS */}
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              <PhoneCall className="h-3.5 w-3.5" />
              PENDING WELCOME CALLS
            </div>
            <div className="text-3xl font-black text-slate-900">{pendingCalls}</div>
            <p className="text-xs font-medium text-amber-600">Awaiting assignment</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <PhoneCall className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: COMPLETED WELCOME CALLS */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5" />
              COMPLETED WELCOME CALLS
            </div>
            <div className="text-3xl font-black text-slate-900">{completedCalls}</div>
            <p className="text-xs font-medium text-emerald-600">Providers assigned</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: TOTAL ASSIGNMENTS DONE */}
        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              <Activity className="h-3.5 w-3.5" />
              TOTAL ASSIGNMENTS DONE
            </div>
            <div className="text-3xl font-black text-slate-900">{totalAssignmentsDone}</div>
            <p className="text-xs font-medium text-purple-600">Full team assigned</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Patient List Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm p-6 space-y-5">
        {/* Card Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-900">Patient List</h2>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white">
                <Filter className="mr-2 h-3.5 w-3.5 text-slate-400" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search patients by name, phone, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Table with deep navy header */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <Table>
            <TableHeader className="bg-[#0B1528]">
              <TableRow className="bg-[#0B1528] hover:bg-[#0B1528] border-none">
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                  PATIENT ID
                </TableHead>
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                  NAME
                </TableHead>
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                  PAYMENT
                </TableHead>
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                  ASSESSMENT
                </TableHead>
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                  DOCTOR
                </TableHead>
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                  DIETITIAN
                </TableHead>
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                  FITNESS COACH
                </TableHead>
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                  MENTOR
                </TableHead>
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider">
                  WELCOME CALL
                </TableHead>
                <TableHead className="text-[11px] font-bold text-white uppercase tracking-wider text-left">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-slate-50/70 border-b border-slate-100">
                  {/* PATIENT ID */}
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">
                    {patient.id}
                  </TableCell>

                  {/* NAME */}
                  <TableCell>
                    <Link
                      href={`/dashboard/telecaller/welcome-calls/${patient.id}`}
                      className="hover:underline"
                    >
                      <p className="text-xs font-bold text-slate-900">{patient.name}</p>
                    </Link>
                    <p className="text-[11px] text-slate-500 font-medium">{patient.phone}</p>
                  </TableCell>

                  {/* PAYMENT */}
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500 text-emerald-600 bg-emerald-50/70">
                      PAID
                    </span>
                  </TableCell>

                  {/* ASSESSMENT */}
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500 text-emerald-600 bg-emerald-50/70">
                      COMPLETED
                    </span>
                  </TableCell>

                  {/* DOCTOR */}
                  <TableCell>
                    {patient.doctor ? (
                      <span className="text-xs font-medium text-slate-800">{patient.doctor}</span>
                    ) : (
                      <span className="text-xs text-slate-400">Not assigned</span>
                    )}
                  </TableCell>

                  {/* DIETITIAN */}
                  <TableCell>
                    {patient.dietitian ? (
                      <span className="text-xs font-medium text-slate-800">{patient.dietitian}</span>
                    ) : (
                      <span className="text-xs text-slate-400">Not assigned</span>
                    )}
                  </TableCell>

                  {/* FITNESS COACH */}
                  <TableCell>
                    {patient.fitnessCoach ? (
                      <span className="text-xs font-medium text-slate-800">{patient.fitnessCoach}</span>
                    ) : (
                      <span className="text-xs text-slate-400">Not assigned</span>
                    )}
                  </TableCell>

                  {/* MENTOR */}
                  <TableCell>
                    {patient.mentor ? (
                      <span className="text-xs font-medium text-slate-800">{patient.mentor}</span>
                    ) : (
                      <span className="text-xs text-slate-400">Not assigned</span>
                    )}
                  </TableCell>

                  {/* WELCOME CALL */}
                  <TableCell>
                    {patient.welcomeCallStatus === "completed" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500 text-emerald-600 bg-emerald-50/70">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-400 text-amber-600 bg-amber-50/70">
                        PENDING
                      </span>
                    )}
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/telecaller/welcome-calls/${patient.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 rounded-full border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold gap-1"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          View
                        </Button>
                      </Link>

                      {patient.welcomeCallStatus === "completed" ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 whitespace-nowrap">
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          Welcome call &amp; assignment done
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInitiateWelcomeCall(patient)}
                          className="h-8 px-3.5 rounded-full border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-semibold gap-1.5 shadow-sm whitespace-nowrap"
                        >
                          <PhoneCall className="h-3.5 w-3.5 text-slate-600" />
                          Initiate Welcome Call
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      {activePatient && (
        <CareTeamAssignmentModal
          open={isCareTeamOpen}
          onOpenChange={setIsCareTeamOpen}
          patientId={activePatient.id}
          patientName={activePatient.name}
          programName={activePatient.specialty}
          currentCareTeam={{
            doctor: activePatient.doctor || undefined,
            dietitian: activePatient.dietitian || undefined,
            fitnessCoach: activePatient.fitnessCoach || undefined,
            mentor: activePatient.mentor || undefined,
          }}
          onSave={handleSaveCareTeam}
        />
      )}

      {activePatient && (
        <WelcomeCallModal
          open={isWelcomeCallOpen}
          onOpenChange={setIsWelcomeCallOpen}
          patientId={activePatient.id}
          patientName={activePatient.name}
          patientPhone={activePatient.phone}
          careTeam={{
            doctor: activePatient.doctor || undefined,
            dietitian: activePatient.dietitian || undefined,
            fitnessCoach: activePatient.fitnessCoach || undefined,
            mentor: activePatient.mentor || undefined,
          }}
          onComplete={handleCompleteWelcomeCall}
        />
      )}
    </div>
  )
}
