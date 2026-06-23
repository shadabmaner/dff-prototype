"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, MapPin, Phone, Mail, User, Clock, MessageSquare, CircleDot, Activity, UserCheck } from "lucide-react"

import type { Lead } from "@/components/sales/types"
import { EnhancedCallLogForm } from "@/components/sales/enhanced-call-log-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn, formatDate } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
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

type TimelineEvent = {
  id: string
  title: string
  subtitle?: string
  description?: string
  timestamp: number
  timeLabel: string
  type: "note" | "update" | "callback"
}

interface LeadDetailsProps {
  lead: Lead
  backHref: string
  backLabel?: string
  actionsSlot?: React.ReactNode
}

export function LeadDetails({ lead, backHref, backLabel = "Back to leads", actionsSlot }: LeadDetailsProps) {
  const stage = stageConfig[lead.stage] ?? { label: lead.stage, className: "bg-gray-100 text-gray-800" }
  const priority = lead.priority ? (priorityConfig[lead.priority] ?? priorityConfig.medium) : undefined
  const [isCallLogSheetOpen, setIsCallLogSheetOpen] = React.useState(false)
  const [callLogRefreshKey, setCallLogRefreshKey] = React.useState(0)

  const marketingFields = [
    { label: "Source", value: lead.source || lead.campaign },
    { label: "Campaign", value: lead.campaign },
    { label: "Language", value: lead.language_name || lead.language },
    { label: "Program", value: lead.specialty_name || lead.programInterestId },
  ]

  const timelineEvents = React.useMemo<TimelineEvent[]>(() => {
    const events: TimelineEvent[] = []

    lead.history?.forEach((event) => {
      if (!event.at) return
      events.push({
        id: `${event.id}-history`,
        title: event.action || "Status update",
        subtitle: event.by,
        description: event.metadata?.note,
        timestamp: new Date(event.at).getTime(),
        timeLabel: formatDate(event.at, "MMM dd · HH:mm"),
        type: "update",
      })
    })

    lead.remarks?.forEach((remark) => {
      if (!remark.at) return
      events.push({
        id: `${remark.id}-remark`,
        title: "Note added",
        subtitle: remark.by,
        description: remark.text,
        timestamp: new Date(remark.at).getTime(),
        timeLabel: formatDate(remark.at, "MMM dd · HH:mm"),
        type: "note",
      })
    })

    lead.callbacks?.forEach((callback) => {
      if (!callback.scheduledAt) return
      events.push({
        id: `${callback.id}-callback`,
        title: callback.status === "COMPLETED" ? "Callback completed" : "Callback scheduled",
        subtitle: callback.createdBy,
        description: callback.notes,
        timestamp: new Date(callback.scheduledAt).getTime(),
        timeLabel: formatDate(callback.scheduledAt, "MMM dd · HH:mm"),
        type: "callback",
      })
    })

    return events.sort((a, b) => b.timestamp - a.timestamp)
  }, [lead])

  const quickStats = [
    { label: "Stage", value: stage.label },
    { label: "Priority", value: priority?.label ?? "—" },
    { label: "Last contact", value: formatDate(lead.lastContactedAt) ?? "—" },
    { label: "Next follow-up", value: lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt, "MMM dd · HH:mm") : "Not set" },
  ]

  const heroStats = [
    { label: "Stage", value: stage.label },
    { label: "Assignee", value: lead.assignee_name || "Unassigned" },
    // { label: "Program", value: lead.specialty_name || lead.programInterestId || "—" },
  ]

  return (
    <div className="space-y-6 pb-12">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
              <Link href={backHref} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
      <section className="relative overflow-hidden rounded-[36px] border border-white/40 bg-gradient-to-r from-primary/5 via-white to-blue-50/70 p-7 shadow-[0_40px_80px_rgba(15,23,42,0.15)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-24 top-[-60px] h-48 w-48 rounded-full bg-primary/25 blur-[100px]" />
          <div className="absolute right-[-40px] bottom-[-60px] h-56 w-56 rounded-full bg-emerald-200/50 blur-[130px]" />
        </div>
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-5">
          
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/85 text-2xl font-black text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_30px_rgba(59,130,246,0.12)]">
                  {lead.patientName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                      Lead details
                    </Badge>
                  </div>
                  <h1 className="mt-3 text-3xl font-black text-slate-900">{lead.patientName}</h1>
                </div>
              </div>
             
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className={`text-xs ${stage.className}`}>{stage.label}</Badge>
                
              </div>
            </div>
          </div>
          <div className="space-y-4 xl:min-w-[340px]">
            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              {actionsSlot}
              <Sheet open={isCallLogSheetOpen} onOpenChange={setIsCallLogSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="rounded-full bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-[0_18px_35px_rgba(15,23,42,0.25)]">
                    Log Call
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                  <SheetHeader className="text-left space-y-2">
                    <SheetTitle className="text-2xl font-bold text-slate-900">Log a Call</SheetTitle>
                    <SheetDescription className="text-sm text-slate-500">
                      Keep this lead’s history up to date without leaving the page.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 pb-10">
                    <EnhancedCallLogForm
                      defaultLeadId={lead.id}
                      onSuccess={() => {
                        setCallLogRefreshKey((prev) => prev + 1)
                        setIsCallLogSheetOpen(false)
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {heroStats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,360px]">
        <div className="order-2 space-y-6 lg:order-1">
          {/* <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-white/70 bg-white/90 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-slate-600">Contact information</CardTitle>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Primary identifiers</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContactRow icon={<Phone className="h-4 w-4 text-blue-600" />} label="Phone" value={lead.phone} href={`tel:${lead.phone}`} />
                <Separator />
                <ContactRow icon={<Mail className="h-4 w-4 text-purple-600" />} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
                <Separator />
                <ContactRow icon={<User className="h-4 w-4 text-emerald-600" />} label="Assigned to" value={lead.assignee_name || lead.assignee_email || "Unassigned"} />
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/90 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-slate-600">Tags & context</CardTitle>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Marketing qualifiers</p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {marketingFields.map((field) => (
                  field.value ? (
                    <Badge key={field.label} variant="outline" className="rounded-full border-slate-200/80 px-3 py-1 text-xs font-semibold">
                      {field.value}
                    </Badge>
                  ) : null
                ))}
                {!marketingFields.some((field) => field.value) && (
                  <p className="text-xs text-muted-foreground">No contextual tags available.</p>
                )}
              </CardContent>
            </Card>
          </div> */}

          {/* <Card className="border-white/70 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Activity className="h-4 w-4 text-primary" /> Status & actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatusMetric label="Created" value={formatDate(lead.created_at)} />
              <StatusMetric label="Updated" value={formatDate(lead.updated_at)} />
              <StatusMetric label="Last contacted" value={formatDate(lead.lastContactedAt)} />
              <StatusMetric label="Converted" value={lead.convertedAt ? formatDate(lead.convertedAt) : "Not yet"} />
            </CardContent>
          </Card> */}

          <Card className="border-white/70 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <MessageSquare className="h-4 w-4 text-primary" /> Activity timeline
                </CardTitle>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">Recent interactions</p>
              </div>
              <Badge variant="outline" className="text-xs">Live</Badge>
            </CardHeader>
            <CardContent>
              {timelineEvents.length ? (
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-slate-200 to-transparent" />
                  <div className="space-y-5 pl-9">
                    {timelineEvents.slice(0, 8).map((event) => (
                      <div key={event.id} className="relative rounded-2xl border border-slate-100/80 bg-white/80 p-4 shadow-sm">
                        <span
                          className={cn(
                            "absolute left-[-32px] top-1.5 h-3 w-3 rounded-full",
                            event.type === "note" ? "bg-violet-500" : event.type === "callback" ? "bg-emerald-500" : "bg-slate-400"
                          )}
                        />
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-500">{event.subtitle}</p>
                        {event.description ? <p className="mt-2 text-sm text-slate-600">{event.description}</p> : null}
                        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">{event.timeLabel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState title="No activity yet" description="Interactions will appear here automatically." />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-white/70 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.1)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-slate-600">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.notes ? (
                  <p className="text-sm leading-relaxed text-gray-800">{lead.notes}</p>
                ) : (
                  <EmptyState title="No notes recorded" description="Use CRM to add remarks for this lead." />
                )}
              </CardContent>
            </Card>
<Card className="border-white/70 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.1)] overflow-hidden">
            <CardHeader className="border-b border-slate-100/80 bg-slate-50/70">
              <CardTitle className="text-sm font-medium text-slate-600">Call history</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CallHistory key={callLogRefreshKey} leadId={lead.id} />
            </CardContent>
          </Card>
            {/* <Card className="border-white/70 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.1)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-slate-600">Latest remarks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.remarks?.length ? (
                  lead.remarks.slice(0, 3).map((remark) => (
                    <div key={remark.id} className="rounded-2xl border border-slate-100/80 bg-white/80 p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{remark.by}</span>
                        <span>{formatDate(remark.at, "MMM dd, HH:mm")}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-900">{remark.text}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No remarks yet" description="Add remarks from the sales workspace." />
                )}
              </CardContent>
            </Card> */}
          </div>
        </div>

        <aside className="order-1 space-y-4 lg:order-2">
          {/* <Card className="border-white/60 bg-white/85 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Quick status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Assigned to" value={lead.assignee_name || lead.assignee_email || "Unassigned"} />
              <InfoRow label="Program value" value={lead.programValue ? `₹${lead.programValue}` : "—"} />
              <InfoRow label="Assessment" value={lead.assessmentStatus ?? "—"} />
              <InfoRow label="Payment" value={lead.paymentStage ?? "—"} />
            </CardContent>
          </Card> */}

          {/* <Card className="border-white/60 bg-white/85 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-dashed border-slate-200/80 bg-white/80 p-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </CardContent>
          </Card> */}

          <Card className="border-white/60 bg-white/85 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Next follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.nextFollowUpAt ? (
                <div className="space-y-2">
                  <p className="text-2xl font-black text-slate-900">{formatDate(lead.nextFollowUpAt, "MMM dd")}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{formatDate(lead.nextFollowUpAt, "HH:mm a")}</p>
                </div>
              ) : (
                <EmptyState title="No reminder" description="Add a callback or reminder from the sales desk." />
              )}
            </CardContent>
          </Card>

          
        </aside>
      </div>
    </div>
  )
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value?: string | null; href?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-dashed border-gray-200 p-3">
      <div className="rounded-full bg-white p-2 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {value ? (
          href ? (
            <a href={href} className="text-sm font-semibold text-primary hover:underline">
              {value}
            </a>
          ) : (
            <p className="text-sm font-semibold text-gray-900">{value}</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">Not provided</p>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-gray-900 text-right">{value ?? "—"}</span>
    </div>
  )
}

function StatusMetric({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/80 p-4">
      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value ?? "—"}</p>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value ?? "—"}</p>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
      <BadgeCheck className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}
