"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { AlertCircle, CheckCircle, Clock, Phone, TrendingUp, Users, Activity } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useTelecallerDashboard, type TelecallerDashboardPayload } from "@/hooks/use-telecaller-dashboard"
import { StatCard } from "@/components/ui/stat-card"

type MetricConfig = {
  key: keyof TelecallerDashboardPayload
  label: string
  description: string
  icon: LucideIcon
  suffix?: string
}

const metricConfigs: MetricConfig[] = [
  {
    key: "totalAssignedLeads",
    label: "Total Assigned Leads",
    description: "",
    icon: Users,
  },
  {
    key: "callsToday",
    label: "Contacted Today",
    description: "",
    icon: Phone,
  },
 
  {
    key: "pendingFollowUps",
    label: "Pending Follow-ups",
    description: "",
    icon: Clock,
  },
  {
    key: "conversionRate",
    label: "Conversion Rate",
    description: "",
    icon: TrendingUp,
    suffix: "%",
  },
  
] as const

export default function TelecallerDashboardPage() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useTelecallerDashboard()

  const metrics = React.useMemo(() => {
    if (!data) return metricConfigs.map((config) => ({ ...config, value: undefined }))

    return metricConfigs.map((config) => {
      const rawValue = data[config.key]
      const value = typeof rawValue === "number" ? rawValue : 0
      return { ...config, value }
    })
  }, [data])

  const recentActivity = data?.recentCallActivity ?? []

  const showSkeleton = isLoading || isRefetching

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
      
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Telecaller Dashboard</h1>
          </div>
         
        </div>
      </div>

      {isError && (
        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-rose-900">Unable to load dashboard</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-rose-700">{error?.message ?? "Something went wrong"}</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="border-rose-300 text-rose-700 hover:bg-rose-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ key, label, description, icon: Icon, value, suffix }, index) => {
          const gradients = [
            'from-[#1F56A3] to-[#192B42]',
            'from-[#1F56A3] to-[#FFC20E]',
            'from-[#FFC20E] to-[#1F56A3]',
            'from-[#BA2C2C] to-[#192B42]',
          ]
          const gradient = gradients[index % gradients.length]
          
          return showSkeleton ? (
            <Card key={key} className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : (
            <StatCard
              key={key}
              title={label}
              value={`${value?.toLocaleString()}${typeof suffix === "string" ? suffix : ""}`}
              icon={Icon}
              gradient={gradient}
              subtitle={description}
            />
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-700" />
            <CardTitle className="text-sm font-bold text-slate-900">Recent Call Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {showSkeleton ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : recentActivity.length ? (
            <div className="space-y-5">
              {recentActivity.map((activity, index) => (
                <div key={`${activity.leadName}-${index}`} className="relative flex items-start gap-3">
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full ${
                    activity.leadStage === "connected" ? "bg-emerald-500" : 
                    activity.outcome === "callback" ? "bg-amber-500" : "bg-blue-500"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{activity.leadName}</p>
                      <span className="text-xs text-slate-500 tabular-nums">{activity.timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {/* <Badge variant="outline" className="text-xs font-semibold border-slate-300 text-slate-700 bg-slate-50 capitalize">
                        {activity.leadStage.replace(/_/g, " ")}
                      </Badge> */}
                      <Badge variant="outline" className="text-xs font-semibold border-blue-300 text-blue-700 bg-blue-50 capitalize">
                        {activity.outcome.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 rounded-xl bg-gradient-to-br from-slate-50/50 to-blue-50/30 p-8 text-center">
              <Activity className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No recent call activity yet</p>
              <p className="text-xs text-slate-500">Start reaching out to leads to see updates here</p>
            </div>
          )}
          {recentActivity.length > 0 && (
                        <h1></h1>

            // <Button className="w-full mt-6 h-11 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg">
            //   View All Activity
            // </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
