"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Video, Edit, X, FileText, User, Search, Link as LinkIcon, CheckCircle2, ArrowUpRight, TrendingUp, RotateCcw, PhoneCall, AlertTriangle, Activity, PlayCircle } from "lucide-react"
import { AddConsultationLinkModal } from "@/components/dietitian/add-consultation-link-modal"
import { StatCard } from "@/components/ui/stat-card"
import { RescheduleSheet } from "@/components/dietitian/patient-details/RescheduleSheet"

import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import {useFitnessCoachAppointmentsList, useFitnessCoachUpcomingAppointments, useStaffSlots } from "@/hooks/use-fitness-coach"
import { useQueryClient } from "@tanstack/react-query"
import { useMissingAppointments } from "@/hooks/use-dietitian-clinical"
// import type { any, RescheduleAppointmentRequest } from "@/types/fitness-coach"

export default function AppointmentsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const currentTab = searchParams.get("tab") || "upcoming"
  const [selectedTab, setSelectedTab] = useState(currentTab)
  const [isMounted, setIsMounted] = useState(false)
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<{ patient: string; time: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showStartSessionDialog, setShowStartSessionDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [pendingActionAppointment, setPendingActionAppointment] = useState<any | null | any>(null)
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    slotId: "",
    appointmentType: "consultation",
    reason: "",
    mode: "video" as "audio" | "video" | "offline",
    meetingLink: "",
    address: "",
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  })
  const [appointments, setAppointments] = useState<any[]>([])

  const {
    data: appointmentsResponse,
    isLoading,
    isFetching,
    error,
  } = useFitnessCoachAppointmentsList({
    page,
    limit,
    status: selectedTab === "all" || selectedTab === "upcoming" ? undefined : selectedTab,
  })

  const {
    data: upcomingResponse,
    isLoading: isLoadingUpcoming,
  } = useFitnessCoachUpcomingAppointments({
    page,
    limit,
    status: "confirmed",
  })
  const {
    data: completedResponse,
    isLoading: isLoadingCompleted,
  } = useFitnessCoachAppointmentsList({
    page,
    limit,
    status: "completed",
  })

  const {
    data: missingResponse,
    isLoading: isLoadingMissing,
    isFetching: isFetchingMissing,
  } = useMissingAppointments({
    page,
    limit,
  })

  const completeAppointmentMutation = {
  mutateAsync: async (appointmentId: string) => {
    const response = await apiClient.post(`/appointments/${appointmentId}/complete`)
    return response.data
  },
  isPending: false
}

  const appointmentsData =
    selectedTab === "completed" ? (completedResponse?.data ?? []) :
      selectedTab === "upcoming" ? (upcomingResponse?.data ?? []) :
        selectedTab === "missing" ? (missingResponse?.data ?? []) :
          (appointmentsResponse?.data ?? [])

  const activeResponse =
    selectedTab === "completed" ? completedResponse :
      selectedTab === "upcoming" ? upcomingResponse :
        selectedTab === "missing" ? missingResponse :
          appointmentsResponse;
  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(rescheduleForm.appointmentDate);
  const availableSlots = slotsResponse?.data || [];

  // Force fresh data when tab changes to prevent showing old cached data
  useEffect(() => {
    if (selectedTab !== currentTab) {
      // Force refetch to get fresh data, not cached data
      queryClient.refetchQueries({ queryKey: ["fitness-coach-appointments"] })
      queryClient.refetchQueries({ queryKey: ["fitness-coach-upcoming-appointments"] })
      queryClient.refetchQueries({ queryKey: ["fitness-coach-missing-appointments"] })
    }
  }, [selectedTab, currentTab, queryClient])

  useEffect(() => {
    setAppointments(appointmentsData)
  }, [appointmentsData])
  const metaPage = Number(activeResponse?.meta?.page ?? page)
  const metaLimit = Number(activeResponse?.meta?.limit ?? limit)
  const metaTotal = Number(activeResponse?.meta?.total ?? appointments.length)
  const metaTotalPages = Number(
    activeResponse?.meta?.totalPages ?? Math.max(1, Math.ceil(metaTotal / Math.max(metaLimit, 1)))
  )
  const meta = {
    page: metaPage,
    limit: metaLimit,
    total: metaTotal,
    totalPages: metaTotalPages,
    hasNext: activeResponse?.meta?.hasNext ?? metaPage < metaTotalPages,
    hasPrev: activeResponse?.meta?.hasPrev ?? metaPage > 1,
  }

  const confirmStartSession = async () => {
    if (!pendingActionAppointment) return
    try {
      const appointmentId = pendingActionAppointment.appointment_id || pendingActionAppointment.id;
      const response = await apiClient.post(`/appointments/${appointmentId}/join`)

      if (response.data?.data?.call_status === "started") {
        toast.error("Current another call is in progress please check that", {
          duration: 4000,
          icon: <AlertTriangle className="h-4 w-4 text-rose-500" />,
        })
        setShowStartSessionDialog(false)
        return
      }

      const patientName = getAppointmentPatientName(pendingActionAppointment)
      setShowStartSessionDialog(false)
      router.push(`/dashboard/fitness-coach/consultation/${pendingActionAppointment.patient_id}?name=${encodeURIComponent(patientName)}`)
      toast.success("Starting consultation session...")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to join session")
    }
  }

  const handleStartConsultation = (appointment: any) => {
    console.log(appointment, "appointment");
    setPendingActionAppointment(appointment)
    setShowStartSessionDialog(true)
  }

  const handleAddConsultationLink = (appointment: any) => {
    setSelectedAppointment({
      patient: getAppointmentPatientName(appointment),
      time: formatTime(getAppointmentTimeValue(appointment))
    })
    setShowConsultationModal(true)
  }

  const handleSingleReschedule = async () => {
    if (!rescheduleForm.appointmentDate || !rescheduleForm.startTime) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsRescheduling(true)
    try {
      const payload = {
        patientId: pendingActionAppointment?.patient_id || "",
        staffType: "dietitian",
        staffId: pendingActionAppointment?.staff_id || "",
        appointmentDate: rescheduleForm.appointmentDate,
        startTime: rescheduleForm.startTime,
        endTime: rescheduleForm.endTime,
        appointmentType: rescheduleForm.appointmentType,
        reason: rescheduleForm.reason || undefined,
        mode: rescheduleForm.mode,
      }
      if (rescheduleForm.mode === "video" && rescheduleForm.meetingLink) {
        //@ts-ignore
        payload.meeting_link = rescheduleForm.meetingLink
      }

      const response = await apiClient.post("/appointments", payload)

      toast.success("Appointment rescheduled successfully", {
        description: `New appointment on ${rescheduleForm.appointmentDate} at ${rescheduleForm.startTime}`,
      })

      setShowRescheduleDialog(false)
      setRescheduleForm({
        appointmentDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        slotId: "",
        appointmentType: "consultation",
        reason: "",
        mode: "video" as "audio" | "video" | "offline",
        meetingLink: "",
        address: "",
      })

      // Refresh appointments
      window.location.reload()
    } catch (error: any) {
      toast.error("Failed to reschedule appointment", {
        description: error?.response?.data?.message || error?.message || "Please try again",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleRescheduleExisting = async (appointmentId: string) => {
    if (!rescheduleForm.appointmentDate || !rescheduleForm.startTime) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsRescheduling(true)
    try {
      const payload: any = {
        newDate: rescheduleForm.appointmentDate,
        newStartTime: rescheduleForm.startTime,
        newEndTime: rescheduleForm.endTime,

      }
      if (rescheduleForm.mode === "video" && rescheduleForm.meetingLink) {
        payload.meeting_link = rescheduleForm.meetingLink
      }

      const response = await apiClient.post(
        `/appointments/${appointmentId}/reschedule`,
        payload,
      )

      toast.success("Appointment rescheduled successfully", {
        description: `Updated to ${rescheduleForm.appointmentDate} at ${rescheduleForm.startTime}`,
      })

      setShowRescheduleDialog(false)
      setRescheduleForm({
        appointmentDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        slotId: "",
        appointmentType: "consultation",
        reason: "",
        mode: "video" as "audio" | "video" | "offline",
        meetingLink: "",
        address: "",
      })

      // Refresh appointments
      window.location.reload()
    } catch (error: any) {
      toast.error("Failed to reschedule appointment", {
        description: error?.response?.data?.message || error?.message || "Please try again",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleReschedule = (appointment: any) => {
    setPendingActionAppointment(appointment)
    setRescheduleAppointmentId(appointment.appointment_id || appointment.id)
    setRescheduleForm({
      appointmentDate: appointment.appointment_date?.split("T")[0] || new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      slotId: "",
      appointmentType: appointment.appointment_type || "consultation",
      reason: "",
      mode: (appointment.mode as "audio" | "video" | "offline") || "video",
      meetingLink: appointment.meeting_link || "",
      address: "",
    })
    setShowRescheduleDialog(true)
  }

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

  const handleCancelReschedule = () => {
    setShowRescheduleDialog(false);
    setRescheduleForm({
      appointmentDate: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      slotId: "",
      appointmentType: "consultation",
      reason: "",
      mode: "video" as "audio" | "video" | "offline",
      meetingLink: "",
      address: "",
    });
    setPendingActionAppointment(null);
    setRescheduleAppointmentId(null);
  };

  const confirmCancel = () => {
    if (!pendingActionAppointment) return
    setAppointments(appointments.map((apt: any) =>
      apt.id === pendingActionAppointment.id ? { ...apt, status: "cancelled" as const } : apt
    ))
    toast.success("Appointment cancelled")
    setShowCancelDialog(false)
    setPendingActionAppointment(null)
  }

  const handleCancel = (appointment: any) => {
    setPendingActionAppointment(appointment)
    setShowCancelDialog(true)
  }

  const handleCompleteAppointment = (appointment: any) => {
    setPendingActionAppointment(appointment)
    setShowCompleteDialog(true)
  }

  const confirmComplete = async () => {
    if (!pendingActionAppointment) return

    try {
      await completeAppointmentMutation.mutateAsync(pendingActionAppointment.id)
      toast.success("Appointment marked as completed")
      setShowCompleteDialog(false)
      setPendingActionAppointment(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to complete appointment")
    }
  }

  const handleAddNotes = (appointmentId: string) => {
    toast.info("Opening notes editor...")
  }

  const getAppointmentPatientName = (appointment?: any | null) => {
    if (!appointment) return "Unknown patient"
    if (appointment.patient_name?.trim()) return appointment.patient_name.trim()
    const combinedName = [
      appointment.patient_first_name,
      appointment.patient_last_name,
      (appointment as any).first_name,
      (appointment as any).last_name
    ]
      .filter((name) => !!name && name.toString().trim())
      .join(" ")
      .trim()
    if (combinedName) return combinedName
    if (appointment.patient_phone?.trim()) return appointment.patient_phone.trim()
    if (appointment.patient_id) return `Patient #${appointment.patient_id.slice(0, 6)}`
    return "Patient"
  }

  const handleViewProfile = (appointment: any) => {
    const name = getAppointmentPatientName(appointment)
    router.push(`/dashboard/fitness-coach/patients/${appointment.patient_id}?ref=appointments&tab=${selectedTab}&name=${encodeURIComponent(name)}`)
  }

  const getAppointmentTimeValue = (appointment: any) => {
    return (
      appointment.appointment_time ||
      appointment.scheduled_time ||
      appointment.start_time ||
      appointment.end_time ||
      undefined
    )
  }

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) {
      return appointments
    }
    
    const query = searchQuery.toLowerCase().trim()
    return appointments.filter((appointment: any) => {
      // Search by patient name
      const patientName = getAppointmentPatientName(appointment)?.toLowerCase() || ""
      if (patientName.includes(query)) return true
      
      // Search by patient phone
      const patientPhone = appointment.patient_phone?.toLowerCase() || ""
      if (patientPhone.includes(query)) return true
      
      // Search by patient ID
      const patientId = appointment.patient_id?.toLowerCase() || ""
      if (patientId.includes(query)) return true
      
      // Search by appointment type
      const appointmentType = appointment.appointment_type?.toLowerCase() || ""
      if (appointmentType.includes(query)) return true
      
      // Search by status
      const status = appointment.status?.toLowerCase() || ""
      if (status.includes(query)) return true
      
      return false
    })
  }, [appointments, searchQuery])

  const hasActiveCall = useMemo(() => {
    return filteredAppointments.some((apt: any) => apt.call_status === "started")
  }, [filteredAppointments])

  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length
  const completedCount = appointments.filter((a) => a.status === "completed").length
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length

  const hasActiveFilters = Boolean(searchQuery.trim() || page > 1)

  const resetView = () => {
    setSearchQuery("")
    setSelectedDate(new Date().toISOString().split("T")[0])
    setPage(1)
  }

  const formatTime = (time?: string) => {
    if (!time) return "--"
    try {
      const [hours, minutes] = time.split(":")
      const date = new Date()
      date.setHours(Number(hours), Number(minutes))
      return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric" }).format(date)
    } catch {
      return time ?? "--"
    }
  }

  const renderEmptyState = (config: {
    icon: ReactNode
    title: string
    description: string
    accent?: string
  }) => (
    <Card className="border border-dashed border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-none">
      <CardContent className="p-12 text-center space-y-6">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl shadow-inner shadow-white/40 ${config.accent ?? "bg-slate-900/90"
            }`}
        >
          {config.icon}
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-900">{config.title}</p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{config.description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {hasActiveFilters && (
          <Button variant="outline" onClick={resetView} className="border-slate-300">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => setSelectedTab("confirmed")}
            className="text-slate-700"
          >
            <Calendar className="mr-2 h-4 w-4" /> View Today&apos;s Queue
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Appointments Queue</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Manage today&apos;s consultation sessions with clinical precision.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-5 ${missingResponse?.meta && missingResponse.meta.total > 0 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        <StatCard
          title="Confirmed"
          value={confirmedCount}
          icon={Calendar}
          gradient="from-[#1F56A3] to-[#192B42]"
          iconBg="bg-gradient-to-br from-[#1F56A3]/20 to-[#192B42]/20"
          iconColor="text-[#1F56A3]"
        />

        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
          gradient="from-[#1F56A3] to-[#192B42]"
          iconBg="bg-gradient-to-br from-[#1F56A3]/20 to-[#192B42]/20"
          iconColor="text-[#1F56A3]"
        />

        <StatCard
          title="Cancelled"
          value={cancelledCount}
          icon={X}
          gradient="from-[#BA2C2C] to-[#192B42]"
          subtitle="Needs follow-up"
        />

        {missingResponse?.meta && missingResponse.meta.total > 0 && (
          <StatCard
            title="Missing"
            value={missingResponse.meta.total}
            icon={AlertTriangle}
            gradient="from-[#BA2C2C] to-[#192B42]"
            iconBg="bg-gradient-to-br from-[#BA2C2C]/20 to-[#192B42]/20"
            iconColor="text-[#BA2C2C]"
          />
        )}
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by patient name, phone, ID, type, or status..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value.trim())
                setPage(1)
              }}
              className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content with Tabs */}
      <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-0">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-base font-semibold text-slate-900">
              Appointment Schedule
            </CardTitle>
          </div>
          {/* Tab Navigation */}
          <div className="flex gap-1 -mb-px">
            <button
              onClick={() => {
                setSelectedTab("confirmed")
                setPage(1)
                router.replace(`/dashboard/fitness-coach/appointments?tab=confirmed`, { scroll: false })
              }}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${selectedTab === "confirmed"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Today</span>
              </div>
            </button>
            <button
              onClick={() => {
                setSelectedTab("upcoming")
                setPage(1)
                router.replace(`/dashboard/fitness-coach/appointments?tab=upcoming`, { scroll: false })
              }}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${selectedTab === "upcoming"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Upcoming</span>
              </div>
            </button>
            <button
              onClick={() => {
                setSelectedTab("completed")
                setPage(1)
                router.replace(`/dashboard/fitness-coach/appointments?tab=completed`, { scroll: false })
              }}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${selectedTab === "completed"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Completed</span>
              </div>
            </button>
            <button
              onClick={() => {
                setSelectedTab("missing")
                setPage(1)
                router.replace(`/dashboard/fitness-coach/appointments?tab=missing`, { scroll: false })
              }}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${selectedTab === "missing"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Missing</span>
              </div>
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Upcoming Tab Content */}
          {selectedTab === "upcoming" && (
            <div className="space-y-4">
              {isLoadingUpcoming ? (
                <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
                  <CardContent className="p-10 space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={`upcoming-skeleton-${idx}`} className="h-16 w-full animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </CardContent>
                </Card>
              ) : filteredAppointments.length === 0 ? (
                renderEmptyState({
                  icon: <Calendar className="h-10 w-10 text-white" />,
                  title: "No upcoming appointments",
                  description: "You don't have any upcoming appointments scheduled. All future confirmed appointments will appear here.",
                  accent: "bg-gradient-to-br from-blue-500 to-indigo-500",
                })
              ) : (
                filteredAppointments.map((appointment: any, idx: any) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl group">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-950 to-indigo-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                              <User className="h-7 w-7 text-white" />
                            </div>
                            <div
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleViewProfile(appointment)}
                            >
                              <h3 className="text-lg font-bold text-slate-900">{getAppointmentPatientName(appointment)}</h3>
                              <div className="flex items-center gap-3 mt-1.5 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-slate-500" />
                                  <span className="font-semibold text-slate-700">
                                    {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-slate-500" />
                                  <span className="font-semibold text-slate-700">{formatTime(getAppointmentTimeValue(appointment))}</span>
                                </div>
                                <Badge className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium capitalize">
                                  {appointment.mode || 'Consultation'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {appointment?.call_type!=="history_call" &&<Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReschedule(appointment)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <Edit className="h-4 w-4 mr-1.5" />
                              Reschedule
                            </Button>}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProfile(appointment)}
                              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <ArrowUpRight className="h-4 w-4 mr-1.5" />
                              Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Today Tab Content */}
          {selectedTab === "confirmed" && (
            <div className="space-y-4">
              {isLoading ? (
                <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
                  <CardContent className="p-10 space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={`confirmed-skeleton-${idx}`} className="h-16 w-full animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </CardContent>
                </Card>
              ) : filteredAppointments.length === 0 ? (
                renderEmptyState({
                  icon: <Calendar className="h-10 w-10 text-white" />,
                  title: "No confirmed appointments",
                  description: "Looks like you don’t have any confirmed sessions for this slot. Try another date or clear filters to see more appointments.",
                  accent: "bg-gradient-to-br from-slate-900 to-slate-700",
                })
              ) : (
                filteredAppointments.map((appointment: any, idx: any) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={`border ${appointment.call_status === "started" ? "border-rose-400 bg-rose-50/30 shadow-rose-100" : "border-slate-200/80 bg-white/80"} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl group`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`h-14 w-14 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ${appointment.call_status === "started" ? "bg-gradient-to-br from-teal-950 to-teal-800" : "bg-gradient-to-br from-slate-900 to-slate-700"
                              }`}>
                              <User className="h-7 w-7 text-white" />
                            </div>
                            <div
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleViewProfile(appointment)}
                            >
                              <h3 className="text-lg font-bold text-slate-900">{getAppointmentPatientName(appointment)}</h3>
                              <div className="flex items-center gap-3 mt-1.5 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-slate-500" />
                                  <span className="font-semibold text-slate-700">{formatTime(getAppointmentTimeValue(appointment))}</span>
                                </div>
                                {appointment.meeting_link && (
                                  <Badge className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                    Link added
                                  </Badge>
                                )}
                                {appointment.call_status === "started" && (
                                  <Badge className="text-[10px] bg-rose-100 text-rose-700 border border-rose-200 font-bold animate-pulse px-2 py-0.5">
                                    <Activity className="h-3 w-3 mr-1" />
                                    LIVE SESSION
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {appointment.call_status === "started" ? (
                              <Button
                                size="sm"
                                onClick={() => router.push(`/dashboard/fitness-coach/consultation/${appointment.patient_id}?name=${encodeURIComponent(getAppointmentPatientName(appointment))}`)}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-900/20 h-10 px-4"
                              >
                                <PlayCircle className="h-4 w-4 mr-1.5" />
                                Resume Session
                              </Button>
                            ) : !appointment.consultation_link ? (
                              <Button
                                size="sm"
                                onClick={() => handleStartConsultation(appointment)}
                                disabled={hasActiveCall}
                                className={`font-semibold shadow-lg shadow-slate-900/20 h-10 px-4 ${hasActiveCall
                                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none"
                                  : "bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white"
                                  }`}
                              >
                                {appointment.mode === "video" ? <Video className="h-4 w-4 mr-1.5" /> : <PhoneCall className="h-4 w-4 mr-1.5" />}
                                Start Session
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddConsultationLink(appointment)}
                                className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                              >
                                <LinkIcon className="h-4 w-4 mr-1.5" />
                                Add Link
                              </Button>
                            )}
                            {appointment?.call_type!=="history_call" &&<Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReschedule(appointment)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <Edit className="h-4 w-4 mr-1.5" />
                              Reschedule
                            </Button>}
                            {/* <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteAppointment(appointment)}
                              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" />
                              Complete
                            </Button> */}
                            {/* <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(appointment)}
                              className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <X className="h-4 w-4 mr-1.5" />
                              Cancel
                            </Button> */}
                            {/* <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddNotes(appointment.appointment_id)}
                              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <FileText className="h-4 w-4 mr-1.5" />
                              Notes
                            </Button> */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProfile(appointment)}
                              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <ArrowUpRight className="h-4 w-4 mr-1.5" />
                              Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Completed Tab Content */}
          {selectedTab === "completed" && (
            <div className="space-y-4">
              {isLoading ? (
                <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
                  <CardContent className="p-10 space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={`completed-skeleton-${idx}`} className="h-16 w-full animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </CardContent>
                </Card>
              ) : filteredAppointments.length === 0 ? (
                renderEmptyState({
                  icon: <CheckCircle2 className="h-10 w-10 text-white" />,
                  title: "No completed appointments",
                  description: "Track session outcomes by confirming completion after each consultation. Completed appointments will appear here.",
                  accent: "bg-gradient-to-br from-emerald-500 to-teal-500",
                })
              ) : (
                filteredAppointments.map((appointment: any, idx: any) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl group">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-950 to-teal-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                              <CheckCircle2 className="h-7 w-7 text-white" />
                            </div>
                            <div
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleViewProfile(appointment)}
                            >
                              <h3 className="text-lg font-bold text-slate-900">{getAppointmentPatientName(appointment)}</h3>
                              <div className="flex items-center gap-3 mt-1.5 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-slate-500" />
                                  <span className="font-semibold text-slate-700">
                                    {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-slate-500" />
                                  <span className="font-semibold text-slate-700">{formatTime(getAppointmentTimeValue(appointment))}</span>
                                </div>
                                <Badge className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium capitalize">
                                  {appointment.mode || 'Consultation'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProfile(appointment)}
                              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <ArrowUpRight className="h-4 w-4 mr-1.5" />
                              Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Missing Tab Content */}
          {selectedTab === "missing" && (
            <div className="space-y-4">
              {isLoadingMissing ? (
                <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
                  <CardContent className="p-10 space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={`missing-skeleton-${idx}`} className="h-16 w-full animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </CardContent>
                </Card>
              ) : filteredAppointments.length === 0 ? (
                renderEmptyState({
                  icon: <AlertTriangle className="h-10 w-10 text-white" />,
                  title: "No missing appointments",
                  description: "Wonderful! No appointments have been missed. All records are up to date.",
                  accent: "bg-gradient-to-br from-amber-500 to-orange-500",
                })
              ) : (
                filteredAppointments.map((appointment: any, idx: any) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl group">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                              <AlertTriangle className="h-7 w-7 text-white" />
                            </div>
                            <div
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleViewProfile(appointment)}
                            >
                              <h3 className="text-lg font-bold text-slate-900">{getAppointmentPatientName(appointment)}</h3>
                              <div className="flex items-center gap-3 mt-1.5 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-slate-500" />
                                  <span className="font-semibold text-slate-700">
                                    {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-slate-500" />
                                  <span className="font-semibold text-slate-700">{formatTime(getAppointmentTimeValue(appointment))}</span>
                                </div>
                                <Badge className="text-xs bg-amber-50 text-amber-700 border border-amber-200 font-medium capitalize">
                                  Missing
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProfile(appointment)}
                              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <ArrowUpRight className="h-4 w-4 mr-1.5" />
                              Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReschedule(appointment)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <Edit className="h-4 w-4 mr-1.5" />
                              Reschedule
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Component */}
      {meta.totalPages > 1 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md mt-6">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{((meta.page - 1) * meta.limit) + 1}</span> to{" "}
                <span className="font-semibold text-slate-900">{Math.min(meta.page * meta.limit, meta.total)}</span> of{" "}
                <span className="font-semibold text-slate-900">{meta.total}</span> appointments
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!meta.hasPrev || (isFetching || isFetchingMissing)}
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
                      disabled={isFetching || isFetchingMissing}
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
                  disabled={!meta.hasNext || (isFetching || isFetchingMissing)}
                  className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed cancelled tab - keeping it simple with 3 tabs */}
      {selectedTab === "cancelled" && (
        <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg mt-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              {isLoading ? (
                <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
                  <CardContent className="p-10 space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={`cancelled-skeleton-${idx}`} className="h-16 w-full animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </CardContent>
                </Card>
              ) : filteredAppointments.length === 0 ? (
                renderEmptyState({
                  icon: <X className="h-10 w-10 text-white" />,
                  title: "No cancelled appointments",
                  description: "Great news—no cancellations have been logged for this period. Keep monitoring to catch reschedule needs early.",
                  accent: "bg-gradient-to-br from-rose-500 to-pink-500",
                })
              ) : (
                filteredAppointments.map((appointment: any, idx: any) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl group">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                              <X className="h-7 w-7 text-white" />
                            </div>
                            <div
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleViewProfile(appointment)}
                            >
                              <h3 className="text-lg font-bold text-slate-900">{getAppointmentPatientName(appointment)}</h3>
                              <div className="flex items-center gap-3 mt-1.5 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-slate-500" />
                                  <span className="font-semibold text-slate-700">
                                    {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-slate-500" />
                                  <span className="font-semibold text-slate-700">{formatTime(getAppointmentTimeValue(appointment))}</span>
                                </div>
                                {appointment.cancellation_reason && (
                                  <Badge variant="outline" className="text-xs border-rose-300 text-rose-700 font-medium">
                                    {appointment.cancellation_reason}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProfile(appointment)}
                              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                            >
                              <ArrowUpRight className="h-4 w-4 mr-1.5" />
                              Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <AddConsultationLinkModal
        open={showConsultationModal}
        onOpenChange={setShowConsultationModal}
        appointment={selectedAppointment}
      />

      {/* Start Session Confirmation Drawer */}
      <Sheet open={showStartSessionDialog} onOpenChange={setShowStartSessionDialog}>
        <SheetContent className="sm:max-w-[440px] p-0 bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight">Start Consultation</SheetTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Session Confirmation</p>
          </div>
          <div className="flex-1 p-6 space-y-6">
            {pendingActionAppointment && (
              <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{getAppointmentPatientName(pendingActionAppointment)}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {formatTime(getAppointmentTimeValue(pendingActionAppointment))}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span className="font-bold text-blue-700">Live video call + adherence tracking</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-emerald-700">Diet plan management included</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t p-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowStartSessionDialog(false)} className="flex-1 h-12 font-black border-2 rounded-xl">
              Cancel
            </Button>
            <Button onClick={confirmStartSession} className="flex-1 h-12 bg-gradient-to-r from-slate-900 to-slate-800 font-black shadow-xl rounded-xl">
              <Video className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Enhanced Reschedule Sheet */}
      <RescheduleSheet
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
        patientName={getAppointmentPatientName(pendingActionAppointment)}
        rescheduleForm={rescheduleForm}
        availableSlots={availableSlots}
        isLoadingSlots={isLoadingSlots}
        isRescheduling={isRescheduling}
        hasExistingAppointment={!!rescheduleAppointmentId}
        onFormChange={handleFormChange}
        onReschedule={() => {
          if (rescheduleAppointmentId) {
            handleRescheduleExisting(rescheduleAppointmentId);
          } else {
            handleSingleReschedule();
          }
        }}
        onCancel={handleCancelReschedule}
      />

      {/* Complete Appointment Drawer */}
      <Sheet open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <SheetContent className="sm:max-w-[440px] p-0 bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight">Complete Appointment</SheetTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Confirm session completion</p>
          </div>
          <div className="flex-1 p-6 space-y-6">
            {pendingActionAppointment && (
              <div className="p-5 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{getAppointmentPatientName(pendingActionAppointment)}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {formatTime(getAppointmentTimeValue(pendingActionAppointment))}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  This will update the appointment status and notify the patient that their session has been completed.
                </p>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t p-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)} disabled={completeAppointmentMutation.isPending} className="flex-1 h-12 font-black border-2 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={confirmComplete}
              disabled={completeAppointmentMutation.isPending}
              className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 font-black shadow-xl rounded-xl"
            >
              {completeAppointmentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Appointment Drawer */}
      <Sheet open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <SheetContent className="sm:max-w-[440px] p-0 bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight">Cancel Appointment</SheetTitle>
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.15em] mt-1">This action cannot be undone</p>
          </div>
          <div className="flex-1 p-6 space-y-6">
            {pendingActionAppointment && (
              <div className="p-5 bg-white rounded-2xl border-2 border-rose-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <X className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{getAppointmentPatientName(pendingActionAppointment)}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {formatTime(getAppointmentTimeValue(pendingActionAppointment))}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  The patient will be notified of the cancellation. Consider rescheduling instead if possible.
                </p>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t p-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="flex-1 h-12 font-black border-2 rounded-xl">
              Keep Appointment
            </Button>
            <Button onClick={confirmCancel} className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 font-black shadow-xl rounded-xl">
              <X className="h-4 w-4 mr-2" />
              Cancel Appointment
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
