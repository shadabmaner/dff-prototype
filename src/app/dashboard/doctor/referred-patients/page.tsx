"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Search,
  User,
  UserPlus,
  Calendar,
  Clock,
  AlertTriangle,
  Eye,
  Filter,
  FileText,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Stethoscope,
  PhoneCall,
  Video,
} from "lucide-react"
import Link from "next/link"
import { useReferrals } from "@/hooks/use-referrals"
import type { Referral } from "@/hooks/use-referrals"
import { useBookDoctorAppointment } from "@/hooks/use-doctor"
import { useStaffSlots } from "@/hooks/use-dietitian-clinical"
import { apiClient } from "@/lib/api-client"
import { RescheduleSheet } from "@/components/doctor/patient-details/RescheduleSheet"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ReferredPatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [bookingDialog, setBookingDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Referral | null>(null)

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


  // Legacy state for backward compatibility
  const [scheduleCallDrawerOpen, setScheduleCallDrawerOpen] = useState(false)
  const [schedulingReferral, setSchedulingReferral] = useState<Referral | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    duration: 30,
    mode: "video" as const,
    callType: "consultation",
    reason: "",
  })

  const bookAppointmentMutation = useBookDoctorAppointment()

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
  } = useReferrals({ page, limit, status: statusFilter === "all" ? undefined : statusFilter })

  const referrals: Referral[] = apiResponse?.data ?? []
  const meta = apiResponse?.meta ?? { page: 1, limit, total: referrals.length, totalPages: 1, hasNext: false, hasPrev: false }

  // Stats
  const totalReferrals = meta?.total ?? referrals.length
  const highPriorityCount = referrals.filter((r) => r.priority?.toLowerCase() === "high").length
  const pendingCount = referrals.filter((r) => r.status?.toLowerCase() === "pending").length

  // Filtered referrals
  const filteredReferrals = referrals.filter((referral) => {
    const patientFirstName = referral.patient?.first_name || referral.patient_first_name || "";
    const patientLastName = referral.patient?.last_name || referral.patient_last_name || "";
    const patientName = `${patientFirstName} ${patientLastName}`.toLowerCase();

    const referredByFirst = referral.referred_by_first_name || "";
    const referredByLast = referral.referred_by_last_name || "";
    const referredByFullName = (referral.referred_by?.name || `${referredByFirst} ${referredByLast}`.trim()).toLowerCase();

    const query = (searchQuery || "").trim().toLowerCase();
    const matchesSearch = !query ||
      patientName.includes(query) ||
      referredByFullName.includes(query) ||
      (referral.reason || "").toLowerCase().includes(query);

    const matchesPriority = priorityFilter === "all" || referral.priority?.toLowerCase() === priorityFilter;
    const matchesStatus = statusFilter === "all" || referral.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleOpenScheduleCall = (referral: Referral) => {
    setSchedulingReferral(referral)
    setScheduleForm({
      ...scheduleForm,
      reason: referral.reason || ""
    })
    setScheduleCallDrawerOpen(true)
  }

  const handleScheduleCall = async () => {
    if (!schedulingReferral) return

    try {
      await bookAppointmentMutation.mutateAsync({
        patientId: schedulingReferral.patient_id,
        appointmentDate: scheduleForm.date,
        startTime: scheduleForm.time,
        durationMins: scheduleForm.duration,
        mode: scheduleForm.mode,
        //@ts-ignore
        callType: scheduleForm.callType,
        reason: scheduleForm.reason,
      })
      toast.success("Appointment scheduled successfully")
      setScheduleCallDrawerOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule appointment")
    }
  }

  const formatDate = (value?: string) => {
    if (!value) return "N/A"
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

  const formatDateTime = (value?: string) => {
    if (!value) return "N/A"
    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    } catch {
      return value
    }
  }

  const getPriorityBadge = (priority?: string) => {
    const p = priority?.toLowerCase()
    if (p === "high") return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium">High</Badge>
    if (p === "medium") return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium">Medium</Badge>
    return <Badge className="bg-slate-50 text-slate-600 border border-slate-200 font-medium">Low</Badge>
  }

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase()
    if (s === "completed" || s === "accepted") return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium capitalize">{status}</Badge>
    if (s === "in_progress" || s === "in-progress") return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium">In Progress</Badge>
    if (s === "rejected" || s === "declined") return <Badge className="bg-rose-50 text-rose-700 border border-rose-200 font-medium capitalize">{status}</Badge>
    return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium capitalize">{status || "Pending"}</Badge>
  }
  
  const getPatientDisplayName = (referral?: Referral | null) => {
    if (!referral) return "Unknown patient"
    const firstName = referral.patient?.first_name || referral.patient_first_name || ""
    const lastName = referral.patient?.last_name || referral.patient_last_name || ""
    const combinedName = [firstName, lastName]
      .filter((name) => !!name && name.toString().trim())
      .join(" ")
      .trim()
    if (combinedName) return combinedName
    if (referral.patient_id) return `Patient #${referral.patient_id.slice(0, 6)}`
    return "Unknown patient"
  }
  
  // Use staff slots hook
  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(rescheduleForm.appointmentDate);
  const availableSlots = slotsResponse?.data || [];
  
  
  // Action handlers
  const handleBookAppointment = (referral: Referral) => {
    setSelectedPatient(referral)
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
      reason: referral.reason || ""
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
        staffType: "doctor",
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
  

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-rose-600">Unable to load referrals</p>
          <p className="text-sm text-slate-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Doctor Portal / Referrals</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Referred Patients</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              View and manage patients referred to you by dietitians and other clinical staff.
            </p>
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
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Total Referrals</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{totalReferrals}</p>
                <p className="text-xs text-blue-700/80 font-medium">All time referrals</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Pending</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{pendingCount}</p>
                <p className="text-xs text-amber-700/80 font-medium">Awaiting action</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
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
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">High Priority</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{highPriorityCount}</p>
                <p className="text-xs text-rose-700/80 font-medium">Require urgent attention</p>
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
                placeholder="Search by patient name, referrer, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-900 hover:to-slate-800 border-b-0">
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Patient</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Referred By</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Reason</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Priority</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Date</TableHead>
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
                ) : filteredReferrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <UserPlus className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="font-medium">No referrals found</p>
                        <p className="text-xs text-slate-400">Referrals from dietitians will appear here</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReferrals.map((referral) => (
                    <TableRow key={referral.id} className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {referral.patient?.first_name || referral.patient_first_name || ""} {referral.patient?.last_name || referral.patient_last_name || ""}
                            </p>
                            <p className="text-xs text-slate-500">
                              {referral.patient?.phone || referral.patient_phone || referral.patient_id?.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {referral.referred_by?.name || `${referral.referred_by_first_name || ""} ${referral.referred_by_last_name || ""}`.trim() || "—"}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {referral.referred_by?.role?.replace(/_/g, " ") || referral.referred_by_staff_type?.replace(/_/g, " ") || ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 max-w-[200px]">
                        <p className="text-sm text-slate-700 truncate" title={referral.reason}>
                          {referral.reason || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        {getPriorityBadge(referral.priority)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(referral.status)}
                      </TableCell>
                      <TableCell className="text-slate-700 text-sm font-medium py-4">
                        {formatDate(referral.created_at)}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2">
                          <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-9 px-3"
                              onClick={() => handleBookAppointment(referral)}
                            >
                              <Calendar className="h-4 w-4 mr-1.5" />
                              Book
                            </Button>
                          {referral.patient_id && (
                            <Link href={`/dashboard/doctor/patients/${referral.patient_id}?name=${encodeURIComponent(`${referral.patient?.first_name || referral.patient_first_name} ${referral.patient?.last_name || referral.patient_last_name}`.trim())}`}>
                              <Button size="sm" className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg shadow-slate-900/20 h-9 px-3">
                                <ArrowUpRight className="h-4 w-4 mr-1.5" />
                                Patient
                              </Button>
                            </Link>
                          )}
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
                <span className="font-semibold text-slate-900">{meta.total}</span> referrals
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!meta.hasPrev || isFetching}
                  className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
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
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Detail Drawer */}
      <Sheet open={!!selectedReferral} onOpenChange={(open) => !open && setSelectedReferral(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              Referral Details
            </SheetTitle>
            <SheetDescription className="text-slate-600">
              Complete information about this clinical referral
            </SheetDescription>
          </SheetHeader>

          {selectedReferral && (
            <div className="mt-8 space-y-6">
              {/* Patient Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Patient Information</h4>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedReferral.patient?.first_name} {selectedReferral.patient?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{selectedReferral.patient?.phone || selectedReferral.patient?.email || "—"}</p>
                    </div>
                  </div>
                  {selectedReferral.patient_id && (
                    <Link href={`/dashboard/doctor/patients/${selectedReferral.patient_id}?name=${encodeURIComponent(`${selectedReferral.patient?.first_name || selectedReferral.patient_first_name} ${selectedReferral.patient?.last_name || selectedReferral.patient_last_name}`.trim())}`}>
                      <Button size="sm" variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-white">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        View Patient Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Referred By */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Referred By</h4>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Name</span>
                    <span className="font-semibold text-slate-900">{selectedReferral.referred_by?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Role</span>
                    <Badge variant="outline" className="capitalize">{selectedReferral.referred_by?.role?.replace(/_/g, " ") || "—"}</Badge>
                  </div>
                </div>
              </div>

              {/* Referral Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Referral Information</h4>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Priority</span>
                    {getPriorityBadge(selectedReferral.priority)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Status</span>
                    {getStatusBadge(selectedReferral.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Referred On</span>
                    <span className="font-semibold text-slate-900">{formatDateTime(selectedReferral.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Reason for Referral</h4>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex gap-2">
                    <FileText className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-900">{selectedReferral.reason || "No reason provided"}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedReferral.notes && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Additional Notes</h4>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700">{selectedReferral.notes}</p>
                  </div>
                </div>
              )}

              {/* Close */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReferral(null)}
                  className="w-full border-slate-300 hover:bg-slate-50 h-11 font-semibold"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Doctor Reschedule Sheet */}
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
    </div>
  )
}
