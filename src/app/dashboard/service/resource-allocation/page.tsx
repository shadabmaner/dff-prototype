"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  UserCheck,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  Play,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Utensils,
  Dumbbell,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  Layers,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Types
type AllocationMode = "Least Loaded" | "Round Robin" | "Program Specialization" | "Location Based"
type ResourceType = "Doctor" | "Dietitian" | "Coach"

interface Resource {
  id: string
  name: string
  type: ResourceType
  specialization: string
  currentLoad: number
  maxCapacity: number
  availableCapacity: number
  assignedBatches: number
  location: string
  contact: {
    phone: string
    email: string
  }
  status: "Available" | "Busy" | "On Leave"
}

interface AllocationPreview {
  batch: string
  doctor: string
  dietitian: string
  coach: string
  expectedPatientCount: number
  workloadImpact: string
}

// Mock Data
const mockDoctors: Resource[] = [
  {
    id: "1",
    name: "Dr. Bhagyesh Kulkarni",
    type: "Doctor",
    specialization: "Diabetes",
    currentLoad: 95,
    maxCapacity: 120,
    availableCapacity: 25,
    assignedBatches: 3,
    location: "Pune",
    contact: { phone: "+91 98765 43210", email: "bhagyesh@clinic.com" },
    status: "Available",
  },
  {
    id: "2",
    name: "Dr. Amit Patel",
    type: "Doctor",
    specialization: "Thyroid",
    currentLoad: 80,
    maxCapacity: 120,
    availableCapacity: 40,
    assignedBatches: 2,
    location: "Mumbai",
    contact: { phone: "+91 98765 43211", email: "amit@clinic.com" },
    status: "Available",
  },
  {
    id: "3",
    name: "Dr. Suresh Kumar",
    type: "Doctor",
    specialization: "Weight Management",
    currentLoad: 110,
    maxCapacity: 120,
    availableCapacity: 10,
    assignedBatches: 4,
    location: "Delhi",
    contact: { phone: "+91 98765 43212", email: "suresh@clinic.com" },
    status: "Busy",
  },
]

const mockDietitians: Resource[] = [
  {
    id: "4",
    name: "Dr. Priya Sharma",
    type: "Dietitian",
    specialization: "Diabetes",
    currentLoad: 85,
    maxCapacity: 100,
    availableCapacity: 15,
    assignedBatches: 3,
    location: "Pune",
    contact: { phone: "+91 98765 43213", email: "priya@clinic.com" },
    status: "Available",
  },
  {
    id: "5",
    name: "Dr. Neha Gupta",
    type: "Dietitian",
    specialization: "Thyroid",
    currentLoad: 70,
    maxCapacity: 100,
    availableCapacity: 30,
    assignedBatches: 2,
    location: "Mumbai",
    contact: { phone: "+91 98765 43214", email: "neha@clinic.com" },
    status: "Available",
  },
  {
    id: "6",
    name: "Dr. Anjali Singh",
    type: "Dietitian",
    specialization: "Weight Management",
    currentLoad: 95,
    maxCapacity: 100,
    availableCapacity: 5,
    assignedBatches: 4,
    location: "Delhi",
    contact: { phone: "+91 98765 43215", email: "anjali@clinic.com" },
    status: "Busy",
  },
]

const mockCoaches: Resource[] = [
  {
    id: "7",
    name: "Coach Rahul Verma",
    type: "Coach",
    specialization: "Fitness",
    currentLoad: 75,
    maxCapacity: 80,
    availableCapacity: 5,
    assignedBatches: 3,
    location: "Pune",
    contact: { phone: "+91 98765 43216", email: "rahul@clinic.com" },
    status: "Available",
  },
  {
    id: "8",
    name: "Coach Sneha Joshi",
    type: "Coach",
    specialization: "Fitness",
    currentLoad: 60,
    maxCapacity: 80,
    availableCapacity: 20,
    assignedBatches: 2,
    location: "Mumbai",
    contact: { phone: "+91 98765 43217", email: "sneha@clinic.com" },
    status: "Available",
  },
  {
    id: "9",
    name: "Coach Vikram Singh",
    type: "Coach",
    specialization: "Fitness",
    currentLoad: 78,
    maxCapacity: 80,
    availableCapacity: 2,
    assignedBatches: 4,
    location: "Delhi",
    contact: { phone: "+91 98765 43218", email: "vikram@clinic.com" },
    status: "Busy",
  },
]

const allocationModes: AllocationMode[] = [
  "Least Loaded",
  "Round Robin",
  "Program Specialization",
  "Location Based",
]

export default function ResourceAllocationPage() {
  const [selectedMode, setSelectedMode] = useState<AllocationMode>("Least Loaded")
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [allocationPreview, setAllocationPreview] = useState<AllocationPreview | null>(null)

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "Doctor":
        return <Stethoscope className="h-5 w-5" />
      case "Dietitian":
        return <Utensils className="h-5 w-5" />
      case "Coach":
        return <Dumbbell className="h-5 w-5" />
    }
  }

  const getResourceColor = (type: ResourceType) => {
    switch (type) {
      case "Doctor":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Dietitian":
        return "bg-pink-100 text-pink-700 border-pink-200"
      case "Coach":
        return "bg-cyan-100 text-cyan-700 border-cyan-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Busy":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "On Leave":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "bg-red-500"
    if (utilization >= 70) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const handleRunAllocation = () => {
    setAllocationPreview({
      batch: "DFF-DIA-FEB-001",
      doctor: "Dr. Bhagyesh Kulkarni",
      dietitian: "Dr. Priya Sharma",
      coach: "Coach Rahul Verma",
      expectedPatientCount: 50,
      workloadImpact: "+25 patients to each resource",
    })
    setShowPreviewDialog(true)
  }

  const renderResourceCard = (resource: Resource) => {
    const utilization = (resource.currentLoad / resource.maxCapacity) * 100
    return (
      <motion.div
        key={resource.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", getResourceColor(resource.type))}>
              {getResourceIcon(resource.type)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{resource.name}</h4>
              <p className="text-xs text-slate-500">{resource.specialization}</p>
            </div>
          </div>
          <Badge className={cn("text-[10px] font-semibold border", getStatusColor(resource.status))}>
            {resource.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600">Current Load</span>
              <span className="text-xs font-bold text-slate-900">{resource.currentLoad} / {resource.maxCapacity}</span>
            </div>
            <Progress value={utilization} className="h-2" />
            <p className="text-[10px] text-slate-500 mt-1">{Math.round(utilization)}% utilized</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-[10px] text-slate-500">Available</p>
              <p className="text-sm font-bold text-slate-900">{resource.availableCapacity}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-[10px] text-slate-500">Batches</p>
              <p className="text-sm font-bold text-slate-900">{resource.assignedBatches}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            <span>{resource.location}</span>
          </div>
        </div>
      </motion.div>
    )
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
            Resource <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Allocation Engine</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Automatically assign healthcare resources to batches
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Resources
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-primary text-white" onClick={handleRunAllocation}>
            <Play className="h-4 w-4 mr-2" />
            Run Allocation
          </Button>
        </div>
      </div>

      {/* Allocation Mode Selection */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Allocation Mode</CardTitle>
          <CardDescription>
            Select the automatic resource assignment strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {allocationModes.map((mode) => (
              <motion.div
                key={mode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all",
                  selectedMode === mode
                    ? "bg-primary/5 border-primary ring-2 ring-primary"
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
                onClick={() => setSelectedMode(mode)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3", selectedMode === mode ? "bg-primary text-white" : "bg-slate-100 text-slate-600")}>
                    <Settings className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{mode}</h4>
                  <p className="text-[10px] text-slate-500">
                    {mode === "Least Loaded" && "Assign to resource with lowest workload"}
                    {mode === "Round Robin" && "Sequential allocation across resources"}
                    {mode === "Program Specialization" && "Match program specialization"}
                    {mode === "Location Based" && "Assign based on batch location"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doctor Master View */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-purple-600" />
            Doctor Master View
          </CardTitle>
          <CardDescription>
            Current load, capacity, and specialization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockDoctors.map((doctor) => renderResourceCard(doctor))}
          </div>
        </CardContent>
      </Card>

      {/* Dietitian Cards */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-pink-600" />
            Dietitian Master View
          </CardTitle>
          <CardDescription>
            Current load, capacity, and specialization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockDietitians.map((dietitian) => renderResourceCard(dietitian))}
          </div>
        </CardContent>
      </Card>

      {/* Fitness Coach Cards */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-cyan-600" />
            Fitness Coach Master View
          </CardTitle>
          <CardDescription>
            Current load, capacity, and assigned batches
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockCoaches.map((coach) => renderResourceCard(coach))}
          </div>
        </CardContent>
      </Card>

      {/* Auto Assignment Logic */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Auto Assignment Logic
          </CardTitle>
          <CardDescription>
            How resources are automatically assigned to batches
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-slate-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">1. Least Loaded</h4>
              </div>
              <p className="text-xs text-slate-600">Assign resource with the lowest current workload to ensure balanced distribution</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">2. Round Robin</h4>
              </div>
              <p className="text-xs text-slate-600">Sequential allocation across available resources in a circular manner</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-slate-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">3. Program Specialization</h4>
              </div>
              <p className="text-xs text-slate-600">Match patients with resources based on program specialization (e.g., Diabetes patients → Diabetes Doctors)</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-slate-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">4. Location Based</h4>
              </div>
              <p className="text-xs text-slate-600">Assign resources based on batch location (e.g., Nagpur Batch → Nagpur Resource Team)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Assignment Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Resource Assignment Preview</DialogTitle>
            <DialogDescription>
              Review the resource allocation before confirming
            </DialogDescription>
          </DialogHeader>
          {allocationPreview && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{allocationPreview.batch}</h4>
                    <p className="text-xs text-slate-500">Target Batch</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">Doctor</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{allocationPreview.doctor}</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="h-4 w-4 text-pink-600" />
                    <span className="text-xs font-bold text-slate-900">Dietitian</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{allocationPreview.dietitian}</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="h-4 w-4 text-cyan-600" />
                    <span className="text-xs font-bold text-slate-900">Coach</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{allocationPreview.coach}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-slate-500 mb-1">Expected Patient Count</p>
                  <p className="text-2xl font-bold text-slate-900">{allocationPreview.expectedPatientCount}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-slate-500 mb-1">Workload Impact</p>
                  <p className="text-sm font-bold text-slate-900">{allocationPreview.workloadImpact}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button className="h-10 px-6 rounded-xl bg-primary text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
