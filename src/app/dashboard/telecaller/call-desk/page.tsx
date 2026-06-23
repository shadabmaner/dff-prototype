"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { EnhancedCallLogForm } from "@/components/sales/enhanced-call-log-form"
import { EnhancedCallLogsTable, type CallLogStats } from "@/components/sales/enhanced-call-logs-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlarmClock, PhoneCall, Sparkles, Target, TimerReset, AlertTriangle } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const emptyStats: CallLogStats = {
  total: 0,
  connected: 0,
  notAnswered: 0,
  callbacks: 0,
  overdueFollowUps: 0,
  connectionRate: 0,
}

export default function TelecallerCallDeskPage() {
  const searchParams = useSearchParams()
  const defaultLeadId = searchParams.get("leadId") ?? undefined

  const [refreshKey, setRefreshKey] = useState(0)
  const [stats, setStats] = useState<CallLogStats>(emptyStats)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const quickInsights = useMemo(() => ([
    {
      label: "Connection rate",
      value: `${stats.connectionRate.toFixed(1)}%`,
      tone: "text-emerald-300",
      helper: stats.connectionRate > 60 ? "Great momentum" : "Nudge up follow-ups",
    },
    {
      label: "Callbacks queued",
      value: stats.callbacks,
      tone: "text-yellow-200",
      helper: stats.callbacks > 0 ? "Prep notes now" : "All clear",
    },
    {
      label: "Overdue follow-ups",
      value: stats.overdueFollowUps,
      tone: stats.overdueFollowUps > 0 ? "text-red-200" : "text-slate-200",
      helper: stats.overdueFollowUps > 0 ? "Prioritize asap" : "On schedule",
    },
  ]), [stats])

  const playbookTasks = useMemo(() => ([
    {
      title: "Sweep overdue list",
      description: stats.overdueFollowUps > 0
        ? `${stats.overdueFollowUps} leads still waiting on promised callbacks`
        : "No overdue follow-ups detected — keep it up!",
      action: "Review follow-ups",
    },
    {
      title: "Boost connections",
      description: stats.connectionRate < 55
        ? "Try shorter intros or alternate numbers for tough leads"
        : "You’re above target — replicate what’s working",
      action: "Refine pitch",
    },
    {
      title: "Prep callback notes",
      description: stats.callbacks > 0
        ? "Draft the next-step script before joining the next call block"
        : "Callbacks are clear — focus on new leads",
      action: "Open notes",
    },
  ]), [stats])

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Call Log </h1>
          </div>
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetTrigger asChild>
              <Button className="self-start rounded-2xl bg-primary text-white px-6 py-5 text-[11px] font-black uppercase tracking-[0.35em]">
                <Sparkles className="h-4 w-4" /> Log Call
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
              <SheetHeader className="space-y-2 text-left">
                <SheetTitle className="text-2xl font-bold text-slate-900">Log a Call</SheetTitle>
                <SheetDescription className="text-sm text-slate-500">
                  Capture conversation details without losing desk context.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 pb-10">
                <EnhancedCallLogForm
                  defaultLeadId={defaultLeadId}
                  onSuccess={() => {
                    setRefreshKey((k) => k + 1)
                    setIsFormOpen(false)
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Quick Insights */}
      {/* <div className="grid gap-5 sm:grid-cols-3">
        {quickInsights.map((insight, index) => {
          const gradients = [
            { from: 'from-emerald-50', to: 'to-teal-50', iconFrom: 'from-emerald-500', iconTo: 'to-teal-500', textColor: 'text-emerald-600', labelColor: 'text-emerald-700' },
            { from: 'from-amber-50', to: 'to-orange-50', iconFrom: 'from-amber-500', iconTo: 'to-orange-500', textColor: 'text-amber-600', labelColor: 'text-amber-700' },
            { from: 'from-rose-50', to: 'to-pink-50', iconFrom: 'from-rose-500', iconTo: 'to-pink-500', textColor: 'text-rose-600', labelColor: 'text-rose-700' },
          ]
          const gradient = gradients[index % gradients.length]
          
          return (
            <Card key={insight.label} className={`border-0 bg-gradient-to-br ${gradient.from} ${gradient.to} shadow-lg hover:shadow-xl transition-shadow overflow-hidden`}>
              <CardContent className="p-6">
                <p className={`text-[10px] uppercase tracking-[0.15em] ${gradient.labelColor} font-semibold mb-3`}>{insight.label}</p>
                <p className="text-3xl font-bold text-slate-900 mb-2">{insight.value}</p>
                <p className={`text-xs ${gradient.labelColor}/80 font-medium`}>{insight.helper}</p>
              </CardContent>
            </Card>
          )
        })}
      </div> */}

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-slate-700" />
              <CardTitle className="text-sm font-bold text-slate-900">Call History & Analytics</CardTitle>
            </div>
            <div className="flex gap-3">
             
              <Button size="sm" className="gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white" onClick={() => setRefreshKey(k => k + 1)}>
                 Refresh 
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <EnhancedCallLogsTable
            refreshKey={refreshKey}
            onStatsChange={setStats}
          />
        </CardContent>
      </Card>

        {/* <div className="space-y-5">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlarmClock className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Follow-up Radar</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Overdue follow-ups</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.overdueFollowUps}</p>
                <p className="text-xs text-amber-700/80 font-medium">{stats.overdueFollowUps > 0 ? "Reach out now to get back on track" : "All commitments are up to date"}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-slate-50/50 to-blue-50/30 p-5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600 font-semibold mb-3">Callbacks waiting</p>
                <p className="text-2xl font-bold text-slate-900 mb-2">{stats.callbacks}</p>
                <p className="text-xs text-slate-600 font-medium">Prep the notes and confirm preferred slots.</p>
              </div>
              <Button className="w-full gap-2 h-11 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg">
                <Target className="h-4 w-4" /> Jump to follow-ups view
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Desk Playbook</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {playbookTasks.map(task => (
                <div key={task.title} className="rounded-xl border border-slate-200/80 p-5 bg-gradient-to-br from-slate-50/50 to-blue-50/30 hover:shadow-md transition-shadow">
                  <p className="text-sm font-bold text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-600 mt-2 font-medium">{task.description}</p>
                  <Button variant="ghost" size="sm" className="mt-3 px-0 text-blue-600 hover:text-blue-700 font-semibold">
                    {task.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div> */}
    </div>
  )
}
