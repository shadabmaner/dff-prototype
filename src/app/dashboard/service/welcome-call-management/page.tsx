"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, Column } from "@/components/service/data-table"
import { StatusBadge } from "@/components/service/status-badge"
import { StatsCard } from "@/components/service/stats-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PhoneCall, Users, Activity, CheckCircle2, Search, UserPlus, GraduationCap, Stethoscope, Apple, Dumbbell, Loader2, Phone, Filter, Eye } from "lucide-react"
import { toast } from "sonner"

export interface WelcomeCallPatient {
  patient_id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  enrollment_status: string
  assessment_status: string | null
  payment_status: string
  program_name: string
  assigned_doctor_id: string | null
  assigned_nutritionist_id: string | null
  assigned_fitness_coach_id: string | null
  assigned_mentor_id: string | null
  doctor_first_name: string | null
  doctor_last_name: string | null
  dietician_first_name: string | null
  dietician_last_name: string | null
  physio_first_name: string | null
  physio_last_name: string | null
  mentor_first_name: string | null
  mentor_last_name: string | null
  welcome_call_status: "pending" | "completed" | null
  welcome_call_notes: string | null
}

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  staff_type: string
  specialization: string | null
  is_available: boolean
}

// Static data for demonstration
export const staticPatients: WelcomeCallPatient[] = [
  {
    patient_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    first_name: "Rajesh",
    last_name: "Kumar",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@email.com",
    enrollment_status: "active",
    assessment_status: "completed",
    payment_status: "paid",
    program_name: "Diabetes Reversal Program",
    assigned_doctor_id: null,
    assigned_nutritionist_id: null,
    assigned_fitness_coach_id: null,
    assigned_mentor_id: null,
    doctor_first_name: null,
    doctor_last_name: null,
    dietician_first_name: null,
    dietician_last_name: null,
    physio_first_name: null,
    physio_last_name: null,
    mentor_first_name: null,
    mentor_last_name: null,
    welcome_call_status: "pending",
    welcome_call_notes: null
  },
  {
    patient_id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    first_name: "Priya",
    last_name: "Sharma",
    phone: "+91 98765 43211",
    email: "priya.sharma@email.com",
    enrollment_status: "active",
    assessment_status: "completed",
    payment_status: "paid",
    program_name: "Diabetes Reversal Program",
    assigned_doctor_id: "doc1",
    assigned_nutritionist_id: "diet1",
    assigned_fitness_coach_id: null,
    assigned_mentor_id: null,
    doctor_first_name: "Dr. Bhagyesh",
    doctor_last_name: "Kulkarni",
    dietician_first_name: "Anjali",
    dietician_last_name: "Patel",
    physio_first_name: null,
    physio_last_name: null,
    mentor_first_name: null,
    mentor_last_name: null,
    welcome_call_status: "pending",
    welcome_call_notes: null
  },
  {
    patient_id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    first_name: "Amit",
    last_name: "Singh",
    phone: "+91 98765 43212",
    email: "amit.singh@email.com",
    enrollment_status: "active",
    assessment_status: "completed",
    payment_status: "paid",
    program_name: "Weight Management Program",
    assigned_doctor_id: null,
    assigned_nutritionist_id: null,
    assigned_fitness_coach_id: null,
    assigned_mentor_id: null,
    doctor_first_name: null,
    doctor_last_name: null,
    dietician_first_name: null,
    dietician_last_name: null,
    physio_first_name: null,
    physio_last_name: null,
    mentor_first_name: null,
    mentor_last_name: null,
    welcome_call_status: "completed",
    welcome_call_notes: "Welcome call completed successfully"
  },
  {
    patient_id: "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
    first_name: "Sneha",
    last_name: "Patel",
    phone: "+91 98765 43213",
    email: "sneha.patel@email.com",
    enrollment_status: "active",
    assessment_status: "completed",
    payment_status: "paid",
    program_name: "Diabetes Reversal Program",
    assigned_doctor_id: "doc2",
    assigned_nutritionist_id: "diet2",
    assigned_fitness_coach_id: "coach1",
    assigned_mentor_id: "mentor1",
    doctor_first_name: "Dr. Ramesh",
    doctor_last_name: "Gupta",
    dietician_first_name: "Pooja",
    dietician_last_name: "Verma",
    physio_first_name: "Vikram",
    physio_last_name: "Singh",
    mentor_first_name: "Rahul",
    mentor_last_name: "Mehta",
    welcome_call_status: "completed",
    welcome_call_notes: "All providers assigned, patient ready to start"
  },
  {
    patient_id: "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
    first_name: "Vikram",
    last_name: "Reddy",
    phone: "+91 98765 43214",
    email: "vikram.reddy@email.com",
    enrollment_status: "active",
    assessment_status: "completed",
    payment_status: "paid",
    program_name: "Diabetes Reversal Program",
    assigned_doctor_id: null,
    assigned_nutritionist_id: null,
    assigned_fitness_coach_id: null,
    assigned_mentor_id: null,
    doctor_first_name: null,
    doctor_last_name: null,
    dietician_first_name: null,
    dietician_last_name: null,
    physio_first_name: null,
    physio_last_name: null,
    mentor_first_name: null,
    mentor_last_name: null,
    welcome_call_status: "pending",
    welcome_call_notes: null
  },
  {
    patient_id: "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
    first_name: "Neha",
    last_name: "Joshi",
    phone: "+91 98765 43215",
    email: "neha.joshi@email.com",
    enrollment_status: "active",
    assessment_status: "completed",
    payment_status: "paid",
    program_name: "PCOS Management Program",
    assigned_doctor_id: null,
    assigned_nutritionist_id: null,
    assigned_fitness_coach_id: null,
    assigned_mentor_id: null,
    doctor_first_name: null,
    doctor_last_name: null,
    dietician_first_name: null,
    dietician_last_name: null,
    physio_first_name: null,
    physio_last_name: null,
    mentor_first_name: null,
    mentor_last_name: null,
    welcome_call_status: "pending",
    welcome_call_notes: null
  },
  {
    patient_id: "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
    first_name: "Suresh",
    last_name: "Nair",
    phone: "+91 98765 43216",
    email: "suresh.nair@email.com",
    enrollment_status: "active",
    assessment_status: "completed",
    payment_status: "paid",
    program_name: "Diabetes Reversal Program",
    assigned_doctor_id: "doc1",
    assigned_nutritionist_id: "diet1",
    assigned_fitness_coach_id: "coach2",
    assigned_mentor_id: "mentor2",
    doctor_first_name: "Dr. Bhagyesh",
    doctor_last_name: "Kulkarni",
    dietician_first_name: "Anjali",
    dietician_last_name: "Patel",
    physio_first_name: "Priya",
    physio_last_name: "Srinivasan",
    mentor_first_name: "Amit",
    mentor_last_name: "Desai",
    welcome_call_status: "completed",
    welcome_call_notes: "Welcome call completed with full team assignment"
  },
  {
    patient_id: "8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w",
    first_name: "Kavitha",
    last_name: "Rajan",
    phone: "+91 98765 43217",
    email: "kavitha.rajan@email.com",
    enrollment_status: "active",
    assessment_status: "completed",
    payment_status: "paid",
    program_name: "Weight Management Program",
    assigned_doctor_id: null,
    assigned_nutritionist_id: null,
    assigned_fitness_coach_id: null,
    assigned_mentor_id: null,
    doctor_first_name: null,
    doctor_last_name: null,
    dietician_first_name: null,
    dietician_last_name: null,
    physio_first_name: null,
    physio_last_name: null,
    mentor_first_name: null,
    mentor_last_name: null,
    welcome_call_status: "pending",
    welcome_call_notes: null
  }
]

const staticDoctors: StaffMember[] = [
  { id: "doc1", first_name: "Dr. Bhagyesh", last_name: "Kulkarni", staff_type: "doctor", specialization: "Diabetology", is_available: true },
  { id: "doc2", first_name: "Dr. Ramesh", last_name: "Gupta", staff_type: "doctor", specialization: "Endocrinology", is_available: true },
  { id: "doc3", first_name: "Dr. Sunita", last_name: "Verma", staff_type: "doctor", specialization: "Internal Medicine", is_available: false },
  { id: "doc4", first_name: "Dr. Vikram", last_name: "Singh", staff_type: "doctor", specialization: "Diabetology", is_available: true }
]

const staticDietitians: StaffMember[] = [
  { id: "diet1", first_name: "Anjali", last_name: "Patel", staff_type: "nutritionist", specialization: "Clinical Nutrition", is_available: true },
  { id: "diet2", first_name: "Pooja", last_name: "Verma", staff_type: "nutritionist", specialization: "Sports Nutrition", is_available: true },
  { id: "diet3", first_name: "Meera", last_name: "Nair", staff_type: "nutritionist", specialization: "Pediatric Nutrition", is_available: true },
  { id: "diet4", first_name: "Kavitha", last_name: "Rajan", staff_type: "nutritionist", specialization: "Weight Management", is_available: false }
]

const staticFitnessCoaches: StaffMember[] = [
  { id: "coach1", first_name: "Vikram", last_name: "Singh", staff_type: "fitness_coach", specialization: "Strength Training", is_available: true },
  { id: "coach2", first_name: "Priya", last_name: "Srinivasan", staff_type: "fitness_coach", specialization: "Yoga & Pilates", is_available: true },
  { id: "coach3", first_name: "Arjun", last_name: "Reddy", staff_type: "fitness_coach", specialization: "Cardio Training", is_available: true },
  { id: "coach4", first_name: "Deepak", last_name: "Sharma", staff_type: "fitness_coach", specialization: "Rehabilitation", is_available: false }
]

const staticMentors: StaffMember[] = [
  { id: "mentor1", first_name: "Rahul", last_name: "Mehta", staff_type: "mentor", specialization: "Diabetes Reversal Alumnus", is_available: true },
  { id: "mentor2", first_name: "Amit", last_name: "Desai", staff_type: "mentor", specialization: "Weight Management Alumnus", is_available: true },
  { id: "mentor3", first_name: "Sneha", last_name: "Kapoor", staff_type: "mentor", specialization: "PCOS Management Alumnus", is_available: true },
  { id: "mentor4", first_name: "Vikram", last_name: "Nair", staff_type: "mentor", specialization: "Lifestyle Coach Alumnus", is_available: true }
]

export default function WelcomeCallManagementPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all")
  const [selectedPatient, setSelectedPatient] = useState<WelcomeCallPatient | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [selectedDietitian, setSelectedDietitian] = useState<string>("")
  const [selectedFitnessCoach, setSelectedFitnessCoach] = useState<string>("")
  const [selectedMentor, setSelectedMentor] = useState<string>("")
  const [welcomeCallNotes, setWelcomeCallNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<WelcomeCallPatient[]>(staticPatients)

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchLower) ||
      patient.patient_id.toLowerCase().includes(searchLower)
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "pending" && patient.welcome_call_status === "pending") ||
      (statusFilter === "completed" && patient.welcome_call_status === "completed")
    
    return matchesSearch && matchesStatus
  })

  const paginatedPatients = filteredPatients.slice((page - 1) * 20, page * 20)
  const meta = { total: filteredPatients.length, page, limit: 20, totalPages: Math.ceil(filteredPatients.length / 20) }

  const handleSubmitWelcomeCall = () => {
    if (!selectedPatient) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.patient_id === selectedPatient.patient_id
            ? {
                ...p,
                welcome_call_status: "completed",
                welcome_call_notes: welcomeCallNotes,
                assigned_doctor_id: selectedDoctor || null,
                assigned_nutritionist_id: selectedDietitian || null,
                assigned_fitness_coach_id: selectedFitnessCoach || null,
                assigned_mentor_id: selectedMentor || null,
                doctor_first_name: selectedDoctor ? staticDoctors.find((d) => d.id === selectedDoctor)?.first_name || null : p.doctor_first_name,
                doctor_last_name: selectedDoctor ? staticDoctors.find((d) => d.id === selectedDoctor)?.last_name || null : p.doctor_last_name,
                dietician_first_name: selectedDietitian ? staticDietitians.find((d) => d.id === selectedDietitian)?.first_name || null : p.dietician_first_name,
                dietician_last_name: selectedDietitian ? staticDietitians.find((d) => d.id === selectedDietitian)?.last_name || null : p.dietician_last_name,
                physio_first_name: selectedFitnessCoach ? staticFitnessCoaches.find((c) => c.id === selectedFitnessCoach)?.first_name || null : p.physio_first_name,
                physio_last_name: selectedFitnessCoach ? staticFitnessCoaches.find((c) => c.id === selectedFitnessCoach)?.last_name || null : p.physio_last_name,
                mentor_first_name: selectedMentor ? staticMentors.find((m) => m.id === selectedMentor)?.first_name || null : p.mentor_first_name,
                mentor_last_name: selectedMentor ? staticMentors.find((m) => m.id === selectedMentor)?.last_name || null : p.mentor_last_name,
              }
            : p
        )
      )

      toast.success("Welcome call completed and providers assigned")
      setIsSubmitting(false)
      setIsDialogOpen(false)
      setSelectedPatient(null)
      setSelectedDoctor("")
      setSelectedDietitian("")
      setSelectedFitnessCoach("")
      setSelectedMentor("")
      setWelcomeCallNotes("")
    }, 1000)
  }

  const openWelcomeCallDialog = (patient: WelcomeCallPatient) => {
    setSelectedPatient(patient)
    setSelectedDoctor(patient.assigned_doctor_id || "")
    setSelectedDietitian(patient.assigned_nutritionist_id || "")
    setSelectedFitnessCoach(patient.assigned_fitness_coach_id || "")
    setSelectedMentor(patient.assigned_mentor_id || "")
    setWelcomeCallNotes("")
    setIsDialogOpen(true)
  }

  const isProvidersAssigned = (patient: WelcomeCallPatient) => {
    return patient.assigned_doctor_id && 
           patient.assigned_nutritionist_id && 
           patient.assigned_fitness_coach_id && 
           patient.assigned_mentor_id
  }

  const columns: Column<WelcomeCallPatient>[] = [
    {
      header: "Patient ID",
      cell: (row) => <p className="text-xs font-mono">{row.patient_id.slice(0, 8)}</p>,
    },
    {
      header: "Name",
      cell: (row) => (
        <div>
          <button
            onClick={() => router.push(`/dashboard/service/welcome-call-management/${row.patient_id}?first_name=${encodeURIComponent(row.first_name)}&last_name=${encodeURIComponent(row.last_name)}`)}
            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left"
          >
            {row.first_name} {row.last_name}
          </button>
          <p className="text-xs text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      header: "Payment",
      cell: (row) => (
        <StatusBadge status={row.payment_status} type="payment" />
      ),
    },
    {
      header: "Assessment",
      cell: (row) => (
        <StatusBadge status={row.assessment_status || "pending"} type="assessment" />
      ),
    },
    {
      header: "Doctor",
      cell: (row) => (
        <p className="text-sm text-slate-700">
          {row.doctor_first_name && row.doctor_last_name
            ? `${row.doctor_first_name} ${row.doctor_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Dietitian",
      cell: (row) => (
        <p className="text-sm text-slate-700">
          {row.dietician_first_name && row.dietician_last_name
            ? `${row.dietician_first_name} ${row.dietician_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Fitness Coach",
      cell: (row) => (
        <p className="text-sm text-slate-700">
          {row.physio_first_name && row.physio_last_name
            ? `${row.physio_first_name} ${row.physio_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Mentor",
      cell: (row) => (
        <p className="text-sm text-slate-700">
          {row.mentor_first_name && row.mentor_last_name
            ? `${row.mentor_first_name} ${row.mentor_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Welcome Call",
      cell: (row) => (
        <StatusBadge status={row.welcome_call_status || "pending"} type="call" />
      ),
    },
    {
      header: "Actions",
      cell: (row) => {
        const isAssigned = isProvidersAssigned(row)
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                router.push(`/dashboard/service/welcome-call-management/${row.patient_id}?first_name=${encodeURIComponent(row.first_name)}&last_name=${encodeURIComponent(row.last_name)}`)
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            {row.welcome_call_status === "pending" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openWelcomeCallDialog(row)}
              >
                <Phone className="h-3 w-3 mr-1" />
                Initiate Welcome Call
              </Button>
            ) : null}
            {row.welcome_call_status === "completed" ? (
              <p className="text-sm text-emerald-600 font-medium">
                ✓ Welcome call & assignment done
              </p>
            ) : null}
          </div>
        )
      },
    },
  ]

  const totalPatients = meta.total
  const pendingWelcomeCalls = patients.filter((p: WelcomeCallPatient) => p.welcome_call_status === "pending").length
  const completedWelcomeCalls = patients.filter((p: WelcomeCallPatient) => p.welcome_call_status === "completed").length
  const totalAssignmentsDone = patients.filter((p: WelcomeCallPatient) => isProvidersAssigned(p)).length

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Welcome Call Management
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Welcome Call Management
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Assign care team to patients after 2499 payment and assessment completion
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={totalPatients.toString()}
          subtitle="Payment + Assessment done"
          icon={Users}
          colorScheme="blue"
        />
        <StatsCard
          title="Pending Welcome Calls"
          value={pendingWelcomeCalls.toString()}
          subtitle="Awaiting assignment"
          icon={PhoneCall}
          colorScheme="amber"
        />
        <StatsCard
          title="Completed Welcome Calls"
          value={completedWelcomeCalls.toString()}
          subtitle="Providers assigned"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatsCard
          title="Total Assignments Done"
          value={totalAssignmentsDone.toString()}
          subtitle="Full team assigned"
          icon={Activity}
          colorScheme="purple"
        />
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">
              Patient List
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable
            data={paginatedPatients}
            columns={columns}
            searchPlaceholder="Search patients by name, phone, or ID..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
            enablePagination={true}
            serverMeta={meta as any}
            currentPage={page}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* Welcome Call Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Initiate Welcome Call
            </DialogTitle>
            <p className="text-sm text-slate-600">
              Complete welcome call and assign care team to {selectedPatient?.first_name} {selectedPatient?.last_name}
            </p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Information:</strong> Please call this lead and initiate a welcome call. After the call, complete the welcome call with provider assignment.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Doctor *
              </Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {staticDoctors.map((doc: StaffMember) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.first_name} {doc.last_name}
                      {doc.specialization && ` - ${doc.specialization}`}
                      {!doc.is_available && " (Unavailable)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Apple className="h-4 w-4" />
                Dietitian *
              </Label>
              <Select value={selectedDietitian} onValueChange={setSelectedDietitian}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dietitian" />
                </SelectTrigger>
                <SelectContent>
                  {staticDietitians.map((diet: StaffMember) => (
                    <SelectItem key={diet.id} value={diet.id}>
                      {diet.first_name} {diet.last_name}
                      {diet.specialization && ` - ${diet.specialization}`}
                      {!diet.is_available && " (Unavailable)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Fitness Coach *
              </Label>
              <Select value={selectedFitnessCoach} onValueChange={setSelectedFitnessCoach}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fitness coach" />
                </SelectTrigger>
                <SelectContent>
                  {staticFitnessCoaches.map((coach: StaffMember) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.first_name} {coach.last_name}
                      {coach.specialization && ` - ${coach.specialization}`}
                      {!coach.is_available && " (Unavailable)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Mentor *
              </Label>
              <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mentor" />
                </SelectTrigger>
                <SelectContent>
                  {staticMentors.map((mentor: StaffMember) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.first_name} {mentor.last_name}
                      {mentor.specialization && ` - ${mentor.specialization}`}
                      {!mentor.is_available && " (Unavailable)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter notes about the welcome call..."
                value={welcomeCallNotes}
                onChange={(e) => setWelcomeCallNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitWelcomeCall}
              disabled={!selectedDoctor || !selectedDietitian || !selectedFitnessCoach || !selectedMentor || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Complete Welcome Call & Assignment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
