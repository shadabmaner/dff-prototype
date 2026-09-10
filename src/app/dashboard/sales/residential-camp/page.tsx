"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sparkles,
  Zap,
  Users,
  UserCheck,
  CheckCircle2,
  Calendar,
  Search,
  ExternalLink,
  Award,
  Send,
  Compass,
  TrendingDown,
  Building,
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
import { toast } from "sonner"

interface CampPatient {
  id: string
  name: string
  phone: string
  email: string
  protocol: string
  enrollmentDate: string
  tenureDays: number
  clinicalImprovement: string
  eligibleCampPlan: string
  campPlanFee: number
  boostStatus: "eligible" | "pitch_scheduled" | "seat_reserved" | "completed"
  assignedBoostingCaller?: string
  city: string
}

const MOCK_CAMP_PATIENTS: CampPatient[] = [
  {
    id: "CP-301",
    name: "Dr. Suresh Deshmukh",
    phone: "+91 98200 11982",
    email: "suresh.d@example.com",
    protocol: "Diabetes Free Forever (DFF)",
    enrollmentDate: new Date(Date.now() - 86400000 * 98).toISOString(),
    tenureDays: 98,
    clinicalImprovement: "HbA1c: 8.8 → 6.6% (-5.8 kg)",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 35000,
    boostStatus: "eligible",
    assignedBoostingCaller: "Karan Gill",
    city: "Mumbai",
  },
  {
    id: "CP-302",
    name: "Nirmala Kadam",
    phone: "+91 98450 67123",
    email: "nirmala.k@example.com",
    protocol: "Diabetes Free Forever (DFF)",
    enrollmentDate: new Date(Date.now() - 86400000 * 105).toISOString(),
    tenureDays: 105,
    clinicalImprovement: "HbA1c: 9.2 → 7.1% (-4.2 kg)",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 35000,
    boostStatus: "eligible",
    assignedBoostingCaller: undefined,
    city: "Pune",
  },
  {
    id: "CP-303",
    name: "Bhavna Bhatt",
    phone: "+91 98111 89700",
    email: "bhavna.bhatt@example.com",
    protocol: "Weight Management Protocol",
    enrollmentDate: new Date(Date.now() - 86400000 * 92).toISOString(),
    tenureDays: 92,
    clinicalImprovement: "Weight: 89 → 79 kg (-10 kg)",
    eligibleCampPlan: "5-Day Metabolism Reset Bootcamp (Mahabaleshwar)",
    campPlanFee: 28000,
    boostStatus: "pitch_scheduled",
    assignedBoostingCaller: "Karan Gill",
    city: "Ahmedabad",
  },
  {
    id: "CP-304",
    name: "Harishankar Iyer",
    phone: "+91 98920 44321",
    email: "harishankar.i@example.com",
    protocol: "Hypertension & Cardio Reversal",
    enrollmentDate: new Date(Date.now() - 86400000 * 114).toISOString(),
    tenureDays: 114,
    clinicalImprovement: "BP: 155/95 → 125/80 mmHg",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 35000,
    boostStatus: "eligible",
    assignedBoostingCaller: undefined,
    city: "Chennai",
  },
  {
    id: "CP-305",
    name: "Smita Tendulkar",
    phone: "+91 98300 55198",
    email: "smita.t@example.com",
    protocol: "Diabetes Free Forever (DFF)",
    enrollmentDate: new Date(Date.now() - 86400000 * 95).toISOString(),
    tenureDays: 95,
    clinicalImprovement: "HbA1c: 8.4 → 6.8% (-3.5 kg)",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 35000,
    boostStatus: "seat_reserved",
    assignedBoostingCaller: "Divya Rao",
    city: "Thane",
  },
  {
    id: "CP-306",
    name: "Anand Chaturvedi",
    phone: "+91 98711 33201",
    email: "anand.c@example.com",
    protocol: "Diabetes Free Forever (DFF)",
    enrollmentDate: new Date(Date.now() - 86400000 * 120).toISOString(),
    tenureDays: 120,
    clinicalImprovement: "Insulin stopped, Fasting 102 mg/dL",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 35000,
    boostStatus: "eligible",
    assignedBoostingCaller: undefined,
    city: "Delhi",
  },
]

export default function ResidentialCampBoostingPage() {
  const [patients, setPatients] = React.useState<CampPatient[]>(MOCK_CAMP_PATIENTS)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [pendingBoostCount, setPendingBoostCount] = React.useState(180)
  const [isAutoAssignOpen, setIsAutoAssignOpen] = React.useState(false)

  const { data: telecallers = [] } = useTelecallers()
  const campTelecallers = React.useMemo(() => {
    const list = telecallers.filter((tc) => (tc.roleSpecialization || "residential_camp") === "residential_camp")
    return list.length > 0 ? list : telecallers
  }, [telecallers])

  const filteredPatients = React.useMemo(() => {
    return patients.filter((p) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "unassigned"
            ? !p.assignedBoostingCaller
            : p.boostStatus === statusFilter

      const term = search.trim().toLowerCase()
      const matchesSearch = term
        ? [p.name, p.phone, p.protocol, p.eligibleCampPlan, p.city]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(term))
        : true

      return matchesStatus && matchesSearch
    })
  }, [patients, search, statusFilter])

  const handleSendBrochure = (patient: CampPatient) => {
    toast.success(`Residential camp brochure & booking link sent to ${patient.name} via WhatsApp!`)
  }

  const handleAutoAssign = async (quantity: number, selectedCallerIds: string[]) => {
    setPendingBoostCount((prev) => Math.max(0, prev - quantity))
    const callers = campTelecallers.filter((c) => selectedCallerIds.includes(c.id))
    if (!callers.length) return

    setPatients((prev) => {
      let idx = 0
      return prev.map((item) => {
        if (!item.assignedBoostingCaller) {
          const caller = callers[idx % callers.length]
          idx += 1
          return {
            ...item,
            assignedBoostingCaller: caller.name || "Camp Specialist",
          }
        }
        return item
      })
    })
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Residential Camp Boosting Management
              </h1>
              <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 font-bold text-xs py-0.5">
                3-Month Protocol Upgrade
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Patients active &gt;3 months in reversal protocol eligible for residential intensive boost camp upgrade
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsAutoAssignOpen(true)}
              className="bg-[#1F56A3] hover:bg-[#192B42] text-white font-bold h-11 px-5 rounded-2xl shadow-lg shadow-[#1F56A3]/20"
            >
              <Zap className="mr-2 h-4 w-4 text-[#FFC20E] fill-[#FFC20E]" />
              Auto Assignment ({pendingBoostCount} Eligible)
            </Button>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Eligible 3-Mo Patients</p>
              <p className="text-2xl font-bold text-slate-900">{pendingBoostCount}</p>
              <p className="text-[11px] text-purple-700 font-medium">Ready for camp outreach</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-50 text-[#1F56A3]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Boosting Callers</p>
              <p className="text-2xl font-bold text-slate-900">
                {campTelecallers.filter((tc) => tc.is_active !== false).length}
              </p>
              <p className="text-[11px] text-blue-700 font-medium">Specialized camp sales team</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Seats Confirmed</p>
              <p className="text-2xl font-bold text-emerald-700">34 seats</p>
              <p className="text-[11px] text-emerald-600 font-medium">Upcoming retreat batch</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potential Camp Revenue</p>
              <p className="text-2xl font-bold text-slate-900">₹63 Lakhs</p>
              <p className="text-[11px] text-amber-700 font-medium">@ ₹35,000 / patient</p>
            </div>
          </div>
        </div>
      </div>

      <AutoAssignQuantityModal
        open={isAutoAssignOpen}
        onOpenChange={setIsAutoAssignOpen}
        workstreamName="Residential Camp Boosting Queue"
        totalPendingCount={pendingBoostCount}
        telecallers={campTelecallers}
        onAssign={handleAutoAssign}
      />

      {/* Main Table Card */}
      <Card className="border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden rounded-3xl">
        <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Eligible 3-Month Protocol Patients
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Patients who have completed 90+ days of lifestyle guidance and are clinically qualified for the Residential Boost Camp
              </CardDescription>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search patient, protocol..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-xl pl-9 text-xs border-slate-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 rounded-xl text-xs w-[170px] border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  <SelectItem value="unassigned">Unassigned Only</SelectItem>
                  <SelectItem value="eligible">Eligible for Boost</SelectItem>
                  <SelectItem value="pitch_scheduled">Pitch Scheduled</SelectItem>
                  <SelectItem value="seat_reserved">Seat Reserved</SelectItem>
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
                  <TableHead className="pl-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Patient</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Protocol</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tenure</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Clinical Progress</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Eligible Camp Program</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Camp Fee</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Boosting Caller</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</TableHead>
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
                          <p className="text-[11px] text-slate-400">{patient.city}</p>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-medium text-slate-800">
                        {patient.protocol}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 font-bold">
                          {patient.tenureDays} Days
                        </Badge>
                        <p className="text-[10px] text-slate-400 mt-0.5">&gt;3 months</p>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                          {patient.clinicalImprovement}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-medium text-slate-700 max-w-[200px] truncate" title={patient.eligibleCampPlan}>
                        {patient.eligibleCampPlan}
                      </TableCell>

                      <TableCell className="text-xs font-bold text-slate-900">
                        ₹{patient.campPlanFee.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell>
                        {patient.assignedBoostingCaller ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                            <UserCheck className="h-3.5 w-3.5 text-purple-600" />
                            {patient.assignedBoostingCaller}
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
                            patient.boostStatus === "seat_reserved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : patient.boostStatus === "pitch_scheduled"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-purple-100 text-purple-800 border-purple-200"
                          }`}
                        >
                          {patient.boostStatus.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs font-semibold text-[#1F56A3] hover:bg-[#1F56A3]/10"
                            onClick={() => handleSendBrochure(patient)}
                            title="Send residential camp brochure"
                          >
                            <Send className="mr-1 h-3 w-3" />
                            Brochure
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold" asChild>
                            <Link href={`/dashboard/sales/leads/${patient.id}`}>
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Details
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-sm text-slate-500">
                      No residential camp eligible patients found matching your search.
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
