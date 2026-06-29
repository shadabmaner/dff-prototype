"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Save,
  FileText,
  Download,
  X,
  XCircle,
  User,
  Calendar,
  Activity,
  Stethoscope,
  Utensils,
  Dumbbell,
  MessageSquare,
  FileCheck,
  Search,
  Plus,
  Trash2,
  Copy,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Smartphone,
  Bell,
  History,
  Shield,
  Pill,
  Printer,
  Mic,
  MicOff,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Types
type Program = "Diabetes (DFF)" | "Thyroid (TFF)" | "Obesity / Healthy BMI"
type Frequency = "OD" | "BD" | "TDS" | "QID" | "SOS" | "Weekly" | "Alternate Days"
type MealTiming = "Before Breakfast" | "After Breakfast" | "Before Lunch" | "After Lunch" | "Before Dinner" | "After Dinner" | "Bedtime" | "Empty Stomach"

interface Medication {
  id: string
  name: string
  strength: string
  dosage: string
  frequency: Frequency
  duration: string
  durationUnit: string
  mealTiming: MealTiming
  instructions: string
  reminderRequired: boolean
  isCustom: boolean
}

// Mock Data
const mockPatient = {
  name: "Aditya Sharma",
  patientId: "PT-2026-001",
  age: 45,
  gender: "Male",
  program: "Diabetes (DFF)",
  assignedDietitian: "Dr. Priya Desai",
  assignedCoach: "Rahul Kumar",
  assignedServiceExecutive: "Sneha Gupta",
  programStatus: "Active",
  bmi: 28.5,
  weight: 85,
  hbA1c: 7.2,
  thyroid: "Normal",
  bloodSugar: { fasting: 145, postPrandial: 185 },
  dietCompliance: 85,
  exerciseCompliance: 72,
  medicationCompliance: 90,
}

const medicationMaster = [
  { id: "1", name: "Metformin 250 mg", generic: "Metformin", brand: "Metformin" },
  { id: "2", name: "Metformin 500 mg", generic: "Metformin", brand: "Metformin" },
  { id: "3", name: "Metformin XR 500 mg", generic: "Metformin", brand: "Metformin XR" },
  { id: "4", name: "Glimepiride 1 mg", generic: "Glimepiride", brand: "Amaryl" },
  { id: "5", name: "Glimepiride 2 mg", generic: "Glimepiride", brand: "Amaryl" },
  { id: "6", name: "Levothyroxine 50 mcg", generic: "Levothyroxine", brand: "Thyronorm" },
  { id: "7", name: "Levothyroxine 75 mcg", generic: "Levothyroxine", brand: "Thyronorm" },
  { id: "8", name: "Atorvastatin 10 mg", generic: "Atorvastatin", brand: "Lipitor" },
  { id: "9", name: "Atorvastatin 20 mg", generic: "Atorvastatin", brand: "Lipitor" },
  { id: "10", name: "Aspirin 75 mg", generic: "Aspirin", brand: "Ecosprin" },
]

const frequencyOptions = [
  { value: "OD", label: "Once Daily (OD)" },
  { value: "BD", label: "Twice Daily (BD)" },
  { value: "TDS", label: "Three Times Daily (TDS)" },
  { value: "QID", label: "Four Times Daily (QID)" },
  { value: "SOS", label: "As Needed (SOS)" },
  { value: "Weekly", label: "Once a Week" },
  { value: "Alternate Days", label: "Every Other Day" },
]

const mealTimingOptions = [
  "Before Breakfast",
  "After Breakfast",
  "Before Lunch",
  "After Lunch",
  "Before Dinner",
  "After Dinner",
  "Bedtime",
  "Empty Stomach",
]

export default function IssuePrescriptionPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [consultationDate, setConsultationDate] = useState(new Date().toISOString().split("T")[0])
  const [diagnosis, setDiagnosis] = useState("")
  const [clinicalFindings, setClinicalFindings] = useState("")
  const [consultationNotes, setConsultationNotes] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [followUpRemarks, setFollowUpRemarks] = useState("")
  const [medicationSearch, setMedicationSearch] = useState("")
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState("")
  const [showCustomMedicationInput, setShowCustomMedicationInput] = useState(false)
  const [customMedicationName, setCustomMedicationName] = useState("")
  const [showMedicationDialog, setShowMedicationDialog] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showSyncProgress, setShowSyncProgress] = useState(false)
  const [syncProgress, setSyncProgress] = useState({
    pharmacy: { status: "pending" as "pending" | "syncing" | "completed" | "error", message: "Waiting to sync..." },
    patientApp: { status: "pending" as "pending" | "syncing" | "completed" | "error", message: "Waiting to sync..." },
    reminders: { status: "pending" as "pending" | "syncing" | "completed" | "error", message: "Waiting to generate..." },
  })
  
  // Voice-to-text states
  const [isRecording, setIsRecording] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  const filteredMedications = medicationMaster.filter((m) =>
    m.name.toLowerCase().includes(medicationSearch.toLowerCase()) ||
    m.generic.toLowerCase().includes(medicationSearch.toLowerCase()) ||
    m.brand.toLowerCase().includes(medicationSearch.toLowerCase())
  )

  // Voice-to-text function with demo data
  const startVoiceRecording = (field: string) => {
    setActiveField(field)
    setIsRecording(true)
    
    // Demo: Simulate voice recognition with static data after 2 seconds
    setTimeout(() => {
      const demoTranscriptions: Record<string, string> = {
        diagnosis: "Type 2 Diabetes Mellitus with uncontrolled blood sugar levels",
        clinicalFindings: "Patient presents with elevated fasting blood sugar of 145 mg/dL and postprandial of 185 mg/dL. HbA1c at 7.2%. Mild symptoms of polyuria and polydipsia reported. Blood pressure within normal range.",
        consultationNotes: "Patient is compliant with current medication regimen. Diet adherence is good at 85%. Exercise compliance needs improvement at 72%. Recommend increasing physical activity to 30 minutes daily.",
        followUpRemarks: "Follow up in 2 weeks to monitor blood sugar response. Continue current medication. Review diet compliance and exercise progress.",
      }
      
      const transcription = demoTranscriptions[field] || ""
      
      switch(field) {
        case "diagnosis":
          setDiagnosis(transcription)
          break
        case "clinicalFindings":
          setClinicalFindings(transcription)
          break
        case "consultationNotes":
          setConsultationNotes(transcription)
          break
        case "followUpRemarks":
          setFollowUpRemarks(transcription)
          break
      }
      
      setIsRecording(false)
      setActiveField(null)
    }, 2000)
  }

  const stopVoiceRecording = () => {
    setIsRecording(false)
    setActiveField(null)
  }

  // Voice-to-text for medication
  const startMedicationVoiceRecording = () => {
    setActiveField("medication")
    setIsRecording(true)
    
    // Demo: Simulate voice recognition with medication data after 2 seconds
    setTimeout(() => {
      const medicationName = "Metformin 500 mg"
      const dosage = "1 tablet"
      const frequency = "BD"
      const duration = "30 days"
      
      setMedicationSearch(medicationName)
      setShowMedicationDropdown(true)
      
      // Auto-select the medication and add it
      const med = medicationMaster.find(m => m.name === medicationName)
      if (med) {
        addMedication(med)
        // Update the last added medication with demo voice data
        setMedications(prev => {
          const newMeds = [...prev]
          const lastMed = newMeds[newMeds.length - 1]
          if (lastMed) {
            lastMed.dosage = dosage
            lastMed.frequency = frequency as Frequency
            lastMed.duration = duration
            lastMed.durationUnit = "days"
          }
          return newMeds
        })
      }
      
      setIsRecording(false)
      setActiveField(null)
    }, 2000)
  }

  const addMedication = (medication: typeof medicationMaster[0] | { name: string; isCustom: boolean; custom?: boolean }) => {
    const medicationName = medication.name
    const isCustomMed = 'isCustom' in medication && medication.isCustom
    
    if (medications.some((m) => m.name === medicationName)) {
      alert("This medication has already been added.")
      return
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: medicationName,
      strength: !isCustomMed && 'name' in medication ? medicationName.split(" ").pop() || "" : "",
      dosage: "1 Tablet",
      frequency: "BD",
      duration: "30",
      durationUnit: "Days",
      mealTiming: "After Breakfast",
      instructions: "",
      reminderRequired: true,
      isCustom: isCustomMed,
    }

    setEditingMedication(newMedication)
    setShowMedicationDialog(true)
    setMedicationSearch("")
    setShowMedicationDropdown(false)
    setShowCustomMedicationInput(false)
    setCustomMedicationName("")
  }

  const openEditDialog = (medication: Medication) => {
    setEditingMedication(medication)
    setShowMedicationDialog(true)
  }

  const saveMedication = () => {
    if (editingMedication) {
      const existingIndex = medications.findIndex((m) => m.id === editingMedication.id)
      if (existingIndex >= 0) {
        const updatedMedications = [...medications]
        updatedMedications[existingIndex] = editingMedication
        setMedications(updatedMedications)
      } else {
        setMedications([...medications, editingMedication])
      }
      setShowMedicationDialog(false)
      setEditingMedication(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleConfirmIssue = () => {
    setShowPreviewDialog(false)
    setShowSyncProgress(true)
    
    // Simulate sync process
    setTimeout(() => {
      setSyncProgress(prev => ({
        ...prev,
        pharmacy: { status: "syncing", message: "Syncing with pharmacy system..." }
      }))
    }, 500)
    
    setTimeout(() => {
      setSyncProgress(prev => ({
        ...prev,
        pharmacy: { status: "completed", message: "Successfully synced with pharmacy" },
        patientApp: { status: "syncing", message: "Notifying patient app..." }
      }))
    }, 2000)
    
    setTimeout(() => {
      setSyncProgress(prev => ({
        ...prev,
        patientApp: { status: "completed", message: "Patient notified successfully" },
        reminders: { status: "syncing", message: "Generating medication reminders..." }
      }))
    }, 3500)
    
    setTimeout(() => {
      setSyncProgress(prev => ({
        ...prev,
        reminders: { status: "completed", message: "Reminders generated successfully" }
      }))
    }, 5000)
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id))
  }

  const duplicateMedication = (id: string) => {
    const medication = medications.find((m) => m.id === id)
    if (medication) {
      setMedications([...medications, { ...medication, id: Date.now().toString() }])
    }
  }

  const updateMedication = (id: string, field: keyof Medication, value: any) => {
    setMedications(medications.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/doctor/prescription-management">
                <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Issue Prescription</h1>
                <p className="text-sm text-slate-500">Create and issue new prescription for patient</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                <FileText className="h-4 w-4 mr-2" />
                Preview PDF
              </Button>
              <Button className="h-10 px-6 rounded-xl bg-primary text-white shadow-lg shadow-primary/30" onClick={() => setShowPreviewDialog(true)}>
                Issue Prescription
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 p-8">
        {/* Left Panel - Patient Clinical Context */}
        <div className="w-96 flex-shrink-0 space-y-4">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Patient Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Patient Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Name</span>
                  <span className="text-sm font-medium text-slate-900">{mockPatient.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Patient ID</span>
                  <span className="text-sm font-medium text-slate-900">{mockPatient.patientId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Age/Gender</span>
                  <span className="text-sm font-medium text-slate-900">{mockPatient.age} / {mockPatient.gender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Program</span>
                  <Badge variant="outline" className="border-primary text-primary text-xs">
                    {mockPatient.program}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">{mockPatient.programStatus}</Badge>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4" />

              {/* Assigned Team */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 uppercase">Assigned Team</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-600">Dietitian: {mockPatient.assignedDietitian}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-600">Coach: {mockPatient.assignedCoach}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-600">Service: {mockPatient.assignedServiceExecutive}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4" />

              {/* Body Measurements */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 uppercase">Body Measurements</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">BMI</p>
                    <p className="text-sm font-bold text-slate-900">{mockPatient.bmi}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Weight</p>
                    <p className="text-sm font-bold text-slate-900">{mockPatient.weight} kg</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">HbA1c</p>
                    <p className="text-sm font-bold text-slate-900">{mockPatient.hbA1c}%</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Thyroid</p>
                    <p className="text-sm font-bold text-slate-900">{mockPatient.thyroid}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-[10px] text-slate-500">Blood Sugar</p>
                  <p className="text-xs text-slate-600">Fasting: {mockPatient.bloodSugar.fasting} mg/dL</p>
                  <p className="text-xs text-slate-600">Post-Prandial: {mockPatient.bloodSugar.postPrandial} mg/dL</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4" />

              {/* Compliance Overview */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 uppercase">Compliance Overview</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Diet</span>
                      <span className="text-xs font-bold text-slate-900">{mockPatient.dietCompliance}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mockPatient.dietCompliance}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Exercise</span>
                      <span className="text-xs font-bold text-slate-900">{mockPatient.exerciseCompliance}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mockPatient.exerciseCompliance}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Medication</span>
                      <span className="text-xs font-bold text-slate-900">{mockPatient.medicationCompliance}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${mockPatient.medicationCompliance}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4" />

              {/* Recent Notes */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 uppercase">Recent Notes</p>
                <div className="space-y-2">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500 mb-1">Doctor - 2 days ago</p>
                    <p className="text-xs text-slate-700">Patient showing good progress. Continue current medication.</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500 mb-1">Dietitian - 5 days ago</p>
                    <p className="text-xs text-slate-700">Diet compliance improved. Adjust meal plan accordingly.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Prescription Builder */}
        <div className="flex-1 space-y-4">
          {/* Consultation Summary */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Consultation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Consultation Date</Label>
                  <Input
                    type="date"
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                    className="h-10 rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Follow-Up Date</Label>
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="h-10 rounded-xl border-slate-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Diagnosis</Label>
                <div className="relative">
                  <Input
                    placeholder="Enter diagnosis..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${isRecording && activeField === 'diagnosis' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => isRecording && activeField === 'diagnosis' ? stopVoiceRecording() : startVoiceRecording('diagnosis')}
                  >
                    {isRecording && activeField === 'diagnosis' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Clinical Findings</Label>
                <div className="relative">
                  <Textarea
                    placeholder="Enter clinical findings..."
                    value={clinicalFindings}
                    onChange={(e) => setClinicalFindings(e.target.value)}
                    className="min-h-[80px] rounded-xl border-slate-200 resize-none pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-1 top-1 h-8 w-8 p-0 ${isRecording && activeField === 'clinicalFindings' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => isRecording && activeField === 'clinicalFindings' ? stopVoiceRecording() : startVoiceRecording('clinicalFindings')}
                  >
                    {isRecording && activeField === 'clinicalFindings' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Consultation Notes</Label>
                <div className="relative">
                  <Textarea
                    placeholder="Enter consultation notes..."
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    className="min-h-[80px] rounded-xl border-slate-200 resize-none pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-1 top-1 h-8 w-8 p-0 ${isRecording && activeField === 'consultationNotes' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => isRecording && activeField === 'consultationNotes' ? stopVoiceRecording() : startVoiceRecording('consultationNotes')}
                  >
                    {isRecording && activeField === 'consultationNotes' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Follow-Up Remarks</Label>
                <div className="relative">
                  <Textarea
                    placeholder="Enter follow-up remarks..."
                    value={followUpRemarks}
                    onChange={(e) => setFollowUpRemarks(e.target.value)}
                    className="min-h-[60px] rounded-xl border-slate-200 resize-none pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-1 top-1 h-8 w-8 p-0 ${isRecording && activeField === 'followUpRemarks' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => isRecording && activeField === 'followUpRemarks' ? stopVoiceRecording() : startVoiceRecording('followUpRemarks')}
                  >
                    {isRecording && activeField === 'followUpRemarks' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medication Selection */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Medication Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by brand name, generic name, or medicine name..."
                  value={medicationSearch}
                  onChange={(e) => {
                    setMedicationSearch(e.target.value)
                    setShowMedicationDropdown(true)
                  }}
                  onFocus={() => setShowMedicationDropdown(true)}
                  className="pl-10 h-11 rounded-xl border-slate-200 pr-20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 ${isRecording && activeField === 'medication' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => isRecording && activeField === 'medication' ? stopVoiceRecording() : startMedicationVoiceRecording()}
                  title="Voice search for medication"
                >
                  {isRecording && activeField === 'medication' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                {showMedicationDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                    {filteredMedications.length > 0 ? (
                      <>
                        {filteredMedications.map((med) => (
                          <div
                            key={med.id}
                            onClick={() => addMedication(med)}
                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                          >
                            <p className="text-sm font-medium text-slate-900">{med.name}</p>
                            <p className="text-xs text-slate-500">Generic: {med.generic} | Brand: {med.brand}</p>
                          </div>
                        ))}
                        <div
                          onClick={() => {
                            setShowCustomMedicationInput(true)
                            setShowMedicationDropdown(false)
                          }}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 bg-blue-50"
                        >
                          <p className="text-sm font-medium text-primary">+ Add Other/Custom Medication</p>
                          <p className="text-xs text-slate-500">Medication not in DFF pharmacy list</p>
                        </div>
                      </>
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No medications found
                        <div
                          onClick={() => {
                            setShowCustomMedicationInput(true)
                            setShowMedicationDropdown(false)
                          }}
                          className="mt-2 px-4 py-2 hover:bg-slate-50 cursor-pointer border border-slate-200 rounded-lg bg-blue-50"
                        >
                          <p className="text-sm font-medium text-primary">+ Add Other/Custom Medication</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showCustomMedicationInput && (
                  <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <Label className="text-sm font-medium text-slate-700">Enter Custom Medication Name</Label>
                    <Input
                      placeholder="Enter medication name (e.g., Amoxicillin 500mg)"
                      value={customMedicationName}
                      onChange={(e) => setCustomMedicationName(e.target.value)}
                      className="mt-2 h-10 rounded-xl border-slate-200"
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (customMedicationName.trim()) {
                            addMedication({ name: customMedicationName.trim(), isCustom: true })
                          }
                        }}
                        className="h-8 rounded-lg bg-primary text-white hover:bg-primary/90"
                      >
                        Add Medication
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCustomMedicationInput(false)
                          setCustomMedicationName("")
                        }}
                        className="h-8 rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medication List */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" />
                  Medication List
                </CardTitle>
                <span className="text-sm text-slate-500">{medications.length} medications</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {medications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No medications added yet</p>
                  <p className="text-xs text-slate-400 mt-1">Search and add medications from the master list</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => openEditDialog(med)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Pill className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{med.name}</p>
                          <p className="text-xs text-slate-500">{med.dosage} · {frequencyOptions.find(f => f.value === med.frequency)?.label} · {med.duration} {med.durationUnit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateMedication(med.id)
                          }}
                          className="h-8 w-8 p-0 rounded-lg"
                        >
                          <Copy className="h-3 w-3 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeMedication(med.id)
                          }}
                          className="h-8 w-8 p-0 rounded-lg"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medication Entry Dialog */}
          <Dialog open={showMedicationDialog} onOpenChange={setShowMedicationDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {editingMedication && medications.find(m => m.id === editingMedication.id) ? "Edit Medication" : "Add Medication"}
                </DialogTitle>
                <DialogDescription>
                  Configure medication details including dosage, frequency, and instructions
                </DialogDescription>
              </DialogHeader>
              {editingMedication && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Medication</Label>
                    <Input value={editingMedication.name} disabled className="h-10 rounded-xl border-slate-200 bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Strength</Label>
                    <Input value={editingMedication.strength} disabled className="h-10 rounded-xl border-slate-200 bg-slate-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Dosage</Label>
                      <Input
                        value={editingMedication.dosage}
                        onChange={(e) => setEditingMedication({ ...editingMedication, dosage: e.target.value })}
                        placeholder="e.g., 1 Tablet, 5 ml"
                        className="h-10 rounded-xl border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Frequency</Label>
                      <Select
                        value={editingMedication.frequency}
                        onValueChange={(v) => setEditingMedication({ ...editingMedication, frequency: v as Frequency })}
                      >
                        <SelectTrigger className="h-10 rounded-xl border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Duration</Label>
                      <Input
                        value={editingMedication.duration}
                        onChange={(e) => setEditingMedication({ ...editingMedication, duration: e.target.value })}
                        placeholder="e.g., 30"
                        className="h-10 rounded-xl border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Duration Unit</Label>
                      <Select
                        value={editingMedication.durationUnit}
                        onValueChange={(v) => setEditingMedication({ ...editingMedication, durationUnit: v })}
                      >
                        <SelectTrigger className="h-10 rounded-xl border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Days">Days</SelectItem>
                          <SelectItem value="Weeks">Weeks</SelectItem>
                          <SelectItem value="Months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Meal Timing</Label>
                    <Select
                      value={editingMedication.mealTiming}
                      onValueChange={(v) => setEditingMedication({ ...editingMedication, mealTiming: v as MealTiming })}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mealTimingOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Instructions</Label>
                    <Textarea
                      value={editingMedication.instructions}
                      onChange={(e) => setEditingMedication({ ...editingMedication, instructions: e.target.value })}
                      placeholder="Enter special instructions..."
                      className="min-h-[80px] rounded-xl border-slate-200 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="reminder"
                      checked={editingMedication.reminderRequired}
                      onChange={(e) => setEditingMedication({ ...editingMedication, reminderRequired: e.target.checked })}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="reminder" className="text-sm text-slate-700">Set medication reminder for patient</Label>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowMedicationDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
                  Cancel
                </Button>
                <Button onClick={saveMedication} className="h-10 px-6 rounded-xl bg-primary text-white">
                  Save Medication
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Integration Panels */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pharmacy Integration */}
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Pharmacy Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-xs text-slate-500">Pending</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Sync status will update after issuing prescription</p>
              </CardContent>
            </Card>

            {/* Patient App Preview */}
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Patient App
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-xs text-slate-500">Pending</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Preview will show after issuing prescription</p>
              </CardContent>
            </Card>
          </div>

          {/* Medication Reminder Preview */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Medication Reminder Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {medications.length > 0 ? (
                <div className="space-y-2">
                  {medications.slice(0, 2).map((med) => (
                    <div key={med.id} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-slate-900">{med.name}</p>
                      <p className="text-xs text-slate-600">Frequency: {med.frequency} | Duration: {med.duration} {med.durationUnit}</p>
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-[10px] text-slate-500">Generated Schedule:</p>
                        <p className="text-xs text-slate-700">08:00 AM, 08:00 PM ({med.duration} {med.durationUnit})</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Add medications to see reminder schedule</p>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Created By</span>
                  <span className="text-xs font-medium text-slate-900">Dr. Bhagyesh Kulkarni</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Created Date</span>
                  <span className="text-xs font-medium text-slate-900">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Pharmacy Sync</span>
                  <Badge className="bg-slate-100 text-slate-700 text-xs">Pending</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Patient App Sync</span>
                  <Badge className="bg-slate-100 text-slate-700 text-xs">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Preview Dialog */}
          <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900">Prescription Preview</DialogTitle>
                <DialogDescription>
                  Review prescription before issuing to patient
                </DialogDescription>
              </DialogHeader>
              
              {/* Prescription Letterhead - A4 Format */}
              <div className="bg-white border-2 border-slate-200 rounded-lg p-8 space-y-6" style={{ aspectRatio: '210/297' }}>
                {/* Header with DFF Branding */}
                <div className="border-b-2 border-primary pb-4 bg-gradient-to-r from-blue-50 to-emerald-50 -mx-8 px-8 -mt-8 pt-8 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">DFF</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">DFF Healthcare</h2>
                        <p className="text-sm text-slate-600">Diabetes, Thyroid & Obesity Management</p>
                        <p className="text-xs text-slate-500 mt-1">123 Healthcare Avenue, Medical District, City - 400001</p>
                        <p className="text-xs text-slate-500">Phone: +91 1234567890 | Email: info@dffhealthcare.com</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">MEDICAL PRESCRIPTION</p>
                      <p className="text-xs text-slate-500">RX-2026-{medications.length + 1}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Patient Name</p>
                    <p className="text-sm font-bold text-slate-900">{mockPatient.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Patient ID</p>
                    <p className="text-sm font-medium text-slate-900">{mockPatient.patientId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Age/Gender</p>
                    <p className="text-sm font-medium text-slate-900">{mockPatient.age} years / {mockPatient.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Program</p>
                    <p className="text-sm font-medium text-primary">{mockPatient.program}</p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Diagnosis</p>
                  <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">{diagnosis || "Not specified"}</p>
                </div>

                {/* Medications with Color Coding */}
                {medications.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-3">Medications</p>
                    
                    {/* DFF Medications Section */}
                    {medications.filter(m => !m.isCustom).length > 0 && (
                      <div className="mb-4">
                        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-3 mb-2">
                          <p className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                            DFF Pharmacy Medications (Buy from DFF Pharmacy)
                          </p>
                        </div>
                        <div className="space-y-2">
                          {medications.filter(m => !m.isCustom).map((med, idx) => (
                            <div key={med.id} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{idx + 1}. {med.name}</p>
                                  <p className="text-xs text-slate-600">Strength: {med.strength}</p>
                                </div>
                                <Badge className="bg-emerald-600 text-white text-xs">{frequencyOptions.find(f => f.value === med.frequency)?.label}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-500">Dosage:</span> {med.dosage}
                                </div>
                                <div>
                                  <span className="text-slate-500">Duration:</span> {med.duration} {med.durationUnit}
                                </div>
                                <div>
                                  <span className="text-slate-500">Meal Timing:</span> {med.mealTiming}
                                </div>
                                <div>
                                  <span className="text-slate-500">Reminder:</span> {med.reminderRequired ? "Yes" : "No"}
                                </div>
                              </div>
                              {med.instructions && (
                                <div className="mt-2">
                                  <span className="text-slate-500 text-xs">Instructions:</span>
                                  <p className="text-xs text-slate-900">{med.instructions}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Medications Section */}
                    {medications.filter(m => m.isCustom).length > 0 && (
                      <div>
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 mb-2">
                          <p className="text-xs font-bold text-orange-800 flex items-center gap-2">
                            <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                            Other Medications (Buy from External Pharmacy)
                          </p>
                        </div>
                        <div className="space-y-2">
                          {medications.filter(m => m.isCustom).map((med, idx) => (
                            <div key={med.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{idx + 1}. {med.name}</p>
                                  <p className="text-xs text-slate-600">Strength: {med.strength || "As prescribed"}</p>
                                </div>
                                <Badge className="bg-orange-600 text-white text-xs">{frequencyOptions.find(f => f.value === med.frequency)?.label}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-500">Dosage:</span> {med.dosage}
                                </div>
                                <div>
                                  <span className="text-slate-500">Duration:</span> {med.duration} {med.durationUnit}
                                </div>
                                <div>
                                  <span className="text-slate-500">Meal Timing:</span> {med.mealTiming}
                                </div>
                                <div>
                                  <span className="text-slate-500">Reminder:</span> {med.reminderRequired ? "Yes" : "No"}
                                </div>
                              </div>
                              {med.instructions && (
                                <div className="mt-2">
                                  <span className="text-slate-500 text-xs">Instructions:</span>
                                  <p className="text-xs text-slate-900">{med.instructions}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Clinical Notes */}
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Clinical Notes</p>
                  <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">{clinicalFindings || consultationNotes || "No clinical notes provided"}</p>
                </div>

                {/* Follow-up */}
                {followUpDate && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Follow-up Date</p>
                    <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">{new Date(followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    {followUpRemarks && <p className="text-xs text-slate-600 mt-1">{followUpRemarks}</p>}
                  </div>
                )}

                {/* Important Notice */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <p className="text-xs font-bold text-blue-800 mb-2">⚠️ IMPORTANT NOTICE</p>
                  <ul className="text-xs text-blue-900 space-y-1 list-disc list-inside">
                    <li>Green highlighted medications are available at DFF Pharmacy</li>
                    <li>Orange highlighted medications need to be purchased from external pharmacies</li>
                    <li>Please follow the dosage instructions carefully</li>
                    <li>Complete the full course of medication as prescribed</li>
                  </ul>
                </div>

                {/* Digital Signature */}
                <div className="border-t-2 border-primary pt-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="w-32 h-16 border-b-2 border-slate-400 mb-2 flex items-end justify-center">
                        <p className="text-xs text-slate-400 italic">Digital Signature</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">Dr. Bhagyesh Kulkarni</p>
                      <p className="text-xs text-slate-600">MBBS, MD (General Medicine)</p>
                      <p className="text-xs text-slate-500">Reg. No: 12345678</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">This prescription is digitally signed</p>
                      <p className="text-xs text-slate-400">Valid prescription ID: RX-2026-{medications.length + 1}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
                  Back to Edit
                </Button>
                <Button variant="outline" onClick={handlePrint} className="h-10 px-6 rounded-xl border-slate-200">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button onClick={handleConfirmIssue} className="h-10 px-6 rounded-xl bg-primary text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm & Issue
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Sync Progress Dialog */}
          <Dialog open={showSyncProgress} onOpenChange={setShowSyncProgress}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900">Issuing Prescription</DialogTitle>
                <DialogDescription>
                  Syncing prescription with pharmacy, patient app, and generating reminders
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Pharmacy Sync */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <RefreshCw className={`h-5 w-5 text-primary ${syncProgress.pharmacy.status === "syncing" ? "animate-spin" : ""}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Pharmacy Sync</p>
                    <p className="text-xs text-slate-500">{syncProgress.pharmacy.message}</p>
                  </div>
                  {syncProgress.pharmacy.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                  {syncProgress.pharmacy.status === "error" && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                {/* Patient App Sync */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className={`h-5 w-5 text-primary ${syncProgress.patientApp.status === "syncing" ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Patient App Notification</p>
                    <p className="text-xs text-slate-500">{syncProgress.patientApp.message}</p>
                  </div>
                  {syncProgress.patientApp.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                  {syncProgress.patientApp.status === "error" && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                {/* Medication Reminders */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className={`h-5 w-5 text-primary ${syncProgress.reminders.status === "syncing" ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Medication Reminders</p>
                    <p className="text-xs text-slate-500">{syncProgress.reminders.message}</p>
                  </div>
                  {syncProgress.reminders.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                  {syncProgress.reminders.status === "error" && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>

              {syncProgress.pharmacy.status === "completed" && 
               syncProgress.patientApp.status === "completed" && 
               syncProgress.reminders.status === "completed" && (
                <div className="pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      setShowSyncProgress(false)
                      // Navigate back to prescription management
                      window.location.href = "/dashboard/doctor/prescription-management"
                    }}
                    className="w-full h-10 rounded-xl bg-primary text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Prescription Issued Successfully
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
