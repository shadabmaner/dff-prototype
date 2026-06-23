"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, TrendingDown, Download, Target, Activity, FileText } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { dietitianPatients, complianceThreshold } from "../data"

export default function DietitianReportsPage() {
  const stats = useMemo(() => {
    const avg = Math.round(dietitianPatients.reduce((a, p) => a + p.compliancePercentage, 0) / dietitianPatients.length)
    const high = dietitianPatients.filter(p => p.compliancePercentage >= 90).length
    const onTrack = dietitianPatients.filter(p => p.compliancePercentage >= complianceThreshold && p.compliancePercentage < 90).length
    const below = dietitianPatients.filter(p => p.compliancePercentage < complianceThreshold).length
    const totalMedAdherence = Math.round(dietitianPatients.reduce((a, p) => a + p.medicationAdherence, 0) / dietitianPatients.length)
    const totalExercise = Math.round(dietitianPatients.reduce((a, p) => a + p.exerciseCompliance, 0) / dietitianPatients.length)
    return { avg, high, onTrack, below, totalMedAdherence, totalExercise }
  }, [])

  const topPatients = [...dietitianPatients].sort((a, b) => b.compliancePercentage - a.compliancePercentage).slice(0, 5)

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Clinic Portal / Performance Reports</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Track compliance trends, patient outcomes, and performance metrics.</p>
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

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-3 w-3 text-blue-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Avg Diet Compliance</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.avg}%</p>
                <p className="text-xs text-blue-700/80 font-medium">Portfolio-wide</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-3 w-3 text-indigo-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-indigo-700 font-semibold">Avg Med Adherence</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.totalMedAdherence}%</p>
                <p className="text-xs text-indigo-700/80 font-medium">Across all patients</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Avg Exercise Compliance</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.totalExercise}%</p>
                <p className="text-xs text-emerald-700/80 font-medium">Active programs</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Breakdown + Top Patients */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cohort */}
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-700" />
              Cohort Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">Based on {complianceThreshold}% threshold</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {[
              { label: "High Performers", value: stats.high, total: dietitianPatients.length, color: "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500", textColor: "text-emerald-700", badgeBg: "bg-emerald-50 border border-emerald-200" },
              { label: "On Track", value: stats.onTrack, total: dietitianPatients.length, color: "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500", textColor: "text-amber-700", badgeBg: "bg-amber-50 border border-amber-200" },
              { label: "Below Threshold", value: stats.below, total: dietitianPatients.length, color: "[&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-500", textColor: "text-rose-700", badgeBg: "bg-rose-50 border border-rose-200" },
            ].map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-700">{c.label}</p>
                  <Badge className={cn("font-semibold", c.badgeBg, c.textColor)}>
                    {c.value}
                  </Badge>
                </div>
                <Progress value={(c.value / c.total) * 100} className={cn("h-2.5 rounded-full", c.color)} />
                <p className="mt-1 text-xs text-right text-slate-600">{Math.round((c.value / c.total) * 100)}% of cohort</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Patients */}
        <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-700" />
              Top Performers
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">Patients with highest compliance this period</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {topPatients.map((patient, i) => {
              const delta = patient.complianceTrend.at(-1)! - (patient.complianceTrend.at(-2) ?? patient.complianceTrend.at(-1)!)
              return (
                <div key={patient.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50/50 transition-colors">
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
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{patient.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn(
                          "flex items-center gap-1 text-xs font-semibold",
                          delta >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {delta >= 0 ? "+" : ""}{delta}%
                        </span>
                        <span className={cn(
                          "text-sm font-bold",
                          patient.compliancePercentage >= 90 ? "text-emerald-600" :
                            patient.compliancePercentage >= 75 ? "text-amber-600" : "text-rose-600"
                        )}>
                          {patient.compliancePercentage}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={patient.compliancePercentage}
                      className={cn(
                        "mt-2 h-2 rounded-full",
                        patient.compliancePercentage >= 90 ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" :
                          patient.compliancePercentage >= 75 ? "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500" : "[&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-500"
                      )}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
