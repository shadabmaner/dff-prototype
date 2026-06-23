"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
  Users,
  UserPlus,
  UserCheck,
  Activity,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  RefreshCw,
  Settings,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
type BatchStatus = "Draft" | "Active" | "In Progress" | "Completed" | "Archived"
type Program = "Diabetes Free Forever" | "Thyroid Free Forever" | "Healthy BMI"
type Specialty = "Diabetes" | "Thyroid" | "Weight Management" | "General"

interface Batch {
  id: string
  batchName: string
  program: Program
  specialty: Specialty
  startDate: string
  endDate: string
  capacity: number
  currentPatients: number
  assignedDoctor: string
  assignedDietitian: string
  assignedCoach: string
  status: BatchStatus
}

// Mock Data
const mockBatches: Batch[] = [
  {
    id: "1",
    batchName: "DFF-DIA-JAN-001",
    program: "Diabetes Free Forever",
    specialty: "Diabetes",
    startDate: "2026-01-15",
    endDate: "2026-04-15",
    capacity: 50,
    currentPatients: 48,
    assignedDoctor: "Dr. Bhagyesh Kulkarni",
    assignedDietitian: "Dr. Priya Sharma",
    assignedCoach: "Coach Rahul Verma",
    status: "Active",
  },
  {
    id: "2",
    batchName: "TFF-THY-JAN-001",
    program: "Thyroid Free Forever",
    specialty: "Thyroid",
    startDate: "2026-01-20",
    endDate: "2026-04-20",
    capacity: 50,
    currentPatients: 45,
    assignedDoctor: "Dr. Amit Patel",
    assignedDietitian: "Dr. Neha Gupta",
    assignedCoach: "Coach Sneha Joshi",
    status: "Active",
  },
  {
    id: "3",
    batchName: "HBMI-WGT-JAN-001",
    program: "Healthy BMI",
    specialty: "Weight Management",
    startDate: "2026-01-25",
    endDate: "2026-04-25",
    capacity: 100,
    currentPatients: 92,
    assignedDoctor: "Dr. Suresh Kumar",
    assignedDietitian: "Dr. Anjali Singh",
    assignedCoach: "Coach Vikram Singh",
    status: "In Progress",
  },
  {
    id: "4",
    batchName: "DFF-DIA-FEB-001",
    program: "Diabetes Free Forever",
    specialty: "Diabetes",
    startDate: "2026-02-01",
    endDate: "2026-05-01",
    capacity: 50,
    currentPatients: 0,
    assignedDoctor: "Dr. Bhagyesh Kulkarni",
    assignedDietitian: "Dr. Priya Sharma",
    assignedCoach: "Coach Rahul Verma",
    status: "Draft",
  },
  {
    id: "5",
    batchName: "TFF-THY-FEB-001",
    program: "Thyroid Free Forever",
    specialty: "Thyroid",
    startDate: "2026-02-05",
    endDate: "2026-05-05",
    capacity: 50,
    currentPatients: 0,
    assignedDoctor: "Dr. Amit Patel",
    assignedDietitian: "Dr. Neha Gupta",
    assignedCoach: "Coach Sneha Joshi",
    status: "Draft",
  },
  {
    id: "6",
    batchName: "DFF-DIA-DEC-001",
    program: "Diabetes Free Forever",
    specialty: "Diabetes",
    startDate: "2025-12-01",
    endDate: "2026-03-01",
    capacity: 50,
    currentPatients: 50,
    assignedDoctor: "Dr. Bhagyesh Kulkarni",
    assignedDietitian: "Dr. Priya Sharma",
    assignedCoach: "Coach Rahul Verma",
    status: "Completed",
  },
]

const statusColors: Record<BatchStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-purple-100 text-purple-700 border-purple-200",
  Archived: "bg-gray-100 text-gray-700 border-gray-200",
}

const programColors: Record<Program, string> = {
  "Diabetes Free Forever": "bg-red-100 text-red-700 border-red-200",
  "Thyroid Free Forever": "bg-amber-100 text-amber-700 border-amber-200",
  "Healthy BMI": "bg-green-100 text-green-700 border-green-200",
}

export default function SmartBatchManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("batchName")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)

  // KPI Data
  const kpiData = {
    totalActiveBatches: 3,
    patientsAwaitingBatch: 120,
    autoCreatedBatchesThisMonth: 8,
    activePatients: 185,
    doctorsAllocated: 3,
    dietitiansAllocated: 3,
    coachesAllocated: 3,
    resourceUtilization: 78,
    upcomingBatchStarts: 2,
    capacityAvailable: 100,
    patientsWaitingAllocation: 120,
  }

  // Filter batches
  const filteredBatches = mockBatches
    .filter((batch) => {
      const matchesSearch =
        batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.program.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesProgram = selectedProgram === "all" || batch.program === selectedProgram
      const matchesSpecialty = selectedSpecialty === "all" || batch.specialty === selectedSpecialty
      const matchesStatus = selectedStatus === "all" || batch.status === selectedStatus
      const matchesDoctor = selectedDoctor === "all" || batch.assignedDoctor === selectedDoctor
      return matchesSearch && matchesProgram && matchesSpecialty && matchesStatus && matchesDoctor
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "batchName") {
        comparison = a.batchName.localeCompare(b.batchName)
      } else if (sortBy === "startDate") {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      } else if (sortBy === "capacity") {
        comparison = a.capacity - b.capacity
      } else if (sortBy === "currentPatients") {
        comparison = a.currentPatients - b.currentPatients
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  // Pagination
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBatches = filteredBatches.slice(startIndex, endIndex)

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleViewBatch = (batch: Batch) => {
    setSelectedBatch(batch)
    setShowViewDialog(true)
  }

  const handleEditBatch = (batch: Batch) => {
    setSelectedBatch(batch)
    setShowEditDialog(true)
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
            Smart Batch <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Automated batch creation, patient assignment, and resource allocation engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Batch
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Active Batches</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{kpiData.totalActiveBatches}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2 this month
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Patients Awaiting Batch</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{kpiData.patientsAwaitingBatch}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Needs attention
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Auto Created Batches</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{kpiData.autoCreatedBatchesThisMonth}</p>
                <p className="text-xs text-slate-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Patients</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{kpiData.activePatients}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +15 this week
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Doctors Allocated</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{kpiData.doctorsAllocated}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Dietitians Allocated</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{kpiData.dietitiansAllocated}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Coaches Allocated</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{kpiData.coachesAllocated}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Resource Utilization</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{kpiData.resourceUtilization}%</p>
                <p className="text-xs text-slate-500 mt-1">Overall capacity</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Upcoming Batch Starts</p>
                <p className="text-xl font-bold text-slate-900">{kpiData.upcomingBatchStarts}</p>
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
                <p className="text-sm text-slate-600">Capacity Available</p>
                <p className="text-xl font-bold text-slate-900">{kpiData.capacityAvailable}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Patients Waiting Allocation</p>
                <p className="text-xl font-bold text-slate-900">{kpiData.patientsWaitingAllocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Auto Batch Engine</p>
                <p className="text-xl font-bold text-emerald-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Batch Name, Program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Program</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="Diabetes Free Forever">Diabetes Free Forever</SelectItem>
                  <SelectItem value="Thyroid Free Forever">Thyroid Free Forever</SelectItem>
                  <SelectItem value="Healthy BMI">Healthy BMI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="Diabetes">Diabetes</SelectItem>
                  <SelectItem value="Thyroid">Thyroid</SelectItem>
                  <SelectItem value="Weight Management">Weight Management</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="Dr. Bhagyesh Kulkarni">Dr. Bhagyesh Kulkarni</SelectItem>
                  <SelectItem value="Dr. Amit Patel">Dr. Amit Patel</SelectItem>
                  <SelectItem value="Dr. Suresh Kumar">Dr. Suresh Kumar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Listing Grid */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Batch Listing</CardTitle>
          <CardDescription>
            {filteredBatches.length} batches found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("batchName")}>
                    <div className="flex items-center gap-1">
                      Batch Name
                      {sortBy === "batchName" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Program</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Specialty</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("startDate")}>
                    <div className="flex items-center gap-1">
                      Start Date
                      {sortBy === "startDate" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">End Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("capacity")}>
                    <div className="flex items-center gap-1">
                      Capacity
                      {sortBy === "capacity" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("currentPatients")}>
                    <div className="flex items-center gap-1">
                      Patients
                      {sortBy === "currentPatients" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Assigned Doctor</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Assigned Dietitian</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Assigned Coach</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("status")}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === "status" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBatches.map((batch, index) => (
                  <motion.tr
                    key={batch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{batch.batchName}</p>
                          <p className="text-xs text-slate-500">{batch.program}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", programColors[batch.program])}>
                        {batch.program}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{batch.specialty}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{formatDate(batch.startDate)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{formatDate(batch.endDate)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{batch.capacity}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{batch.currentPatients}</span>
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(batch.currentPatients / batch.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{batch.assignedDoctor}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{batch.assignedDietitian}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{batch.assignedCoach}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", statusColors[batch.status])}>
                        {batch.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => handleViewBatch(batch)}>
                          <Eye className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => handleEditBatch(batch)}>
                          <Edit className="h-4 w-4 text-slate-600" />
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="h-8 w-20 rounded-lg border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-600">per page</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 rounded-lg border-slate-200"
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 rounded-lg border-slate-200"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Batch Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Batch Details</DialogTitle>
            <DialogDescription>
              View batch information and resource allocation
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{selectedBatch.batchName}</p>
                  <p className="text-sm text-slate-600">{selectedBatch.program}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Specialty</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedBatch.specialty}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Status</Label>
                  <Badge className={cn("text-xs font-semibold border mt-1", statusColors[selectedBatch.status])}>
                    {selectedBatch.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Start Date</Label>
                  <p className="text-sm text-slate-900 mt-1">{formatDate(selectedBatch.startDate)}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">End Date</Label>
                  <p className="text-sm text-slate-900 mt-1">{formatDate(selectedBatch.endDate)}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Capacity</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedBatch.capacity}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Current Patients</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedBatch.currentPatients}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Assigned Doctor</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedBatch.assignedDoctor}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Assigned Dietitian</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedBatch.assignedDietitian}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Assigned Coach</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedBatch.assignedCoach}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowViewDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
            <Button className="h-10 px-6 rounded-xl bg-primary text-white">
              View Full Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Edit Batch</DialogTitle>
            <DialogDescription>
              Update batch details and resource allocation
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Batch Name</Label>
                <Input
                  value={selectedBatch.batchName}
                  disabled
                  className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Program</Label>
                  <Input
                    value={selectedBatch.program}
                    disabled
                    className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Specialty</Label>
                  <Input
                    value={selectedBatch.specialty}
                    disabled
                    className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Start Date</Label>
                  <Input
                    value={selectedBatch.startDate}
                    disabled
                    className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">End Date</Label>
                  <Input
                    value={selectedBatch.endDate}
                    disabled
                    className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Capacity</Label>
                  <Input
                    value={selectedBatch.capacity.toString()}
                    className="h-10 rounded-xl border-slate-200 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Status</Label>
                  <Select defaultValue={selectedBatch.status}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">Assigned Doctor</Label>
                <Select defaultValue={selectedBatch.assignedDoctor}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Bhagyesh Kulkarni">Dr. Bhagyesh Kulkarni</SelectItem>
                    <SelectItem value="Dr. Amit Patel">Dr. Amit Patel</SelectItem>
                    <SelectItem value="Dr. Suresh Kumar">Dr. Suresh Kumar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">Assigned Dietitian</Label>
                <Select defaultValue={selectedBatch.assignedDietitian}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Priya Sharma">Dr. Priya Sharma</SelectItem>
                    <SelectItem value="Dr. Neha Gupta">Dr. Neha Gupta</SelectItem>
                    <SelectItem value="Dr. Anjali Singh">Dr. Anjali Singh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">Assigned Coach</Label>
                <Select defaultValue={selectedBatch.assignedCoach}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coach Rahul Verma">Coach Rahul Verma</SelectItem>
                    <SelectItem value="Coach Sneha Joshi">Coach Sneha Joshi</SelectItem>
                    <SelectItem value="Coach Vikram Singh">Coach Vikram Singh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button className="h-10 px-6 rounded-xl bg-primary text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
