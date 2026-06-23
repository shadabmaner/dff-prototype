"use client"

import { useEffect } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"
import { motion } from "framer-motion"
import {
  Users,
  Target,
  Phone,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import { useSales } from "@/components/sales/sales-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useSalesDashboardKpi } from "@/hooks/use-sales-dashboard"
import { StatCard } from "@/components/ui/stat-card"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function SalesDashboardPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { leads } = useSales()
  const {
    data: kpi,
    isLoading: kpiLoading,
    isError: kpiError,
    refetch: refetchKpi,
  } = useSalesDashboardKpi()

  // Refresh data when user navigates back to this page
  useEffect(() => {
    // Check if we're on the dashboard page
    if (pathname === "/dashboard/sales/dashboard") {
      // Refetch KPI data when component mounts or when user navigates back
      refetchKpi()
    }
  }, [pathname, refetchKpi])

  // Also refresh data when window gains focus (user switches back to browser tab)
  useEffect(() => {
    const handleFocus = () => {
      if (pathname === "/dashboard/sales/dashboard") {
        refetchKpi()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [pathname, refetchKpi])

  const handleCardClick = (filterType: string, route?: string) => {
    if (route) {
      router.push(route)
      return
    }
    router.push(`/dashboard/sales/leads?tab=${filterType}`)
  }

  const newLeads = leads.filter((l) => l.stage === "NEW" || l.stage === "UNASSIGNED").length
  const hotLeads = leads.filter((l) => l.stage === "HOT").length
  const followUps = leads.filter((l) => l.stage === "FOLLOW_UP").length
  const conversions = leads.filter((l) => l.stage === "CONVERTED").length

  const paymentStages = {
    interested: leads.filter((l) => l.paymentStage === "INTERESTED").length,
    linkSent: leads.filter((l) => l.paymentStage === "LINK_SENT").length,
    received: leads.filter((l) => l.paymentStage === "RECEIVED").length,
    failed: leads.filter((l) => l.paymentStage === "FAILED").length,
    dropped: leads.filter((l) => l.paymentStage === "DROPPED").length,
  }

  const summary = kpi?.summary
  const conversionsSnapshot = kpi?.conversions
  const followUpsSnapshot = kpi?.followUps
  const activitiesSnapshot = kpi?.activities
  const leadSources = kpi?.leadSources ?? []
  const funnelHealthSnapshot = kpi?.funnelHealth
  const target = conversionsSnapshot?.totalConverted ? conversionsSnapshot.totalConverted : 10
  const conversionRateFallback = leads.length ? Number(((conversions / leads.length) * 100).toFixed(1)) : 0
  const conversionRateValue = conversionsSnapshot?.conversionRate ?? conversionRateFallback
  const conversionRateDisplay = Number.isFinite(conversionRateValue)
    ? conversionRateValue.toFixed(1)
    : conversionRateFallback.toFixed(1)
  const conversionsThisMonth = conversionsSnapshot?.convertedThisMonth ?? conversions
  const targetAchievement = ((conversions / target) * 100).toFixed(1)

  const formatNumber = (value?: number | null) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "0"
    return value.toLocaleString("en-IN")
  }

  const pipelineLabelMap: Record<string, string> = {
    new: "New",
    active: "Active",
    contacted: "Contacted",
    contact_attempted: "Contact Attempted",
    follow_up: "Follow Up",
    hot: "Hot",
    negotiation: "Negotiation",
    converted: "Converted",
  }

  const pipelineSource =
    kpi?.pipeline?.map((stage) => ({ status: stage.status, count: stage.count })) ??
    Object.entries(paymentStages).map(([status, count]) => ({ status, count: Number(count) }))

  // Extract follow-up count from pipeline data
  const followUpFromPipeline = pipelineSource.find(stage => stage.status === 'follow_up')?.count ?? 0

  const pipelinePalette = ["#2563eb", "#10b981", "#f97316", "#8b5cf6", "#0ea5e9", "#f43f5e", "#6366f1"]
  const pipelineChartData = pipelineSource.map((stage, idx) => ({
    name:
      pipelineLabelMap[stage.status] ??
      stage.status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    value: stage.count,
    fill: pipelinePalette[idx % pipelinePalette.length],
  }))
  const pipelineTotal = pipelineChartData.reduce((sum, entry) => sum + (entry.value ?? 0), 0)

  const leadSourcePalette = ["#2563eb", "#0ea5e9", "#6366f1", "#22c55e", "#f97316", "#ec4899"]
  const leadSourceChartData = leadSources.map((source, idx) => ({
    name:
      pipelineLabelMap[source.source] ??
      source.source
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    value: source.count,
    fill: leadSourcePalette[idx % leadSourcePalette.length],
  }))
  const totalLeadSourceCount = leadSourceChartData.reduce((sum, entry) => sum + (entry.value ?? 0), 0)
  const leadSourceBarData = leadSourceChartData.map((entry) => ({
    ...entry,
    percentage: totalLeadSourceCount ? Number((((entry.value ?? 0) / totalLeadSourceCount) * 100).toFixed(1)) : 0,
  }))
  const topLeadSource = leadSourceBarData.reduce<(typeof leadSourceBarData)[number] | null>((top, current) => {
    if (!top) return current
    return (current.value ?? 0) > (top.value ?? 0) ? current : top
  }, null)

  const followUpMetrics = [
    {
      key: "pendingToday",
      label: "Pending Today",
      value: followUpsSnapshot?.pendingToday ?? (kpiLoading ? 0 : followUps),
      gradient: "from-amber-400 to-amber-500",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: followUpsSnapshot?.overdue ?? (kpiLoading ? 0 : 0),
      gradient: "from-rose-400 to-rose-500",
    },
    {
      key: "completedLast7Days",
      label: "Completed (7d)",
      value: followUpsSnapshot?.completedLast7Days ?? (kpiLoading ? 0 : conversions),
      gradient: "from-emerald-400 to-emerald-500",
    },
    {
      key: "scheduledLast7Days",
      label: "Scheduled (7d)",
      value: followUpsSnapshot?.scheduledLast7Days ?? (kpiLoading ? 0 : newLeads),
      gradient: "from-sky-400 to-sky-500",
    },
    {
      key: "responseRate",
      label: "Response Rate",
      value: followUpsSnapshot?.responseRate ?? (kpiLoading ? 0 : conversionRateFallback),
      gradient: "from-primary to-pink-500",
      isPercentage: true,
    },
  ]
  const maxFollowUpValue = followUpMetrics
    .filter((metric) => !metric.isPercentage)
    .reduce((max, metric) => (Number(metric.value) > max ? Number(metric.value) : max), 1)

  const stats = [
    {
      title: "Total Leads",
      value: formatNumber(summary?.totalLeads ?? (kpiLoading ? 0 : leads.length)),
      change: summary ? `${formatNumber(summary.newLast7Days)} last 7 days` : kpiLoading ? "Loading..." : "No data",
      up: true,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      ring: "ring-blue-100",
      filterType: "all",
    },
    {
      title: "Unassigned Leads",
      value: formatNumber(summary?.unassignedLeads ?? (kpiLoading ? 0 : hotLeads)),
      change: summary ? `${formatNumber(summary.newToday)} new today` : kpiLoading ? "Loading..." : "No data",
      up: true,
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
      filterType: "hot",
      route: "/dashboard/sales/lead-assignment",
    },
    {
      title: "Follow-ups",
      value: formatNumber(followUpFromPipeline),
      change: followUpsSnapshot ? `${formatNumber(followUpsSnapshot.overdue)} overdue` : kpiLoading ? "Loading..." : "No data",
      up: followUpsSnapshot ? followUpsSnapshot.overdue <= (followUpsSnapshot.pendingToday || 0) : true,
      icon: Phone,
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "ring-amber-100",
      filterType: "followup",
    },
    {
      title: "Conversion Target",
      value: `${targetAchievement}%`,
      change: `${formatNumber(conversions)} of ${formatNumber(target)} achieved`,
      up: parseFloat(targetAchievement) >= 50,
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
      ring: "ring-violet-100",
      filterType: "converted",
    },
  ]

  function formatINR(value: number) {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
    return `₹${value}`
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Sales Dashboard</h1>
          </div>

        </div>
      </div>
      {/* 
      {kpiError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4" /> Unable to load live KPI data. Showing offline insights.
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchKpi()}>
            Retry sync
          </Button>
        </div>
      )} */}

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          const gradientMap: Record<string, string> = {
            "text-blue-600": "from-[#1F56A3] to-[#192B42]",
            "text-emerald-600": "from-[#1F56A3] to-[#FFC20E]",
            "text-amber-600": "from-[#FFC20E] to-[#1F56A3]",
            "text-violet-600": "from-[#192B42] to-[#1F56A3]",
          }
          return (
            <div key={s.title} onClick={() => handleCardClick(s.filterType, s.route)} className="cursor-pointer">
              <StatCard
                title={s.title}
                value={s.value}
                icon={Icon}
                gradient={gradientMap[s.color]}
                subtitle={s.change}
              />
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead trends chart */}
        {/* <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Growth Velocity</h2>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-blue-300 text-blue-700 bg-blue-50">12-month trend</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-2">{payload[0].payload.month}</p>
                            {payload.map((p, i) => (
                              <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line type="monotone" dataKey="newLeads" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 3 }} />
                  <Line type="monotone" dataKey="hotLeads" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 3 }} />
                  <Line type="monotone" dataKey="followUps" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", r: 3 }} />
                  <Line type="monotone" dataKey="conversions" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}

        {/* Conversion rate chart */}
        {/* <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Conversion Index</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={conversionRateData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesConvGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1">{payload[0].payload.month}</p>
                            <p className="text-sm font-bold text-violet-600">Rate: {payload[0].value}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} fill="url(#salesConvGrad2)" fillOpacity={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Payment funnel and revenue */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment funnel */}
        {/* <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Financial Funnel</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative group/funnel">
                <ResponsiveContainer width="100%" height={200}>
                  <FunnelChart data={paymentFunnelData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <Tooltip
                      contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontWeight: 800 }}
                    />
                    <Funnel dataKey="value" isAnimationActive>
                      <LabelList position="center" fill="#fff" fontSize={11} fontWeight={900} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 px-6">
                {paymentFunnelData.map((stage) => (
                  <div key={stage.name} className="flex items-center justify-between group/item cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-lg group-hover/item:scale-125 transition-transform" style={{ backgroundColor: stage.fill }} />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{stage.name}</span>
                    </div>
                    <span className="font-black text-slate-900 tabular-nums">{stage.value}</span>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card> */}

        {/* Revenue vs target */}
        {/* <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Revenue Velocity</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barSize={16} barGap={4} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-2">{payload[0].payload.month}</p>
                            {payload.map((p, i) => (
                              <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
                                {p.name === "revenue" ? "Revenue" : "Target"}: {formatINR(Number(p.value))}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="target" fill="#f1f5f9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Lead source + activity insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Lead Source Mix</h2>
              </div>
              {topLeadSource && (
                <div className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">
                  Top: {topLeadSource.name}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {leadSourceBarData.length ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadSourceBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as (typeof leadSourceBarData)[number]
                            return (
                              <div className="rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg">
                                <p>{data.name}</p>
                                <p className="text-xs text-slate-500">{formatNumber(data.value)} leads • {data.percentage}% share</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="percentage" radius={[8, 8, 0, 0]} barSize={32}>
                        {leadSourceBarData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                        <LabelList
                          dataKey="percentage"
                          position="top"
                          formatter={(value) => `${value}%`}
                          fill="#1f2937"
                          fontSize={12}
                          fontWeight={600}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {leadSourceBarData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between rounded-xl bg-slate-50/70 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
                          <p className="text-[11px] text-slate-500">{entry.percentage}% share</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{formatNumber(entry.value)}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid h-48 place-items-center text-sm font-semibold text-slate-400">
                Awaiting lead source telemetry…
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Sales Activity </h2>
              </div>

            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-600">Date Filter</span>
              </div>
              <select className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Month</option>
                <option>Custom Range</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: "Calls Made",
                  value: activitiesSnapshot?.callLogsLast7Days ?? (kpiLoading ? 0 : 0),
                },
                {
                  label: "Calls Connected",
                  value: activitiesSnapshot?.callLogsLast7Days ? Math.round((activitiesSnapshot.callLogsLast7Days * 0.65)) : (kpiLoading ? 0 : 0),
                },
                {
                  label: "Calls Not Connected",
                  value: activitiesSnapshot?.callLogsLast7Days ? Math.round((activitiesSnapshot.callLogsLast7Days * 0.35)) : (kpiLoading ? 0 : 0),
                },
                {
                  label: "Active Telecallers",
                  value: activitiesSnapshot?.activeTelecallersLast7Days ?? (kpiLoading ? 0 : 0),
                },
                {
                  label: "Avg Conversion Time",
                  value: kpiLoading ? 0 : 5,
                  suffix: " days",
                },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl bg-gradient-to-br from-slate-50/60 to-blue-50/30 px-4 py-5">
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.15em]">{metric.label}</p>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums mt-2">
                    {formatNumber(metric.value)}{metric.suffix || ""}
                  </p>
                </div>
              ))}
            </div>
            {/* <div className="mt-6 rounded-xl border border-slate-200 bg-white/70 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">Response Rate</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {(followUpsSnapshot?.responseRate ?? 0).toFixed(1)}%
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <Progress className="mt-4" value={followUpsSnapshot?.responseRate ?? 0} />
            </div> */}
          </CardContent>
        </Card>
      </div>

      {/* Follow-up performance */}
      {/* <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Follow-up Performance Index</h2>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {followUpMetrics.map((metric, idx) => {
              const baseValue = Number(metric.value) ?? 0
              const percentage = metric.isPercentage
                ? Math.min(100, Math.max(0, baseValue))
                : maxFollowUpValue > 0
                ? ((baseValue / maxFollowUpValue) * 100).toFixed(1)
                : "0"

              return (
                <div
                  key={metric.key}
                  className="rounded-xl bg-gradient-to-br from-slate-50/50 to-blue-50/30 p-5 transition-all hover:shadow-md"
                >
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.15em] mb-2">{metric.label}</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums mb-3">
                    {metric.isPercentage ? `${baseValue.toFixed(1)}%` : formatNumber(baseValue)}
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${metric.gradient} rounded-full transition-all duration-500`}
                      style={{ width: metric.isPercentage ? `${percentage}%` : `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
