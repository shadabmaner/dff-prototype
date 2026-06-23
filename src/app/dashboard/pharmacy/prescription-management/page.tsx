"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Eye,
  ChevronRight,
  Clock,
  User,
  FileText,
  Package,
  IndianRupee,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { usePharmacy } from "@/components/pharmacy/pharmacy-context"

type PrescriptionStatus = "NEW_PRESCRIPTION_RECEIVED" | "UNDER_REVIEW" | "CALCULATING_AMOUNT" | "PAYMENT_PENDING" | "MEDICINES_PACKED" | "READY_FOR_DISPATCH" | "DISPATCHED" | "DELIVERED" | "CANCELLED"

const statusLabels: Record<PrescriptionStatus, string> = {
  NEW_PRESCRIPTION_RECEIVED: "New Prescription",
  UNDER_REVIEW: "Under Review",
  CALCULATING_AMOUNT: "Calculating Amount",
  PAYMENT_PENDING: "Payment Pending",
  MEDICINES_PACKED: "Medicines Packed",
  READY_FOR_DISPATCH: "Ready for Dispatch",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

const statusColors: Record<PrescriptionStatus, string> = {
  NEW_PRESCRIPTION_RECEIVED: "bg-blue-100 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
  CALCULATING_AMOUNT: "bg-purple-100 text-purple-700 border-purple-200",
  PAYMENT_PENDING: "bg-orange-100 text-orange-700 border-orange-200",
  MEDICINES_PACKED: "bg-cyan-100 text-cyan-700 border-cyan-200",
  READY_FOR_DISPATCH: "bg-emerald-100 text-emerald-700 border-emerald-200",
  DISPATCHED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

const statusOrder: PrescriptionStatus[] = [
  "NEW_PRESCRIPTION_RECEIVED",
  "UNDER_REVIEW",
  "CALCULATING_AMOUNT",
  "PAYMENT_PENDING",
  "MEDICINES_PACKED",
  "READY_FOR_DISPATCH",
  "DISPATCHED",
  "DELIVERED",
]

export default function PrescriptionManagementPage() {
  const router = useRouter()
  const { prescriptions, updateStatus } = usePharmacy()
  const [activeTab, setActiveTab] = useState<"new" | "all">("new")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedBatch, setSelectedBatch] = useState<string>("all")
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("prescriptionDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<PrescriptionStatus>("UNDER_REVIEW")
  const [statusRemarks, setStatusRemarks] = useState("")

  const uniqueBatches = [...new Set(prescriptions.map((p) => p.batchId))]
  const uniqueDoctors = [...new Set(prescriptions.map((p) => p.doctorName))]

  const filteredPrescriptions = prescriptions
    .filter((prescription) => {
      const matchesTab = activeTab === "all" || prescription.status === "NEW_PRESCRIPTION_RECEIVED" || prescription.status === "UNDER_REVIEW"
      const matchesSearch =
        prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || prescription.status === selectedStatus
      const matchesBatch = selectedBatch === "all" || prescription.batchId === selectedBatch
      const matchesDoctor = selectedDoctor === "all" || prescription.doctorName === selectedDoctor
      return matchesTab && matchesSearch && matchesStatus && matchesBatch && matchesDoctor
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "prescriptionDate") {
        comparison = new Date(a.prescriptionDate).getTime() - new Date(b.prescriptionDate).getTime()
      } else if (sortBy === "patientName") {
        comparison = a.patientName.localeCompare(b.patientName)
      } else if (sortBy === "status") {
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPrescriptions = filteredPrescriptions.slice(startIndex, endIndex)

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

  const getNextStatuses = (currentStatus: PrescriptionStatus): PrescriptionStatus[] => {
    const currentIndex = statusOrder.indexOf(currentStatus as PrescriptionStatus)
    return statusOrder.slice(currentIndex + 1, currentIndex + 3)
  }

  const handleViewDetails = (prescription: any) => {
    router.push(`/dashboard/pharmacy/prescription-management/${prescription.id}`)
  }

  const handleStatusChange = () => {
    if (selectedPrescription) {
      updateStatus(selectedPrescription.id, newStatus, statusRemarks)
      alert(`Prescription status updated to ${statusLabels[newStatus]}`)
      setShowStatusDialog(false)
      setStatusRemarks("")
      setShowDetailDialog(false)
    }
  }

  const openStatusDialog = (status: PrescriptionStatus) => {
    setNewStatus(status)
    setShowStatusDialog(true)
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Pharmacy Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Prescription <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            View and manage incoming prescriptions from doctors
          </p>
        </div>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 border-b border-slate-200">
              <Button
                variant={activeTab === "new" ? "default" : "ghost"}
                className={cn(
                  "h-10 px-6 rounded-t-xl border-b-2",
                  activeTab === "new"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                )}
                onClick={() => setActiveTab("new")}
              >
                <Bell className="h-4 w-4 mr-2" />
                New
                <Badge className="ml-2 bg-primary text-white" variant="secondary">
                  {prescriptions.filter((p) => p.status === "NEW_PRESCRIPTION_RECEIVED" || p.status === "UNDER_REVIEW").length}
                </Badge>
              </Button>
              <Button
                variant={activeTab === "all" ? "default" : "ghost"}
                className={cn(
                  "h-10 px-6 rounded-t-xl border-b-2",
                  activeTab === "all"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                )}
                onClick={() => setActiveTab("all")}
              >
                <FileText className="h-4 w-4 mr-2" />
                All
                <Badge className="ml-2 bg-slate-200 text-slate-700" variant="secondary">
                  {prescriptions.length}
                </Badge>
              </Button>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by ID, Patient Name, Doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {uniqueBatches.map((batch) => (
                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {uniqueDoctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Prescription List</CardTitle>
          <CardDescription>
            {filteredPrescriptions.length} prescriptions found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Prescription ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Doctor</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Batch</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Medications</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPrescriptions.map((prescription, index) => (
                  <motion.tr
                    key={prescription.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-900">{prescription.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{prescription.patientName}</p>
                        <p className="text-xs text-slate-500">{prescription.patientId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{prescription.doctorName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className="text-xs bg-slate-100 text-slate-700 border-slate-200">
                        {prescription.batchId}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{formatDate(prescription.prescriptionDate)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", statusColors[prescription.status])}>
                        {statusLabels[prescription.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{prescription.medications.length}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-lg"
                        onClick={() => handleViewDetails(prescription)}
                      >
                        <Eye className="h-4 w-4 text-slate-600 mr-2" />
                        View
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

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

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Prescription Details</DialogTitle>
            <DialogDescription>
              Complete prescription information and medication list
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-slate-200 bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{selectedPrescription.id}</p>
                        <p className="text-xs text-slate-500">Prescription ID</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200 bg-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={cn("text-xs font-semibold border", statusColors[selectedPrescription.status as PrescriptionStatus])}>
                        {statusLabels[selectedPrescription.status as PrescriptionStatus]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="text-sm font-medium text-slate-900">{selectedPrescription.patientName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Patient ID</p>
                        <p className="text-sm text-slate-600">{selectedPrescription.patientId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Contact</p>
                        <p className="text-sm text-slate-600">{selectedPrescription.patientContact}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Batch</p>
                        <p className="text-sm text-slate-600">{selectedPrescription.batchId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      Doctor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="text-sm font-medium text-slate-900">{selectedPrescription.doctorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Doctor ID</p>
                        <p className="text-sm text-slate-600">{selectedPrescription.doctorId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Prescription Date</p>
                        <p className="text-sm text-slate-600">{formatDate(selectedPrescription.prescriptionDate)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-500" />
                    Medication List
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left px-3 py-2 text-xs font-bold text-slate-600 uppercase">Medication</th>
                          <th className="text-left px-3 py-2 text-xs font-bold text-slate-600 uppercase">Dosage</th>
                          <th className="text-left px-3 py-2 text-xs font-bold text-slate-600 uppercase">Quantity</th>
                          <th className="text-left px-3 py-2 text-xs font-bold text-slate-600 uppercase">Frequency</th>
                          <th className="text-left px-3 py-2 text-xs font-bold text-slate-600 uppercase">Duration</th>
                          <th className="text-left px-3 py-2 text-xs font-bold text-slate-600 uppercase">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPrescription.medications.map((med: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0">
                            <td className="px-3 py-3 text-sm font-medium text-slate-900">{med.name}</td>
                            <td className="px-3 py-3 text-sm text-slate-600">{med.dosage}</td>
                            <td className="px-3 py-3 text-sm text-slate-600">{med.quantity}</td>
                            <td className="px-3 py-3 text-sm text-slate-600">{med.frequency}</td>
                            <td className="px-3 py-3 text-sm text-slate-600">{med.duration}</td>
                            <td className="px-3 py-3 text-sm text-slate-600">{med.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-500" />
                    Instructions & Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Dosage Instructions</p>
                    <p className="text-sm text-slate-700">{selectedPrescription.dosageInstructions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Special Instructions</p>
                    <p className="text-sm text-slate-700">{selectedPrescription.specialInstructions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Doctor's Notes</p>
                    <p className="text-sm text-slate-700">{selectedPrescription.doctorNotes}</p>
                  </div>
                </CardContent>
              </Card>

              {selectedPrescription.invoice && (
                <Card className="border border-slate-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-blue-600" />
                      Invoice Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Invoice ID</p>
                        <p className="text-sm font-medium text-slate-900">{selectedPrescription.invoice.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Amount</p>
                        <p className="text-sm font-bold text-slate-900">₹{selectedPrescription.invoice.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Payment Status</p>
                        <Badge className={cn("text-xs font-semibold border", selectedPrescription.invoice.status === "PAID" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-orange-100 text-orange-700 border-orange-200")}>
                          {selectedPrescription.invoice.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Due Date</p>
                        <p className="text-sm text-slate-600">{formatDate(selectedPrescription.invoice.dueDate)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedPrescription.dispatch && (
                <Card className="border border-slate-200 bg-indigo-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-indigo-600" />
                      Dispatch Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Courier</p>
                        <p className="text-sm font-medium text-slate-900">{selectedPrescription.dispatch.courierName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Tracking Number</p>
                        <p className="text-sm font-medium text-slate-900">{selectedPrescription.dispatch.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Dispatch Date</p>
                        <p className="text-sm text-slate-600">{formatDateTime(selectedPrescription.dispatch.dispatchDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Expected Delivery</p>
                        <p className="text-sm text-slate-600">{selectedPrescription.dispatch.expectedDeliveryDate ? formatDate(selectedPrescription.dispatch.expectedDeliveryDate) : "TBD"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    Status Update
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {getNextStatuses(selectedPrescription.status).map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusDialog(status)}
                        className="rounded-lg border-slate-200"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        {statusLabels[status]}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Update Prescription Status</DialogTitle>
            <DialogDescription>
              Change prescription status to {statusLabels[newStatus]}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as PrescriptionStatus)}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getNextStatuses(selectedPrescription?.status || "NEW_PRESCRIPTION_RECEIVED").map((status) => (
                    <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Remarks</Label>
              <Textarea
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                placeholder="Enter any remarks for this status change..."
                className="min-h-[80px] rounded-xl border-slate-200 resize-none mt-2"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowStatusDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleStatusChange} className="h-10 px-6 rounded-xl bg-primary text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
