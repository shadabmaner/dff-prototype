"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Settings2, 
  Plus, 
  Search,
  Filter,
  Users,
  Activity,
  Stethoscope,
  Utensils,
  Dumbbell,
  MoreHorizontal,
  Download,
  Upload,
  Layers,
  Target,
  Copy,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
type Specialty = "Diabetes (DFF)" | "Thyroid (TFF)" | "Obesity / Healthy BMI"

interface Program {
  id: string
  name: string
  code: string
  specialty: Specialty
  language: string
  duration: string
  price: number
  status: "Active" | "Inactive"
  enrollments: number
}

const mockPrograms: Program[] = [
  {
    id: "prog-001",
    name: "Diabetes Care Premium",
    code: "DFF-PRM-001",
    specialty: "Diabetes (DFF)",
    language: "English",
    duration: "12 Months",
    price: 15000,
    status: "Active",
    enrollments: 245
  },
  {
    id: "prog-002",
    name: "Thyroid Management Basic",
    code: "TFF-BSC-001",
    specialty: "Thyroid (TFF)",
    language: "Hindi",
    duration: "6 Months",
    price: 10000,
    status: "Active",
    enrollments: 128
  },
  {
    id: "prog-003",
    name: "Healthy BMI Transformation",
    code: "BMI-TRN-001",
    specialty: "Obesity / Healthy BMI",
    language: "Marathi",
    duration: "90 Days",
    price: 8000,
    status: "Active",
    enrollments: 89
  },
  {
    id: "prog-004",
    name: "Diabetes Care Standard",
    code: "DFF-STD-001",
    specialty: "Diabetes (DFF)",
    language: "English",
    duration: "6 Months",
    price: 12000,
    status: "Inactive",
    enrollments: 156
  },
]

export default function ProgramManagementLandingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | "All">("All")
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Active" | "Inactive">("All")
  const [selectedLanguage, setSelectedLanguage] = useState<"All" | "English" | "Hindi" | "Marathi">("All")

  const filteredPrograms = mockPrograms.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = selectedSpecialty === "All" || program.specialty === selectedSpecialty
    const matchesStatus = selectedStatus === "All" || program.status === selectedStatus
    const matchesLanguage = selectedLanguage === "All" || program.language === selectedLanguage
    return matchesSearch && matchesSpecialty && matchesStatus && matchesLanguage
  })

  const activePrograms = mockPrograms.filter(p => p.status === "Active").length
  const dffPrograms = mockPrograms.filter(p => p.specialty === "Diabetes (DFF)").length
  const tffPrograms = mockPrograms.filter(p => p.specialty === "Thyroid (TFF)").length
  const bmiPrograms = mockPrograms.filter(p => p.specialty === "Obesity / Healthy BMI").length

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Program Catalog</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Program <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Management</span></h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">View and manage healthcare programs across all specialties.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/admin/program-management/new">
            <Button className="h-11 px-6 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/30">
              <Plus className="mr-2 h-4 w-4" />
              Create Program
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Active Programs</p>
                <p className="text-3xl font-bold text-slate-900">{activePrograms}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Layers className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Diabetes (DFF)</p>
                <p className="text-3xl font-bold text-slate-900">{dffPrograms}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-gradient-to-br from-purple-50 to-violet-50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Thyroid (TFF)</p>
                <p className="text-3xl font-bold text-slate-900">{tffPrograms}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Healthy BMI</p>
                <p className="text-3xl font-bold text-slate-900">{bmiPrograms}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 w-64 rounded-xl border-slate-200"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Specialty:</span>
            <Select value={selectedSpecialty} onValueChange={(v) => setSelectedSpecialty(v as Specialty | "All")}>
              <SelectTrigger className="h-11 w-40 rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Diabetes (DFF)">Diabetes (DFF)</SelectItem>
                <SelectItem value="Thyroid (TFF)">Thyroid (TFF)</SelectItem>
                <SelectItem value="Obesity / Healthy BMI">Obesity / Healthy BMI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Status:</span>
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as "All" | "Active" | "Inactive")}>
              <SelectTrigger className="h-11 w-32 rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Language:</span>
            <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as "All" | "English" | "Hindi" | "Marathi")}>
              <SelectTrigger className="h-11 w-32 rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Marathi">Marathi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Program Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPrograms.map((program) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-900">{program.name}</CardTitle>
                    <CardDescription className="mt-1">{program.code}</CardDescription>
                  </div>
                  <Badge className={program.status === "Active" ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"}>
                    {program.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Specialty</span>
                    <Badge variant="outline" className="border-primary text-primary">{program.specialty}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Language</span>
                    <span className="text-sm font-semibold text-slate-900">{program.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Duration</span>
                    <span className="text-sm font-semibold text-slate-900">{program.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Price</span>
                    <span className="text-sm font-bold text-slate-900">₹{program.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Enrollments</span>
                    <span className="text-sm font-bold text-slate-900">{program.enrollments}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <Link href={`/dashboard/admin/program-management/${program.id}`} className="flex-1">
                    <Button className="w-full h-10 rounded-xl bg-primary text-white font-semibold">
                      Configure
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-lg font-semibold text-slate-900">No programs found</p>
          <p className="text-sm text-slate-600 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
