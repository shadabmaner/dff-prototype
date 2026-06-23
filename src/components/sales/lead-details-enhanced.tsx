"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  BellRing,
  CalendarClock,
  ClipboardList,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Timer,
  User,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { Lead } from "@/components/sales/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn, formatDate } from "@/lib/utils"
import { fetchLeadTimeline, type LeadTimelineResponse, type TimelineEvent } from "@/lib/call-desk-api"
import { CallHistory } from "./call-history"

const stageConfig: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-blue-100 text-blue-800" },
  UNASSIGNED: { label: "Unassigned", className: "bg-gray-100 text-gray-800" },
  CONTACTED: { label: "Contacted", className: "bg-purple-100 text-purple-800" },
  FOLLOW_UP: { label: "Follow-up", className: "bg-amber-100 text-amber-800" },
  HOT: { label: "Hot", className: "bg-red-100 text-red-800" },
  CONVERTED: { label: "Converted", className: "bg-emerald-100 text-emerald-800" },
  DROPPED: { label: "Dropped", className: "bg-slate-100 text-slate-800" },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  high: { label: "High Priority", className: "bg-red-100 text-red-800" },
  medium: { label: "Medium Priority", className: "bg-amber-100 text-amber-800" },
  low: { label: "Low Priority", className: "bg-green-100 text-green-800" },
}

interface LeadDetailsEnhancedProps {
  lead: Lead
  backHref: string
  backLabel?: string
  actionsSlot?: React.ReactNode
}

export function LeadDetailsEnhanced({
  lead,
  backHref,
  backLabel = "Back to leads",
  actionsSlot,
}: LeadDetailsEnhancedProps) {
  const stage = stageConfig[lead.stage] ?? { label: lead.stage, className: "bg-gray-100 text-gray-800" }
  const priority = lead.priority ? (priorityConfig[lead.priority] ?? priorityConfig.medium) : undefined

  // Fetch timeline data from API
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useQuery<LeadTimelineResponse>({
    queryKey: ["lead-timeline", lead.id],
    queryFn: () => fetchLeadTimeline(lead.id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const timelineEvents = React.useMemo(() => {
    if (!timelineData?.timeline?.length) return []
    return [...timelineData.timeline].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [timelineData])

  const upcomingFollowUp = React.useMemo(() => {
    const followUps = timelineData?.timeline?.filter((event) => event.event_type === "follow_up") ?? []
    if (!followUps.length) return undefined
    return [...followUps]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .find((event) => !event.completed_at)
  }, [timelineData])

  const lastActivity = timelineEvents[0]

  const marketingFields = [
    { label: "Source", value: lead.source || lead.campaign },
    { label: "Campaign", value: lead.campaign },
    { label: "Language", value: lead.language_name || lead.language },
    { label: "Program", value: lead.specialty_name || lead.programInterestId },
  ]

  const heroHighlights = [
    { label: "Status", value: toReadable(timelineData?.lead.status || lead.stage) ?? "—" },
    { label: "Phone", value: lead.phone ?? "—" },
    { label: "Last contacted", value: formatDate(timelineData?.lead.lastContactedAt || lead.lastContactedAt) },
    {
      label: "Next follow-up",
      value: upcomingFollowUp
        ? formatDate(upcomingFollowUp.timestamp, "EEE, MMM dd · HH:mm")
        : lead.nextFollowUpAt
        ? formatDate(lead.nextFollowUpAt, "EEE, MMM dd · HH:mm")
        : "Not scheduled",
    },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-r from-slate-50 via-white to-blue-50/80 p-8 shadow-[0_40px_90px_rgba(15,23,42,0.08)]">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-20 top-[-60px] h-60 w-60 rounded-full bg-blue-200/40 blur-[140px]" />
          <div className="absolute right-[-50px] bottom-[-80px] h-72 w-72 rounded-full bg-emerald-200/40 blur-[160px]" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-5">
            <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
              <Link href={backHref} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {backLabel}
              </Link>
            </Button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Lead profile</p>
              <h1 className="mt-3 text-3xl font-black text-slate-900">{lead.patientName || "Lead"}</h1>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-500">{lead.id}</p>
              <p className="mt-4 max-w-2xl text-sm text-slate-600">
                Unified sales workspace for calls, follow-ups, and notes—designed for clarity on what happens next.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className="rounded-full bg-blue-600/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {toReadable(timelineData?.lead.status || lead.stage) ?? "Unknown"}
                </Badge>
                {lead.phone ? (
                  <Badge variant="outline" className="rounded-full border-slate-200 px-4 py-1 text-xs text-slate-600">
                    {lead.phone}
                  </Badge>
                ) : null}
                {timelineData?.lead.lastContactedAt || lead.lastContactedAt ? (
                  <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-4 py-1 text-xs text-emerald-700">
                    Last spoke {formatDate(timelineData?.lead.lastContactedAt || lead.lastContactedAt, "MMM dd · HH:mm")}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {heroHighlights.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-[0_15px_35px_rgba(15,23,42,0.08)]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">{stat.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Details Card */}
          <Card className="border-white/70 bg-white/90 shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-slate-700">Key details</CardTitle>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Contact & ownership</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 rounded-2xl border border-slate-100/80 bg-slate-50/50 p-4">
                <DetailRow
                  label="Status"
                  value={toReadable(timelineData?.lead.status || lead.stage) ?? "—"}
                  icon={<ClipboardList className="h-4 w-4 text-blue-600" />}
                />
                <Separator />
                <DetailRow label="Phone" value={lead.phone ?? "—"} icon={<PhoneCall className="h-4 w-4 text-emerald-600" />} />
                <Separator />
                <DetailRow
                  label="Last activity"
                  value={lastActivity ? formatDate(lastActivity.timestamp, "MMM dd · HH:mm") : "No activity yet"}
                  icon={<CalendarClock className="h-4 w-4 text-purple-600" />}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-[0_16px_30px_rgba(37,99,235,0.35)]">
                  <PhoneCall className="mr-2 h-4 w-4" /> Call lead
                </Button>
                <Button variant="outline" className="flex-1 rounded-full border-dashed border-slate-300 text-slate-600">
                  <MessageSquare className="mr-2 h-4 w-4" /> Add note
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Plan Card */}
          <Card className="border-white/70 bg-white/90 shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <BellRing className="h-4 w-4 text-amber-500" /> Follow-up plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingFollowUp ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-black text-slate-900">{formatDate(upcomingFollowUp.timestamp, "MMM dd")}</p>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      {formatDate(upcomingFollowUp.timestamp, "HH:mm a")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-sm text-amber-900">
                    <p className="font-semibold">{toReadable(upcomingFollowUp.follow_up_type) ?? "Follow-up"}</p>
                    <p className="mt-2 text-slate-700">{upcomingFollowUp.notes || "No notes provided."}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-amber-800">
                      <span className="rounded-full bg-white/70 px-3 py-1 font-medium uppercase tracking-wide">
                        {toReadable(upcomingFollowUp.status) ?? "Pending"}
                      </span>
                      {upcomingFollowUp.performed_by_name ? (
                        <span>Owner: {upcomingFollowUp.performed_by_name}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500">
                  No upcoming follow-ups have been scheduled. Plan the next touchpoint to keep the lead warm.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-white/70 bg-white/90 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-slate-600">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ContactRow icon={<Phone className="h-4 w-4 text-blue-600" />} label="Phone" value={lead.phone} href={`tel:${lead.phone}`} />
              <ContactRow icon={<Mail className="h-4 w-4 text-purple-600" />} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
              <ContactRow icon={<User className="h-4 w-4 text-emerald-600" />} label="Assigned" value={lead.assignee_name || "Unassigned"} />
            </CardContent>
          </Card>
        </div>

        {/* Timeline Section */}
        <Card className="border-white/80 bg-white/95 shadow-[0_35px_70px_rgba(15,23,42,0.12)]">
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <MessageSquare className="h-4 w-4 text-primary" /> Activity timeline
              </CardTitle>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">All interactions</p>
            </div>
            <div className="flex items-center gap-2">
              {isTimelineLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Badge variant="outline" className="rounded-full border-slate-200 text-xs text-slate-600">
                {timelineEvents.length} events
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {timelineError ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to load timeline</AlertTitle>
                <AlertDescription>
                  {timelineError instanceof Error ? timelineError.message : "Please try again"}
                </AlertDescription>
                <Button variant="outline" size="sm" onClick={() => refetchTimeline()} className="mt-3">
                  Retry
                </Button>
              </Alert>
            ) : isTimelineLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">Loading timeline...</p>
                </div>
              </div>
            ) : timelineEvents.length ? (
              <div className="relative pl-4">
                <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 via-slate-200 to-transparent" />
                <div className="space-y-5">
                  {timelineEvents.map((event) => {
                    const meta = getEventMeta(event.event_type)
                    const duration = formatDuration(event.duration_seconds)

                    return (
                      <div
                        key={event.id}
                        className="relative ml-6 rounded-3xl border border-slate-100/90 bg-white/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                      >
                        <span
                          className={cn(
                            "absolute left-[-33px] top-6 h-3 w-3 rounded-full border-2 border-white",
                            meta.dotClass
                          )}
                        />
                        <div className="flex items-start gap-4">
                          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border", meta.cardClass)}>
                            <meta.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-slate-900">{meta.label}</p>
                              {event.source ? (
                                <Badge variant="outline" className="rounded-full border-slate-200 text-xs capitalize text-slate-600">
                                  {event.source.replace(/_/g, " ")}
                                </Badge>
                              ) : null}
                              {event.follow_up_type ? (
                                <Badge className="rounded-full bg-amber-50 text-xs font-semibold text-amber-700">
                                  {toReadable(event.follow_up_type)}
                                </Badge>
                              ) : null}
                              {event.call_status ? (
                                <Badge className="rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                                  {toReadable(event.call_status)}
                                </Badge>
                              ) : null}
                              {event.status ? (
                                <Badge className="rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                                  {toReadable(event.status)}
                                </Badge>
                              ) : null}
                            </div>
                            {event.notes ? (
                              <p className="text-sm leading-relaxed text-slate-600">{event.notes}</p>
                            ) : null}
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <CalendarClock className="h-3.5 w-3.5" />
                                {formatDate(event.timestamp, "MMM dd, yyyy · HH:mm")}
                              </span>
                              {event.performed_by_name ? (
                                <span className="flex items-center gap-1">
                                  <UserRound className="h-3.5 w-3.5" />
                                  {event.performed_by_name}
                                </span>
                              ) : null}
                              {duration ? (
                                <span className="flex items-center gap-1">
                                  <Timer className="h-3.5 w-3.5" />
                                  {duration}
                                </span>
                              ) : null}
                              {event.follow_up_date ? (
                                <span className="flex items-center gap-1">
                                  <BellRing className="h-3.5 w-3.5" />
                                  Next: {formatDate(event.follow_up_date, "MMM dd · HH:mm")}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center text-sm text-slate-500">
                Activity will appear once calls, follow-ups, or notes are logged for this lead.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/70 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.1)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-slate-600">Marketing context</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {marketingFields.map((field) =>
              field.value ? (
                <Badge key={field.label} variant="outline" className="rounded-full border-slate-200/80 px-3 py-1 text-xs font-semibold">
                  {field.value}
                </Badge>
              ) : null
            )}
            {!marketingFields.some((field) => field.value) && (
              <p className="text-xs text-muted-foreground">No contextual tags available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.1)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-slate-600">Call history</CardTitle>
          </CardHeader>
          <CardContent>
            <CallHistory leadId={lead.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper Components
function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-inner">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
  href?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200/80 bg-white/60 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {value ? (
          href ? (
            <a href={href} className="text-sm font-semibold text-primary hover:underline">
              {value}
            </a>
          ) : (
            <p className="text-sm font-semibold text-slate-900">{value}</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">Not provided</p>
        )}
      </div>
    </div>
  )
}

// Timeline Event Metadata
type TimelineVisual = {
  icon: LucideIcon
  cardClass: string
  dotClass: string
  label: string
}

const EVENT_META: Record<string, TimelineVisual> = {
  follow_up: {
    icon: BellRing,
    cardClass: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
    label: "Follow-up reminder",
  },
  call: {
    icon: PhoneCall,
    cardClass: "border-blue-200 bg-blue-50 text-blue-700",
    dotClass: "bg-blue-500",
    label: "Call touchpoint",
  },
  activity: {
    icon: ClipboardList,
    cardClass: "border-purple-200 bg-purple-50 text-purple-700",
    dotClass: "bg-purple-500",
    label: "Activity update",
  },
  call_log: {
    icon: PhoneCall,
    cardClass: "border-blue-200 bg-blue-50 text-blue-700",
    dotClass: "bg-blue-500",
    label: "Call logged",
  },
}

const DEFAULT_EVENT_META: TimelineVisual = {
  icon: ClipboardList,
  cardClass: "border-slate-200 bg-slate-50 text-slate-700",
  dotClass: "bg-slate-400",
  label: "Activity",
}

function getEventMeta(type?: TimelineEvent["event_type"]) {
  if (!type) return DEFAULT_EVENT_META
  return EVENT_META[type] ?? DEFAULT_EVENT_META
}

// Utility Functions
function toReadable(value?: string | null) {
  if (!value) return undefined
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return undefined
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return remaining ? `${minutes}m ${remaining}s` : `${minutes}m`
}
