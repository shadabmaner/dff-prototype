"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Dumbbell, CalendarCheck, BarChart3, Activity, TrendingUp, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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

export default function PhysioDashboardPage() {
  const stats = [
    { title: "Assigned Patients", icon: Users, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100", value: "0", change: "+0%" },
    { title: "Plans Active", icon: Dumbbell, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100", value: "0", change: "None" },
    { title: "Sessions Today", icon: CalendarCheck, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100", value: "0", change: "Scheduled" },
    { title: "Compliance Avg", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50", ring: "ring-violet-100", value: "0%", change: "Stable" },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between px-2"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">Rehabilitation Intelligence</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Physio <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Direct</span></h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Manage assigned patients, track exercise plan adherence, and review session velocity.
          </p>
        </div>
      </motion.div>

      {/* KPI Stats row */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.title} variants={item}>
              <Card className="group fresh-card-alt border-none shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`${s.bg} rounded-2xl p-3.5 ring-1 ${s.ring} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      <Icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black shadow-sm bg-slate-50 text-slate-600">
                      {s.change}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{s.title}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{s.value}</p>
                  </div>
                  <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "25%" }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-pink-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Detail row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2 fresh-card border-none shadow-xl overflow-hidden group">
          <CardHeader className="pb-8 px-8 pt-8">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Recovery Index</CardTitle>
            </div>
            <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Patient rehabilitation progress trends</p>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center justify-center border-t border-slate-100/50 pt-8">
            <div className="text-center opacity-40">
              <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analysis metrics loading...</p>
            </div>
          </CardContent>
        </Card>

        <Card className="fresh-card-alt border-none shadow-xl overflow-hidden group">
          <CardHeader className="pb-4 px-8 pt-8">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="h-4 w-4 text-primary" />
              <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Active Sessions</CardTitle>
            </div>
            <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">Scheduled physical therapy units</p>
          </CardHeader>
          <CardContent className="pt-4 px-8 pb-8 space-y-6 text-center py-20 opacity-30">
            <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No sessions scheduled</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
