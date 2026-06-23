"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  FileText,
  Download,
  Printer,
  Copy,
  Calendar,
  User,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  ChevronRight,
  ArrowRight,
  Pill,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Types
type PrescriptionStatus = "Draft" | "Active" | "Completed" | "Expired" | "Cancelled" | "Replaced"
type Frequency = "OD" | "BD" | "TDS" | "QID" | "SOS" | "Weekly" | "Alternate Days"
type MealTiming = "Before Breakfast" | "After Breakfast" | "Before Lunch" | "After Lunch" | "Before Dinner" | "After Dinner" | "Bedtime" | "Empty Stomach"

interface Medication {
  name: string
  strength: string
  dosage: string
  frequency: Frequency
  duration: string
  durationUnit: string
  mealTiming: MealTiming
  instructions: string
}

interface Prescription {
  id: string
  prescriptionNumber: string
  version: string
  issueDate: string
  diagnosis: string
  clinicalFindings: string
  consultationNotes: string
  followUpDate: string
  followUpRemarks: string
  status: PrescriptionStatus
  doctor: string
  medications: Medication[]
}

// Mock Data
const mockPrescription: Prescription = {
  id: "1",
  prescriptionNumber: "RX-2026-028",
  version: "V3",
  issueDate: "2026-03-20",
  diagnosis: "Type 2 Diabetes Mellitus - Stable",
  clinicalFindings: "Patient showing good glycemic control. HbA1c improved from 7.8% to 7.2%. Continue current medication regimen.",
  consultationNotes: "Patient compliant with diet and exercise. Continue monitoring.",
  followUpDate: "2026-04-20",
  followUpRemarks: "Review HbA1c and adjust medication if needed.",
  status: "Active",
  doctor: "Dr. Bhagyesh Kulkarni",
  medications: [
    {
      name: "Metformin 500 mg",
      strength: "500 mg",
      dosage: "1 Tablet",
      frequency: "BD",
      duration: "30",
      durationUnit: "Days",
      mealTiming: "After Breakfast",
      instructions: "Take with meals",
    },
    {
      name: "Glimepiride 2 mg",
      strength: "2 mg",
      dosage: "1 Tablet",
      frequency: "OD",
      duration: "30",
      durationUnit: "Days",
      mealTiming: "Before Breakfast",
      instructions: "Take on empty stomach",
    },
  ],
}

const mockPreviousPrescriptions: Prescription[] = [
  {
    id: "2",
    prescriptionNumber: "RX-2026-015",
    version: "V2",
    issueDate: "2026-02-15",
    diagnosis: "Type 2 Diabetes Mellitus - Improved",
    clinicalFindings: "Patient showing improvement. Reduce dosage.",
    consultationNotes: "Continue monitoring.",
    followUpDate: "2026-03-15",
    followUpRemarks: "Review progress",
    status: "Completed",
    doctor: "Dr. Bhagyesh Kulkarni",
    medications: [
      {
        name: "Metformin 500 mg",
        strength: "500 mg",
        dosage: "1 Tablet",
        frequency: "BD",
        duration: "30",
        durationUnit: "Days",
        mealTiming: "After Breakfast",
        instructions: "Take with meals",
      },
      {
        name: "Glimepiride 1 mg",
        strength: "1 mg",
        dosage: "1 Tablet",
        frequency: "OD",
        duration: "30",
        durationUnit: "Days",
        mealTiming: "Before Breakfast",
        instructions: "Take on empty stomach",
      },
    ],
  },
  {
    id: "3",
    prescriptionNumber: "RX-2026-001",
    version: "V1",
    issueDate: "2026-01-15",
    diagnosis: "Type 2 Diabetes Mellitus",
    clinicalFindings: "Initial diagnosis. Start medication.",
    consultationNotes: "Diet and exercise counseling provided.",
    followUpDate: "2026-02-15",
    followUpRemarks: "Review response",
    status: "Completed",
    doctor: "Dr. Bhagyesh Kulkarni",
    medications: [
      {
        name: "Metformin 250 mg",
        strength: "250 mg",
        dosage: "1 Tablet",
        frequency: "BD",
        duration: "30",
        durationUnit: "Days",
        mealTiming: "After Breakfast",
        instructions: "Take with meals",
      },
      {
        name: "Glimepiride 1 mg",
        strength: "1 mg",
        dosage: "1 Tablet",
        frequency: "OD",
        duration: "30",
        durationUnit: "Days",
        mealTiming: "Before Breakfast",
        instructions: "Take on empty stomach",
      },
      {
        name: "Atorvastatin 10 mg",
        strength: "10 mg",
        dosage: "1 Tablet",
        duration: "30",
        durationUnit: "Days",
        mealTiming: "Bedtime",
        instructions: "Take at bedtime",
        frequency: "OD",
      },
    ],
  },
]

const statusColors: Record<PrescriptionStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
  Expired: "bg-red-100 text-red-700 border-red-200",
  Cancelled: "bg-orange-100 text-orange-700 border-orange-200",
  Replaced: "bg-purple-100 text-purple-700 border-purple-200",
}

const frequencyLabels: Record<Frequency, string> = {
  OD: "Once Daily",
  BD: "Twice Daily",
  TDS: "Three Times Daily",
  QID: "Four Times Daily",
  SOS: "As Needed",
  Weekly: "Once a Week",
  "Alternate Days": "Every Other Day",
}

export default function PrescriptionViewPage({ params }: { params: Promise<{ prescriptionId: string }> }) {
  const [showComparison, setShowComparison] = useState(false)
  const [selectedComparison, setSelectedComparison] = useState<Prescription | null>(null)
  const [showSidePanel, setShowSidePanel] = useState(false)

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
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Doctor Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Prescription <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Details</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            View detailed prescription information and compare with previous versions
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/doctor/prescription-management">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </Link>
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <Copy className="mr-2 h-4 w-4" />
            Clone Prescription
          </Button>
        </div>
      </div>

      {/* Version Comparison Section */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Previous Prescriptions
            </CardTitle>
            <Sheet open={showSidePanel} onOpenChange={setShowSidePanel}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg">
                  <History className="h-4 w-4 mr-2" />
                  View & Compare
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-lg font-bold text-slate-900">Previous Prescriptions</SheetTitle>
                  <SheetDescription>
                    Select a previous prescription to compare with current version
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {mockPreviousPrescriptions.map((prev) => (
                    <div
                      key={prev.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedComparison(prev)
                        setShowComparison(true)
                        setShowSidePanel(false)
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{prev.version}</h3>
                            <Badge className={cn("text-xs font-semibold border", statusColors[prev.status])}>
                              {prev.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">{prev.prescriptionNumber} · {formatDate(prev.issueDate)}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!showComparison ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No comparison selected</p>
              <p className="text-xs text-slate-400 mt-1">Click "View & Compare" to select a previous prescription</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setShowComparison(false)} className="h-9 px-4 rounded-lg">
                  <X className="h-4 w-4 mr-2" />
                  Clear Comparison
                </Button>
                <p className="text-sm text-slate-600">Comparing {mockPrescription.version} with {selectedComparison?.version}</p>
              </div>
              
              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-6">
                {/* Current Version */}
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardHeader className="border-b border-primary/20 pb-4">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {mockPrescription.version} (Current)
                    </CardTitle>
                    <CardDescription>{mockPrescription.prescriptionNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Diagnosis</p>
                      <p className="text-sm font-medium text-slate-900">{mockPrescription.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Medications</p>
                      <div className="space-y-2">
                        {mockPrescription.medications.map((med, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-sm font-medium text-slate-900">{med.name}</p>
                            <p className="text-xs text-slate-600">{med.dosage} · {frequencyLabels[med.frequency]} · {med.duration} {med.durationUnit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Previous Version */}
                {selectedComparison && (
                  <Card className="border border-slate-200 bg-white/80">
                    <CardHeader className="border-b border-slate-100 pb-4">
                      <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        {selectedComparison.version} (Previous)
                      </CardTitle>
                      <CardDescription>{selectedComparison.prescriptionNumber}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Diagnosis</p>
                        <p className="text-sm font-medium text-slate-900">{selectedComparison.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Medications</p>
                        <div className="space-y-2">
                          {selectedComparison.medications.map((med, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                              <p className="text-sm font-medium text-slate-900">{med.name}</p>
                              <p className="text-xs text-slate-600">{med.dosage} · {frequencyLabels[med.frequency]} · {med.duration} {med.durationUnit}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Details */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Prescription Details
          </CardTitle>
          <CardDescription>
            {mockPrescription.prescriptionNumber} · {mockPrescription.version}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">Issue Date</p>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <p className="text-sm font-medium text-slate-900">{formatDate(mockPrescription.issueDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">Follow-Up Date</p>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <p className="text-sm font-medium text-slate-900">{formatDate(mockPrescription.followUpDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">Status</p>
              <Badge className={cn("text-xs font-semibold border", statusColors[mockPrescription.status])}>
                {mockPrescription.status}
              </Badge>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase mb-1">Issued By</p>
              <p className="text-sm font-medium text-slate-900">{mockPrescription.doctor}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 uppercase">Diagnosis</p>
            <p className="text-sm text-slate-900">{mockPrescription.diagnosis}</p>
          </div>

          {/* Clinical Findings */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 uppercase">Clinical Findings</p>
            <p className="text-sm text-slate-900">{mockPrescription.clinicalFindings}</p>
          </div>

          {/* Consultation Notes */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 uppercase">Consultation Notes</p>
            <p className="text-sm text-slate-900">{mockPrescription.consultationNotes}</p>
          </div>

          {/* Follow-Up Remarks */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 uppercase">Follow-Up Remarks</p>
            <p className="text-sm text-slate-900">{mockPrescription.followUpRemarks}</p>
          </div>

          {/* Medications */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-600 uppercase">Medications ({mockPrescription.medications.length})</p>
            <div className="space-y-3">
              {mockPrescription.medications.map((med, idx) => (
                <Card key={idx} className="border border-slate-200 bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-bold text-slate-900">{med.name}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs">{med.strength}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500">Dosage</p>
                        <p className="font-medium text-slate-900">{med.dosage}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Frequency</p>
                        <p className="font-medium text-slate-900">{frequencyLabels[med.frequency]}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Duration</p>
                        <p className="font-medium text-slate-900">{med.duration} {med.durationUnit}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Meal Timing</p>
                        <p className="font-medium text-slate-900">{med.mealTiming}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-500">Instructions</p>
                        <p className="font-medium text-slate-900">{med.instructions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
