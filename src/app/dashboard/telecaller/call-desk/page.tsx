"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { EnhancedCallLogForm } from "@/components/sales/enhanced-call-log-form"
import { EnhancedCallLogsTable, type CallLogStats } from "@/components/sales/enhanced-call-logs-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlarmClock, PhoneCall, Sparkles, Target, TimerReset, AlertTriangle, User, CheckCircle2, PhoneForwarded } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useTelecallerRoleStore } from "@/store/telecaller-role-store"
import { cn } from "@/lib/utils"

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

  const { getProfile } = useTelecallerRoleStore()
  const profile = getProfile()

  const [refreshKey, setRefreshKey] = useState(0)
  const [stats, setStats] = useState<CallLogStats>(emptyStats)
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] font-bold px-2.5 py-0.5">
                <User className="h-3 w-3 mr-1" />
                Logged in as: {profile.name} ({profile.roleTitle})
              </Badge>
              <Badge variant="outline" className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                {profile.department}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Call Desk & Logs</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Personal calling workbench, conversation outcome registry, and follow-up commitments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
              <SheetTrigger asChild>
                <Button className="rounded-2xl bg-primary text-white px-6 py-5 text-[11px] font-black uppercase tracking-[0.35em] shadow-md hover:bg-primary/95">
                  <Sparkles className="h-4 w-4 mr-1.5" /> Log Call
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
      </div>

      {/* Dynamic Summary Cards for Filtered Range & Scope */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Calls Made</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</p>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">In current selection</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-200">
            <PhoneCall className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Connected Calls</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{stats.connected}</p>
            <p className="text-[10px] font-semibold text-emerald-600/80 mt-0.5">
              {stats.connectionRate.toFixed(0)}% connection rate
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Callbacks Scheduled</p>
            <p className="text-2xl font-black text-blue-600 mt-0.5">{stats.callbacks}</p>
            <p className="text-[10px] font-semibold text-blue-600/80 mt-0.5">Requested by patient</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-200">
            <PhoneForwarded className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Follow-ups Required</p>
            <p className={cn("text-2xl font-black mt-0.5", stats.overdueFollowUps > 0 ? "text-red-600" : "text-slate-800")}>
              {stats.overdueFollowUps}
            </p>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Action pending</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-200">
            <AlarmClock className="h-5 w-5" />
          </div>
        </div>
      </div>

      <Card className="border border-slate-200/80 bg-white shadow-lg overflow-hidden rounded-[28px]">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-slate-700" />
              <CardTitle className="text-sm font-bold text-slate-900">Personal & Team Call Activity</CardTitle>
            </div>
            <div className="flex gap-3">
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2 rounded-xl text-xs font-bold" 
                onClick={() => setRefreshKey(k => k + 1)}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <EnhancedCallLogsTable
            refreshKey={refreshKey}
            onStatsChange={setStats}
            scopedCallerName={profile.name}
            defaultMyCallsOnly={true}
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
