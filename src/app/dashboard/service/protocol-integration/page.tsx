"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Stethoscope,
  Utensils,
  Dumbbell,
  Activity,
  Layers,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Play,
  Settings,
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
type Program = "Diabetes Free Forever" | "Thyroid Free Forever" | "Healthy BMI"
type ActivityStatus = "Completed" | "In Progress" | "Pending" | "Upcoming"

interface ProtocolActivity {
  id: string
  name: string
  type: "Consultation" | "Lab Review" | "Progress Review" | "Welcome Session"
  status: ActivityStatus
  scheduledDate: string
  assignedTo: string
}

interface ProtocolMonth {
  month: number
  name: string
  activities: ProtocolActivity[]
  progress: number
}

interface BatchProtocol {
  id: string
  batchName: string
  program: Program
  protocolMonths: ProtocolMonth[]
}

// Mock Data
const mockBatchProtocols: BatchProtocol[] = [
  {
    id: "1",
    batchName: "DFF-DIA-JAN-001",
    program: "Diabetes Free Forever",
    protocolMonths: [
      {
        month: 1,
        name: "Month 1 - Onboarding",
        progress: 100,
        activities: [
          { id: "1", name: "Welcome Session", type: "Welcome Session", status: "Completed", scheduledDate: "2026-01-15", assignedTo: "Service Executive" },
          { id: "2", name: "Doctor Consultation", type: "Consultation", status: "Completed", scheduledDate: "2026-01-18", assignedTo: "Dr. Bhagyesh Kulkarni" },
          { id: "3", name: "Dietitian Consultation", type: "Consultation", status: "Completed", scheduledDate: "2026-01-20", assignedTo: "Dr. Priya Sharma" },
          { id: "4", name: "Lab Review", type: "Lab Review", status: "Completed", scheduledDate: "2026-01-25", assignedTo: "Dr. Bhagyesh Kulkarni" },
        ],
      },
      {
        month: 2,
        name: "Month 2 - Foundation",
        progress: 75,
        activities: [
          { id: "5", name: "Progress Review", type: "Progress Review", status: "Completed", scheduledDate: "2026-02-10", assignedTo: "Dr. Bhagyesh Kulkarni" },
          { id: "6", name: "Diet Plan Adjustment", type: "Consultation", status: "In Progress", scheduledDate: "2026-02-15", assignedTo: "Dr. Priya Sharma" },
          { id: "7", name: "Fitness Assessment", type: "Consultation", status: "Pending", scheduledDate: "2026-02-20", assignedTo: "Coach Rahul Verma" },
          { id: "8", name: "Lab Review", type: "Lab Review", status: "Pending", scheduledDate: "2026-02-25", assignedTo: "Dr. Bhagyesh Kulkarni" },
        ],
      },
      {
        month: 3,
        name: "Month 3 - Progress",
        progress: 25,
        activities: [
          { id: "9", name: "Progress Review", type: "Progress Review", status: "Upcoming", scheduledDate: "2026-03-10", assignedTo: "Dr. Bhagyesh Kulkarni" },
          { id: "10", name: "Diet Plan Adjustment", type: "Consultation", status: "Upcoming", scheduledDate: "2026-03-15", assignedTo: "Dr. Priya Sharma" },
          { id: "11", name: "Fitness Assessment", type: "Consultation", status: "Upcoming", scheduledDate: "2026-03-20", assignedTo: "Coach Rahul Verma" },
          { id: "12", name: "Lab Review", type: "Lab Review", status: "Upcoming", scheduledDate: "2026-03-25", assignedTo: "Dr. Bhagyesh Kulkarni" },
        ],
      },
    ],
  },
]

export default function ProtocolIntegrationPage() {
  const [selectedBatch, setSelectedBatch] = useState<BatchProtocol | null>(mockBatchProtocols[0])
  const [selectedMonth, setSelectedMonth] = useState<number>(1)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Consultation":
        return <Stethoscope className="h-4 w-4" />
      case "Lab Review":
        return <Activity className="h-4 w-4" />
      case "Progress Review":
        return <TrendingUp className="h-4 w-4" />
      case "Welcome Session":
        return <Calendar className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "Consultation":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Lab Review":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Progress Review":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Welcome Session":
        return "bg-amber-100 text-amber-700 border-amber-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "Upcoming":
        return "bg-slate-100 text-slate-700 border-slate-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getStatusIcon = (status: ActivityStatus) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-3 w-3" />
      case "In Progress":
        return <Clock className="h-3 w-3" />
      case "Pending":
        return <AlertCircle className="h-3 w-3" />
      case "Upcoming":
        return <Calendar className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

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
            Protocol <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Integration Preview</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Future integration section showing how batches are linked to protocol execution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <Settings className="h-4 w-4 mr-2" />
            Configure Protocol
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-primary text-white">
            <Play className="h-4 w-4 mr-2" />
            Sync Protocol
          </Button>
        </div>
      </div>

      {/* Batch Selection */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Select Batch</CardTitle>
          <CardDescription>
            Choose a batch to view its protocol integration
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Select value={selectedBatch?.id} onValueChange={(value) => setSelectedBatch(mockBatchProtocols.find((b) => b.id === value) || null)}>
            <SelectTrigger className="h-10 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockBatchProtocols.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.batchName} - {batch.program}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedBatch && (
        <>
          {/* Program Protocol Overview */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Program Protocol</CardTitle>
              <CardDescription>
                {selectedBatch.program} - {selectedBatch.batchName}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedBatch.protocolMonths.map((month) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedMonth(month.month)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all",
                      selectedMonth === month.month
                        ? "bg-primary/5 border-primary ring-2 ring-primary"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-slate-900">{month.name}</h4>
                      <Badge className={cn("text-[10px] font-semibold border", month.progress === 100 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200")}>
                        {month.progress}%
                      </Badge>
                    </div>
                    <Progress value={month.progress} className="h-2 mb-2" />
                    <p className="text-[10px] text-slate-500">{month.activities.length} activities</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Activities */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Upcoming Activities</CardTitle>
              <CardDescription>
                Scheduled protocol activities for the selected month
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {selectedBatch.protocolMonths
                  .find((m) => m.month === selectedMonth)
                  ?.activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", getActivityColor(activity.type))}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-slate-900">{activity.name}</h4>
                            <Badge className={cn("text-[10px] font-semibold border", getActivityColor(activity.type))}>
                              {activity.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">Assigned to: {activity.assignedTo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Scheduled</p>
                          <p className="text-sm font-medium text-slate-900">{formatDate(activity.scheduledDate)}</p>
                        </div>
                        <Badge className={cn("text-[10px] font-semibold border flex items-center gap-1", getStatusColor(activity.status))}>
                          {getStatusIcon(activity.status)}
                          {activity.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Protocol Timeline */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Protocol Timeline</CardTitle>
              <CardDescription>
                Visual representation of protocol execution across months
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {selectedBatch.protocolMonths.map((month) => (
                  <div key={month.month} className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                        <span className="text-sm font-bold text-primary">{month.month}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">{month.name}</h4>
                        <Progress value={month.progress} className="h-2 mt-2" />
                      </div>
                      <Badge className={cn("text-[10px] font-semibold border", month.progress === 100 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200")}>
                        {month.progress}%
                      </Badge>
                    </div>
                    <div className="ml-9 space-y-2">
                      {month.activities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <div className={cn("h-6 w-6 rounded flex items-center justify-center", getActivityColor(activity.type))}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <span className="text-xs text-slate-600 flex-1">{activity.name}</span>
                          <Badge className={cn("text-[10px] font-semibold border", getStatusColor(activity.status))}>
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {month.month < selectedBatch.protocolMonths.length && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-slate-200" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Integration Status</CardTitle>
              <CardDescription>
                Current status of protocol integration with batch management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs text-slate-600">Batch Linked</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">Yes</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-slate-600">Protocol Months</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{selectedBatch.protocolMonths.length}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span className="text-xs text-slate-600">Total Activities</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedBatch.protocolMonths.reduce((acc, month) => acc + month.activities.length, 0)}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                    <span className="text-xs text-slate-600">Overall Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.round(selectedBatch.protocolMonths.reduce((acc, month) => acc + month.progress, 0) / selectedBatch.protocolMonths.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
