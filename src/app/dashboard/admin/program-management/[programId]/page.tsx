"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Settings2, 
  Plus, 
  Save, 
  Copy, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Activity,
  FileText,
  Video,
  Phone,
  Stethoscope,
  Utensils,
  Dumbbell,
  Brain,
  MessageSquare,
  FlaskConical,
  GraduationCap,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  Layers,
  Target,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Types
type Specialty = "Diabetes (DFF)" | "Thyroid (TFF)" | "Obesity / Healthy BMI"
type Language = "English" | "Marathi" | "Hindi"
type DurationType = "Days" | "Months"
type Duration = "30 Days" | "45 Days" | "60 Days" | "90 Days" | "1 Month" | "3 Months" | "6 Months" | "12 Months" | "Custom"
type ActivityType = 
  | "Welcome Session"
  | "Doctor Consultation"
  | "Dietitian Consultation"
  | "Fitness Consultation"
  | "Webinar"
  | "Live Q&A"
  | "Assessment"
  | "Lab Test Request"
  | "Educational Content"
  | "Phone Call"
  | "Video Call"
  | "Offline Visit"
type Mode = "Online" | "Offline" | "Recording" | "In-App"
type Stakeholder = "Doctor" | "Dietitian" | "Fitness Coach" | "Service Team" | "Patient" | "Finance" | "Admin" | "Sales"

interface Personnel {
  id: string
  name: string
  role: Stakeholder
}

const defaultPersonnel: Personnel[] = [
  { id: "doc-001", name: "Dr. Bhagesh Kulkarni", role: "Doctor" },
  { id: "doc-002", name: "Dr. Sharma", role: "Doctor" },
  { id: "diet-001", name: "Priya Dietitian", role: "Dietitian" },
  { id: "diet-002", name: "Rahul Nutritionist", role: "Dietitian" },
  { id: "fit-001", name: "Fitness Coach Amit", role: "Fitness Coach" },
  { id: "fit-002", name: "Trainer Neha", role: "Fitness Coach" },
  { id: "fin-001", name: "Finance Manager", role: "Finance" },
  { id: "admin-001", name: "System Admin", role: "Admin" },
  { id: "sales-001", name: "Sales Executive", role: "Sales" },
]

const getDefaultStakeholders = (activityType: ActivityType): Stakeholder[] => {
  switch (activityType) {
    case "Welcome Session":
      return ["Doctor", "Patient"]
    case "Doctor Consultation":
      return ["Doctor", "Patient"]
    case "Dietitian Consultation":
      return ["Dietitian", "Patient"]
    case "Fitness Consultation":
      return ["Fitness Coach", "Patient"]
    case "Webinar":
      return ["Doctor", "Patient"]
    case "Live Q&A":
      return ["Doctor", "Dietitian", "Patient"]
    case "Assessment":
      return ["Doctor", "Patient"]
    case "Lab Test Request":
      return ["Doctor", "Patient"]
    case "Educational Content":
      return ["Patient"]
    default:
      return ["Doctor"]
  }
}

interface Installment {
  id: string
  stageName: string
  amount: number
  dueAfterDays: number
  accessDuration: string
  gracePeriod: number
  status: "Active" | "Inactive"
}

interface Activity {
  id: string
  name: string
  type: ActivityType
  description: string
  stakeholders: Stakeholder[]
  personnel: Record<string, string[]>
  mode: Mode
  notifications: {
    role: Stakeholder
    timing: ("3 Days Before" | "1 Day Before" | "1 Hour Before" | "On Activity Time")[]
  }[]
  conditionalFields?: {
    webinarUrl?: string
    hostUrl?: string
    recordingUrl?: string
    contentType?: "Video" | "PDF" | "Article" | "Knowledge Post"
    investigationType?: string
    dueDate?: string
    followUpRequired?: boolean
  }
}

interface ProtocolDay {
  day: number
  activities: Activity[]
}

interface ProtocolMonth {
  month: number
  days: ProtocolDay[]
}

export default function ProgramManagementPage() {
  const [activeTab, setActiveTab] = useState("configuration")
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty>("Diabetes (DFF)")
  
  // Widget 1: Program Configuration State
  const [programName, setProgramName] = useState("")
  const [programCode, setProgramCode] = useState("PROG-001")
  const [specialty, setSpecialty] = useState<Specialty>("Diabetes (DFF)")
  const [language, setLanguage] = useState<Language>("English")
  const [durationType, setDurationType] = useState<DurationType>("Months")
  const [duration, setDuration] = useState<Duration>("12 Months")
  const [customDuration, setCustomDuration] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Calculate total access duration based on program duration
  const calculateAccessDuration = () => {
    if (duration === "Custom") {
      const num = parseInt(customDuration) || 0
      setTotalAccessDuration(`${num} ${durationType.toLowerCase()}`)
    } else {
      const num = parseInt(duration) || 0
      const unit = duration.includes("Month") ? "months" : "days"
      setTotalAccessDuration(`${num} ${unit}`)
    }
  }

  // Update access duration when duration changes
  useEffect(() => {
    calculateAccessDuration()
  }, [duration, customDuration, durationType])

  // Widget 2: Pricing & Access State
  const [totalPrice, setTotalPrice] = useState("15000")
  const [currency, setCurrency] = useState("INR")
  const [taxIncluded, setTaxIncluded] = useState(false)
  const [discountAllowed, setDiscountAllowed] = useState(true)
  const [installments, setInstallments] = useState<Installment[]>([
    { id: "1", stageName: "Assessment Fee", amount: 2499, dueAfterDays: 0, accessDuration: "7 days", gracePeriod: 3, status: "Active" },
    { id: "2", stageName: "Enrollment Fee", amount: 5000, dueAfterDays: 7, accessDuration: "30 days", gracePeriod: 5, status: "Active" },
    { id: "3", stageName: "Phase 2", amount: 5000, dueAfterDays: 30, accessDuration: "60 days", gracePeriod: 7, status: "Active" },
    { id: "4", stageName: "Phase 3", amount: 7500, dueAfterDays: 60, accessDuration: "90 days", gracePeriod: 7, status: "Active" },
  ])
  const [totalAccessDuration, setTotalAccessDuration] = useState("365 days")
  const [accessStartTrigger, setAccessStartTrigger] = useState("On Enrollment")
  const [gracePeriodDays, setGracePeriodDays] = useState("7")
  const [suspendAfterOverdue] = useState(true)
  const [autoRestoreAfterPayment] = useState(true)

  // Widget 3: Protocol State
  const [protocolMonths, setProtocolMonths] = useState<ProtocolMonth[]>([])
  const [protocolDays, setProtocolDays] = useState<ProtocolDay[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedMonthTab, setSelectedMonthTab] = useState<number>(1)
  const [selectedDayTab, setSelectedDayTab] = useState<number>(1)
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  // Activity Drawer State
  const [activityName, setActivityName] = useState("")
  const [activityType, setActivityType] = useState<ActivityType>("Doctor Consultation")
  const [activityDescription, setActivityDescription] = useState("")
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>(["Doctor"])
  const [selectedPersonnel, setSelectedPersonnel] = useState<Record<string, string[]>>({})
  const [selectAllRoles, setSelectAllRoles] = useState(false)
  const [personnelSearch, setPersonnelSearch] = useState<Record<string, string>>({})
  const [activityMode, setActivityMode] = useState<Mode>("Online")

  // Generate protocol based on specialty
  const generateProtocol = () => {
    if (specialty === "Obesity / Healthy BMI") {
      // Generate 90-day protocol
      const days: ProtocolDay[] = []
      for (let i = 1; i <= 90; i++) {
        days.push({ day: i, activities: [] })
      }
      setProtocolDays(days)
    } else {
      // Generate 12-month protocol with 28 days each
      const months: ProtocolMonth[] = []
      for (let m = 1; m <= 12; m++) {
        const days: ProtocolDay[] = []
        for (let d = 1; d <= 28; d++) {
          days.push({ day: d, activities: [] })
        }
        months.push({ month: m, days })
      }
      setProtocolMonths(months)
    }
  }

  const addInstallment = () => {
    const newInstallment: Installment = {
      id: Date.now().toString(),
      stageName: `Stage ${installments.length + 1}`,
      amount: 0,
      dueAfterDays: 0,
      accessDuration: "30 days",
      gracePeriod: 7,
      status: "Active"
    }
    setInstallments([...installments, newInstallment])
  }

  const updateInstallment = (id: string, field: keyof Installment, value: any) => {
    setInstallments(installments.map(inst => 
      inst.id === id ? { ...inst, [field]: value } : inst
    ))
  }

  const removeInstallment = (id: string) => {
    setInstallments(installments.filter(inst => inst.id !== id))
  }

  const openActivityDrawer = (day?: number, month?: number, activity?: Activity) => {
    if (activity) {
      setSelectedActivity(activity)
      setActivityName(activity.name)
      setActivityType(activity.type)
      setActivityDescription(activity.description)
      setSelectedStakeholders(activity.stakeholders)
      setSelectedPersonnel(activity.personnel || {})
      setActivityMode(activity.mode)
    } else {
      setSelectedActivity(null)
      setActivityName("")
      setActivityType("Doctor Consultation")
      setActivityDescription("")
      setSelectedStakeholders(["Doctor"])
      setSelectedPersonnel({})
      setActivityMode("Online")
    }
    setSelectedDay(day || null)
    setSelectedMonth(month || null)
    setActivityDrawerOpen(true)
  }

  const saveActivity = () => {
    const newActivity: Activity = {
      id: selectedActivity?.id || Date.now().toString(),
      name: activityName,
      type: activityType,
      description: activityDescription,
      stakeholders: selectedStakeholders,
      personnel: selectedPersonnel,
      mode: activityMode,
      notifications: []
    }

    if (specialty === "Obesity / Healthy BMI" && selectedDay !== null) {
      setProtocolDays(protocolDays.map(day => 
        day.day === selectedDay 
          ? { ...day, activities: selectedActivity 
              ? day.activities.map(a => a.id === selectedActivity.id ? newActivity : a)
              : [...day.activities, newActivity]
            }
          : day
      ))
    } else if (selectedMonth !== null && selectedDay !== null) {
      setProtocolMonths(protocolMonths.map(month => 
        month.month === selectedMonth
          ? { 
              ...month, 
              days: month.days.map(day => 
                day.day === selectedDay
                  ? { 
                      ...day, 
                      activities: selectedActivity 
                        ? day.activities.map(a => a.id === selectedActivity.id ? newActivity : a)
                        : [...day.activities, newActivity]
                    }
                  : day
              )
            }
          : month
      ))
    }
    setActivityDrawerOpen(false)
  }

  const getProtocolStats = () => {
    let totalActivities = 0
    let doctorSessions = 0
    let dietitianSessions = 0
    let fitnessSessions = 0
    let webinars = 0
    let assessments = 0
    let labRequests = 0

    const allActivities = specialty === "Obesity / Healthy BMI" 
      ? protocolDays.flatMap(d => d.activities)
      : protocolMonths.flatMap(m => m.days.flatMap(d => d.activities))

    allActivities.forEach(activity => {
      totalActivities++
      if (activity.type === "Doctor Consultation" || activity.type === "Video Call") doctorSessions++
      if (activity.type === "Dietitian Consultation") dietitianSessions++
      if (activity.type === "Fitness Consultation") fitnessSessions++
      if (activity.type === "Webinar" || activity.type === "Live Q&A") webinars++
      if (activity.type === "Assessment") assessments++
      if (activity.type === "Lab Test Request") labRequests++
    })

    return { totalActivities, doctorSessions, dietitianSessions, fitnessSessions, webinars, assessments, labRequests }
  }

  const stats = getProtocolStats()

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/admin/program-management" className="text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
          Program Management
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="text-slate-900 font-medium">{programName || "New Program"}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Configuration Module</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Program <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Management</span></h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">Configure healthcare programs, pricing structures, and patient journey protocols for DFF, TFF, and Healthy BMI specialties.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/admin/program-management">
            <Button variant="outline" className="h-11 px-6 rounded-xl font-semibold border-slate-200 bg-white/50 backdrop-blur-sm">
              Cancel
            </Button>
          </Link>
          <Button className="h-11 px-6 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/30">
            <Save className="mr-2 h-4 w-4" />
            Save Program
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-14 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-1.5">
          <TabsTrigger value="configuration" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-semibold">
            <Settings2 className="mr-2 h-4 w-4" />
            Program Configuration
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-semibold">
            Pricing & Access (INR)
          </TabsTrigger>
          <TabsTrigger value="protocol" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-semibold">
            <Sparkles className="mr-2 h-4 w-4" />
            Protocol Engine
          </TabsTrigger>
        </TabsList>

        {/* Widget 1: Program Configuration */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Configuration Form */}
            <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">Program Details</CardTitle>
                <CardDescription>Configure the basic program information and settings</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Program Name</Label>
                    <Input 
                      value={programName} 
                      onChange={(e) => setProgramName(e.target.value)}
                      placeholder="e.g., Diabetes Care Premium"
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Program Code</Label>
                    <div className="flex">
                      <Input 
                        value={programCode} 
                        onChange={(e) => setProgramCode(e.target.value)}
                        className="h-11 rounded-l-xl border-slate-200 bg-slate-50"
                        readOnly
                      />
                      <Button variant="outline" className="h-11 rounded-l-none rounded-r-xl border-l-0 border-slate-200">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Specialty</Label>
                    <Select value={specialty} onValueChange={(v: Specialty) => { setSpecialty(v); setSelectedSpecialty(v) }}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diabetes (DFF)">Diabetes (DFF)</SelectItem>
                        <SelectItem value="Thyroid (TFF)">Thyroid (TFF)</SelectItem>
                        <SelectItem value="Obesity / Healthy BMI">Obesity / Healthy BMI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Language</Label>
                    <Select value={language} onValueChange={(v: Language) => setLanguage(v)}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Marathi">Marathi</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Duration Type</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="days"
                        name="durationType"
                        checked={durationType === "Days"}
                        onChange={() => setDurationType("Days")}
                        className="h-4 w-4 text-primary"
                      />
                      <label htmlFor="days" className="text-sm text-slate-700">Days</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="months"
                        name="durationType"
                        checked={durationType === "Months"}
                        onChange={() => setDurationType("Months")}
                        className="h-4 w-4 text-primary"
                      />
                      <label htmlFor="months" className="text-sm text-slate-700">Months</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Duration</Label>
                  {duration === "Custom" ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        placeholder={`Enter ${durationType.toLowerCase()}`}
                        className="h-11 rounded-xl border-slate-200"
                      />
                      <span className="text-sm text-slate-600 self-center">{durationType}</span>
                      <Button variant="outline" size="sm" onClick={() => setDuration(durationType === "Days" ? "30 Days" : "1 Month")} className="rounded-lg">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Select value={duration} onValueChange={(v: Duration) => setDuration(v)}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationType === "Days" ? (
                          <>
                            <SelectItem value="30 Days">30 Days</SelectItem>
                            <SelectItem value="45 Days">45 Days</SelectItem>
                            <SelectItem value="60 Days">60 Days</SelectItem>
                            <SelectItem value="90 Days">90 Days</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="1 Month">1 Month</SelectItem>
                            <SelectItem value="3 Months">3 Months</SelectItem>
                            <SelectItem value="6 Months">6 Months</SelectItem>
                            <SelectItem value="12 Months">12 Months</SelectItem>
                          </>
                        )}
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Program Description</Label>
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the program objectives and target audience..."
                    className="min-h-[120px] rounded-xl border-slate-200 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Program Status</Label>
                    <p className="text-xs text-slate-500 mt-1">Enable or disable this program for new enrollments</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </CardContent>
            </Card>

            {/* Live Summary Card */}
            <Card className="border border-slate-200/80 bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b border-blue-100">
                <CardTitle className="text-lg font-bold text-slate-900">Program Summary</CardTitle>
                <CardDescription>Live preview of program configuration</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Program Name</span>
                    <span className="text-sm font-bold text-slate-900">{programName || "Not set"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Specialty</span>
                    <Badge className="bg-primary text-white">{specialty}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Duration</span>
                    <span className="text-sm font-bold text-slate-900">{duration}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Language</span>
                    <span className="text-sm font-bold text-slate-900">{language}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Status</span>
                    <Badge className={isActive ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Widget 2: Pricing & Access Configuration */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Pricing Configuration */}
            <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">Pricing Structure</CardTitle>
                <CardDescription>Configure program pricing, installments, and payment terms</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Program Pricing */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Program Pricing</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Total Price</Label>
                      <Input 
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(e.target.value)}
                        className="h-11 rounded-xl border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Options</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                          <Switch checked={taxIncluded} onCheckedChange={setTaxIncluded} className="scale-75" />
                          <span className="text-xs font-medium text-slate-600">Tax</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                          <Switch checked={discountAllowed} onCheckedChange={setDiscountAllowed} className="scale-75" />
                          <span className="text-xs font-medium text-slate-600">Discount</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Installment Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Installment Plan</h3>
                    <Button onClick={addInstallment} size="sm" className="h-8 rounded-lg">
                      <Plus className="mr-1 h-3 w-3" />
                      Add Stage
                    </Button>
                  </div>
                  
                  {/* Visual Timeline */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-4">
                    {installments.map((inst, idx) => (
                      <div key={inst.id} className="flex items-center">
                        <div className="px-4 py-2 rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white text-xs font-bold whitespace-nowrap shadow-md">
                          {inst.stageName}
                        </div>
                        {idx < installments.length - 1 && <ArrowDown className="h-4 w-4 text-slate-400 mx-1" />}
                      </div>
                    ))}
                  </div>

                  {/* Installment Table */}
                  <div className="space-y-3">
                    {installments.map((inst) => (
                      <div key={inst.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <div className="grid gap-3 md:grid-cols-6">
                          <div className="md:col-span-2">
                            <Label className="text-xs font-semibold text-slate-600">Stage Name</Label>
                            <Input 
                              value={inst.stageName}
                              onChange={(e) => updateInstallment(inst.id, "stageName", e.target.value)}
                              className="h-9 rounded-lg border-slate-200 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-600">Amount</Label>
                            <Input 
                              type="number"
                              value={inst.amount}
                              onChange={(e) => updateInstallment(inst.id, "amount", Number(e.target.value))}
                              className="h-9 rounded-lg border-slate-200 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-600">Due After (Days)</Label>
                            <Input 
                              type="number"
                              value={inst.dueAfterDays}
                              onChange={(e) => updateInstallment(inst.id, "dueAfterDays", Number(e.target.value))}
                              className="h-9 rounded-lg border-slate-200 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-600">Grace Period</Label>
                            <Input 
                              type="number"
                              value={inst.gracePeriod}
                              onChange={(e) => updateInstallment(inst.id, "gracePeriod", Number(e.target.value))}
                              className="h-9 rounded-lg border-slate-200 text-sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeInstallment(inst.id)}
                              className="h-9 w-9 rounded-lg text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Access Rules */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Access Rules</h3>
                  <div className="grid gap-4 md:grid-cols-1">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Access Start Trigger</Label>
                      <Select value={accessStartTrigger} onValueChange={setAccessStartTrigger}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="On Enrollment">On Enrollment</SelectItem>
                          <SelectItem value="On First Payment">On First Payment</SelectItem>
                          <SelectItem value="On Assessment Complete">On Assessment Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Suspend After Overdue</Label>
                        <p className="text-xs text-slate-500 mt-1">Automatically suspend access when payment is overdue</p>
                      </div>
                      <Switch checked={suspendAfterOverdue} disabled className="opacity-100" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Auto Restore After Payment</Label>
                        <p className="text-xs text-slate-500 mt-1">Automatically restore access when payment is received</p>
                      </div>
                      <Switch checked={autoRestoreAfterPayment} disabled className="opacity-100" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card className="border border-slate-200/80 bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b border-emerald-100">
                <CardTitle className="text-lg font-bold text-slate-900">Pricing Summary</CardTitle>
                <CardDescription>Overview of pricing configuration</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-white/60">
                  <p className="text-xs text-slate-500 mb-1">Total Price</p>
                  <p className="text-2xl font-bold text-slate-900">₹{Number(totalPrice).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Number of Installments</span>
                    <span className="text-sm font-bold text-slate-900">{installments.length} stages</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Grace Period</span>
                    <span className="text-sm font-bold text-slate-900">{gracePeriodDays} days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Total Access Duration</span>
                    <span className="text-sm font-bold text-slate-900">{totalAccessDuration}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Total Program Duration</span>
                    <span className="text-sm font-bold text-slate-900">{duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Widget 3: Protocol Configuration Engine */}
        <TabsContent value="protocol" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Protocol Builder</h3>
              <p className="text-sm text-slate-600">Design patient journey automation for {specialty}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={generateProtocol} className="rounded-xl">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Protocol
              </Button>
              {specialty !== "Obesity / Healthy BMI" && (
                <Button variant="outline" className="rounded-xl">
                  <Copy className="mr-2 h-4 w-4" />
                  Clone Month
                </Button>
              )}
              <Button className="rounded-xl bg-primary text-white">
                <Copy className="mr-2 h-4 w-4" />
                Clone Program
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Protocol Builder */}
            <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-900">
                    {specialty === "Obesity / Healthy BMI" ? "Day-wise Program Builder" : "Month-wise Protocol Builder"}
                  </CardTitle>
                  <Badge className="bg-primary text-white">
                    {specialty === "Obesity / Healthy BMI" ? "90 Days" : "12 Months"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {specialty === "Obesity / Healthy BMI" ? (
                  // Healthy BMI - Day-wise View with Tabs
                  <div className="space-y-4">
                    <Tabs value={selectedDayTab.toString()} onValueChange={(v) => setSelectedDayTab(Number(v))}>
                      <TabsList className="grid grid-cols-10 h-12 bg-slate-100 rounded-lg p-1">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((batch) => (
                          <TabsTrigger
                            key={batch}
                            value={batch.toString()}
                            className="rounded-md text-xs font-semibold"
                          >
                            {batch * 10 - 9}-{batch * 10}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsContent value={selectedDayTab.toString()} className="mt-4">
                        <div className="grid grid-cols-10 gap-3">
                          {protocolDays
                            .filter((day) => day.day >= (selectedDayTab - 1) * 10 + 1 && day.day <= selectedDayTab * 10)
                            .map((day) => (
                            <div 
                              key={day.day}
                              onClick={() => openActivityDrawer(day.day)}
                              className={cn(
                                "p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
                                day.activities.length > 0 
                                  ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300" 
                                  : "bg-slate-50 border-slate-200"
                              )}
                            >
                              <div className="text-center">
                                <p className="text-sm font-bold text-slate-700">Day {day.day}</p>
                                {day.activities.length > 0 && (
                                  <div className="mt-2 flex justify-center">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  // DFF/TFF - Month-wise View with Tabs
                  <div className="space-y-4">
                    <Tabs value={selectedMonthTab.toString()} onValueChange={(v) => setSelectedMonthTab(Number(v))}>
                      <TabsList className="grid grid-cols-6 h-14 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-1.5 shadow-sm">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <TabsTrigger
                            key={month}
                            value={month.toString()}
                            className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
                          >
                            Month {month}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsContent value={selectedMonthTab.toString()} className="mt-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                            <Badge className="bg-primary text-white">Month {selectedMonthTab}</Badge>
                            <span className="text-sm font-medium text-slate-700">28 Day Journey</span>
                            <div className="ml-auto text-xs text-slate-500">
                              {protocolMonths.find((m) => m.month === selectedMonthTab)?.days.filter(d => d.activities.length > 0).length || 0} activities configured
                            </div>
                          </div>
                          <div className="grid grid-cols-7 gap-3">
                            {protocolMonths
                              .find((m) => m.month === selectedMonthTab)
                              ?.days.map((day) => (
                              <div 
                                key={day.day}
                                onClick={() => openActivityDrawer(day.day, selectedMonthTab)}
                                className={cn(
                                  "p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md text-center",
                                  day.activities.length > 0 
                                    ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300" 
                                    : "bg-slate-50 border-slate-200"
                                )}
                              >
                                <p className="text-sm font-bold text-slate-700">{day.day}</p>
                                {day.activities.length > 0 && (
                                  <div className="mt-2 flex justify-center">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient Journey Overview */}
            <Card className="border border-slate-200/80 bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b border-purple-100">
                <CardTitle className="text-lg font-bold text-slate-900">Patient Journey</CardTitle>
                <CardDescription>Overview of patient activities</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Total Activities</span>
                    <span className="text-sm font-bold text-slate-900">
                      {specialty === "Obesity / Healthy BMI" 
                        ? protocolDays.filter(d => d.activities.length > 0).length
                        : protocolMonths.reduce((acc, m) => acc + m.days.filter(d => d.activities.length > 0).length, 0)
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Doctor Consultations</span>
                    <span className="text-sm font-bold text-slate-900">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Dietitian Sessions</span>
                    <span className="text-sm font-bold text-slate-900">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Fitness Sessions</span>
                    <span className="text-sm font-bold text-slate-900">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                    <span className="text-sm font-medium text-slate-600">Webinars</span>
                    <span className="text-sm font-bold text-slate-900">0</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-purple-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Progress</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">0% configured</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Activity Configuration Sheet */}
      <Sheet open={activityDrawerOpen} onOpenChange={setActivityDrawerOpen}>
        <SheetContent className="w-[1000px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900">
              {selectedActivity ? "Edit Activity" : "Add Activity"}
            </SheetTitle>
            <SheetDescription>
              Configure activity for {selectedMonth ? `Month ${selectedMonth}, ` : ""}{selectedDay ? `Day ${selectedDay}` : ""}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-600 uppercase">Basic Information</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Activity Name</Label>
                  <Input 
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="e.g., Initial Consultation"
                    className="h-11 rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Activity Type</Label>
                  <Select value={activityType} onValueChange={(v: ActivityType) => { setActivityType(v); setSelectedStakeholders(getDefaultStakeholders(v)) }}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Welcome Session">Welcome Session</SelectItem>
                      <SelectItem value="Doctor Consultation">Doctor Consultation</SelectItem>
                      <SelectItem value="Dietitian Consultation">Dietitian Consultation</SelectItem>
                      <SelectItem value="Fitness Consultation">Fitness Consultation</SelectItem>
                      <SelectItem value="Webinar">Webinar</SelectItem>
                      <SelectItem value="Live Q&A">Live Q&A</SelectItem>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                      <SelectItem value="Lab Test Request">Lab Test Request</SelectItem>
                      <SelectItem value="Educational Content">Educational Content</SelectItem>
                      <SelectItem value="Phone Call">Phone Call</SelectItem>
                      <SelectItem value="Video Call">Video Call</SelectItem>
                      <SelectItem value="Offline Visit">Offline Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Description</Label>
                <Textarea 
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Describe the activity objectives..."
                  className="min-h-[80px] rounded-xl border-slate-200 resize-none"
                />
              </div>
            </div>

            {/* Stakeholders & Personnel Section */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-600 uppercase">Stakeholders & Personnel</p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="selectAllRoles"
                  checked={selectAllRoles}
                  onChange={(e) => {
                    setSelectAllRoles(e.target.checked)
                    if (e.target.checked) {
                      setSelectedStakeholders(["Doctor", "Dietitian", "Fitness Coach", "Service Team", "Patient", "Finance", "Admin", "Sales"] as Stakeholder[])
                    } else {
                      setSelectedStakeholders([])
                    }
                  }}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="selectAllRoles" className="text-sm font-semibold text-slate-700">Select All Roles</label>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Select Stakeholders</Label>
                <div className="flex flex-wrap gap-2">
                  {(["Doctor", "Dietitian", "Fitness Coach", "Service Team", "Patient", "Finance", "Admin", "Sales"] as Stakeholder[]).map((stakeholder) => (
                    <Badge
                      key={stakeholder}
                      variant={selectedStakeholders.includes(stakeholder) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer",
                        selectedStakeholders.includes(stakeholder) ? "bg-primary text-white" : ""
                      )}
                      onClick={() => {
                        setSelectedStakeholders(
                          selectedStakeholders.includes(stakeholder)
                            ? selectedStakeholders.filter(s => s !== stakeholder)
                            : [...selectedStakeholders, stakeholder]
                        )
                        setSelectAllRoles(false)
                      }}
                    >
                      {stakeholder}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedStakeholders.length > 0 && (
                <div className="space-y-4 mt-4">
                  <p className="text-sm font-semibold text-slate-700">Assign Personnel</p>
                  {selectedStakeholders.map((stakeholder) => (
                    <div key={stakeholder} className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">{stakeholder}</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder={`Search ${stakeholder.toLowerCase()}s...`}
                          value={personnelSearch[stakeholder] || ""}
                          onChange={(e) => setPersonnelSearch({ ...personnelSearch, [stakeholder]: e.target.value })}
                          className="pl-10 h-10 rounded-lg border-slate-200 text-sm"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <input
                            type="checkbox"
                            id={`all-${stakeholder}`}
                            checked={
                              defaultPersonnel
                                .filter(p => p.role === stakeholder)
                                .filter(p => {
                                  const searchTerm = (personnelSearch[stakeholder] || "").toLowerCase()
                                  return p.name.toLowerCase().includes(searchTerm)
                                })
                                .every(p => (selectedPersonnel[stakeholder] || []).includes(p.id))
                            }
                            onChange={(e) => {
                              const filteredPersonnel = defaultPersonnel
                                .filter(p => p.role === stakeholder)
                                .filter(p => {
                                  const searchTerm = (personnelSearch[stakeholder] || "").toLowerCase()
                                  return p.name.toLowerCase().includes(searchTerm)
                                })
                              if (e.target.checked) {
                                setSelectedPersonnel({
                                  ...selectedPersonnel,
                                  [stakeholder]: [...(selectedPersonnel[stakeholder] || []), ...filteredPersonnel.map(p => p.id)]
                                })
                              } else {
                                setSelectedPersonnel({
                                  ...selectedPersonnel,
                                  [stakeholder]: (selectedPersonnel[stakeholder] || []).filter(id => !filteredPersonnel.find(p => p.id === id))
                                })
                              }
                            }}
                            className="h-4 w-4 text-primary"
                          />
                          <label htmlFor={`all-${stakeholder}`} className="text-sm font-medium text-slate-700">Select All</label>
                        </div>
                        {defaultPersonnel
                          .filter(p => p.role === stakeholder)
                          .filter(p => {
                            const searchTerm = (personnelSearch[stakeholder] || "").toLowerCase()
                            return p.name.toLowerCase().includes(searchTerm)
                          })
                          .map((person) => (
                            <div key={person.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={person.id}
                                checked={(selectedPersonnel[stakeholder] || []).includes(person.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPersonnel({
                                      ...selectedPersonnel,
                                      [stakeholder]: [...(selectedPersonnel[stakeholder] || []), person.id]
                                    })
                                  } else {
                                    setSelectedPersonnel({
                                      ...selectedPersonnel,
                                      [stakeholder]: (selectedPersonnel[stakeholder] || []).filter(id => id !== person.id)
                                    })
                                  }
                                }}
                                className="h-4 w-4 text-primary"
                              />
                              <label htmlFor={person.id} className="text-sm text-slate-700">{person.name}</label>
                            </div>
                          ))}
                        {stakeholder === "Patient" && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <input
                              type="checkbox"
                              id="auto-assign"
                              checked={(selectedPersonnel[stakeholder] || []).includes("auto")}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPersonnel({
                                    ...selectedPersonnel,
                                    [stakeholder]: [...(selectedPersonnel[stakeholder] || []), "auto"]
                                  })
                                } else {
                                  setSelectedPersonnel({
                                    ...selectedPersonnel,
                                    [stakeholder]: (selectedPersonnel[stakeholder] || []).filter(id => id !== "auto")
                                  })
                                }
                              }}
                              className="h-4 w-4 text-primary"
                            />
                            <label htmlFor="auto-assign" className="text-sm text-slate-700">Auto-assign</label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mode Section */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-600 uppercase">Delivery Mode</p>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Mode</Label>
                <Select value={activityMode} onValueChange={(v: Mode) => setActivityMode(v)}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline (Peripheral Camp)</SelectItem>
                    {activityMode !== "Offline" && <SelectItem value="Recording">Recording</SelectItem>}
                    <SelectItem value="In-App">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notification Configuration */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-600 uppercase">Notification Configuration</p>
              {selectedStakeholders.map((stakeholder) => (
                <div key={stakeholder} className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">{stakeholder}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["3 Days Before", "1 Day Before", "1 Hour Before", "On Activity Time"].map((timing) => (
                      <div key={timing} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded h-4 w-4" />
                        <span className="text-sm text-slate-600">{timing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Conditional Fields */}
            {activityType === "Webinar" && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase">Webinar Configuration</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Webinar URL</Label>
                    <Input placeholder="https://..." className="h-10 rounded-lg border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Host URL</Label>
                    <Input placeholder="https://..." className="h-10 rounded-lg border-slate-200" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold text-slate-700">Recording URL</Label>
                    <Input placeholder="https://..." className="h-10 rounded-lg border-slate-200" />
                  </div>
                </div>
              </div>
            )}

            {activityType === "Educational Content" && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase">Content Configuration</p>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Content Type</Label>
                  <Select>
                    <SelectTrigger className="h-10 rounded-lg border-slate-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="Knowledge Post">Knowledge Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {activityType === "Lab Test Request" && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase">Lab Configuration</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Investigation Type</Label>
                    <Input placeholder="e.g., HbA1c Test" className="h-10 rounded-lg border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Due Date</Label>
                    <Input type="date" className="h-10 rounded-lg border-slate-200" />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Switch />
                    <Label className="text-sm font-medium text-slate-700">Follow-Up Required</Label>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setActivityDrawerOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={saveActivity} className="rounded-xl bg-primary text-white">
              {selectedActivity ? "Update Activity" : "Add Activity"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
