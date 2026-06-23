"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, Video, Phone, Edit, X, FileText, User, Search, Link as LinkIcon, CheckCircle2, ArrowUpRight } from "lucide-react"
import { AddConsultationLinkModal } from "@/components/dietitian/add-consultation-link-modal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Appointment {
  id: string
  patient: string
  time: string
  programStage: string
  status: "confirmed" | "completed" | "cancelled"
  consultationLink?: string
  notes?: string
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patient: "Rahul Patil",
    time: "10:30 AM",
    programStage: "Month 2",
    status: "confirmed",
  },
  {
    id: "2",
    patient: "Priya Sharma",
    time: "11:30 AM",
    programStage: "Month 1",
    status: "confirmed",
    consultationLink: "https://meet.medikiz.com/abc123"
  },
  {
    id: "3",
    patient: "Amit Kumar",
    time: "09:00 AM",
    programStage: "Month 3",
    status: "completed",
    consultationLink: "https://meet.medikiz.com/xyz789"
  },
  {
    id: "4",
    patient: "Sneha Rao",
    time: "02:00 PM",
    programStage: "Month 1",
    status: "cancelled",
  },
]

export default function AppointmentsClient() {
  const [appointments, setAppointments] = useState(mockAppointments)
  const [selectedTab, setSelectedTab] = useState("confirmed")
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<{ patient: string; time: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleStartConsultation = (appointment: Appointment) => {
    if (!appointment.consultationLink) {
      toast.error("Please add a consultation link first")
      return
    }
    window.open(appointment.consultationLink, "_blank")
    toast.success("Starting consultation...")
  }

  const handleAddConsultationLink = (appointment: Appointment) => {
    setSelectedAppointment({
      patient: appointment.patient,
      time: appointment.time
    })
    setShowConsultationModal(true)
  }

  const handleReschedule = (appointmentId: string) => {
    toast.info("Redirecting to reschedule...")
  }

  const handleCancel = (appointmentId: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: "cancelled" as const } : apt
    ))
    toast.success("Appointment cancelled")
  }

  const handleAddNotes = (appointmentId: string) => {
    toast.info("Opening notes editor...")
  }

  const handleViewProfile = (appointmentId: string) => {
    toast.info("Opening patient profile...")
  }

  const filteredAppointments = appointments
    .filter(apt => apt.status === selectedTab)
    .filter(apt => apt.patient.toLowerCase().includes(searchQuery.toLowerCase()))

  const confirmedCount = appointments.filter(a => a.status === "confirmed").length
  const completedCount = appointments.filter(a => a.status === "completed").length
  const cancelledCount = appointments.filter(a => a.status === "cancelled").length

  return (
    <div className="space-y-6 pb-20 px-4 md:px-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 min-h-screen">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-blue-950 to-indigo-950 p-8 md:p-12 shadow-2xl border border-white/10 mx-1"
      >
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[20%] h-[200%] w-[80%] rounded-full bg-blue-500/20 blur-[150px]" />
          <div className="absolute -bottom-[40%] -left-[20%] h-[200%] w-[80%] rounded-full bg-indigo-500/20 blur-[150px]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 border border-white/20">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="rounded-xl border-white/20 bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 shadow-inner backdrop-blur-sm">
                CONSULTATION DESK
              </Badge>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Clock className="h-4 w-4 text-blue-300" />
              <span className="text-sm font-bold text-white/90">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-1 rounded-full bg-blue-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Appointment Management</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Today's <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent italic">Sessions</span>
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
        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-blue-50/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-[1.75rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Confirmed</p>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{confirmedCount}</p>
                <p className="text-[10px] font-bold text-blue-600 mt-1">Ready to Start</p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-emerald-50/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-[1.75rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Completed</p>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{completedCount}</p>
                <p className="text-[10px] font-bold text-emerald-600 mt-1">Sessions Done</p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-rose-50/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-[1.75rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Cancelled</p>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{cancelledCount}</p>
                <p className="text-[10px] font-bold text-rose-600 mt-1">Not Happening</p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                <X className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative px-1"
      >
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Search appointments by patient name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-14 pl-14 rounded-2xl border-none bg-white shadow-lg text-base font-semibold placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-1"
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white rounded-2xl p-1.5 shadow-lg border-none">
            <TabsTrigger 
              value="confirmed" 
              className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-bold text-sm"
            >
              Confirmed Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-bold text-sm"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger 
              value="cancelled"
              className="rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-bold text-sm"
            >
              Cancelled
            </TabsTrigger>
          </TabsList>

        <TabsContent value="confirmed" className="mt-6">
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <Card className="border-none shadow-lg rounded-2xl bg-white">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-400">No confirmed appointments</p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment, idx) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white group overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Patient Info */}
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <User className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900">{appointment.patient}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-bold text-blue-600">{appointment.time}</span>
                              </div>
                              <Badge className="text-[10px] font-black bg-slate-100 text-slate-600 border-none">
                                {appointment.programStage}
                              </Badge>
                              {appointment.consultationLink ? (
                                <Badge className="text-[10px] font-black bg-emerald-100 text-emerald-700 border-none">
                                  ✓ Link Added
                                </Badge>
                              ) : (
                                <Badge className="text-[10px] font-black bg-amber-100 text-amber-700 border-none">
                                  ⚠ Link Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {appointment.consultationLink ? (
                            <Button
                              size="sm"
                              onClick={() => handleStartConsultation(appointment)}
                              className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 font-bold"
                            >
                              <Video className="h-4 w-4 mr-1.5" />
                              Start Session
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddConsultationLink(appointment)}
                              className="rounded-xl border-2 border-blue-200 hover:bg-blue-50 font-bold text-blue-600"
                            >
                              <LinkIcon className="h-4 w-4 mr-1.5" />
                              Add Link
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReschedule(appointment.id)}
                            className="rounded-xl border-2 hover:bg-slate-50 font-bold"
                          >
                            <Edit className="h-4 w-4 mr-1.5" />
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(appointment.id)}
                            className="rounded-xl border-2 border-rose-200 hover:bg-rose-50 font-bold text-rose-600"
                          >
                            <X className="h-4 w-4 mr-1.5" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddNotes(appointment.id)}
                            className="rounded-xl border-2 hover:bg-slate-50 font-bold"
                          >
                            <FileText className="h-4 w-4 mr-1.5" />
                            Notes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewProfile(appointment.id)}
                            className="rounded-xl border-2 hover:bg-slate-50 font-bold"
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1.5" />
                            Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <Card className="border-none shadow-lg rounded-2xl bg-white">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-400">No completed appointments</p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment, idx) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900">{appointment.patient}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm font-bold text-emerald-600">{appointment.time}</span>
                              </div>
                              <Badge className="text-[10px] font-black bg-emerald-100 text-emerald-700 border-none">
                                {appointment.programStage}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProfile(appointment.id)}
                          className="rounded-xl border-2 hover:bg-slate-50 font-bold"
                        >
                          <ArrowUpRight className="h-4 w-4 mr-1.5" />
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <Card className="border-none shadow-lg rounded-2xl bg-white">
                <CardContent className="p-12 text-center">
                  <X className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-400">No cancelled appointments</p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment, idx) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="border-none shadow-lg rounded-2xl bg-gradient-to-br from-white to-rose-50/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                          <X className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900">{appointment.patient}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-rose-600" />
                              <span className="text-sm font-bold text-rose-600">{appointment.time}</span>
                            </div>
                            <Badge className="text-[10px] font-black bg-rose-100 text-rose-700 border-none">
                              {appointment.programStage}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
        </Tabs>
      </motion.div>

      <AddConsultationLinkModal
        open={showConsultationModal}
        onOpenChange={setShowConsultationModal}
        appointment={selectedAppointment}
      />
    </div>
  )
}
