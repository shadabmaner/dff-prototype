"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  FileText,
  Download,
  Printer,
  Copy,
  Calendar,
  User,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  ChevronRight,
  Eye,
  ZoomIn,
  MessageSquare,
  Stethoscope,
  Target,
  Shield,
  Save,
  Calendar as CalendarIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Types
type ReviewStatus = "Pending Review" | "Under Review" | "Consultation Scheduled" | "Reviewed" | "Program Recommended" | "Closed"
type AssessmentSource = "Patient Submitted" | "Service Team Submitted"
type ProgramInterest = "Diabetes (DFF)" | "Thyroid (TFF)" | "Obesity / Healthy BMI" | "PCOD" | "Fatty Liver"
type Priority = "Low" | "Medium" | "High" | "Critical"
type Severity = "Mild" | "Moderate" | "Severe" | "Critical"

interface Assessment {
  id: string
  assessmentId: string
  patientName: string
  patientId: string
  gender: string
  age: number
  contactNumber: string
  programInterest: ProgramInterest
  assignedDietitian: string
  assignedCoach: string
  assignedServiceExecutive: string
  assessmentDate: string
  source: AssessmentSource
  reviewStatus: ReviewStatus
  priority: Priority
}

interface MedicalHistory {
  diabetes: boolean
  thyroid: boolean
  hypertension: boolean
  pcod: boolean
  fattyLiver: boolean
  sleepDisorders: boolean
  other: string
}

interface LifestyleAssessment {
  sleepDuration: string
  waterIntake: string
  activityLevel: string
  stressLevel: string
  eatingHabits: string
}

interface WeightManagement {
  currentWeight: number
  targetWeight: number
  bmi: number
  waistCircumference: number
}

interface ClinicalSymptoms {
  fatigue: boolean
  cravings: boolean
  constipation: boolean
  acidity: boolean
  moodSwings: boolean
  other: string
}

interface HistoryCall {
  callDate: string
  dietitianName: string
  keyObservations: string
  concernsIdentified: string
  escalationNotes: string
}

interface Document {
  id: string
  name: string
  type: string
  uploadDate: string
  url: string
}

// Mock Data
const mockAssessment: Assessment = {
  id: "1",
  assessmentId: "AS-2026-001",
  patientName: "Rajesh Kumar",
  patientId: "PT-2026-001",
  gender: "Male",
  age: 45,
  contactNumber: "+91 9876543210",
  programInterest: "Diabetes (DFF)",
  assignedDietitian: "Priya Sharma",
  assignedCoach: "Amit Patel",
  assignedServiceExecutive: "Rahul Verma",
  assessmentDate: "2026-01-18",
  source: "Patient Submitted",
  reviewStatus: "Pending Review",
  priority: "High",
}

const mockMedicalHistory: MedicalHistory = {
  diabetes: true,
  thyroid: false,
  hypertension: true,
  pcod: false,
  fattyLiver: true,
  sleepDisorders: false,
  other: "None",
}

const mockLifestyleAssessment: LifestyleAssessment = {
  sleepDuration: "5-6 hours",
  waterIntake: "1-2 liters",
  activityLevel: "Sedentary",
  stressLevel: "High",
  eatingHabits: "Irregular",
}

const mockWeightManagement: WeightManagement = {
  currentWeight: 92,
  targetWeight: 75,
  bmi: 31.5,
  waistCircumference: 102,
}

const mockClinicalSymptoms: ClinicalSymptoms = {
  fatigue: true,
  cravings: true,
  constipation: false,
  acidity: true,
  moodSwings: false,
  other: "None",
}

const mockHistoryCall: HistoryCall = {
  callDate: "2026-01-17",
  dietitianName: "Priya Sharma",
  keyObservations: "Patient has elevated blood sugar levels and obesity. Reports feeling tired frequently.",
  concernsIdentified: "High BMI, sedentary lifestyle, poor sleep quality",
  escalationNotes: "Requires doctor consultation for clinical evaluation",
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Blood Test Report - Jan 2026",
    type: "Lab Report",
    uploadDate: "2026-01-15",
    url: "#",
  },
  {
    id: "2",
    name: "Previous Prescription - Dec 2025",
    type: "Prescription",
    uploadDate: "2026-01-14",
    url: "#",
  },
  {
    id: "3",
    name: "Ultrasound Abdomen",
    type: "Medical Report",
    uploadDate: "2026-01-13",
    url: "#",
  },
]

const statusColors: Record<ReviewStatus, string> = {
  "Pending Review": "bg-amber-100 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-100 text-blue-700 border-blue-200",
  "Consultation Scheduled": "bg-purple-100 text-purple-700 border-purple-200",
  "Reviewed": "bg-slate-100 text-slate-700 border-slate-200",
  "Program Recommended": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Closed": "bg-gray-100 text-gray-700 border-gray-200",
}

const priorityColors: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
}

const severityColors: Record<Severity, string> = {
  Mild: "bg-green-100 text-green-700 border-green-200",
  Moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Severe: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
}

export default function AssessmentReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(mockAssessment.reviewStatus)
  const [clinicalNotes, setClinicalNotes] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [severity, setSeverity] = useState<Severity>("Moderate")
  const [recommendedProgram, setRecommendedProgram] = useState("")
  const [programDuration, setProgramDuration] = useState("")
  const [recommendationNotes, setRecommendationNotes] = useState("")
  const [consultationDate, setConsultationDate] = useState("")
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showReviewNotesDialog, setShowReviewNotesDialog] = useState(false)
  const [documentReviewNotes, setDocumentReviewNotes] = useState("")

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const handleMarkUnderReview = () => {
    setReviewStatus("Under Review")
  }

  const handleSaveReview = () => {
    if (!clinicalNotes) {
      alert("Clinical notes are mandatory")
      return
    }
    if (!diagnosis) {
      alert("Diagnosis is mandatory")
      return
    }
    if (!severity) {
      alert("Severity level is mandatory")
      return
    }
    setReviewStatus("Reviewed")
    alert("Assessment review completed successfully")
  }

  const handleRecommendProgram = () => {
    if (!recommendedProgram) {
      alert("Please select a program")
      return
    }
    if (!programDuration) {
      alert("Please specify program duration")
      return
    }
    if (!recommendationNotes) {
      alert("Recommendation notes are mandatory")
      return
    }
    setReviewStatus("Program Recommended")
    alert("Program recommendation submitted successfully")
  }

  const handleScheduleConsultation = () => {
    if (!consultationDate) {
      alert("Please select a consultation date")
      return
    }
    setReviewStatus("Consultation Scheduled")
    alert("Consultation scheduled successfully")
  }

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setShowDocumentDialog(true)
  }

  const handleAddReviewNotes = () => {
    setShowReviewNotesDialog(true)
  }

  const handleSaveDocumentReview = () => {
    alert("Review notes added successfully")
    setShowReviewNotesDialog(false)
    setDocumentReviewNotes("")
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Doctor Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Assessment <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Review</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Review patient assessment, medical history, and recommend appropriate healthcare program
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/doctor/assessment-reviews">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Assessment Summary */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{mockAssessment.assessmentId}</h2>
                <p className="text-sm text-slate-600">{mockAssessment.patientName} · {mockAssessment.patientId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn("text-xs font-semibold border", statusColors[reviewStatus])}>
                {reviewStatus}
              </Badge>
              <Badge className={cn("text-xs font-semibold border", priorityColors[mockAssessment.priority])}>
                {mockAssessment.priority} Priority
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs font-semibold">
                {mockAssessment.source}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient & Assessment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Patient Name</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockAssessment.patientName}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Patient ID</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockAssessment.patientId}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Gender</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockAssessment.gender}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Age</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockAssessment.age} years</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Contact Number</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockAssessment.contactNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Program Interest</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockAssessment.programInterest}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Assigned Dietitian</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockAssessment.assignedDietitian}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Assigned Coach</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockAssessment.assignedCoach}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Service Executive</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockAssessment.assignedServiceExecutive}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Assessment Date</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{formatDate(mockAssessment.assessmentDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockMedicalHistory.diabetes} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Diabetes</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockMedicalHistory.thyroid} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Thyroid</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockMedicalHistory.hypertension} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Hypertension</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockMedicalHistory.pcod} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">PCOD</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockMedicalHistory.fattyLiver} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Fatty Liver</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockMedicalHistory.sleepDisorders} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Sleep Disorders</span>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-xs text-slate-500 uppercase font-semibold">Other Conditions</Label>
                <p className="text-sm text-slate-900 mt-1">{mockMedicalHistory.other}</p>
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle Assessment */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Lifestyle Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Sleep Duration</Label>
                  <p className="text-sm text-slate-900 mt-1">{mockLifestyleAssessment.sleepDuration}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Water Intake</Label>
                  <p className="text-sm text-slate-900 mt-1">{mockLifestyleAssessment.waterIntake}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Activity Level</Label>
                  <p className="text-sm text-slate-900 mt-1">{mockLifestyleAssessment.activityLevel}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Stress Level</Label>
                  <p className="text-sm text-slate-900 mt-1">{mockLifestyleAssessment.stressLevel}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Eating Habits</Label>
                  <p className="text-sm text-slate-900 mt-1">{mockLifestyleAssessment.eatingHabits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight Management */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Weight Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Current Weight</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockWeightManagement.currentWeight} kg</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Target Weight</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockWeightManagement.targetWeight} kg</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">BMI</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockWeightManagement.bmi}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Waist Circumference</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{mockWeightManagement.waistCircumference} cm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Symptoms */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Clinical Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockClinicalSymptoms.fatigue} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Fatigue</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockClinicalSymptoms.cravings} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Cravings</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockClinicalSymptoms.constipation} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Constipation</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockClinicalSymptoms.acidity} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Acidity</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mockClinicalSymptoms.moodSwings} disabled className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-700">Mood Swings</span>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-xs text-slate-500 uppercase font-semibold">Other Symptoms</Label>
                <p className="text-sm text-slate-900 mt-1">{mockClinicalSymptoms.other}</p>
              </div>
            </CardContent>
          </Card>

          {/* History Call Summary */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                History Call Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500 uppercase font-semibold">Call Date</Label>
                    <p className="text-sm text-slate-900 mt-1">{formatDate(mockHistoryCall.callDate)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase font-semibold">Dietitian</Label>
                    <p className="text-sm text-slate-900 mt-1">{mockHistoryCall.dietitianName}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Key Observations</Label>
                  <p className="text-sm text-slate-900 mt-1">{mockHistoryCall.keyObservations}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Concerns Identified</Label>
                  <p className="text-sm text-slate-900 mt-1">{mockHistoryCall.concernsIdentified}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Escalation Notes</Label>
                  <p className="text-sm text-slate-900 mt-1">{mockHistoryCall.escalationNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Uploaded Documents
                </CardTitle>
                <Link href={`/dashboard/doctor/patients/${mockAssessment.patientId}`}>
                  <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-primary">
                    View All Documents
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {mockDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.type} · {formatDate(doc.uploadDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => handleViewDocument(doc)}>
                        <Eye className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                        <Download className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                        <ZoomIn className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg" onClick={handleAddReviewNotes}>
                        <MessageSquare className="h-4 w-4 mr-1 text-slate-600" />
                        Add Notes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Clinical Review & Program Recommendation */}
        <div className="space-y-6">
          {/* Clinical Review Workflow */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Clinical Review
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {reviewStatus === "Pending Review" && (
                <Button onClick={handleMarkUnderReview} className="w-full h-10 rounded-xl bg-primary text-white">
                  <Clock className="h-4 w-4 mr-2" />
                  Mark Under Review
                </Button>
              )}

              <div>
                <Label className="text-sm font-semibold text-slate-700">Clinical Notes</Label>
                <Textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter clinical observations and findings..."
                  className="min-h-[100px] rounded-xl border-slate-200 resize-none mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Diagnosis</Label>
                <Input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Severity Assessment</Label>
                <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mild">Mild</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Severe">Severe</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs font-semibold border", severityColors.Mild)}>Mild</Badge>
                    <span className="text-xs text-slate-600">BMI 27, No major comorbidities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs font-semibold border", severityColors.Moderate)}>Moderate</Badge>
                    <span className="text-xs text-slate-600">BMI 31, Diabetes Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs font-semibold border", severityColors.Severe)}>Severe</Badge>
                    <span className="text-xs text-slate-600">BMI 36, HbA1c Elevated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs font-semibold border", severityColors.Critical)}>Critical</Badge>
                    <span className="text-xs text-slate-600">Multiple conditions, Urgent intervention</span>
                  </div>
                </div>
              </div>

              {(reviewStatus === "Under Review" || reviewStatus === "Pending Review") && (
                <Button onClick={handleSaveReview} className="w-full h-10 rounded-xl bg-primary text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Review
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Schedule Consultation */}
          {(reviewStatus === "Reviewed" || reviewStatus === "Under Review") && (
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Schedule Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Consultation Date</Label>
                  <Input
                    type="date"
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 mt-2"
                  />
                </div>
                <Button onClick={handleScheduleConsultation} className="w-full h-10 rounded-xl bg-primary text-white">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Schedule Consultation
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Program Recommendation */}
          {(reviewStatus === "Reviewed" || reviewStatus === "Consultation Scheduled") && (
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Program Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Recommended Program</Label>
                  <Select value={recommendedProgram} onValueChange={setRecommendedProgram}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Healthy BMI 90 Days">Healthy BMI 90 Days</SelectItem>
                      <SelectItem value="Healthy BMI 7 Days">Healthy BMI 7 Days</SelectItem>
                      <SelectItem value="Diabetes Reversal Program">Diabetes Reversal Program</SelectItem>
                      <SelectItem value="Thyroid Reversal Program">Thyroid Reversal Program</SelectItem>
                      <SelectItem value="PCOD Reversal Program">PCOD Reversal Program</SelectItem>
                      <SelectItem value="Fatty Liver Reversal Program">Fatty Liver Reversal Program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Program Duration</Label>
                  <Select value={programDuration} onValueChange={setProgramDuration}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="180">180 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Severity</Label>
                  <div className="mt-2">
                    <Badge className={cn("text-xs font-semibold border", severityColors[severity])}>
                      {severity}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Recommendation Notes</Label>
                  <Textarea
                    value={recommendationNotes}
                    onChange={(e) => setRecommendationNotes(e.target.value)}
                    placeholder="Enter recommendation rationale and clinical justification..."
                    className="min-h-[100px] rounded-xl border-slate-200 resize-none mt-2"
                  />
                </div>

                <Button onClick={handleRecommendProgram} className="w-full h-10 rounded-xl bg-primary text-white">
                  <Target className="h-4 w-4 mr-2" />
                  Recommend Program
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Review Status */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Review Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Current Status</span>
                  <Badge className={cn("text-xs font-semibold border", statusColors[reviewStatus])}>
                    {reviewStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Priority</span>
                  <Badge className={cn("text-xs font-semibold border", priorityColors[mockAssessment.priority])}>
                    {mockAssessment.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Assessment Source</span>
                  <span className="text-sm text-slate-900">{mockAssessment.source}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document View Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Document Preview</DialogTitle>
            <DialogDescription>
              {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-8 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 text-center">Document preview would be displayed here</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowDocumentDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
            <Button className="h-10 px-6 rounded-xl bg-primary text-white">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Review Notes Dialog */}
      <Dialog open={showReviewNotesDialog} onOpenChange={setShowReviewNotesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Add Review Notes</DialogTitle>
            <DialogDescription>
              Add your review notes for this document
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Label className="text-sm font-semibold text-slate-700">Review Notes</Label>
            <Textarea
              value={documentReviewNotes}
              onChange={(e) => setDocumentReviewNotes(e.target.value)}
              placeholder="Enter your review notes..."
              className="min-h-[120px] rounded-xl border-slate-200 resize-none mt-2"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowReviewNotesDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleSaveDocumentReview} className="h-10 px-6 rounded-xl bg-primary text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
