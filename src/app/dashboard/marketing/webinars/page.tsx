"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Users,
  Play,
  Pause,
  Edit,
  Trash2,
  MoreHorizontal,
  Video,
  Bell,
  BarChart3,
  CalendarDays,
  UserCheck,
  Zap,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { WebinarForm } from "@/components/marketing/webinar-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { format, isPast, isFuture, addDays } from "date-fns"

const webinars = [
  {
    id: 1,
    title: "Diabetes Management Masterclass",
    description: "Comprehensive guide to managing diabetes through lifestyle changes and medication",
    speaker: "Dr. Rajesh Kumar",
    speakerTitle: "Senior Endocrinologist",
    date: new Date("2024-12-20"),
    time: "6:00 PM",
    duration: "1.5 hours",
    capacity: 500,
    registered: 234,
    attended: 0,
    status: "scheduled",
    specialty: "Diabetes",
    targetAudience: ["Patients", "Caregivers"],
    reminderSettings: {
      oneDayBefore: true,
      oneHourBefore: true,
      fifteenMinutesBefore: true,
    },
    interestPolls: [
      {
        question: "What's your biggest challenge with diabetes management?",
        options: ["Diet control", "Medication adherence", "Exercise routine", "Blood sugar monitoring"],
      },
    ],
    engagementNotifications: true,
  },
  {
    id: 2,
    title: "Weight Loss Journey",
    description: "6-week structured program for sustainable weight loss with personalized coaching",
    speaker: "Dr. Priya Sharma",
    speakerTitle: "Nutritionist & Dietitian",
    date: new Date("2024-12-22"),
    time: "7:00 PM",
    duration: "1 hour",
    capacity: 300,
    registered: 189,
    attended: 0,
    status: "scheduled",
    specialty: "Weight Loss",
    targetAudience: ["Patients", "General Public"],
    reminderSettings: {
      oneDayBefore: true,
      oneHourBefore: false,
      fifteenMinutesBefore: true,
    },
    interestPolls: [
      {
        question: "What's your weight loss goal?",
        options: ["5-10 kg", "10-20 kg", "20-30 kg", "30+ kg"],
      },
    ],
    engagementNotifications: true,
  },
  {
    id: 3,
    title: "Thyroid Health Awareness",
    description: "Understanding thyroid disorders and modern treatment approaches",
    speaker: "Dr. Amit Patel",
    speakerTitle: "Thyroid Specialist",
    date: new Date("2024-12-25"),
    time: "5:30 PM",
    duration: "1 hour",
    capacity: 400,
    registered: 156,
    attended: 0,
    status: "scheduled",
    specialty: "Thyroid",
    targetAudience: ["Patients", "Senior Citizens"],
    reminderSettings: {
      oneDayBefore: true,
      oneHourBefore: true,
      fifteenMinutesBefore: false,
    },
    interestPolls: [],
    engagementNotifications: false,
  },
  {
    id: 4,
    title: "Heart Health Month Special",
    description: "Preventive cardiology and lifestyle modifications for heart health",
    speaker: "Dr. Meera Desai",
    speakerTitle: "Cardiologist",
    date: new Date("2024-12-18"),
    time: "6:00 PM",
    duration: "2 hours",
    capacity: 600,
    registered: 412,
    attended: 387,
    status: "completed",
    specialty: "Heart Health",
    targetAudience: ["General Public", "Senior Citizens"],
    reminderSettings: {
      oneDayBefore: true,
      oneHourBefore: true,
      fifteenMinutesBefore: true,
    },
    interestPolls: [
      {
        question: "What's your main heart health concern?",
        options: ["Blood pressure", "Cholesterol", "Family history", "Lifestyle"],
      },
    ],
    engagementNotifications: true,
  },
  {
    id: 5,
    title: "Mental Wellness in Modern Times",
    description: "Coping strategies for stress, anxiety, and maintaining mental health",
    speaker: "Dr. Vikram Nair",
    speakerTitle: "Psychiatrist",
    date: new Date("2024-12-15"),
    time: "7:00 PM",
    duration: "1.5 hours",
    capacity: 350,
    registered: 298,
    attended: 267,
    status: "completed",
    specialty: "Mental Wellness",
    targetAudience: ["Young Adults", "General Public"],
    reminderSettings: {
      oneDayBefore: true,
      oneHourBefore: true,
      fifteenMinutesBefore: true,
    },
    interestPolls: [
      {
        question: "What affects your mental health most?",
        options: ["Work stress", "Relationships", "Social media", "Health concerns"],
      },
    ],
    engagementNotifications: true,
  },
]

const statusConfig = {
  scheduled: { label: "Scheduled", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
  live: { label: "Live", variant: "default" as const, color: "bg-red-100 text-red-800" },
  completed: { label: "Completed", variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { opacity: 1, scale: 1, y: 0 }
}

export default function WebinarsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingWebinar, setEditingWebinar] = useState<typeof webinars[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")

  const filteredWebinars = webinars.filter((webinar) => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.speaker.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || webinar.status === statusFilter
    const matchesSpecialty = specialtyFilter === "all" || webinar.specialty === specialtyFilter
    return matchesSearch && matchesStatus && matchesSpecialty
  })

  const handleCreateWebinar = (data: any) => {
    console.log("Creating webinar:", data)
    setShowCreateForm(false)
    // In real app, this would call an API
  }

  const handleEditWebinar = (data: any) => {
    console.log("Updating webinar:", data)
    setEditingWebinar(null)
    // In real app, this would call an API
  }

  const convertToWebinarFormData = (webinar: typeof webinars[0]) => ({
    title: webinar.title,
    description: webinar.description,
    speaker: webinar.speaker,
    speakerTitle: webinar.speakerTitle,
    date: webinar.date,
    time: webinar.time,
    duration: webinar.duration,
    capacity: webinar.capacity.toString(),
    specialty: webinar.specialty,
    targetAudience: webinar.targetAudience,
    reminderSettings: webinar.reminderSettings,
    engagementNotifications: webinar.engagementNotifications,
    interestPolls: webinar.interestPolls,
  })

  const handleStatusChange = (webinarId: number, newStatus: string) => {
    console.log(`Changing webinar ${webinarId} status to ${newStatus}`)
    // In real app, this would call an API
  }

  const handleDeleteWebinar = (webinarId: number) => {
    console.log(`Deleting webinar ${webinarId}`)
    // In real app, this would call an API
  }

  const getRegistrationProgress = (registered: number, capacity: number) => {
    return (registered / capacity) * 100
  }

  const getAttendanceRate = (attended: number, registered: number) => {
    if (registered === 0) return 0
    return (attended / registered) * 100
  }

  if (showCreateForm || editingWebinar) {
    return (
      <WebinarForm
        initialData={editingWebinar ? convertToWebinarFormData(editingWebinar) : undefined}
        onSubmit={editingWebinar ? handleEditWebinar : handleCreateWebinar}
        onCancel={() => {
          setShowCreateForm(false)
          setEditingWebinar(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Live Engagement</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Webinar <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Nexus</span></h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Orchestrate and monitor high-impact virtual medical sessions.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="h-11 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Schedule Session
        </Button>
      </motion.div>

      {/* Filters and search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-100 shadow-xl"
      >
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by title, speaker or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12 rounded-[1.25rem] border-slate-100 bg-white/80 focus:bg-white focus:ring-primary/20 transition-all font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 rounded-[1.25rem] border-slate-100 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 focus:ring-primary/20 appearance-none min-w-[140px] shadow-sm"
        >
          <option value="all">Status: All</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="h-12 rounded-[1.25rem] border-slate-100 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 focus:ring-primary/20 appearance-none min-w-[140px] shadow-sm"
        >
          <option value="all">Specialty: All</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Thyroid">Thyroid</option>
          <option value="Heart Health">Heart Health</option>
          <option value="Mental Wellness">Mental Wellness</option>
        </select>

        <Button variant="ghost" size="sm" className="h-12 px-5 rounded-[1.25rem] font-bold text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </motion.div>

      {/* Webinars grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6"
      >
        {filteredWebinars.map((webinar) => {
          const config = statusConfig[webinar.status as keyof typeof statusConfig]
          const registrationProgress = getRegistrationProgress(webinar.registered, webinar.capacity)
          const attendanceRate = getAttendanceRate(webinar.attended, webinar.registered)
          const isUpcoming = isFuture(webinar.date)

          return (
            <motion.div key={webinar.id} variants={item}>
              <Card className="group fresh-card border-none shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white/40 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-3 mb-4">
                        <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-none", config.color)}>
                          {config.label}
                        </Badge>
                        {webinar.status === "scheduled" && isUpcoming && (
                          <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            Pre-session
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-slate-400 border-l border-slate-200 pl-3">ID: WEB-{webinar.id}</span>
                      </div>

                      <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3 group-hover:text-primary transition-colors">
                        {webinar.title}
                      </h3>

                      <p className="text-[13px] text-slate-500 font-medium mb-8 leading-relaxed max-w-2xl">
                        {webinar.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Presenter</span>
                          </div>
                          <p className="text-[13px] font-black text-slate-700">{webinar.speaker}</p>
                          <p className="text-[11px] font-bold text-slate-400">{webinar.speakerTitle}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Schedule</span>
                          </div>
                          <p className="text-[13px] font-black text-slate-700">{format(webinar.date, "MMM dd, yyyy")}</p>
                          <p className="text-[11px] font-bold text-slate-400">{webinar.time} ({webinar.duration})</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Engagement</span>
                          </div>
                          <p className="text-[13px] font-black text-slate-700">{webinar.registered} Leads</p>
                          <p className="text-[11px] font-bold text-slate-400">{registrationProgress.toFixed(1)}% Yield</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Zap className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Segment</span>
                          </div>
                          <p className="text-[13px] font-black text-slate-700">{webinar.specialty}</p>
                          <p className="text-[11px] font-bold text-slate-400">High Intent</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {webinar.targetAudience.map((audience) => (
                          <Badge key={audience} variant="secondary" className="bg-slate-100/50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full border-none">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-72 space-y-6 lg:border-l lg:border-slate-100 lg:pl-8">
                      {/* Metric Tile */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Registration Flux</span>
                          <span className="text-primary">{registrationProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${registrationProgress}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          />
                        </div>
                      </div>

                      {webinar.status === "completed" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Attendance Pull</span>
                            <span className="text-pink-500">{attendanceRate.toFixed(0)}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${attendanceRate}%` }}
                              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">Polls</span>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <BarChart3 className="h-3.5 w-3.5" />
                            <span className="text-xs font-black">{webinar.interestPolls?.length || 0}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">Alerts</span>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Bell className="h-3.5 w-3.5" />
                            <span className="text-xs font-black">{webinar.reminderSettings.oneDayBefore ? "Active" : "Off"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button className="flex-1 h-11 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20">
                          Configure
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-200 text-slate-400 shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[200px]">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Session Protocol</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setEditingWebinar(webinar)} className="rounded-xl font-bold text-slate-700 py-2.5">
                              <Edit className="mr-3 h-4 w-4 text-slate-400" />
                              Edit Sequence
                            </DropdownMenuItem>
                            {webinar.status === "scheduled" && isUpcoming && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(webinar.id, "live")} className="rounded-xl font-bold text-slate-700 py-2.5">
                                  <Play className="mr-3 h-4 w-4 text-emerald-500" />
                                  Initiate Live
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(webinar.id, "cancelled")} className="rounded-xl font-bold text-slate-700 py-2.5">
                                  <Pause className="mr-3 h-4 w-4 text-amber-500" />
                                  Suspend Session
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator className="my-2 bg-slate-50" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteWebinar(webinar.id)}
                              className="rounded-xl font-bold text-rose-600 py-2.5 focus:bg-rose-50 focus:text-rose-700"
                            >
                              <Trash2 className="mr-3 h-4 w-4" />
                              Terminate Session
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {filteredWebinars.length === 0 && (
          <Card className="border shadow-sm border-dashed bg-slate-50/30">
            <CardContent className="p-20 text-center">
              <div className="mx-auto w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8">
                <Video className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">No active broadcasts</h3>
              <p className="text-sm text-slate-400 font-medium mb-8">
                {searchTerm || statusFilter !== "all" || specialtyFilter !== "all"
                  ? "Your filter parameters returned zero results."
                  : "Start building your clinical audience by scheduling a session."
                }
              </p>
              {!searchTerm && statusFilter === "all" && specialtyFilter === "all" && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="h-12 px-8 rounded-xl font-black text-[11px] uppercase tracking-widest bg-slate-900"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Now
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
