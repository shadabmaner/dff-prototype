"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  RefreshCw,
  ArrowRight,
  Save,
  Activity,
  Utensils,
  Dumbbell,
  UserMinus,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Layers,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
type ResourceType = "Doctor" | "Dietitian" | "Coach"

interface Resource {
  id: string
  name: string
  type: ResourceType
  currentLoad: number
  maxCapacity: number
  assignedBatches: string[]
  status: "Active" | "On Leave" | "Resigned"
}

interface AffectedBatch {
  id: string
  name: string
  patientCount: number
  currentResource: string
}

// Mock Data
const mockResources: Resource[] = [
  {
    id: "1",
    name: "Dr. Bhagyesh Kulkarni",
    type: "Doctor",
    currentLoad: 95,
    maxCapacity: 120,
    assignedBatches: ["DFF-DIA-JAN-001", "DFF-DIA-FEB-001", "DFF-DIA-MAR-001"],
    status: "Active",
  },
  {
    id: "2",
    name: "Dr. Amit Patel",
    type: "Doctor",
    currentLoad: 80,
    maxCapacity: 120,
    assignedBatches: ["TFF-THY-JAN-001", "TFF-THY-FEB-001"],
    status: "Active",
  },
  {
    id: "3",
    name: "Dr. Suresh Kumar",
    type: "Doctor",
    currentLoad: 110,
    maxCapacity: 120,
    assignedBatches: ["HBMI-WGT-JAN-001", "HBMI-WGT-FEB-001"],
    status: "Resigned",
  },
  {
    id: "4",
    name: "Dr. Priya Sharma",
    type: "Dietitian",
    currentLoad: 85,
    maxCapacity: 100,
    assignedBatches: ["DFF-DIA-JAN-001", "DFF-DIA-FEB-001"],
    status: "Active",
  },
  {
    id: "5",
    name: "Dr. Neha Gupta",
    type: "Dietitian",
    currentLoad: 70,
    maxCapacity: 100,
    assignedBatches: ["TFF-THY-JAN-001"],
    status: "Active",
  },
  {
    id: "6",
    name: "Coach Rahul Verma",
    type: "Coach",
    currentLoad: 75,
    maxCapacity: 80,
    assignedBatches: ["DFF-DIA-JAN-001", "DFF-DIA-FEB-001"],
    status: "Active",
  },
]

const mockAffectedBatches: AffectedBatch[] = [
  { id: "1", name: "HBMI-WGT-JAN-001", patientCount: 92, currentResource: "Dr. Suresh Kumar" },
  { id: "2", name: "HBMI-WGT-FEB-001", patientCount: 0, currentResource: "Dr. Suresh Kumar" },
]

export default function BulkReallocationPage() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [targetResource, setTargetResource] = useState<Resource | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [reallocationReason, setReallocationReason] = useState("")
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "Doctor":
        return <Activity className="h-5 w-5" />
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
      case "Active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "On Leave":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "Resigned":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const handlePreviewReallocation = () => {
    if (selectedResource && targetResource) {
      setShowPreviewDialog(true)
    }
  }

  const handleSaveReallocation = () => {
    alert("Bulk reallocation saved successfully")
    setShowPreviewDialog(false)
    setSelectedResource(null)
    setTargetResource(null)
    setReallocationReason("")
    setSelectedBatches([])
  }

  const getAvailableResources = (type: ResourceType) => {
    return mockResources.filter((r) => r.type === type && r.status === "Active" && r.id !== selectedResource?.id)
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
            Bulk Resource <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Reallocation</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Handle resignations or workload balancing by bulk reassigning resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Reallocation Workflow */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Reallocation Workflow</CardTitle>
          <CardDescription>
            Follow the steps to bulk reassign resources
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Step 1: Select Resource */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <UserMinus className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Step 1: Select Resource to Replace</h3>
                  <p className="text-xs text-slate-500">Choose the resource that needs to be replaced (e.g., resigned doctor)</p>
                </div>
              </div>
              <Select onValueChange={(value) => setSelectedResource(mockResources.find((r) => r.id === value) || null)}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select resource to replace" />
                </SelectTrigger>
                <SelectContent>
                  {mockResources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <span>{resource.name}</span>
                        <Badge className={cn("text-[10px] font-semibold border", getStatusColor(resource.status))}>
                          {resource.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Select Target Resource */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Step 2: Select Target Resource</h3>
                  <p className="text-xs text-slate-500">Choose the resource to take over the workload</p>
                </div>
              </div>
              {selectedResource ? (
                <Select onValueChange={(value) => setTargetResource(mockResources.find((r) => r.id === value) || null)}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select target resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableResources(selectedResource.type).map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        <div className="flex items-center gap-2">
                          {getResourceIcon(resource.type)}
                          <span>{resource.name}</span>
                          <span className="text-xs text-slate-500">({resource.currentLoad}/{resource.maxCapacity})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-4 text-sm text-slate-500">
                  Please select a resource to replace first
                </div>
              )}
            </div>

            {/* Step 3: Preview Affected Batches */}
            {selectedResource && (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Step 3: Preview Affected Batches</h3>
                    <p className="text-xs text-slate-500">Review batches that will be impacted by this change</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedResource.assignedBatches.map((batchName, index) => (
                    <motion.div
                      key={batchName}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{batchName}</p>
                          <p className="text-xs text-slate-500">Currently assigned to {selectedResource.name}</p>
                        </div>
                      </div>
                      <Badge className="text-[10px] font-semibold bg-amber-100 text-amber-700 border-amber-200">
                        Will be reassigned
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Workload Impact */}
            {selectedResource && targetResource && (
              <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Step 4: Workload Impact</h3>
                    <p className="text-xs text-slate-500">Review the impact on target resource capacity</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Current Load</p>
                    <p className="text-2xl font-bold text-slate-900">{targetResource.currentLoad}</p>
                    <p className="text-xs text-slate-500">/{targetResource.maxCapacity} max capacity</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">New Load</p>
                    <p className="text-2xl font-bold text-emerald-600">{targetResource.currentLoad + selectedResource.currentLoad}</p>
                    <p className="text-xs text-slate-500">After reallocation</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">Utilization After Change</span>
                    <span className="text-xs font-bold text-slate-900">
                      {Math.round(((targetResource.currentLoad + selectedResource.currentLoad) / targetResource.maxCapacity) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={((targetResource.currentLoad + selectedResource.currentLoad) / targetResource.maxCapacity) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            )}

            {/* Preview Button */}
            <Button
              className="w-full h-12 rounded-xl bg-primary text-white"
              onClick={handlePreviewReallocation}
              disabled={!selectedResource || !targetResource}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Preview Reallocation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resource Status Overview */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Resource Status Overview</CardTitle>
          <CardDescription>
            Current status of all healthcare resources
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockResources.map((resource) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", getResourceColor(resource.type))}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{resource.name}</p>
                      <p className="text-[10px] text-slate-500">{resource.type}</p>
                    </div>
                  </div>
                  <Badge className={cn("text-[10px] font-semibold border", getStatusColor(resource.status))}>
                    {resource.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500">Load</span>
                      <span className="text-[10px] font-bold text-slate-900">{resource.currentLoad}/{resource.maxCapacity}</span>
                    </div>
                    <Progress value={(resource.currentLoad / resource.maxCapacity) * 100} className="h-1.5" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Layers className="h-3 w-3" />
                    <span>{resource.assignedBatches.length} batches assigned</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Preview Bulk Reallocation</DialogTitle>
            <DialogDescription>
              Review the reallocation before confirming
            </DialogDescription>
          </DialogHeader>
          {selectedResource && targetResource && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <UserMinus className="h-4 w-4 text-red-600" />
                  <h4 className="text-sm font-bold text-slate-900">Resource Being Replaced</h4>
                </div>
                <p className="text-sm text-slate-600">{selectedResource.name}</p>
                <p className="text-xs text-slate-500">{selectedResource.type} • {selectedResource.assignedBatches.length} batches</p>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-slate-400" />
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Target Resource</h4>
                </div>
                <p className="text-sm text-slate-600">{targetResource.name}</p>
                <p className="text-xs text-slate-500">{targetResource.type} • Current load: {targetResource.currentLoad}/{targetResource.maxCapacity}</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-slate-900">Affected Batches</h4>
                </div>
                <div className="space-y-1">
                  {selectedResource.assignedBatches.map((batch) => (
                    <p key={batch} className="text-xs text-slate-600">• {batch}</p>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Reason for Reallocation</Label>
                <Textarea
                  value={reallocationReason}
                  onChange={(e) => setReallocationReason(e.target.value)}
                  placeholder="Enter reason for bulk reallocation..."
                  className="mt-2 rounded-xl border-slate-200"
                />
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button className="h-10 px-6 rounded-xl bg-primary text-white" onClick={handleSaveReallocation}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Reallocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
