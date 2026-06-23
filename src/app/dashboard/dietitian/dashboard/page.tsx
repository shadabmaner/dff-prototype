"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Users,
  ClipboardList,
  Calendar,
  CheckCircle2,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart3,
  UserRound,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type DietitianDashboardResponse = {
  overview: {
    totalPatientsAssigned: number
    totalDietTemplatesAvailable: number
    totalDietPlansAssigned: number
  }
  appointments: {
    todaysAppointments: number
    pendingConsultationRequests: number
    completedConsultations: number
  }
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
}

type DietitianDashboardApiEnvelope = {
  success?: boolean
  message?: string
  data?: DietitianDashboardResponse
  overview?: DietitianDashboardResponse["overview"]
  appointments?: DietitianDashboardResponse["appointments"]
  patientDemographics?: DietitianDashboardResponse["patientDemographics"]
}

const genderColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e"]

function DietitianDashboardSkeleton() {
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border-0 bg-white shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-32" />
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

export default function NutritionistDashboard() {
  const { data, isLoading, isFetching, error, refetch } = useQuery<DietitianDashboardResponse, Error>({
    queryKey: ["dietitian-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<DietitianDashboardApiEnvelope>("/dashboards/dietitian")
      const payload = response.data

      if (payload?.data) {
        return payload.data
      }

      if (payload?.overview && payload?.appointments && payload?.patientDemographics) {
        return {
          overview: payload.overview,
          appointments: payload.appointments,
          patientDemographics: payload.patientDemographics,
        }
      }

      throw new Error(payload?.message ?? "Unable to load dietitian dashboard")
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })

  if (isLoading) {
    return <DietitianDashboardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
        <Card className="border border-rose-200 bg-white shadow-lg">
          <CardContent className="flex flex-col items-start gap-4 p-6">
            <Badge className="bg-rose-50 text-rose-700 border border-rose-200">Unable to load dashboard</Badge>
            <p className="text-sm text-slate-600">{error?.message ?? "Something went wrong while fetching dashboard data."}</p>
            <Button onClick={() => refetch()} className="bg-slate-900 hover:bg-slate-800 text-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Patients Assigned",
      value: data.overview.totalPatientsAssigned,
      subtitle: "Assigned under your care",
      icon: Users,
      shell: "from-blue-50 to-indigo-50",
      iconShell: "from-blue-500 to-indigo-500",
      text: "text-blue-700",
    },
    {
      title: "Diet Templates Available",
      value: data.overview.totalDietTemplatesAvailable,
      subtitle: "Templates ready for planning",
      icon: ClipboardList,
      shell: "from-emerald-50 to-teal-50",
      iconShell: "from-emerald-500 to-teal-500",
      text: "text-emerald-700",
    },
    {
      title: "Diet Plans Assigned",
      value: data.overview.totalDietPlansAssigned,
      subtitle: "Plans active across patients",
      icon: CheckCircle2,
      shell: "from-violet-50 to-purple-50",
      iconShell: "from-violet-500 to-purple-500",
      text: "text-violet-700",
    },
    {
      title: "Today's Appointments",
      value: data.appointments.todaysAppointments,
      subtitle: "Scheduled for today",
      icon: Calendar,
      shell: "from-amber-50 to-orange-50",
      iconShell: "from-amber-500 to-orange-500",
      text: "text-amber-700",
    },
    {
      title: "Pending Consultations",
      value: data.appointments.pendingConsultationRequests,
      subtitle: "Awaiting action",
      icon: ClipboardList,
      shell: "from-rose-50 to-pink-50",
      iconShell: "from-rose-500 to-pink-500",
      text: "text-rose-700",
    },
    {
      title: "Completed Consultations",
      value: data.appointments.completedConsultations,
      subtitle: "Completed overall",
      icon: CheckCircle2,
      shell: "from-cyan-50 to-sky-50",
      iconShell: "from-cyan-500 to-sky-500",
      text: "text-cyan-700",
    },
  ]

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Dietitian Dashboard</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Track assigned patients, diet plans, appointments, and patient demographics from a single dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => refetch()} className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
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
              <Badge variant="outline" className="text-xs font-semibold border-blue-200 text-blue-700 bg-blue-50">
                {data.patientDemographics.ageDistribution.reduce((sum, item) => sum + item.count, 0)} patients
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
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
                            <p className="text-sm font-bold text-blue-600">Patients: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#3b82f6" />
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
              <Badge variant="outline" className="text-xs font-semibold border-emerald-200 text-emerald-700 bg-emerald-50">
                {data.patientDemographics.genderDistribution.length} groups
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[240px] bg-gradient-to-br from-slate-50/50 to-emerald-50/30 rounded-xl p-4">
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
