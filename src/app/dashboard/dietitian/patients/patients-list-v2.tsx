"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, User, Calendar, FileText, Users, Activity, AlertTriangle, TrendingUp, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface Patient {
  id: string
  name: string
  age: number
  programStage: "Month 1" | "Month 2" | "Month 3"
  lastConsult: string
  status: "active" | "completed" | "inactive"
  adherence: number
  riskLevel: "low" | "medium" | "high"
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Rahul Patil",
    age: 45,
    programStage: "Month 2",
    lastConsult: "Mar 8, 2026",
    status: "active",
    adherence: 88,
    riskLevel: "low"
  },
  {
    id: "2",
    name: "Priya Sharma",
    age: 38,
    programStage: "Month 1",
    lastConsult: "Mar 9, 2026",
    status: "active",
    adherence: 92,
    riskLevel: "low"
  },
  {
    id: "3",
    name: "Amit Kumar",
    age: 52,
    programStage: "Month 3",
    lastConsult: "Mar 7, 2026",
    status: "active",
    adherence: 65,
    riskLevel: "high"
  },
  {
    id: "4",
    name: "Sneha Rao",
    age: 42,
    programStage: "Month 2",
    lastConsult: "Mar 6, 2026",
    status: "active",
    adherence: 75,
    riskLevel: "medium"
  },
  {
    id: "5",
    name: "Vikram Shah",
    age: 48,
    programStage: "Month 3",
    lastConsult: "Feb 28, 2026",
    status: "completed",
    adherence: 95,
    riskLevel: "low"
  },
]

export default function PatientsListClient() {
  const [patients] = useState(mockPatients)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    const matchesStage = stageFilter === "all" || patient.programStage === stageFilter
    const matchesRisk = riskFilter === "all" || patient.riskLevel === riskFilter
    return matchesSearch && matchesStatus && matchesStage && matchesRisk
  })

  const activeCount = patients.filter(p => p.status === "active").length
  const completedCount = patients.filter(p => p.status === "completed").length
  const highRiskCount = patients.filter(p => p.riskLevel === "high" && p.status === "active").length

  return (
    <div className="space-y-6 pb-20 px-4 md:px-0 bg-gradient-to-br from-slate-50 via-cyan-50/20 to-teal-50/10 min-h-screen">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-teal-950 to-cyan-950 p-8 md:p-12 shadow-2xl border border-white/10 mx-1"
      >
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[20%] h-[200%] w-[80%] rounded-full bg-teal-500/20 blur-[150px]" />
          <div className="absolute -bottom-[40%] -left-[20%] h-[200%] w-[80%] rounded-full bg-cyan-500/20 blur-[150px]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-xl shadow-teal-500/30 border border-white/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="rounded-xl border-white/20 bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 shadow-inner backdrop-blur-sm">
                PATIENT DATABASE
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-1 rounded-full bg-teal-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Population Management</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Patient <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent italic">Registry</span>
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3 px-1"
      >
        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-teal-50/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-[1.75rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Patients</p>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{activeCount}</p>
                <p className="text-[10px] font-bold text-teal-600 mt-1">Currently Enrolled</p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-blue-50/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-[1.75rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Completed</p>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{completedCount}</p>
                <p className="text-[10px] font-bold text-blue-600 mt-1">Program Finished</p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-rose-50/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-[1.75rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">High Risk</p>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{highRiskCount}</p>
                <p className="text-[10px] font-bold text-rose-600 mt-1">Need Attention</p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col lg:flex-row gap-4 px-1"
      >
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search patients by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-14 rounded-2xl border-none bg-white shadow-lg text-base font-semibold placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-500"
          />
        </div>
        
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-lg">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-[140px] rounded-xl border-none font-bold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-11 w-[140px] rounded-xl border-none font-bold">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Month 1">Month 1</SelectItem>
              <SelectItem value="Month 2">Month 2</SelectItem>
              <SelectItem value="Month 3">Month 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="h-11 w-[140px] rounded-xl border-none font-bold">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Patients List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 px-1"
      >
        {filteredPatients.length === 0 ? (
          <Card className="border-none shadow-lg rounded-2xl bg-white">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-400">No patients found</p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient, idx) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Patient Info */}
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <User className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{patient.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-slate-500 font-medium">{patient.age} years</span>
                          <Badge className="text-[10px] font-black bg-slate-100 text-slate-600 border-none">
                            {patient.programStage}
                          </Badge>
                          <Badge className={`text-[10px] font-black border-none ${
                            patient.status === "active" ? "bg-teal-100 text-teal-700" :
                            patient.status === "completed" ? "bg-blue-100 text-blue-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {patient.status.toUpperCase()}
                          </Badge>
                          {patient.riskLevel === "high" && (
                            <Badge className="text-[10px] font-black bg-rose-100 text-rose-700 border-none">
                              ⚠ High Risk
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Adherence and Actions */}
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adherence</p>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                patient.adherence >= 80 ? "bg-gradient-to-r from-emerald-500 to-emerald-600" :
                                patient.adherence >= 60 ? "bg-gradient-to-r from-amber-500 to-amber-600" :
                                "bg-gradient-to-r from-rose-500 to-rose-600"
                              }`}
                              style={{ width: `${patient.adherence}%` }}
                            />
                          </div>
                          <span className={`text-sm font-black tabular-nums ${
                            patient.adherence >= 80 ? "text-emerald-600" :
                            patient.adherence >= 60 ? "text-amber-600" :
                            "text-rose-600"
                          }`}>
                            {patient.adherence}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link href={`/dashboard/dietitian/patients/${patient.id}`}>
                          <Button
                            size="sm"
                            className="rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/30 font-bold"
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1.5" />
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-2 hover:bg-slate-50 font-bold"
                        >
                          <Calendar className="h-4 w-4 mr-1.5" />
                          Book
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-2 hover:bg-slate-50 font-bold"
                        >
                          <FileText className="h-4 w-4 mr-1.5" />
                          Notes
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Last Consult Info */}
                  <div className="mt-4 pt-4 border-t border-dashed flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Last Consultation: {patient.lastConsult}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
