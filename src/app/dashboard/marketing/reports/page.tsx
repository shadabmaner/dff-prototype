"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
  DollarSign,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Funnel as FunnelIcon,
  Activity,
} from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const monthlyPerformanceData = [
  { month: "Jan", leads: 38, conversions: 12, revenue: 480000, cost: 120000, webinars: 156 },
  { month: "Feb", leads: 42, conversions: 15, revenue: 600000, cost: 135000, webinars: 189 },
  { month: "Mar", leads: 55, conversions: 22, revenue: 880000, cost: 165000, webinars: 234 },
  { month: "Apr", leads: 48, conversions: 18, revenue: 720000, cost: 144000, webinars: 201 },
  { month: "May", leads: 67, conversions: 28, revenue: 1120000, cost: 201000, webinars: 298 },
  { month: "Jun", leads: 61, conversions: 25, revenue: 1000000, cost: 183000, webinars: 267 },
  { month: "Jul", leads: 74, conversions: 32, revenue: 1280000, cost: 222000, webinars: 342 },
  { month: "Aug", leads: 70, conversions: 30, revenue: 1200000, cost: 210000, webinars: 315 },
  { month: "Sep", leads: 82, conversions: 35, revenue: 1400000, cost: 246000, webinars: 378 },
  { month: "Oct", leads: 88, conversions: 38, revenue: 1520000, cost: 264000, webinars: 412 },
  { month: "Nov", leads: 85, conversions: 36, revenue: 1440000, cost: 255000, webinars: 395 },
  { month: "Dec", leads: 95, conversions: 42, revenue: 1680000, cost: 285000, webinars: 445 },
]

const sourcePerformanceData = [
  { source: "Google Ads", leads: 384, conversions: 142, cost: 285000, revenue: 1420000, roi: 398 },
  { source: "Facebook", leads: 267, conversions: 98, cost: 198000, revenue: 980000, roi: 395 },
  { source: "Webinars", leads: 445, conversions: 189, cost: 156000, revenue: 1890000, roi: 1111 },
  { source: "Organic Search", leads: 156, conversions: 52, cost: 45000, revenue: 520000, roi: 1056 },
  { source: "Referrals", leads: 89, conversions: 38, cost: 22000, revenue: 380000, roi: 1627 },
  { source: "Email Campaign", leads: 234, conversions: 78, cost: 67000, revenue: 780000, roi: 1064 },
]

const campaignPerformanceData = [
  { name: "Diabetes Awareness", value: 156, fill: "#3b82f6" },
  { name: "Weight Loss Program", value: 134, fill: "#22c55e" },
  { name: "Thyroid Care", value: 98, fill: "#f59e0b" },
  { name: "Heart Health", value: 112, fill: "#ef4444" },
  { name: "Mental Wellness", value: 87, fill: "#8b5cf6" },
]

const conversionFunnelData = [
  { name: "Impressions", value: 125000, fill: "#e5e7eb" },
  { name: "Clicks", value: 12500, fill: "#d1d5db" },
  { name: "Landing Page", value: 3125, fill: "#9ca3af" },
  { name: "Form Submits", value: 938, fill: "#6b7280" },
  { name: "Qualified Leads", value: 469, fill: "#4b5563" },
  { name: "Converted", value: 141, fill: "#3b82f6" },
]

const specialtyPerformanceData = [
  { specialty: "Diabetes", leads: 384, conversions: 142, revenue: 1420000, avgDealSize: 10000 },
  { specialty: "Weight Loss", leads: 267, conversions: 98, revenue: 980000, avgDealSize: 10000 },
  { specialty: "Thyroid", leads: 156, conversions: 52, revenue: 520000, avgDealSize: 10000 },
  { specialty: "Heart Health", leads: 234, conversions: 78, revenue: 780000, avgDealSize: 10000 },
  { specialty: "Mental Wellness", leads: 189, conversions: 67, revenue: 670000, avgDealSize: 10000 },
]

const geographyPerformanceData = [
  { region: "North India", leads: 234, conversions: 89, revenue: 890000 },
  { region: "South India", leads: 198, conversions: 76, revenue: 760000 },
  { region: "East India", leads: 156, conversions: 52, revenue: 520000 },
  { region: "West India", leads: 267, conversions: 98, revenue: 980000 },
  { region: "Central India", leads: 89, conversions: 34, revenue: 340000 },
]

const webinarMetricsData = [
  { month: "Jan", scheduled: 12, completed: 11, attendance: 89, avgRating: 4.2 },
  { month: "Feb", scheduled: 14, completed: 13, attendance: 91, avgRating: 4.3 },
  { month: "Mar", scheduled: 16, completed: 15, attendance: 87, avgRating: 4.1 },
  { month: "Apr", scheduled: 13, completed: 12, attendance: 85, avgRating: 4.0 },
  { month: "May", scheduled: 18, completed: 17, attendance: 92, avgRating: 4.4 },
  { month: "Jun", scheduled: 15, completed: 14, attendance: 88, avgRating: 4.2 },
  { month: "Jul", scheduled: 20, completed: 19, attendance: 94, avgRating: 4.5 },
  { month: "Aug", scheduled: 17, completed: 16, attendance: 90, avgRating: 4.3 },
  { month: "Sep", scheduled: 19, completed: 18, attendance: 93, avgRating: 4.4 },
  { month: "Oct", scheduled: 21, completed: 20, attendance: 95, avgRating: 4.6 },
  { month: "Nov", scheduled: 18, completed: 17, attendance: 91, avgRating: 4.3 },
  { month: "Dec", scheduled: 22, completed: 21, attendance: 96, avgRating: 4.7 },
]

const kpiData = [
  {
    title: "Total Leads",
    value: "1,475",
    change: "+18.5%",
    up: true,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Conversion Rate",
    value: "32.4%",
    change: "+4.2%",
    up: true,
    icon: Target,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Total Revenue",
    value: "₹7.1M",
    change: "+22.3%",
    up: true,
    icon: DollarSign,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Avg. Cost/Lead",
    value: "₹285",
    change: "-8.7%",
    up: false,
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
]

function formatINR(value: number) {
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value)
}

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

export default function MarketingReportsPage() {
  const [timeRange, setTimeRange] = useState("12months")
  const [reportType, setReportType] = useState("overview")

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Intelligence & Analytics</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketing <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Insights</span></h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Comprehensive multi-channel performance intelligence and attribution modeling.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 h-10 rounded-xl border-slate-200 bg-white shadow-sm font-semibold text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl font-bold border-slate-200 hover:bg-slate-50 text-slate-600">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="h-10 px-4 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <motion.div key={kpi.title} variants={item}>
              <Card className="group fresh-card-alt border-none shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`${kpi.bg} rounded-2xl p-3.5 ring-1 ring-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm`}>
                      <Icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                    {kpi.change && (
                      <div className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black shadow-sm",
                        kpi.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {kpi.change}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{kpi.title}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{kpi.value}</p>
                  </div>
                  <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "70%" }}
                      transition={{ duration: 1, delay: 0.4 + idx * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-pink-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Report Type Selector */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/50 backdrop-blur-sm rounded-2xl w-fit border border-slate-200/50">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "campaigns", label: "Campaigns", icon: Target },
          { id: "sources", label: "Sources", icon: PieChartIcon },
          { id: "webinars", label: "Webinars", icon: Calendar },
          { id: "funnel", label: "Funnel", icon: FunnelIcon },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = reportType === tab.id
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setReportType(tab.id)}
              className={cn(
                "relative h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                isActive
                  ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Icon className={cn("mr-2 h-3.5 w-3.5", isActive ? "text-primary" : "text-slate-400")} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-primary rounded-full"
                />
              )}
            </Button>
          )
        })}
      </div>

      {/* Overview Report */}
      {reportType === "overview" && (
        <div className="space-y-6">
          {/* Revenue vs Cost Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div variants={item} initial="hidden" animate="show">
              <Card className="fresh-card border-none shadow-xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-slate-100/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Revenue velocity</CardTitle>
                    </div>
                    <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Efficiency vs Expenditure</p>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pt-8 pb-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                        tickFormatter={(v) => `₹${v / 100000}L`}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                        formatter={(value: any) => [formatINR(value), ""]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fill="url(#revenueGradient)" />
                      <Area type="monotone" dataKey="cost" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="url(#costGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item} initial="hidden" animate="show">
              <Card className="fresh-card border-none shadow-xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-slate-100/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-emerald-500" />
                      <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Lead acquisition</CardTitle>
                    </div>
                    <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Net-new vs Conversions</p>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pt-8 pb-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                      <Bar dataKey="leads" name="New Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="conversions" name="Conversions" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Specialty Performance */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="fresh-card-alt border-none shadow-xl overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-slate-100/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-primary" />
                    <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Clinical specializations</CardTitle>
                  </div>
                  <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Revenue & Volume breakdown</p>
                </div>
              </CardHeader>
              <CardContent className="px-2 pt-8 pb-4">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={specialtyPerformanceData} barSize={40} barGap={12} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="specialty"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      formatter={(value: any, name: any) => [
                        name === "revenue" ? formatINR(Number(value)) : value,
                        name === "revenue" ? "Revenue" : name === "conversions" ? "Conversions" : "Leads"
                      ]}
                    />
                    <Bar dataKey="revenue" name="revenue" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="conversions" name="conversions" fill="url(#pinkGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                      <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f472b6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Campaigns Report */}
      {reportType === "campaigns" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Campaign Performance */}
            <motion.div variants={item} initial="hidden" animate="show">
              <Card className="fresh-card border-none shadow-xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-slate-100/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-primary" />
                      <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Campaign reach</CardTitle>
                    </div>
                    <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Lead generation by program</p>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pt-8 pb-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={campaignPerformanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {campaignPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {campaignPerformanceData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Geography Performance */}
            <motion.div variants={item} initial="hidden" animate="show">
              <Card className="fresh-card-alt border-none shadow-xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-slate-100/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-primary" />
                      <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Regional velocity</CardTitle>
                    </div>
                    <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Revenue distribution by region</p>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pt-8 pb-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={geographyPerformanceData} barSize={30} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="region"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                      <Bar dataKey="revenue" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}

      {/* Sources Report */}
      {reportType === "sources" && (
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="fresh-card border-none shadow-xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-slate-100/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <PieChartIcon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Channel attribution</CardTitle>
                </div>
                <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Detailed metrics by traffic source</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-4 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Source</th>
                      <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Leads</th>
                      <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Conv. Rate</th>
                      <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Cost</th>
                      <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</th>
                      <th className="text-right py-4 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourcePerformanceData.map((source) => {
                      const conversionRate = ((source.conversions / source.leads) * 100).toFixed(1)
                      return (
                        <tr key={source.source} className="group/row border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-8 font-black text-slate-700 uppercase tracking-tight text-[13px]">{source.source}</td>
                          <td className="text-right py-4 px-6 tabular-nums font-bold text-slate-500">{formatNumber(source.leads)}</td>
                          <td className="text-right py-4 px-6">
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] rounded-lg">
                              {conversionRate}%
                            </Badge>
                          </td>
                          <td className="text-right py-4 px-6 tabular-nums font-bold text-slate-400">{formatINR(source.cost)}</td>
                          <td className="text-right py-4 px-6 tabular-nums font-black text-slate-900">{formatINR(source.revenue)}</td>
                          <td className="text-right py-4 px-8">
                            <Badge className="bg-primary text-white border-none font-black text-[10px] rounded-lg shadow-md shadow-primary/20 scale-100 group-hover/row:scale-110 transition-transform">
                              {source.roi}%
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Webinars Report */}
      {reportType === "webinars" && (
        <motion.div variants={item} initial="hidden" animate="show" className="space-y-6">
          <Card className="fresh-card border-none shadow-xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-slate-100/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Engagement pulse</CardTitle>
                </div>
                <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Monthly webinar enrollment & participation</p>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-8 pb-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={webinarMetricsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="scheduled" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="attendance" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Conversion Funnel Report */}
      {reportType === "funnel" && (
        <motion.div variants={item} initial="hidden" animate="show" className="space-y-6">
          <Card className="fresh-card border-none shadow-xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-slate-100/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FunnelIcon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Leads lifecycle</CardTitle>
                </div>
                <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Acquisition to Conversion breakdown</p>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-12 pb-8">
              <ResponsiveContainer width="100%" height={450}>
                <FunnelChart data={conversionFunnelData} margin={{ top: 10, right: 50, left: 50, bottom: 10 }}>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [formatNumber(Number(value)), "Count"]}
                  />
                  <Funnel dataKey="value" isAnimationActive>
                    <LabelList position="right" fill="#64748b" fontSize={11} fontWeight={800} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-4">
                {conversionFunnelData.map((stage, index) => {
                  const prevValue = index > 0 ? conversionFunnelData[index - 1].value : stage.value
                  const dropRate = index > 0 ? (((prevValue - stage.value) / prevValue) * 100).toFixed(1) : "0"
                  return (
                    <div key={stage.name} className="relative p-4 rounded-2xl bg-white border border-slate-100 shadow-sm group/tile hover:border-primary/20 transition-all">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stage.name}</p>
                      <p className="text-xl font-black text-slate-900">{formatNumber(stage.value)}</p>
                      {index > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full w-fit">
                          <TrendingDown className="h-3 w-3" />
                          {dropRate}% Leak
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
