"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Pill,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Printer,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const prescriptions = [
  {
    id: "RX-9021",
    patientName: "Aditya Sharma",
    date: "2024-12-18",
    medicines: [
      { name: "Metformin", dosage: "500mg", timing: "Twice daily", duration: "30 days" },
      { name: "Glimepiride", dosage: "2mg", timing: "Once daily - Morning", duration: "15 days" },
    ],
    status: "Active",
    type: "Renewal",
    doctor: "Dr. Wilson",
  },
  {
    id: "RX-9018",
    patientName: "Priya Patel",
    date: "2024-12-15",
    medicines: [
      { name: "Levothyroxine", dosage: "75mcg", timing: "Once daily - Empty stomach", duration: "60 days" },
    ],
    status: "Active",
    type: "New",
    doctor: "Dr. Wilson",
  },
  {
    id: "RX-8995",
    patientName: "Rajesh Kumar",
    date: "2024-12-10",
    medicines: [
      { name: "Atorvastatin", dosage: "20mg", timing: "Bedtime", duration: "30 days" },
      { name: "Aspirin", dosage: "75mg", timing: "Once daily", duration: "30 days" },
    ],
    status: "Completed",
    type: "Renewal",
    doctor: "Dr. Wilson",
  },
]

export default function FitnessCoachSupplementPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = prescriptions.filter((p) => p.status === "Active").length
  const completedCount = prescriptions.filter((p) => p.status === "Completed").length
  const totalMedicines = prescriptions.reduce((acc, p) => acc + p.medicines.length, 0)

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
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Fitness Coach Portal / Supplement Protocols</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Supplement Protocols</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Generate and track digital supplement protocols with performance precision.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Active Protocols</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{activeCount}</p>
                <p className="text-xs text-blue-700/80 font-medium">Currently active</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Pill className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Completed</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{completedCount}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Cycles finished</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Total Supplements</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{totalMedicines}</p>
                <p className="text-xs text-amber-700/80 font-medium">Across all protocols</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by patient name or protocol ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Prescription Cards */}
      <div className="space-y-4">
        {filteredPrescriptions.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No protocols found"
            description="Try adjusting your search terms."
            className=""
          />
        ) : (
          filteredPrescriptions.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl group">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      {/* Patient Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                          <User className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{p.patientName}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="text-xs text-slate-500 font-medium">{p.id}</span>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-xs font-semibold text-slate-600">{formatDate(p.date)}</span>
                            </div>
                            <Badge className={cn(
                              "text-xs font-medium px-3 py-0.5",
                              p.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-50 text-slate-600 border border-slate-200"
                            )}>
                              {p.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs font-medium border-slate-300 text-slate-600">
                              {p.type}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Medicines */}
                      <div className="space-y-2 ml-[72px]">
                        {p.medicines.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-50/80 border border-slate-100 hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Pill className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-bold text-slate-900">{m.name}</p>
                                <p className="text-xs text-slate-500">{m.dosage} &mdash; {m.timing}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs font-medium border-slate-200 text-slate-500 mt-2 sm:mt-0 w-fit">
                              {m.duration}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                      >
                        <Printer className="h-4 w-4 mr-1.5" />
                        Print
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg shadow-slate-900/20 h-10 px-4"
                      >
                        Refill
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
