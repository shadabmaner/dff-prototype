"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, Column } from "@/components/service/data-table"
import { StatsCard } from "@/components/service/stats-card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Activity, Utensils, Dumbbell, Droplets, Scale } from "lucide-react"
import type { AppLog } from "@/types/service"

const mockLogs: AppLog[] = [
  {
    id: "L001",
    patientId: "PT001",
    patientName: "Rahul Kumar",
    activityType: "meal_log",
    details: "Breakfast - Oatmeal with fruits",
    date: "2026-03-11T08:30:00Z",
    status: "success"
  },
  {
    id: "L002",
    patientId: "PT001",
    patientName: "Rahul Kumar",
    activityType: "workout_log",
    details: "30 min cardio workout",
    date: "2026-03-11T07:00:00Z",
    status: "success"
  },
  {
    id: "L003",
    patientId: "PT002",
    patientName: "Priya Sharma",
    activityType: "water_intake",
    details: "2L water logged",
    date: "2026-03-11T09:15:00Z",
    status: "success"
  },
  {
    id: "L004",
    patientId: "PT003",
    patientName: "Amit Verma",
    activityType: "weight_update",
    details: "Weight: 85kg",
    date: "2026-03-11T06:30:00Z",
    status: "success"
  },
  {
    id: "L005",
    patientId: "PT002",
    patientName: "Priya Sharma",
    activityType: "app_login",
    details: "User logged in",
    date: "2026-03-11T08:00:00Z",
    status: "success"
  }
]

export default function AppLogsPage() {
  const [logs, setLogs] = useState<AppLog[]>(mockLogs)
  const [filterActivity, setFilterActivity] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "meal_log":
        return <Utensils className="h-4 w-4 text-emerald-600" />
      case "workout_log":
        return <Dumbbell className="h-4 w-4 text-blue-600" />
      case "water_intake":
        return <Droplets className="h-4 w-4 text-cyan-600" />
      case "weight_update":
        return <Scale className="h-4 w-4 text-purple-600" />
      case "app_login":
        return <Smartphone className="h-4 w-4 text-slate-600" />
      default:
        return <Activity className="h-4 w-4 text-slate-600" />
    }
  }

  const columns: Column<AppLog>[] = [
    {
      header: "Log ID",
      accessorKey: "id",
    },
    {
      header: "Patient",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.patientName}</p>
          <p className="text-xs text-slate-500">{row.patientId}</p>
        </div>
      ),
    },
    {
      header: "Activity Type",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {getActivityIcon(row.activityType)}
          <span className="text-sm capitalize">{row.activityType.replace(/_/g, " ")}</span>
        </div>
      ),
    },
    {
      header: "Details",
      cell: (row) => (
        <p className="text-sm text-slate-700">{row.details || "N/A"}</p>
      ),
    },
    {
      header: "Date & Time",
      cell: (row) => (
        <div>
          <p className="text-sm text-slate-900">{new Date(row.date).toLocaleDateString()}</p>
          <p className="text-xs text-slate-500">{new Date(row.date).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge className={
          row.status === "success" 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : row.status === "failed"
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
  ]

  const filteredLogs = logs.filter(log => {
    const activityMatch = filterActivity === "all" || log.activityType === filterActivity
    const statusMatch = filterStatus === "all" || log.status === filterStatus
    return activityMatch && statusMatch
  })

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Mobile App Logs
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Mobile App Logs
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Track patient activity from mobile application
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Logs"
          value="1,248"
          subtitle="All activities"
          icon={Activity}
          colorScheme="blue"
        />
        <StatsCard
          title="Meal Logs"
          value="456"
          subtitle="Today"
          icon={Utensils}
          colorScheme="emerald"
        />
        <StatsCard
          title="Workout Logs"
          value="324"
          subtitle="Today"
          icon={Dumbbell}
          colorScheme="purple"
        />
        <StatsCard
          title="Water Intake"
          value="289"
          subtitle="Today"
          icon={Droplets}
          colorScheme="indigo"
        />
        <StatsCard
          title="App Logins"
          value="512"
          subtitle="Today"
          icon={Smartphone}
          colorScheme="amber"
        />
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Activity Logs</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterActivity} onValueChange={setFilterActivity}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="meal_log">Meal Logs</SelectItem>
                  <SelectItem value="workout_log">Workout Logs</SelectItem>
                  <SelectItem value="water_intake">Water Intake</SelectItem>
                  <SelectItem value="weight_update">Weight Updates</SelectItem>
                  <SelectItem value="app_login">App Logins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable
            data={filteredLogs}
            columns={columns}
            searchPlaceholder="Search logs by patient or activity..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
