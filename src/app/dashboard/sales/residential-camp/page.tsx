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
  IndianRupee,
  Filter,
} from "lucide-react"

import { useTelecallers } from "@/hooks/use-telecallers"
import { AutoAssignQuantityModal } from "@/components/sales/auto-assign-quantity-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface SalesCampPatient {
  id: string
  name: string
  phone: string
  email: string
  specialty: string
  program: string
  category: "boost_and_payment" | "notification_only"
  enrollmentDate: string
  tenureDays: number
  clinicalImprovement: string
  eligibleCampPlan: string
  campPlanFee: number
  boostStatus: "eligible" | "pitch_scheduled" | "seat_reserved" | "attendance_confirmed"
  assignedBoostingCaller?: string
  city: string
}

const MOCK_SALES_CAMP_PATIENTS: SalesCampPatient[] = [
  {
    id: "CP-301",
    name: "Harishchandra Mehta",
    phone: "+91 98210 55432",
    email: "harishchandra.m@example.com",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Special Care (VIP Reversal)",
    category: "notification_only",
    enrollmentDate: new Date(Date.now() - 86400000 * 110).toISOString(),
    tenureDays: 110,
    clinicalImprovement: "HbA1c: 9.1 → 6.9% (Insulin stopped)",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 0,
    boostStatus: "eligible",
    assignedBoostingCaller: "Divya Rao",
    city: "Mumbai",
  },
  {
    id: "CP-302",
    name: "Sunanda Kadam",
    phone: "+91 98450 12908",
    email: "sunanda.kadam@example.com",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Standard Care",
    category: "boost_and_payment",
    enrollmentDate: new Date(Date.now() - 86400000 * 98).toISOString(),
    tenureDays: 98,
    clinicalImprovement: "HbA1c: 8.4 → 6.7% (-4 kg)",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 35000,
    boostStatus: "pitch_scheduled",
    assignedBoostingCaller: "Divya Rao",
    city: "Pune",
  },
  {
    id: "CP-303",
    name: "Ashok Singhania",
    phone: "+91 98190 77654",
    email: "ashok.singhania@example.com",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Pro Care",
    category: "boost_and_payment",
    enrollmentDate: new Date(Date.now() - 86400000 * 125).toISOString(),
    tenureDays: 125,
    clinicalImprovement: "Off 40 units Lantus insulin, HbA1c 6.5%",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 35000,
    boostStatus: "seat_reserved",
    assignedBoostingCaller: "Divya Rao",
    city: "Delhi",
  },
  {
    id: "CP-304",
    name: "Vandana Deshpande",
    phone: "+91 98811 44321",
    email: "vandana.deshpande@example.com",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Standard Care",
    category: "boost_and_payment",
    enrollmentDate: new Date(Date.now() - 86400000 * 104).toISOString(),
    tenureDays: 104,
    clinicalImprovement: "HbA1c: 8.8 → 7.1% (-3.8 kg)",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 35000,
    boostStatus: "eligible",
    assignedBoostingCaller: undefined,
    city: "Nagpur",
  },
  {
    id: "CP-305",
    name: "Kishore Rao",
    phone: "+91 98320 55112",
    email: "kishore.rao@example.com",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Special Care (VIP Reversal)",
    category: "notification_only",
    enrollmentDate: new Date(Date.now() - 86400000 * 130).toISOString(),
    tenureDays: 130,
    clinicalImprovement: "HbA1c: 7.9 → 6.2% (Reversal Milestone)",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 0,
    boostStatus: "pitch_scheduled",
    assignedBoostingCaller: "Divya Rao",
    city: "Bengaluru",
  },
  {
    id: "CP-306",
    name: "Rajeshwari Patel",
    phone: "+91 98790 66543",
    email: "rajeshwari.p@example.com",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Pro Care",
    category: "boost_and_payment",
    enrollmentDate: new Date(Date.now() - 86400000 * 115).toISOString(),
    tenureDays: 115,
    clinicalImprovement: "Fasting blood sugar: 180 → 112 mg/dL",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 35000,
    boostStatus: "eligible",
    assignedBoostingCaller: undefined,
    city: "Ahmedabad",
  },
  {
    id: "CP-307",
    name: "Mahesh Chandra",
    phone: "+91 98102 33441",
    email: "mahesh.chandra@example.com",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Special Care (VIP Reversal)",
    category: "notification_only",
    enrollmentDate: new Date(Date.now() - 86400000 * 140).toISOString(),
    tenureDays: 140,
    clinicalImprovement: "HbA1c: 9.4 → 6.4% (-6.5 kg)",
    eligibleCampPlan: "7-Day Residential Reversal Retreat (Lonavala)",
    campPlanFee: 0,
    boostStatus: "attendance_confirmed",
    assignedBoostingCaller: "Divya Rao",
    city: "Indore",
  },
  {
    id: "CP-308",
    name: "Bhavna Bhatt",
    phone: "+91 98111 89700",
    email: "bhavna.bhatt@example.com",
    specialty: "Weight Management",
    program: "The Signature 90 Days Weight Loss",
    category: "boost_and_payment",
    enrollmentDate: new Date(Date.now() - 86400000 * 92).toISOString(),
    tenureDays: 92,
    clinicalImprovement: "Weight: 89 → 79 kg (-10 kg)",
    eligibleCampPlan: "5-Day Metabolism Reset Bootcamp",
    campPlanFee: 28000,
    boostStatus: "eligible",
    assignedBoostingCaller: undefined,
    city: "Surat",
  },
]

export default function ResidentialCampBoostingPage() {
  const [patients, setPatients] = React.useState<SalesCampPatient[]>(MOCK_SALES_CAMP_PATIENTS)
  const [search, setSearch] = React.useState("")
  const [specialtyFilter, setSpecialtyFilter] = React.useState("dff")
  const [programFilter, setProgramFilter] = React.useState("all")
  const [categoryTab, setCategoryTab] = React.useState("all")
  const [pendingBoostCount, setPendingBoostCount] = React.useState(180)
  const [isAutoAssignOpen, setIsAutoAssignOpen] = React.useState(false)

  const { data: telecallers = [] } = useTelecallers()
  const campTelecallers = React.useMemo(() => {
    const list = telecallers.filter((tc) => (tc.roleSpecialization || "residential_camp") === "residential_camp")
    return list.length > 0 ? list : telecallers
  }, [telecallers])

  const filteredPatients = React.useMemo(() => {
    return patients.filter((p) => {
      // Specialty Filter
      if (specialtyFilter === "dff" && !p.specialty.includes("DFF") && !p.specialty.includes("Diabetes")) {
        return false
      }
      if (specialtyFilter === "weight" && !p.specialty.includes("Weight")) {
        return false
      }

      // Program-wise Filter under specialty
      if (programFilter === "standard" && !p.program.toLowerCase().includes("standard")) {
        return false
      }
      if (programFilter === "pro" && !p.program.toLowerCase().includes("pro")) {
        return false
      }
      if (programFilter === "special" && !p.program.toLowerCase().includes("special") && !p.program.toLowerCase().includes("vip")) {
        return false
      }

      // Category Tab filter
      if (categoryTab === "boost" && p.category !== "boost_and_payment") return false
      if (categoryTab === "notification_only" && p.category !== "notification_only") return false
      if (categoryTab === "unassigned" && p.assignedBoostingCaller) return false
      if (categoryTab === "reserved" && p.boostStatus !== "seat_reserved" && p.boostStatus !== "attendance_confirmed") return false

      // Search Query
      const term = search.trim().toLowerCase()
      if (term) {
        const matches = [p.name, p.phone, p.program, p.city, p.id]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term))
        if (!matches) return false
      }

      return true
    })
  }, [patients, specialtyFilter, programFilter, categoryTab, search])

  const handleSendBrochure = (patient: SalesCampPatient) => {
    toast.success(`Residential camp notification & booking details sent to ${patient.name} via WhatsApp!`)
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
            assignedBoostingCaller: caller.name || "Divya Rao",
          }
        }
        return item
      })
    })
    toast.success(`Assigned eligible camp leads across ${callers.length} telecallers.`)
  }

  const boostCount = patients.filter((p) => p.category === "boost_and_payment").length
  const notifOnlyCount = patients.filter((p) => p.category === "notification_only").length

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
                Sales Manager Cockpit
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Filter by specialty & program to manage patients eligible for Camp Boosting (Add-on fee) vs Notification Only (Pre-paid VIP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsAutoAssignOpen(true)}
              className="bg-[#1F56A3] hover:bg-[#192B42] text-white font-bold h-11 px-5 rounded-2xl shadow-lg shadow-[#1F56A3]/20"
            >
              <Zap className="mr-2 h-4 w-4 text-[#FFC20E] fill-[#FFC20E]" />
              Auto Assign to Telecallers ({pendingBoostCount} Eligible)
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
              <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
              <p className="text-[11px] text-purple-700 font-medium">
                {boostCount} Boost & Pay · {notifOnlyCount} VIP
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-50 text-[#1F56A3]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Telecallers</p>
              <p className="text-2xl font-bold text-slate-900">
                {campTelecallers.length > 0 ? campTelecallers.length : 3}
              </p>
              <p className="text-[11px] text-blue-700 font-medium">Lead: Divya Rao</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed Participants</p>
              <p className="text-2xl font-bold text-emerald-700">34 Seats</p>
              <p className="text-[11px] text-emerald-600 font-medium">Sept 20-25 Lonavala Batch</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Booster Pipeline</p>
              <p className="text-2xl font-bold text-slate-900">₹63 Lakhs</p>
              <p className="text-[11px] text-amber-700 font-medium">@ ₹35,000 / Add-on Seat</p>
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

      {/* Main Filter & Table Card */}
      <Card className="border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden rounded-3xl">
        <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/40">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Residential Camp Candidate Management
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Filter by specialty (DFF) and program to allocate nurturing and payment recovery workflows.
                </CardDescription>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search candidate or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-xl pl-9 text-xs border-slate-200"
                />
              </div>
            </div>

            {/* Filter Toolbar: Specialty & Program-wise */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Specialty:</span>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="h-8 rounded-xl text-xs font-semibold w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="dff" className="text-xs font-bold text-purple-700">
                      Diabetes Free Forever (DFF)
                    </SelectItem>
                    <SelectItem value="all" className="text-xs">
                      All Specialties
                    </SelectItem>
                    <SelectItem value="weight" className="text-xs">
                      Weight Management
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Program:</span>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="h-8 rounded-xl text-xs font-semibold w-[230px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="text-xs font-bold">
                      All Programs
                    </SelectItem>
                    <SelectItem value="standard" className="text-xs">
                      DFF Standard Care (Add-on ₹35K)
                    </SelectItem>
                    <SelectItem value="pro" className="text-xs">
                      DFF Pro Care (Add-on ₹35K)
                    </SelectItem>
                    <SelectItem value="special" className="text-xs font-bold text-emerald-700">
                      DFF Special Care (VIP Pre-Paid)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Tabs */}
              <Tabs value={categoryTab} onValueChange={setCategoryTab} className="ml-auto">
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="all" className="text-xs font-bold rounded-lg py-1">
                    All ({patients.length})
                  </TabsTrigger>
                  <TabsTrigger value="boost" className="text-xs font-bold rounded-lg py-1 text-amber-900">
                    Boost & Pay ({boostCount})
                  </TabsTrigger>
                  <TabsTrigger value="notification_only" className="text-xs font-bold rounded-lg py-1 text-emerald-800">
                    VIP Pre-Paid ({notifOnlyCount})
                  </TabsTrigger>
                  <TabsTrigger value="unassigned" className="text-xs font-bold rounded-lg py-1 text-rose-800">
                    Unassigned ({patients.filter((p) => !p.assignedBoostingCaller).length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-b border-slate-100">
                  <TableHead className="pl-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Candidate Details</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Program & Category</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tenure & Milestone</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Camp Entitlement</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Assigned Telecaller</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</TableHead>
                  <TableHead className="pr-6 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length ? (
                  filteredPatients.map((patient) => {
                    const isBoost = patient.category === "boost_and_payment"

                    return (
                      <TableRow key={patient.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100/60">
                        <TableCell className="pl-6">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{patient.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{patient.phone}</p>
                            <p className="text-[10px] text-slate-400">{patient.id} · {patient.city}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="text-xs font-semibold text-slate-800">{patient.program}</p>
                          {isBoost ? (
                            <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold mt-0.5">
                              ⚡ Boost & Payment (₹35K)
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold mt-0.5">
                              🎁 Notification Only (VIP Pre-Paid)
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                            {patient.clinicalImprovement}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {patient.tenureDays} Days in Care (&gt;90d)
                          </p>
                        </TableCell>

                        <TableCell>
                          {isBoost ? (
                            <div>
                              <span className="text-xs font-bold text-slate-900">₹35,000 Booster</span>
                              <p className="text-[10px] text-slate-500">Add-on Retreat</p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                Included & Pre-Paid
                              </span>
                              <p className="text-[10px] text-slate-500">₹0 Due</p>
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          {patient.assignedBoostingCaller ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                              <UserCheck className="h-3.5 w-3.5 text-purple-600" />
                              {patient.assignedBoostingCaller}
                            </div>
                          ) : (
                            <Badge variant="secondary" className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                              Unassigned
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            className={`text-xs capitalize font-semibold ${
                              patient.boostStatus === "seat_reserved" || patient.boostStatus === "attendance_confirmed"
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
                              title="Send camp dates & itinerary"
                            >
                              <Send className="mr-1 h-3 w-3" />
                              Notice
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold" asChild>
                              <Link href={`/dashboard/telecaller/residential-camp/${patient.id}`}>
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Details
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-sm text-slate-500">
                      No candidates found matching your active filters.
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
