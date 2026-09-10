"use client"

import * as React from "react"
import Link from "next/link"
import {
  PhoneCall,
  Zap,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Activity,
  HeartHandshake,
} from "lucide-react"

import { useTelecallers } from "@/hooks/use-telecallers"
import { AutoAssignQuantityModal } from "@/components/sales/auto-assign-quantity-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"

interface WelcomePatient {
  id: string
  name: string
  phone: string
  email: string
  specialty: string
  amountPaid: number
  paymentDate: string
  careTeamStatus: "assigned" | "pending"
  assignedDoctor?: string
  assignedDietitian?: string
  welcomeCallStatus: "pending" | "scheduled" | "completed"
  assignedWelcomeCaller?: string
  registrationCity: string
}

const MOCK_WELCOME_PATIENTS: WelcomePatient[] = [
  {
    id: "WP-101",
    name: "Sunita Deshmukh",
    phone: "+91 98201 44512",
    email: "sunita.deshmukh@example.com",
    specialty: "Diabetes Free Forever",
    amountPaid: 24999,
    paymentDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    careTeamStatus: "assigned",
    assignedDoctor: "Dr. Ritu Agarwal",
    assignedDietitian: "Sneha Phadke",
    welcomeCallStatus: "pending",
    assignedWelcomeCaller: "Ananya Iyer",
    registrationCity: "Mumbai",
  },
  {
    id: "WP-102",
    name: "Rameshwar Patil",
    phone: "+91 98450 78123",
    email: "rameshwar.patil@example.com",
    specialty: "Diabetes Free Forever",
    amountPaid: 1499,
    paymentDate: new Date(Date.now() - 3600000 * 9).toISOString(),
    careTeamStatus: "pending",
    welcomeCallStatus: "pending",
    registrationCity: "Pune",
  },
  {
    id: "WP-103",
    name: "Kavita Nair",
    phone: "+91 98112 34908",
    email: "kavita.nair@example.com",
    specialty: "Thyroid Free Forever",
    amountPaid: 24999,
    paymentDate: new Date(Date.now() - 3600000 * 16).toISOString(),
    careTeamStatus: "assigned",
    assignedDoctor: "Dr. Arvind Shinde",
    assignedDietitian: "Pooja Varma",
    welcomeCallStatus: "scheduled",
    assignedWelcomeCaller: "Vikram Malhotra",
    registrationCity: "Bengaluru",
  },
  {
    id: "WP-104",
    name: "Ajay Kulkarni",
    phone: "+91 98765 12098",
    email: "ajay.kulkarni@example.com",
    specialty: "Hypertension Control",
    amountPaid: 1499,
    paymentDate: new Date(Date.now() - 3600000 * 22).toISOString(),
    careTeamStatus: "pending",
    welcomeCallStatus: "pending",
    registrationCity: "Nagpur",
  },
  {
    id: "WP-105",
    name: "Meenakshi Sundaram",
    phone: "+91 98334 56120",
    email: "meenakshi.s@example.com",
    specialty: "PCOS Care",
    amountPaid: 24999,
    paymentDate: new Date(Date.now() - 3600000 * 28).toISOString(),
    careTeamStatus: "assigned",
    assignedDoctor: "Dr. Ritu Agarwal",
    assignedDietitian: "Sneha Phadke",
    welcomeCallStatus: "completed",
    assignedWelcomeCaller: "Ananya Iyer",
    registrationCity: "Chennai",
  },
  {
    id: "WP-106",
    name: "Girish Bapat",
    phone: "+91 98901 23411",
    email: "girish.bapat@example.com",
    specialty: "Diabetes Free Forever",
    amountPaid: 24999,
    paymentDate: new Date(Date.now() - 3600000 * 35).toISOString(),
    careTeamStatus: "pending",
    welcomeCallStatus: "pending",
    registrationCity: "Nashik",
  },
]

export default function WelcomeCallManagementPage() {
  const [patients, setPatients] = React.useState<WelcomePatient[]>(MOCK_WELCOME_PATIENTS)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [pendingCount, setPendingCount] = React.useState(145)
  const [isAutoAssignOpen, setIsAutoAssignOpen] = React.useState(false)

  const { data: telecallers = [] } = useTelecallers()
  const welcomeTelecallers = React.useMemo(() => {
    const list = telecallers.filter((tc) => (tc.roleSpecialization || "welcome_call") === "welcome_call")
    return list.length > 0 ? list : telecallers
  }, [telecallers])

  const filteredPatients = React.useMemo(() => {
    return patients.filter((p) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "unassigned"
            ? !p.assignedWelcomeCaller
            : p.welcomeCallStatus === statusFilter

      const term = search.trim().toLowerCase()
      const matchesSearch = term
        ? [p.name, p.phone, p.email, p.specialty, p.registrationCity]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(term))
        : true

      return matchesStatus && matchesSearch
    })
  }, [patients, search, statusFilter])

  const handleAutoAssign = async (quantity: number, selectedCallerIds: string[]) => {
    setPendingCount((prev) => Math.max(0, prev - quantity))
    // Assign unassigned patients locally
    const callers = welcomeTelecallers.filter((c) => selectedCallerIds.includes(c.id))
    if (!callers.length) return

    setPatients((prev) => {
      let idx = 0
      return prev.map((item) => {
        if (!item.assignedWelcomeCaller) {
          const caller = callers[idx % callers.length]
          idx += 1
          return {
            ...item,
            assignedWelcomeCaller: caller.name || "Welcome Specialist",
            welcomeCallStatus: "pending",
          }
        }
        return item
      })
    })
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Welcome Call Management
              </h1>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-xs py-0.5">
                Paid Patients Onboarding
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Newly converted patients awaiting welcome calls, care team assignment, and protocol onboarding
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsAutoAssignOpen(true)}
              className="bg-[#1F56A3] hover:bg-[#192B42] text-white font-bold h-11 px-5 rounded-2xl shadow-lg shadow-[#1F56A3]/20"
            >
              <Zap className="mr-2 h-4 w-4 text-[#FFC20E] fill-[#FFC20E]" />
              Auto Assignment ({pendingCount} Pending)
            </Button>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Welcome Calls</p>
              <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
              <p className="text-[11px] text-amber-700 font-medium">Unassigned queue</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Welcome Callers</p>
              <p className="text-2xl font-bold text-slate-900">
                {welcomeTelecallers.filter((tc) => tc.is_active !== false).length}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">Specialized onboarding team</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-50 text-[#1F56A3]">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Care Teams Assigned</p>
              <p className="text-2xl font-bold text-slate-900">72%</p>
              <p className="text-[11px] text-blue-700 font-medium">Doctor & dietitian paired</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Today</p>
              <p className="text-2xl font-bold text-teal-700">18 calls</p>
              <p className="text-[11px] text-teal-700 font-medium">Avg duration 8m 30s</p>
            </div>
          </div>
        </div>
      </div>

      <AutoAssignQuantityModal
        open={isAutoAssignOpen}
        onOpenChange={setIsAutoAssignOpen}
        workstreamName="Welcome Call Queue"
        totalPendingCount={pendingCount}
        telecallers={welcomeTelecallers}
        onAssign={handleAutoAssign}
      />

      {/* Main Table Card */}
      <Card className="border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden rounded-3xl">
        <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Newly Paid Patients Queue
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Patients who recently paid for assessment or program, awaiting welcome onboarding
              </CardDescription>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search patient, phone, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-xl pl-9 text-xs border-slate-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 rounded-xl text-xs w-[160px] border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Welcome Calls</SelectItem>
                  <SelectItem value="unassigned">Unassigned Only</SelectItem>
                  <SelectItem value="pending">Call Pending</SelectItem>
                  <SelectItem value="scheduled">Call Scheduled</SelectItem>
                  <SelectItem value="completed">Call Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-b border-slate-100">
                  <TableHead className="pl-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Patient & Contact</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Specialty</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount Paid</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payment Date</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Care Team</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Welcome Caller</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Call Status</TableHead>
                  <TableHead className="pr-6 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100/60">
                      <TableCell className="pl-6">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{patient.phone}</p>
                          <p className="text-[11px] text-slate-400">{patient.registrationCity}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-xs bg-blue-50/60 text-blue-700 border-blue-200/70 font-medium">
                          {patient.specialty}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="text-sm font-bold text-emerald-700">
                            ₹{patient.amountPaid.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {patient.amountPaid > 5000 ? "Full Program" : "Clinical Assessment"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        {formatDate(patient.paymentDate, "MMM dd, HH:mm")}
                      </TableCell>

                      <TableCell className="text-center">
                        {patient.careTeamStatus === "assigned" ? (
                          <div className="text-left inline-block">
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                              Assigned
                            </Badge>
                            <p className="text-[11px] text-slate-700 font-medium mt-0.5">{patient.assignedDoctor}</p>
                            <p className="text-[10px] text-slate-500">{patient.assignedDietitian}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-medium">
                            Pending Assignment
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {patient.assignedWelcomeCaller ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                            {patient.assignedWelcomeCaller}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-xs capitalize font-semibold ${
                            patient.welcomeCallStatus === "completed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : patient.welcomeCallStatus === "scheduled"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {patient.welcomeCallStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold" asChild>
                          <Link href={`/dashboard/sales/leads/${patient.id}`}>
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-sm text-slate-500">
                      No welcome call patients found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
