"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Video, FileText, Brain, Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"

type Appointment = {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  duration: number
  type: "video" | "audio" | "in-person"
  status: "confirmed" | "pending" | "completed" | "cancelled"
  notes?: string
}

export default function MindsetCoachAppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock appointment data
  const appointments: Appointment[] = [
    {
      id: "1",
      patientId: "1",
      patientName: "Sarah Johnson",
      date: "2024-06-30",
      time: "10:00 AM",
      duration: 30,
      type: "video",
      status: "confirmed"
    },
    {
      id: "2",
      patientId: "2",
      patientName: "Michael Chen",
      date: "2024-06-30",
      time: "11:30 AM",
      duration: 30,
      type: "video",
      status: "confirmed"
    },
    {
      id: "3",
      patientId: "3",
      patientName: "Priya Sharma",
      date: "2024-06-30",
      time: "2:00 PM",
      duration: 30,
      type: "audio",
      status: "pending"
    },
    {
      id: "4",
      patientId: "4",
      patientName: "David Wilson",
      date: "2024-07-01",
      time: "10:00 AM",
      duration: 30,
      type: "video",
      status: "confirmed"
    },
    {
      id: "5",
      patientId: "5",
      patientName: "Emma Rodriguez",
      date: "2024-07-01",
      time: "3:30 PM",
      duration: 30,
      type: "in-person",
      status: "confirmed"
    }
  ]

  const filteredAppointments = appointments.filter(apt => 
    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200"
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200"
      case "cancelled": return "bg-rose-100 text-rose-700 border-rose-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />
      case "audio": return <FileText className="h-4 w-4" />
      case "in-person": return <Brain className="h-4 w-4" />
      default: return <Video className="h-4 w-4" />
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 rounded-[50px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">View and manage your appointment calendar, schedule sessions, and track consultation history.</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-900/20">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Calendar Controls */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Button size="sm" variant="outline" onClick={() => navigateDate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigateDate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as "day" | "week" | "month")}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[250px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Grid */}
      <div className="grid gap-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {appointment.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{appointment.patientName}</h3>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getTypeIcon(appointment.type)}
                        {appointment.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        {appointment.duration} minutes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {appointment.status === "confirmed" && (
                    <>
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">
                        Start Session
                      </Button>
                    </>
                  )}
                  {appointment.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                        Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
                        Decline
                      </Button>
                    </>
                  )}
                  {appointment.status === "completed" && (
                    <Button size="sm" variant="outline">
                      View Notes
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No appointments found</h3>
            <p className="text-sm text-slate-600">Try adjusting your search or navigate to a different date</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
