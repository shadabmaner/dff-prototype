"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Video, FileText, Plus, Calendar, Clock, CheckCircle2, XCircle, Users } from "lucide-react"

type Assignment = {
  id: string
  activityId: string
  activityTitle: string
  activityType: "video" | "form"
  patientId: string
  patientName: string
  assignedDate: string
  dueDate: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  completedDate?: string
}

export default function MindsetActivityAssignmentsPage() {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"all" | "pending" | "completed" | "overdue">("all")

  // Mock assignment data
  const assignments: Assignment[] = [
    {
      id: "1",
      activityId: "1",
      activityTitle: "Morning Meditation - 10 Minutes",
      activityType: "video",
      patientId: "1",
      patientName: "Sarah Johnson",
      assignedDate: "2024-06-25",
      dueDate: "2024-06-30",
      status: "in-progress"
    },
    {
      id: "2",
      activityId: "2",
      activityTitle: "Daily Mood Journal",
      activityType: "form",
      patientId: "2",
      patientName: "Michael Chen",
      assignedDate: "2024-06-26",
      dueDate: "2024-06-29",
      status: "completed",
      completedDate: "2024-06-28"
    },
    {
      id: "3",
      activityId: "1",
      activityTitle: "Morning Meditation - 10 Minutes",
      activityType: "video",
      patientId: "3",
      patientName: "Priya Sharma",
      assignedDate: "2024-06-20",
      dueDate: "2024-06-25",
      status: "overdue"
    },
    {
      id: "4",
      activityId: "2",
      activityTitle: "Daily Mood Journal",
      activityType: "form",
      patientId: "4",
      patientName: "David Wilson",
      assignedDate: "2024-06-27",
      dueDate: "2024-07-02",
      status: "pending"
    },
    {
      id: "5",
      activityId: "1",
      activityTitle: "Morning Meditation - 10 Minutes",
      activityType: "video",
      patientId: "5",
      patientName: "Emma Rodriguez",
      assignedDate: "2024-06-28",
      dueDate: "2024-07-01",
      status: "pending"
    }
  ]

  const filteredAssignments = assignments.filter(a => {
    if (selectedTab === "all") return true
    return a.status === selectedTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-700 border-blue-200"
      case "in-progress": return "bg-amber-100 text-amber-700 border-amber-200"
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "overdue": return "bg-rose-100 text-rose-700 border-rose-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 rounded-[50px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Activity Assignments</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">Assign mindset activities to patients, track completion status, and monitor progress.</p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-900/20">
              <Plus className="mr-2 h-4 w-4" />
              Assign Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Assign Activity to Patient
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Activity *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" /> Morning Meditation - 10 Minutes
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Daily Mood Journal
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Patient *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sarah Johnson</SelectItem>
                    <SelectItem value="2">Michael Chen</SelectItem>
                    <SelectItem value="3">Priya Sharma</SelectItem>
                    <SelectItem value="4">David Wilson</SelectItem>
                    <SelectItem value="5">Emma Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assigned Date *</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input placeholder="Add any instructions for the patient..." />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAssignDialogOpen(false)} className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                Assign Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
                <p className="text-xs text-slate-600">Total Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{assignments.filter(a => a.status === "pending").length}</p>
                <p className="text-xs text-slate-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{assignments.filter(a => a.status === "completed").length}</p>
                <p className="text-xs text-slate-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{assignments.filter(a => a.status === "overdue").length}</p>
                <p className="text-xs text-slate-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "all" | "pending" | "completed" | "overdue")} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4 mt-6">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                        {getTypeIcon(assignment.activityType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{assignment.activityTitle}</h3>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1).replace('-', ' ')}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getTypeIcon(assignment.activityType)}
                            {assignment.activityType}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {assignment.patientName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Assigned: {assignment.assignedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {assignment.dueDate}
                          </span>
                          {assignment.completedDate && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Completed: {assignment.completedDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {assignment.status === "pending" && (
                        <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
                          Unassign
                        </Button>
                      )}
                      {assignment.status === "overdue" && (
                        <>
                          <Button size="sm" variant="outline">
                            Send Reminder
                          </Button>
                          <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
                            Unassign
                          </Button>
                        </>
                      )}
                      {assignment.status === "completed" && (
                        <Button size="sm" variant="outline">
                          View Response
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
                <Brain className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No assignments found</h3>
                <p className="text-sm text-slate-600">
                  {selectedTab === "all" ? "No activity assignments yet" : 
                   selectedTab === "pending" ? "No pending assignments" :
                   selectedTab === "completed" ? "No completed assignments yet" : 
                   "No overdue assignments"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
