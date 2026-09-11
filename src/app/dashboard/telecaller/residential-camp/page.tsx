"use client"

import * as React from "react"
import {
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  Search,
  Filter,
  Send,
  Calendar,
  ExternalLink,
  IndianRupee,
  ShieldCheck,
  CheckSquare,
  Square,
  ChevronRight,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DateRangeFilter, type DateRangeFilterValue } from "@/components/shared/date-range-filter"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"
import {
  useResidentialCampStore,
  type CampPatient,
  type CampEligibilityCategory,
} from "@/store/residential-camp-store"
import { CampBulkNotifyModal } from "@/components/telecaller/camp-bulk-notify-modal"
import { CampCallLogModal } from "@/components/telecaller/camp-call-log-modal"
import { CampPaymentModal } from "@/components/telecaller/camp-payment-modal"
import { toast } from "sonner"

export default function TelecallerResidentialCampPage() {
  const { patients, defaultEvent, logCall } = useResidentialCampStore()

  // Filters
  const [tab, setTab] = React.useState("all")
  const [search, setSearch] = React.useState("")
  const [specialtyFilter, setSpecialtyFilter] = React.useState("dff")
  const [programFilter, setProgramFilter] = React.useState("all")
  const [callerScope, setCallerScope] = React.useState("my_assigned")
  const [dateFilter, setDateFilter] = React.useState<DateRangeFilterValue>({
    preset: "last_7_days",
    label: "Last 7 Days",
  })

  // Bulk Selection
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // Active Modals
  const [isBulkNotifyOpen, setIsBulkNotifyOpen] = React.useState(false)
  const [bulkNotifyPatients, setBulkNotifyPatients] = React.useState<CampPatient[]>([])

  const [activeCallPatient, setActiveCallPatient] = React.useState<CampPatient | null>(null)
  const [isCallLogOpen, setIsCallLogOpen] = React.useState(false)

  const [activePayPatient, setActivePayPatient] = React.useState<CampPatient | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false)

  // Filtered Patients
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

      // Caller Scope
      if (callerScope === "my_assigned" && p.assignedCaller !== "Divya Rao") {
        return false
      }

      // Tab category filter
      if (tab === "boost_payment" && p.category !== "boost_and_payment") return false
      if (tab === "notification_only" && p.category !== "notification_only") return false
      if (tab === "reminder_sent" && p.status !== "notification_sent") return false
      if (tab === "reserved" && p.status !== "seat_reserved" && p.status !== "attendance_confirmed") return false

      // Search Query
      const term = search.trim().toLowerCase()
      if (term) {
        const match =
          p.name.toLowerCase().includes(term) ||
          p.phone.includes(term) ||
          p.city.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term) ||
          p.program.toLowerCase().includes(term)
        if (!match) return false
      }

      return true
    })
  }, [patients, specialtyFilter, programFilter, callerScope, tab, search])

  // Bulk Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredPatients.map((p) => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectedPatientsList = React.useMemo(() => {
    return patients.filter((p) => selectedIds.includes(p.id))
  }, [patients, selectedIds])

  const openBulkModal = (targets?: CampPatient[]) => {
    const list = targets || selectedPatientsList
    if (!list.length) {
      toast.error("Please select at least one patient to send notifications.")
      return
    }
    setBulkNotifyPatients(list)
    setIsBulkNotifyOpen(true)
  }

  const handleCallComplete = (patientId: string, log: any) => {
    logCall(patientId, {
      callerName: "Divya Rao",
      callerRole: "Residential Camp Booster",
      duration: `${log.durationMins} mins`,
      outcome: log.status === "seat_reserved" ? "Seat Reserved @ ₹35,000" : log.status,
      notes: log.notes,
    })
  }

  // Counts for tabs
  const boostCount = patients.filter((p) => p.category === "boost_and_payment").length
  const notifOnlyCount = patients.filter((p) => p.category === "notification_only").length
  const reservedCount = patients.filter((p) => p.status === "seat_reserved" || p.status === "attendance_confirmed").length
  const sentCount = patients.filter((p) => p.status === "notification_sent").length

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/telecaller">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Residential Camp Booster Queue
            </h1>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold text-xs">
              Divya Rao · Camp Booster
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Specialty & program-wise patient queue for residential detox camp nurturing, bulk notifications, and payment collection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          <TelecallerRoleHeaderBadge />
        </div>
      </div>

      {/* Camp Event Spotlight Card */}
      <div className="rounded-3xl border border-purple-200/90 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#FFC20E] text-slate-950 font-bold text-xs py-0.5 shadow-sm">
                🌟 UPCOMING RETREAT
              </Badge>
              <span className="text-xs font-semibold text-purple-200">
                Batch: {defaultEvent.dates}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {defaultEvent.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-purple-400" />
                {defaultEvent.locationName}
              </span>
              <a
                href={defaultEvent.mapLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-purple-300 underline font-bold hover:text-white transition-colors"
              >
                Google Maps Link
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-xs text-purple-300/90">
              Proposed Fee: <strong className="text-white">₹35,000</strong> for Standard/Pro Care ·{" "}
              <strong className="text-emerald-300">Pre-Paid & Included</strong> for Special Care (VIP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => openBulkModal(filteredPatients)}
              className="bg-[#FFC20E] hover:bg-[#e0ab0c] text-slate-950 font-bold h-10 px-4 rounded-xl shadow-lg"
            >
              <Send className="mr-1.5 h-4 w-4 text-slate-950" />
              Notify All ({filteredPatients.length} in View)
            </Button>
            {selectedIds.length > 0 && (
              <Button
                onClick={() => openBulkModal(selectedPatientsList)}
                className="bg-white hover:bg-slate-100 text-purple-900 font-bold h-10 px-4 rounded-xl shadow-md"
              >
                <Sparkles className="mr-1.5 h-4 w-4 text-purple-700" />
                Notify Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Specialty, Program, Scope */}
      <Card className="border border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-sm rounded-3xl p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Specialty Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Specialty Filter
              </label>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="h-9 rounded-xl text-xs font-semibold">
                  <SelectValue placeholder="Select Specialty" />
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

            {/* Program-wise Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Program Filter (Under DFF)
              </label>
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="h-9 rounded-xl text-xs font-semibold">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-xs font-bold">
                    All Programs ({patients.length})
                  </SelectItem>
                  <SelectItem value="standard" className="text-xs">
                    DFF Standard Care (Add-on ₹35K)
                  </SelectItem>
                  <SelectItem value="pro" className="text-xs">
                    DFF Pro Care (Add-on ₹35K)
                  </SelectItem>
                  <SelectItem value="special" className="text-xs text-emerald-700 font-bold">
                    DFF Special Care (VIP Pre-Paid)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Caller Scope */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Telecaller Queue
              </label>
              <Select value={callerScope} onValueChange={setCallerScope}>
                <SelectTrigger className="h-9 rounded-xl text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="my_assigned" className="text-xs font-bold text-purple-800">
                    My Assigned Patients (Divya Rao)
                  </SelectItem>
                  <SelectItem value="all_leads" className="text-xs">
                    All Telecallers Queue
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72 pt-1 lg:pt-4">
            <Search className="absolute left-3 top-6 lg:top-7 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search patient, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl"
            />
          </div>
        </div>
      </Card>

      {/* Main Table Card with Tabs */}
      <Card className="border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden rounded-3xl">
        <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
              <TabsList className="bg-slate-100/90 p-1 rounded-xl flex-wrap h-auto">
                <TabsTrigger value="all" className="text-xs font-bold rounded-lg py-1.5">
                  All ({patients.length})
                </TabsTrigger>
                <TabsTrigger value="boost_payment" className="text-xs font-bold rounded-lg py-1.5 text-amber-900">
                  ⚡ Boost & Payment ({boostCount})
                </TabsTrigger>
                <TabsTrigger value="notification_only" className="text-xs font-bold rounded-lg py-1.5 text-emerald-800">
                  🎁 Notification Only / VIP ({notifOnlyCount})
                </TabsTrigger>
                <TabsTrigger value="reminder_sent" className="text-xs font-bold rounded-lg py-1.5">
                  Notified ({sentCount})
                </TabsTrigger>
                <TabsTrigger value="reserved" className="text-xs font-bold rounded-lg py-1.5 text-purple-800">
                  Reserved ({reservedCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Selection info bar */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-purple-50 text-purple-900 px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold">
                <span>{selectedIds.length} patients selected</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                  className="h-6 px-1.5 text-[10px] text-purple-700 hover:text-purple-900"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => openBulkModal(selectedPatientsList)}
                  className="h-7 px-3 text-xs bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold ml-1"
                >
                  <Send className="mr-1 h-3 w-3" />
                  Notify Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="w-10 pl-6">
                  <Checkbox
                    checked={
                      filteredPatients.length > 0 &&
                      filteredPatients.every((p) => selectedIds.includes(p.id))
                    }
                    onCheckedChange={(c) => handleSelectAll(!!c)}
                  />
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Patient Information</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Program & Category</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Clinical Milestone</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Camp Fee Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Outreach Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Direct Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((item) => {
                  const isSelected = selectedIds.includes(item.id)
                  const isBoost = item.category === "boost_and_payment"

                  return (
                    <TableRow
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-purple-50/40" : ""
                      }`}
                    >
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(item.id)}
                        />
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/dashboard/telecaller/residential-camp/${item.id}`}
                          className="hover:underline"
                        >
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        </Link>
                        <p className="text-[11px] text-slate-500 font-mono">{item.phone}</p>
                        <p className="text-[10px] text-slate-400">
                          {item.id} · {item.city}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="text-xs font-bold text-slate-800">{item.program}</p>
                        {isBoost ? (
                          <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold mt-1">
                            ⚡ Boost & Payment (₹35K)
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold mt-1">
                            🎁 Notification Only (Pre-Paid VIP)
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <p className="text-xs font-semibold text-emerald-700">
                          {item.clinicalMilestone}
                        </p>
                        <Badge variant="outline" className="text-[10px] text-slate-600 bg-slate-50 mt-0.5">
                          {item.tenureDays} Days Active (&gt;90d)
                        </Badge>
                      </TableCell>

                      {/* Concise short manner payment info */}
                      <TableCell>
                        {item.paymentSummary.campPaymentStatus === "included_prepaid" ? (
                          <div>
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Pre-Paid in VIP
                            </span>
                            <p className="text-[10px] text-slate-500">₹0 Camp Balance</p>
                          </div>
                        ) : item.paymentSummary.campPaymentStatus === "paid" ? (
                          <div>
                            <span className="text-xs font-bold text-purple-900">
                              Paid ₹{item.paymentSummary.paidAmount.toLocaleString("en-IN")}
                            </span>
                            <p className="text-[10px] text-purple-700 font-medium">Seat Confirmed</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs font-bold text-amber-900">
                              ₹35,000 Pending
                            </span>
                            <p className="text-[10px] text-slate-500">Add-on Retreat</p>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {item.status === "seat_reserved" ? (
                          <Badge className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold">
                            🌟 Seat Reserved
                          </Badge>
                        ) : item.status === "attendance_confirmed" ? (
                          <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                            ✓ Attendance Confirmed
                          </Badge>
                        ) : item.status === "notification_sent" ? (
                          <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Notification Dispatched
                          </Badge>
                        ) : item.status === "call_logged" ? (
                          <Badge className="bg-teal-100 text-teal-800 text-[10px] font-bold">
                            Call Logged
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-300 text-slate-700 text-[10px] font-semibold">
                            Eligible Candidate
                          </Badge>
                        )}
                        {item.latestCallNotes && (
                          <p className="text-[10px] text-slate-500 italic truncate max-w-[140px] mt-0.5" title={item.latestCallNotes}>
                            "{item.latestCallNotes}"
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send Notification Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openBulkModal([item])}
                            className="h-8 text-xs font-bold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 px-2.5"
                            title="Send personalized camp notification with Google Maps link"
                          >
                            <Send className="mr-1 h-3.5 w-3.5" />
                            Notify
                          </Button>

                          {/* Log Call Button */}
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveCallPatient(item)
                              setIsCallLogOpen(true)
                            }}
                            className="h-8 text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-sm px-2.5"
                            title="Log booster phone call"
                          >
                            <PhoneCall className="mr-1 h-3.5 w-3.5" />
                            Call
                          </Button>

                          {/* If Boost & Payment, quick pay link button */}
                          {isBoost && item.paymentSummary.campPaymentStatus !== "paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActivePayPatient(item)
                                setIsPaymentOpen(true)
                              }}
                              className="h-8 text-xs font-bold rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-50 px-2"
                              title="Razorpay Payment Link / Record Payment"
                            >
                              <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                            </Button>
                          )}

                          {/* Details Page Link */}
                          <Link href={`/dashboard/telecaller/residential-camp/${item.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-xl text-slate-600 hover:text-slate-900"
                              title="Open Patient Detail Page"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-xs text-slate-500">
                    No residential camp patients matching your active filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <CampBulkNotifyModal
        open={isBulkNotifyOpen}
        onOpenChange={setIsBulkNotifyOpen}
        selectedPatients={bulkNotifyPatients}
        onDispatched={() => setSelectedIds([])}
      />

      {activeCallPatient && (
        <CampCallLogModal
          open={isCallLogOpen}
          onOpenChange={setIsCallLogOpen}
          patientId={activeCallPatient.id}
          patientName={activeCallPatient.name}
          patientPhone={activeCallPatient.phone}
          campName={defaultEvent.title}
          onComplete={handleCallComplete}
        />
      )}

      {activePayPatient && (
        <CampPaymentModal
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
          patient={activePayPatient}
        />
      )}
    </div>
  )
}
