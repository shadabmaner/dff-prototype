"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  IndianRupee,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: "Oct", revenue: 620000, collected: 580000, refunds: 12000, outstanding: 40000 },
  { month: "Nov", revenue: 710000, collected: 670000, refunds: 18000, outstanding: 40000 },
  { month: "Dec", revenue: 690000, collected: 630000, refunds: 22000, outstanding: 60000 },
  { month: "Jan", revenue: 820000, collected: 790000, refunds: 8000,  outstanding: 30000 },
  { month: "Feb", revenue: 750000, collected: 700000, refunds: 14000, outstanding: 50000 },
  { month: "Mar", revenue: 910000, collected: 840000, refunds: 9500,  outstanding: 70000 },
]

const PROGRAM_BREAKDOWN = [
  { name: "Diabetes Management", revenue: 310000, share: 34, trend: +4, color: "from-blue-500 to-indigo-500",   bar: "[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500",   badge: "bg-blue-50 border border-blue-200 text-blue-700" },
  { name: "Weight Loss",         revenue: 210000, share: 23, trend: +2, color: "from-emerald-500 to-teal-500",  bar: "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500",  badge: "bg-emerald-50 border border-emerald-200 text-emerald-700" },
  { name: "PCOS Nutrition",      revenue: 155000, share: 17, trend: +6, color: "from-violet-500 to-purple-500", bar: "[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-purple-500", badge: "bg-violet-50 border border-violet-200 text-violet-700" },
  { name: "Thyroid Care",        revenue: 120000, share: 13, trend: -1, color: "from-amber-500 to-orange-500",  bar: "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500",  badge: "bg-amber-50 border border-amber-200 text-amber-700" },
  { name: "Post-Surgery",        revenue: 75000,  share: 8,  trend: +1, color: "from-rose-500 to-pink-500",    bar: "[&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-500",    badge: "bg-rose-50 border border-rose-200 text-rose-700" },
  { name: "General Wellness",    revenue: 40000,  share: 5,  trend: -2, color: "from-slate-400 to-slate-500",  bar: "[&>div]:bg-gradient-to-r [&>div]:from-slate-400 [&>div]:to-slate-500",  badge: "bg-slate-50 border border-slate-200 text-slate-600" },
]

const COLLECTION_HEALTH = [
  { label: "Collected on Time", value: 74, color: "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500",  textColor: "text-emerald-700", badgeBg: "bg-emerald-50 border border-emerald-200" },
  { label: "Collected Late",    value: 15, color: "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500",  textColor: "text-amber-700",   badgeBg: "bg-amber-50 border border-amber-200" },
  { label: "Overdue",           value: 8,  color: "[&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-500",     textColor: "text-rose-700",    badgeBg: "bg-rose-50 border border-rose-200" },
  { label: "Waived / Written Off", value: 3, color: "[&>div]:bg-gradient-to-r [&>div]:from-slate-400 [&>div]:to-slate-500", textColor: "text-slate-600",   badgeBg: "bg-slate-50 border border-slate-200" },
]

const formatAmount = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const current  = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1]
const previous = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2]
const maxRevenue = Math.max(...MONTHLY_REVENUE.map((m) => m.revenue))

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceReportsPage() {
  const stats = useMemo(() => {
    const totalRevenue   = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0)
    const totalCollected = MONTHLY_REVENUE.reduce((s, m) => s + m.collected, 0)
    const totalRefunds   = MONTHLY_REVENUE.reduce((s, m) => s + m.refunds, 0)
    const totalOutstanding = MONTHLY_REVENUE.reduce((s, m) => s + m.outstanding, 0)
    const collectionRate = Math.round((totalCollected / totalRevenue) * 100)
    const revenueDelta   = Math.round(((current.revenue - previous.revenue) / previous.revenue) * 100)
    const collectedDelta = Math.round(((current.collected - previous.collected) / previous.collected) * 100)
    return { totalRevenue, totalCollected, totalRefunds, totalOutstanding, collectionRate, revenueDelta, collectedDelta }
  }, [])

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Clinic Portal / Finance / Reports
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Finance Reports</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Revenue KPIs, collection health, program breakdowns, and exportable summaries.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-5 md:grid-cols-4">
        <KpiCard
          label="Total Revenue (6M)"
          value={formatAmount(stats.totalRevenue)}
          sub="Oct 2024 – Mar 2025"
          delta={stats.revenueDelta}
          icon={<IndianRupee className="h-6 w-6 text-white" />}
          gradient="from-blue-500 to-indigo-500"
          bg="from-blue-50 to-indigo-50"
          textColor="text-blue-700"
        />
        <KpiCard
          label="Total Collected"
          value={formatAmount(stats.totalCollected)}
          sub={`${stats.collectionRate}% collection rate`}
          delta={stats.collectedDelta}
          icon={<CheckCircle2 className="h-6 w-6 text-white" />}
          gradient="from-emerald-500 to-teal-500"
          bg="from-emerald-50 to-teal-50"
          textColor="text-emerald-700"
        />
        <KpiCard
          label="Outstanding Dues"
          value={formatAmount(stats.totalOutstanding)}
          sub="Pending + overdue"
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          gradient="from-amber-500 to-orange-500"
          bg="from-amber-50 to-orange-50"
          textColor="text-amber-700"
        />
        <KpiCard
          label="Total Refunds"
          value={formatAmount(stats.totalRefunds)}
          sub="Approved refunds"
          icon={<RefreshCw className="h-6 w-6 text-white" />}
          gradient="from-rose-500 to-pink-500"
          bg="from-rose-50 to-pink-50"
          textColor="text-rose-700"
        />
      </div>

      {/* ── Revenue Bar Chart + Collection Health ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <RevenueBarChart />

        {/* Collection Health */}
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-700" />
              Collection Health
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">% of total billed amount by status</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {COLLECTION_HEALTH.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-700">{c.label}</p>
                  <Badge className={cn("font-semibold text-xs px-2 py-0.5", c.badgeBg, c.textColor)}>
                    {c.value}%
                  </Badge>
                </div>
                <Progress value={c.value} className={cn("h-2.5 rounded-full", c.color)} />
              </div>
            ))}

            {/* Collection rate summary */}
            <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Overall Collection Rate</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.collectionRate}%</p>
              <Progress value={stats.collectionRate} className="mt-2 h-2 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Program Revenue Breakdown + Top Programs ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Breakdown bars */}
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-slate-700" />
              Revenue by Program
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">Share of total 6-month revenue</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {PROGRAM_BREAKDOWN.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">{p.name}</p>
                  <Badge className={cn("text-[10px] font-bold px-2 py-0.5", p.badge)}>{p.share}%</Badge>
                </div>
                <Progress value={p.share} className={cn("h-2 rounded-full", p.bar)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top programs table */}
        <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-700" />
              Program Performance
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">Revenue generated per program with MoM trend</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {PROGRAM_BREAKDOWN.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50/50 transition-colors">
                {/* Rank */}
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-md",
                  i === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white" :
                  i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" :
                  i === 2 ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white" :
                            "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600"
                )}>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        "flex items-center gap-1 text-xs font-semibold",
                        p.trend >= 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {p.trend >= 0
                          ? <ArrowUpRight className="h-3.5 w-3.5" />
                          : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {p.trend >= 0 ? "+" : ""}{p.trend}% MoM
                      </span>
                      <span className="text-sm font-black text-slate-900">{formatAmount(p.revenue)}</span>
                    </div>
                  </div>
                  <Progress
                    value={p.share}
                    className={cn("h-1.5 rounded-full", p.bar)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Revenue Bar Chart ────────────────────────────────────────────────────────

function RevenueBarChart() {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)

  const activeMonth = hoveredMonth
    ? MONTHLY_REVENUE.find((m) => m.month === hoveredMonth)!
    : current

  const isHovered = (month: string) => hoveredMonth === month
  const isDimmed  = (month: string) => hoveredMonth !== null && hoveredMonth !== month

  return (
    <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-700" />
              Monthly Revenue vs Collected
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 mt-0.5">
              Last 6 months — Oct 2024 to Mar 2025 · Hover a column to inspect
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-blue-500 inline-block" />Revenue
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-500 inline-block" />Collected
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Bars */}
        <div className="flex items-end justify-between gap-2 h-52">
          {MONTHLY_REVENUE.map((m) => {
            const revH = Math.round((m.revenue   / maxRevenue) * 100)
            const colH = Math.round((m.collected / maxRevenue) * 100)
            const hovered = isHovered(m.month)
            const dimmed  = isDimmed(m.month)
            const isCurrent = m.month === current.month

            return (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center gap-2 cursor-pointer group/col"
                onMouseEnter={() => setHoveredMonth(m.month)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Tooltip */}
                <div className={cn(
                  "w-full rounded-xl border bg-white shadow-xl px-3 py-2.5 text-center transition-all duration-200 pointer-events-none",
                  hovered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"
                )}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{m.month}</p>
                  <p className="text-xs font-bold text-blue-600">{formatAmount(m.revenue)}</p>
                  <p className="text-xs font-bold text-emerald-600">{formatAmount(m.collected)}</p>
                  <p className="text-[10px] text-amber-600 font-semibold mt-0.5">↑ {formatAmount(m.outstanding)} due</p>
                </div>

                {/* Bar group */}
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Revenue bar */}
                  <div
                    className={cn(
                      "w-[45%] rounded-t-lg transition-all duration-300",
                      hovered
                        ? "bg-blue-600 shadow-lg shadow-blue-200"
                        : dimmed
                        ? "bg-blue-100"
                        : isCurrent
                        ? "bg-blue-500"
                        : "bg-blue-200 group-hover/col:bg-blue-400"
                    )}
                    style={{ height: `${revH}%` }}
                  />
                  {/* Collected bar */}
                  <div
                    className={cn(
                      "w-[45%] rounded-t-lg transition-all duration-300",
                      hovered
                        ? "bg-emerald-600 shadow-lg shadow-emerald-200"
                        : dimmed
                        ? "bg-emerald-100"
                        : isCurrent
                        ? "bg-emerald-500"
                        : "bg-emerald-200 group-hover/col:bg-emerald-400"
                    )}
                    style={{ height: `${colH}%` }}
                  />
                </div>

                {/* Month label */}
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wide transition-colors duration-200",
                  hovered  ? "text-slate-900" :
                  dimmed   ? "text-slate-300" :
                  isCurrent ? "text-slate-900" : "text-slate-400"
                )}>
                  {m.month}
                </span>
              </div>
            )
          })}
        </div>

        {/* Active month callout — updates on hover */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            {
              label: `${activeMonth.month} Revenue`,
              value: formatAmount(activeMonth.revenue),
              color: "text-blue-700",
              bg: "bg-blue-50 border-blue-100",
            },
            {
              label: `${activeMonth.month} Collected`,
              value: formatAmount(activeMonth.collected),
              color: "text-emerald-700",
              bg: "bg-emerald-50 border-emerald-100",
            },
            {
              label: `${activeMonth.month} Outstanding`,
              value: formatAmount(activeMonth.outstanding),
              color: "text-amber-700",
              bg: "bg-amber-50 border-amber-100",
            },
          ].map((item) => (
            <div key={item.label} className={cn("rounded-xl border px-4 py-3 transition-all duration-200", item.bg)}>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{item.label}</p>
              <p className={cn("text-base font-black mt-0.5 transition-all duration-200", item.color)}>{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, delta, icon, gradient, bg, textColor,
}: {
  label: string; value: string; sub: string; delta?: number
  icon: React.ReactNode; gradient: string; bg: string; textColor: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn("border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group bg-gradient-to-br", bg)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <p className={cn("text-[10px] uppercase tracking-[0.15em] font-semibold", textColor)}>{label}</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1 leading-tight">{value}</p>
              <div className="flex items-center gap-2">
                <p className={cn("text-xs font-medium", textColor + "/80")}>{sub}</p>
                {delta !== undefined && (
                  <span className={cn(
                    "flex items-center gap-0.5 text-[10px] font-bold",
                    delta >= 0 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {delta >= 0 ? "+" : ""}{delta}%
                  </span>
                )}
              </div>
            </div>
            <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", gradient)}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}