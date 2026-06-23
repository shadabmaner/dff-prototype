"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { DataTable, Column } from "@/components/service/data-table"
import { HistoryCallSheet, PREDEFINED_LOCATIONS, type HistoryCallFormState } from "@/components/service/history-call-sheet"
import { StatusBadge } from "@/components/service/status-badge"
import { StatsCard } from "@/components/service/stats-card"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Users,
  Phone,
  QrCode,
  UserPlus,
  Calendar,
  CheckCircle2,
  IndianRupee,
  Eye,
  PhoneCall,
  UserCheck,
  DollarSign,
  Video,
  Clock,
  Loader2,
  Activity,
  RotateCcw,
  Search,
  MapPin
} from "lucide-react"
import type { PendingPatient } from "@/types/service"
import { usePatients, useScheduleHistoryCall, useRescheduleHistoryCall, useMissingAppointments } from "@/hooks/use-service-api"
import { useStaffDropdown } from "@/hooks/use-dropdowns"
import type { PatientListItem, HistoryCallRequest } from "@/types/service-api"
export default function PendingAssessmentPage() {
  const [page, setPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [patientSearch, setPatientSearch] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get("tab")
  const validTabs = ["confirmed", "not_scheduled", "missing"] as const
  const initialTab: typeof validTabs[number] = validTabs.includes(rawTab as any) ? (rawTab as typeof validTabs[number]) : "not_scheduled"
  const [historyTab, setHistoryTab] = useState<typeof validTabs[number]>(initialTab)

  const changeTab = (tab: typeof validTabs[number]) => {
    setHistoryTab(tab)
    setHistoryPage(1)
    router.replace(`/dashboard/service/pending-assessment?tab=${tab}`, { scroll: false })
  }

  const { data: response, isLoading: loading, isFetching, refetch, error } = usePatients({
    page,
    limit: 20,
    search: patientSearch.trim(),
    speciality_id: "c645fc87-cb78-4f23-97e8-3a5282912901"
  })

  const {
    data: historyResponse,
    isLoading: historyLoading,
    isFetching: historyFetching,
    refetch: refetchHistory,
    error: historyError,
  } = usePatients({
    page: historyPage,
    limit: 10,
    speciality_id: "c645fc87-cb78-4f23-97e8-3a5282912901",
    history_call_status: historyTab !== "missing" ? historyTab : undefined,
  }, {
    enabled: historyTab !== "missing"
  })

  const {
    data: missingResponse,
    isLoading: missingLoading,
    isFetching: missingFetching,
    error: missingError,
  } = useMissingAppointments({
    page: historyPage,
    limit: 10,
    call_type: "history_call",
  }, {
    enabled: historyTab === "missing"
  })
  // Fetch staff members by type using new dropdown API
  const { data: doctors = [] } = useStaffDropdown({ role: "doctor" })
  const { data: nutritionists = [] } = useStaffDropdown({ role: "dietitian" })
  const { data: fitnessCoaches = [] } = useStaffDropdown({ role: "fitness_coach" })

  // History call mutation
  const scheduleHistoryCallMutation = useScheduleHistoryCall()
  const rescheduleHistoryCallMutation = useRescheduleHistoryCall()

  const patients = response?.data ?? []
  const patientsMeta = response?.meta

  const historyPatients = historyResponse?.data ?? []
  const historyMeta = historyResponse?.meta

  const missingAppointments = missingResponse?.data ?? []
  const missingMeta = missingResponse?.meta

  // historyPage reset is now handled inside changeTab

  useEffect(() => {
    patients.forEach((p) => {
      router.prefetch(`/dashboard/service/pending-assessment/${p.patient_id}`)
    })
  }, [patients, router])

  useEffect(() => {
    historyPatients.forEach((p) => {
      router.prefetch(`/dashboard/service/pending-assessment/${p.patient_id}`)
    })
  }, [historyPatients, router])

  useEffect(() => {
    missingAppointments.forEach((p: any) => {
      router.prefetch(`/dashboard/service/pending-assessment/${p.patient_id}`)
    })
  }, [missingAppointments, router])


  const [showAddModal, setShowAddModal] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPatient, setDrawerPatient] = useState<PatientListItem | null>(null)
  const [historyCallDrawerOpen, setHistoryCallDrawerOpen] = useState(false)
  const [historyCallPatient, setHistoryCallPatient] = useState<any | null>(null)
  const [isHistoryCallSubmitting, setIsHistoryCallSubmitting] = useState(false)
  const [historyCallForm, setHistoryCallForm] = useState<HistoryCallFormState>({
    doctor_id: "",
    nutritionist_id: "",
    fitness_coach_id: "",
    scheduled_date: "",
    scheduled_time: "",
    duration_mins: 45,
    mode: "video" as "video" | "audio" | "offline" ,
    notes: "",
    meeting_link: "",
    offline_location_id: "",
  })

  const historyTabsConfig: Array<{ value: "confirmed" | "not_scheduled" | "missing"; label: string; description: string }> = [
    { value: "not_scheduled", label: "Not Scheduled", description: "Patients waiting for a call" },
    { value: "confirmed", label: "Confirmed", description: "Scheduled history calls" },
    { value: "missing", label: "Missing", description: "Missed appointments" },
  ]
 const historyColumns: Column<PatientListItem>[] = [
    {
      header: "Patient ID",
      cell: (row) => <p className="text-xs font-mono">{row.first_name?.charAt(0)}{row.last_name?.charAt(0)}{row.phone?.charAt(3)}{row.phone?.charAt(5)}</p>,
    },
    {
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      header: "Call Status",
      cell: (row) => <StatusBadge status={row.history_call_status ?? "not_scheduled"} type="call" />,
    },
    {
      header: "Scheduled Date & Time",
      cell: (row) => (
        <div className="text-sm text-slate-600">
          {row.history_call_date ? (
            <>
              <p className="font-medium">{new Date(row.history_call_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-xs text-slate-500">{row.history_call_time || "--"}</p>
            </>
          ) : (
            <span className="text-xs text-slate-400">Not scheduled</span>
          )}
        </div>
      ),
    },
    {
      header: "Assigned Staff",
      cell: (row) => (
        <div className="text-xs text-slate-600 space-y-1">
          {row.doctor_first_name && row.doctor_last_name ? (
            <p>Dr. {row.doctor_first_name} {row.doctor_last_name}</p>
          ) : (
            <p className="text-slate-400">No doctor</p>
          )}
          {row.dietician_first_name && row.dietician_last_name && (
            <p>Dt. {row.dietician_first_name} {row.dietician_last_name}</p>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.history_call_status !== "confirmed" ? (
            row?.assessment_status === "completed" && (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                onClick={(event) => {
                  event.stopPropagation()
                  openHistoryCallDrawer(row)
                }}
              >
                <Video className="h-3 w-3 mr-1" />
                Schedule
              </Button>
            )
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              onClick={(event) => {
                event.stopPropagation()
                openHistoryCallDrawer(row)
              }}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Reschedule
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              router.push(`/dashboard/service/pending-assessment/${row.patient_id}?first_name=${encodeURIComponent(row.first_name || '')}&last_name=${encodeURIComponent(row.last_name || '')}`)
            }}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>

        </div>
      ),
    },
  ]
  const notScheduledColumn: Column<PatientListItem>[] = [
    {
      header: "Patient ID",
      cell: (row) => <p className="text-xs font-mono">{row.first_name?.charAt(0)}{row.last_name?.charAt(0)}{row.phone?.charAt(3)}{row.phone?.charAt(5)}</p>,
    },
    {
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      header: "Call Status",
      cell: (row) => <StatusBadge status={row.history_call_status ?? "not_scheduled"} type="call" />,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              router.push(`/dashboard/service/pending-assessment/${row.patient_id}?first_name=${encodeURIComponent(row.first_name || '')}&last_name=${encodeURIComponent(row.last_name || '')}`)
            }}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {row.history_call_status !== "confirmed" ? (
            row?.assessment_status === "completed" && (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                onClick={(event) => {
                  event.stopPropagation()
                  openHistoryCallDrawer(row)
                }}
              >
                <Video className="h-3 w-3 mr-1" />
                Schedule
              </Button>
            )
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              onClick={(event) => {
                event.stopPropagation()
                openHistoryCallDrawer(row)
              }}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Reschedule
            </Button>
          )}
        </div>
      ),
    },
  ]

  const columns: Column<PatientListItem>[] = [
    {
      header: "Patient ID",
      cell: (row) => <p className="text-xs font-mono">{row.first_name?.charAt(0)}{row.last_name?.charAt(0)}{row.phone?.charAt(3)}{row.phone?.charAt(5)}</p>,
    },
    {
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      header: "Program",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.program_name}</p>
          <p className="text-xs text-slate-500">{row.duration_days || 0} days • {row.speciality_name}</p>
        </div>
      ),
    },
    {
      header: "Enrollment Status",
      cell: (row) => <StatusBadge status={row.enrollment_status} type="patient" />,
    },
    {
      header: "History Call",
      cell: (row) => (
        <div>
          {row.history_call_status ? (
            <div className="space-y-1">
              <StatusBadge status={row.history_call_status} type="call" />
              {row.history_call_date && (
                <p className="text-xs text-slate-500">
                  {new Date(row.history_call_date).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400">Not scheduled</span>
          )}
        </div>
      ),
    },
    {
      header: "Assigned Staff",
      cell: (row) => (
        <div className="text-xs text-slate-600">
          {row.doctor_first_name && row.doctor_last_name
            ? `Dr. ${row.doctor_first_name} ${row.doctor_last_name}`
            : "Not assigned"}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              router.push(`/dashboard/service/pending-assessment/${row.patient_id}?first_name=${encodeURIComponent(row.first_name || '')}&last_name=${encodeURIComponent(row.last_name || '')}`)
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {!row.history_call_status && (
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              onClick={(event) => {
                console.log(row, "row")
                event.stopPropagation()
                openHistoryCallDrawer(row)
              }}
            >
              <Video className="h-3 w-3 mr-1" />
              History Call
            </Button>
          )}
        </div>
      ),
    },
  ]

  const missingColumns: Column<any>[] = [
    {
      header: "Patient ID",
      cell: (row) => <p className="text-xs font-mono">{row.first_name?.charAt(0)}{row.last_name?.charAt(0)}{row.phone?.charAt(3)}{row.phone?.charAt(5)}</p>,
    },
    {
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      header: "Date & Time",
      cell: (row) => (
        <div className="text-sm text-slate-600">
          {row.appointment_date ? (
            <>
              <p className="font-medium">{new Date(row.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-xs text-slate-500">{row.start_time || "--"}</p>
            </>
          ) : (
            <span className="text-xs text-slate-400">Not scheduled</span>
          )}
        </div>
      ),
    },
    {
      header: "Assigned Staff",
      cell: (row) => {
        const staffArray: Array<{ staff_id: string; first_name?: string; last_name?: string; staff_type: string; is_host?: boolean }> =
          Array.isArray(row.staff) ? row.staff : []

        if (staffArray.length === 0) {
          // Fallback to flat fields (other tabs)
          if (row.staff_first_name && row.staff_last_name) {
            return (
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-medium text-slate-800">
                  {row.staff_type === "doctor" ? "Dr." : row.staff_type === "dietitian" ? "Dt." : ""} {row.staff_first_name} {row.staff_last_name}
                </p>
                {row.staff_type && (
                  <p className="text-slate-500 capitalize">{row.staff_type.replace("_", " ")}</p>
                )}
              </div>
            )
          }
          return <p className="text-xs text-slate-400">Not assigned</p>
        }

        const labelMap: Record<string, string> = {
          doctor: "Dr.",
          dietitian: "Dt.",
          fitness_coach: "",
        }

        return (
          <div className="text-xs text-slate-600 space-y-1">
            {staffArray.map((s) => (
              <p key={s.staff_id} className="font-medium text-slate-800">
                {labelMap[s.staff_type] ?? ""} {s.first_name} {s.last_name}
                <span className="ml-1 text-slate-400 capitalize font-normal">({s.staff_type.replace("_", " ")})</span>
              </p>
            ))}
          </div>
        )
      },
    },
    {
      header: "Mode & Status",
      cell: (row) => (
        <div className="space-y-1 flex flex-col items-start gap-1">
          <Badge variant="outline" className="capitalize">{row.mode}</Badge>
          <Badge variant="outline" className="capitalize border-amber-200 text-amber-700 bg-amber-50">Missing</Badge>
        </div>
      )
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            onClick={(event) => {
              event.stopPropagation()
              openHistoryCallDrawer(row as unknown as PatientListItem)
            }}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Reschedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              router.push(`/dashboard/service/pending-assessment/${row.patient_id}?first_name=${encodeURIComponent(row.first_name || '')}&last_name=${encodeURIComponent(row.last_name || '')}`)
            }}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      ),
    },
  ]

  const openDrawer = (patient: PatientListItem) => {
    setDrawerPatient(patient)
    setDrawerOpen(true)
  }

  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open)
    if (!open) {
      setDrawerPatient(null)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 16; hour++) {
      for (let minute = 0; minute < 60; minute += 20) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        slots.push(time)
      }
    }
    // Add 17:00 as the last slot
    slots.push("17:00")
    return slots
  }

  const timeSlots = generateTimeSlots()

  const openHistoryCallDrawer = (patient: any) => {
    let scheduledDate = patient.history_call_date || patient.appointment_date
    let scheduledTime = patient.history_call_time || patient.start_time

    if (!scheduledDate || !scheduledTime) {
      const now = new Date()
      scheduledDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      scheduledTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      
      if (currentHours < 9) {
        scheduledTime = "09:00"
      } else if (currentHours >= 17) {
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)
        scheduledDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
        scheduledTime = "09:00"
      } else {
        // Find the next available 20-minute slot
        const nextSlot = timeSlots.find(slot => {
          const [slotHour, slotMinute] = slot.split(':').map(Number)
          return slotHour > currentHours || (slotHour === currentHours && slotMinute > currentMinutes)
        })
        scheduledTime = nextSlot || "09:00"
      }
    } else {
      if (scheduledDate.includes('T')) scheduledDate = scheduledDate.split('T')[0]
      if (scheduledTime) scheduledTime = scheduledTime.slice(0, 5)
    }

    // Extract staff IDs — missing appointments have a nested `staff` array;
    // other tabs expose flat fields (doctor_id, staff_type, etc.)
    const staffArray: Array<{ staff_id: string; staff_type: string; is_host?: boolean }> =
      Array.isArray(patient.staff) ? patient.staff : []

    const doctorFromArray    = staffArray.find((s) => s.staff_type === "doctor")
    const dietitianFromArray = staffArray.find((s) => s.staff_type === "dietitian")
    const coachFromArray     = staffArray.find((s) => s.staff_type === "fitness_coach")

    const resolvedDoctorId =
      doctorFromArray?.staff_id ||
      (patient.staff_type === "doctor" ? patient.staff_id : undefined) ||
      patient.doctor_id ||
      patient.assigned_doctor_id ||
      ""

    const resolvedNutritionistId =
      dietitianFromArray?.staff_id ||
      (patient.staff_type === "dietitian" || patient.staff_type === "nutritionist" ? patient.staff_id : undefined) ||
      patient.nutritionist_id ||
      patient.assigned_nutritionist_id ||
      ""

    const resolvedFitnessCoachId =
      coachFromArray?.staff_id ||
      (patient.staff_type === "fitness_coach" ? patient.staff_id : undefined) ||
      patient.fitness_coach_id ||
      patient.assigned_fitness_coach_id ||
      ""

    // Add static data for assigned providers if not present
    const patientWithProviders = {
      ...patient,
      doctor_first_name: patient.doctor_first_name || "Rajesh",
      doctor_last_name: patient.doctor_last_name || "Sharma",
      dietician_first_name: patient.dietician_first_name || "Priya",
      dietician_last_name: patient.dietician_last_name || "Patel",
      fitness_coach_first_name: patient.fitness_coach_first_name || "Amit",
      fitness_coach_last_name: patient.fitness_coach_last_name || "Kumar",
      mentor_first_name: patient.mentor_first_name || "Sneha",
      mentor_last_name: patient.mentor_last_name || "Verma",
    }

    setHistoryCallPatient(patientWithProviders)
    setHistoryCallForm({
      doctor_id: resolvedDoctorId,
      nutritionist_id: resolvedNutritionistId,
      fitness_coach_id: resolvedFitnessCoachId,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      duration_mins: patient.duration_mins || patient.duration || (patient.start_time && patient.end_time
        ? (new Date(`1970/01/01 ${patient.end_time}`).getTime() - new Date(`1970/01/01 ${patient.start_time}`).getTime()) / 60000
        : 45),
      mode: patient.mode || patient.history_call_mode || "video",
      notes: patient.notes || "",
      meeting_link: patient.history_call_meeting_link || "",
    })
    setHistoryCallDrawerOpen(true)
  }

  const handleHistoryCallDrawerChange = (open: boolean) => {
    setHistoryCallDrawerOpen(open)
    if (!open) {
      setIsHistoryCallSubmitting(false)
      setHistoryCallPatient(null)
      setHistoryCallForm({
        doctor_id: "",
        nutritionist_id: "",
        fitness_coach_id: "",
        scheduled_date: "",
        scheduled_time: "",
        duration_mins: 45,
        mode: "video" as "video" | "audio" | "offline",
        notes: "",
        meeting_link: "",
        offline_location_id: "",
      })
    }
  }

  const handleHistoryCallFormChange = <K extends keyof HistoryCallFormState>(
    field: K,
    value: HistoryCallFormState[K]
  ) => {
    setHistoryCallForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleHistoryCallSubmit = async () => {
    if (!historyCallPatient || isHistoryCallSubmitting) return

    // Validation: Check if scheduled time is in the past for today and within business hours (9am-5pm)
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const [hours, minutes] = historyCallForm.scheduled_time.split(':').map(Number)

    if (hours < 9 || hours >= 17) {
      toast.error("Invalid call time", {
        description: "Please select a time between 9:00 AM and 5:00 PM."
      })
      return
    }

    if (historyCallForm.scheduled_date === todayStr) {
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()

      if (hours < currentHours || (hours === currentHours && minutes <= currentMinutes)) {
        toast.error("Invalid call time", {
          description: "For today, please select a time in the future."
        })
        return
      }
    }

    // Validation: Check if address is selected for in-person mode
    if (historyCallForm.mode === "offline" && !historyCallForm.offline_location_id) {
      toast.error("Please select an address", {
        description: "Address is required for in-person consultations."
      })
      return
    }

    console.log(historyCallPatient, "historyCallPatient")

    const payload: HistoryCallRequest = {
      doctor_id: historyCallForm.doctor_id,
      nutritionist_id: historyCallForm.nutritionist_id,
      fitness_coach_id: historyCallForm.fitness_coach_id || undefined,
      scheduled_date: historyCallForm.scheduled_date,
      scheduled_time: historyCallForm.scheduled_time,
      duration_mins: historyCallForm.duration_mins,
      mode: historyCallForm.mode === "offline" ? "offline" : historyCallForm.mode,
      notes: historyCallForm.notes || undefined,
    }

    if (historyCallForm.mode === "video") {
      const trimmedLink = historyCallForm.meeting_link?.trim()
      if (trimmedLink) {
        payload.meeting_link = trimmedLink
      }
    }

    if (historyCallForm.mode === "offline" && historyCallForm.offline_location_id) {
        const location = PREDEFINED_LOCATIONS[historyCallForm.offline_location_id]
        payload.offline_location = {
          city: location.city,
          address: location.address,
          pincode: location.pincode,
          displayName: location.displayName
        }
      }

    const isReschedule = Boolean(historyCallPatient.history_call_id || (historyCallPatient as any).appointment_id)
    setIsHistoryCallSubmitting(true)

    if (isReschedule) {
      const appointmentId = historyCallPatient.history_call_id || (historyCallPatient as any).appointment_id
      rescheduleHistoryCallMutation.mutate(
        {
          appointmentId: appointmentId!,
          data: payload,
        },
        {
          onSuccess: () => {
            toast.success("History call rescheduled", {
              description: `Appointment rescheduled for ${historyCallPatient.first_name || 'Patient'} on ${historyCallForm.scheduled_date} at ${historyCallForm.scheduled_time}`,
            })
            setIsHistoryCallSubmitting(false)
            handleHistoryCallDrawerChange(false)
          },
          onError: (error: any) => {
            toast.error("Failed to reschedule call", {
              description: error?.message || "Please try again"
            })
            setIsHistoryCallSubmitting(false)
          },
        }
      )
    } else {
      scheduleHistoryCallMutation.mutate(
        {
          patientId: historyCallPatient.patient_id,
          data: payload,
        },
        {
          onSuccess: () => {
            toast.success("History call scheduled", {
              description: `Appointment scheduled for ${historyCallPatient.first_name || 'Patient'} on ${historyCallForm.scheduled_date} at ${historyCallForm.scheduled_time}`,
            })
            setIsHistoryCallSubmitting(false)
            handleHistoryCallDrawerChange(false)
          },
          onError: (error: any) => {
            toast.error("Failed to schedule call", {
              description: error?.response?.data?.message || error?.message || "Please try again"
            })
            setIsHistoryCallSubmitting(false)
          },
        }
      )
    }
  }
  console.log(doctors.find(d => d.staff_id === historyCallForm.doctor_id), doctors, historyCallForm, "doctor")
  console.log(nutritionists.find(n => n.staff_id === historyCallForm.nutritionist_id), "nutritionist")
  console.log(fitnessCoaches.find(f => f.staff_id === historyCallForm.fitness_coach_id), "fitnessCoach")

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              History Call Management
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Manage patients awaiting consultation and onboarding
            </p>
          </div>
          {/* <Button 
            className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Pending Patient
          </Button> */}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Pending"
          value={patients.length.toString()}
          subtitle="Fee paid patients"
          icon={Users}
          colorScheme="blue"
        />
        <StatsCard
          title="Assessment Done"
          value={patients.filter(p => p.assessment_status === "completed").length.toString()}
          subtitle="Assessments completed"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatsCard
          title="History Calls"
          value={patients.filter(p => p.history_call_status).length.toString()}
          subtitle="Scheduled calls"
          icon={Calendar}
          colorScheme="purple"
        />
      </div>

      {/* All Patients Section */}
      <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, phone, or email"
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600"
                onClick={() => {
                  setPatientSearch("")
                  setPage(1)
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Unable to load patients. Please try again.
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={`patient-skeleton-${idx}`} className="h-20 w-full animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white shadow-inner flex items-center justify-center border border-slate-200">
                <Users className="h-8 w-8 text-slate-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">No patients found</h3>
                <p className="text-sm text-slate-600 max-w-md">
                  {patientSearch ? "No patients match your search criteria." : "No enrolled patients yet. Add a patient to get started."}
                </p>
              </div>
              <Button
                className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
                onClick={() => setShowAddModal(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </div>
          ) : (
            <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    History Call
                  </CardTitle>
                </div>
                {/* Tab Navigation - Matching Staff Details Exactly */}
                <div className="flex gap-1 -mb-px">
                  <button
                    onClick={() => changeTab("not_scheduled")}
                    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${historyTab === "not_scheduled"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Not Scheduled</span>
                    </div>
                  </button>
                  <button
                    onClick={() => changeTab("confirmed")}
                    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${historyTab === "confirmed"
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirmed</span>
                    </div>
                  </button>
                  <button
                    onClick={() => changeTab("missing")}
                    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${historyTab === "missing"
                      ? "border-amber-600 text-amber-600"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Missing</span>
                    </div>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0 [&_thead>tr]:!bg-slate-900 [&_thead>tr>th]:!text-slate-100 [&_th]:!font-semibold">
                {/* Not Scheduled Tab Content */}
                {historyTab === "not_scheduled" && (
                  <div className="p-6 space-y-4">
                    {historyError && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        Unable to load history calls. Please try again.
                      </div>
                    )}

                    {historyLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={`history-skeleton-${idx}`} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
                        ))}
                      </div>
                    ) : historyPatients.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
                        <Video className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="font-semibold text-slate-900">No not scheduled history calls</p>
                        <p className="text-sm text-slate-500">Patients who haven't been scheduled for history calls yet</p>
                      </div>
                    ) : (
                      <>
                        <DataTable
                          data={historyPatients}
                          columns={notScheduledColumn}
                          showSearch={false}
                          enablePagination={false}
                          onRowClick={(row) => router.push(`/dashboard/service/pending-assessment/${row.patient_id}?first_name=${encodeURIComponent(row.first_name || "")}&last_name=${encodeURIComponent(row.last_name || "")}`)}
                        />
                        {historyMeta && historyPatients.length > 0 && (
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-600">
                              Showing {((historyMeta.page - 1) * historyMeta.limit) + 1} to {Math.min(historyMeta.page * historyMeta.limit, historyMeta.total)} of <span className="font-semibold text-slate-900">{historyMeta.total}</span> entries
                            </p>
                            <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!historyMeta.hasPrev || historyFetching}
                                onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                                className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                              >
                                Previous
                              </Button>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, historyMeta.totalPages) }, (_, i) => {
                                  const pageNum = i + 1
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setHistoryPage(pageNum)}
                                      disabled={historyFetching}
                                      className={historyMeta.page === pageNum
                                        ? "h-8 w-8 rounded-lg bg-slate-900 p-0 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800"
                                        : "h-8 w-8 rounded-lg p-0 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
                                      }
                                    >
                                      {pageNum}
                                    </Button>
                                  )
                                })}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!historyMeta.hasNext || historyFetching}
                                onClick={() => setHistoryPage((prev) => prev + 1)}
                                className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Confirmed Tab Content */}
                {historyTab === "confirmed" && (
                  <div className="p-6 space-y-4">
                    {historyError && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        Unable to load history calls. Please try again.
                      </div>
                    )}

                    {historyLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={`history-skeleton-${idx}`} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
                        ))}
                      </div>
                    ) : historyPatients.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
                        <Video className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="font-semibold text-slate-900">No confirmed history calls</p>
                        <p className="text-sm text-slate-500">Patients with scheduled history calls</p>
                      </div>
                    ) : (
                      <>
                        <DataTable
                          data={historyPatients}
                          columns={historyColumns}
                          showSearch={false}
                          enablePagination={false}
                          onRowClick={(row) => router.push(`/dashboard/service/pending-assessment/${row.patient_id}?first_name=${encodeURIComponent(row.first_name || "")}&last_name=${encodeURIComponent(row.last_name || "")}`)}
                        />
                        {historyMeta && historyPatients.length > 0 && (
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-600">
                              Showing {((historyMeta.page - 1) * historyMeta.limit) + 1} to {Math.min(historyMeta.page * historyMeta.limit, historyMeta.total)} of <span className="font-semibold text-slate-900">{historyMeta.total}</span> entries
                            </p>
                            <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!historyMeta.hasPrev || historyFetching}
                                onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                                className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                              >
                                Previous
                              </Button>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, historyMeta.totalPages) }, (_, i) => {
                                  const pageNum = i + 1
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setHistoryPage(pageNum)}
                                      disabled={historyFetching}
                                      className={historyMeta.page === pageNum
                                        ? "h-8 w-8 rounded-lg bg-slate-900 p-0 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800"
                                        : "h-8 w-8 rounded-lg p-0 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
                                      }
                                    >
                                      {pageNum}
                                    </Button>
                                  )
                                })}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!historyMeta.hasNext || historyFetching}
                                onClick={() => setHistoryPage((prev) => prev + 1)}
                                className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Missing Tab Content */}
                {historyTab === "missing" && (
                  <div className="p-6 space-y-4">
                    {missingError && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        Unable to load missing appointments. Please try again.
                      </div>
                    )}

                    {missingLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={`missing-skeleton-${idx}`} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
                        ))}
                      </div>
                    ) : missingAppointments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
                        <Clock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="font-semibold text-slate-900">No missing appointments</p>
                        <p className="text-sm text-slate-500">All appointments have been successfully concluded</p>
                      </div>
                    ) : (
                      <>
                        <DataTable
                          data={missingAppointments}
                          columns={missingColumns}
                          showSearch={false}
                          enablePagination={false}
                          onRowClick={(row) => router.push(`/dashboard/service/pending-assessment/${row.patient_id}?first_name=${encodeURIComponent(row.first_name || "")}&last_name=${encodeURIComponent(row.last_name || "")}`)}
                        />
                        {missingMeta && missingAppointments.length > 0 && (
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-600">
                              Showing {((missingMeta.page - 1) * missingMeta.limit) + 1} to {Math.min(missingMeta.page * missingMeta.limit, missingMeta.total)} of <span className="font-semibold text-slate-900">{missingMeta.total}</span> entries
                            </p>
                            <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!missingMeta.hasPrev || missingFetching}
                                onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                                className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                              >
                                Previous
                              </Button>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, missingMeta.totalPages) }, (_, i) => {
                                  const pageNum = i + 1
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setHistoryPage(pageNum)}
                                      disabled={missingFetching}
                                      className={missingMeta.page === pageNum
                                        ? "h-8 w-8 rounded-lg bg-slate-900 p-0 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800"
                                        : "h-8 w-8 rounded-lg p-0 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
                                      }
                                    >
                                      {pageNum}
                                    </Button>
                                  )
                                })}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!missingMeta.hasNext || missingFetching}
                                onClick={() => setHistoryPage((prev) => prev + 1)}
                                className="h-8 rounded-lg px-3 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}


        </CardContent>
      </Card>


      <Sheet open={drawerOpen} onOpenChange={handleDrawerChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {drawerPatient ? (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="text-left text-2xl font-semibold text-slate-900">
                  {drawerPatient.first_name} {drawerPatient.last_name}
                </SheetTitle>
                <p className="text-sm text-slate-500 text-left">Patient ID · {drawerPatient.patient_id.slice(0, 12)}...</p>
              </SheetHeader>

              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={drawerPatient.enrollment_status} type="patient" />
                {drawerPatient.history_call_status && (
                  <StatusBadge status={drawerPatient.history_call_status} type="call" />
                )}
                {drawerPatient.assessment_status && (
                  <StatusBadge status={drawerPatient.assessment_status} type="assessment" />
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-medium">{drawerPatient.phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium">{drawerPatient.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Program Details</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Program:</span>
                    <span className="font-medium">{drawerPatient.program_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Specialty:</span>
                    <span className="font-medium">{drawerPatient.speciality_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-medium">{drawerPatient.duration_days ? `${drawerPatient.duration_days} days` : "N/A"}</span>
                  </div>
                  {drawerPatient.starts_at && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Starts:</span>
                      <span className="font-medium text-xs">{new Date(drawerPatient.starts_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {drawerPatient.ends_at && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ends:</span>
                      <span className="font-medium text-xs">{new Date(drawerPatient.ends_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Assigned Team</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="font-medium">
                      {drawerPatient.doctor_first_name && drawerPatient.doctor_last_name
                        ? `Dr. ${drawerPatient.doctor_first_name} ${drawerPatient.doctor_last_name}`
                        : <span className="text-slate-400">Not assigned</span>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dietitian:</span>
                    <span className="font-medium">
                      {drawerPatient.dietician_first_name && drawerPatient.dietician_last_name
                        ? `${drawerPatient.dietician_first_name} ${drawerPatient.dietician_last_name}`
                        : <span className="text-slate-400">Not assigned</span>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Physiotherapist:</span>
                    <span className="font-medium">
                      {drawerPatient.physio_first_name && drawerPatient.physio_last_name
                        ? `${drawerPatient.physio_first_name} ${drawerPatient.physio_last_name}`
                        : <span className="text-slate-400">Not assigned</span>}
                    </span>
                  </div>
                </div>
              </div>

              {(drawerPatient.assessment_status || drawerPatient.severity_level) && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Assessment</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    {drawerPatient.assessment_status && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-medium capitalize">{drawerPatient.assessment_status}</span>
                      </div>
                    )}
                    {drawerPatient.severity_level && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Severity:</span>
                        <span className={`font-semibold uppercase ${drawerPatient.severity_level === "high" ? "text-rose-600" :
                          drawerPatient.severity_level === "medium" ? "text-amber-600" :
                            "text-emerald-600"
                          }`}>{drawerPatient.severity_level}</span>
                      </div>
                    )}
                    {drawerPatient.severity_score && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Score:</span>
                        <span className="font-medium">{drawerPatient.severity_score}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(drawerPatient.weight_kg || drawerPatient.height_cm) && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Vitals</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    {drawerPatient.weight_kg && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Weight:</span>
                        <span className="font-medium">{drawerPatient.weight_kg} kg</span>
                      </div>
                    )}
                    {drawerPatient.height_cm && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Height:</span>
                        <span className="font-medium">{drawerPatient.height_cm} cm</span>
                      </div>
                    )}
                    {drawerPatient.weight_kg && drawerPatient.height_cm && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">BMI:</span>
                        <span className="font-medium">{(drawerPatient.weight_kg / Math.pow(drawerPatient.height_cm / 100, 2)).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {drawerPatient.history_call_date && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-900">History Call</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-medium">{new Date(drawerPatient.history_call_date).toLocaleDateString()}</span>
                    </div>
                    {drawerPatient.history_call_time && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Time:</span>
                        <span className="font-medium">{drawerPatient.history_call_time}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">Select a patient to view details.</div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={showAddModal} onOpenChange={setShowAddModal}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left text-2xl font-semibold text-slate-900">
              Add Pending Assessment Patient
            </SheetTitle>
            <p className="text-sm text-slate-500 text-left">Fill in patient details to create a new pending assessment</p>
          </SheetHeader>
          <div className="mt-6">
            <AddPatientForm onClose={() => setShowAddModal(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <HistoryCallSheet
        open={historyCallDrawerOpen}
        onOpenChange={handleHistoryCallDrawerChange}
        patient={historyCallPatient}
        form={historyCallForm}
        doctors={doctors}
        nutritionists={nutritionists}
        fitnessCoaches={fitnessCoaches}
        isSubmitting={isHistoryCallSubmitting}
        onFormChange={handleHistoryCallFormChange}
        onSubmit={handleHistoryCallSubmit}
      />
    </div>
  )
}

function AddPatientForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Patient Name</Label>
            <Input placeholder="Enter full name" />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="10-digit number" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Age</Label>
            <Input type="number" placeholder="Age" />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input placeholder="Enter city" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Health Goal</h3>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select health goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weight_loss">Weight Loss</SelectItem>
            <SelectItem value="weight_gain">Weight Gain</SelectItem>
            <SelectItem value="diabetes_care">Diabetes Care</SelectItem>
            <SelectItem value="pcos_management">PCOS Management</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Program Selection</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Program Name</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss Program</SelectItem>
                <SelectItem value="diabetes">Diabetes Care</SelectItem>
                <SelectItem value="pcos">PCOS Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Program Price</Label>
            <Input type="number" placeholder="₹25000" />
          </div>
          <div className="space-y-2">
            <Label>Discount</Label>
            <Input type="number" placeholder="₹2000" />
          </div>
          <div className="space-y-2">
            <Label>Final Amount</Label>
            <Input type="number" placeholder="₹23000" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Call Scheduling</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Call Date</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>Call Time</Label>
            <Input type="time" />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Call URL</Label>
            <Input placeholder="https://meet.google.com/..." />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea placeholder="Additional notes..." rows={3} />
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <Button
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          onClick={onClose}
        >
          Save Pending
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
          onClick={onClose}
        >
          Save & Generate QR
        </Button>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={onClose}
      >
        Cancel
      </Button>
    </div>
  )
}

function QRPaymentModal({ patient }: { patient: PendingPatient | null }) {
  if (!patient) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm text-slate-600">Patient Name</p>
        <p className="font-bold text-lg">{patient.name}</p>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-sm text-slate-600">Program</p>
        <p className="font-semibold">{patient.program}</p>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-sm text-slate-600">Amount</p>
        <p className="font-bold text-2xl text-blue-600">₹{patient.finalAmount.toLocaleString()}</p>
      </div>

      <div className="flex justify-center">
        <div className="w-64 h-64 bg-slate-100 rounded-lg flex items-center justify-center">
          <QrCode className="h-48 w-48 text-slate-300" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button className="w-full">Generate QR</Button>
        <Button variant="outline" className="w-full">Copy Payment Link</Button>
        <Button variant="outline" className="w-full">Share via WhatsApp</Button>
        <Button variant="outline" className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
          Mark Payment Received
        </Button>
      </div>
    </div>
  )
}
