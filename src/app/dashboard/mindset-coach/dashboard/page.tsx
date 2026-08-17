"use client"

import {
  Users,
  UserPlus,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  UserRound,
  Brain,
  Video,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type MindsetCoachDashboardResponse = {
  totalAssignedPatients: number
  referredPatients: number
  patientDemographics: {
    ageDistribution: Array<{
      range: string
      count: number
    }>
    genderDistribution: Array<{
      gender: string
      count: number
    }>
  }
  completedConsultations: number
  todaysAppointments: number
  pendingConsultations: number
  totalActivities: number
  activeAssignments: number
}

type MindsetCoachDashboardEnvelope = {
  success?: boolean
  message?: string
  data?: MindsetCoachDashboardResponse
}

const genderColors = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"]

function MindsetCoachDashboardSkeleton() {
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <Card key={index} className="border-0 bg-white shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MindsetCoachDashboard() {
  // Mock data for demonstration
  const data: MindsetCoachDashboardResponse = {
    totalAssignedPatients: 45,
    referredPatients: 12,
    patientDemographics: {
      ageDistribution: [
        { range: "18-25", count: 8 },
        { range: "26-35", count: 15 },
        { range: "36-45", count: 12 },
        { range: "46-55", count: 7 },
        { range: "56+", count: 3 },
      ],
      genderDistribution: [
        { gender: "Male", count: 25 },
        { gender: "Female", count: 20 },
      ],
    },
    completedConsultations: 128,
    todaysAppointments: 5,
    pendingConsultations: 8,
    totalActivities: 35,
    activeAssignments: 67,
  }

  const statCards = [
    {
      title: "Assigned Patients",
      value: data.totalAssignedPatients,
      subtitle: "Patients currently under your care",
      icon: Users,
      shell: "from-purple-50 to-violet-50",
      iconShell: "from-purple-500 to-violet-500",
      text: "text-purple-700",
    },
    {
      title: "Referred Patients",
      value: data.referredPatients,
      subtitle: "Patients referred to you",
      icon: UserPlus,
      shell: "from-pink-50 to-rose-50",
      iconShell: "from-pink-500 to-rose-500",
      text: "text-pink-700",
    },
    {
      title: "Today's Appointments",
      value: data.todaysAppointments,
      subtitle: "Scheduled for today",
      icon: Calendar,
      shell: "from-amber-50 to-orange-50",
      iconShell: "from-amber-500 to-orange-500",
      text: "text-amber-700",
    },
    {
      title: "Pending Consultations",
      value: data.pendingConsultations,
      subtitle: "Awaiting action",
      icon: Clock,
      shell: "from-rose-50 to-pink-50",
      iconShell: "from-rose-500 to-pink-500",
      text: "text-rose-700",
    },
    {
      title: "Completed Consultations",
      value: data.completedConsultations,
      subtitle: "Completed overall",
      icon: CheckCircle2,
      shell: "from-emerald-50 to-teal-50",
      iconShell: "from-emerald-500 to-teal-500",
      text: "text-emerald-700",
    },
    {
      title: "Total Activities",
      value: data.totalActivities,
      subtitle: "Mindset activities created",
      icon: Brain,
      shell: "from-cyan-50 to-sky-50",
      iconShell: "from-cyan-500 to-sky-500",
      text: "text-cyan-700",
    },
    {
      title: "Active Assignments",
      value: data.activeAssignments,
      subtitle: "Currently assigned to patients",
      icon: Video,
      shell: "from-indigo-50 to-blue-50",
      iconShell: "from-indigo-500 to-blue-500",
      text: "text-indigo-700",
    },
  ]

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Mindset Coach Dashboard</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Monitor assignments, activities, consultations, and patient demographics from one dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-900/20">
              <Brain className="mr-2 h-4 w-4" />
              Create Activity
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className={`border-0 bg-gradient-to-br ${card.shell} shadow-lg hover:shadow-xl transition-shadow overflow-hidden group`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`flex items-center gap-2 mb-3 ${card.text}`}>
                      <Icon className="h-3 w-3" />
                      <p className="text-[10px] uppercase tracking-[0.15em] font-semibold">{card.title}</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-2">{card.value}</p>
                    <p className={`text-xs font-medium ${card.text}`}>{card.subtitle}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.iconShell} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Age Distribution</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-purple-200 text-purple-700 bg-purple-50">
                {data.patientDemographics.ageDistribution.reduce((sum, item) => sum + item.count, 0)} patients
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] bg-gradient-to-br from-slate-50/50 to-purple-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.patientDemographics.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1">Age Range: {payload[0].payload.range}</p>
                            <p className="text-sm font-bold text-purple-600">Patients: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Gender Distribution</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-pink-200 text-pink-700 bg-pink-50">
                {data.patientDemographics.genderDistribution.length} groups
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[240px] bg-gradient-to-br from-slate-50/50 to-pink-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.patientDemographics.genderDistribution} dataKey="count" nameKey="gender" innerRadius={55} outerRadius={82} paddingAngle={4}>
                    {data.patientDemographics.genderDistribution.map((entry, index) => (
                      <Cell key={`${entry.gender}-${index}`} fill={genderColors[index % genderColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1 capitalize">{String(payload[0].name)}</p>
                            <p className="text-sm font-bold text-slate-900">Patients: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-6">
              {data.patientDemographics.genderDistribution.map((item, index) => (
                <div key={item.gender} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: genderColors[index % genderColors.length] }} />
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-700 capitalize">{item.gender}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
