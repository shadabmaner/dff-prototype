"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Pill,
  Plus,
  Search,
  Calendar,
  User,
  FileText,
  Download,
  Copy,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  FileDown,
  Eye,
  Printer,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Types
type PrescriptionStatus = "Draft" | "Active" | "Completed" | "Expired" | "Cancelled" | "Replaced"
type Program = "Diabetes (DFF)" | "Thyroid (TFF)" | "Obesity / Healthy BMI"

interface Prescription {
  id: string
  prescriptionNumber: string
  patientName: string
  patientId: string
  program: Program
  diagnosis: string
  medicinesCount: number
  issueDate: string
  followUpDate: string
  status: PrescriptionStatus
  doctor: string
}

// Mock Data
const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    prescriptionNumber: "RX-2026-001",
    patientName: "Aditya Sharma",
    patientId: "PT-2026-001",
    program: "Diabetes (DFF)",
    diagnosis: "Type 2 Diabetes Mellitus",
    medicinesCount: 3,
    issueDate: "2026-01-15",
    followUpDate: "2026-02-15",
    status: "Active",
    doctor: "Dr. Bhagyesh Kulkarni",
  },
  {
    id: "2",
    prescriptionNumber: "RX-2026-002",
    patientName: "Priya Patel",
    patientId: "PT-2026-002",
    program: "Thyroid (TFF)",
    diagnosis: "Hypothyroidism",
    medicinesCount: 2,
    issueDate: "2026-01-16",
    followUpDate: "2026-02-16",
    status: "Active",
    doctor: "Dr. Bhagyesh Kulkarni",
  },
  {
    id: "3",
    prescriptionNumber: "RX-2026-003",
    patientName: "Rajesh Kumar",
    patientId: "PT-2026-003",
    program: "Obesity / Healthy BMI",
    diagnosis: "Obesity Class II",
    medicinesCount: 4,
    issueDate: "2026-01-17",
    followUpDate: "2026-02-17",
    status: "Draft",
    doctor: "Dr. Bhagyesh Kulkarni",
  },
  {
    id: "4",
    prescriptionNumber: "RX-2026-004",
    patientName: "Sneha Gupta",
    patientId: "PT-2026-004",
    program: "Diabetes (DFF)",
    diagnosis: "Type 2 Diabetes Mellitus",
    medicinesCount: 2,
    issueDate: "2026-01-10",
    followUpDate: "2026-02-10",
    status: "Completed",
    doctor: "Dr. Bhagyesh Kulkarni",
  },
  {
    id: "5",
    prescriptionNumber: "RX-2026-005",
    patientName: "Amit Singh",
    patientId: "PT-2026-005",
    program: "Thyroid (TFF)",
    diagnosis: "Hyperthyroidism",
    medicinesCount: 3,
    issueDate: "2026-01-05",
    followUpDate: "2026-02-05",
    status: "Expired",
    doctor: "Dr. Bhagyesh Kulkarni",
  },
  {
    id: "6",
    prescriptionNumber: "RX-2026-006",
    patientName: "Kavita Desai",
    patientId: "PT-2026-006",
    program: "Diabetes (DFF)",
    diagnosis: "Type 2 Diabetes Mellitus",
    medicinesCount: 5,
    issueDate: "2026-01-18",
    followUpDate: "2026-02-18",
    status: "Active",
    doctor: "Dr. Bhagyesh Kulkarni",
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

export default function PrescriptionManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<typeof mockPrescriptions[0] | null>(null)

  // Calculate summary stats
  const activeCount = mockPrescriptions.filter((p) => p.status === "Active").length
  const draftCount = mockPrescriptions.filter((p) => p.status === "Draft").length
  const todayPrescriptions = mockPrescriptions.filter((p) => p.issueDate === "2026-01-18").length
  const monthPrescriptions = mockPrescriptions.filter((p) => p.issueDate.startsWith("2026-01")).length
  const followUpDue = mockPrescriptions.filter((p) => {
    const followUpDate = new Date(p.followUpDate)
    const today = new Date()
    const diffDays = Math.ceil((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }).length
  const expiringSoon = mockPrescriptions.filter((p) => p.status === "Active").length

  // Filter prescriptions
  const filteredPrescriptions = mockPrescriptions.filter((p) => {
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProgram = selectedProgram === "all" || p.program === selectedProgram
    const matchesStatus = selectedStatus === "all" || p.status === selectedStatus
    const matchesDoctor = selectedDoctor === "all" || p.doctor === selectedDoctor
    return matchesSearch && matchesProgram && matchesStatus && matchesDoctor
  })

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
            Prescription <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            View, manage, and track all prescriptions issued to patients with comprehensive clinical context.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/doctor/prescription-management/issue">
            <Button className="h-11 px-6 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/30">
              <Plus className="mr-2 h-4 w-4" />
              Issue Prescription
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Pill className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Draft</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{draftCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{todayPrescriptions}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{monthPrescriptions}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Follow-Up Due</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{followUpDue}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiring</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{expiringSoon}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by patient name, ID, or prescription number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 w-80 rounded-xl border-slate-200"
                />
              </div>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="h-11 w-40 rounded-xl border-slate-200">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="Diabetes (DFF)">Diabetes (DFF)</SelectItem>
                  <SelectItem value="Thyroid (TFF)">Thyroid (TFF)</SelectItem>
                  <SelectItem value="Obesity / Healthy BMI">Obesity / Healthy BMI</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-11 w-36 rounded-xl border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Replaced">Replaced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="h-11 w-48 rounded-xl border-slate-200">
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="Dr. Bhagyesh Kulkarni">Dr. Bhagyesh Kulkarni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Listing Grid */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Prescription Listing</CardTitle>
          <CardDescription>
            Showing {filteredPrescriptions.length} of {mockPrescriptions.length} prescriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Prescription #</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Name</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Patient ID</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Program</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Diagnosis</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Medicines</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Issue Date</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Follow-Up</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((prescription, index) => (
                  <motion.tr
                    key={prescription.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">{prescription.prescriptionNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <Link href={`/dashboard/doctor/patients/${prescription.patientId}`}>
                          <span className="text-sm font-medium text-slate-900 hover:text-primary cursor-pointer transition-colors">{prescription.patientName}</span>
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{prescription.patientId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-primary text-primary text-xs">
                        {prescription.program}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{prescription.diagnosis}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">{prescription.medicinesCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{formatDate(prescription.issueDate)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{formatDate(prescription.followUpDate)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn("text-xs font-semibold border", statusColors[prescription.status])}>
                        {prescription.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/doctor/prescription-management/view/${prescription.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <Eye className="h-4 w-4 text-slate-600" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-lg"
                          onClick={() => {
                            setSelectedPrescription(prescription)
                            setShowPrintDialog(true)
                          }}
                        >
                          <FileDown className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Link href={`/dashboard/doctor/prescription-management/issue`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <Copy className="h-4 w-4 text-slate-600" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Print Preview Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Prescription Print Preview</DialogTitle>
            <DialogDescription>
              Preview prescription before printing or downloading
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="bg-white border-2 border-slate-200 rounded-lg p-8 space-y-6" style={{ fontFamily: 'Times New Roman, serif' }}>
              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>DFF Healthcare Clinic</h2>
                    <p className="text-sm text-slate-600">Diabetes, Thyroid & Obesity Management</p>
                    <p className="text-xs text-slate-500 mt-1">123 Healthcare Avenue, Medical District, City - 400001</p>
                    <p className="text-xs text-slate-500">Phone: +91 1234567890 | Email: info@dffhealthcare.com</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">PRESCRIPTION</p>
                    <p className="text-xs text-slate-500">{selectedPrescription.prescriptionNumber}</p>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Patient Name</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Patient ID</p>
                  <p className="text-sm font-medium text-slate-900">{selectedPrescription.patientId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Program</p>
                  <p className="text-sm font-medium text-slate-900">{selectedPrescription.program}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Issue Date</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(selectedPrescription.issueDate)}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Diagnosis</p>
                <p className="text-sm font-medium text-slate-900">{selectedPrescription.diagnosis}</p>
              </div>

              {/* Medications */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-3">Medications ({selectedPrescription.medicinesCount})</p>
                <div className="space-y-3">
                  {[...Array(selectedPrescription.medicinesCount)].map((_, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{idx + 1}. Sample Medication</p>
                          <p className="text-xs text-slate-600">Strength: 500 mg</p>
                        </div>
                        <Badge className="bg-primary text-white text-xs">Twice Daily (BD)</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Dosage:</span> 1 Tablet
                        </div>
                        <div>
                          <span className="text-slate-500">Duration:</span> 30 Days
                        </div>
                        <div>
                          <span className="text-slate-500">Meal Timing:</span> After Breakfast
                        </div>
                        <div>
                          <span className="text-slate-500">Reminder:</span> Yes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up */}
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Follow-up Date</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(selectedPrescription.followUpDate)}</p>
              </div>

              {/* Digital Signature */}
              <div className="border-t-2 border-slate-800 pt-4 mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="w-32 h-16 border-b-2 border-slate-400 mb-2 flex items-end justify-center">
                      <p className="text-xs text-slate-400 italic">Digital Signature</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{selectedPrescription.doctor}</p>
                    <p className="text-xs text-slate-600">MBBS, MD (General Medicine)</p>
                    <p className="text-xs text-slate-500">Reg. No: 12345678</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">This prescription is digitally signed</p>
                    <p className="text-xs text-slate-400">Valid prescription ID: {selectedPrescription.prescriptionNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowPrintDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
            <Button 
              onClick={() => window.print()} 
              className="h-10 px-6 rounded-xl bg-primary text-white"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
