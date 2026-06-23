"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ListTodo,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Edit,
  Trash2,
  Users,
  Stethoscope,
  BookOpen,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { BatchFormDrawer } from "@/components/service/batch-form-drawer"

// Static data for service start date batches
const initialBatches = [
  {
    id: "BATCH-001",
    name: "January 2025 Intake",
    speciality: "Diabetes Management",
    program: "Comprehensive Diabetes Care",
    startDate: "2025-01-15",
    endDate: "2025-01-31",
    language: "English",
    capacity: 50,
    enrolled: 42,
    status: "Active",
    description: "New year wellness program batch",
    patients: [
      { id: "PAT-001", name: "Aditya Sharma", phone: "+91 98765 43210", enrolledDate: "2025-01-15" },
      { id: "PAT-002", name: "Priya Patel", phone: "+91 87654 32109", enrolledDate: "2025-01-16" },
      { id: "PAT-003", name: "Rajesh Kumar", phone: "+91 76543 21098", enrolledDate: "2025-01-17" },
    ],
  },
  {
    id: "BATCH-002",
    name: "February 2025 Intake",
    speciality: "Cardiovascular Health",
    program: "Heart Wellness Program",
    startDate: "2025-02-01",
    endDate: "2025-02-15",
    language: "Hindi",
    capacity: 60,
    enrolled: 0,
    status: "Upcoming",
    description: "Mid-winter health batch",
    patients: [],
  },
  {
    id: "BATCH-003",
    name: "December 2024 Intake",
    speciality: "Weight Management",
    program: "Fitness & Nutrition",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    language: "English",
    capacity: 45,
    enrolled: 45,
    status: "Completed",
    description: "Year-end program batch",
    patients: [
      { id: "PAT-004", name: "Sneha Gupta", phone: "+91 65432 10987", enrolledDate: "2024-12-01" },
      { id: "PAT-005", name: "Vikram Singh", phone: "+91 54321 09876", enrolledDate: "2024-12-02" },
      { id: "PAT-006", name: "Anita Desai", phone: "+91 43210 98765", enrolledDate: "2024-12-03" },
    ],
  },
  {
    id: "BATCH-004",
    name: "March 2025 Intake",
    speciality: "Thyroid Care",
    program: "Thyroid Management",
    startDate: "2025-03-01",
    endDate: "2025-03-15",
    language: "Tamil",
    capacity: 55,
    enrolled: 0,
    status: "Upcoming",
    description: "Spring wellness batch",
    patients: [],
  },
]

export default function BatchManagementPage() {
  const [batches, setBatches] = useState(initialBatches)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || batch.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeCount = batches.filter((b) => b.status === "Active").length
  const upcomingCount = batches.filter((b) => b.status === "Upcoming").length
  const completedCount = batches.filter((b) => b.status === "Completed").length

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Upcoming":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Completed":
        return "bg-slate-50 text-slate-600 border-slate-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const handleCreateBatch = (data: any) => {
    const newBatch = {
      id: `BATCH-${String(batches.length + 1).padStart(3, '0')}`,
      ...data,
      capacity: parseInt(data.capacity),
      enrolled: 0,
      status: "Upcoming",
      patients: [],
    }
    setBatches([...batches, newBatch])
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Service Operations / Batch Management</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Batch Management</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Manage service start date batches and track enrollment capacity.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Batch
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Active Batches</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{activeCount}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Currently running</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Upcoming</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{upcomingCount}</p>
                <p className="text-xs text-blue-700/80 font-medium">Scheduled batches</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <ListTodo className="h-3 w-3 text-slate-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-slate-700 font-semibold">Completed</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{completedCount}</p>
                <p className="text-xs text-slate-700/80 font-medium">Finished batches</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by batch name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Cards */}
      <div className="space-y-4">
        {filteredBatches.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No batches found"
            description="Try adjusting your search terms or filters."
            className=""
          />
        ) : (
          filteredBatches.map((batch, idx) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl group">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      {/* Batch Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{batch.name}</h3>
                            <Badge className={cn("text-xs font-medium px-3 py-0.5", getStatusColor(batch.status))}>
                              {batch.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{batch.id}</p>
                        </div>
                      </div>

                      {/* Batch Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Speciality</p>
                            <p className="text-sm font-semibold text-slate-900">{batch.speciality}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Program</p>
                            <p className="text-sm font-semibold text-slate-900">{batch.program}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Start Date</p>
                            <p className="text-sm font-semibold text-slate-900">{formatDate(batch.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-amber-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Language</p>
                            <p className="text-sm font-semibold text-slate-900">{batch.language}</p>
                          </div>
                        </div>
                      </div>

                      {/* Enrollment Details */}
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <ListTodo className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Enrolled</p>
                            <p className="text-sm font-semibold text-slate-900">{batch.enrolled} / {batch.capacity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Available</p>
                            <p className="text-sm font-semibold text-slate-900">{batch.capacity - batch.enrolled}</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Enrollment Progress</span>
                          <span className="font-semibold text-slate-900">{Math.round((batch.enrolled / batch.capacity) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              batch.status === "Active" ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                              batch.status === "Upcoming" ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                              "bg-gradient-to-r from-slate-400 to-gray-400"
                            )}
                            style={{ width: `${(batch.enrolled / batch.capacity) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-4">{batch.description}</p>

                      {/* View Patients Toggle */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
                        className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-9 px-4 mb-4"
                      >
                        <Users className="h-4 w-4 mr-1.5" />
                        {expandedBatch === batch.id ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Patients ({batch.patients.length})
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            View Patients ({batch.patients.length})
                          </>
                        )}
                      </Button>

                      {/* Patients List */}
                      {expandedBatch === batch.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-200 pt-4 mt-4"
                        >
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                            Enrolled Patients
                          </p>
                          {batch.patients.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No patients enrolled yet</p>
                          ) : (
                            <div className="space-y-2">
                              {batch.patients.map((patient, pIdx) => (
                                <div
                                  key={patient.id}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                                      {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                                      <p className="text-xs text-slate-500">{patient.id} • {patient.phone}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500">Enrolled</p>
                                    <p className="text-sm font-semibold text-slate-900">{formatDate(patient.enrolledDate)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 font-semibold shadow-sm h-10 px-4"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Batch Form Drawer */}
      <BatchFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSubmit={handleCreateBatch}
      />
    </div>
  )
}
