"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Eye,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  FileText,
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

type StockStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK"

interface MedicationStock {
  name: string
  dosage: string
  quantity: number
  stockStatus: StockStatus
  batchNumber?: string
  expiryDate?: string
}

export default function PackingManagementPage() {
  const { prescriptions, updateStatus } = usePharmacy()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showPackingDialog, setShowPackingDialog] = useState(false)
  const [showRestockDialog, setShowRestockDialog] = useState(false)
  const [packingRemarks, setPackingRemarks] = useState("")
  const [selectedMedication, setSelectedMedication] = useState<any>(null)
  const [restockQuantity, setRestockQuantity] = useState("")
  const [restockUrgency, setRestockUrgency] = useState<"NORMAL" | "HIGH" | "CRITICAL">("NORMAL")

  const packablePrescriptions = prescriptions.filter(
    (p) => p.status === "PENDING_FOR_PACKING" || p.status === "MEDICINES_PACKED"
  )

  const filteredPrescriptions = packablePrescriptions
    .filter((prescription) => {
      const matchesSearch =
        prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || prescription.status === selectedStatus
      return matchesSearch && matchesStatus
    })

  const getMedicationStock = (medicationName: string): MedicationStock => {
    const mockStock: Record<string, MedicationStock> = {
      "Metformin": { name: "Metformin", dosage: "500mg", quantity: 150, stockStatus: "AVAILABLE", batchNumber: "B001", expiryDate: "2025-12-31" },
      "Amlodipine": { name: "Amlodipine", dosage: "5mg", quantity: 8, stockStatus: "LOW_STOCK", batchNumber: "B002", expiryDate: "2025-08-15" },
      "Omeprazole": { name: "Omeprazole", dosage: "20mg", quantity: 0, stockStatus: "OUT_OF_STOCK", batchNumber: "B003", expiryDate: "2025-06-30" },
      "Insulin Glargine": { name: "Insulin Glargine", dosage: "100U/mL", quantity: 25, stockStatus: "AVAILABLE", batchNumber: "B004", expiryDate: "2025-10-20" },
      "Atorvastatin": { name: "Atorvastatin", dosage: "10mg", quantity: 75, stockStatus: "AVAILABLE", batchNumber: "B005", expiryDate: "2026-01-15" },
      "Cetirizine": { name: "Cetirizine", dosage: "10mg", quantity: 200, stockStatus: "AVAILABLE", batchNumber: "B006", expiryDate: "2026-03-31" },
      "Paracetamol": { name: "Paracetamol", dosage: "500mg", quantity: 300, stockStatus: "AVAILABLE", batchNumber: "B007", expiryDate: "2026-05-20" },
      "Salbutamol": { name: "Salbutamol", dosage: "100mcg", quantity: 50, stockStatus: "AVAILABLE", batchNumber: "B008", expiryDate: "2025-11-10" },
    }
    return mockStock[medicationName] || { name: medicationName, dosage: "", quantity: 0, stockStatus: "OUT_OF_STOCK" }
  }

  const stockStatusColors: Record<StockStatus, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    LOW_STOCK: "bg-amber-100 text-amber-700 border-amber-200",
    OUT_OF_STOCK: "bg-red-100 text-red-700 border-red-200",
  }

  const stockStatusIcons: Record<StockStatus, any> = {
    AVAILABLE: CheckCircle,
    LOW_STOCK: AlertTriangle,
    OUT_OF_STOCK: XCircle,
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const handleViewDetails = (prescription: any) => {
    setSelectedPrescription(prescription)
    setShowDetailDialog(true)
  }

  const handlePacking = (prescription: any) => {
    setSelectedPrescription(prescription)
    setShowPackingDialog(true)
  }

  const confirmPacking = () => {
    if (selectedPrescription) {
      updateStatus(selectedPrescription.id, "MEDICINES_PACKED", packingRemarks)
      alert(`Prescription ${selectedPrescription.id} packed successfully. Patient notified.`)
      setShowPackingDialog(false)
      setPackingRemarks("")
      setShowDetailDialog(false)
    }
  }

  const handleRestock = (medication: any) => {
    setSelectedMedication(medication)
    setShowRestockDialog(true)
  }

  const submitRestock = () => {
    if (!selectedMedication) {
      alert("No medication selected for restock.")
      setShowRestockDialog(false)
      return
    }
    alert(`Restock request created for ${selectedMedication.name}. Quantity: ${restockQuantity}, Urgency: ${restockUrgency}`)
    setShowRestockDialog(false)
    setRestockQuantity("")
    setRestockUrgency("NORMAL")
  }

  const isAllAvailable = (prescription: any) => {
    return prescription.medications.every((med: any) => {
      const stock = getMedicationStock(med.name)
      return stock.stockStatus !== "OUT_OF_STOCK"
    })
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
            Packing <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Review medication availability and confirm packing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {prescriptions.filter((p) => p.status === "UNDER_REVIEW").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Packed Today</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {prescriptions.filter((p) => p.status === "MEDICINES_PACKED").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Restock Requests</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">3</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by ID, Patient Name..."
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
                  <SelectItem value="PENDING_FOR_PACKING">Pending for Packaging</SelectItem>
                  <SelectItem value="MEDICINES_PACKED">Medicines Packed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Prescriptions for Packing</CardTitle>
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
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Stock Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((prescription, index) => (
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
                      <p className="text-sm text-slate-600">{prescription.doctorName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-600">{prescription.batchId}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-600">{formatDate(prescription.prescriptionDate)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn("text-xs font-semibold border", prescription.status === "UNDER_REVIEW" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-purple-100 text-purple-700 border-purple-200")}>
                        {prescription.status === "UNDER_REVIEW" ? "Under Review" : "Medicines Packed"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-600">{prescription.medications.length} medications</p>
                    </td>
                    <td className="px-4 py-4">
                      {isAllAvailable(prescription) ? (
                        <Badge className="text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                          All Available
                        </Badge>
                      ) : (
                        <Badge className="text-xs font-semibold bg-red-100 text-red-700 border-red-200">
                          Stock Issues
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(prescription)}
                          className="h-8 px-3"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {prescription.status === "UNDER_REVIEW" && isAllAvailable(prescription) && (
                          <Button
                            size="sm"
                            onClick={() => handlePacking(prescription)}
                            className="h-8 px-3 bg-primary text-white"
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Pack
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Prescription Details</DialogTitle>
            <DialogDescription>
              Complete medication availability information
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Prescription ID</p>
                  <p className="text-sm font-medium text-slate-900">{selectedPrescription.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Patient</p>
                  <p className="text-sm text-slate-600">{selectedPrescription.patientName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 mb-3">Medication Availability</p>
                <div className="space-y-2">
                  {selectedPrescription.medications.map((med: any, idx: number) => {
                    const stock = getMedicationStock(med.name)
                    const StockIcon = stockStatusIcons[stock.stockStatus]
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <StockIcon className={cn("h-5 w-5", stock.stockStatus === "AVAILABLE" ? "text-emerald-600" : stock.stockStatus === "LOW_STOCK" ? "text-amber-600" : "text-red-600")} />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{med.name}</p>
                            <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">{stock.quantity} units</p>
                          <p className="text-xs text-slate-500">Required: {med.quantity}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {selectedPrescription.specialInstructions && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Special Instructions</p>
                  <p className="text-sm text-slate-700">{selectedPrescription.specialInstructions}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPackingDialog} onOpenChange={setShowPackingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Confirm Packing</DialogTitle>
            <DialogDescription>
              Confirm that all medications are available and ready to pack
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-900">All Medications Available</p>
                </div>
                <p className="text-xs text-emerald-700">
                  All {selectedPrescription.medications.length} medications are in stock and ready for packing.
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Packing Remarks</Label>
                <Textarea
                  value={packingRemarks}
                  onChange={(e) => setPackingRemarks(e.target.value)}
                  placeholder="Enter any packing remarks (substitutions, storage instructions, etc.)..."
                  className="min-h-[80px] rounded-xl border-slate-200 resize-none mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowPackingDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={confirmPacking} className="h-10 px-6 rounded-xl bg-primary text-white">
              <Package className="h-4 w-4 mr-2" />
              Confirm Packing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Request Restock</DialogTitle>
            <DialogDescription>
              Create a restock request for out-of-stock medication
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Medication</Label>
              <Input
                value={selectedMedication?.name || ""}
                disabled
                className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Required Quantity</Label>
              <Input
                type="number"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="h-10 rounded-xl border-slate-200 mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Urgency</Label>
              <Select value={restockUrgency} onValueChange={(v) => setRestockUrgency(v as any)}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowRestockDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={submitRestock} className="h-10 px-6 rounded-xl bg-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
