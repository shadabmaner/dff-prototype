"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap,
  Play,
  RefreshCw,
  Users,
  Layers,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Settings,
  FileText,
  Calendar,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Types
interface GeneratedBatch {
  id: string
  name: string
  patientCount: number
  capacity: number
  program: string
}

interface EligiblePatient {
  id: string
  name: string
  program: string
  enrollmentDate: string
  status: string
}

// Mock Data
const mockEligiblePatients: EligiblePatient[] = [
  { id: "1", name: "Rajesh Kumar", program: "Diabetes Free Forever", enrollmentDate: "2026-01-15", status: "Payment Completed" },
  { id: "2", name: "Priya Sharma", program: "Diabetes Free Forever", enrollmentDate: "2026-01-16", status: "Payment Completed" },
  { id: "3", name: "Amit Patel", program: "Thyroid Free Forever", enrollmentDate: "2026-01-17", status: "Payment Completed" },
  { id: "4", name: "Neha Gupta", program: "Healthy BMI", enrollmentDate: "2026-01-18", status: "Payment Completed" },
  { id: "5", name: "Suresh Kumar", program: "Diabetes Free Forever", enrollmentDate: "2026-01-19", status: "Payment Completed" },
  { id: "6", name: "Anjali Singh", program: "Thyroid Free Forever", enrollmentDate: "2026-01-20", status: "Payment Completed" },
  { id: "7", name: "Vikram Singh", program: "Healthy BMI", enrollmentDate: "2026-01-21", status: "Payment Completed" },
  { id: "8", name: "Sneha Joshi", program: "Diabetes Free Forever", enrollmentDate: "2026-01-22", status: "Payment Completed" },
  { id: "9", name: "Rahul Verma", program: "Thyroid Free Forever", enrollmentDate: "2026-01-23", status: "Payment Completed" },
  { id: "10", name: "Kavita Reddy", program: "Healthy BMI", enrollmentDate: "2026-01-24", status: "Payment Completed" },
]

export default function AutoBatchEnginePage() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [generatedBatches, setGeneratedBatches] = useState<GeneratedBatch[]>([])
  const [progress, setProgress] = useState(0)
  const [eligiblePatients, setEligiblePatients] = useState<EligiblePatient[]>(mockEligiblePatients)
  const [assignedPatients, setAssignedPatients] = useState<EligiblePatient[]>([])

  const steps = [
    { id: 1, title: "Scanning Eligible Patients", icon: Users, description: "Finding patients matching eligibility rules" },
    { id: 2, title: "Applying Capacity Rules", icon: Settings, description: "Calculating batch capacity and distribution" },
    { id: 3, title: "Generating Batches", icon: Layers, description: "Creating batch structures" },
    { id: 4, title: "Assigning Patients", icon: ArrowRight, description: "Distributing patients to batches" },
    { id: 5, title: "Allocating Resources", icon: Activity, description: "Assigning doctors, dietitians, and coaches" },
    { id: 6, title: "Finalizing Batches", icon: CheckCircle, description: "Completing batch creation process" },
  ]

  const runEngine = () => {
    setIsRunning(true)
    setCurrentStep(0)
    setProgress(0)
    setGeneratedBatches([])
    setAssignedPatients([])

    let step = 0
    const interval = setInterval(() => {
      step++
      setCurrentStep(step)
      setProgress((step / steps.length) * 100)

      if (step === 2) {
        // Generate batches
        const newBatches: GeneratedBatch[] = [
          { id: "1", name: "DFF-DIA-FEB-001", patientCount: 0, capacity: 50, program: "Diabetes Free Forever" },
          { id: "2", name: "TFF-THY-FEB-001", patientCount: 0, capacity: 50, program: "Thyroid Free Forever" },
          { id: "3", name: "HBMI-FEB-001", patientCount: 0, capacity: 50, program: "Healthy BMI" },
        ]
        setGeneratedBatches(newBatches)
      }

      if (step === 4) {
        // Assign patients
        const assigned = eligiblePatients.slice(0, 5)
        setAssignedPatients(assigned)
        setEligiblePatients(eligiblePatients.slice(5))
      }

      if (step >= steps.length) {
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 1500)
  }

  const resetEngine = () => {
    setIsRunning(false)
    setCurrentStep(0)
    setProgress(0)
    setGeneratedBatches([])
    setAssignedPatients([])
    setEligiblePatients(mockEligiblePatients)
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
            Auto Batch <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Generation Engine</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Automated batch creation and patient distribution system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200" onClick={resetEngine}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-primary text-white" onClick={runEngine} disabled={isRunning}>
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running..." : "Run Engine"}
          </Button>
        </div>
      </div>

      {/* Engine Status */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Engine Status</h3>
                <p className="text-sm text-slate-600">
                  {isRunning ? "Processing batch generation..." : "Ready to generate batches"}
                </p>
              </div>
            </div>
            <Badge className={cn("text-xs font-semibold border", isRunning ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-emerald-100 text-emerald-700 border-emerald-200")}>
              {isRunning ? "Running" : "Idle"}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-500 mt-2">{Math.round(progress)}% Complete</p>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = currentStep >= index
          const isCurrent = currentStep === index

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card
                className={cn(
                  "border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm transition-all",
                  isActive && "ring-2 ring-primary",
                  isCurrent && "bg-primary/5"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                        isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                      )}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-[10px] text-slate-500">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                  <ArrowRight className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-300")} />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Engine Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eligible Patients */}
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Eligible Patients
            </CardTitle>
            <CardDescription>
              {eligiblePatients.length} patients awaiting batch assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {eligiblePatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{patient.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{patient.name}</p>
                    <p className="text-xs text-slate-500 truncate">{patient.program}</p>
                  </div>
                  <Badge className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                    {patient.status}
                  </Badge>
                </motion.div>
              ))}
              {eligiblePatients.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">All patients assigned</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Batches */}
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Generated Batches
            </CardTitle>
            <CardDescription>
              {generatedBatches.length} batches created
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {generatedBatches.map((batch, index) => (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-primary/5 to-blue-50/50 rounded-xl border border-primary/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900">{batch.name}</h4>
                    <Badge className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20">
                      {batch.program}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-slate-500" />
                      <span className="text-xs text-slate-600">{batch.patientCount} / {batch.capacity}</span>
                    </div>
                    <Progress value={(batch.patientCount / batch.capacity) * 100} className="h-1.5 w-20" />
                  </div>
                </motion.div>
              ))}
              {generatedBatches.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Waiting for generation...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Patients */}
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Assigned Patients
            </CardTitle>
            <CardDescription>
              {assignedPatients.length} patients assigned to batches
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {assignedPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{patient.name}</p>
                    <p className="text-xs text-slate-500 truncate">{patient.program}</p>
                  </div>
                  <Badge className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                    Assigned
                  </Badge>
                </motion.div>
              ))}
              {assignedPatients.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">No patients assigned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Eligible</p>
                <p className="text-2xl font-bold text-slate-900">{mockEligiblePatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Assigned</p>
                <p className="text-2xl font-bold text-slate-900">{assignedPatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Batches Created</p>
                <p className="text-2xl font-bold text-slate-900">{generatedBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-slate-900">{eligiblePatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Summary */}
      {generatedBatches.length > 0 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Batch Summary
            </CardTitle>
            <CardDescription>
              Overview of generated batches and patient distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {generatedBatches.map((batch) => (
                <div key={batch.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{batch.name}</h4>
                        <p className="text-xs text-slate-500">{batch.program}</p>
                      </div>
                    </div>
                    <Badge className="text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Capacity</p>
                      <p className="text-sm font-bold text-slate-900">{batch.capacity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Assigned</p>
                      <p className="text-sm font-bold text-slate-900">{batch.patientCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Available</p>
                      <p className="text-sm font-bold text-slate-900">{batch.capacity - batch.patientCount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
