"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  History, 
  User, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Plus,
  Save,
  FileText,
  Pill,
  Weight,
  Droplet,
  Heart,
  Brain,
  Utensils,
  Dumbbell,
  Target,
  Award,
  Flag
} from "lucide-react"

type JourneyStage = "pending" | "in_progress" | "completed" | "missed" | "rescheduled"

interface TimelineStage {
  id: number
  title: string
  status: JourneyStage
  date?: string
}

const timelineStages: TimelineStage[] = [
  { id: 1, title: "Registration", status: "completed", date: "2024-01-15" },
  { id: 2, title: "Clinical History", status: "completed", date: "2024-01-16" },
  { id: 3, title: "Symptom Assessment", status: "completed", date: "2024-01-16" },
  { id: 4, title: "Initial Lab Assessment", status: "completed", date: "2024-01-18" },
  { id: 5, title: "Medicine Assessment", status: "completed", date: "2024-01-20" },
  { id: 6, title: "Initial DFF Prescription", status: "completed", date: "2024-01-22" },
  { id: 7, title: "Month 1 Consultation", status: "completed", date: "2024-02-15" },
  { id: 8, title: "Month 1 Follow-up", status: "completed", date: "2024-02-20" },
  { id: 9, title: "Month 2 Consultation", status: "completed", date: "2024-03-15" },
  { id: 10, title: "Month 2 Follow-up", status: "completed", date: "2024-03-20" },
  { id: 11, title: "Month 3 Consultation", status: "completed", date: "2024-04-10" },
  { id: 12, title: "3 Month Assessment", status: "completed", date: "2024-04-15" },
  { id: 13, title: "Recovery Milestone 1", status: "completed", date: "2024-04-18" },
  { id: 14, title: "Month 4 Consultation", status: "in_progress" },
  { id: 15, title: "Month 4 Follow-up", status: "pending" },
  { id: 16, title: "Month 5 Consultation", status: "pending" },
  { id: 17, title: "Month 5 Follow-up", status: "pending" },
  { id: 18, title: "Month 6 Consultation", status: "pending" },
  { id: 19, title: "6 Month Assessment", status: "pending" },
  { id: 20, title: "GTT 1 Evaluation", status: "pending" },
  { id: 21, title: "Recovery Milestone 2", status: "pending" },
  { id: 22, title: "Month 7 Consultation", status: "pending" },
  { id: 23, title: "Month 7 Follow-up", status: "pending" },
  { id: 24, title: "Month 8 Consultation", status: "pending" },
  { id: 25, title: "Month 8 Follow-up", status: "pending" },
  { id: 26, title: "Month 9 Consultation", status: "pending" },
  { id: 27, title: "9 Month Assessment", status: "pending" },
  { id: 28, title: "GTT 2 Evaluation", status: "pending" },
  { id: 29, title: "Month 10 Consultation", status: "pending" },
  { id: 30, title: "Month 10 Follow-up", status: "pending" },
  { id: 31, title: "Month 11 Consultation", status: "pending" },
  { id: 32, title: "Month 11 Follow-up", status: "pending" },
  { id: 33, title: "Month 12 Consultation", status: "pending" },
  { id: 34, title: "Final Outcome", status: "pending" },
  { id: 35, title: "DFF Victor Evaluation", status: "pending" },
  { id: 36, title: "Program Closure", status: "pending" },
]

const getStatusColor = (status: JourneyStage) => {
  switch (status) {
    case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200"
    case "pending": return "bg-slate-100 text-slate-700 border-slate-200"
    case "missed": return "bg-red-100 text-red-700 border-red-200"
    case "rescheduled": return "bg-amber-100 text-amber-700 border-amber-200"
    default: return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

const getStatusIcon = (status: JourneyStage) => {
  switch (status) {
    case "completed": return <CheckCircle className="h-4 w-4" />
    case "in_progress": return <Clock className="h-4 w-4" />
    case "pending": return <Clock className="h-4 w-4" />
    case "missed": return <XCircle className="h-4 w-4" />
    case "rescheduled": return <AlertTriangle className="h-4 w-4" />
    default: return <Clock className="h-4 w-4" />
  }
}

export default function PatientJourneyPage() {
  const [selectedStage, setSelectedStage] = useState<number>(11)
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("")

  const handleAutoSave = () => {
    setAutoSaveStatus("Saving...")
    setTimeout(() => {
      setAutoSaveStatus("Saved")
      setTimeout(() => setAutoSaveStatus(""), 2000)
    }, 1000)
  }

  const renderFormSection = () => {
    switch (selectedStage) {
      case 1:
        return <RegistrationForm onSave={handleAutoSave} />
      case 2:
        return <ClinicalHistoryForm onSave={handleAutoSave} />
      case 3:
        return <SymptomAssessmentForm onSave={handleAutoSave} />
      case 4:
        return <InitialLabAssessmentForm onSave={handleAutoSave} />
      case 5:
        return <MedicineAssessmentForm onSave={handleAutoSave} />
      case 6:
        return <InitialDFFPrescriptionForm onSave={handleAutoSave} />
      case 7:
      case 9:
      case 11:
      case 14:
      case 16:
      case 18:
      case 22:
      case 24:
      case 26:
      case 29:
      case 31:
      case 33:
        return <ConsultationForm month={selectedStage === 7 ? 1 : selectedStage === 9 ? 2 : selectedStage === 11 ? 3 : selectedStage === 14 ? 4 : selectedStage === 16 ? 5 : selectedStage === 18 ? 6 : selectedStage === 22 ? 7 : selectedStage === 24 ? 8 : selectedStage === 26 ? 9 : selectedStage === 29 ? 10 : selectedStage === 31 ? 11 : 12} onSave={handleAutoSave} />
      case 8:
      case 10:
      case 15:
      case 17:
      case 23:
      case 25:
      case 30:
      case 32:
        return <FollowUpForm month={selectedStage === 8 ? 1 : selectedStage === 10 ? 2 : selectedStage === 15 ? 4 : selectedStage === 17 ? 5 : selectedStage === 23 ? 7 : selectedStage === 25 ? 8 : selectedStage === 30 ? 10 : 11} onSave={handleAutoSave} />
      case 12:
      case 19:
      case 27:
        return <AssessmentForm month={selectedStage === 12 ? 3 : selectedStage === 19 ? 6 : 9} onSave={handleAutoSave} />
      case 13:
      case 21:
        return <RecoveryMilestoneForm milestone={selectedStage === 13 ? 1 : 2} onSave={handleAutoSave} />
      case 20:
        return <GTTEvaluationForm gttNumber={1} onSave={handleAutoSave} />
      case 28:
        return <GTTEvaluationForm gttNumber={2} onSave={handleAutoSave} />
      case 34:
        return <FinalOutcomeForm onSave={handleAutoSave} />
      case 35:
        return <DFFVictorEvaluationForm onSave={handleAutoSave} />
      case 36:
        return <ProgramClosureForm onSave={handleAutoSave} />
      default:
        return <div className="p-8 text-center text-slate-500">Select a stage to view details</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <History className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Patient Journey</h1>
                <p className="text-sm text-slate-500">Complete clinical journey management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-slate-200">
                {autoSaveStatus || "Auto-save enabled"}
              </Badge>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Timeline */}
        <div className={`${isTimelineCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 border-r border-slate-200 bg-white/50 backdrop-blur-sm min-h-screen sticky top-16`}>
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
              className="w-full justify-start mb-4"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isTimelineCollapsed ? '' : 'rotate-90'}`} />
              {!isTimelineCollapsed && "Timeline"}
            </Button>
            
            {!isTimelineCollapsed && (
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {timelineStages.map((stage) => (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStage(stage.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedStage === stage.id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'hover:bg-slate-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded-full ${getStatusColor(stage.status)}`}>
                        {getStatusIcon(stage.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{stage.title}</p>
                        {stage.date && (
                          <p className="text-xs text-slate-500 mt-1">{stage.date}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-8">
          {/* Patient Snapshot Card */}
          <Card className="mb-6 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Current Weight</p>
                  <p className="text-2xl font-bold text-slate-900">78.5 kg</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> -6.5 kg
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Current HbA1c</p>
                  <p className="text-2xl font-bold text-slate-900">6.8%</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> -0.4%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Current Fasting</p>
                  <p className="text-2xl font-bold text-slate-900">110 mg/dL</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> -35 mg/dL
                  </p>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Current PP</p>
                  <p className="text-2xl font-bold text-slate-900">145 mg/dL</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> -40 mg/dL
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Program Month</p>
                  <p className="text-2xl font-bold text-slate-900">4/12</p>
                  <p className="text-xs text-slate-500 mt-1">33% Complete</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Compliance</p>
                  <p className="text-xl font-bold text-slate-900">85%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">GTT Status</p>
                  <p className="text-xl font-bold text-amber-600">Awaited</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Freedom Status</p>
                  <p className="text-xl font-bold text-emerald-600">On Track</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">DFF Victor Status</p>
                  <p className="text-xl font-bold text-slate-500">Pending</p>
                </div>
              </div>
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700">Journey Completion</p>
                  <p className="text-sm font-bold text-slate-900">13/36 Stages (36%)</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '36%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card className="mb-6 border border-slate-200/80 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Progress Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                {["Baseline", "Month 3", "Month 6", "Month 9", "Month 12"].map((milestone, idx) => (
                  <div key={milestone} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      idx <= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {idx <= 1 ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{milestone}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {timelineStages.find(s => s.id === selectedStage)?.title}
                </div>
                <Badge className={getStatusColor(timelineStages.find(s => s.id === selectedStage)?.status || "pending")}>
                  {timelineStages.find(s => s.id === selectedStage)?.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderFormSection()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Form Components

function RegistrationForm({ onSave }: { onSave: () => void }) {
  const [formData, setFormData] = useState({
    patientName: "Aditya Sharma",
    mobileNumber: "+91 98765 43210",
    email: "aditya.sharma@email.com",
    gender: "Male",
    age: "45",
    city: "Mumbai",
    batch: "June 2024",
    program: "Diabetes (DFF)",
    enrollmentDate: "2024-01-15",
    category: "Moderate"
  })

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    onSave()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Patient Name</Label>
          <Input value={formData.patientName} onChange={(e) => handleChange("patientName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Mobile Number</Label>
          <Input value={formData.mobileNumber} onChange={(e) => handleChange("mobileNumber", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Age</Label>
          <Input value={formData.age} onChange={(e) => handleChange("age", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Batch</Label>
          <Input value={formData.batch} onChange={(e) => handleChange("batch", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Program</Label>
          <Input value={formData.program} onChange={(e) => handleChange("program", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Enrollment Date</Label>
          <Input type="date" value={formData.enrollmentDate} onChange={(e) => handleChange("enrollmentDate", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Severe with Comorbidities">Severe with Comorbidities</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Pre-Diabetic">Pre-Diabetic</SelectItem>
              <SelectItem value="Mild">Mild</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function ClinicalHistoryForm({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Clinical History</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Years of DM</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>HT (Hypertension)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Thyroid</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cardiac History</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kidney History</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Stroke History</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Surgical History</Label>
          <Textarea placeholder="Enter surgical history..." />
        </div>
        <div className="space-y-2">
          <Label>Family History</Label>
          <Textarea placeholder="Enter family history..." />
        </div>
        <div className="space-y-2">
          <Label>Covid History</Label>
          <Textarea placeholder="Enter Covid history..." />
        </div>
        <div className="space-y-2">
          <Label>Additional Clinical History</Label>
          <Textarea placeholder="Enter additional clinical history..." />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function SymptomAssessmentForm({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Symptom Assessment</h3>
        
        <div>
          <Label className="font-medium">GIT</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["Gases", "Acidity", "Constipation", "Bloating", "Loose Motion"].map((symptom) => (
              <div key={symptom} className="flex items-center gap-2">
                <input type="checkbox" id={symptom} className="h-4 w-4" />
                <label htmlFor={symptom} className="text-sm">{symptom}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="font-medium">CNS</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["Tingling", "Numbness", "Burning Soles", "Neuropathy"].map((symptom) => (
              <div key={symptom} className="flex items-center gap-2">
                <input type="checkbox" id={symptom} className="h-4 w-4" />
                <label htmlFor={symptom} className="text-sm">{symptom}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="font-medium">CVS</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["Hypertension", "Cardiac Symptoms"].map((symptom) => (
              <div key={symptom} className="flex items-center gap-2">
                <input type="checkbox" id={symptom} className="h-4 w-4" />
                <label htmlFor={symptom} className="text-sm">{symptom}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="font-medium">Urinary</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["UTI", "Polyuria", "Nocturia", "Burning Urination"].map((symptom) => (
              <div key={symptom} className="flex items-center gap-2">
                <input type="checkbox" id={symptom} className="h-4 w-4" />
                <label htmlFor={symptom} className="text-sm">{symptom}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Symptom Conclusion</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select conclusion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="red">Red</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function InitialLabAssessmentForm({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Anthropometric</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Height (cm)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>Weight (kg)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>BMI</Label>
            <Input type="number" step="0.1" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Diabetes Profile</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>HbA1c (%)</Label>
            <Input type="number" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label>Fasting Sugar (mg/dL)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>PP Sugar (mg/dL)</Label>
            <Input type="number" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Inflammation</h3>
        <div className="space-y-2">
          <Label>hsCRP (mg/L)</Label>
          <Input type="number" step="0.1" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Vitamin Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vitamin D (ng/mL)</Label>
            <Input type="number" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label>Vitamin B12 (pg/mL)</Label>
            <Input type="number" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Insulin Resistance</h3>
        <div className="space-y-2">
          <Label>Fasting Insulin (μIU/mL)</Label>
          <Input type="number" step="0.1" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Lipid Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Total Cholesterol (mg/dL)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>LDL (mg/dL)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>HDL (mg/dL)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>Triglycerides (mg/dL)</Label>
            <Input type="number" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Kidney Profile</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Creatinine (mg/dL)</Label>
            <Input type="number" step="0.01" />
          </div>
          <div className="space-y-2">
            <Label>eGFR (mL/min)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>Uric Acid (mg/dL)</Label>
            <Input type="number" step="0.1" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Lab Conclusion</h3>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select conclusion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="red">Red</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Doctor Remarks</Label>
        <Textarea placeholder="Enter doctor remarks..." />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function MedicineAssessmentForm({ onSave }: { onSave: () => void }) {
  const [medicines, setMedicines] = useState([
    { id: 1, name: "", dosage: "", frequency: "", duration: "", reason: "" }
  ])

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now(), name: "", dosage: "", frequency: "", duration: "", reason: "" }])
  }

  const removeMedicine = (id: number) => {
    setMedicines(medicines.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Current Medicines</h3>
          <Button size="sm" onClick={addMedicine}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
        <div className="space-y-4">
          {medicines.map((medicine, idx) => (
            <Card key={medicine.id} className="border border-slate-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Medicine Name</Label>
                    <Input value={medicine.name} onChange={(e) => {
                      const newMeds = [...medicines]
                      newMeds[idx].name = e.target.value
                      setMedicines(newMeds)
                      onSave()
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input value={medicine.dosage} onChange={(e) => {
                      const newMeds = [...medicines]
                      newMeds[idx].dosage = e.target.value
                      setMedicines(newMeds)
                      onSave()
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Input value={medicine.frequency} onChange={(e) => {
                      const newMeds = [...medicines]
                      newMeds[idx].frequency = e.target.value
                      setMedicines(newMeds)
                      onSave()
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input value={medicine.duration} onChange={(e) => {
                      const newMeds = [...medicines]
                      newMeds[idx].duration = e.target.value
                      setMedicines(newMeds)
                      onSave()
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <div className="flex gap-2">
                      <Input value={medicine.reason} onChange={(e) => {
                        const newMeds = [...medicines]
                        newMeds[idx].reason = e.target.value
                        setMedicines(newMeds)
                        onSave()
                      }} />
                      {medicines.length > 1 && (
                        <Button variant="destructive" size="sm" onClick={() => removeMedicine(medicine.id)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Medicine Tapering Status</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="red">Red</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function InitialDFFPrescriptionForm({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>First Prescription Details</Label>
        <Textarea placeholder="Enter first prescription details..." className="min-h-[120px]" />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Protocol Assignment</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Smoothie</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Enema</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Juice Feasting</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Detox Protocol</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Residential Camp</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generate PDF
        </Button>
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function ConsultationForm({ month, onSave }: { month: number, onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Parameters</h3>
        
        <div className="space-y-2">
          <Label>Symptoms Review</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="improved">Improved</SelectItem>
              <SelectItem value="same">Same</SelectItem>
              <SelectItem value="worse">Worse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Weight (kg)</Label>
            <Input type="number" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label>Fasting Sugar (mg/dL)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>PP Sugar (mg/dL)</Label>
            <Input type="number" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Medicine Change</Label>
          <Textarea placeholder="Enter medicine changes..." />
        </div>

        <div className="space-y-2">
          <Label>Compliance</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="partially">Partially Compliant</SelectItem>
              <SelectItem value="non-compliant">Non-Compliant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Protocol Tracking</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Smoothie Taken</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
                <SelectItem value="not-eligible">Not Eligible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Enema Taken</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
                <SelectItem value="not-eligible">Not Eligible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Juice Feasting</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
                <SelectItem value="not-eligible">Not Eligible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Residential Camp Suggested</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
                <SelectItem value="not-eligible">Not Eligible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Additional Remarks</Label>
        <Textarea placeholder="Enter additional remarks..." />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function FollowUpForm({ month, onSave }: { month: number, onSave: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900">Month {month} Follow-up</h3>
      
      <div className="space-y-2">
        <Label>Symptoms Improvement</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="improved">Improved</SelectItem>
            <SelectItem value="same">Same</SelectItem>
            <SelectItem value="worse">Worse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Additional Remarks</Label>
        <Textarea placeholder="Enter additional remarks..." />
      </div>

      <div className="space-y-2">
        <Label>QOL Remarks</Label>
        <Textarea placeholder="Enter QOL remarks..." />
      </div>

      {month >= 4 && (
        <>
          <div className="space-y-2">
            <Label>Compliance Review</Label>
            <Textarea placeholder="Enter compliance review..." />
          </div>
          
          <div className="space-y-2">
            <Label>Protocol Review</Label>
            <Textarea placeholder="Enter protocol review..." />
          </div>
        </>
      )}

      {month >= 10 && (
        <>
          <div className="space-y-2">
            <Label>Sustainability Review</Label>
            <Textarea placeholder="Enter sustainability review..." />
          </div>
          
          <div className="space-y-2">
            <Label>Lifestyle Review</Label>
            <Textarea placeholder="Enter lifestyle review..." />
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function AssessmentForm({ month, onSave }: { month: number, onSave: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900">{month} Month Assessment</h3>
      
      <div className="space-y-4">
        <h4 className="font-medium text-slate-800">Clinical Assessment</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Weight at {month} Months (kg)</Label>
            <Input type="number" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label>Fasting at {month} Months (mg/dL)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>PP at {month} Months (mg/dL)</Label>
            <Input type="number" />
          </div>
          <div className="space-y-2">
            <Label>HbA1c at {month} Months (%)</Label>
            <Input type="number" step="0.1" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Other Investigations</Label>
          <Textarea placeholder="Enter additional investigations..." />
        </div>

        <div className="space-y-2">
          <Label>Lab Conclusion</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select conclusion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="red">Red</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-800">Symptomatic Improvement</h4>
        <div className="space-y-2">
          <Label>Symptom Status</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-symptoms">No Symptoms</SelectItem>
              <SelectItem value="mild">Mild Symptoms</SelectItem>
              <SelectItem value="moderate">Moderate Symptoms</SelectItem>
              <SelectItem value="severe">Severe Symptoms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-800">Improvement Status</h4>
        <div className="space-y-2">
          <Label>Improvement</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="complete-recovery">Complete Recovery</SelectItem>
              <SelectItem value="good-improvement">Good Improvement</SelectItem>
              <SelectItem value="moderate-improvement">Moderate Improvement</SelectItem>
              <SelectItem value="no-improvement">No Improvement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-slate-800">Compliance Status</h4>
        <div className="space-y-2">
          <Label>Compliance</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="non-compliant">Non-Compliant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Change In Medicine</Label>
        <Textarea placeholder="Enter medicine changes..." />
      </div>

      <div className="space-y-2">
        <Label>Medicine Tapering</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="red">Red</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {month === 6 && (
        <div className="space-y-2">
          <Label>Overall Remark</Label>
          <Textarea placeholder="Enter overall remarks..." />
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function RecoveryMilestoneForm({ milestone, onSave }: { milestone: number, onSave: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900">Recovery Milestone {milestone}</h3>
      
      <div className="space-y-2">
        <Label>Recovery {milestone} Done</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="not-eligible">Not Eligible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" />
      </div>

      <div className="space-y-2">
        <Label>Doctor Remarks</Label>
        <Textarea placeholder="Enter doctor remarks..." />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function GTTEvaluationForm({ gttNumber, onSave }: { gttNumber: number, onSave: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900">GTT {gttNumber} Evaluation</h3>
      
      <div className="space-y-2">
        <Label>GTT {gttNumber} Status</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Clear</SelectItem>
            <SelectItem value="borderline">Borderline</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="awaited">Awaited</SelectItem>
            <SelectItem value="not-done">Not Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" />
      </div>

      <div className="space-y-2">
        <Label>Doctor Remarks</Label>
        <Textarea placeholder="Enter doctor remarks..." />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function DFFVictorEvaluationForm({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900">DFF Victor Evaluation</h3>
      
      <div className="space-y-2">
        <Label>DFF Victor</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Recovery Achieved</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Improvement Achieved</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Ongoing</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Non Eligible</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Doctor Remarks</Label>
        <Textarea placeholder="Enter doctor remarks..." className="min-h-[150px]" />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function FinalAssessmentForm({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <Input type="number" step="0.1" />
        </div>
        <div className="space-y-2">
          <Label>Fasting (mg/dL)</Label>
          <Input type="number" />
        </div>
        <div className="space-y-2">
          <Label>PP (mg/dL)</Label>
          <Input type="number" />
        </div>
        <div className="space-y-2">
          <Label>HbA1c (%)</Label>
          <Input type="number" step="0.1" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Additional Investigations</Label>
        <Textarea placeholder="Enter additional investigations..." />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function FinalOutcomeForm({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Total Weight Loss (kg)</Label>
          <Input type="number" step="0.1" />
        </div>
        <div className="space-y-2">
          <Label>Total Weight Gain (kg)</Label>
          <Input type="number" step="0.1" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Freedom Status</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complete-recovery">Complete Recovery</SelectItem>
            <SelectItem value="good-improvement">Good Improvement</SelectItem>
            <SelectItem value="moderate-improvement">Moderate Improvement</SelectItem>
            <SelectItem value="no-improvement">No Improvement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Final GTT 1</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Clear</SelectItem>
            <SelectItem value="borderline">Borderline</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="awaited">Awaited</SelectItem>
            <SelectItem value="not-done">Not Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Final GTT 2</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Clear</SelectItem>
            <SelectItem value="borderline">Borderline</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="awaited">Awaited</SelectItem>
            <SelectItem value="not-done">Not Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Medicine Status</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medicine-stopped">Medicine Stopped</SelectItem>
            <SelectItem value="no-oha">No OHA</SelectItem>
            <SelectItem value="reduced-medication">Reduced Medication</SelectItem>
            <SelectItem value="ongoing-medication">Ongoing Medication</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function ProgramClosureForm({ onSave }: { onSave: () => void }) {
  const [programStatus, setProgramStatus] = useState("")

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Residential Retreat</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="attended">Attended</SelectItem>
            <SelectItem value="not-attended">Not Attended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Anandotsav</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="attended">Attended</SelectItem>
            <SelectItem value="not-attended">Not Attended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Program Status</Label>
        <Select value={programStatus} onValueChange={setProgramStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="continued">Continued</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dropout">Dropout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Compliance Status</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="non-compliant">Non-Compliant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {programStatus === "non-compliant" && (
        <div className="space-y-2">
          <Label>Non Compliance Reason</Label>
          <Textarea placeholder="Enter reason for non-compliance..." />
        </div>
      )}

      <div className="space-y-2">
        <Label>Closure Remarks</Label>
        <Textarea placeholder="Enter closure remarks..." className="min-h-[150px]" />
      </div>

      <div className="space-y-2">
        <Label>Doctor Sign Off</Label>
        <Input placeholder="Doctor name" />
      </div>

      <div className="space-y-2">
        <Label>Closure Date</Label>
        <Input type="date" />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save & Close
        </Button>
      </div>
    </div>
  )
}
