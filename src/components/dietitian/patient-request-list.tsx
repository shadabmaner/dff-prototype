"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, User, Search, CheckCircle2, Edit, X } from "lucide-react"
import { motion } from "framer-motion"
import type { DietitianAppointment } from "@/types/dietitian-clinical"

interface PatientRequestListProps {
  appointments?: DietitianAppointment[]
  isLoading?: boolean
  onConfirm: (request: DietitianAppointment) => void
  onReschedule: (request: DietitianAppointment) => void
  onCancel: (request: DietitianAppointment) => void
  hideActions?: boolean
}

export function PatientRequestList({ appointments, isLoading, onConfirm, onReschedule, onCancel, hideActions }: PatientRequestListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "rescheduled" | "cancelled">("all")

  const requests = appointments ?? []

  const getPatientName = (request: DietitianAppointment) => {
    if (request.patient_name?.trim()) return request.patient_name
    const composed = [request.patient_first_name, request.patient_last_name]
      .filter(Boolean)
      .map((name) => name!.trim())
      .join(" ")
    if (composed) return composed
    if (request.patient_phone) return request.patient_phone
    return request.patient_id ? `Patient #${request.patient_id.slice(0, 6)}` : "Patient"
  }

  const getStatus = (request: DietitianAppointment) => (request.status?.toLowerCase() as "pending" | "confirmed" | "rescheduled" | "cancelled" | undefined) ?? "pending"

  const getPriority = (request: DietitianAppointment): "low" | "medium" | "high" => {
    if (request.priority && ["low", "medium", "high"].includes(request.priority)) {
      return request.priority as "low" | "medium" | "high"
    }
    return "medium"
  }

  const getRequestDate = (request: DietitianAppointment) =>
    request.scheduled_date || request.appointment_date || request.created_at || new Date().toISOString()

  const getReason = (request: DietitianAppointment) => request.reason || `${request.appointment_type} request`

  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => (filterStatus === "all" ? true : getStatus(req) === filterStatus))
      .filter((req) => {
        const name = getPatientName(req).toLowerCase()
        const reason = getReason(req).toLowerCase()
        const query = searchQuery.toLowerCase()
        return name.includes(query) || reason.includes(query)
      })
  }, [requests, filterStatus, searchQuery])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "low":
        return "bg-slate-100 text-slate-700 border-slate-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "rescheduled":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return "--"
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return "--"
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (time?: string) => {
    if (!time) return "--"
    try {
      const parts = time.split(":")
      const date = new Date()
      date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10))
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    } catch {
      return time
    }
  }

  const handleViewProfile = (request: DietitianAppointment) => {
    const name = getPatientName(request)
    router.push(`/dashboard/dietitian/patients/${request.patient_id}?ref=patient-requests&name=${encodeURIComponent(name)}`)
  }

  const pendingCount = requests.filter((r: DietitianAppointment) => getStatus(r) === "pending").length
  const confirmedCount = requests.filter((r: DietitianAppointment) => getStatus(r) === "confirmed").length
  const cancelledCount = requests.filter((r: DietitianAppointment) => getStatus(r) === "cancelled").length

  return (
    <div className="space-y-6">
      {/* Stats Cluster */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
          <CardContent className="p-5 text-center sm:text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">Pending</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
          <CardContent className="p-5 text-center sm:text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/60">Confirmed</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{confirmedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-gradient-to-br from-rose-50 to-pink-50 shadow-sm">
          <CardContent className="p-5 text-center sm:text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-700/60">Cancelled</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{cancelledCount}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-200">
                <X className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
          <CardContent className="p-5 text-center sm:text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-700/60">Total volume</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{requests.length}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                className={filterStatus === "all" ? "bg-slate-900" : "border-slate-300"}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
                className={filterStatus === "pending" ? "bg-slate-900" : "border-slate-300"}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "confirmed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("confirmed")}
                className={filterStatus === "confirmed" ? "bg-slate-900 shadow-sm" : "border-slate-300 text-slate-600"}
              >
                Confirmed
              </Button>
              <Button
                variant={filterStatus === "cancelled" ? "destructive" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("cancelled")}
                className={filterStatus === "cancelled" ? "bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-200" : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-8 space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={`patient-request-skeleton-${idx}`} className="h-20 w-full animate-pulse rounded-lg bg-slate-100" />
              ))}
            </CardContent>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-16 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request, idx) => {
            const status = getStatus(request)
            const priority = getPriority(request)
            return (
              <motion.div
                key={request.appointment_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-slate-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3
                              className="font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => request.patient_id && handleViewProfile(request)}
                            >
                              {getPatientName(request)}
                            </h3>
                            <Badge className={`text-xs border ${getStatusColor(status)}`}>
                              {status}
                            </Badge>
                            <Badge className={`text-xs border ${getPriorityColor(priority)}`}>
                              {priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-700 mb-2">{getReason(request)}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Requested on {formatDate(getRequestDate(request))}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>at {formatTime(request.scheduled_time || request.appointment_time)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!hideActions && status === "pending" && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => onConfirm(request)}
                            className="bg-slate-900 hover:bg-slate-800"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReschedule(request)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCancel(request)}
                            className="border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}

                      {status === "confirmed" && (
                        <Badge className="bg-emerald-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Confirmed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
