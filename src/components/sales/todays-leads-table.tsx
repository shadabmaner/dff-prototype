"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import type { Lead } from "@/components/sales/types"
import { AssignLeadModal } from "@/components/sales/assign-lead-modal"
import { ManualAssignModal } from "@/components/sales/manual-assign-modal"
import { apiClient } from "@/lib/api-client"
import { useTelecallers } from "@/hooks/use-telecallers"
import { useWorkflowPrograms } from "@/hooks/use-workflow-programs"
import { useLanguages } from "@/hooks/use-languages"
import { useSpecialitiesQuery } from "@/hooks/use-specialities"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, User, Clock, AlertCircle, UserCheck, UserPlus, Loader2, Phone, Search, RefreshCw, SlidersHorizontal, X, CalendarDays } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

const stageConfig = {
  NEW: { label: "New", className: "bg-blue-100 text-blue-800" },
  UNASSIGNED: { label: "Unassigned", className: "bg-gray-100 text-gray-800" },
  CONTACTED: { label: "Contacted", className: "bg-purple-100 text-purple-800" },
  FOLLOW_UP: { label: "Follow-up", className: "bg-amber-100 text-amber-800" },
  HOT: { label: "Hot", className: "bg-red-100 text-red-800" },
  CONVERTED: { label: "Converted", className: "bg-emerald-100 text-emerald-800" },
  DROPPED: { label: "Dropped", className: "bg-gray-100 text-gray-800" },
}

const leadStatusFilters = [
  { value: "new", label: "New Lead" },
  { value: "not_connected", label: "Not Connected" },
  { value: "connected", label: "Connected" },
  { value: "follow_up_required", label: "Follow-up Required" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not-Interested" },
  { value: "assessment_paid", label: "Assessment Paid" },
  { value: "assessment_done", label: "Assessment Done" },
  { value: "converted", label: "Converted" },
]

const notConnectedOutcomes = ["not_connected", "not_answered", "no_response", "busy", "wrong_number"]
const followUpRequiredOutcomes = ["follow_up_required", "call_back_requested"]

export type TodaysLeadsFilterParams = {
  search?: string
  status?: string
  registrationDateFrom?: string
  registrationDateTo?: string
}

export function TodaysLeadsTable({
  data,
  total,
  page,
  limit,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
  onLimitChange,
  onUpdate,
  onFiltersChange,
}: {
  data: Lead[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  onUpdate?: () => void
  onFiltersChange?: (filters: TodaysLeadsFilterParams) => void
}) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [showAssignModal, setShowAssignModal] = React.useState(false)
  const [showManualAssignModal, setShowManualAssignModal] = React.useState(false)
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<Set<string>>(new Set())
  const [isAutoAssigning, setIsAutoAssigning] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState("")
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [singleAssignLead, setSingleAssignLead] = React.useState<Lead | null>(null)
  const [isSingleAssignOpen, setIsSingleAssignOpen] = React.useState(false)
  const [pagination, setPagination] = React.useState({
    pageIndex: page ? page - 1 : 0,
    pageSize: limit || 20,
  })
  const { data: programsData } = useWorkflowPrograms({ limit: 100 })
  const { data: languagesData, isLoading: isLoadingLanguages } = useLanguages()
  const { data: specialitiesData, isLoading: isLoadingSpecialities } = useSpecialitiesQuery()
  const { data: telecallersData } = useTelecallers()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("")
  const trimmedSearchTerm = debouncedSearchTerm.trim()
  const [specialtyFilter, setSpecialtyFilter] = React.useState("all")
  const [programFilter, setProgramFilter] = React.useState("all")
  const [modeFilter, setModeFilter] = React.useState("all")
  const [languageFilter, setLanguageFilter] = React.useState("all")
  const [campaignFilter, setCampaignFilter] = React.useState("all")
  const [assignedCallerFilter, setAssignedCallerFilter] = React.useState("all")
  const [currentStageFilter, setCurrentStageFilter] = React.useState("all")
  const [assessmentStatusFilter, setAssessmentStatusFilter] = React.useState("all")
  const [selectedPlanFilter, setSelectedPlanFilter] = React.useState("all")
  const [registrationDateRange, setRegistrationDateRange] = React.useState<{ from: string; to: string }>({ from: "", to: "" })
  const [dateFilter, setDateFilter] = React.useState<string>("")
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date } | undefined>(undefined)
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [showMoreFilters, setShowMoreFilters] = React.useState(false)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchTerm])

  React.useEffect(() => {
    setIsMounted(true)
    setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  const handleUpdate = async () => {
    setIsRefreshing(true)
    setSelectedLeadIds(new Set())
    try {
      // Invalidate queries to force fresh data fetch
      await queryClient.invalidateQueries({ queryKey: ["leads"] })
      // Call parent update function if provided
      if (onUpdate) {
        await onUpdate()
      }
      // Add a small delay to ensure user sees the loading state
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAutoAssignAll = async () => {
    setIsAutoAssigning(true)
    try {
      const response = await apiClient.post("/leads/assign/job", {})

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to create assignment job.")
        setIsAutoAssigning(false)
        return
      }

      const jobId = response.data.data.id
      toast.success("Lead assignment job created. Processing...")

      const pollJobStatus = async () => {
        try {
          const statusResponse = await apiClient.get(`/leads/assign/preview/job/${jobId}`)
          if (!statusResponse.data?.success) {
            throw new Error(statusResponse.data?.message || "Failed to check job status.")
          }

          const jobStatus = statusResponse.data.data.status
          if (jobStatus === "COMPLETED") {
            toast.success("Lead assignment completed successfully!")

            // Invalidate leads query to refetch updated data before navigation
            queryClient.invalidateQueries({ queryKey: ["leads"] })

            handleUpdate()
            setIsAutoAssigning(false)
            // Navigate to the assignment results page
            router.push(`/dashboard/sales/assignment-results/${jobId}`)
          } else if (jobStatus === "FAILED") {
            toast.error(statusResponse.data.data.error_message || "Assignment job failed.")
            setIsAutoAssigning(false)
          } else {
            setTimeout(pollJobStatus, 2000)
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || err.message || "Error checking job status.")
          setIsAutoAssigning(false)
        }
      }

      setTimeout(pollJobStatus, 1000)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while creating assignment job.")
      setIsAutoAssigning(false)
    }
  }

  const handleSelectLead = (leadId: string, checked: boolean) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(leadId)
      } else {
        next.delete(leadId)
      }
      return next
    })
  }

  // Handle date range selection
  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to })
    } else {
      setDateRange(undefined)
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "NEW":
      case "UNASSIGNED":
        return "bg-gray-100 text-gray-800"
      case "CONTACTED":
        return "bg-purple-100 text-purple-800"
      case "FOLLOW_UP":
        return "bg-amber-100 text-amber-800"
      case "HOT":
        return "bg-red-100 text-red-800"
      case "CONVERTED":
        return "bg-emerald-100 text-emerald-800"
      case "DROPPED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const specialtyOptions = React.useMemo(() => {
    const options = new Set<string>()
    // Add specialties from API
    specialitiesData?.data?.forEach((specialty) => {
      options.add(specialty.name)
    })
    // Also add any specialty_name from existing leads
    data.forEach((lead) => {
      if (lead.specialty_name) {
        options.add(lead.specialty_name)
      }
    })
    return Array.from(options)
  }, [data, specialitiesData])

  const programOptions = React.useMemo(() => {
    const options = new Set<string>()
    // Add programs from API
    programsData?.data?.items?.forEach((program) => {
      options.add(program.name)
    })
    // Also add any programInterestId from existing leads
    data.forEach((lead) => {
      if (lead.programInterestId) {
        options.add(lead.programInterestId)
      }
    })
    return Array.from(options)
  }, [data, programsData])

  const languageOptions = React.useMemo(() => {
    const options = new Set<string>()
    // Add languages from API
    languagesData?.data?.forEach((language) => {
      options.add(language.name)
    })
    // Also add any language_name from existing leads
    data.forEach((lead) => {
      if (lead.language_name) {
        options.add(lead.language_name)
      }
    })
    return Array.from(options)
  }, [data, languagesData])

  const campaignOptions = React.useMemo(() => {
    const options = new Set<string>()
    // Add hardcoded campaigns (same as add-lead-dialog)
    const hardcodedCampaigns = [
      "Webinar - Diabetes Care",
      "Campaign - Ortho Pain",
      "Webinar - Cardio",
      "Campaign - Weight Loss",
      "Social Media - Health Tips",
      "Email Campaign - Nutrition",
    ]
    hardcodedCampaigns.forEach(campaign => options.add(campaign))
    // Also add any campaign from existing leads
    data.forEach((lead) => {
      if (lead.campaign) {
        options.add(lead.campaign)
      }
    })
    return Array.from(options)
  }, [data])

  const assignedCallerOptions = React.useMemo(() => {
    const options = new Set<string>()
    // Add telecallers from API
    telecallersData?.forEach((telecaller) => {
      if (telecaller.name) {
        options.add(telecaller.name)
      }
    })
    // Also add any assignee_name from existing leads
    data.forEach((lead) => {
      if (lead.assignee_name) {
        options.add(lead.assignee_name)
      }
    })
    return Array.from(options)
  }, [data, telecallersData])

  const selectedPlanOptions = React.useMemo(() => {
    // Since selected_plan doesn't exist in Lead type, we'll use an empty array for now
    // This can be populated when the actual field is available in the API
    return []
  }, [data])

  const filteredData = React.useMemo(() => {
    return data.filter((lead) => {
      const matchesSearch = trimmedSearchTerm
        ? [lead.patientName, lead.phone, lead.email]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(trimmedSearchTerm.toLowerCase()))
        : true

      const matchesSpecialty = specialtyFilter === "all"
        ? true
        : lead.specialty_name === specialtyFilter

      const matchesProgram = programFilter === "all"
        ? true
        : programsData?.data?.items?.some(program => program.name === programFilter) &&
          data.some(lead => lead.programInterestId === programFilter)
          ? data.some(lead => lead.programInterestId === programFilter)
          : lead.programInterestId === programFilter

      const matchesMode = modeFilter === "all"
        ? true
        : lead.mode === modeFilter

      const matchesLanguage = languageFilter === "all"
        ? true
        : lead.language_name === languageFilter

      const matchesCampaign = campaignFilter === "all"
        ? true
        : lead.campaign === campaignFilter

      const matchesAssignedCaller = (() => {
        if (assignedCallerFilter === "all") return true
        if (assignedCallerFilter === "unassigned") return !lead.assignee_name
        return lead.assignee_name === assignedCallerFilter
      })()

      const matchesCurrentStage = currentStageFilter === "all"
        ? true
        : lead.stage === currentStageFilter

      const matchesAssessmentStatus = assessmentStatusFilter === "all"
        ? true
        : lead.assessmentStatus === assessmentStatusFilter

      const matchesSelectedPlan = selectedPlanFilter === "all"
        ? true
        : false // No selected_plan field available, so only "all" will match

      const matchesRegistrationDate = (() => {
        const leadDate = lead.created_at ? new Date(lead.created_at) : null
        if (!leadDate) return true

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let matchesDate = true
        if (dateFilter === "today") {
          const todayStart = new Date(today)
          const todayEnd = new Date(today)
          todayEnd.setHours(23, 59, 59, 999)
          matchesDate = leadDate >= todayStart && leadDate <= todayEnd
        } else if (dateFilter === "last7days") {
          const sevenDaysAgo = new Date(today)
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          matchesDate = leadDate >= sevenDaysAgo
        } else if (dateFilter === "last1month") {
          const oneMonthAgo = new Date(today)
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          matchesDate = leadDate >= oneMonthAgo
        } else if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
          const fromDate = new Date(dateRange.from)
          fromDate.setHours(0, 0, 0, 0)
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          matchesDate = leadDate >= fromDate && leadDate <= toDate
        }
        // If dateFilter is empty or undefined, all dates match

        return matchesDate
      })()

      const matchesStatus = (() => {
        if (statusFilter === "all") return true

        const leadStatus = lead.status || lead.stage || ""

        switch (statusFilter) {
          case "new":
            return leadStatus === "NEW" || leadStatus === "UNASSIGNED"
          case "not_connected":
            return notConnectedOutcomes.includes(leadStatus.toLowerCase())
          case "connected":
            return leadStatus.toLowerCase() === "connected"
          case "follow_up_required":
            return followUpRequiredOutcomes.includes(leadStatus.toLowerCase()) || leadStatus === "FOLLOW_UP"
          case "interested":
            return leadStatus.toLowerCase() === "interested"
          case "not_interested":
            return leadStatus.toLowerCase() === "not_interested"
          case "assessment_paid":
            return leadStatus.toLowerCase() === "assessment_paid"
          case "assessment_done":
            return leadStatus.toLowerCase() === "assessment_done"
          case "converted":
            return leadStatus === "CONVERTED"
          default:
            return false
        }
      })()

      return matchesSearch && matchesSpecialty && matchesProgram && matchesMode &&
        matchesLanguage && matchesCampaign && matchesAssignedCaller && matchesCurrentStage &&
        matchesAssessmentStatus && matchesSelectedPlan && matchesRegistrationDate && matchesStatus
    })
  }, [data, trimmedSearchTerm, specialtyFilter, programFilter, modeFilter, languageFilter,
    campaignFilter, assignedCallerFilter, currentStageFilter, assessmentStatusFilter,
    selectedPlanFilter, dateFilter, dateRange, statusFilter])

  const selectedLeadsData = filteredData.filter((lead) => selectedLeadIds.has(lead.id))
  const unassignedLeads = filteredData.filter((lead) => !lead.assignedTo || lead.stage === "UNASSIGNED")

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(new Set(filteredData.map((lead) => lead.id)))
    } else {
      setSelectedLeadIds(new Set())
    }
  }

  const activeFilterChips = React.useMemo(() => {
    const chips: { id: string; label: string; value: string }[] = []
    if (trimmedSearchTerm) chips.push({ id: "search", label: "Search", value: trimmedSearchTerm })
    if (specialtyFilter !== "all") {
      chips.push({ id: "specialty", label: "Specialty", value: specialtyFilter })
    }
    if (programFilter !== "all") {
      chips.push({ id: "program", label: "Program", value: programFilter })
    }
    if (modeFilter !== "all") {
      chips.push({ id: "mode", label: "Mode", value: modeFilter })
    }
    if (languageFilter !== "all") {
      chips.push({ id: "language", label: "Language", value: languageFilter })
    }
    if (campaignFilter !== "all") {
      chips.push({ id: "campaign", label: "Campaign", value: campaignFilter })
    }
    if (assignedCallerFilter !== "all") {
      chips.push({
        id: "assignedCaller",
        label: "Assigned Caller",
        value: assignedCallerFilter === "unassigned" ? "Unassigned" : assignedCallerFilter,
      })
    }
    if (currentStageFilter !== "all") {
      const label = stageConfig[currentStageFilter as keyof typeof stageConfig]?.label || currentStageFilter
      chips.push({ id: "currentStage", label: "Current Status", value: label })
    }
    if (assessmentStatusFilter !== "all") {
      chips.push({ id: "assessmentStatus", label: "Assessment Status", value: assessmentStatusFilter })
    }
    if (selectedPlanFilter !== "all") {
      // Since selected_plan is not available, we'll show the filter value directly
      chips.push({ id: "selectedPlan", label: "Selected Plan", value: selectedPlanFilter })
    }
    if (dateFilter && dateFilter !== "all") {
      chips.push({
        id: "dateFilter",
        label: "Date",
        value: dateFilter === "today" ? "Today" : dateFilter === "last7days" ? "Last 7 Days" : dateFilter === "last1month" ? "Last 1 Month" : dateFilter === "custom" && dateRange?.from && dateRange?.to ? `${formatDate(dateRange.from, "MMM dd")} - ${formatDate(dateRange.to, "MMM dd")}` : "Custom Range"
      })
    }
    if (statusFilter !== "all") {
      const label = leadStatusFilters.find((option) => option.value === statusFilter)?.label || statusFilter
      chips.push({ id: "status", label: "Status", value: label })
    }
    return chips
  }, [trimmedSearchTerm, specialtyFilter, programFilter, modeFilter, languageFilter, campaignFilter,
    assignedCallerFilter, currentStageFilter, assessmentStatusFilter, selectedPlanFilter, dateFilter, dateRange, statusFilter])

  const clearFilter = (id: string) => {
    switch (id) {
      case "search":
        setSearchTerm("")
        break
      case "specialty":
        setSpecialtyFilter("all")
        break
      case "program":
        setProgramFilter("all")
        break
      case "mode":
        setModeFilter("all")
        break
      case "language":
        setLanguageFilter("all")
        break
      case "campaign":
        setCampaignFilter("all")
        break
      case "assignedCaller":
        setAssignedCallerFilter("all")
        break
      case "currentStage":
        setCurrentStageFilter("all")
        break
      case "assessmentStatus":
        setAssessmentStatusFilter("all")
        break
      case "selectedPlan":
        setSelectedPlanFilter("all")
        break
      case "dateFilter":
        setDateFilter("all")
        setDateRange(undefined)
        break
      case "status":
        setStatusFilter("all")
        break
      default:
        break
    }
  }

  const resetAllFilters = () => {
    setSearchTerm("")
    setSpecialtyFilter("all")
    setProgramFilter("all")
    setModeFilter("all")
    setLanguageFilter("all")
    setCampaignFilter("all")
    setAssignedCallerFilter("all")
    setCurrentStageFilter("all")
    setAssessmentStatusFilter("all")
    setSelectedPlanFilter("all")
    setDateFilter("all")
    setDateRange(undefined)
    setStatusFilter("all")
  }

  const columns = React.useMemo<ColumnDef<Lead>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            handleSelectAll(!!value)
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedLeadIds.has(row.original.id)}
          onCheckedChange={(value) => handleSelectLead(row.original.id, !!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "patientName",
      header: "Patient",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex flex-col gap-0.5">
            <Link
              className="font-bold text-[13px] text-primary hover:underline hover:text-primary/80 transition-colors tracking-tight"
              href={`/dashboard/sales/leads/${encodeURIComponent(row.original.id)}?from=lead-assignment&name=${encodeURIComponent(row.original.patientName || "")}`}
            >
              {row.original.patientName}
            </Link>
            <div className="text-[11px] text-slate-500 font-medium">{row.original.email}</div>
            <div className="text-[11px] text-slate-400 font-mono tracking-tighter">{row.original.phone}</div>
          </div>
        </div>
      ),
    },
    // {
    //   accessorKey: "phone",
    //   header: "Mobile Number",
    //   cell: ({ row }) => (
    //     <div className="flex items-center gap-2">
    //       <span className="text-sm font-mono">{row.original.phone || "N/A"}</span>
    //     </div>
    //   ),
    // },
    // {
    //   accessorKey: "programInterestId",
    //   header: "Program",
    //   cell: ({ row }) => (
    //     <div className="text-sm">
    //       {row.original.programInterestId || "N/A"}
    //     </div>
    //   ),
    // },
    // {
    //   accessorKey: "mode",
    //   header: "Mode",
    //   cell: ({ row }) => (
    //     <div className="text-sm">
    //       {row.original.mode|| "N/A"}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "specialty_name",
      header: "Specialty",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.specialty_name || "N/A"}
        </div>
      ),
    },
    // {
    //   accessorKey: "language_name",
    //   header: "Language",
    //   cell: ({ row }) => (
    //     <div className="text-sm">
    //       {row.original.language_name || "N/A"}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.source || row.original.campaign || "Direct"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Registration Date",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.created_at
            ? formatDate(row.original.created_at, "MMM dd, yyyy")
            : "N/A"}
        </div>
      ),
    },
    // {
    //   accessorKey: "assignee_name",
    //   header: "Assigned To",
    //   cell: ({ row }) => (
    //     <div className="flex items-center gap-2">
    //       {row.original.assignee_name ? (
    //         <>
    //           <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
    //             <User className="h-3 w-3 text-gray-600" />
    //           </div>
    //           <span className="text-sm">{row.original.assignee_name}</span>
    //         </>
    //       ) : (
    //         <Badge variant="secondary" className="text-xs">Unassigned</Badge>
    //       )}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "status",
      header: "Outcome",
      cell: ({ row }) => {
        const lead = row.original
        const status = lead.status?.toLowerCase()
        let displayText = lead.status || "Pending"

        switch (status) {
          case "new":
            displayText = "New Lead"
            break
          case "not_connected":
            displayText = "Not Connected"
            break
          case "follow_up_required":
          case "call_back_requested":
            displayText = "Follow-up Required"
            break
          default:
            displayText = status ? status.replace("_", " ") : "Unknown"
        }

        return (
          <Badge className={cn("text-xs", getStageColor(status || ""))}>
            {displayText}
          </Badge>
        )
      },
    },
    {
      accessorKey: "lastContactedAt",
      header: "Last Updated",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <Clock className="h-3 w-3 text-muted-foreground/60" />
            {row.original.lastContactedAt
              ? formatDate(row.original.lastContactedAt, "MMM dd")
              : "Never"
            }
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            {
              //@ts-ignore
              row.original.assessmentStatus !== "completed" && <Button
                variant="outline"
                size="sm"
                className="rounded-full border-slate-200/80 bg-white/90 px-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
                onClick={() => {
                  setSingleAssignLead(row.original)
                  setIsSingleAssignOpen(true)
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {row.original.assignedTo ? "Reassign" : "Assign"}
              </Button>}
          </div>
        )
      }
    },
  ], [selectedLeadIds, isMounted, currentTime])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: pagination,
    },
    onPaginationChange: setPagination,
  })

  // Update pagination when page/limit props change
  React.useEffect(() => {
    setPagination({
      pageIndex: page ? page - 1 : 0,
      pageSize: limit || 20,
    })
  }, [page, limit])

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage + 1)
    }
  }

  const handleLimitChange = (newLimit: number) => {
    if (onLimitChange) {
      onLimitChange(newLimit)
    }
  }

  const filtersForApi = React.useMemo<TodaysLeadsFilterParams>(() => {
    const payload: TodaysLeadsFilterParams = {}

    if (trimmedSearchTerm) {
      payload.search = trimmedSearchTerm
    }

    if (statusFilter !== "all") {
      payload.status = statusFilter
    }

    const formatDateToISO = (date: Date) => {
      const copy = new Date(date)
      copy.setHours(0, 0, 0, 0)
      return copy.toISOString().split("T")[0]
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dateFilter === "today") {
      const iso = formatDateToISO(today)
      payload.registrationDateFrom = iso
      payload.registrationDateTo = iso
    } else if (dateFilter === "last7days") {
      const from = new Date(today)
      from.setDate(from.getDate() - 7)
      payload.registrationDateFrom = formatDateToISO(from)
      payload.registrationDateTo = formatDateToISO(today)
    } else if (dateFilter === "last1month") {
      const from = new Date(today)
      from.setMonth(from.getMonth() - 1)
      payload.registrationDateFrom = formatDateToISO(from)
      payload.registrationDateTo = formatDateToISO(today)
    } else if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
      payload.registrationDateFrom = formatDateToISO(dateRange.from)
      payload.registrationDateTo = formatDateToISO(dateRange.to)
    }

    return payload
  }, [trimmedSearchTerm, statusFilter, dateFilter, dateRange])

  React.useEffect(() => {
    if (!onFiltersChange) return
    onFiltersChange(filtersForApi)
  }, [filtersForApi, onFiltersChange])

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/40 bg-gradient-to-r from-white via-white/95 to-slate-50/85 p-5 shadow-[0_30px_70px_rgba(15,23,42,0.14)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Name / Mobile"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200/70 bg-white/80 pl-10 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3 md:flex-nowrap">
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter} disabled={isLoadingSpecialities}>
              <SelectTrigger className="h-12 min-w-[140px] rounded-2xl border-slate-200/80 text-sm">
                <SelectValue placeholder={isLoadingSpecialities ? "Loading..." : "Specialty"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialtyOptions.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="h-10 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="All campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaignOptions.map((campaign) => (
                  <SelectItem key={campaign} value={campaign}>
                    {campaign}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {leadStatusFilters.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-10 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last1month">Last 1 Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-10 rounded-lg border-slate-200 text-sm justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {formatDate(dateRange.from, "MMM dd")} - {formatDate(dateRange.to, "MMM dd")}
                        </>
                      ) : (
                        formatDate(dateRange.from, "MMM dd")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    className="rounded-md border"
                  />
                  <div className="p-3 border-t border-border">
                    <Button
                      onClick={() => {
                        // Keep the current dateFilter value, just ensure the dateRange is applied
                        if (dateRange) {
                          // The dateRange is already set, no need to change dateFilter
                        }
                      }}
                      className="w-full"
                      size="sm"
                      disabled={!dateRange}
                    >
                      Apply Filter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

        </div>

        {/* {showMoreFilters && (
          <div className="mt-5 grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/75 p-4 shadow-inner md:grid-cols-4">
            
           
            
            <div>
              <Label className="text-xs text-muted-foreground">Registration Date From</Label>
              <Input
                type="date"
                value={registrationDateRange.from}
                onChange={(e) => setRegistrationDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="h-10 rounded-lg border-slate-200 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Registration Date To</Label>
              <Input
                type="date"
                value={registrationDateRange.to}
                onChange={(e) => setRegistrationDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="h-10 rounded-lg border-slate-200 text-sm"
              />
            </div>
            <div className="flex items-end col-span-4">
              <Button variant="ghost" size="sm" className="w-full rounded-2xl border border-dashed border-slate-200/80 bg-white/80" onClick={resetAllFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        )} */}

        {activeFilterChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Filters:</span>
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => clearFilter(chip.id)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span>{chip.label}:</span>
                <span className="font-semibold">{chip.value}</span>
                <X className="h-3 w-3 text-slate-400" />
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="ml-2 h-7 rounded-full border border-dashed border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <X className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {(total || unassignedLeads.length) > 0 && (
        <Card className="border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-white shadow-[0_18px_40px_rgba(245,158,11,0.12)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Unassigned Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {total || unassignedLeads.length} lead{(total || unassignedLeads.length) > 1 ? "s" : ""} waiting for assignment
              </div>
              <div className="flex items-center gap-2">
                {/* <Button variant="outline" size="sm" onClick={() => setShowAssignModal(true)} disabled={isAutoAssigning}>
                  Manual Assign
                </Button> */}
                <Button
                  size="sm"
                  onClick={handleAutoAssignAll}
                  disabled={isAutoAssigning}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-white shadow-md hover:from-amber-600 hover:to-orange-600"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {isAutoAssigning ? "Assigning..." : "Auto-Assign All"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedLeadIds.size > 0 && (
        <Card className="border-blue-200/80 bg-gradient-to-r from-blue-50/90 to-white shadow-[0_18px_40px_rgba(59,130,246,0.12)]">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualAssignModal(true)}
                  className="rounded-full border-blue-200 bg-white px-4 text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manual Assign
                </Button>
                <Button className="rounded-full bg-gradient-to-r from-blue-600 to-primary px-5 text-white shadow-md hover:from-blue-700 hover:to-primary/90" size="sm" onClick={() => setShowAssignModal(true)}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Auto Assign
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        {/* Table Loading Overlay */}
        {isRefreshing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-semibold text-slate-700">Refreshing data...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-b border-slate-100/80 bg-slate-50/40 hover:bg-slate-50/40">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 first:pl-6 last:pr-6"
                    >
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-b border-slate-100/70 transition-colors hover:bg-primary/5/40">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-4 align-middle first:pl-6 last:pr-6">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <div>
                        {activeFilterChips.length > 0 ? (
                          <>
                            <p className="font-medium text-slate-900">No leads match your filters</p>
                            <p className="mt-1 text-sm text-slate-500">Try adjusting or clearing your filters to see more results.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={resetAllFilters}
                              className="mt-3 rounded-full border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Clear All Filters
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-slate-900">No leads added today</p>
                            <p className="mt-1 text-sm text-slate-500">New leads will appear here automatically.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100/80 bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            Showing {data.length} of {total || data.length} leads
            {(total || data.length) > 0 && totalPages && totalPages > 0 && (
              <span className="ml-2">
                (Page {page || 1} of {totalPages})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Per page</span>
            <Select
              value={`${limit || pagination.pageSize}`}
              onValueChange={(value) => {
                const newLimit = Number(value)
                handleLimitChange(newLimit)
              }}
            >
              <SelectTrigger className="h-8 w-[76px] rounded-full border-slate-200/80 bg-white">
                <SelectValue placeholder={limit || pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPage = (page || 1) - 2 // convert to 0-indexed, subtract 1, then convert back
              handlePageChange(Math.max(0, newPage))
            }}
            disabled={!hasPrev}
            className="rounded-full border-slate-200/80 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-500">Page</span>
            <span className="text-sm font-medium">{page || 1}</span>
            <span className="text-sm text-slate-500">of {totalPages || 1}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page || 1)}
            disabled={!hasNext}
            className="rounded-full border-slate-200/80 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      </div>

      <AssignLeadModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        leads={selectedLeadIds.size > 0 ? selectedLeadsData : unassignedLeads}
        onUpdate={handleUpdate}
      />

      <ManualAssignModal
        open={showManualAssignModal}
        onOpenChange={setShowManualAssignModal}
        leads={selectedLeadsData}
        onUpdate={handleUpdate}
      />


      <SingleAssignLeadDialog
        open={isSingleAssignOpen}
        lead={singleAssignLead}
        onOpenChange={(open) => {
          setIsSingleAssignOpen(open)
          if (!open) {
            setSingleAssignLead(null)
          }
        }}
        onSuccess={handleUpdate}
      />
    </div>
  )
}

interface SingleAssignLeadDialogProps {
  open: boolean
  lead: Lead | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function SingleAssignLeadDialog({ open, lead, onOpenChange, onSuccess }: SingleAssignLeadDialogProps) {
  const { data: telecallers = [], isLoading } = useTelecallers({ enabled: open })
  const [telecallerId, setTelecallerId] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (open && telecallers.length && !telecallerId) {
      setTelecallerId(telecallers[0].id)
    }
    if (!open) {
      setTelecallerId("")
    }
  }, [open, telecallers, telecallerId])

  const handleAssign = async () => {
    if (!lead || !telecallerId) return
    setIsSubmitting(true)
    try {
      const response = await apiClient.put(`/leads/${lead.id}/assign`, {
        telecallerId,
      })

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to assign lead")
      }

      const telecaller = telecallers.find((t) => t.id === telecallerId)
      toast.success(`Lead assigned to ${telecaller?.name || "telecaller"}`)

      // Invalidate leads query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["leads"] })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to assign lead")
    } finally {
      setIsSubmitting(false)
    }
  }

  const disableAssign = !telecallerId || !lead || isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[30px] border border-white/60 bg-gradient-to-b from-white/95 via-white/90 to-slate-50/95 p-0 shadow-[0_35px_80px_rgba(15,23,42,0.2)]">
        <div className="border-b border-slate-100/80 bg-gradient-to-r from-slate-50/90 via-white to-blue-50/60 px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900">Assign lead</DialogTitle>
              </div>
            </div>
          </DialogHeader>
        </div>

        {lead ? (
          <div className="space-y-5 px-6 py-6">
            <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Lead overview</p>
                <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                  Ready to assign
                </Badge>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-base font-black text-slate-900">{lead.patientName}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <User className="h-3.5 w-3.5 text-primary" />
                        Contact email
                      </div>
                      <p className="mt-2 truncate text-sm font-medium text-slate-800">{lead.email || "Not available"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        Mobile number
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-800">{lead.phone || "Not available"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Select telecaller</p>
                </div>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading telecallers...
                </div>
              ) : telecallers.length ? (
                <Select value={telecallerId} onValueChange={setTelecallerId} disabled={isSubmitting}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200/80 bg-white shadow-sm">
                    <SelectValue placeholder="Choose telecaller" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200/80 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                    {telecallers.map((telecaller) => (
                      <SelectItem key={telecaller.id} value={telecaller.id} className="rounded-xl py-3 focus:bg-slate-50">
                        <div className="flex min-w-0 items-center gap-3 py-1">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                            <User className="h-4 w-4" />
                          </div>
                          <span className={cn("inline-flex h-2.5 w-2.5 rounded-full")} />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium">{telecaller.name || telecaller.email || telecaller.id}</span>
                            <span className="truncate text-xs text-muted-foreground">{telecaller.email}</span>
                          </div>

                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-600">No telecallers available.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 py-6">
            <p className="text-sm text-muted-foreground">Select a lead to assign.</p>
          </div>
        )}

        <DialogFooter className="border-t border-slate-100/80 bg-slate-50/70 px-6 py-4">
          <Button variant="outline" className="rounded-full border-slate-200/80 bg-white px-5" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-full bg-gradient-to-r from-primary to-blue-500 px-6 text-white shadow-md" onClick={handleAssign} disabled={disableAssign}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>Assign lead</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
