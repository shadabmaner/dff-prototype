"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Target,
  User,
  Calendar,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  ChevronRight,
  FileText,
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
type RecommendationStatus = "Pending Enrollment" | "Enrollment Initiated" | "Enrolled" | "Cancelled"
type Program = "Healthy BMI 90 Days" | "Healthy BMI 7 Days" | "Diabetes Reversal Program" | "Thyroid Reversal Program" | "PCOD Reversal Program" | "Fatty Liver Reversal Program"
type Severity = "Mild" | "Moderate" | "Severe" | "Critical"

interface ProgramRecommendation {
  id: string
  recommendationId: string
  patientName: string
  patientId: string
  contactNumber: string
  recommendedProgram: Program
  programDuration: string
  severity: Severity
  recommendationDate: string
  recommendationNotes: string
  status: RecommendationStatus
  assignedDietitian: string
  assignedServiceExecutive: string
}

// Mock Data
const mockRecommendations: ProgramRecommendation[] = [
  {
    id: "1",
    recommendationId: "PR-2026-001",
    patientName: "Rajesh Kumar",
    patientId: "PT-2026-001",
    contactNumber: "+91 9876543210",
    recommendedProgram: "Diabetes Reversal Program",
    programDuration: "180 Days",
    severity: "Moderate",
    recommendationDate: "2026-01-18",
    recommendationNotes: "Patient has elevated HbA1c and obesity. Recommended structured diabetes reversal protocol.",
    status: "Pending Enrollment",
    assignedDietitian: "Priya Sharma",
    assignedServiceExecutive: "Rahul Verma",
  },
  {
    id: "2",
    recommendationId: "PR-2026-002",
    patientName: "Sneha Gupta",
    patientId: "PT-2026-002",
    contactNumber: "+91 9876543211",
    recommendedProgram: "Thyroid Reversal Program",
    programDuration: "90 Days",
    severity: "Mild",
    recommendationDate: "2026-01-17",
    recommendationNotes: "Patient has mild thyroid dysfunction. Recommended 90-day reversal program.",
    status: "Enrollment Initiated",
    assignedDietitian: "Neha Singh",
    assignedServiceExecutive: "Rahul Verma",
  },
  {
    id: "3",
    recommendationId: "PR-2026-003",
    patientName: "Amit Singh",
    patientId: "PT-2026-003",
    contactNumber: "+91 9876543212",
    recommendedProgram: "Healthy BMI 90 Days",
    programDuration: "90 Days",
    severity: "Severe",
    recommendationDate: "2026-01-16",
    recommendationNotes: "Patient has severe obesity with BMI 36. Recommended intensive weight management program.",
    status: "Enrolled",
    assignedDietitian: "Priya Sharma",
    assignedServiceExecutive: "Suresh Kumar",
  },
  {
    id: "4",
    recommendationId: "PR-2026-004",
    patientName: "Priya Patel",
    patientId: "PT-2026-004",
    contactNumber: "+91 9876543213",
    recommendedProgram: "PCOD Reversal Program",
    programDuration: "90 Days",
    severity: "Moderate",
    recommendationDate: "2026-01-15",
    recommendationNotes: "Patient has PCOD with hormonal imbalance. Recommended structured reversal protocol.",
    status: "Pending Enrollment",
    assignedDietitian: "Neha Singh",
    assignedServiceExecutive: "Rahul Verma",
  },
  {
    id: "5",
    recommendationId: "PR-2026-005",
    patientName: "Vikram Joshi",
    patientId: "PT-2026-005",
    contactNumber: "+91 9876543214",
    recommendedProgram: "Fatty Liver Reversal Program",
    programDuration: "60 Days",
    severity: "Moderate",
    recommendationDate: "2026-01-14",
    recommendationNotes: "Patient has fatty liver grade 2. Recommended 60-day reversal program.",
    status: "Enrollment Initiated",
    assignedDietitian: "Priya Sharma",
    assignedServiceExecutive: "Suresh Kumar",
  },
  {
    id: "6",
    recommendationId: "PR-2026-006",
    patientName: "Neha Singh",
    patientId: "PT-2026-006",
    contactNumber: "+91 9876543215",
    recommendedProgram: "Healthy BMI 7 Days",
    programDuration: "7 Days",
    severity: "Mild",
    recommendationDate: "2026-01-13",
    recommendationNotes: "Patient needs quick weight management. Recommended 7-day intensive program.",
    status: "Cancelled",
    assignedDietitian: "Priya Sharma",
    assignedServiceExecutive: "Rahul Verma",
  },
]

const statusColors: Record<RecommendationStatus, string> = {
  "Pending Enrollment": "bg-amber-100 text-amber-700 border-amber-200",
  "Enrollment Initiated": "bg-blue-100 text-blue-700 border-blue-200",
  "Enrolled": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Cancelled": "bg-gray-100 text-gray-700 border-gray-200",
}

const severityColors: Record<Severity, string> = {
  Mild: "bg-green-100 text-green-700 border-green-200",
  Moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Severe: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
}

export default function ProgramRecommendationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recommendationDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calculate summary stats
  const pendingCount = mockRecommendations.filter((r) => r.status === "Pending Enrollment").length
  const initiatedCount = mockRecommendations.filter((r) => r.status === "Enrollment Initiated").length
  const enrolledCount = mockRecommendations.filter((r) => r.status === "Enrolled").length
  const criticalCount = mockRecommendations.filter((r) => r.severity === "Critical").length

  // Filter recommendations
  const filteredRecommendations = mockRecommendations
    .filter((recommendation) => {
      const matchesSearch =
        recommendation.recommendationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recommendation.contactNumber.includes(searchTerm)
      const matchesStatus = selectedStatus === "all" || recommendation.status === selectedStatus
      const matchesProgram = selectedProgram === "all" || recommendation.recommendedProgram === selectedProgram
      const matchesSeverity = selectedSeverity === "all" || recommendation.severity === selectedSeverity
      return matchesSearch && matchesStatus && matchesProgram && matchesSeverity
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "recommendationDate") {
        comparison = new Date(a.recommendationDate).getTime() - new Date(b.recommendationDate).getTime()
      } else if (sortBy === "patientName") {
        comparison = a.patientName.localeCompare(b.patientName)
      } else if (sortBy === "severity") {
        const severityOrder = { Critical: 0, Severe: 1, Moderate: 2, Mild: 3 }
        comparison = severityOrder[a.severity] - severityOrder[b.severity]
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  // Pagination
  const totalPages = Math.ceil(filteredRecommendations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRecommendations = filteredRecommendations.slice(startIndex, endIndex)

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
            Program <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Recommendations</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            View and manage all program recommendations made to patients
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Enrollment</p>
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
                <p className="text-sm text-slate-600">Enrollment Initiated</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{initiatedCount}</p>
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
                <p className="text-sm text-slate-600">Enrolled</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{enrolledCount}</p>
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
                <p className="text-sm text-slate-600">Critical Severity</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{criticalCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-red-600" />
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
                  placeholder="Search by Recommendation ID, Patient Name, Patient ID, Contact Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending Enrollment">Pending Enrollment</SelectItem>
                  <SelectItem value="Enrollment Initiated">Enrollment Initiated</SelectItem>
                  <SelectItem value="Enrolled">Enrolled</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Program</label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="Healthy BMI 90 Days">Healthy BMI 90 Days</SelectItem>
                  <SelectItem value="Healthy BMI 7 Days">Healthy BMI 7 Days</SelectItem>
                  <SelectItem value="Diabetes Reversal Program">Diabetes Reversal Program</SelectItem>
                  <SelectItem value="Thyroid Reversal Program">Thyroid Reversal Program</SelectItem>
                  <SelectItem value="PCOD Reversal Program">PCOD Reversal Program</SelectItem>
                  <SelectItem value="Fatty Liver Reversal Program">Fatty Liver Reversal Program</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Severity</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Mild">Mild</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Severe">Severe</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Program Recommendations</CardTitle>
          <CardDescription>
            {filteredRecommendations.length} recommendations found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("recommendationDate")}>
                    <div className="flex items-center gap-1">
                      Recommendation Date
                      {sortBy === "recommendationDate" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("patientName")}>
                    <div className="flex items-center gap-1">
                      Patient Name
                      {sortBy === "patientName" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Recommended Program</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("severity")}>
                    <div className="flex items-center gap-1">
                      Severity
                      {sortBy === "severity" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
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
                {paginatedRecommendations.map((recommendation, index) => (
                  <motion.tr
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{recommendation.recommendationId}</p>
                        <p className="text-xs text-slate-500">{formatDate(recommendation.recommendationDate)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{recommendation.patientName}</p>
                          <p className="text-xs text-slate-500">{recommendation.contactNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{recommendation.patientId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{recommendation.recommendedProgram}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{recommendation.programDuration}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", severityColors[recommendation.severity])}>
                        {recommendation.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", statusColors[recommendation.status])}>
                        {recommendation.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/doctor/assessment-reviews/${recommendation.id}`}>
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
