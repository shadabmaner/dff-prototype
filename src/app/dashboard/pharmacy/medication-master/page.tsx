"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Power,
  ArrowUp,
  ArrowDown,
  Pill,
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Download,
  FileText,
  History,
  Save,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Types
type MedicationStatus = "Active" | "Inactive"
type MedicationCategory = "Tablet" | "Capsule" | "Syrup" | "Injection" | "Ointment" | "Drops" | "Inhaler" | "Patch" | "Cream" | "Gel" | "Powder" | "Granules" | "Solution" | "Suspension" | "Other"
type Specialty = "General Medicine" | "Cardiology" | "Diabetology" | "Dermatology" | "Gastroenterology" | "Neurology" | "Orthopedics" | "Pediatrics" | "Respiratory" | "Oncology" | "Nephrology" | "Other"
type AuditAction = "Created" | "Updated" | "Deactivated" | "Activated" | "Imported"

interface Medication {
  id: string
  medicationName: string
  genericName?: string
  strength: string
  unit: string
  category: MedicationCategory
  manufacturer: string
  specialty: Specialty
  status: MedicationStatus
  notes: string
  dosageForm?: string
  route?: string
  createdBy: string
  createdDate: string
  lastUpdated: string
}

interface AuditLog {
  id: string
  medicationId: string
  medicationName: string
  action: AuditAction
  performedBy: string
  timestamp: string
  details?: string
}

// Mock Data
const mockMedications: Medication[] = [
  {
    id: "1",
    medicationName: "Metformin",
    genericName: "Metformin Hydrochloride",
    strength: "500",
    unit: "mg",
    category: "Tablet",
    manufacturer: "Sun Pharma",
    specialty: "Diabetology",
    status: "Active",
    notes: "First-line treatment for type 2 diabetes",
    dosageForm: "Film-coated",
    route: "Oral",
    createdBy: "Pharmacy Admin",
    createdDate: "2026-01-15",
    lastUpdated: "2026-01-15",
  },
  {
    id: "2",
    medicationName: "Amlodipine",
    genericName: "Amlodipine Besylate",
    strength: "5",
    unit: "mg",
    category: "Tablet",
    manufacturer: "Cipla",
    specialty: "Cardiology",
    status: "Active",
    notes: "Calcium channel blocker for hypertension",
    dosageForm: "Film-coated",
    route: "Oral",
    createdBy: "Pharmacy Admin",
    createdDate: "2026-01-14",
    lastUpdated: "2026-01-14",
  },
  {
    id: "3",
    medicationName: "Omeprazole",
    genericName: "Omeprazole",
    strength: "20",
    unit: "mg",
    category: "Capsule",
    manufacturer: "Dr. Reddy's",
    specialty: "Gastroenterology",
    status: "Active",
    notes: "Proton pump inhibitor for acid reflux",
    dosageForm: "Enteric-coated",
    route: "Oral",
    createdBy: "Pharmacy Admin",
    createdDate: "2026-01-13",
    lastUpdated: "2026-01-13",
  },
  {
    id: "4",
    medicationName: "Insulin Glargine",
    genericName: "Insulin Glargine",
    strength: "100",
    unit: "U/mL",
    category: "Injection",
    manufacturer: "Novo Nordisk",
    specialty: "Diabetology",
    status: "Active",
    notes: "Long-acting insulin for diabetes management",
    dosageForm: "Solution for injection",
    route: "Subcutaneous",
    createdBy: "Pharmacy Admin",
    createdDate: "2026-01-12",
    lastUpdated: "2026-01-12",
  },
  {
    id: "5",
    medicationName: "Cetirizine",
    genericName: "Cetirizine Hydrochloride",
    strength: "10",
    unit: "mg",
    category: "Tablet",
    manufacturer: "Zydus Cadila",
    specialty: "General Medicine",
    status: "Inactive",
    notes: "Antihistamine for allergies",
    dosageForm: "Film-coated",
    route: "Oral",
    createdBy: "Pharmacy Admin",
    createdDate: "2026-01-11",
    lastUpdated: "2026-01-11",
  },
  {
    id: "6",
    medicationName: "Atorvastatin",
    genericName: "Atorvastatin Calcium",
    strength: "10",
    unit: "mg",
    category: "Tablet",
    manufacturer: "Pfizer",
    specialty: "Cardiology",
    status: "Active",
    notes: "Statin for cholesterol management",
    dosageForm: "Film-coated",
    route: "Oral",
    createdBy: "Pharmacy Admin",
    createdDate: "2026-01-10",
    lastUpdated: "2026-01-10",
  },
  {
    id: "7",
    medicationName: "Salbutamol",
    genericName: "Salbutamol Sulfate",
    strength: "100",
    unit: "mcg",
    category: "Inhaler",
    manufacturer: "GSK",
    specialty: "Respiratory",
    status: "Active",
    notes: "Bronchodilator for asthma",
    dosageForm: "Metered-dose inhaler",
    route: "Inhalation",
    createdBy: "Pharmacy Admin",
    createdDate: "2026-01-09",
    lastUpdated: "2026-01-09",
  },
  {
    id: "8",
    medicationName: "Paracetamol",
    genericName: "Paracetamol",
    strength: "500",
    unit: "mg",
    category: "Tablet",
    manufacturer: "Johnson & Johnson",
    specialty: "General Medicine",
    status: "Active",
    notes: "Analgesic and antipyretic",
    dosageForm: "Film-coated",
    route: "Oral",
    createdBy: "Pharmacy Admin",
    createdDate: "2026-01-08",
    lastUpdated: "2026-01-08",
  },
]

const statusColors: Record<MedicationStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Inactive: "bg-gray-100 text-gray-700 border-gray-200",
}

const categoryColors: Record<MedicationCategory, string> = {
  Tablet: "bg-blue-100 text-blue-700 border-blue-200",
  Capsule: "bg-purple-100 text-purple-700 border-purple-200",
  Syrup: "bg-amber-100 text-amber-700 border-amber-200",
  Injection: "bg-red-100 text-red-700 border-red-200",
  Ointment: "bg-green-100 text-green-700 border-green-200",
  Drops: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Inhaler: "bg-pink-100 text-pink-700 border-pink-200",
  Patch: "bg-orange-100 text-orange-700 border-orange-200",
  Cream: "bg-teal-100 text-teal-700 border-teal-200",
  Gel: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Powder: "bg-lime-100 text-lime-700 border-lime-200",
  Granules: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Solution: "bg-sky-100 text-sky-700 border-sky-200",
  Suspension: "bg-rose-100 text-rose-700 border-rose-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
}

export default function MedicationMasterPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("medicationName")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    medicationName: "",
    genericName: "",
    strength: "",
    unit: "mg",
    category: "Tablet" as MedicationCategory,
    manufacturer: "",
    specialty: "General Medicine" as Specialty,
    notes: "",
    dosageForm: "",
    route: "",
  })

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<Medication[]>([])

  // Audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "1",
      medicationId: "1",
      medicationName: "Metformin",
      action: "Created",
      performedBy: "Pharmacy Admin",
      timestamp: "2026-01-15T10:30:00",
      details: "New medication added to master list",
    },
    {
      id: "2",
      medicationId: "2",
      medicationName: "Amlodipine",
      action: "Created",
      performedBy: "Pharmacy Admin",
      timestamp: "2026-01-14T14:20:00",
      details: "New medication added to master list",
    },
  ])

  // Calculate summary stats
  const totalMedications = mockMedications.length
  const activeMedications = mockMedications.filter((m) => m.status === "Active").length
  const inactiveMedications = mockMedications.filter((m) => m.status === "Inactive").length
  const uniqueManufacturers = [...new Set(mockMedications.map((m) => m.manufacturer))].length

  // Filter medications
  const filteredMedications = mockMedications
    .filter((medication) => {
      const matchesSearch =
        medication.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.strength.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || medication.category === selectedCategory
      const matchesSpecialty = selectedSpecialty === "all" || medication.specialty === selectedSpecialty
      const matchesStatus = selectedStatus === "all" || medication.status === selectedStatus
      const matchesManufacturer = selectedManufacturer === "all" || medication.manufacturer === selectedManufacturer
      return matchesSearch && matchesCategory && matchesSpecialty && matchesStatus && matchesManufacturer
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "medicationName") {
        comparison = a.medicationName.localeCompare(b.medicationName)
      } else if (sortBy === "strength") {
        comparison = parseFloat(a.strength) - parseFloat(b.strength)
      } else if (sortBy === "manufacturer") {
        comparison = a.manufacturer.localeCompare(b.manufacturer)
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category)
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status)
      } else if (sortBy === "createdDate") {
        comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  // Pagination
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMedications = filteredMedications.slice(startIndex, endIndex)

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleAddMedication = () => {
    // Validation
    if (!formData.medicationName.trim()) {
      alert("Medication Name is required")
      return
    }
    if (!formData.strength.trim()) {
      alert("Strength is required")
      return
    }
    if (!formData.manufacturer.trim()) {
      alert("Manufacturer is required")
      return
    }
    if (!formData.category) {
      alert("Category is required")
      return
    }
    if (!formData.specialty) {
      alert("Specialty is required")
      return
    }
    if (/^\d+$/.test(formData.medicationName.trim())) {
      alert("Medication Name cannot contain only numeric values")
      return
    }

    // Check for duplicate
    const duplicate = mockMedications.find(
      (m) =>
        m.medicationName.toLowerCase() === formData.medicationName.toLowerCase() &&
        m.strength === formData.strength &&
        m.unit === formData.unit
    )
    if (duplicate) {
      alert("Medication with same Name, Strength, and Unit already exists")
      return
    }

    alert("Medication added successfully")
    setShowAddDialog(false)
    setFormData({
      medicationName: "",
      genericName: "",
      strength: "",
      unit: "mg",
      category: "Tablet",
      manufacturer: "",
      specialty: "General Medicine",
      notes: "",
      dosageForm: "",
      route: "",
    })
  }

  const handleEditMedication = () => {
    alert("Medication updated successfully")
    setShowEditDialog(false)
  }

  const handleToggleStatus = () => {
    if (!selectedMedication) return
    const newStatus = selectedMedication.status === "Active" ? "Inactive" : "Active"
    const action = newStatus === "Inactive" ? "deactivate" : "activate"
    if (confirm(`Are you sure you want to ${action} this medication?`)) {
      alert(`Medication ${newStatus.toLowerCase()}d successfully`)
      setShowDeactivateDialog(false)
    }
  }

  const handleViewMedication = (medication: Medication) => {
    setSelectedMedication(medication)
    setShowViewDialog(true)
  }

  const handleEditClick = (medication: Medication) => {
    setSelectedMedication(medication)
    setFormData({
      medicationName: medication.medicationName,
      genericName: medication.genericName || "",
      strength: medication.strength,
      unit: medication.unit,
      category: medication.category,
      manufacturer: medication.manufacturer,
      specialty: medication.specialty,
      notes: medication.notes,
      dosageForm: medication.dosageForm || "",
      route: medication.route || "",
    })
    setShowEditDialog(true)
  }

  const handleDeactivateClick = (medication: Medication) => {
    setSelectedMedication(medication)
    setShowDeactivateDialog(true)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      // Simulate parsing CSV/Excel
      alert(`File selected: ${file.name}. In production, this would parse the file and show a preview.`)
    }
  }

  const handleImportSubmit = () => {
    if (!importFile) {
      alert("Please select a file to import")
      return
    }
    alert(`Importing ${importPreview.length || 0} medications from ${importFile.name}`)
    setShowImportDialog(false)
    setImportFile(null)
    setImportPreview([])
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Pharmacy Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Medication <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Master</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Manage medication master list for prescription creation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowImportDialog(true)} className="h-11 px-6 rounded-xl border-slate-200">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV/Excel
          </Button>
          <Button variant="outline" onClick={() => setShowAuditDialog(true)} className="h-11 px-6 rounded-xl border-slate-200">
            <History className="h-4 w-4 mr-2" />
            Audit Log
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="h-11 px-6 rounded-xl bg-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Medications</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalMedications}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Pill className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{activeMedications}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Inactive</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{inactiveMedications}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Manufacturers</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{uniqueManufacturers}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Name, Strength, Manufacturer, Category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Capsule">Capsule</SelectItem>
                  <SelectItem value="Syrup">Syrup</SelectItem>
                  <SelectItem value="Injection">Injection</SelectItem>
                  <SelectItem value="Ointment">Ointment</SelectItem>
                  <SelectItem value="Drops">Drops</SelectItem>
                  <SelectItem value="Inhaler">Inhaler</SelectItem>
                  <SelectItem value="Patch">Patch</SelectItem>
                  <SelectItem value="Cream">Cream</SelectItem>
                  <SelectItem value="Gel">Gel</SelectItem>
                  <SelectItem value="Powder">Powder</SelectItem>
                  <SelectItem value="Granules">Granules</SelectItem>
                  <SelectItem value="Solution">Solution</SelectItem>
                  <SelectItem value="Suspension">Suspension</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="General Medicine">General Medicine</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Diabetology">Diabetology</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="Respiratory">Respiratory</SelectItem>
                  <SelectItem value="Oncology">Oncology</SelectItem>
                  <SelectItem value="Nephrology">Nephrology</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Manufacturer</Label>
              <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Manufacturers</SelectItem>
                  {[...new Set(mockMedications.map((m) => m.manufacturer))].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication Grid */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Medication Master List</CardTitle>
          <CardDescription>
            {filteredMedications.length} medications found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("medicationName")}>
                    <div className="flex items-center gap-1">
                      Medication Name
                      {sortBy === "medicationName" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("strength")}>
                    <div className="flex items-center gap-1">
                      Strength
                      {sortBy === "strength" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("category")}>
                    <div className="flex items-center gap-1">
                      Category
                      {sortBy === "category" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("manufacturer")}>
                    <div className="flex items-center gap-1">
                      Manufacturer
                      {sortBy === "manufacturer" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Specialty</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("status")}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === "status" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase cursor-pointer hover:bg-slate-50" onClick={() => handleSort("createdDate")}>
                    <div className="flex items-center gap-1">
                      Created Date
                      {sortBy === "createdDate" && (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMedications.map((medication, index) => (
                  <motion.tr
                    key={medication.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Pill className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{medication.medicationName}</p>
                          <p className="text-xs text-slate-500">{medication.strength} {medication.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{medication.strength} {medication.unit}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", categoryColors[medication.category])}>
                        {medication.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{medication.manufacturer}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{medication.specialty}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", statusColors[medication.status])}>
                        {medication.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{formatDate(medication.createdDate)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => handleViewMedication(medication)}>
                          <Eye className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => handleEditClick(medication)}>
                          <Edit className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => handleDeactivateClick(medication)}>
                          <Power className="h-4 w-4 text-slate-600" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="h-8 w-20 rounded-lg border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-600">per page</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 rounded-lg border-slate-200"
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 rounded-lg border-slate-200"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Medication Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Add New Medication</DialogTitle>
            <DialogDescription>
              Add a new medication to the master list
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Medication Name *</Label>
                <Input
                  value={formData.medicationName}
                  onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                  placeholder="e.g., Metformin"
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
                <p className="text-[10px] text-slate-500 mt-1">Brand name or generic name</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">Generic Name</Label>
                <Input
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g., Metformin Hydrochloride"
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
                <p className="text-[10px] text-slate-500 mt-1">Optional generic name</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Strength *</Label>
                  <Input
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g., 500"
                    className="h-10 rounded-xl border-slate-200 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="mcg">mcg</SelectItem>
                      <SelectItem value="U/mL">U/mL</SelectItem>
                      <SelectItem value="mL">mL</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="IU">IU</SelectItem>
                      <SelectItem value="units">units</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-500 mt-1">Strength unit</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as MedicationCategory })}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Capsule">Capsule</SelectItem>
                    <SelectItem value="Syrup">Syrup</SelectItem>
                    <SelectItem value="Injection">Injection</SelectItem>
                    <SelectItem value="Ointment">Ointment</SelectItem>
                    <SelectItem value="Cream">Cream</SelectItem>
                    <SelectItem value="Gel">Gel</SelectItem>
                    <SelectItem value="Drops">Drops</SelectItem>
                    <SelectItem value="Inhaler">Inhaler</SelectItem>
                    <SelectItem value="Patch">Patch</SelectItem>
                    <SelectItem value="Powder">Powder</SelectItem>
                    <SelectItem value="Granules">Granules</SelectItem>
                    <SelectItem value="Solution">Solution</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">Manufacturer *</Label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g., Sun Pharma"
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">Specialty *</Label>
                <Select value={formData.specialty} onValueChange={(v) => setFormData({ ...formData, specialty: v as Specialty })}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Diabetology">Diabetology</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Respiratory">Respiratory</SelectItem>
                    <SelectItem value="Oncology">Oncology</SelectItem>
                    <SelectItem value="Nephrology">Nephrology</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Dosage Form</Label>
                <Input
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  placeholder="e.g., Film-coated, Enteric-coated"
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
                <p className="text-[10px] text-slate-500 mt-1">Optional dosage form details</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">Route of Administration</Label>
                <Input
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="e.g., Oral, IV, IM, Topical"
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
                <p className="text-[10px] text-slate-500 mt-1">Optional route details</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any additional notes..."
                className="min-h-[80px] rounded-xl border-slate-200 resize-none mt-2"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleAddMedication} className="h-10 px-6 rounded-xl bg-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Medication Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Edit Medication</DialogTitle>
            <DialogDescription>
              Update medication details
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Medication Name</Label>
                <Input
                  value={formData.medicationName}
                  disabled
                  className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50"
                />
                <p className="text-xs text-slate-400 mt-1">Cannot edit name if used in active prescriptions</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Strength</Label>
                  <Input
                    value={formData.strength}
                    disabled
                    className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Unit</Label>
                  <Input
                    value={formData.unit}
                    disabled
                    className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Generic Name</Label>
                <Input
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">Manufacturer</Label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Specialty</Label>
                <Select value={formData.specialty} onValueChange={(v) => setFormData({ ...formData, specialty: v as Specialty })}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Diabetology">Diabetology</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Respiratory">Respiratory</SelectItem>
                    <SelectItem value="Oncology">Oncology</SelectItem>
                    <SelectItem value="Nephrology">Nephrology</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700">Status</Label>
                <Select value={selectedMedication?.status} onValueChange={() => {}}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any additional notes..."
                className="min-h-[80px] rounded-xl border-slate-200 resize-none mt-2"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleEditMedication} className="h-10 px-6 rounded-xl bg-primary text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Medication Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Medication Details</DialogTitle>
          </DialogHeader>
          {selectedMedication && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{selectedMedication.medicationName}</p>
                  <p className="text-sm text-slate-600">{selectedMedication.strength} {selectedMedication.unit}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Category</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedMedication.category}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Manufacturer</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedMedication.manufacturer}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Specialty</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedMedication.specialty}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Status</Label>
                  <Badge className={cn("text-xs font-semibold border mt-1", statusColors[selectedMedication.status])}>
                    {selectedMedication.status}
                  </Badge>
                </div>
              </div>
              {selectedMedication.genericName && (
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Generic Name</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedMedication.genericName}</p>
                </div>
              )}
              {selectedMedication.dosageForm && (
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Dosage Form</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedMedication.dosageForm}</p>
                </div>
              )}
              {selectedMedication.route && (
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Route</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedMedication.route}</p>
                </div>
              )}
              {selectedMedication.notes && (
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Notes</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedMedication.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Created By</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedMedication.createdBy}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase font-semibold">Created Date</Label>
                  <p className="text-sm text-slate-900 mt-1">{formatDate(selectedMedication.createdDate)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowViewDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              {selectedMedication?.status === "Active" ? "Deactivate Medication" : "Activate Medication"}
            </DialogTitle>
            <DialogDescription>
              {selectedMedication?.status === "Active"
                ? "This medication will not appear in Doctor Prescription dropdown. Existing prescriptions will remain unaffected."
                : "This medication will appear in Doctor Prescription dropdown."}
            </DialogDescription>
          </DialogHeader>
          {selectedMedication && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{selectedMedication.medicationName}</p>
                  <p className="text-xs text-slate-500">{selectedMedication.strength} {selectedMedication.unit}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleToggleStatus} className={cn("h-10 px-6 rounded-xl", selectedMedication?.status === "Active" ? "bg-red-600 text-white" : "bg-emerald-600 text-white")}>
              <Power className="h-4 w-4 mr-2" />
              {selectedMedication?.status === "Active" ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Import Medications</DialogTitle>
            <DialogDescription>
              Bulk import medications from CSV or Excel file
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl">
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="h-12 w-12 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700 mb-1">Upload CSV or Excel file</p>
                <p className="text-xs text-slate-500 mb-3">Supported formats: .csv, .xlsx, .xls</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImportFile}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" className="rounded-lg border-slate-200">
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                </label>
                {importFile && (
                  <p className="text-sm text-primary mt-3">
                    Selected: {importFile.name}
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="text-sm font-bold text-slate-900 mb-2">CSV Format Requirements</h4>
              <p className="text-xs text-slate-600 mb-2">File must contain the following columns:</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">Medication Name</Badge>
                <Badge className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">Generic Name</Badge>
                <Badge className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">Strength</Badge>
                <Badge className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">Unit</Badge>
                <Badge className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">Category</Badge>
                <Badge className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">Manufacturer</Badge>
                <Badge className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">Specialty</Badge>
                <Badge className="text-[10px] bg-slate-200 text-slate-700 border-slate-300">Notes</Badge>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-xs text-slate-600">
                  Duplicate medications will be skipped. Only Active medications will be visible to doctors during prescription creation.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowImportDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleImportSubmit} className="h-10 px-6 rounded-xl bg-primary text-white">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Audit Log</DialogTitle>
            <DialogDescription>
              Track all changes to medication master
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-900">{log.medicationName}</span>
                  </div>
                  <Badge className={cn("text-[10px] font-semibold border", log.action === "Created" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200")}>
                    {log.action}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-1">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>By: {log.performedBy}</span>
                  <span>{formatDateTime(log.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowAuditDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
