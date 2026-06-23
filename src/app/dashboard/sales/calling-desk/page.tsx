"use client"

import { useState, useEffect } from "react"
import { PhoneCall, Sparkles } from "lucide-react"

import { EnhancedCallLogForm } from "@/components/sales/enhanced-call-log-form"
import { EnhancedCallLogsTable } from "@/components/sales/enhanced-call-logs-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { fetchCallLogs, type CallLogSummary } from "@/lib/call-desk-api"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CallingDeskSkeleton } from "@/components/sales/skeletons"

export default function CallingDeskPage() {
  // Increment this key to trigger the table to re-fetch after a call is logged
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [summaryData, setSummaryData] = useState<CallLogSummary | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [hasLoadedSummary, setHasLoadedSummary] = useState(false)

  // Fetch summary data
  const fetchSummaryData = async () => {
    setIsLoadingSummary(true)
    try {
      const response = await fetchCallLogs({ page: 1, limit: 1 })
      if (response.data && response.data.length > 0) {
        // Extract summary from the last item in data array if it exists
        const lastItem = response.data[response.data.length - 1]
        if ('summary' in lastItem) {
          setSummaryData(lastItem.summary)
        }
      }
    } catch (error) {
      console.error('Failed to fetch summary data:', error)
    } finally {
      setIsLoadingSummary(false)
      setHasLoadedSummary(true)
    }
  }

  // Fetch summary data on component mount and when refreshKey changes
  useEffect(() => {
    fetchSummaryData()
  }, [refreshKey])

  if (!hasLoadedSummary && isLoadingSummary) {
    return <CallingDeskSkeleton />
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Call Log</h1>
           
          </div>
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetTrigger asChild>
              <Button className="group self-start rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold tracking-wide text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/15 p-1 transition group-hover:bg-white/20">
                    <Sparkles className="h-4 w-4 text-white" />
                  </span>
                  Start Call Log
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full border-l border-slate-100 bg-gradient-to-b from-white to-slate-50/70 p-0 sm:max-w-xl h-full overflow-y-auto"
            >
              <div className="flex min-h-full flex-col gap-6 p-8">
                <SheetHeader className="space-y-3 text-left">
                  
                  <div>
                    <SheetTitle className="text-3xl font-bold text-slate-900">Log a Call</SheetTitle>
                    <SheetDescription className="mt-2 text-base text-slate-500">
                      Capture conversation notes, callback requests, and outcomes without leaving your workflow.
                    </SheetDescription>
                  </div>
                </SheetHeader>

                <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
                  <EnhancedCallLogForm
                    onSuccess={() => {
                      setRefreshKey((k) => k + 1)
                      setIsFormOpen(false)
                    }}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total Calls", value: summaryData?.totalCalls || 0, icon: PhoneCall, color: "primary" },
          { label: "Connected", value: summaryData?.connected || 0, icon: PhoneCall, color: "emerald" },
          { label: "Not Connected", value: summaryData?.notConnected || 0, icon: PhoneCall, color: "amber" },
          { label: "Follow-ups", value: summaryData?.followUps || 0, icon: PhoneCall, color: "blue" },
          { label: "Overdue Follow-ups", value: summaryData?.overdueFollowUps || 0, icon: PhoneCall, color: "red" },
        ].map((stat) => {
          const Icon = stat.icon
          const colorMap: Record<string, string> = {
            primary: "bg-primary/10 ring-primary/20 text-primary",
            emerald: "bg-emerald-50 ring-emerald-500/20 text-emerald-600",
            amber: "bg-amber-50 ring-amber-500/20 text-amber-600",
            blue: "bg-blue-50 ring-blue-500/20 text-blue-600",
            red: "bg-red-50 ring-red-500/20 text-red-600",
          }
          const valueColorMap: Record<string, string> = {
            primary: "text-primary",
            emerald: "text-emerald-500",
            amber: "text-amber-500",
            blue: "text-blue-500",
            red: "text-red-500",
          }
          return (
            <Card key={stat.label} className="fresh-card card-hover">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className={cn("text-xl font-bold tracking-tight", valueColorMap[stat.color])}>
                    {isLoadingSummary ? (
                      <div className="h-6 w-12 bg-muted animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center ring-1", colorMap[stat.color])}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-slate-700" />
              <CardTitle className="text-sm font-bold text-slate-900">Call History</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <EnhancedCallLogsTable refreshKey={refreshKey} summaryData={summaryData || undefined} />
        </CardContent>
      </Card>
    </div>
  )
}
