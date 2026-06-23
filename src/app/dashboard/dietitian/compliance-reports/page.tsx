"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, Gauge, TrendingDown, TrendingUp, AlertCircle, Send } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { complianceThreshold, dietitianPatients } from "../data"

const cohorts = ["All", "Below Threshold", "On Track", "High Performers"] as const

const cohortMeta: Record<string, { label: string; color: string; activeClass: string }> = {
  All: { label: "All", color: "border-slate-200 text-slate-600", activeClass: "bg-slate-900 text-white border-slate-900" },
  "Below Threshold": { label: "Below Threshold", color: "border-rose-200 text-rose-600", activeClass: "bg-rose-600 text-white border-rose-600" },
  "On Track": { label: "On Track", color: "border-amber-200 text-amber-600", activeClass: "bg-amber-500 text-white border-amber-500" },
  "High Performers": { label: "High Performers", color: "border-emerald-200 text-emerald-600", activeClass: "bg-emerald-600 text-white border-emerald-600" },
}

export default function ComplianceReportsPage() {
  const [threshold, setThreshold] = useState(complianceThreshold)
  const [selectedCohort, setSelectedCohort] = useState<(typeof cohorts)[number]>("All")

  const summary = useMemo(() => {
    const below = dietitianPatients.filter((p) => p.compliancePercentage < threshold)
    const onTrack = dietitianPatients.filter((p) => p.compliancePercentage >= threshold && p.compliancePercentage < 90)
    const high = dietitianPatients.filter((p) => p.compliancePercentage >= 90)
    const average = dietitianPatients.reduce((acc, p) => acc + p.compliancePercentage, 0) / dietitianPatients.length
    return { below, onTrack, high, average: Math.round(average) }
  }, [threshold])

  const filteredPatients = useMemo(() => {
    switch (selectedCohort) {
      case "Below Threshold": return summary.below
      case "On Track": return summary.onTrack
      case "High Performers": return summary.high
      default: return dietitianPatients
    }
  }, [selectedCohort, summary])

  const weeklyTrend = useMemo(() => {
    return summary.below.slice(0, 4).map((p) => ({
      label: p.name.split(" ")[0],
      name: p.name,
      current: p.compliancePercentage,
      lastWeek: p.complianceTrend.at(-2) ?? p.compliancePercentage,
      program: p.programName,
    }))
  }, [summary])

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 px-8 py-9 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-32 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-indigo-300">Compliance Intelligence</p>
              <h1 className="text-4xl font-black tracking-tight">Alerts &amp; Performance</h1>
              <p className="mt-2 text-sm text-indigo-200">
                Threshold tuned at <span className="font-bold text-white">{threshold}%</span>. Adjust to trigger new cohort alerts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200 whitespace-nowrap">Threshold %</label>
                <Input
                  type="number"
                  min={40}
                  max={95}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value) || complianceThreshold)}
                  className="h-9 w-20 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-400"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setThreshold(complianceThreshold)}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <SummaryCard
          icon={<Gauge className="h-6 w-6 text-blue-500" />}
          label="Avg Compliance"
          value={`${summary.average}%`}
          badge="Portfolio Average"
          bg="bg-blue-50"
        />
        <SummaryCard
          icon={<TrendingDown className="h-6 w-6 text-rose-500" />}
          label="Below Threshold"
          value={summary.below.length.toString()}
          badge="Needs attention"
          bg="bg-rose-50"
          valueColor="text-rose-600"
        />
        <SummaryCard
          icon={<TrendingUp className="h-6 w-6 text-emerald-500" />}
          label="High Performers"
          value={summary.high.length.toString()}
          badge="≥ 90% compliance"
          bg="bg-emerald-50"
          valueColor="text-emerald-600"
        />
      </motion.div>

      {/* Main Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Table */}
        <Card className="lg:col-span-2 border-none shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  Patient Compliance Table
                </CardTitle>
                <CardDescription className="mt-1">
                  {filteredPatients.length} {selectedCohort === "All" ? "total" : selectedCohort.toLowerCase()} patients showing
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {cohorts.map((cohort) => {
                  const meta = cohortMeta[cohort]
                  const isActive = selectedCohort === cohort
                  return (
                    <button
                      key={cohort}
                      onClick={() => setSelectedCohort(cohort)}
                      className={cn(
                        "rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                        isActive ? meta.activeClass : meta.color + " hover:opacity-80"
                      )}
                    >
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                    <TableHead className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Patient</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Program</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Compliance</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Delta</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => {
                    const delta = patient.complianceTrend.at(-1)! - (patient.complianceTrend.at(-2) ?? patient.complianceTrend.at(-1)!)
                    return (
                      <TableRow key={patient.id} className="hover:bg-slate-50/80">
                        <TableCell>
                          <p className="font-bold text-slate-900">{patient.name}</p>
                          <p className="text-xs text-slate-400">{patient.patientCode}</p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{patient.programName}</TableCell>
                        <TableCell className="min-w-[120px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className={cn(
                                "font-black",
                                patient.compliancePercentage < threshold ? "text-rose-600" :
                                  patient.compliancePercentage >= 90 ? "text-emerald-600" : "text-amber-600"
                              )}>
                                {patient.compliancePercentage}%
                              </span>
                              <span className="text-slate-400">Goal {patient.complianceGoal}%</span>
                            </div>
                            <Progress
                              value={patient.compliancePercentage}
                              className={cn(
                                "h-2",
                                patient.compliancePercentage < threshold ? "[&>div]:bg-rose-500" :
                                  patient.compliancePercentage >= 90 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-amber-500"
                              )}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "flex items-center gap-1 text-sm font-bold",
                            delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-slate-400"
                          )}>
                            {delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : delta < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                            {delta >= 0 ? "+" : ""}{delta}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "border-none font-semibold",
                            patient.compliancePercentage < threshold
                              ? "bg-rose-100 text-rose-600"
                              : patient.compliancePercentage >= 90
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                          )}>
                            {patient.compliancePercentage < threshold ? "Low" : patient.compliancePercentage >= 90 ? "High" : "On track"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend Sidebar */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Low Cohort Trend
            </CardTitle>
            <CardDescription>Prioritize interventions for these patients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyTrend.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 py-10 text-center text-emerald-600">
                <TrendingUp className="h-8 w-8 text-emerald-400" />
                <p className="text-sm font-semibold">No low compliance patients</p>
              </div>
            ) : (
              weeklyTrend.map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{entry.name}</p>
                      <p className="text-xs text-slate-400">{entry.program}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-rose-600">{entry.current}%</p>
                      <p className="text-xs text-slate-400">was {entry.lastWeek}%</p>
                    </div>
                  </div>
                  <Progress value={entry.current} className="mt-3 h-2 [&>div]:bg-rose-500" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Compliance Actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-indigo-600" />
              Compliance Actions
            </CardTitle>
            <CardDescription>Automatic triggers when compliance drops below threshold</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.below.length === 0 ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 py-10 text-emerald-600">
                <TrendingUp className="h-6 w-6" />
                <p className="font-semibold">All patients above threshold — no actions needed!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {summary.below.slice(0, 3).map((patient) => (
                  <div key={patient.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-400">{patient.programName}</p>
                      </div>
                      <Badge className="border-none bg-rose-100 text-rose-600 font-bold">{patient.compliancePercentage}%</Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p>Calorie variance: <span className="font-semibold text-slate-700">{patient.calorieVariance > 0 ? "+" : ""}{patient.calorieVariance} kcal</span></p>
                      <p>Review status: <span className={cn("font-semibold", patient.reviewStatus === "Overdue" ? "text-rose-600" : "text-amber-600")}>{patient.reviewStatus}</span></p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 w-full rounded-xl gap-1.5 hover:border-indigo-500 hover:text-indigo-600">
                      <Send className="h-3.5 w-3.5" />
                      Send Nudge
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function SummaryCard({
  icon, label, value, badge, bg, valueColor = "text-slate-900",
}: {
  icon: React.ReactNode; label: string; value: string; badge: string; bg: string; valueColor?: string
}) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", bg)}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
          <p className={cn("text-3xl font-black tracking-tight", valueColor)}>{value}</p>
          <p className="mt-0.5 text-xs text-slate-400">{badge}</p>
        </div>
      </CardContent>
    </Card>
  )
}
