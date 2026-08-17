"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Calendar, Clock, Video, FileText, Plus, Search, Filter, CheckCircle2, XCircle } from "lucide-react"

type Consultation = {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  duration: number
  type: "video" | "audio" | "in-person"
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  notes?: string
  activitiesAssigned: number
}

export default function MindsetCoachConsultationPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming")

  // Mock consultation data
  const consultations: Consultation[] = [
    {
      id: "1",
      patientId: "1",
      patientName: "Sarah Johnson",
      date: "2024-06-30",
      time: "10:00 AM",
      duration: 30,
      type: "video",
      status: "scheduled",
      activitiesAssigned: 3
    },
    {
      id: "2",
      patientId: "2",
      patientName: "Michael Chen",
      date: "2024-06-30",
      time: "11:30 AM",
      duration: 30,
      type: "video",
      status: "scheduled",
      activitiesAssigned: 2
    },
    {
      id: "3",
      patientId: "3",
      patientName: "Priya Sharma",
      date: "2024-06-28",
      time: "2:00 PM",
      duration: 30,
      type: "video",
      status: "completed",
      notes: "Patient showed good progress with meditation activities. Discussed stress management techniques.",
      activitiesAssigned: 5
    },
    {
      id: "4",
      patientId: "4",
      patientName: "David Wilson",
      date: "2024-06-27",
      time: "3:30 PM",
      duration: 30,
      type: "audio",
      status: "completed",
      notes: "Completed journal activity review. Patient expressed improved mood tracking awareness.",
      activitiesAssigned: 4
    },
    {
      id: "5",
      patientId: "5",
      patientName: "Emma Rodriguez",
      date: "2024-06-26",
      time: "4:00 PM",
      duration: 30,
      type: "video",
      status: "cancelled",
      activitiesAssigned: 2
    }
  ]

  const filteredConsultations = consultations.filter(c => {
    if (selectedTab === "upcoming") return c.status === "scheduled"
    if (selectedTab === "completed") return c.status === "completed"
    if (selectedTab === "cancelled") return c.status === "cancelled" || c.status === "no-show"
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-700 border-blue-200"
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "cancelled": return "bg-rose-100 text-rose-700 border-rose-200"
      case "no-show": return "bg-amber-100 text-amber-700 border-amber-200"
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

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 rounded-[50px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Consultation Management</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">Schedule and manage consultations with patients, track progress, and assign mindset activities.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-900/20">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Consultation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Schedule New Consultation
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sarah Johnson</SelectItem>
                    <SelectItem value="2">Michael Chen</SelectItem>
                    <SelectItem value="3">Priya Sharma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Input type="time" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes) *</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Consultation Type *</Label>
                  <Select defaultValue="video">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" /> Video Call
                        </div>
                      </SelectItem>
                      <SelectItem value="audio">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Audio Call
                        </div>
                      </SelectItem>
                      <SelectItem value="in-person">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" /> In-Person
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Consultation Notes</Label>
                <Textarea placeholder="Add any notes for this consultation..." rows={3} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateDialogOpen(false)} className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                Schedule Consultation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "upcoming" | "completed" | "cancelled")} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" /> Upcoming
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-2">
            <XCircle className="h-4 w-4" /> Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4 mt-6">
          {filteredConsultations.length > 0 ? (
            filteredConsultations.map((consultation) => (
              <Card key={consultation.id} className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                        {getTypeIcon(consultation.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{consultation.patientName}</h3>
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {consultation.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {consultation.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Brain className="h-4 w-4" />
                            {consultation.duration} minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            {consultation.activitiesAssigned} activities
                          </span>
                        </div>
                        {consultation.notes && (
                          <p className="text-sm text-slate-700 mt-2 line-clamp-2">{consultation.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {consultation.status === "scheduled" && (
                        <>
                          <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                            Reschedule
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">
                            Start Consultation
                          </Button>
                        </>
                      )}
                      {consultation.status === "completed" && (
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No consultations found</h3>
                <p className="text-sm text-slate-600">
                  {selectedTab === "upcoming" ? "No upcoming consultations scheduled" : 
                   selectedTab === "completed" ? "No completed consultations yet" : 
                   "No cancelled consultations"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
