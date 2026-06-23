"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"

import type { Lead } from "@/components/sales/types"
import { useSales } from "@/components/sales/sales-context"
import { useWorkflowPrograms } from "@/hooks/use-workflow-programs"
import { useLanguages } from "@/hooks/use-languages"
import { useSpecialitiesQuery } from "@/hooks/use-specialities"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Phone, Mail, Calendar, MessageSquare, History, User, Clock, CheckCircle, AlertCircle, Users, UserCheck, UserPlus, Search, RefreshCw, SlidersHorizontal, X, CalendarDays } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { AssignLeadModal } from "@/components/sales/assign-lead-modal"
import { CallHistoryDialog } from "@/components/sales/call-history-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { apiClient } from "@/lib/api-client"
import { useTelecallers } from "@/hooks/use-telecallers"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const stageConfig = {
  NEW: { label: "New", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
  UNASSIGNED: { label: "Unassigned", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
  CONTACTED: { label: "Contacted", variant: "outline" as const, color: "bg-purple-100 text-purple-800" },
  FOLLOW_UP: { label: "Follow-up", variant: "default" as const, color: "bg-amber-100 text-amber-800" },
  HOT: { label: "Hot", variant: "default" as const, color: "bg-red-100 text-red-800" },
  CONVERTED: { label: "Converted", variant: "default" as const, color: "bg-emerald-100 text-emerald-800" },
  DROPPED: { label: "Dropped", variant: "destructive" as const, color: "bg-gray-100 text-gray-800" },
}

const canonicalStageStatuses = new Set(["new", "unassigned", "contacted", "follow_up", "hot", "converted", "dropped"])

const paymentStageConfig = {
  INTERESTED: { label: "Interested", variant: "outline" as const, color: "bg-blue-100 text-blue-800" },
  LINK_SENT: { label: "Link Sent", variant: "outline" as const, color: "bg-amber-100 text-amber-800" },
  RECEIVED: { label: "Received", variant: "default" as const, color: "bg-emerald-100 text-emerald-800" },
  FAILED: { label: "Failed", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  DROPPED: { label: "Dropped", variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
}

const assessmentConfig = {
  PENDING: { label: "Pending", variant: "outline" as const, color: "bg-amber-100 text-amber-800" },
  COMPLETED: { label: "Completed", variant: "default" as const, color: "bg-emerald-100 text-emerald-800" },
}

const outcomeConfig = {
  interested: { label: "Interested", variant: "default" as const, color: "bg-green-100 text-green-800" },
  not_interested: { label: "Not Interested", variant: "destructive" as const, color: "bg-gray-100 text-gray-800" },
  call_back_requested: { label: "Callback Requested", variant: "outline" as const, color: "bg-blue-100 text-blue-800" },
  follow_up_required: { label: "Follow-up Required", variant: "default" as const, color: "bg-purple-100 text-purple-800" },
  converted: { label: "Converted", variant: "default" as const, color: "bg-indigo-100 text-indigo-800" },
  connected: { label: "Connected", variant: "default" as const, color: "bg-emerald-100 text-emerald-800" },
  not_answered: { label: "Not Answered", variant: "secondary" as const, color: "bg-amber-100 text-amber-800" },
  busy: { label: "Busy", variant: "secondary" as const, color: "bg-red-100 text-red-800" },
  wrong_number: { label: "Wrong Number", variant: "destructive" as const, color: "bg-gray-100 text-gray-800" },
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

interface LeadActionsProps {
  lead: Lead
  onUpdate: () => void
  onAssign?: (lead: Lead) => void
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
                        <Mail className="h-3.5 w-3.5 text-primary" />
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
                  <SelectTrigger className="h-16 rounded-2xl border-slate-200/80 bg-white shadow-sm">
                    <SelectValue placeholder="Choose telecaller" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200/80 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                    {telecallers.map((telecaller) => (
                      <SelectItem key={telecaller.id} value={telecaller.id} className="rounded-xl py-3 focus:bg-slate-50 p-1">
                        <div className="flex min-w-0 items-center gap-3 py-1">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                            <User className="h-4 w-4" />
                          </div>
                          <span className={cn("inline-flex h-2.5 w-2.5 rounded-full")} />
                          <div className="flex min-w-0 flex-col items-start">
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

interface LeadActionsProps {
  lead: Lead
  onUpdate: () => void
}

function LeadActions({ lead, onUpdate }: LeadActionsProps) {
  const [showSingleAssignDialog, setShowSingleAssignDialog] = React.useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSingleAssignDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {lead.assignee_name ? "Reassign" : "Assign"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem>
            <Phone className="mr-2 h-4 w-4" />
            Call Lead
          </DropdownMenuItem> */}
          {/* <DropdownMenuItem>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Single Assign Dialog */}
      <SingleAssignLeadDialog
        open={showSingleAssignDialog}
        lead={lead}
        onOpenChange={(open) => {
          setShowSingleAssignDialog(open)
        }}
        onSuccess={onUpdate}
      />
    </>
  )
}

interface EnhancedLeadsTableProps {
  data: Lead[]
  onRefresh?: () => void
  isLoading?: boolean
  paginationMeta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export function EnhancedLeadsTable({ data, onRefresh, isLoading, paginationMeta, currentPage = 1, onPageChange, pageSize, onPageSizeChange }: EnhancedLeadsTableProps) {
  const { callLogs } = useSales()
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = React.useMemo(() => searchParams?.toString() ?? "", [searchParams])
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [showAssignModal, setShowAssignModal] = React.useState(false)
  const [selectedLeads, setSelectedLeads] = React.useState<Lead[]>([])
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<Set<string>>(new Set())
  const { data: programsData } = useWorkflowPrograms({ limit: 100 })
  const { data: languagesData, isLoading: isLoadingLanguages } = useLanguages()
  const { data: specialitiesData, isLoading: isLoadingSpecialities } = useSpecialitiesQuery()
  const { data: telecallersData } = useTelecallers()
  
  // Initialize filter state from URL parameters
  const [searchTerm, setSearchTerm] = React.useState(searchParams?.get('search') || '')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(searchParams?.get('search') || '')
  const [specialtyFilter, setSpecialtyFilter] = React.useState(searchParams?.get('specialtyId') || 'all')
  const [programFilter, setProgramFilter] = React.useState('all')
  const [modeFilter, setModeFilter] = React.useState('all')
  const [languageFilter, setLanguageFilter] = React.useState('all')
  const [campaignFilter, setCampaignFilter] = React.useState(searchParams?.get('campaignId') || 'all')
  const [assignedCallerFilter, setAssignedCallerFilter] = React.useState(searchParams?.get('telecallerId') || 'all')
  const [statusFilter, setStatusFilter] = React.useState(searchParams?.get('status') || 'all')
  const [assessmentStatusFilter, setAssessmentStatusFilter] = React.useState('all')
  const [selectedPlanFilter, setSelectedPlanFilter] = React.useState('all')
  const [registrationDateRange, setRegistrationDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: searchParams?.get('registrationDateFrom') ? new Date(searchParams.get('registrationDateFrom')!) : undefined, 
    to: searchParams?.get('registrationDateTo') ? new Date(searchParams.get('registrationDateTo')!) : undefined
  })
  const [tempDateRange, setTempDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: searchParams?.get('registrationDateFrom') ? new Date(searchParams.get('registrationDateFrom')!) : undefined, 
    to: searchParams?.get('registrationDateTo') ? new Date(searchParams.get('registrationDateTo')!) : undefined
  })
  const [showMoreFilters, setShowMoreFilters] = React.useState(false)
  const [dateRangeOpen, setDateRangeOpen] = React.useState(false)
  const [dateFilter, setDateFilter] = React.useState<string>("")

  // Helper function to get the latest call outcome for a lead
  const getLatestCallOutcome = React.useCallback((leadId: string) => {
    const leadCallLogs = callLogs.filter(log => log.leadId === leadId)
    if (leadCallLogs.length === 0) return null
    // Sort by createdAt to get the latest call
    const sortedLogs = leadCallLogs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return sortedLogs[0].outcome.toLowerCase()
  }, [callLogs])

  // Function to update URL parameters
  const updateURLParams = React.useCallback((filters: Record<string, string>) => {
    const params = new URLSearchParams(searchParamsString)
    
    // Update or remove each filter parameter
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Keep the tab parameter if it exists
    const tab = params.get('tab')
    params.delete('tab')
    if (tab) {
      params.set('tab', tab)
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }, [searchParamsString, router])

  // Since data is now filtered on the server, we use it directly
  const filteredData = data

  // Debounce search term (300ms delay)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Update URL params when debounced search term changes
  React.useEffect(() => {
    updateURLParams({ search: debouncedSearchTerm })
  }, [debouncedSearchTerm, updateURLParams])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleSearchBlur = () => {
    // Trim spaces when user leaves the search field
    const trimmedSearch = searchTerm.trim()
    if (trimmedSearch !== searchTerm) {
      setSearchTerm(trimmedSearch)
      setDebouncedSearchTerm(trimmedSearch)
      updateURLParams({ search: trimmedSearch })
    }
  }

  const handleSearchSubmit = () => {
    const trimmedSearch = searchTerm.trim()
    setDebouncedSearchTerm(trimmedSearch)
    updateURLParams({ search: trimmedSearch })
  }

  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const handleSpecialtyChange = (value: string) => {
    setSpecialtyFilter(value)
    updateURLParams({ specialtyId: value })
  }

  const handleCampaignChange = (value: string) => {
    setCampaignFilter(value)
    updateURLParams({ campaignId: value })
  }

  const handleAssignedCallerChange = (value: string) => {
    setAssignedCallerFilter(value)
    updateURLParams({ telecallerId: value === 'unassigned' ? 'unassigned' : value })
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    updateURLParams({ status: value })
  }

  const handleRegistrationDateChange = (field: 'from' | 'to', value: Date | undefined) => {
    const newRange = { ...tempDateRange, [field]: value }
    setTempDateRange(newRange)
  }

  const applyDateFilter = () => {
    setRegistrationDateRange(tempDateRange)
    updateURLParams({ 
      registrationDateFrom: tempDateRange.from ? tempDateRange.from.toISOString().split('T')[0] : '', 
      registrationDateTo: tempDateRange.to ? tempDateRange.to.toISOString().split('T')[0] : '' 
    })
  }

  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setTempDateRange({ from: range.from, to: range.to })
    } else {
      setTempDateRange({ from: undefined, to: undefined })
    }
  }

  const handleUpdate = async () => {
    setIsRefreshing(true)
    try {
      setRefreshKey(prev => prev + 1)
      // Invalidate queries to force fresh data fetch
      await queryClient.invalidateQueries({ queryKey: ["leads"] })
      onRefresh?.()
      // Add a small delay to ensure user sees the loading state
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAssignSelected = (leads: Lead[]) => {
    setSelectedLeads(leads)
    setShowAssignModal(true)
  }

  const handleAssignSingle = (lead: Lead) => {
    setSelectedLeads([lead])
    setShowAssignModal(true)
  }

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeadIds)
    if (checked) {
      newSelected.add(leadId)
    } else {
      newSelected.delete(leadId)
    }
    setSelectedLeadIds(newSelected)
  }

  const specialtyOptions = React.useMemo(() => {
    const options = new Map<string, string>() // id -> name
    // Add specialties from API only
    specialitiesData?.data?.forEach((specialty) => {
      options.set(specialty.id, specialty.name)
    })
    // Only add lead specialties if they don't exist in API and we want fallbacks
    // Commenting this out to only show API specialties
    /*
    data.forEach((lead) => {
      if (lead.specialty_name && !Array.from(options.values()).includes(lead.specialty_name)) {
        options.set(lead.specialty_name, lead.specialty_name)
      }
    })
    */
    return Array.from(options.entries()).map(([id, name]) => ({ id, name }))
  }, [specialitiesData])

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
    const options = new Map<string, string>() // id -> name
    // Add telecallers from API
    telecallersData?.forEach((telecaller) => {
      if (telecaller.name && telecaller.id) {
        options.set(telecaller.id, telecaller.name)
      }
    })
    // Also add any assignee from existing leads (use name as fallback for id)
    data.forEach((lead) => {
      if (lead.assignee_name && !Array.from(options.values()).includes(lead.assignee_name)) {
        options.set(lead.assignee_name, lead.assignee_name)
      }
    })
    return Array.from(options.entries()).map(([id, name]) => ({ id, name }))
  }, [data, telecallersData])

  const selectedPlanOptions = React.useMemo(() => {
    // Since selected_plan doesn't exist in Lead type, we'll use an empty array for now
    // This can be populated when the actual field is available in the API
    return []
  }, [data])

  const selectedLeadsData = data.filter(lead => selectedLeadIds.has(lead.id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(new Set(data.map(lead => lead.id)))
    } else {
      setSelectedLeadIds(new Set())
    }
  }

  const activeFilterChips = React.useMemo(() => {
    const chips: { id: string; label: string; value: string }[] = []
    const trimmedSearch = searchTerm.trim()
    if (trimmedSearch) chips.push({ id: "search", label: "Search", value: trimmedSearch })
    if (specialtyFilter !== "all") {
      const specialty = specialtyOptions.find(s => s.id === specialtyFilter)
      chips.push({ id: "specialty", label: "Specialty", value: specialty?.name || specialtyFilter })
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
        value: assignedCallerFilter === "unassigned" ? "Unassigned" : (assignedCallerOptions.find(c => c.id === assignedCallerFilter)?.name || assignedCallerFilter),
      })
    }
    if (statusFilter !== "all") {
      const label = leadStatusFilters.find((option) => option.value === statusFilter)?.label || statusFilter
      chips.push({ id: "status", label: "Status", value: label })
    }
    if (assessmentStatusFilter !== "all") {
      chips.push({ id: "assessmentStatus", label: "Assessment Status", value: assessmentStatusFilter })
    }
    if (selectedPlanFilter !== "all") {
      // Since selected_plan is not available, we'll show the filter value directly
      chips.push({ id: "selectedPlan", label: "Selected Plan", value: selectedPlanFilter })
    }
    if (registrationDateRange.from || registrationDateRange.to) {
      const from = registrationDateRange.from ? registrationDateRange.from.toLocaleDateString() : ""
      const to = registrationDateRange.to ? registrationDateRange.to.toLocaleDateString() : ""
      const range = from && to ? `${from} - ${to}` : from || to
      chips.push({ id: "registrationDate", label: "Registration Date", value: range })
    }
    return chips
  }, [
    searchTerm,
    specialtyFilter,
    programFilter,
    modeFilter,
    languageFilter,
    campaignFilter,
    assignedCallerFilter,
    statusFilter,
    assessmentStatusFilter,
    selectedPlanFilter,
    registrationDateRange,
  ])

  const clearFilter = (id: string) => {
    switch (id) {
      case "search":
        setSearchTerm("")
        updateURLParams({ search: '' })
        break
      case "specialty":
        setSpecialtyFilter("all")
        updateURLParams({ specialtyId: '' })
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
        updateURLParams({ campaignId: '' })
        break
      case "assignedCaller":
        setAssignedCallerFilter("all")
        updateURLParams({ telecallerId: '' })
        break
      case "status":
        setStatusFilter("all")
        updateURLParams({ status: '' })
        break
      case "assessmentStatus":
        setAssessmentStatusFilter("all")
        break
      case "selectedPlan":
        setSelectedPlanFilter("all")
        break
      case "registrationDate":
        setRegistrationDateRange({ from: undefined, to: undefined })
        setTempDateRange({ from: undefined, to: undefined })
        updateURLParams({ registrationDateFrom: '', registrationDateTo: '' })
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
    setStatusFilter("all")
    setAssessmentStatusFilter("all")
    setSelectedPlanFilter("all")
    setRegistrationDateRange({ from: undefined, to: undefined })
    
    // Clear all URL parameters
    updateURLParams({
      search: '',
      specialtyId: '',
      campaignId: '',
      telecallerId: '',
      status: '',
      registrationDateFrom: '',
      registrationDateTo: ''
    })
  }

  const columns = React.useMemo<ColumnDef<Lead>[]>(
    () => [
      // {
      //   id: "select",
      //   header: ({ table }) => (
      //     <Checkbox
      //       checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
      //       onCheckedChange={(value) => {
      //         table.toggleAllPageRowsSelected(!!value)
      //         handleSelectAll(!!value)
      //       }}
      //       aria-label="Select all"
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //       checked={selectedLeadIds.has(row.original.id)}
      //       onCheckedChange={(value) => handleSelectLead(row.original.id, !!value)}
      //       aria-label="Select row"
      //     />
      //   ),
      //   enableSorting: false,
      //   enableHiding: false,
      // },
      {
        accessorKey: "patientName",
        header: "Patient",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col gap-0.5">
              <Link className="font-bold text-[13px] text-primary hover:underline hover:text-primary/80 transition-colors tracking-tight" href={`/dashboard/sales/leads/${encodeURIComponent(row.original.id)}?from=lead-assignment&name=${encodeURIComponent(row.original.patientName || '')}`}>
                {row.original.patientName}
                
              </Link>
              {/* <div className="text-[11px] text-slate-500 font-medium">{row.original.email}</div>*/}
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
      //       {/* <Phone className="h-4 w-4 text-muted-foreground/60" /> */}
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
      //       {row.original.mode || "N/A"}
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
      //       {row?.original?.language_name || "N/A"}
      //     </div>
      //   ),
      // },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.source || row.original.campaign || "N/A"}
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
      {
        accessorKey: "assignee_name",
        header: "Assignee",
        cell: ({ row }) => {
          // Debug: Log the assignee_name data
          console.log('Lead assignee_name:', row.original.assignee_name, 'Lead ID:', row.original.id);
          
          return (
            <div className="flex items-center gap-2">
              {row.original.assignee_name ? (
                <>
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-gray-600" />
                  </div>
                  <span className="text-sm">{row.original.assignee_name}</span>
                </>
              ) : (
                <Badge variant="secondary" className="text-xs">Unassigned</Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "stage",
        header: "Status",
        cell: ({ row }) => {
          const latestOutcome = getLatestCallOutcome(row.original.id)

          if (latestOutcome && outcomeConfig[latestOutcome as keyof typeof outcomeConfig]) {
            const config = outcomeConfig[latestOutcome as keyof typeof outcomeConfig]
            return (
              <Badge variant={config.variant} className={cn("text-xs", config.color)}>
                {config.label}
              </Badge>
            )
          }

          const apiStatus = row.original.status?.toLowerCase()

          if (row.original.stage && apiStatus && canonicalStageStatuses.has(apiStatus)) {
            const config = stageConfig[row.original.stage as keyof typeof stageConfig]
            if (config) {
              return (
                <Badge variant={config.variant} className={cn("text-xs", config.color)}>
                  {config.label}
                </Badge>
              )
            }
          }

          if (row.original.status) {
            const statusLabel = row.original.status
              .split("_")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
              .join(" ")
            return (
              <Badge variant="outline" className="text-xs bg-slate-100 text-slate-800">
                {statusLabel}
              </Badge>
            )
          }

          return (
            <Badge variant="secondary" className="text-xs">
              Unknown
            </Badge>
          )
        },
      },
      {
        accessorKey: "lastContacted",
        header: "Last Updated",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <div className="text-xs text-muted-foreground font-medium">
              {row.original.lastContactedAt ? formatDate(row.original.lastContactedAt) : "Never"}
            </div>
          </div>
        ),
      },
      //         <div className="text-xs text-muted-foreground/40 italic">No remarks</div>
      //       )}
      //     </div>
      //   ),
      // },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <LeadActions lead={row.original} onUpdate={handleUpdate} />,
      },
    ],
    [refreshKey]
  )

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

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

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Name / Mobile"
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              onKeyPress={handleSearchKeyPress}
              onBlur={handleSearchBlur}
              className="h-11 rounded-xl border-slate-200 pl-9 text-sm"
            />
          </div>
          <Select value={specialtyFilter} onValueChange={handleSpecialtyChange} disabled={isLoadingSpecialities}>
            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 text-sm md:w-[140px]">
              <SelectValue placeholder={isLoadingSpecialities ? "Loading..." : "Specialty"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialtyOptions.map((specialty) => (
                <SelectItem key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

              <Select value={campaignFilter} onValueChange={handleCampaignChange}>
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
     
              <Select value={assignedCallerFilter} onValueChange={handleAssignedCallerChange}>
                <SelectTrigger className="h-10 rounded-lg border-slate-200 text-sm">
                  <SelectValue placeholder="All callers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Callers</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {assignedCallerOptions.map((caller) => (
                    <SelectItem key={caller.id} value={caller.id}>
                      {caller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
       
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-11 rounded-full px-4" onClick={handleUpdate} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-11 rounded-full px-4"
              onClick={() => setShowMoreFilters((prev) => !prev)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>

        {showMoreFilters && (
          <div className="mt-4 grid gap-3 md:grid-cols-4">
           
           
            <div>
              <Label className="text-xs text-muted-foreground"> Status</Label>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
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
            </div>
           
          
            <div className="col-span-4">
              <Label className="text-xs text-muted-foreground">Registration Date Range</Label>
              <div className="flex gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    const value = e.target.value
                    setDateFilter(value)
                    if (value === "") {
                      setTempDateRange({ from: undefined, to: undefined })
                      setRegistrationDateRange({ from: undefined, to: undefined })
                      updateURLParams({ registrationDateFrom: '', registrationDateTo: '' })
                    } else if (value === "custom") {
                      // Keep current temp range for custom selection
                    } else {
                      // Apply preset filters immediately
                      let fromDate: Date | undefined
                      let toDate: Date | undefined
                      
                      if (value === "today") {
                        const today = new Date()
                        fromDate = today
                        toDate = today
                      } else if (value === "last7days") {
                        const sevenDaysAgo = new Date()
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                        fromDate = sevenDaysAgo
                        toDate = new Date()
                      } else if (value === "last30days") {
                        const thirtyDaysAgo = new Date()
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                        fromDate = thirtyDaysAgo
                        toDate = new Date()
                      }
                      
                      if (fromDate && toDate) {
                        setTempDateRange({ from: fromDate, to: toDate })
                        setRegistrationDateRange({ from: fromDate, to: toDate })
                        updateURLParams({ 
                          registrationDateFrom: fromDate.toISOString().split('T')[0], 
                          registrationDateTo: toDate.toISOString().split('T')[0] 
                        })
                      }
                    }
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
                
                {dateFilter === "custom" && (
                  <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 justify-start text-left font-normal",
                          !tempDateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {tempDateRange.from ? (
                          tempDateRange.to ? (
                            <>
                              {formatDate(tempDateRange.from, "LLL dd, y")} - {" "}
                              {formatDate(tempDateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            formatDate(tempDateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="range"
                        selected={{
                          from: tempDateRange.from,
                          to: tempDateRange.to,
                        }}
                        onSelect={handleDateRangeSelect}
                        className="rounded-md"
                      />
                      <div className="p-3 border-t">
                        <Button
                          className="w-full"
                          onClick={() => {
                            if (tempDateRange?.from && tempDateRange.to) {
                              applyDateFilter()
                              setDateRangeOpen(false)
                            }
                          }}
                          disabled={!tempDateRange?.from || !tempDateRange.to}
                        >
                          Apply Filter
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
            <div className="flex items-end col-span-4">
              <Button variant="ghost" size="sm" className="w-full rounded-lg border border-dashed" onClick={resetAllFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {activeFilterChips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => clearFilter(chip.id)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span>{chip.label}:</span>
                <span className="font-semibold">{chip.value}</span>
                <span className="text-slate-400">✕</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedLeadIds.size > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? 's' : ''} selected
                </span>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleAssignSelected(selectedLeadsData)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        {/* Table Loading Overlay */}
        {(isRefreshing || isLoading) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-semibold text-slate-700">Refreshing data...</span>
            </div>
          </div>
        )}
        <div className="border-b border-slate-100/80 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
           </div>
            <Badge variant="outline" className="w-fit rounded-full border-slate-200/80 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              {filteredData.length} records
            </Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b border-slate-100/80 bg-slate-50/40 hover:bg-slate-50/40">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 first:pl-6 last:pr-6">
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
                      <p className="font-medium text-slate-900">No leads found</p>
                      <p className="mt-1 text-sm text-slate-500">Try adjusting filters or add a new lead to populate this table.</p>
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
            {paginationMeta ? (
              <>
                Showing {data.length} of {paginationMeta.total} leads
                <span className="ml-2">
                  (Page {paginationMeta.page} of {paginationMeta.totalPages})
                </span>
              </>
            ) : (
              <>
                Showing {table.getRowModel().rows.length} of {filteredData.length} leads
                {filteredData.length > 0 && (
                  <span className="ml-2">
                    (Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()})
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Per page</span>
            <Select
              value={`${paginationMeta ? (pageSize ?? paginationMeta.limit) : pagination.pageSize}`}
              onValueChange={(value) => {
                const next = Number(value)
                if (paginationMeta) {
                  onPageSizeChange?.(next)
                } else {
                  setPagination(prev => ({
                    ...prev,
                    pageSize: next
                  }))
                }
              }}
            >
              <SelectTrigger className="h-8 w-[76px] rounded-full border-slate-200/80 bg-white">
                <SelectValue placeholder={paginationMeta ? (pageSize ?? paginationMeta.limit) : pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={`page-size-${size}`} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {paginationMeta ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange?.(paginationMeta.page - 1)} 
                disabled={!paginationMeta.hasPrev}
                className="rounded-full border-slate-200/80 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-500">Page</span>
                <span className="text-sm font-medium">{paginationMeta.page}</span>
                <span className="text-sm text-slate-500">of {paginationMeta.totalPages}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange?.(paginationMeta.page + 1)} 
                disabled={!paginationMeta.hasNext}
                className="rounded-full border-slate-200/80 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="rounded-full border-slate-200/80 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-500">Page</span>
                <span className="text-sm font-medium">{table.getState().pagination.pageIndex + 1}</span>
                <span className="text-sm text-slate-500">of {table.getPageCount()}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="rounded-full border-slate-200/80 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Assign Lead Modal */}
      <AssignLeadModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        leads={selectedLeads}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
