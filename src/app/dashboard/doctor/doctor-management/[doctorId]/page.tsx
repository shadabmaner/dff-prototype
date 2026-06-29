"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Stethoscope, 
  Users, 
  FileText, 
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  Star,
  BarChart,
  Package,
  ArrowRight,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DoctorDetail {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialization: string
  qualification: string
  experience: number
  joinDate: string
  rating: number
  totalPatients: number
  activePatients: number
  treatedPatients: number
  totalPrescriptions: number
  prescriptionsConsumed: number
  status: "active" | "inactive"
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  mobile: string
  email: string
  program: string
  batch: string
  specialty: string
  enrollmentDate: string
  programStage: string
  status: "active" | "completed" | "inactive"
  lastConsultation: string
  nextAppointment?: string
}

interface Prescription {
  id: string
  patientName: string
  patientId: string
  date: string
  medications: number
  status: "active" | "completed" | "cancelled"
}

const doctorDetail: DoctorDetail = {
  id: "DR-001",
  firstName: "Dr. Rajesh",
  lastName: "Kumar",
  email: "rajesh.kumar@medikiz.com",
  phone: "+91 98765 43210",
  specialization: "Diabetes Specialist",
  qualification: "MBBS, MD (Endocrinology)",
  experience: 12,
  joinDate: "2023-01-15",
  rating: 4.8,
  totalPatients: 156,
  activePatients: 42,
  treatedPatients: 114,
  totalPrescriptions: 342,
  prescriptionsConsumed: 298,
  status: "active",
}

const allPatients: Patient[] = [
  {
    id: "PT-001",
    firstName: "Aditya",
    lastName: "Sharma",
    mobile: "+91 98765 43210",
    email: "aditya.sharma@email.com",
    program: "Diabetes Reversal Program",
    batch: "DFF-001",
    specialty: "Type 2 Diabetes",
    enrollmentDate: "2024-01-15",
    programStage: "Day 65",
    status: "active",
    lastConsultation: "2024-02-15",
    nextAppointment: "2024-03-15",
  },
  {
    id: "PT-002",
    firstName: "Priya",
    lastName: "Verma",
    mobile: "+91 98765 43211",
    email: "priya.verma@email.com",
    program: "Diabetes Reversal Program",
    batch: "DFF-002",
    specialty: "Type 2 Diabetes",
    enrollmentDate: "2024-01-20",
    programStage: "Day 45",
    status: "active",
    lastConsultation: "2024-02-10",
    nextAppointment: "2024-03-10",
  },
  {
    id: "PT-003",
    firstName: "Rahul",
    lastName: "Gupta",
    mobile: "+91 98765 43212",
    email: "rahul.gupta@email.com",
    program: "Diabetes Reversal Program",
    batch: "DFF-001",
    specialty: "Prediabetes",
    enrollmentDate: "2024-02-01",
    programStage: "Day 30",
    status: "active",
    lastConsultation: "2024-02-20",
    nextAppointment: "2024-03-20",
  },
  {
    id: "PT-004",
    firstName: "Sunita",
    lastName: "Reddy",
    mobile: "+91 98765 43213",
    email: "sunita.reddy@email.com",
    program: "Diabetes Reversal Program",
    batch: "DFF-003",
    specialty: "Type 2 Diabetes",
    enrollmentDate: "2023-06-15",
    programStage: "Day 91",
    status: "completed",
    lastConsultation: "2024-01-15",
  },
  {
    id: "PT-005",
    firstName: "Vikram",
    lastName: "Singh",
    mobile: "+91 98765 43214",
    email: "vikram.singh@email.com",
    program: "Diabetes Reversal Program",
    batch: "DFF-002",
    specialty: "Type 1 Diabetes",
    enrollmentDate: "2023-08-20",
    programStage: "Day 91",
    status: "completed",
    lastConsultation: "2024-01-20",
  },
  {
    id: "PT-006",
    firstName: "Anjali",
    lastName: "Patel",
    mobile: "+91 98765 43215",
    email: "anjali.patel@email.com",
    program: "Diabetes Reversal Program",
    batch: "DFF-001",
    specialty: "Type 2 Diabetes",
    enrollmentDate: "2024-01-25",
    programStage: "Day 55",
    status: "active",
    lastConsultation: "2024-02-25",
    nextAppointment: "2024-03-25",
  },
  {
    id: "PT-007",
    firstName: "Deepak",
    lastName: "Mehta",
    mobile: "+91 98765 43216",
    email: "deepak.mehta@email.com",
    program: "Diabetes Reversal Program",
    batch: "DFF-003",
    specialty: "Prediabetes",
    enrollmentDate: "2024-02-10",
    programStage: "Day 20",
    status: "active",
    lastConsultation: "2024-02-28",
    nextAppointment: "2024-03-28",
  },
]

const prescriptions: Prescription[] = [
  {
    id: "RX-001",
    patientName: "Aditya Sharma",
    patientId: "PT-001",
    date: "2024-02-15",
    medications: 3,
    status: "active",
  },
  {
    id: "RX-002",
    patientName: "Priya Verma",
    patientId: "PT-002",
    date: "2024-02-10",
    medications: 4,
    status: "active",
  },
  {
    id: "RX-003",
    patientName: "Rahul Gupta",
    patientId: "PT-003",
    date: "2024-02-20",
    medications: 2,
    status: "active",
  },
  {
    id: "RX-004",
    patientName: "Sunita Reddy",
    patientId: "PT-004",
    date: "2024-01-15",
    medications: 5,
    status: "completed",
  },
  {
    id: "RX-005",
    patientName: "Vikram Singh",
    patientId: "PT-005",
    date: "2024-01-20",
    medications: 4,
    status: "completed",
  },
]

const specialtyStats = [
  { name: "Type 2 Diabetes", count: 98, percentage: 63 },
  { name: "Type 1 Diabetes", count: 38, percentage: 24 },
  { name: "Prediabetes", count: 20, percentage: 13 },
]

const batchStats = [
  { name: "DFF-001", count: 65, percentage: 42 },
  { name: "DFF-002", count: 52, percentage: 33 },
  { name: "DFF-003", count: 39, percentage: 25 },
]

export default function DoctorDetailPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all")
  const [filterSpecialty, setFilterSpecialty] = useState("all")
  const [filterBatch, setFilterBatch] = useState("all")

  const handleViewPatient = (patientId: string) => {
    router.push(`/dashboard/doctor/patients/${patientId}`)
  }

  const handleViewPatientJourney = (patientId: string) => {
    router.push(`/dashboard/doctor/patient-journey?patientId=${patientId}`)
  }

  const specialties = [...new Set(allPatients.map(p => p.specialty))]
  const batches = [...new Set(allPatients.map(p => p.batch))]

  const filteredPatients = allPatients.filter((patient) => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mobile.includes(searchTerm) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || patient.status === filterStatus
    const matchesSpecialty = filterSpecialty === "all" || patient.specialty === filterSpecialty
    const matchesBatch = filterBatch === "all" || patient.batch === filterBatch
    return matchesSearch && matchesStatus && matchesSpecialty && matchesBatch
  })

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10 rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Doctor Details
          </h1>
          <p className="text-sm text-slate-600">
            Comprehensive view of doctor performance and patient management
          </p>
        </div>
      </div>

      {/* Doctor Profile Card */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-3xl">
                {doctorDetail.firstName.split(" ")[1]?.charAt(0) || doctorDetail.firstName.charAt(0)}
              </div>
              <Badge
                className={cn(
                  "text-sm font-semibold",
                  doctorDetail.status === "active"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                )}
              >
                {doctorDetail.status.charAt(0).toUpperCase() + doctorDetail.status.slice(1)}
              </Badge>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {doctorDetail.firstName} {doctorDetail.lastName}
                  </h2>
                  <p className="text-lg text-slate-600">{doctorDetail.specialization}</p>
                  <p className="text-sm text-slate-500">{doctorDetail.qualification}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-bold text-slate-900">{doctorDetail.rating}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{doctorDetail.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  <span>{doctorDetail.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{doctorDetail.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Stethoscope className="h-4 w-4" />
                  <span>Since {new Date(doctorDetail.joinDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{doctorDetail.totalPatients}</p>
                <p className="text-xs text-slate-600">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{doctorDetail.activePatients}</p>
                <p className="text-xs text-slate-600">Active Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{doctorDetail.treatedPatients}</p>
                <p className="text-xs text-slate-600">Treated Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{doctorDetail.totalPrescriptions}</p>
                <p className="text-xs text-slate-600">Total Prescriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{doctorDetail.prescriptionsConsumed}</p>
                <p className="text-xs text-slate-600">Consumed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/80 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
          <TabsTrigger value="patients" className="rounded-lg px-6">Patients</TabsTrigger>
          <TabsTrigger value="prescriptions" className="rounded-lg px-6">Prescriptions</TabsTrigger>
          <TabsTrigger value="statistics" className="rounded-lg px-6">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Specialty Distribution */}
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-slate-500" />
                  Patient Distribution by Specialty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {specialtyStats.map((stat) => (
                    <div key={stat.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{stat.name}</span>
                        <span className="text-slate-600">{stat.count} patients ({stat.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Batch Distribution */}
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-500" />
                  Patient Distribution by Batch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batchStats.map((stat) => (
                    <div key={stat.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{stat.name}</span>
                        <span className="text-slate-600">{stat.count} patients ({stat.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full transition-all"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-500" />
                Recent Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.slice(0, 5).map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{prescription.patientName}</p>
                        <p className="text-sm text-slate-600">{prescription.medications} medications • {new Date(prescription.date).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs font-semibold",
                        prescription.status === "active"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : prescription.status === "completed"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      )}
                    >
                      {prescription.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardContent className="p-6">
              {/* Filters */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end mb-6">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Search Patients</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by ID, name, email, or mobile..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
                <div className="w-full md:w-40">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "completed")}
                    className="w-full h-10 rounded-xl border-slate-200 px-3 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="w-full md:w-40">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Specialty</label>
                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="w-full h-10 rounded-xl border-slate-200 px-3 text-sm"
                  >
                    <option value="all">All Specialties</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-40">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Batch</label>
                  <select
                    value={filterBatch}
                    onChange={(e) => setFilterBatch(e.target.value)}
                    className="w-full h-10 rounded-xl border-slate-200 px-3 text-sm"
                  >
                    <option value="all">All Batches</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient ID</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient Name</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Mobile</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Specialty</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Program</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Creation Date</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Last Consultation</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Program Stage</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-slate-900">{patient.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-slate-900">{patient.firstName} {patient.lastName}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600">{patient.mobile}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600">{patient.email}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600">{patient.specialty}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600">{patient.program}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600">{new Date(patient.enrollmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600">{new Date(patient.lastConsultation).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={cn(
                              "text-xs font-semibold",
                              patient.status === "active"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-purple-100 text-purple-700 border-purple-200"
                            )}
                          >
                            {patient.programStage}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={cn(
                              "text-xs font-semibold",
                              patient.status === "active"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : patient.status === "completed"
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewPatient(patient.id)}
                              className="h-8 rounded-lg text-xs"
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleViewPatientJourney(patient.id)}
                              className="h-8 rounded-lg text-xs bg-primary text-white hover:bg-primary/90"
                            >
                              Journey
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No patients found</h3>
                  <p className="text-sm text-slate-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                All Prescriptions ({prescriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{prescription.patientName}</p>
                        <p className="text-sm text-slate-600">{prescription.medications} medications • {new Date(prescription.date).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPatient(prescription.patientId)}
                        className="h-8 rounded-lg"
                      >
                        View Patient
                      </Button>
                      <Badge
                        className={cn(
                          "text-xs font-semibold",
                          prescription.status === "active"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : prescription.status === "completed"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        )}
                      >
                        {prescription.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-slate-500" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Patient Retention Rate</span>
                  <span className="text-lg font-bold text-slate-900">87%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Average Treatment Duration</span>
                  <span className="text-lg font-bold text-slate-900">4.2 months</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Prescription Compliance</span>
                  <span className="text-lg font-bold text-slate-900">92%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Patient Satisfaction</span>
                  <span className="text-lg font-bold text-slate-900">4.8/5.0</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">New Patients (This Month)</span>
                  <span className="text-lg font-bold text-emerald-600">+12</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Prescriptions (This Month)</span>
                  <span className="text-lg font-bold text-emerald-600">+28</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Completed Treatments</span>
                  <span className="text-lg font-bold text-emerald-600">+8</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm text-slate-600">Patient Follow-ups</span>
                  <span className="text-lg font-bold text-emerald-600">+45</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
