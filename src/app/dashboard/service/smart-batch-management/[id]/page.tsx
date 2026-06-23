"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Layers,
  Users,
  UserCheck,
  Calendar,
  Activity,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Settings,
  Edit,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  FileText,
  Search,
  Filter,
  Download,
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
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Types
type BatchStatus = "Draft" | "Active" | "In Progress" | "Completed" | "Archived"
type Program = "Diabetes Free Forever" | "Thyroid Free Forever" | "Healthy BMI"

interface TeamMember {
  id: string
  name: string
  role: "Doctor" | "Dietitian" | "Coach" | "Service Executive"
  specialization: string
  currentLoad: number
  maxCapacity: number
  contact: {
    phone: string
    email: string
  }
  location: string
}

interface Patient {
  id: string
  patientId: string
  name: string
  enrollmentDate: string
  program: Program
  assessmentStatus: string
  paymentStatus: string
  journeyProgress: number
}

// Mock Data
const mockBatch = {
  id: "1",
  batchName: "DFF-DIA-JAN-001",
  program: "Diabetes Free Forever",
  specialty: "Diabetes",
  startDate: "2026-01-15",
  endDate: "2026-04-15",
  currentCapacity: 50,
  currentPatients: 48,
  status: "Active" as BatchStatus,
}

const mockTeam: TeamMember[] = [
  {
    id: "1",
    name: "Dr. Bhagyesh Kulkarni",
    role: "Doctor",
    specialization: "Diabetes",
    currentLoad: 95,
    maxCapacity: 120,
    contact: { phone: "+91 98765 43210", email: "bhagyesh@clinic.com" },
    location: "Pune",
  },
  {
    id: "2",
    name: "Dr. Priya Sharma",
    role: "Dietitian",
    specialization: "Diabetes",
    currentLoad: 85,
    maxCapacity: 100,
    contact: { phone: "+91 98765 43213", email: "priya@clinic.com" },
    location: "Pune",
  },
  {
    id: "3",
    name: "Coach Rahul Verma",
    role: "Coach",
    specialization: "Fitness",
    currentLoad: 75,
    maxCapacity: 80,
    contact: { phone: "+91 98765 43216", email: "rahul@clinic.com" },
    location: "Pune",
  },
  {
    id: "4",
    name: "Service Executive Amit",
    role: "Service Executive",
    specialization: "Operations",
    currentLoad: 40,
    maxCapacity: 50,
    contact: { phone: "+91 98765 43219", email: "amit@clinic.com" },
    location: "Pune",
  },
]

const mockPatients: Patient[] = [
  {
    id: "1",
    patientId: "PT-001",
    name: "Rajesh Kumar",
    enrollmentDate: "2026-01-15",
    program: "Diabetes Free Forever",
    assessmentStatus: "Completed",
    paymentStatus: "Paid",
    journeyProgress: 75,
  },
  {
    id: "2",
    patientId: "PT-002",
    name: "Priya Sharma",
    enrollmentDate: "2026-01-16",
    program: "Diabetes Free Forever",
    assessmentStatus: "In Progress",
    paymentStatus: "Paid",
    journeyProgress: 60,
  },
  {
    id: "3",
    patientId: "PT-003",
    name: "Amit Patel",
    enrollmentDate: "2026-01-17",
    program: "Diabetes Free Forever",
    assessmentStatus: "Pending",
    paymentStatus: "Paid",
    journeyProgress: 45,
  },
  {
    id: "4",
    patientId: "PT-004",
    name: "Neha Gupta",
    enrollmentDate: "2026-01-18",
    program: "Diabetes Free Forever",
    assessmentStatus: "Completed",
    paymentStatus: "Pending",
    journeyProgress: 80,
  },
  {
    id: "5",
    patientId: "PT-005",
    name: "Suresh Kumar",
    enrollmentDate: "2026-01-19",
    program: "Diabetes Free Forever",
    assessmentStatus: "In Progress",
    paymentStatus: "Paid",
    journeyProgress: 55,
  },
]

const patientSummary = {
  totalPatients: 48,
  activePatients: 42,
  pendingAssessment: 6,
  completedProgram: 5,
  dropouts: 2,
  pendingPayments: 8,
}

export default function BatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Doctor":
        return <Activity className="h-4 w-4" />
      case "Dietitian":
        return <FileText className="h-4 w-4" />
      case "Coach":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <UserCheck className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Doctor":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Dietitian":
        return "bg-pink-100 text-pink-700 border-pink-200"
      case "Coach":
        return "bg-cyan-100 text-cyan-700 border-cyan-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "Paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const filteredPatients = mockPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || patient.assessmentStatus === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Service Operations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {mockBatch.batchName}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {mockBatch.program} • {mockBatch.specialty}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="h-10 px-4 rounded-xl bg-primary text-white">
            <Edit className="h-4 w-4 mr-2" />
            Edit Batch
          </Button>
        </div>
      </div>

      {/* Section 1: Batch Overview */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Batch Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-xs text-slate-500 uppercase font-semibold">Batch Name</Label>
              <p className="text-sm font-bold text-slate-900 mt-1">{mockBatch.batchName}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-semibold">Program</Label>
              <p className="text-sm font-bold text-slate-900 mt-1">{mockBatch.program}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-semibold">Specialty</Label>
              <p className="text-sm font-bold text-slate-900 mt-1">{mockBatch.specialty}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-semibold">Status</Label>
              <Badge className={cn("text-xs font-semibold border mt-1 bg-emerald-100 text-emerald-700 border-emerald-200")}>
                {mockBatch.status}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-semibold">Start Date</Label>
              <p className="text-sm font-bold text-slate-900 mt-1">{formatDate(mockBatch.startDate)}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-semibold">End Date</Label>
              <p className="text-sm font-bold text-slate-900 mt-1">{formatDate(mockBatch.endDate)}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-semibold">Current Capacity</Label>
              <p className="text-sm font-bold text-slate-900 mt-1">{mockBatch.currentCapacity}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase font-semibold">Current Patients</Label>
              <p className="text-sm font-bold text-slate-900 mt-1">{mockBatch.currentPatients}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Assigned Team */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Assigned Team</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {mockTeam.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", getRoleColor(member.role))}>
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
                    <Badge className={cn("text-[10px] font-semibold border", getRoleColor(member.role))}>
                      {member.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500">Load</span>
                      <span className="text-[10px] font-bold text-slate-900">{member.currentLoad}/{member.maxCapacity}</span>
                    </div>
                    <Progress value={(member.currentLoad / member.maxCapacity) * 100} className="h-1.5" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Phone className="h-3 w-3" />
                    <span>{member.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{member.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="h-3 w-3" />
                    <span>{member.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Patient Summary */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Patient Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs text-slate-600">Total Patients</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{patientSummary.totalPatients}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-xs text-slate-600">Active</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{patientSummary.activePatients}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-xs text-slate-600">Pending Assessment</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{patientSummary.pendingAssessment}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-slate-600">Completed</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{patientSummary.completedProgram}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-xs text-slate-600">Dropouts</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{patientSummary.dropouts}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-slate-600">Pending Payments</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{patientSummary.pendingPayments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Patient Grid */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Patient Grid</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end mb-6">
            <div className="flex-1">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Search</Label>
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
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Assessment Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Enrollment Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Program</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Assessment Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Payment Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Journey Progress</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-slate-900">{patient.patientId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{patient.name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{formatDate(patient.enrollmentDate)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{patient.program}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", getStatusColor(patient.assessmentStatus))}>
                        {patient.assessmentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", getStatusColor(patient.paymentStatus))}>
                        {patient.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{patient.journeyProgress}%</span>
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${patient.journeyProgress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                          <Activity className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                          <MoreVertical className="h-4 w-4 text-slate-600" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
