"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Calendar, Brain, Video, FileText, MoreVertical, ArrowRight } from "lucide-react"

type Patient = {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  status: "active" | "inactive" | "pending"
  assignedActivities: number
  completedActivities: number
  lastActivity: string
  nextAppointment: string | null
}

export default function MindsetCoachPatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "pending">("all")

  // Mock patient data
  const patients: Patient[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+91 98765 43210",
      age: 32,
      gender: "female",
      status: "active",
      assignedActivities: 15,
      completedActivities: 12,
      lastActivity: "2024-06-27",
      nextAppointment: "2024-06-30"
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+91 98765 43211",
      age: 28,
      gender: "male",
      status: "active",
      assignedActivities: 10,
      completedActivities: 8,
      lastActivity: "2024-06-26",
      nextAppointment: "2024-07-02"
    },
    {
      id: "3",
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 98765 43212",
      age: 35,
      gender: "female",
      status: "pending",
      assignedActivities: 5,
      completedActivities: 2,
      lastActivity: "2024-06-25",
      nextAppointment: "2024-07-01"
    },
    {
      id: "4",
      name: "David Wilson",
      email: "david.wilson@email.com",
      phone: "+91 98765 43213",
      age: 42,
      gender: "male",
      status: "active",
      assignedActivities: 20,
      completedActivities: 18,
      lastActivity: "2024-06-28",
      nextAppointment: "2024-06-29"
    },
    {
      id: "5",
      name: "Emma Rodriguez",
      email: "emma.rodriguez@email.com",
      phone: "+91 98765 43214",
      age: 29,
      gender: "female",
      status: "inactive",
      assignedActivities: 8,
      completedActivities: 5,
      lastActivity: "2024-06-20",
      nextAppointment: null
    }
  ]

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "inactive": return "bg-slate-100 text-slate-700 border-slate-200"
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 rounded-[50px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Patient Management</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">View and manage patients assigned to your care, track their mindset activities, and schedule consultations.</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-900/20">
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Patient
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive" | "pending")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{patient.name}</h3>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span>{patient.email}</span>
                      <span>•</span>
                      <span>{patient.phone}</span>
                      <span>•</span>
                      <span>{patient.age} years, {patient.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 md:items-center">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <Brain className="h-4 w-4" />
                      <span className="text-sm font-medium">Activities</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{patient.completedActivities}/{patient.assignedActivities}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Last Activity</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{patient.lastActivity}</p>
                  </div>
                  {patient.nextAppointment && (
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Next Session</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{patient.nextAppointment}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                      <Video className="h-4 w-4 mr-1" /> Activities
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No patients found</h3>
            <p className="text-sm text-slate-600">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
