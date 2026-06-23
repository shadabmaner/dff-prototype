"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, Column } from "@/components/service/data-table"
import { StatusBadge } from "@/components/service/status-badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, Plus, GraduationCap, Users, CheckCircle2, XCircle, Phone, Mail, Calendar, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Mentor {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  specialty: "Diabetes Free Forever" | "Thyroid Free Forever" | "Healthy BMI Forever"
  status: "active" | "inactive"
  assigned_patients: number
  join_date: string
}

interface AssignedPatient {
  patient_id: string
  patient_name: string
  mobile_number: string
  specialty: string
  program: string
  batch_id: string
}

interface MentorForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  specialty: "Diabetes Free Forever" | "Thyroid Free Forever" | "Healthy BMI Forever"
}

// Static data for demonstration
const staticMentors: Mentor[] = [
  {
    id: "mentor-001",
    first_name: "Rahul",
    last_name: "Mehta",
    email: "rahul.mehta@email.com",
    phone: "+91 98765 43210",
    specialty: "Diabetes Free Forever",
    status: "active",
    assigned_patients: 25,
    join_date: "2024-01-15"
  },
  {
    id: "mentor-002",
    first_name: "Amit",
    last_name: "Desai",
    email: "amit.desai@email.com",
    phone: "+91 98765 43211",
    specialty: "Diabetes Free Forever",
    status: "active",
    assigned_patients: 32,
    join_date: "2024-02-10"
  },
  {
    id: "mentor-003",
    first_name: "Sneha",
    last_name: "Kapoor",
    email: "sneha.kapoor@email.com",
    phone: "+91 98765 43212",
    specialty: "Thyroid Free Forever",
    status: "active",
    assigned_patients: 18,
    join_date: "2024-01-20"
  },
  {
    id: "mentor-004",
    first_name: "Vikram",
    last_name: "Nair",
    email: "vikram.nair@email.com",
    phone: "+91 98765 43213",
    specialty: "Healthy BMI Forever",
    status: "active",
    assigned_patients: 22,
    join_date: "2024-03-05"
  },
  {
    id: "mentor-005",
    first_name: "Priya",
    last_name: "Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43214",
    specialty: "Diabetes Free Forever",
    status: "inactive",
    assigned_patients: 0,
    join_date: "2024-04-01"
  },
  {
    id: "mentor-006",
    first_name: "Deepak",
    last_name: "Patel",
    email: "deepak.patel@email.com",
    phone: "+91 98765 43215",
    specialty: "Thyroid Free Forever",
    status: "active",
    assigned_patients: 15,
    join_date: "2024-02-28"
  },
  {
    id: "mentor-007",
    first_name: "Anjali",
    last_name: "Singh",
    email: "anjali.singh@email.com",
    phone: "+91 98765 43216",
    specialty: "Healthy BMI Forever",
    status: "active",
    assigned_patients: 28,
    join_date: "2024-01-10"
  },
  {
    id: "mentor-008",
    first_name: "Rajesh",
    last_name: "Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 98765 43217",
    specialty: "Thyroid Free Forever",
    status: "inactive",
    assigned_patients: 0,
    join_date: "2024-05-15"
  },
]

// Static assigned patients data for demonstration
const assignedPatientsData: Record<string, AssignedPatient[]> = {
  "mentor-001": [
    { patient_id: "PAT001", patient_name: "Rajesh Kumar", mobile_number: "+91 98765 43220", specialty: "Diabetes Free Forever", program: "Diabetes Reversal Program", batch_id: "BATCH-001" },
    { patient_id: "PAT002", patient_name: "Sneha Kapoor", mobile_number: "+91 98765 43221", specialty: "Diabetes Free Forever", program: "Diabetes Reversal Program", batch_id: "BATCH-001" },
    { patient_id: "PAT003", patient_name: "Vikram Nair", mobile_number: "+91 98765 43222", specialty: "Diabetes Free Forever", program: "Diabetes Reversal Program", batch_id: "BATCH-002" },
  ],
  "mentor-002": [
    { patient_id: "PAT004", patient_name: "Priya Sharma", mobile_number: "+91 98765 43223", specialty: "Diabetes Free Forever", program: "Diabetes Reversal Program", batch_id: "BATCH-002" },
    { patient_id: "PAT005", patient_name: "Deepak Patel", mobile_number: "+91 98765 43224", specialty: "Diabetes Free Forever", program: "Diabetes Reversal Program", batch_id: "BATCH-003" },
  ],
  "mentor-003": [
    { patient_id: "PAT006", patient_name: "Anjali Singh", mobile_number: "+91 98765 43225", specialty: "Thyroid Free Forever", program: "Thyroid Management Program", batch_id: "BATCH-004" },
    { patient_id: "PAT007", patient_name: "Rahul Mehta", mobile_number: "+91 98765 43226", specialty: "Thyroid Free Forever", program: "Thyroid Management Program", batch_id: "BATCH-004" },
  ],
  "mentor-004": [
    { patient_id: "PAT008", patient_name: "Amit Desai", mobile_number: "+91 98765 43227", specialty: "Healthy BMI Forever", program: "Weight Management Program", batch_id: "BATCH-005" },
  ],
  "mentor-006": [
    { patient_id: "PAT009", patient_name: "Sneha Reddy", mobile_number: "+91 98765 43228", specialty: "Thyroid Free Forever", program: "Thyroid Management Program", batch_id: "BATCH-006" },
  ],
  "mentor-007": [
    { patient_id: "PAT010", patient_name: "Vikram Singh", mobile_number: "+91 98765 43229", specialty: "Healthy BMI Forever", program: "Weight Management Program", batch_id: "BATCH-007" },
  ],
}

const specialties = [
  "Diabetes Free Forever",
  "Thyroid Free Forever",
  "Healthy BMI Forever"
] as const

export default function MentorManagementPage() {
  const [mentors, setMentors] = useState<Mentor[]>(staticMentors)
  const [searchTerm, setSearchTerm] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState<"all" | typeof specialties[number]>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPatientsDialogOpen, setIsPatientsDialogOpen] = useState(false)
  const [selectedMentorForPatients, setSelectedMentorForPatients] = useState<Mentor | null>(null)
  
  const [formData, setFormData] = useState<MentorForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialty: "Diabetes Free Forever"
  })

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      specialty: "Diabetes Free Forever"
    })
    setIsEditMode(false)
    setSelectedMentor(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (mentor: Mentor) => {
    setSelectedMentor(mentor)
    setFormData({
      first_name: mentor.first_name,
      last_name: mentor.last_name,
      email: mentor.email,
      phone: mentor.phone,
      specialty: mentor.specialty
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!formData.email.trim()) {
      toast.error("Email is required")
      return
    }
    if (!formData.phone.trim()) {
      toast.error("Phone is required")
      return
    }
    if (!formData.specialty) {
      toast.error("Specialty is required")
      return
    }

    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call

      if (isEditMode && selectedMentor) {
        // Update existing mentor
        setMentors(mentors.map(mentor =>
          mentor.id === selectedMentor.id
            ? {
                ...mentor,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                specialty: formData.specialty
              }
            : mentor
        ))
        toast.success("Mentor updated successfully")
      } else {
        // Add new mentor
        const newMentor: Mentor = {
          id: `mentor-${Date.now()}`,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          specialty: formData.specialty,
          status: "active",
          assigned_patients: 0,
          join_date: new Date().toISOString().split('T')[0]
        }
        setMentors([...mentors, newMentor])
        toast.success("Mentor added successfully")
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(isEditMode ? "Failed to update mentor" : "Failed to add mentor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleStatus = (mentor: Mentor) => {
    const newStatus = mentor.status === "active" ? "inactive" : "active"
    setMentors(mentors.map(m =>
      m.id === mentor.id ? { ...m, status: newStatus } : m
    ))
    toast.success(`Mentor ${newStatus === "active" ? "activated" : "deactivated"} successfully`)
  }

  const openPatientsDialog = (mentor: Mentor) => {
    setSelectedMentorForPatients(mentor)
    setIsPatientsDialogOpen(true)
  }

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = 
      mentor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.phone.includes(searchTerm)
    
    const matchesSpecialty = specialtyFilter === "all" || mentor.specialty === specialtyFilter
    const matchesStatus = statusFilter === "all" || mentor.status === statusFilter
    
    return matchesSearch && matchesSpecialty && matchesStatus
  })

  const columns: Column<Mentor>[] = [
    {
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Phone",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-slate-400" />
          <p className="text-sm text-slate-700">{row.phone}</p>
        </div>
      ),
    },
    {
      header: "Specialty",
      cell: (row) => (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {row.specialty}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        row.status === "active" ? (
          <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
      ),
    },
    {
      header: "Assigned Patients",
      cell: (row) => (
        <button
          onClick={() => openPatientsDialog(row)}
          disabled={row.assigned_patients === 0}
          className="flex items-center gap-2 hover:text-purple-600 transition-colors disabled:hover:text-slate-900 disabled:cursor-not-allowed"
        >
          <Users className="h-4 w-4 text-slate-400" />
          <p className="text-sm font-medium text-slate-900">{row.assigned_patients}</p>
        </button>
      ),
    },
    {
      header: "Join Date",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <p className="text-sm text-slate-700">{new Date(row.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(row)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant={row.status === "active" ? "outline" : "default"}
            size="sm"
            onClick={() => toggleStatus(row)}
            className={row.status === "active" ? "border-slate-300 text-slate-700 hover:bg-slate-50" : ""}
          >
            {row.status === "active" ? (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Activate
              </>
            )}
          </Button>
        </div>
      ),
    },
  ]

  const activeMentors = mentors.filter(m => m.status === "active").length
  const inactiveMentors = mentors.filter(m => m.status === "inactive").length
  const diabetesMentors = mentors.filter(m => m.specialty === "Diabetes Free Forever" && m.status === "active").length
  const thyroidMentors = mentors.filter(m => m.specialty === "Thyroid Free Forever" && m.status === "active").length
  const bmiMentors = mentors.filter(m => m.specialty === "Healthy BMI Forever" && m.status === "active").length

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 rounded-[50px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Management</h1>
          <p className="text-sm text-slate-500">Manage mentors and their specialty assignments</p>
        </div>
        <Button onClick={openAddDialog} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Mentor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-purple-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Total Mentors</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{mentors.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-emerald-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Active Mentors</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{activeMentors}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Inactive Mentors</p>
                <p className="text-2xl font-bold text-slate-600 mt-1">{inactiveMentors}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-blue-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Total Assignments</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{mentors.reduce((sum, m) => sum + m.assigned_patients, 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-red-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Diabetes Free Forever</p>
                <p className="text-xl font-bold text-red-600 mt-1">{diabetesMentors} Active</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-orange-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Thyroid Free Forever</p>
                <p className="text-xl font-bold text-orange-600 mt-1">{thyroidMentors} Active</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-green-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Healthy BMI Forever</p>
                <p className="text-xl font-bold text-green-600 mt-1">{bmiMentors} Active</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Mentors List
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={specialtyFilter} onValueChange={(value: any) => setSpecialtyFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredMentors}
            columns={columns}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Mentor" : "Add New Mentor"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update mentor information" : "Fill in the details to add a new mentor"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty *</Label>
              <Select value={formData.specialty} onValueChange={(value: any) => setFormData({ ...formData, specialty: value })}>
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Adding..."}
                </>
              ) : (
                isEditMode ? "Update Mentor" : "Add Mentor"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPatientsDialogOpen} onOpenChange={setIsPatientsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Assigned Patients</DialogTitle>
            <DialogDescription>
              {selectedMentorForPatients && `Patients assigned to ${selectedMentorForPatients.first_name} ${selectedMentorForPatients.last_name} (${selectedMentorForPatients.specialty})`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedMentorForPatients && assignedPatientsData[selectedMentorForPatients.id] ? (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 text-sm font-semibold text-slate-900">Patient ID</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-900">Patient Name</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-900">Mobile Number</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-900">Specialty</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-900">Program</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-900">Batch ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedPatientsData[selectedMentorForPatients.id].map((patient, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-sm text-slate-700 font-mono">{patient.patient_id}</td>
                        <td className="p-3 text-sm text-slate-900 font-medium">{patient.patient_name}</td>
                        <td className="p-3 text-sm text-slate-700">{patient.mobile_number}</td>
                        <td className="p-3 text-sm text-slate-700">{patient.specialty}</td>
                        <td className="p-3 text-sm text-slate-700">{patient.program}</td>
                        <td className="p-3 text-sm text-slate-700 font-mono">{patient.batch_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-500">No patients assigned to this mentor</p>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsPatientsDialogOpen(false)
                setSelectedMentorForPatients(null)
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
