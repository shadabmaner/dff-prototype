"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Users,
  ClipboardCheck,
  IndianRupee,
  UserCheck,
  RefreshCw,
  Dumbbell,
  Package,
  Calendar,
  Clock,
  Stethoscope,
  Salad,
} from "lucide-react"

import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCard } from "@/components/service/stats-card"

type ServiceOperationsDashboardResponse = {
  total_patients: number
  pending_assessments: number
  pending_payments: number
  partial_payments: number
  doctor_assignments: number
  dietitian_assignments: number
  fitness_coach_assignments: number
  staff: {
    total: number
    doctors: number
    dietitians: number
    fitness_coaches: number
  }
  kits_dispatched: number
  total_webinars: number
  history_calls_completed: number
  history_calls_upcoming: number
}

type ServiceOperationsDashboardEnvelope = {
  success?: boolean
  message?: string
  data?: ServiceOperationsDashboardResponse
}

function ServiceDashboardSkeleton() {
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
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

      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border border-slate-200/80 bg-white/80 shadow-lg">
            <CardHeader className="p-6 border-b border-slate-100">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ServiceDashboard() {
  const { data, isLoading, isFetching, error, refetch } = useQuery<ServiceOperationsDashboardResponse, Error>({
    queryKey: ["service-operations-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<ServiceOperationsDashboardEnvelope | ServiceOperationsDashboardResponse>("/dashboards/service-operations")
      const payload = response.data

      if (payload && typeof payload === "object" && "data" in payload && payload.data) {
        return payload.data
      }

      if (payload && typeof payload === "object" && "total_patients" in payload) {
        return payload as ServiceOperationsDashboardResponse
      }

      throw new Error("Unable to load service operations dashboard")
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  if (isLoading) {
    return <ServiceDashboardSkeleton />
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

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Service Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Real-time operational overview of patient flow, payments, assignments, staffing, and scheduling.
            </p>
          </div>
          <Button onClick={() => refetch()} className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg">
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={data.total_patients}
          subtitle="All patients in the system"
          icon={Users}
          colorScheme="blue"
        />
        <StatsCard
          title="Pending Assessments"
          value={data.pending_assessments}
          subtitle="Assessment not completed"
          icon={ClipboardCheck}
          colorScheme="amber"
        />
        <StatsCard
          title="Pending Payments"
          value={data.pending_payments}
          subtitle="Payment status pending"
          icon={IndianRupee}
          colorScheme="rose"
        />
        <StatsCard
          title="Partial Payments"
          value={data.partial_payments}
          subtitle="Partially paid patients"
          icon={IndianRupee}
          colorScheme="emerald"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Doctor Assignments"
          value={data.doctor_assignments}
          subtitle="Enrollments with doctor assigned"
          icon={Stethoscope}
          colorScheme="purple"
        />
        <StatsCard
          title="Dietitian Assignments"
          value={data.dietitian_assignments}
          subtitle="Enrollments with dietitian assigned"
          icon={Salad}
          colorScheme="indigo"
        />
        <StatsCard
          title="Fitness Coach Assignments"
          value={data.fitness_coach_assignments}
          subtitle="Enrollments with fitness coach assigned"
          icon={Dumbbell}
          colorScheme="emerald"
        />
        <StatsCard
          title="Kits Dispatched"
          value={data.kits_dispatched}
          subtitle="Supplement kits dispatched"
          icon={Package}
          colorScheme="blue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Staff Availability</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Total Available Staff</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{data.staff.total}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <span className="text-sm text-slate-700">Doctors</span>
                <span className="text-lg font-bold text-slate-900">{data.staff.doctors}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <span className="text-sm text-slate-700">Dietitians</span>
                <span className="text-lg font-bold text-slate-900">{data.staff.dietitians}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <span className="text-sm text-slate-700">Fitness Coaches</span>
                <span className="text-lg font-bold text-slate-900">{data.staff.fitness_coaches}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Scheduling Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Total Webinars</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{data.total_webinars}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-4 border border-amber-100">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium text-slate-700">Upcoming History Calls</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{data.history_calls_upcoming}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-4 border border-emerald-100">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">Completed History Calls</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{data.history_calls_completed}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Operations Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <span className="text-sm text-slate-700">Pending Assessments</span>
              <span className="text-lg font-bold text-slate-900">{data.pending_assessments}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <span className="text-sm text-slate-700">Pending Payments</span>
              <span className="text-lg font-bold text-slate-900">{data.pending_payments}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <span className="text-sm text-slate-700">Partial Payments</span>
              <span className="text-lg font-bold text-slate-900">{data.partial_payments}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <span className="text-sm text-slate-700">Kits Dispatched</span>
              <span className="text-lg font-bold text-slate-900">{data.kits_dispatched}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
