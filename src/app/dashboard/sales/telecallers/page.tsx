"use client"

import * as React from "react"
import { AlertCircle, PhoneCall, TrendingUp, UserCheck, Users } from "lucide-react"

import { useTelecallers } from "@/hooks/use-telecallers"
import { TelecallersTable } from "@/components/sales/telecallers-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TelecallersSkeleton } from "@/components/sales/skeletons"
import { StatCard } from "@/components/ui/stat-card"

export default function SalesTelecallersPage() {
  const { data: telecallers = [], isLoading, error, refetch, isRefetching } = useTelecallers()

  const summary = React.useMemo(() => {
    const activeCount = telecallers.filter((item) => item.is_active !== false).length
    const totalPatients = telecallers.reduce((sum, item) => sum + (item.patientCount ?? 0), 0)
    const totalCalls = telecallers.reduce((sum, item) => sum + (item.totalCalls ?? 0), 0)
    const totalOutbound = telecallers.reduce((sum, item) => sum + (item.outboundCalls ?? 0), 0)
    const totalContacted = telecallers.reduce((sum, item) => sum + (item.contactedCount ?? 0), 0)
    const totalConversions = telecallers.reduce((sum, item) => sum + (item.conversions ?? 0), 0)
    const avgConversionRate =
      totalContacted > 0
        ? (totalConversions / totalContacted) * 100
        : telecallers.length > 0
          ? telecallers.reduce((sum, item) => sum + (item.conversionRate ?? 0), 0) / telecallers.length
          : 0

    return {
      activeCount,
      totalTelecallers: telecallers.length,
      totalPatients,
      totalCalls,
      totalOutbound,
      totalContacted,
      totalConversions,
      avgConversionRate,
    }
  }, [telecallers])

  if (isLoading) {
    return <TelecallersSkeleton />
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/60">
        <CardContent className="flex flex-col gap-4 py-10 text-center">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-600">Failed to load telecallers. {error.message}</p>
          </div>
          <Button onClick={() => refetch()} className="mx-auto">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-2">
              Sales Management Hub
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Telecallers Overview & Analysis</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage active/inactive telecaller accounts, monitor till-date call & conversion performance, and review assigned patient lists
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Telecallers"
          value={`${summary.activeCount}/${summary.totalTelecallers}`}
          icon={UserCheck}
          gradient="from-[#1F56A3] to-[#192B42]"
          subtitle={`${summary.totalTelecallers - summary.activeCount} inactive accounts`}
        />
        <StatCard
          title="Assigned Patients"
          value={summary.totalPatients.toLocaleString("en-IN")}
          icon={Users}
          gradient="from-[#1F56A3] to-[#FFC20E]"
          subtitle={`${summary.totalContacted.toLocaleString("en-IN")} contacted persons`}
        />
        <StatCard
          title="Total Calls Till Date"
          value={summary.totalCalls.toLocaleString("en-IN")}
          icon={PhoneCall}
          gradient="from-[#FFC20E] to-[#1F56A3]"
          subtitle={`${summary.totalOutbound.toLocaleString("en-IN")} outbound calls`}
        />
        <StatCard
          title="Total Conversions"
          value={summary.totalConversions.toLocaleString("en-IN")}
          icon={TrendingUp}
          gradient="from-emerald-500 to-teal-600"
          subtitle={`${summary.avgConversionRate.toFixed(1)}% conversion rate`}
        />
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <TelecallersTable data={telecallers} onRefresh={() => refetch()} isRefreshing={isRefetching} />
        </CardContent>
      </Card>
    </div>
  )
}
