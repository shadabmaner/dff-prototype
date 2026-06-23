"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, User, Calendar, Users, Activity, AlertTriangle, Eye, Filter, CheckCircle2, Banknote, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useFitnessCoachPatients } from "@/hooks/use-fitness-coach"
import { useStaffSlots } from "@/hooks/use-dietitian-clinical"
import { useTransactionsApi, type ManualPaymentPayload } from "@/hooks/use-transactions-api"
import { apiClient } from "@/lib/api-client"
import { RescheduleSheet } from "@/components/dietitian/patient-details/RescheduleSheet"
import { useAuthStore } from "@/store/auth-store"
import type { DoctorPatient } from "@/types/doctor-clinical"

export default function FitnessCoachPatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusFilter, stageFilter, riskFilter])

  // Dialog states
  const [bookingDialog, setBookingDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient | null>(null)
  
  // Reschedule form state
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: "",
    startTime: "",
    endTime: "",
    slotId: "",
    appointmentType: "consultation",
    mode: "audio" as "audio" | "video" | "offline",
    meetingLink: "",
    address: "",
    reason: ""
  })
  const [isRescheduling, setIsRescheduling] = useState(false)
  
  // Manual payment state
  const [manualPaymentDrawer, setManualPaymentDrawer] = useState(false)
  const [selectedPatientForPayment, setSelectedPatientForPayment] = useState<DoctorPatient | null>(null)
  const [manualPaymentForm, setManualPaymentForm] = useState<ManualPaymentPayload>({
    patientId: "",
    paymentType: "assessment",
    amount: 0,
    paymentMethod: "manual_cash",
    referenceId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    leadId: "",
    notes: "",
    receipt: "",
    programId: "5d202687-24e6-443a-ae9e-95548647a9fe",
    planId: "b3645b2d-d0ff-4682-bef5-921927639d97",
  })
  const [manualPaymentFormErrors, setManualPaymentFormErrors] = useState<Partial<Record<keyof ManualPaymentPayload, string>>>({})

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
  } = useFitnessCoachPatients({
    page,
    limit,
    search: searchQuery.trim() || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  })

  const patients: DoctorPatient[] = apiResponse?.data ?? []
  const meta = apiResponse?.meta ?? { page: 1, limit, total: patients.length, totalPages: 1, hasNext: false, hasPrev: false }

  const activeCount = patients.filter((p) => p.enrollment_status === "active").length
  const completedCount = patients.filter((p) => p.enrollment_status === "completed").length
  const highRiskCount = patients.filter((p) => p.risk_level === "high" && p.enrollment_status === "active").length

  const getPatientDisplayName = (patient?: DoctorPatient | null) => {
    if (!patient) return "Unknown patient"
    const combinedName = [patient.first_name, patient.last_name]
      .filter((name) => !!name && name.toString().trim())
      .join(" ")
      .trim()
    if (combinedName) return combinedName
    if (patient.phone?.trim()) return patient.phone.trim()
    return `Patient #${patient.patient_id.slice(0, 6)}`
  }
  
  // Use staff slots hook
  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(rescheduleForm.appointmentDate);
  const availableSlots = slotsResponse?.data || [];
  
  // API hooks
  const { recordManualPayment, manualPayLoading } = useTransactionsApi()
  
  // Action handlers
  const handleBookAppointment = (patient: DoctorPatient) => {
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
  
  // Form handlers
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
        staffType: "fitness_coach",
        staffId: useAuthStore.getState().user.staff_id,
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
  
  // Manual payment handlers
  const openManualPaymentDrawer = (patient: DoctorPatient) => {
    setSelectedPatientForPayment(patient)
    setManualPaymentForm({
      patientId: patient.patient_id,
      paymentType: "assessment",
      amount: 0,
      paymentMethod: "manual_cash",
      referenceId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      leadId: patient.patient_id,
      notes: `Payment for patient ${getPatientDisplayName(patient)}`,
      receipt: "",
      programId: "5d202687-24e6-443a-ae9e-95548647a9fe",
      planId: "b3645b2d-d0ff-4682-bef5-921927639d97",
    })
    setManualPaymentFormErrors({})
    setManualPaymentDrawer(true)
  }

  const updateManualPaymentForm = (field: keyof ManualPaymentPayload, value: string | number) => {
    setManualPaymentForm((prev: any) => ({ ...prev, [field]: value }))
    if (manualPaymentFormErrors[field]) {
      setManualPaymentFormErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateManualPaymentForm = (): boolean => {
    const errs: Partial<Record<keyof ManualPaymentPayload, string>> = {}
    if (!manualPaymentForm.patientId.trim()) errs.patientId = "Patient ID is required"
    if (!manualPaymentForm.amount || manualPaymentForm.amount <= 0) errs.amount = "Enter a valid amount"
    setManualPaymentFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleManualPaymentSubmit = async () => {
    if (!validateManualPaymentForm()) return
    
    const success = await recordManualPayment(manualPaymentForm)
    if (success) {
      setManualPaymentDrawer(false)
      setSelectedPatientForPayment(null)
      toast.success("Manual payment recorded successfully")
    }
  }

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return patients.filter((patient) => {
      const firstName = patient.first_name?.toLowerCase().trim() ?? ""
      const lastName = patient.last_name?.toLowerCase().trim() ?? ""
      const fullName = [firstName, lastName].filter(Boolean).join(" ")
      const reversedFullName = [lastName, firstName].filter(Boolean).join(" ")
      const phone = patient.phone?.toLowerCase().trim() ?? ""
      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        reversedFullName.includes(query) ||
        phone.includes(query)
      const matchesStage = stageFilter === "all" || patient.program_stage === stageFilter
      const matchesRisk = riskFilter === "all" || patient.risk_level === riskFilter
      return matchesSearch && matchesStage && matchesRisk
    })
  }, [patients, searchQuery, stageFilter, riskFilter])
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
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Assigned Patients</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Manage and monitor your assigned patients with clinical precision.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Total Patients</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{meta.total}</p>
                <p className="text-xs text-blue-700/80 font-medium">Currently assigned</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
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
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Completed</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{completedCount}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Programs finished</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">High Risk</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{highRiskCount}</p>
                <p className="text-xs text-rose-700/80 font-medium">Require attention</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="Month 1">Month 1</SelectItem>
                  <SelectItem value="Month 2">Month 2</SelectItem>
                  <SelectItem value="Month 3">Month 3</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
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
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{getPatientDisplayName(patient)}</p>
                            <p className="text-xs text-slate-500">#{patient.patient_id.slice(0, 6)} · {patient.phone || "No phone"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="border-slate-300 text-slate-700 font-medium">
                          {patient.current_day
                            ? typeof patient.current_day === 'number'
                              ? `Day ${patient.current_day}`
                              : patient.current_day
                            : getProgramDay(patient.starts_at)}
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
                              className={`h-full transition-all ${(patient.adherence_percentage ?? 0) >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                                  (patient.adherence_percentage ?? 0) >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                                    "bg-gradient-to-r from-rose-500 to-pink-500"
                                }`}
                              style={{ width: `${patient.adherence_percentage ?? 0}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${(patient.adherence_percentage ?? 0) >= 80 ? "text-emerald-700" :
                              (patient.adherence_percentage ?? 0) >= 60 ? "text-amber-700" :
                                "text-rose-700"
                            }`}>
                            {patient.adherence_percentage ?? 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`text-xs font-medium px-3 py-1 ${patient.risk_level === "low" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : ""
                          }${patient.risk_level === "medium" ? "bg-amber-50 text-amber-700 border border-amber-200" : ""
                          }${patient.risk_level === "high" ? "bg-rose-50 text-rose-700 border border-rose-200" : ""
                          }`}>
                          {patient.risk_level ?? "Unknown"}
                        </Badge>
                      </TableCell> */}
                      <TableCell className="text-slate-700 text-sm font-medium py-4">
                        {formatDate(patient.last_consulted_at)}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/fitness-coach/patients/${patient.patient_id}?name=${encodeURIComponent(getPatientDisplayName(patient))}`}>
                            <Button size="sm" className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg shadow-slate-900/20 h-9 px-3">
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                          </Link>
                          <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-9 px-3"
                              onClick={() => handleBookAppointment(patient)}
                            >
                              <Calendar className="h-4 w-4 mr-1.5" />
                              Book
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
              <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
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

      {/* Manual Payment Drawer */}
      <Sheet open={manualPaymentDrawer} onOpenChange={(open) => { if (!open) { setManualPaymentDrawer(false); setSelectedPatientForPayment(null) } }}>
        <SheetContent className="w-[500px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />Record Manual Payment
            </SheetTitle>
            {selectedPatientForPayment && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-900">{getPatientDisplayName(selectedPatientForPayment)}</p>
                <p className="text-xs text-slate-600 mt-1">Patient ID: {selectedPatientForPayment.patient_id}</p>
                {selectedPatientForPayment.email && (
                  <p className="text-xs text-slate-600">{selectedPatientForPayment.email}</p>
                )}
                {selectedPatientForPayment.phone && (
                  <p className="text-xs text-slate-600">{selectedPatientForPayment.phone}</p>
                )}
              </div>
            )}
          </SheetHeader>
          
          <div className="space-y-4 py-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Patient ID <span className="text-rose-500">*</span></Label>
              <Input
                value={manualPaymentForm.patientId}
                onChange={(e) => updateManualPaymentForm("patientId", e.target.value)}
                placeholder="Patient ID"
                className="border-slate-300"
                disabled={true}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Lead ID <span className="text-rose-500">*</span></Label>
              <Input
                value={manualPaymentForm.leadId}
                onChange={(e) => updateManualPaymentForm("leadId", e.target.value)}
                placeholder="Lead ID"
                className="border-slate-300"
                disabled={true}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Payment Type</Label>
                <Select value={manualPaymentForm.paymentType} onValueChange={(value) => updateManualPaymentForm("paymentType", value)}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="program">Program</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Amount <span className="text-rose-500">*</span></Label>
                <Input
                  value={manualPaymentForm.amount || ""}
                  onChange={(e) => updateManualPaymentForm("amount", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="border-slate-300"
                  type="number"
                />
                {manualPaymentFormErrors.amount && <p className="text-xs text-rose-500">{manualPaymentFormErrors.amount}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Payment Method</Label>
              <Select value={manualPaymentForm.paymentMethod} onValueChange={(value) => updateManualPaymentForm("paymentMethod", value)}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_cash">Cash</SelectItem>
                  <SelectItem value="manual_upi">UPI</SelectItem>
                  <SelectItem value="manual_bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="manual_cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Reference ID</Label>
              <Input
                value={manualPaymentForm.referenceId}
                onChange={(e) => updateManualPaymentForm("referenceId", e.target.value)}
                placeholder="Reference ID (optional)"
                className="border-slate-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Receipt</Label>
              <Input
                value={manualPaymentForm.receipt}
                onChange={(e) => updateManualPaymentForm("receipt", e.target.value)}
                placeholder="Receipt number (optional)"
                className="border-slate-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Program ID</Label>
                <Input
                  value={manualPaymentForm.programId || ""}
                  onChange={(e) => updateManualPaymentForm("programId", e.target.value)}
                  placeholder="5d202687-24e6-443a-ae9e-95548647a9fe"
                  className="border-slate-300 bg-slate-50"
                  disabled={true}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Plan ID</Label>
                <Input
                  value={manualPaymentForm.planId || ""}
                  onChange={(e) => updateManualPaymentForm("planId", e.target.value)}
                  placeholder="b3645b2d-d0ff-4682-bef5-921927639d97"
                  className="border-slate-300 bg-slate-50"
                  disabled={true}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Notes</Label>
              <Textarea value={manualPaymentForm.notes} onChange={(e) => updateManualPaymentForm("notes", e.target.value)} placeholder="Any additional info..." className="border-slate-300 resize-none" rows={3} />
            </div>
          </div>
          
          <SheetFooter className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => { setManualPaymentDrawer(false); setSelectedPatientForPayment(null) }} className="border-slate-300" disabled={manualPayLoading}>Cancel</Button>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg"
              onClick={handleManualPaymentSubmit} disabled={manualPayLoading}>
              {manualPayLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Recording...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Record Payment</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
