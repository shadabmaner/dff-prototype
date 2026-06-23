"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  ChevronRight,
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
import { cn } from "@/lib/utils"
import Link from "next/link"

// Types
type ReviewStatus = "Pending Review" | "Under Review" | "Consultation Scheduled" | "Reviewed" | "Program Recommended" | "Closed"
type AssessmentSource = "Patient Submitted" | "Service Team Submitted"
type ProgramInterest = "Diabetes (DFF)" | "Thyroid (TFF)" | "Obesity / Healthy BMI" | "PCOD" | "Fatty Liver"
type Priority = "Low" | "Medium" | "High" | "Critical"

interface Assessment {
  id: string
  assessmentId: string
  patientName: string
  patientId: string
  contactNumber: string
  assessmentDate: string
  source: AssessmentSource
  programInterest: ProgramInterest
  reviewStatus: ReviewStatus
  priority: Priority
  assignedDietitian: string
  assignedCoach: string
  assignedServiceExecutive: string
}

// Mock Data
const mockAssessments: Assessment[] = [
  {
    id: "1",
    assessmentId: "AS-2026-001",
    patientName: "Rajesh Kumar",
    patientId: "PT-2026-001",
    contactNumber: "+91 9876543210",
    assessmentDate: "2026-01-18",
    source: "Patient Submitted",
    programInterest: "Diabetes (DFF)",
    reviewStatus: "Pending Review",
    priority: "High",
    assignedDietitian: "Priya Sharma",
    assignedCoach: "Amit Patel",
    assignedServiceExecutive: "Rahul Verma",
  },
  {
    id: "2",
    assessmentId: "AS-2026-002",
    patientName: "Sneha Gupta",
    patientId: "PT-2026-002",
    contactNumber: "+91 9876543211",
    assessmentDate: "2026-01-17",
    source: "Service Team Submitted",
    programInterest: "Thyroid (TFF)",
    reviewStatus: "Pending Review",
    priority: "Medium",
    assignedDietitian: "Neha Singh",
    assignedCoach: "Vikram Joshi",
    assignedServiceExecutive: "Rahul Verma",
  },
  {
    id: "3",
    assessmentId: "AS-2026-003",
    patientName: "Amit Singh",
    patientId: "PT-2026-003",
    contactNumber: "+91 9876543212",
    assessmentDate: "2026-01-16",
    source: "Patient Submitted",
    programInterest: "Obesity / Healthy BMI",
    reviewStatus: "Under Review",
    priority: "Critical",
    assignedDietitian: "Priya Sharma",
    assignedCoach: "Amit Patel",
    assignedServiceExecutive: "Suresh Kumar",
  },
  {
    id: "4",
    assessmentId: "AS-2026-004",
    patientName: "Priya Patel",
    patientId: "PT-2026-004",
    contactNumber: "+91 9876543213",
    assessmentDate: "2026-01-15",
    source: "Service Team Submitted",
    programInterest: "PCOD",
    reviewStatus: "Program Recommended",
    priority: "High",
    assignedDietitian: "Neha Singh",
    assignedCoach: "Vikram Joshi",
    assignedServiceExecutive: "Rahul Verma",
  },
  {
    id: "5",
    assessmentId: "AS-2026-005",
    patientName: "Vikram Joshi",
    patientId: "PT-2026-005",
    contactNumber: "+91 9876543214",
    assessmentDate: "2026-01-14",
    source: "Patient Submitted",
    programInterest: "Fatty Liver",
    reviewStatus: "Consultation Scheduled",
    priority: "Medium",
    assignedDietitian: "Priya Sharma",
    assignedCoach: "Amit Patel",
    assignedServiceExecutive: "Suresh Kumar",
  },
  {
    id: "6",
    assessmentId: "AS-2026-006",
    patientName: "Neha Singh",
    patientId: "PT-2026-006",
    contactNumber: "+91 9876543215",
    assessmentDate: "2026-01-13",
    source: "Service Team Submitted",
    programInterest: "Diabetes (DFF)",
    reviewStatus: "Reviewed",
    priority: "Low",
    assignedDietitian: "Priya Sharma",
    assignedCoach: "Amit Patel",
    assignedServiceExecutive: "Rahul Verma",
  },
  {
    id: "7",
    assessmentId: "AS-2026-007",
    patientName: "Suresh Kumar",
    patientId: "PT-2026-007",
    contactNumber: "+91 9876543216",
    assessmentDate: "2026-01-12",
    source: "Patient Submitted",
    programInterest: "Thyroid (TFF)",
    reviewStatus: "Closed",
    priority: "Medium",
    assignedDietitian: "Neha Singh",
    assignedCoach: "Vikram Joshi",
    assignedServiceExecutive: "Suresh Kumar",
  },
  {
    id: "8",
    assessmentId: "AS-2026-008",
    patientName: "Anjali Mehta",
    patientId: "PT-2026-008",
    contactNumber: "+91 9876543217",
    assessmentDate: "2026-01-11",
    source: "Service Team Submitted",
    programInterest: "Obesity / Healthy BMI",
    reviewStatus: "Pending Review",
    priority: "High",
    assignedDietitian: "Priya Sharma",
    assignedCoach: "Amit Patel",
    assignedServiceExecutive: "Rahul Verma",
  },
]

const statusColors: Record<ReviewStatus, string> = {
  "Pending Review": "bg-amber-100 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-100 text-blue-700 border-blue-200",
  "Consultation Scheduled": "bg-purple-100 text-purple-700 border-purple-200",
  "Reviewed": "bg-slate-100 text-slate-700 border-slate-200",
  "Program Recommended": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Closed": "bg-gray-100 text-gray-700 border-gray-200",
}

const priorityColors: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
}

export default function AssessmentReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("Pending Review")
  const [selectedSource, setSelectedSource] = useState<string>("all")
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("assessmentDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calculate summary stats
  const pendingCount = mockAssessments.filter((a) => a.reviewStatus === "Pending Review").length
  const underReviewCount = mockAssessments.filter((a) => a.reviewStatus === "Under Review").length
  const recommendedCount = mockAssessments.filter((a) => a.reviewStatus === "Program Recommended").length
  const criticalCount = mockAssessments.filter((a) => a.priority === "Critical").length

  // Filter assessments
  const filteredAssessments = mockAssessments
    .filter((assessment) => {
      const matchesSearch =
        assessment.assessmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.contactNumber.includes(searchTerm)
      const matchesStatus = selectedStatus === "all" || assessment.reviewStatus === selectedStatus
      const matchesSource = selectedSource === "all" || assessment.source === selectedSource
      const matchesProgram = selectedProgram === "all" || assessment.programInterest === selectedProgram
      const matchesPriority = selectedPriority === "all" || assessment.priority === selectedPriority
      return matchesSearch && matchesStatus && matchesSource && matchesProgram && matchesPriority
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "assessmentDate") {
        comparison = new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime()
      } else if (sortBy === "patientName") {
        comparison = a.patientName.localeCompare(b.patientName)
      } else if (sortBy === "priority") {
        const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
      } else if (sortBy === "reviewStatus") {
        comparison = a.reviewStatus.localeCompare(b.reviewStatus)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  // Pagination
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAssessments = filteredAssessments.slice(startIndex, endIndex)

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
      setSortOrder("desc")
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
            Assessment <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Reviews</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Review patient assessments, medical history, and recommend appropriate healthcare programs
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Under Review</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{underReviewCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Program Recommended</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{recommendedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Critical Priority</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{criticalCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
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
              <label className="text-sm font-medium text-slate-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Assessment ID, Patient Name, Patient ID, Contact Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Review Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Consultation Scheduled">Consultation Scheduled</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Program Recommended">Program Recommended</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Assessment Source</label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Patient Submitted">Patient Submitted</SelectItem>
                  <SelectItem value="Service Team Submitted">Service Team Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Program Interest</label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="Diabetes (DFF)">Diabetes (DFF)</SelectItem>
                  <SelectItem value="Thyroid (TFF)">Thyroid (TFF)</SelectItem>
                  <SelectItem value="Obesity / Healthy BMI">Obesity / Healthy BMI</SelectItem>
                  <SelectItem value="PCOD">PCOD</SelectItem>
                  <SelectItem value="Fatty Liver">Fatty Liver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Grid */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Assessment Review Queue</CardTitle>
          <CardDescription>
            {filteredAssessments.length} assessments found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("assessmentDate")}>
                    <div className="flex items-center gap-1">
                      Assessment Date
                      {sortBy === "assessmentDate" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("patientName")}>
                    <div className="flex items-center gap-1">
                      Patient Name
                      {sortBy === "patientName" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Program Interest</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("reviewStatus")}>
                    <div className="flex items-center gap-1">
                      Review Status
                      {sortBy === "reviewStatus" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("priority")}>
                    <div className="flex items-center gap-1">
                      Priority
                      {sortBy === "priority" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssessments.map((assessment, index) => (
                  <motion.tr
                    key={assessment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{assessment.assessmentId}</p>
                        <p className="text-xs text-slate-500">{formatDate(assessment.assessmentDate)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{assessment.patientName}</p>
                          <p className="text-xs text-slate-500">{assessment.contactNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{assessment.patientId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{assessment.source}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{assessment.programInterest}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", statusColors[assessment.reviewStatus])}>
                        {assessment.reviewStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", priorityColors[assessment.priority])}>
                        {assessment.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/doctor/assessment-reviews/${assessment.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                          <Eye className="h-4 w-4 text-slate-600" />
                        </Button>
                      </Link>
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
    </div>
  )
}
