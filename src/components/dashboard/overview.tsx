"use client"

import * as React from "react"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { motion } from "framer-motion"
import {
  Users,
  TrendingUp,
  IndianRupee,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  Heart,
  Zap,
  Sparkles,
  ChevronRight,
  Filter,
  Plus
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const revenueData = [
  { month: "Jan", revenue: 420000, leads: 38, enrollments: 22 },
  { month: "Feb", revenue: 380000, leads: 42, enrollments: 19 },
  { month: "Mar", revenue: 510000, leads: 55, enrollments: 31 },
  { month: "Apr", revenue: 470000, leads: 48, enrollments: 27 },
  { month: "May", revenue: 620000, leads: 67, enrollments: 40 },
  { month: "Jun", revenue: 590000, leads: 61, enrollments: 36 },
  { month: "Jul", revenue: 710000, leads: 74, enrollments: 48 },
  { month: "Aug", revenue: 680000, leads: 70, enrollments: 45 },
  { month: "Sep", revenue: 750000, leads: 82, enrollments: 53 },
  { month: "Oct", revenue: 820000, leads: 88, enrollments: 60 },
  { month: "Nov", revenue: 790000, leads: 85, enrollments: 57 },
  { month: "Dec", revenue: 910000, leads: 95, enrollments: 68 },
]

const patientStatusData = [
  { name: "Active", value: 420, color: "hsl(var(--primary))" },
  { name: "Completed", value: 280, color: "#3b82f6" },
  { name: "On Hold", value: 95, color: "#94a3b8" },
  { name: "Dropped", value: 48, color: "#f43f5e" },
]

const weeklyLeadsData = [
  { day: "Mon", new: 12, converted: 8, lost: 2 },
  { day: "Tue", new: 18, converted: 11, lost: 3 },
  { day: "Wed", new: 15, converted: 9, lost: 4 },
  { day: "Thu", new: 22, converted: 14, lost: 3 },
  { day: "Fri", new: 19, converted: 12, lost: 5 },
  { day: "Sat", new: 8, converted: 5, lost: 1 },
  { day: "Sun", new: 6, converted: 4, lost: 0 },
]

const recentActivities = [
  {
    id: 1,
    type: "enrollment",
    title: "New patient enrolled",
    description: "Rajesh Kumar enrolled in Diabetes Management Program",
    time: "2 min ago",
    status: "completed",
  },
  {
    id: 2,
    type: "lead",
    title: "Lead converted to sale",
    description: "Priya Sharma converted — ₹48,000 deal closed by Arjun",
    time: "18 min ago",
    status: "completed",
  },
  {
    id: 3,
    type: "appointment",
    title: "Appointment missed",
    description: "Dr. Mehta — Patient Suresh Patel missed consultation",
    time: "45 min ago",
    status: "missed",
  },
  {
    id: 4,
    type: "payment",
    title: "Payment overdue",
    description: "Installment ₹12,000 due from Anita Desai (3 days overdue)",
    time: "1 hr ago",
    status: "overdue",
  },
  {
    id: 5,
    type: "prescription",
    title: "Prescription dispatched",
    description: "Monthly medication pack dispatched to Vikram Nair",
    time: "2 hrs ago",
    status: "completed",
  },
  {
    id: 6,
    type: "webinar",
    title: "Webinar completed",
    description: "Weight Loss Masterclass — 84 attendees, 12 leads captured",
    time: "3 hrs ago",
    status: "completed",
  },
  {
    id: 7,
    type: "enrollment",
    title: "Program renewal",
    description: "Deepa Nair renewed Thyroid Care Plan for 6 months",
    time: "4 hrs ago",
    status: "pending",
  },
]

const trendStats = [
  { label: "Lead → Enroll Rate", value: "34.2%", change: "+4.1%", up: true },
  { label: "Avg. Revenue / Patient", value: "₹52,400", change: "+8.3%", up: true },
  { label: "Churn Rate", value: "5.7%", change: "-1.2%", up: false },
  { label: "NPS Score", value: "72", change: "+5pts", up: true },
]

const stats = [
  {
    title: "Total Patients",
    value: "1,843",
    change: "+12.5%",
    up: true,
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    ringColor: "ring-indigo-100",
  },
  {
    title: "Active Leads",
    value: "384",
    change: "+8.2%",
    up: true,
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ringColor: "ring-blue-100",
  },
  {
    title: "Monthly Revenue",
    value: "₹9.1L",
    change: "+15.3%",
    up: true,
    icon: IndianRupee,
    color: "text-primary",
    bg: "bg-primary/10",
    ringColor: "ring-primary/20",
  },
  {
    title: "Appointments Today",
    value: "47",
    change: "-3.1%",
    up: false,
    icon: CalendarCheck,
    color: "text-sky-600",
    bg: "bg-sky-50",
    ringColor: "ring-sky-100",
  },
]

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50", label: "Completed", badge: "default" as const },
  missed: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Missed", badge: "destructive" as const },
  overdue: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", label: "Overdue", badge: "outline" as const },
  pending: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50", label: "Pending", badge: "secondary" as const },
}

function formatINR(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
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

export function DashboardOverview() {
  return (
    <div className="space-y-8 pb-10">
      {/* Premium High-Fidelity Header */}
      <section className="px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2.25rem] bg-[#041128] px-6 py-8 md:px-12 md:py-12 shadow-2xl border border-white/5"
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute -top-16 left-10 h-48 w-48 rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/10 blur-[140px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
                backgroundSize: "38px 38px"
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 border border-white/10">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.35em] text-white/70 leading-none">Governance</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Catalogue Core</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Platform <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent">Specialities</span>
              </h1>
              <p className="text-sm md:text-base font-medium text-slate-300 max-w-2xl">
                Orchestrate clinical service lines and market availability across the care ecosystem.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 px-6 h-11 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-white/10"
              >
                <Filter className="mr-2 h-4 w-4" /> Active Only
              </Button>
              <Button className="rounded-full bg-primary px-7 h-11 text-[10px] font-black uppercase tracking-[0.35em] text-white shadow-lg shadow-primary/30 hover:scale-[1.01]">
                <Plus className="mr-2 h-4 w-4" /> New Speciality
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats row with overlap */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 -mt-16 relative z-20 px-4 md:px-10"
      >
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <motion.div key={s.title} variants={item}>
              <Card className="group fresh-card-alt border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-3 overflow-hidden rounded-[2rem]">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div className={cn(
                      "rounded-2xl p-4 ring-1 ring-inset transition-all duration-700 group-hover:rotate-[10deg] shadow-lg",
                      s.bg,
                      s.ringColor,
                      "group-hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]"
                    )}>
                      <Icon className={cn("h-7 w-7", s.color)} />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black transition-colors duration-300",
                      s.up ? "bg-blue-500/10 text-blue-600" : "bg-rose-500/10 text-rose-600"
                    )}>
                      {s.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      <span className="tracking-tight">{s.change}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{s.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{s.value}</p>
                    </div>
                  </div>
                  <div className="mt-8 h-1.5 w-full bg-slate-100/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: s.up ? "78%" : "42%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className={cn("h-full rounded-full bg-gradient-to-r shadow-sm", s.up ? "from-blue-400 via-blue-500 to-indigo-500" : "from-rose-400 via-rose-500 to-pink-500")}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts row */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-6 lg:grid-cols-3 px-4 md:px-8"
      >
        {/* Financial velocity — 2/3 width */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full fresh-card-alt border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden rounded-[2.5rem] group">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 px-10 pt-10">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Financial Velocity</CardTitle>
                </div>
                <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.25em]">12-month automated projection model</p>
              </div>
              <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-100/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200/50 transition-all">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Revenue</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/50 transition-all cursor-pointer">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-8 pt-10">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="enrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 800 }}
                    axisLine={false}
                    tickLine={false}
                    dy={12}
                  />
                  <YAxis
                    yAxisId="rev"
                    orientation="left"
                    tickFormatter={formatINR}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 800 }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 24,
                      border: "none",
                      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(12px)",
                      padding: "16px"
                    }}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                    itemStyle={{ fontWeight: 900, textTransform: "uppercase", fontSize: 10, padding: "4px 0" }}
                  />
                  <Area
                    yAxisId="rev"
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={5}
                    fill="url(#revGrad)"
                    dot={false}
                    activeDot={{ r: 8, strokeWidth: 4, fill: "#fff", stroke: "hsl(var(--primary))" }}
                  />
                  <Area
                    yAxisId="rev"
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#3b82f6"
                    strokeWidth={5}
                    fill="url(#enrGrad)"
                    dot={false}
                    activeDot={{ r: 8, strokeWidth: 4, fill: "#fff", stroke: "#3b82f6" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Patient lifecycle donut — 1/3 width */}
        <motion.div variants={item}>
          <Card className="h-full fresh-card-alt border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden rounded-[2.5rem] group">
            <CardHeader className="pb-0 px-10 pt-10">
              <div className="flex items-center gap-2.5 mb-2">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20" />
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Lifecycle</CardTitle>
              </div>
              <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.25em]">Treatment status saturation</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-8 pb-10 px-10">
              <div className="relative group/donut">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={patientStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {patientStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 24, border: "none", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", padding: "12px 20px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover/donut:scale-110 transition-transform duration-700">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">843</span>
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Active Cases</span>
                </div>
              </div>
              <div className="mt-10 w-full space-y-4">
                {patientStatusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-[13px] group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full shadow-lg group-hover/item:scale-150 transition-transform duration-300" style={{ background: d.color }} />
                      <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">{d.name}</span>
                    </div>
                    <span className="font-black text-slate-900 tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Weekly leads bar + Recent activities */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-6 lg:grid-cols-3 px-4 md:px-8"
      >
        {/* Weekly leads bar chart */}
        <motion.div variants={item}>
          <Card className="h-full fresh-card-alt border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden rounded-[2.5rem] group">
            <CardHeader className="pb-0 px-10 pt-10">
              <div className="flex items-center gap-2.5 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Lead Flow</CardTitle>
              </div>
              <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.25em]">Weekly conversion throughput</p>
            </CardHeader>
            <CardContent className="px-6 pb-8 pt-12">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyLeadsData} barSize={12} barGap={6} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="8 8" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 800 }} axisLine={false} tickLine={false} dy={12} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 800 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', radius: 10 }}
                    contentStyle={{ borderRadius: 24, border: "none", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", fontWeight: 900, fontSize: 11 }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontWeight: 900, paddingBottom: 32, textTransform: "uppercase", letterSpacing: "0.2em", color: "#94a3b8" }}
                  />
                  <Bar dataKey="new" name="New" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="converted" name="Won" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="lost" name="Lost" fill="#f43f5e" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent activities */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full fresh-card-alt border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden rounded-[2.5rem] group">
            <CardHeader className="flex flex-row items-center justify-between pb-6 px-10 pt-10 border-b border-slate-100/50">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Zap className="h-5 w-5 text-blue-500 fill-blue-500/20" />
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Feed</CardTitle>
                </div>
                <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.25em]">Real-time operational stream</p>
              </div>
              <Button variant="ghost" className="hidden sm:flex text-[10px] font-black text-primary hover:bg-primary/5 uppercase tracking-[0.2em] px-6 h-10 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                Full Archive <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-8 px-6">
              <div className="space-y-4 px-4">
                {recentActivities.slice(0, 5).map((act, idx) => {
                  const cfg = statusConfig[act.status as keyof typeof statusConfig]
                  const Icon = cfg.icon
                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group/act flex items-center gap-6 p-5 rounded-[1.75rem] border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-500"
                    >
                      <div className={cn("shrink-0 rounded-2xl p-4 ring-1 ring-inset ring-slate-100 transition-all duration-500 group-hover/act:scale-110 group-hover/act:rotate-[5deg]", cfg.bg)}>
                        <Icon className={cn("h-6 w-6", cfg.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <p className="truncate text-base font-black text-slate-900 tracking-tight">{act.title}</p>
                          <span className="shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{act.time}</span>
                        </div>
                        <p className="truncate text-sm text-slate-500 font-medium leading-relaxed">{act.description}</p>
                      </div>
                      <Badge
                        variant={cfg.badge}
                        className="hidden md:flex shrink-0 text-[9px] px-4 py-1 h-7 font-black tracking-[0.2em] uppercase border-none bg-slate-50 text-slate-400 group-hover/act:bg-primary/10 group-hover/act:text-primary transition-all duration-300 rounded-full"
                      >
                        {cfg.label}
                      </Badge>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Key Trends Section */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="px-4 md:px-10 mt-12 pb-20"
      >
        <div className="mb-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 rounded-full bg-primary shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Efficiency Indices</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Benchmark Analytics</p>
            </div>
          </div>
          <Button variant="outline" className="hidden sm:flex rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest px-6 h-11 hover:bg-slate-50 transition-all">
            Refresh Metrics
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trendStats.map((t) => (
            <motion.div key={t.label} variants={item}>
              <Card className="fresh-card-alt border-none shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all duration-500 rounded-[2rem] overflow-hidden group">
                <CardContent className="p-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 group-hover:text-primary transition-colors">{t.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{t.value}</p>
                    <div className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black shadow-sm transition-all duration-300",
                      t.up ? "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white" : "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500 group-hover:text-white"
                    )}>
                      {t.up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span className="tracking-tight">{t.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
