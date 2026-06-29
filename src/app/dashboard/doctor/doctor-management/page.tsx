"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, User, Stethoscope, Calendar, Users, FileText, ArrowRight, Mail, Phone, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssignedDoctor {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialization: string
  totalPatients: number
  activePatients: number
  treatedPatients: number
  totalPrescriptions: number
  rating: number
  joinDate: string
  status: "active" | "inactive"
}

const assignedDoctors: AssignedDoctor[] = [
  {
    id: "DR-001",
    firstName: "Dr. Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@medikiz.com",
    phone: "+91 98765 43210",
    specialization: "Diabetes Specialist",
    totalPatients: 156,
    activePatients: 42,
    treatedPatients: 114,
    totalPrescriptions: 342,
    rating: 4.8,
    joinDate: "2023-01-15",
    status: "active",
  },
  {
    id: "DR-002",
    firstName: "Dr. Priya",
    lastName: "Sharma",
    email: "priya.sharma@medikiz.com",
    phone: "+91 98765 43211",
    specialization: "Cardiologist",
    totalPatients: 128,
    activePatients: 35,
    treatedPatients: 93,
    totalPrescriptions: 287,
    rating: 4.9,
    joinDate: "2023-03-20",
    status: "active",
  },
  {
    id: "DR-003",
    firstName: "Dr. Amit",
    lastName: "Verma",
    email: "amit.verma@medikiz.com",
    phone: "+91 98765 43212",
    specialization: "General Physician",
    totalPatients: 198,
    activePatients: 56,
    treatedPatients: 142,
    totalPrescriptions: 456,
    rating: 4.7,
    joinDate: "2022-11-10",
    status: "active",
  },
  {
    id: "DR-004",
    firstName: "Dr. Sunita",
    lastName: "Gupta",
    email: "sunita.gupta@medikiz.com",
    phone: "+91 98765 43213",
    specialization: "Endocrinologist",
    totalPatients: 89,
    activePatients: 28,
    treatedPatients: 61,
    totalPrescriptions: 198,
    rating: 4.6,
    joinDate: "2023-06-05",
    status: "active",
  },
  {
    id: "DR-005",
    firstName: "Dr. Vikram",
    lastName: "Singh",
    email: "vikram.singh@medikiz.com",
    phone: "+91 98765 43214",
    specialization: "Diabetes Specialist",
    totalPatients: 145,
    activePatients: 38,
    treatedPatients: 107,
    totalPrescriptions: 312,
    rating: 4.5,
    joinDate: "2023-04-12",
    status: "active",
  },
]

export default function DoctorManagementPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  const filteredDoctors = assignedDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || doctor.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleViewDoctor = (doctorId: string) => {
    router.push(`/dashboard/doctor/doctor-management/${doctorId}`)
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Lead Doctor Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Doctor <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            View and manage all doctors assigned under your supervision. Track their performance, patient load, and prescription patterns.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{assignedDoctors.length}</p>
                <p className="text-sm text-slate-600">Total Doctors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {assignedDoctors.reduce((sum, d) => sum + d.activePatients, 0)}
                </p>
                <p className="text-sm text-slate-600">Active Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {assignedDoctors.reduce((sum, d) => sum + d.totalPrescriptions, 0)}
                </p>
                <p className="text-sm text-slate-600">Total Prescriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {assignedDoctors.reduce((sum, d) => sum + d.treatedPatients, 0)}
                </p>
                <p className="text-sm text-slate-600">Patients Treated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Search Doctors</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className="h-10 rounded-xl"
              >
                All ({assignedDoctors.length})
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                className="h-10 rounded-xl"
              >
                Active ({assignedDoctors.filter(d => d.status === "active").length})
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                onClick={() => setFilterStatus("inactive")}
                className="h-10 rounded-xl"
              >
                Inactive ({assignedDoctors.filter(d => d.status === "inactive").length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewDoctor(doctor.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {doctor.firstName.split(" ")[1]?.charAt(0) || doctor.firstName.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      {doctor.firstName} {doctor.lastName}
                    </CardTitle>
                    <CardDescription className="text-sm">{doctor.specialization}</CardDescription>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "text-xs font-semibold",
                    doctor.status === "active"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  )}
                >
                  {doctor.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Joined: {new Date(doctor.joinDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Active Patients</p>
                  <p className="text-lg font-bold text-slate-900">{doctor.activePatients}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Treated</p>
                  <p className="text-lg font-bold text-slate-900">{doctor.treatedPatients}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Prescriptions</p>
                  <p className="text-lg font-bold text-slate-900">{doctor.totalPrescriptions}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-bold text-slate-900">{doctor.rating}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full h-10 rounded-xl bg-primary text-white hover:bg-primary/90">
                View Details <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No doctors found</h3>
            <p className="text-sm text-slate-600">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
