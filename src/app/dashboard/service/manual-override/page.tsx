"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  Plus,
  Minus,
  ArrowRight,
  Save,
  RefreshCw,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  Edit,
  Layers,
  Users,
  Activity,
  Utensils,
  Dumbbell,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
type OverrideAction = "Add Patient" | "Remove Patient" | "Transfer Patient" | "Change Doctor" | "Change Dietitian" | "Change Coach" | "Bulk Update"

interface Patient {
  id: string
  patientId: string
  name: string
  currentBatch: string
  program: string
}

interface Batch {
  id: string
  name: string
  capacity: number
  currentPatients: number
}

// Mock Data
const mockPatients: Patient[] = [
  { id: "1", patientId: "PT-001", name: "Rajesh Kumar", currentBatch: "DFF-DIA-JAN-001", program: "Diabetes Free Forever" },
  { id: "2", patientId: "PT-002", name: "Priya Sharma", currentBatch: "DFF-DIA-JAN-001", program: "Diabetes Free Forever" },
  { id: "3", patientId: "PT-003", name: "Amit Patel", currentBatch: "TFF-THY-JAN-001", program: "Thyroid Free Forever" },
  { id: "4", patientId: "PT-004", name: "Neha Gupta", currentBatch: "HBMI-WGT-JAN-001", program: "Healthy BMI" },
  { id: "5", patientId: "PT-005", name: "Suresh Kumar", currentBatch: "DFF-DIA-JAN-001", program: "Diabetes Free Forever" },
]

const mockBatches: Batch[] = [
  { id: "1", name: "DFF-DIA-JAN-001", capacity: 50, currentPatients: 48 },
  { id: "2", name: "TFF-THY-JAN-001", capacity: 50, currentPatients: 45 },
  { id: "3", name: "HBMI-WGT-JAN-001", capacity: 100, currentPatients: 92 },
  { id: "4", name: "DFF-DIA-FEB-001", capacity: 50, currentPatients: 0 },
  { id: "5", name: "TFF-THY-FEB-001", capacity: 50, currentPatients: 0 },
]

const overrideActions: OverrideAction[] = [
  "Add Patient",
  "Remove Patient",
  "Transfer Patient",
  "Change Doctor",
  "Change Dietitian",
  "Change Coach",
  "Bulk Update",
]

export default function ManualOverridePage() {
  const [selectedAction, setSelectedAction] = useState<OverrideAction | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [transferReason, setTransferReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const getActionIcon = (action: OverrideAction) => {
    switch (action) {
      case "Add Patient":
        return <UserPlus className="h-5 w-5" />
      case "Remove Patient":
        return <UserMinus className="h-5 w-5" />
      case "Transfer Patient":
        return <ArrowRightLeft className="h-5 w-5" />
      case "Change Doctor":
        return <Activity className="h-5 w-5" />
      case "Change Dietitian":
        return <Utensils className="h-5 w-5" />
      case "Change Coach":
        return <Dumbbell className="h-5 w-5" />
      case "Bulk Update":
        return <Settings className="h-5 w-5" />
    }
  }

  const getActionColor = (action: OverrideAction) => {
    switch (action) {
      case "Add Patient":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Remove Patient":
        return "bg-red-100 text-red-700 border-red-200"
      case "Transfer Patient":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Change Doctor":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Change Dietitian":
        return "bg-pink-100 text-pink-700 border-pink-200"
      case "Change Coach":
        return "bg-cyan-100 text-cyan-700 border-cyan-200"
      case "Bulk Update":
        return "bg-amber-100 text-amber-700 border-amber-200"
    }
  }

  const handleActionClick = (action: OverrideAction) => {
    setSelectedAction(action)
    setShowDialog(true)
  }

  const handleSaveOverride = () => {
    alert("Override action saved successfully")
    setShowDialog(false)
    setSelectedAction(null)
    setSelectedPatient(null)
    setSelectedBatch(null)
    setTransferReason("")
  }

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
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
            Manual <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Override Center</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Allow operational flexibility for batch and resource management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Override Actions */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Override Actions</CardTitle>
          <CardDescription>
            Select an action to perform manual overrides
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {overrideActions.map((action, index) => (
              <motion.div
                key={action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleActionClick(action)}
                className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-3", getActionColor(action))}>
                    {getActionIcon(action)}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{action}</h4>
                  <p className="text-[10px] text-slate-500">
                    {action === "Add Patient" && "Add patient to a batch"}
                    {action === "Remove Patient" && "Remove patient from batch"}
                    {action === "Transfer Patient" && "Move patient to another batch"}
                    {action === "Change Doctor" && "Reassign doctor for batch"}
                    {action === "Change Dietitian" && "Reassign dietitian for batch"}
                    {action === "Change Coach" && "Reassign coach for batch"}
                    {action === "Bulk Update" && "Update multiple records"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Patient List</CardTitle>
          <CardDescription>
            Available patients for override operations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by Patient ID, Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-xl border-slate-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{patient.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{patient.name}</p>
                    <p className="text-xs text-slate-500">{patient.patientId} • {patient.program}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] font-semibold bg-blue-100 text-blue-700 border-blue-200">
                    {patient.currentBatch}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                    <Edit className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">{selectedAction}</DialogTitle>
            <DialogDescription>
              Perform manual override operation
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {selectedAction === "Transfer Patient" && (
              <>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select Patient</Label>
                  <Select onValueChange={(value) => setSelectedPatient(mockPatients.find((p) => p.id === value) || null)}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.patientId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select New Batch</Label>
                  <Select onValueChange={(value) => setSelectedBatch(mockBatches.find((b) => b.id === value) || null)}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select target batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name} ({batch.currentPatients}/{batch.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Reason for Transfer</Label>
                  <Textarea
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="Enter reason for patient transfer..."
                    className="mt-2 rounded-xl border-slate-200"
                  />
                </div>
                {selectedPatient && selectedBatch && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <h4 className="text-sm font-bold text-slate-900">Impact Analysis</h4>
                    </div>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p>• Patient: {selectedPatient.name}</p>
                      <p>• From: {selectedPatient.currentBatch}</p>
                      <p>• To: {selectedBatch.name}</p>
                      <p>• New batch capacity: {selectedBatch.currentPatients + 1}/{selectedBatch.capacity}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedAction === "Add Patient" && (
              <>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select Patient</Label>
                  <Select onValueChange={(value) => setSelectedPatient(mockPatients.find((p) => p.id === value) || null)}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.patientId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select Target Batch</Label>
                  <Select onValueChange={(value) => setSelectedBatch(mockBatches.find((b) => b.id === value) || null)}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select target batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name} ({batch.currentPatients}/{batch.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedAction === "Change Doctor" && (
              <>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select Batch</Label>
                  <Select>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select New Doctor</Label>
                  <Select>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Dr. Bhagyesh Kulkarni</SelectItem>
                      <SelectItem value="2">Dr. Amit Patel</SelectItem>
                      <SelectItem value="3">Dr. Suresh Kumar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedAction === "Change Dietitian" && (
              <>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select Batch</Label>
                  <Select>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select New Dietitian</Label>
                  <Select>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select dietitian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Dr. Priya Sharma</SelectItem>
                      <SelectItem value="2">Dr. Neha Gupta</SelectItem>
                      <SelectItem value="3">Dr. Anjali Singh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedAction === "Change Coach" && (
              <>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select Batch</Label>
                  <Select>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Select New Coach</Label>
                  <Select>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select coach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Coach Rahul Verma</SelectItem>
                      <SelectItem value="2">Coach Sneha Joshi</SelectItem>
                      <SelectItem value="3">Coach Vikram Singh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button className="h-10 px-6 rounded-xl bg-primary text-white" onClick={handleSaveOverride}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
