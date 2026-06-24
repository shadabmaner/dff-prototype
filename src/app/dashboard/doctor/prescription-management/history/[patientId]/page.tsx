"use client"

import { useState, use } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Plus,
  FileText,
  Download,
  Eye,
  Copy,
  Calendar,
  User,
  Activity,
  Stethoscope,
  Dumbbell,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  History,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Types
type PrescriptionStatus = "Draft" | "Active" | "Completed" | "Expired" | "Cancelled" | "Replaced"
type Program = "Diabetes (DFF)" | "Thyroid (TFF)" | "Obesity / Healthy BMI"

interface PrescriptionHistory {
  id: string
  version: string
  prescriptionNumber: string
  issueDate: string
  diagnosis: string
  medicinesCount: number
  followUpDate: string
  status: PrescriptionStatus
}

// Mock Data
const mockPatient = {
  name: "Aditya Sharma",
  patientId: "PT-2026-001",
  age: 45,
  gender: "Male",
  program: "Diabetes (DFF)",
  assignedDietitian: "Dr. Priya Desai",
  assignedCoach: "Rahul Kumar",
  assignedServiceExecutive: "Sneha Gupta",
  programStatus: "Active",
}

const mockPrescriptionHistory: PrescriptionHistory[] = [
  {
    id: "1",
    version: "V1",
    prescriptionNumber: "RX-2026-001",
    issueDate: "2026-01-15",
    diagnosis: "Type 2 Diabetes Mellitus",
    medicinesCount: 3,
    followUpDate: "2026-02-15",
    status: "Completed",
  },
  {
    id: "2",
    version: "V2",
    prescriptionNumber: "RX-2026-015",
    issueDate: "2026-02-15",
    diagnosis: "Type 2 Diabetes Mellitus - Improved",
    medicinesCount: 2,
    followUpDate: "2026-03-15",
    status: "Completed",
  },
  {
    id: "3",
    version: "V3",
    prescriptionNumber: "RX-2026-028",
    issueDate: "2026-03-20",
    diagnosis: "Type 2 Diabetes Mellitus - Stable",
    medicinesCount: 2,
    followUpDate: "2026-04-20",
    status: "Active",
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

export default function PatientPrescriptionHistoryPage({ params }: { params: Promise<{ patientId: string }> }) {
  const patientId = use(params)
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
            Prescription <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">History</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            View complete prescription timeline and history for patient
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/doctor/prescription-management">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </Link>
          <Link href="/dashboard/doctor/prescription-management/issue">
            <Button className="h-11 px-6 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <Plus className="mr-2 h-4 w-4" />
              Issue New Prescription
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Context Header */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{mockPatient.name}</h2>
                <p className="text-sm text-slate-500">{mockPatient.patientId} · {mockPatient.age} years · {mockPatient.gender}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-primary text-primary text-xs">
                    {mockPatient.program}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">{mockPatient.programStatus}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Stethoscope className="h-3 w-3 text-slate-400" />
                  <p className="text-[10px] text-slate-500 uppercase">Dietitian</p>
                </div>
                <p className="text-xs font-medium text-slate-900">{mockPatient.assignedDietitian}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Dumbbell className="h-3 w-3 text-slate-400" />
                  <p className="text-[10px] text-slate-500 uppercase">Coach</p>
                </div>
                <p className="text-xs font-medium text-slate-900">{mockPatient.assignedCoach}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageSquare className="h-3 w-3 text-slate-400" />
                  <p className="text-[10px] text-slate-500 uppercase">Service</p>
                </div>
                <p className="text-xs font-medium text-slate-900">{mockPatient.assignedServiceExecutive}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Timeline */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Prescription Timeline
          </CardTitle>
          <CardDescription>
            Complete history of prescriptions issued to this patient
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />

            {/* Timeline Items */}
            <div className="space-y-6">
              {mockPrescriptionHistory.map((prescription, index) => (
                <motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative pl-20"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-6 top-0 h-4 w-4 rounded-full bg-primary border-4 border-white shadow-sm" />

                  {/* Prescription Card */}
                  <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">Prescription {prescription.version}</h3>
                              <Badge className={cn("text-xs font-semibold border", statusColors[prescription.status])}>
                                {prescription.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500">{prescription.prescriptionNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <Eye className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <Download className="h-4 w-4 text-slate-600" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Prescription ID</p>
                          <p className="text-sm font-medium text-slate-900">{prescription.prescriptionNumber}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Issue Date</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <p className="text-sm font-medium text-slate-900">{formatDate(prescription.issueDate)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Follow-Up Date</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <p className="text-sm font-medium text-slate-900">{formatDate(prescription.followUpDate)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Diagnosis</p>
                        <p className="text-sm font-medium text-slate-900">{prescription.diagnosis}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs">
                          <Eye className="h-3 w-3 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs">
                          <Copy className="h-3 w-3 mr-2" />
                          Compare Versions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
