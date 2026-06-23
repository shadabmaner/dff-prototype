"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  Users,
  Layers,
  RefreshCw,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Types
interface ResourceUtilization {
  name: string
  type: "Doctor" | "Dietitian" | "Coach"
  currentLoad: number
  maxCapacity: number
  utilization: number
  trend: "up" | "down" | "stable"
}

interface CapacityForecast {
  week: string
  doctorCapacity: number
  dietitianCapacity: number
  coachCapacity: number
  patientDemand: number
}

interface Bottleneck {
  resource: string
  type: string
  severity: "High" | "Medium" | "Low"
  description: string
  suggestedAction: string
}

// Mock Data
const mockDoctorUtilization: ResourceUtilization[] = [
  { name: "Dr. Bhagyesh Kulkarni", type: "Doctor", currentLoad: 95, maxCapacity: 120, utilization: 79, trend: "up" },
  { name: "Dr. Amit Patel", type: "Doctor", currentLoad: 80, maxCapacity: 120, utilization: 67, trend: "stable" },
  { name: "Dr. Suresh Kumar", type: "Doctor", currentLoad: 110, maxCapacity: 120, utilization: 92, trend: "up" },
]

const mockDietitianUtilization: ResourceUtilization[] = [
  { name: "Dr. Priya Sharma", type: "Dietitian", currentLoad: 85, maxCapacity: 100, utilization: 85, trend: "up" },
  { name: "Dr. Neha Gupta", type: "Dietitian", currentLoad: 70, maxCapacity: 100, utilization: 70, trend: "stable" },
  { name: "Dr. Anjali Singh", type: "Dietitian", currentLoad: 95, maxCapacity: 100, utilization: 95, trend: "up" },
]

const mockCoachUtilization: ResourceUtilization[] = [
  { name: "Coach Rahul Verma", type: "Coach", currentLoad: 75, maxCapacity: 80, utilization: 94, trend: "up" },
  { name: "Coach Sneha Joshi", type: "Coach", currentLoad: 60, maxCapacity: 80, utilization: 75, trend: "stable" },
  { name: "Coach Vikram Singh", type: "Coach", currentLoad: 78, maxCapacity: 80, utilization: 98, trend: "up" },
]

const mockCapacityForecast: CapacityForecast[] = [
  { week: "Week 1", doctorCapacity: 360, dietitianCapacity: 300, coachCapacity: 240, patientDemand: 280 },
  { week: "Week 2", doctorCapacity: 360, dietitianCapacity: 300, coachCapacity: 240, patientDemand: 320 },
  { week: "Week 3", doctorCapacity: 360, dietitianCapacity: 300, coachCapacity: 240, patientDemand: 350 },
  { week: "Week 4", doctorCapacity: 360, dietitianCapacity: 300, coachCapacity: 240, patientDemand: 380 },
]

const mockBottlenecks: Bottleneck[] = [
  {
    resource: "Coach Vikram Singh",
    type: "Coach",
    severity: "High",
    description: "98% utilization - nearing maximum capacity",
    suggestedAction: "Consider adding new coach or redistributing workload",
  },
  {
    resource: "Dr. Anjali Singh",
    type: "Dietitian",
    severity: "High",
    description: "95% utilization - high workload",
    suggestedAction: "Review patient assignments and consider redistribution",
  },
  {
    resource: "Dr. Suresh Kumar",
    type: "Doctor",
    severity: "Medium",
    description: "92% utilization - approaching capacity",
    suggestedAction: "Monitor closely and plan for additional resources",
  },
]

export default function CapacityPlanningPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [selectedResource, setSelectedResource] = useState("all")

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "bg-red-500"
    if (utilization >= 70) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200"
      case "Medium":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "Low":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const renderUtilizationCard = (resource: ResourceUtilization) => (
    <motion.div
      key={resource.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-slate-50 rounded-xl border border-slate-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-slate-900">{resource.name}</p>
          <p className="text-xs text-slate-500">{resource.type}</p>
        </div>
        <div className="flex items-center gap-1">
          {resource.trend === "up" && <ArrowUp className="h-3 w-3 text-red-500" />}
          {resource.trend === "down" && <ArrowDown className="h-3 w-3 text-emerald-500" />}
          {resource.trend === "stable" && <Activity className="h-3 w-3 text-slate-400" />}
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500">Utilization</span>
            <span className="text-[10px] font-bold text-slate-900">{resource.utilization}%</span>
          </div>
          <Progress value={resource.utilization} className="h-2" />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Load: {resource.currentLoad}</span>
          <span>Max: {resource.maxCapacity}</span>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Service Operations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Capacity <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Planning Dashboard</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Operational forecasting and resource utilization analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-10 w-32 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Resource Utilization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Doctor Utilization */}
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              Doctor Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {mockDoctorUtilization.map((resource) => renderUtilizationCard(resource))}
            </div>
          </CardContent>
        </Card>

        {/* Dietitian Utilization */}
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-pink-600" />
              Dietitian Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {mockDietitianUtilization.map((resource) => renderUtilizationCard(resource))}
            </div>
          </CardContent>
        </Card>

        {/* Coach Utilization */}
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-600" />
              Coach Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {mockCoachUtilization.map((resource) => renderUtilizationCard(resource))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Forecast */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Capacity Forecast - Next 30 Days
          </CardTitle>
          <CardDescription>
            Projected capacity vs patient demand
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockCapacityForecast.map((forecast, index) => (
              <motion.div
                key={forecast.week}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">{forecast.week}</h4>
                  <Badge className={cn("text-[10px] font-semibold border", forecast.patientDemand > forecast.doctorCapacity ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200")}>
                    {forecast.patientDemand > forecast.doctorCapacity ? "Over Capacity" : "Within Capacity"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-600">Doctor Capacity</span>
                      <span className="text-[10px] font-bold text-slate-900">{forecast.doctorCapacity}</span>
                    </div>
                    <Progress value={(forecast.doctorCapacity / 400) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-600">Dietitian Capacity</span>
                      <span className="text-[10px] font-bold text-slate-900">{forecast.dietitianCapacity}</span>
                    </div>
                    <Progress value={(forecast.dietitianCapacity / 400) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-600">Coach Capacity</span>
                      <span className="text-[10px] font-bold text-slate-900">{forecast.coachCapacity}</span>
                    </div>
                    <Progress value={(forecast.coachCapacity / 400) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-600">Patient Demand</span>
                      <span className="text-[10px] font-bold text-slate-900">{forecast.patientDemand}</span>
                    </div>
                    <Progress value={(forecast.patientDemand / 400) * 100} className="h-2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Bottlenecks */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Resource Bottlenecks
          </CardTitle>
          <CardDescription>
            Resources approaching or exceeding capacity
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockBottlenecks.map((bottleneck, index) => (
              <motion.div
                key={bottleneck.resource}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-amber-50 to-slate-50 rounded-xl border border-amber-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900">{bottleneck.resource}</h4>
                      <Badge className={cn("text-[10px] font-semibold border", getSeverityColor(bottleneck.severity))}>
                        {bottleneck.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{bottleneck.type}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-2">{bottleneck.description}</p>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500">
                    <span className="font-semibold">Suggested Action:</span> {bottleneck.suggestedAction}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Batch Capacity */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Upcoming Batch Capacity
          </CardTitle>
          <CardDescription>
            Capacity availability for upcoming batches
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Available Slots</p>
                  <p className="text-2xl font-bold text-slate-900">150</p>
                </div>
              </div>
              <p className="text-[10px] text-emerald-600">Across all resources</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">This Week</p>
                  <p className="text-2xl font-bold text-slate-900">45</p>
                </div>
              </div>
              <p className="text-[10px] text-blue-600">New enrollments expected</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Doctors</p>
                  <p className="text-2xl font-bold text-slate-900">3</p>
                </div>
              </div>
              <p className="text-[10px] text-purple-600">Available for assignment</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">At Risk</p>
                  <p className="text-2xl font-bold text-slate-900">2</p>
                </div>
              </div>
              <p className="text-[10px] text-amber-600">Resources near capacity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
