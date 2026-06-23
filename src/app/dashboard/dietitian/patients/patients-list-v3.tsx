"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, User, Calendar, FileText, Users, Activity, AlertTriangle, Eye, Filter, TrendingUp, CheckCircle2, Clock, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useDietitianPatients } from "@/hooks/use-dietitian-clinical"
import { useTransactionsApi, type ManualPaymentPayload } from "@/hooks/use-transactions-api"
import { useStaffSlots } from "@/hooks/use-dietitian-clinical"
import { apiClient } from "@/lib/api-client"
import { RescheduleSheet } from "@/components/dietitian/patient-details/RescheduleSheet"
import { StatCard } from "@/components/ui/stat-card"
import type { DietitianPatient } from "@/types/dietitian-clinical"
import { useAuthStore } from "@/store/auth-store"

export default function PatientsListClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Dialog states
  const [bookingDialog, setBookingDialog] = useState(false)
  const [notesDialog, setNotesDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<DietitianPatient | null>(null)
  
  // Reschedule form state
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: "",
    startTime: "",
    endTime: "",
    slotId: "",
    appointmentType: "consultation",
    mode: "video" as "audio" | "video" | "offline",
    meetingLink: "",
    address: "",
    reason: "",
  });
  const [isRescheduling, setIsRescheduling] = useState(false)

  // Form states
  const [notes, setNotes] = useState("")

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusFilter, stageFilter, riskFilter])

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
  } = useDietitianPatients({
    page,
    limit,
    search: searchQuery.trim() || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  })

  const patients: DietitianPatient[] = apiResponse?.data ?? []
  const meta = apiResponse?.meta ?? { page: 1, limit, total: patients.length, totalPages: 1, hasNext: false, hasPrev: false }

  const uniqueStages = useMemo(() => {
    const stages = new Set<string>()
    patients.forEach((p) => {
      if (p.program_stage) stages.add(p.program_stage)
    })
    return Array.from(stages)
  }, [patients])

  const uniqueRisks = useMemo(() => {
    const risks = new Set<string>()
    patients.forEach((p) => {
      if (p.risk_level) risks.add(p.risk_level)
    })
    return Array.from(risks)
  }, [patients])

  const filteredPatients = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return patients.filter((patient) => {
      const firstName = patient.first_name?.toLowerCase().trim() ?? ""
      const lastName = patient.last_name?.toLowerCase().trim() ?? ""
      const fullName = [firstName, lastName].filter(Boolean).join(" ")
      const reversedFullName = [lastName, firstName].filter(Boolean).join(" ")
      const phone = patient.phone?.toLowerCase().trim() ?? ""
      const matchesSearch =
        !normalizedQuery ||
        fullName.includes(normalizedQuery) ||
        reversedFullName.includes(normalizedQuery) ||
        phone.includes(normalizedQuery)

      return matchesSearch
    })
  }, [patients, searchQuery])

  const activeCount = patients.filter((p) => p.enrollment_status === "active").length
  const completedCount = patients.filter((p) => p.enrollment_status === "completed").length
  const highRiskCount = patients.filter((p) => p.risk_level === "high" && p.enrollment_status === "active").length

  const getPatientDisplayName = (patient?: DietitianPatient | null) => {
    if (!patient) return "Unknown patient"
    const combinedName = [patient.first_name, patient.last_name]
      .filter((name) => !!name && name.toString().trim())
      .join(" ")
      .trim()
    if (combinedName) return combinedName
    if (patient.phone?.trim()) return patient.phone.trim()
    return `Patient #${patient.patient_id.slice(0, 6)}`
  }

  
  // Action handlers
  const handleBookAppointment = (patient: DietitianPatient) => {
    setSelectedPatient(patient)
    setBookingDialog(true)
    // Reset form with today's date as default
    const today = new Date().toISOString().split('T')[0]
    setRescheduleForm({
      appointmentDate: today,
      startTime: "",
      endTime: "",
      slotId: "",
      appointmentType: "consultation",
      mode: "audio",
      meetingLink: "",
      address: "",
      reason: ""
    })
  }
  
  // Use staff slots hook
  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(rescheduleForm.appointmentDate);
  const availableSlots = slotsResponse?.data || [];
  
  // Reschedule handlers
    const handleFormChange = (field: string, value: any) => {
    if (field === "slotData") {
      setRescheduleForm(prev => ({
        ...prev,
        slotId: value.slotId,
        startTime: value.startTime,
        endTime: value.endTime,
      }));
    } else {
      setRescheduleForm(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  
  const handleReschedule = async () => {
    if (!rescheduleForm.appointmentDate || !rescheduleForm.startTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsRescheduling(true);
    try {
      const payload: any = {
        patientId: selectedPatient?.patient_id,
        staffType: "dietitian",
        staffId: useAuthStore.getState().user.staff_id, // You might need to get this from auth or context
        appointmentDate: rescheduleForm.appointmentDate,
        startTime: rescheduleForm.startTime,
        endTime: rescheduleForm.endTime,
        appointmentType: rescheduleForm.appointmentType,
        reason: rescheduleForm.reason || undefined,
        mode: rescheduleForm.mode,
      };
      
      if (rescheduleForm.mode === "video" && rescheduleForm.meetingLink) {
        payload.meetingLink = rescheduleForm.meetingLink;
      }
      if (rescheduleForm.mode === "offline" && rescheduleForm.slotId) {
        const selectedSlot = availableSlots.find((slot: any) => slot.id === rescheduleForm.slotId);
        if (selectedSlot?.offline_location) {
          payload.offline_location = selectedSlot.offline_location;
        }
      }

      const response = await apiClient.post("/appointments", payload);

      toast.success("Appointment scheduled successfully", {
        description: `New appointment on ${rescheduleForm.appointmentDate} at ${rescheduleForm.startTime}`,
      });

      setBookingDialog(false);
      setSelectedPatient(null);
      setRescheduleForm({
        appointmentDate: "",
        startTime: "",
        endTime: "",
        slotId: "",
        appointmentType: "consultation",
        mode: "audio",
        meetingLink: "",
        address: "",
        reason: ""
      })
    } catch (error: any) {
      console.error("Error scheduling appointment:", error);
      toast.error("Failed to schedule appointment", {
        description: error?.response?.data?.message || "Please try again later"
      });
    } finally {
      setIsRescheduling(false);
    }
  }
  
  const handleRescheduleCancel = () => {
    setBookingDialog(false)
    setSelectedPatient(null)
  }

  const handleAddNotes = (patient: DietitianPatient) => {
    setSelectedPatient(patient)
    setNotesDialog(true)
  }

  const saveNotes = () => {
    if (!notes.trim()) {
      toast.error("Please enter notes")
      return
    }
    toast.success(`Notes saved for ${getPatientDisplayName(selectedPatient)}`)
    setNotesDialog(false)
    setNotes("")
  }
 const getProgramDay = (startDate: any) => {

  if (!startDate) return "Not Initiated";

  const start = new Date(startDate);
  const today = new Date();

  // remove time part
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // future date
  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days to go`;
  }

  // today or past
  return `Day ${diffDays + 1}`;
};
  const formatDate = (value?: string) => {
    if (!value) return "Not available"
    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    } catch {
      return value
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-rose-600">Unable to load patients</p>
          <p className="text-sm text-slate-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Patient Registry</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Manage and monitor patient progress with clinical precision.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          title="Active Patients"
          value={meta.total}
          icon={Users}
          gradient="from-[#1F56A3] to-[#192B42]"
          subtitle="Currently enrolled"
        />

        <StatCard
          title="Completed"
          value={completedCount}
          icon={Activity}
          gradient="from-[#BA2C2C] to-[#192B42]"
          subtitle="Programs finished"
        />

        <StatCard
          title="High Risk"
          value={highRiskCount}
          icon={AlertTriangle}
          gradient="from-[#FFC20E] to-[#1F56A3]"
          subtitle="Require attention"
        />
      </div>

      {/* Search and Filters */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value.trim())
                  setPage(1)
                }}
                className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
              />
            </div>

            <div className="flex flex-wrap gap-3 ">
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] cursor-pointer min-h-[44px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="cur">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-900 hover:to-slate-800 border-b-0">
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Patient</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Program Stage</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Status</TableHead>
                  {/* <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Adherence</TableHead> */}
                  {/* <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Risk Level</TableHead> */}
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Last Consult</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`} className="border-b border-slate-100">
                      <TableCell colSpan={7} className="py-6">
                        <div className="h-6 w-full animate-pulse rounded bg-slate-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="font-medium">No patients found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.patient_id} className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors">
                      <TableCell className="py-4">
                        <Link 
                          href={`/dashboard/dietitian/patients/${patient.patient_id}?name=${encodeURIComponent(getPatientDisplayName(patient))}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {getPatientDisplayName(patient)}
                            </p>
                            <p className="text-xs text-slate-500"> {patient.phone || "No phone"}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="border-slate-300 text-slate-700 font-medium">
                          {patient.current_day
                            ? typeof patient.current_day === 'number'
                              ? `Day ${patient.current_day}`
                              : patient.current_day
                            : "Not Initiated"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`text-xs font-medium px-3 py-1 ${patient.enrollment_status === "active" ? "bg-blue-50 text-blue-700 border border-blue-200" : ""
                          }${patient.enrollment_status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : ""
                          }${patient.enrollment_status === "inactive" ? "bg-slate-50 text-slate-600 border border-slate-200" : ""
                          }`}>
                          {patient.enrollment_status ?? "Unknown"}
                        </Badge>
                      </TableCell>
                      {/* <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                (patient.adherence_percentage ?? 0) >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                                (patient.adherence_percentage ?? 0) >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                                "bg-gradient-to-r from-rose-500 to-pink-500"
                              }`}
                              style={{ width: `${patient.adherence_percentage ?? 0}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${
                            (patient.adherence_percentage ?? 0) >= 80 ? "text-emerald-700" :
                            (patient.adherence_percentage ?? 0) >= 60 ? "text-amber-700" :
                            "text-rose-700"
                          }`}>
                            {patient.adherence_percentage ?? 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`text-xs font-medium px-3 py-1 ${
                          patient.risk_level === "low" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : ""
                        }${
                          patient.risk_level === "medium" ? "bg-amber-50 text-amber-700 border border-amber-200" : ""
                        }${
                          patient.risk_level === "high" ? "bg-rose-50 text-rose-700 border border-rose-200" : ""
                        }`}>
                          {patient.risk_level ?? "Unknown"}
                        </Badge>
                      </TableCell> */}
                      <TableCell className="text-slate-700 text-sm font-medium py-4">
                        {formatDate(
                          //@ts-ignore
                          patient.last_consult_date)}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2 text-nowrap">
                          <Link href={`/dashboard/dietitian/patients/${patient.patient_id}?name=${encodeURIComponent(getPatientDisplayName(patient))}`}>
                            <Button size="sm" className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg shadow-slate-900/20 h-9 px-3">
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold shadow-sm h-9 px-3 transition-colors"
                            onClick={() => handleBookAppointment(patient)}
                          >
                            <Calendar className="h-4 w-4 mr-1.5" />
                            Book Call
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{((meta.page - 1) * meta.limit) + 1}</span> to{" "}
                <span className="font-semibold text-slate-900">{Math.min(meta.page * meta.limit, meta.total)}</span> of{" "}
                <span className="font-semibold text-slate-900">{meta.total}</span> patients
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!meta.hasPrev || isFetching}
                  className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      disabled={isFetching}
                      className={pageNum === meta.page
                        ? "h-8 w-8 rounded-lg bg-slate-900 p-0 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800"
                        : "h-8 w-8 rounded-lg p-0 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
                      }
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!meta.hasNext || isFetching}
                  className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <RescheduleSheet
        open={bookingDialog}
        onOpenChange={(open: boolean) => {
          setBookingDialog(open)
          if (!open) {
            setSelectedPatient(null)
          }
        }}
        patientName={getPatientDisplayName(selectedPatient)}
        rescheduleForm={rescheduleForm}
        availableSlots={availableSlots}
        isLoadingSlots={isLoadingSlots}
        isRescheduling={isRescheduling}
        hasExistingAppointment={false}
        onFormChange={handleFormChange}
        onReschedule={handleReschedule}
        onCancel={handleRescheduleCancel}
      />

      {/* Notes Drawer */}
      <Sheet open={notesDialog} onOpenChange={setNotesDialog}>
        <SheetContent className="sm:max-w-[440px] p-0 bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight">Add Clinical Notes</SheetTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
              {getPatientDisplayName(selectedPatient)}
            </p>
          </div>
          <div className="flex-1 p-6 space-y-5">
            {selectedPatient && (
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{getPatientDisplayName(selectedPatient)}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      #{selectedPatient.patient_id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes" className="font-black text-xs uppercase tracking-widest text-slate-500">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter your clinical notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[180px] font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white resize-none"
              />
            </div>
          </div>
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t p-6 flex gap-3">
            <Button variant="outline" onClick={() => setNotesDialog(false)} className="flex-1 h-12 font-black border-2 rounded-xl">
              Cancel
            </Button>
            <Button onClick={saveNotes} className="flex-1 h-12 bg-gradient-to-r from-slate-900 to-slate-800 font-black shadow-xl rounded-xl">
              <FileText className="h-4 w-4 mr-2" />
              Save Notes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
