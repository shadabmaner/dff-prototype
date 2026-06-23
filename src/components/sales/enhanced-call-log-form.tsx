"use client"

import { useState, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Phone, Calendar, Clock, MessageSquare, User, CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, Sparkles, Target, PenSquare, Search } from "lucide-react"
import { toast } from "sonner"

import { useLeads, useLead } from "@/hooks/use-leads"
import { postCallLog } from "@/lib/call-desk-api"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format, startOfToday } from "date-fns"

 function parseTimeSlotTo24Hour(time: string) {
  const [clock, meridiem] = time.trim().split(" ")
  const [hoursString, minutesString] = clock.split(":")
  let hours = Number(hoursString)
  const minutes = Number(minutesString)

  if (meridiem === "PM" && hours !== 12) {
    hours += 12
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0
  }

  return { hours, minutes }
 }

 function buildDateTime(date: Date, time: string) {
  const value = new Date(date)
  const { hours, minutes } = parseTimeSlotTo24Hour(time)
  value.setHours(hours, minutes, 0, 0)
  return value
 }

// ─── Outcome Config ───────────────────────────────────────────────────────────
const outcomes = [
  { value: "connected", label: "Connected", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle, requiresNotes: false, requiresFollowUp: false },
  { value: "not_connected", label: "Not Connected", color: "bg-amber-100 text-amber-800", icon: XCircle, requiresNotes: false, requiresFollowUp: false },
  { value: "interested", label: "Interested", color: "bg-green-100 text-green-800", icon: CheckCircle, requiresNotes: false, requiresFollowUp: false },
  { value: "not_interested", label: "Not Interested", color: "bg-gray-100 text-gray-800", icon: XCircle, requiresNotes: true, requiresFollowUp: false },
  { value: "follow_up_required", label: "Follow-up Required", color: "bg-purple-100 text-purple-800", icon: Clock, requiresNotes: true, requiresFollowUp: true },
]

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
]

const durations = [
  "Less than 1 min", "1-2 min", "2-5 min", "5-10 min", "10-15 min", "15-30 min", "30+ min"
]

const durationToSeconds: Record<string, number> = {
  "Less than 1 min": 30,
  "1-2 min": 90,
  "2-5 min": 210,
  "5-10 min": 450,
  "10-15 min": 750,
  "15-30 min": 1350,
  "30+ min": 2400,
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────
// Notes are conditionally required — validated at submit level
const callLogSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  callDate: z.date(),
  callTime: z.string().min(1, "Call time is required"),
  duration: z.string().optional(),
  outcome: z.string().min(1, "Outcome is required"),
  notes: z.string(),
  followUpDate: z.date().optional(),
  followUpTime: z.string().optional(),
})

type CallLogFormValues = z.infer<typeof callLogSchema>

// ─── Component ────────────────────────────────────────────────────────────────
interface EnhancedCallLogFormProps {
  /** Optional: pre-select a lead */
  defaultLeadId?: string
  /** Called after a successful submission */
  onSuccess?: () => void
}

export function EnhancedCallLogForm({ defaultLeadId, onSuccess }: EnhancedCallLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Use our real leads API
  const {
    data: leadsData,
    isLoading: isLoadingLeads,
    refetch: refetchLeads,
  } = useLeads({ page: 1, limit: 100 })
  const leads = leadsData?.leads || []

  // Fetch the specific lead if defaultLeadId is provided
  const {
    data: defaultLeadData,
    isLoading: isLoadingDefaultLead,
  } = useLead(defaultLeadId, { enabled: Boolean(defaultLeadId) })

  const outcomeConfig = outcomes.find(o => o.value === selectedOutcome)
  const requiresNotes = outcomeConfig?.requiresNotes ?? false
  const requiresFollowUp = outcomeConfig?.requiresFollowUp ?? false
  const isNotConnected = selectedOutcome === "not_connected"

  const form = useForm<CallLogFormValues>({
    resolver: zodResolver(callLogSchema),
    defaultValues: {
      leadId: defaultLeadId ?? "",
      callDate: new Date(),
      callTime: "",
      duration: "",
      outcome: "",
      notes: "",
      followUpTime: "",
    },
    mode: "onChange",
  })

  // Merge the default lead into the leads array if it's not already there
  const mergedLeads = useMemo(() => {
    if (!defaultLeadData) return leads
    const leadExists = leads.some(l => l.id === defaultLeadData.id)
    if (leadExists) return leads
    return [defaultLeadData, ...leads]
  }, [leads, defaultLeadData])

  const selectedLead = mergedLeads.find(l => l.id === form.watch("leadId"))
  const watchedFollowUpDate = form.watch("followUpDate")

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return mergedLeads
    const lowerSearchTerm = searchTerm.toLowerCase()
    return mergedLeads.filter(lead =>
      (lead.patientName?.toLowerCase() || "").includes(lowerSearchTerm) ||
      (lead.phone?.toLowerCase() || "").includes(lowerSearchTerm) ||
      (lead.email?.toLowerCase() || "").includes(lowerSearchTerm)
    )
  }, [mergedLeads, searchTerm])

  const isLoading = isLoadingLeads || isLoadingDefaultLead

  const headerInsights = useMemo(() => ([
    {
      label: "Lead bank",
      value: isLoading ? "Syncing…" : mergedLeads.length ? `${mergedLeads.length} ready` : "0 loaded",
      helper: "Pulled from CRM",
    },
    {
      label: "Outcome",
      value: outcomeConfig?.label ?? "Not selected",
      helper: requiresFollowUp ? "Follow-up mandatory" : requiresNotes ? "Notes mandatory" : "Log and move",
    },
    {
      label: "Notes field",
      value: requiresNotes ? "Required" : "Optional",
      helper: selectedOutcome ? "Add color for context" : "Awaiting outcome",
    },
  ]), [isLoading, mergedLeads.length, outcomeConfig?.label, requiresFollowUp, requiresNotes, selectedOutcome])

  const leadSnapshot = useMemo(() => {
    if (!selectedLead) return []
    return [
      // { label: "Status", value: selectedLead.stage || selectedLead.status },
      // { label: "Priority", value: selectedLead.priority },
      { label: "City", value: selectedLead.city },
      { label: "Source", value: selectedLead.source },
    ].filter(item => !!item.value)
  }, [selectedLead])

  const handleFormReset = useCallback(() => {
    form.reset()
    setSelectedOutcome("")
    setSubmitError(null)
  }, [form])

  const onSubmit = async (data: CallLogFormValues) => {
    setSubmitError(null)

    const selectedCallDateTime = buildDateTime(data.callDate, data.callTime)

    if (selectedCallDateTime.getTime() > Date.now()) {
      form.setError("callTime", {
        message: "Call time cannot be in the future",
      })
      return
    }

    // UI-level business rule: notes mandatory for certain outcomes
    if (requiresNotes && (!data.notes || data.notes.trim().length === 0)) {
      form.setError("notes", {
        message: `Notes are required when outcome is "${outcomeConfig?.label}"`,
      })
      return
    }

    // UI-level business rule: follow-up date mandatory for FOLLOW_UP_REQUIRED
    if (requiresFollowUp && !data.followUpDate) {
      form.setError("followUpDate", { message: "Follow-up date is required" })
      return
    }

    // UI-level business rule: duration mandatory unless not_connected
    if (!isNotConnected && (!data.duration || data.duration.trim().length === 0)) {
      form.setError("duration", { message: "Duration is required when call is connected" })
      return
    }

    // UI-level business rule: follow-up must be after call time
    if (data.followUpDate) {
      const followUpDateTime = data.followUpTime 
        ? buildDateTime(data.followUpDate, data.followUpTime)
        : new Date(new Date(data.followUpDate).setHours(23, 59, 59, 999))
      
      if (followUpDateTime.getTime() <= selectedCallDateTime.getTime()) {
        form.setError("followUpDate", { message: "Follow-up time must be after the call time" })
        return
      }
    }

    setIsSubmitting(true)
    try {
      const followUpIso =
        data.followUpDate && data.followUpTime
          ? buildDateTime(data.followUpDate, data.followUpTime).toISOString()
          : data.followUpDate
            ? data.followUpDate.toISOString()
            : undefined

      await postCallLog({
        leadId: data.leadId,
        phone: selectedLead?.phone ?? "",
        status: mapOutcomeToStatus(data.outcome),
        outcome: data.outcome,
        notes: data.notes.trim(),
        direction: "outbound",
        durationSeconds: isNotConnected ? 0 : (data.duration && durationToSeconds[data.duration] ? durationToSeconds[data.duration] : 0),
        leadStageAtCall: selectedLead?.status,
        followUpDate: followUpIso,
        duration: data.duration,
        callTime: data.callTime,
        calledAt: selectedCallDateTime.toISOString(),
      })

      toast.success("Call logged successfully!", {
        description: `Outcome: ${outcomeConfig?.label ?? data.outcome}`,
      })

      form.reset()
      setSelectedOutcome("")
      onSuccess?.()
    } catch (error: any) {
      const msg = error?.message ?? "Failed to log call. Please try again."
      setSubmitError(msg)
      toast.error("Failed to log call", { description: msg })
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Lead Selection */}
          <section className="space-y-6 bg-slate-50/70">
            <div className="flex flex-col gap-2 w-full">
              
              <div className="flex flex-col gap-6 items-start w-full">
                <FormField
                  control={form.control}
                  name="leadId"
                  render={({ field }) => (
                    <FormItem className="lg:flex-1 min-w-0 w-full">
                      <FormLabel className="flex items-center gap-2 pt-2">
                        Search and Select Lead
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                      </FormLabel>
                      <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "h-11 w-full justify-between rounded-2xl border-slate-200 bg-white",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  {mergedLeads.find((lead) => lead.id === field.value)?.patientName}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Search className="h-4 w-4" />
                                  Search and select a lead...
                                </div>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 max-h-[400px] overflow-hidden" align="start" sideOffset={5}>
                          <div className="p-3 border-b border-slate-100 bg-white sticky top-0 z-10">
                            <Input
                              placeholder="Search by name, phone, or email..."
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value.trim())
                              }}
                              className="h-11"
                            />
                          </div>
                          <div
                            className="max-h-[320px] overflow-auto w-full"
                            onWheel={(event) => event.stopPropagation()}
                            onTouchMove={(event) => event.stopPropagation()}
                          >
                            <div className="px-2 py-2 space-y-1 w-full">
                              {filteredLeads.length === 0 && (
                                <div className="p-3 text-sm text-muted-foreground text-center">No leads found.</div>
                              )}
                              {filteredLeads.map((lead) => (
                                <button
                                  type="button"
                                  key={`${lead.id}-${lead.phone}`}
                                  className="w-full rounded-xl p-3 text-left hover:bg-slate-100 flex items-center gap-2 transition"
                                  onClick={() => {
                                    form.setValue("leadId", lead.id)
                                    setIsDropdownOpen(false)
                                    setSearchTerm("")
                                  }}
                                >
                                  <User className="h-4 w-4 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{lead.patientName}</div>
                                    <div className="text-xs text-gray-500 truncate">{lead.phone}</div>
                                    <div className="text-xs text-gray-400 truncate">{lead.email}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 w-full lg:flex-shrink-0">
                  {selectedLead ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{selectedLead.patientName}</p>
                          <p className="text-xs text-slate-500">{selectedLead.phone}</p>
                          <p className="text-xs text-slate-400 truncate">{selectedLead.email}</p>
                        </div>
                        <Badge variant="outline" className="uppercase text-[10px] tracking-[0.35em]">
                          {selectedLead.stage ?? selectedLead.status ?? "Lead"}
                        </Badge>
                      </div>
                      {leadSnapshot.length > 0 && (
                        <div className="grid gap-3">
                          {leadSnapshot.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-xs text-slate-600">
                              <span className="font-medium text-slate-500">{item.label}</span>
                              <span className="text-slate-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-center text-slate-400">
                      <Phone className="h-6 w-6" />
                      <p className="text-sm font-medium">Select a lead to see quick facts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </section>

            {/* Call Details */}
            <section className="space-y-4 bg-white/90 p-6">
              <header className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">Call details</p>
                <h3 className="text-lg font-semibold text-slate-900">Time, duration & direction</h3>
              </header>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                <FormField
                  control={form.control}
                  name="callDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-11 w-full justify-between rounded-2xl border-slate-200 bg-white text-left",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <Calendar className="h-4 w-4 opacity-70" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="callTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Time</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-56 overflow-y-auto">
                          {timeSlots
                            .filter((time) => {
                              const selectedDate = form.getValues("callDate")
                              if (!selectedDate) return true

                              const candidateDateTime = buildDateTime(selectedDate, time)
                              return candidateDateTime.getTime() <= Date.now()
                            })
                            .map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isNotConnected}
                      >
                        <FormControl>
                          <SelectTrigger className={cn(
                            "h-12 w-full rounded-2xl border-slate-200 bg-white",
                            isNotConnected && "bg-slate-50 text-slate-400 cursor-not-allowed"
                          )}>
                            <SelectValue placeholder={isNotConnected ? "Disabled - Not Connected" : "Select duration"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isNotConnected && (
                        <p className="text-xs text-slate-500 mt-1">Duration is disabled when call outcome is "Not Connected"</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Call Outcome */}
            <section className="space-y-4 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  {/* <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-600">Outcome & intent</p>
                  <h3 className="text-lg font-semibold text-slate-900">What happened on this call?</h3> */}
                </div>
                {/* {outcomeConfig && (
                  <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1", outcomeConfig.color)}>
                    <outcomeConfig.icon className="h-4 w-4" />
                    {outcomeConfig.label}
                  </div>
                )} */}
              </div>
              <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Outcome</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedOutcome(value)
                        if (!outcomes.find((o) => o.value === value)?.requiresFollowUp) {
                          form.setValue("followUpDate", undefined)
                          form.setValue("followUpTime", "")
                        }
                        // Clear duration when not_connected is selected
                        if (value === "not_connected") {
                          form.setValue("duration", "")
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white">
                          <SelectValue placeholder="Select call outcome" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outcomes.map((outcome) => {
                          const Icon = outcome.icon
                          return (
                            <SelectItem key={outcome.value} value={outcome.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{outcome.label}</span>
                                {outcome.requiresNotes && (
                                  <span className="ml-1 text-[9px] uppercase tracking-wider text-muted-foreground/70">(notes req.)</span>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Notes / Remarks */}
            <section className="bg-slate-50/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">Call Note</p>
                  {/* <h3 className="text-lg font-semibold text-slate-900">Add color so the next caller can pick up fast</h3> */}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-100">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {requiresNotes ? "Mandatory" : "Optional"}
                </div>
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="sr-only">Call Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          requiresNotes
                            ? "Notes are mandatory for this outcome. Describe the reason and any agreed next steps..."
                            : "Drop highlights, objections raised, and any promised actions..."
                        }
                        className={cn(
                          "min-h-[130px] rounded-2xl border-slate-200 bg-white/80",
                          requiresNotes && "ring-1 ring-amber-400 focus-visible:ring-amber-500"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Follow-up Scheduling — shown when outcome requires it */}
            {requiresFollowUp && (
              <section className="space-y-4 bg-purple-50/60 p-6">
                <h4 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.3em] text-purple-900">
                  <Clock className="h-4 w-4" /> Schedule Follow-up <span className="text-red-500">*</span>
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="followUpDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Follow-up Date <span className="text-red-500">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-11 w-full justify-between rounded-2xl border-slate-200 bg-white text-left",
                                  !field.value && "text-muted-foreground",
                                  requiresFollowUp && !field.value && "ring-1 ring-red-400"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <Calendar className="h-4 w-4 opacity-70" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < startOfToday()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="followUpTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Time</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-56 overflow-y-auto">
                            {timeSlots
                              .filter((time) => {
                                if (!watchedFollowUpDate) return true
                                // Only restrict past times when follow-up date is today
                                if (watchedFollowUpDate.toDateString() === new Date().toDateString()) {
                                  const candidate = buildDateTime(watchedFollowUpDate, time)
                                  return candidate.getTime() > Date.now()
                                }
                                return true
                              })
                              .map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            )}

            {/* Callback scheduling for other outcomes */}
            {selectedOutcome === "call_back_requested" && (
              <section className="space-y-4 bg-blue-50/70 p-6">
                <h4 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.3em] text-blue-900">
                  <Phone className="h-4 w-4" /> Schedule Callback
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="followUpDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Callback Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-12 w-full justify-between rounded-2xl border-slate-200 bg-white text-left",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <Calendar className="h-4 w-4 opacity-70" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="followUpTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Callback Time</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            )}

            {/* Error message */}
            {submitError && (
              <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit / Clear */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {/* <Target className="h-4 w-4 text-primary" /> Log outcomes within 15 minutes of each call. */}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-200 bg-white text-[11px] font-black uppercase tracking-[0.35em] text-slate-600"
                  onClick={handleFormReset}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-[0.35em] px-6 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging…
                    </>
                  ) : (
                    <>
                      <PenSquare className="mr-2 h-4 w-4" />
                      Log Call
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map outcome value to a call status for the backend */
function mapOutcomeToStatus(outcome: string): string {
  const map: Record<string, string> = {
    connected: "connected",
    not_connected: "no_answer",
    interested: "connected",
    not_interested: "connected",
    follow_up_required: "connected",
  }
  return map[outcome] ?? "connected"
}
