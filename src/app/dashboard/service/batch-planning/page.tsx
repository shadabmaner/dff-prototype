"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Video, Phone, Users, Clock, Settings, Plus, Edit, CheckCircle2, AlertTriangle, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"

export default function BatchPlanningPage() {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [showWebinarDialog, setShowWebinarDialog] = useState(false)
  const [showConsultationDialog, setShowConsultationDialog] = useState(false)
  const [showQaDialog, setShowQaDialog] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)

  // Mock data for batches
  const batches = [
    { id: 1, name: "Batch June 2024", startDate: "2024-06-01", patients: 25, status: "active" },
    { id: 2, name: "Batch July 2024", startDate: "2024-07-01", patients: 30, status: "upcoming" },
    { id: 3, name: "Batch August 2024", startDate: "2024-08-01", patients: 28, status: "upcoming" },
  ]

  // Mock data for upcoming webinars
  const upcomingWebinars = [
    { id: 1, title: "Welcome Call - Batch June 2024", date: "2024-06-05", time: "10:00 AM", hostUrl: "", status: "pending" },
    { id: 2, title: "Welcome Call - Batch July 2024", date: "2024-07-05", time: "10:00 AM", hostUrl: "", status: "pending" },
  ]

  // Mock data for upcoming consultations
  const upcomingConsultations = [
    { id: 1, patient: "Rahul Sharma", doctor: "Dr. Rajesh Sharma", date: "2024-06-15", time: "2:00 PM", type: "video", status: "scheduled" },
    { id: 2, patient: "Priya Patel", doctor: "Dr. Anjali Gupta", date: "2024-06-16", time: "3:30 PM", type: "video", status: "scheduled" },
    { id: 3, patient: "Amit Kumar", doctor: "Dr. Rajesh Sharma", date: "2024-06-17", time: "11:00 AM", type: "video", status: "scheduled" },
  ]

  // Mock data for QA sessions
  const qaSessions = [
    { id: 1, title: "Diabetes Management Q&A", date: "2024-06-20", time: "4:00 PM", host: "Dr. Rajesh Sharma", status: "scheduled" },
    { id: 2, title: "Nutrition Q&A", date: "2024-06-25", time: "5:00 PM", host: "Dr. Anjali Gupta", status: "scheduled" },
  ]

  // Mock data for events
  const events = [
    { id: 1, title: "Patient Education Workshop", date: "2024-06-30", time: "10:00 AM", location: "Online", status: "upcoming" },
    { id: 2, title: "Doctor Training Session", date: "2024-07-10", time: "2:00 PM", location: "Conference Room", status: "upcoming" },
  ]

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Batch Planning
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Batch Planning
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Configure webinars, consultations, QA sessions, and events for patient batches
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="qa">QA Sessions</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  Active Batches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">3</div>
                <p className="text-sm text-slate-600 mt-1">83 patients enrolled</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="h-5 w-5 text-purple-600" />
                  Upcoming Webinars
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">2</div>
                <p className="text-sm text-slate-600 mt-1">Welcome calls pending</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Scheduled Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">5</div>
                <p className="text-sm text-slate-600 mt-1">This week</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-900" />
                12-Month Batch Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {batch.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{batch.name}</h4>
                        <p className="text-sm text-slate-600">{batch.patients} patients • Starts {batch.startDate}</p>
                      </div>
                    </div>
                    <Badge className={
                      batch.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                      "bg-blue-100 text-blue-700 border-blue-200"
                    }>
                      {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webinars" className="space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-purple-600" />
                  Upcoming Webinars
                </CardTitle>
                <Button onClick={() => setShowWebinarDialog(true)} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webinar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingWebinars.map((webinar) => (
                  <div key={webinar.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{webinar.title}</h4>
                        <p className="text-sm text-slate-600">{webinar.date} at {webinar.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {webinar.hostUrl ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Configured</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending Configuration</Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setShowWebinarDialog(true)}>
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Upcoming Consultations
                </CardTitle>
                <Button onClick={() => setShowConsultationDialog(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Consultation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {consultation.patient.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{consultation.patient}</h4>
                        <p className="text-sm text-slate-600">{consultation.doctor} • {consultation.date} at {consultation.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">{consultation.type}</Badge>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{consultation.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qa" className="space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  QA Sessions
                </CardTitle>
                <Button onClick={() => setShowQaDialog(true)} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add QA Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qaSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{session.title}</h4>
                        <p className="text-sm text-slate-600">{session.host} • {session.date} at {session.time}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{session.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  Events
                </CardTitle>
                <Button onClick={() => setShowEventDialog(true)} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                        <p className="text-sm text-slate-600">{event.location} • {event.date} at {event.time}</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">{event.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Webinar Configuration Dialog */}
      <Dialog open={showWebinarDialog} onOpenChange={setShowWebinarDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-purple-600" />
              Configure Webinar
            </DialogTitle>
            <DialogDescription>
              Set up webinar URL and host details for the welcome call session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Webinar Title</Label>
              <Input placeholder="Enter webinar title" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Host URL</Label>
              <div className="flex gap-2">
                <Input placeholder="https://meet.google.com/..." />
                <Button variant="outline">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Test
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Host Name</Label>
              <Input placeholder="Enter host name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Add webinar description..." className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWebinarDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              onClick={() => {
                toast.success("Webinar configured successfully")
                setShowWebinarDialog(false)
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consultation Scheduling Dialog */}
      <Dialog open={showConsultationDialog} onOpenChange={setShowConsultationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Schedule Consultation
            </DialogTitle>
            <DialogDescription>
              Schedule video consultation for patient with assigned doctor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Rahul Sharma</SelectItem>
                  <SelectItem value="2">Priya Patel</SelectItem>
                  <SelectItem value="3">Amit Kumar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned Doctor</Label>
              <Input placeholder="Auto-assigned doctor" disabled />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Consultation Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="audio">Audio Call</SelectItem>
                  <SelectItem value="in_person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input placeholder="https://meet.google.com/..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsultationDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              onClick={() => {
                toast.success("Consultation scheduled successfully")
                setShowConsultationDialog(false)
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QA Session Dialog */}
      <Dialog open={showQaDialog} onOpenChange={setShowQaDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Add QA Session
            </DialogTitle>
            <DialogDescription>
              Schedule a Q&A session with patients
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Session Title</Label>
              <Input placeholder="Enter session title" />
            </div>
            <div className="space-y-2">
              <Label>Host</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select host" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Dr. Rajesh Sharma</SelectItem>
                  <SelectItem value="2">Dr. Anjali Gupta</SelectItem>
                  <SelectItem value="3">Dr. Vikram Singh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input placeholder="https://meet.google.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Add session description..." className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQaDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
              onClick={() => {
                toast.success("QA session added successfully")
                setShowQaDialog(false)
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Add Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              Add Event
            </DialogTitle>
            <DialogDescription>
              Schedule an event for patients or staff
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input placeholder="Enter event title" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="Online or physical location" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Add event description..." className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
              onClick={() => {
                toast.success("Event added successfully")
                setShowEventDialog(false)
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
