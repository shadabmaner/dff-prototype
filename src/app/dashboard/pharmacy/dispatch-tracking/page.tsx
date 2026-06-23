"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  ExternalLink,
  Upload,
  FileText,
  Package,
  Calendar,
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

type DispatchStatus = "DISPATCHED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "DELIVERY_FAILED" | "RETURNED"

const dispatchStatusLabels: Record<DispatchStatus, string> = {
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  DELIVERY_FAILED: "Delivery Failed",
  RETURNED: "Returned",
}

const dispatchStatusColors: Record<DispatchStatus, string> = {
  DISPATCHED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_TRANSIT: "bg-purple-100 text-purple-700 border-purple-200",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700 border-amber-200",
  DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  DELIVERY_FAILED: "bg-red-100 text-red-700 border-red-200",
  RETURNED: "bg-slate-100 text-slate-700 border-slate-200",
}

const couriers = [
  { name: "Delhivery", trackingUrl: "https://delhivery.com/track/#/" },
  { name: "FedEx", trackingUrl: "https://www.fedex.com/apps/fedextrack/?tracknumbers=" },
  { name: "Blue Dart", trackingUrl: "https://www.bluedart.com/tracking.html?trackingNumber=" },
  { name: "DTDC", trackingUrl: "https://dtdc.com/tracking/tracking_result.asp?dno=" },
  { name: "Ecom Express", trackingUrl: "https://www.ecomexpress.in/tracking/" },
]

export default function DispatchTrackingPage() {
  const { prescriptions, createDispatch, updateDispatchStatus, confirmDelivery } = usePharmacy()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedCourier, setSelectedCourier] = useState<string>("all")
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDispatchDialog, setShowDispatchDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [dispatchData, setDispatchData] = useState({
    courierName: "Delhivery",
    trackingNumber: "",
    expectedDeliveryDate: "",
    remarks: "",
  })
  const [newDispatchStatus, setNewDispatchStatus] = useState<DispatchStatus>("IN_TRANSIT")
  const [statusRemarks, setStatusRemarks] = useState("")

  const dispatchablePrescriptions = prescriptions.filter((p) => p.status === "READY_FOR_DISPATCH" || p.dispatch !== null)

  const filteredPrescriptions = dispatchablePrescriptions
    .filter((prescription) => {
      const matchesSearch =
        prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.dispatch?.trackingNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || prescription.dispatch?.status === selectedStatus
      const matchesCourier = selectedCourier === "all" || prescription.dispatch?.courierName === selectedCourier
      return matchesSearch && matchesStatus && matchesCourier
    })

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

  const handleViewDetails = (prescription: any) => {
    setSelectedPrescription(prescription)
    setShowDetailDialog(true)
  }

  const handleDispatch = (prescription: any) => {
    setSelectedPrescription(prescription)
    setDispatchData({
      ...dispatchData,
      trackingNumber: "",
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
    setShowDispatchDialog(true)
  }

  const handleDispatchSubmit = () => {
    if (selectedPrescription) {
      createDispatch(selectedPrescription.id, {
        courierName: dispatchData.courierName,
        trackingNumber: dispatchData.trackingNumber,
        expectedDeliveryDate: dispatchData.expectedDeliveryDate,
        remarks: dispatchData.remarks,
        dispatchedBy: "Pharmacy Staff",
      })

      alert(`Prescription ${selectedPrescription.id} dispatched successfully via ${dispatchData.courierName}. Tracking: ${dispatchData.trackingNumber}. Patient notified.`)
      setShowDispatchDialog(false)
      setDispatchData({
        courierName: "Delhivery",
        trackingNumber: "",
        expectedDeliveryDate: "",
        remarks: "",
      })
    }
  }

  const handleUpdateStatus = () => {
    if (selectedPrescription) {
      updateDispatchStatus(selectedPrescription.id, newDispatchStatus, statusRemarks)
      alert(`Dispatch status updated to ${dispatchStatusLabels[newDispatchStatus]}. Patient notified.`)
      setShowDetailDialog(false)
      setStatusRemarks("")
    }
  }

  const handleConfirmDelivery = () => {
    if (selectedPrescription) {
      confirmDelivery(selectedPrescription.id, "Delivery confirmed")
      alert(`Delivery confirmed for prescription ${selectedPrescription.id}. Workflow complete.`)
      setShowDetailDialog(false)
    }
  }

  const openTrackingUrl = (prescription: any) => {
    if (!prescription.dispatch) return
    const courier = couriers.find((c) => c.name === prescription.dispatch.courierName)
    if (courier) {
      window.open(`${courier.trackingUrl}${prescription.dispatch.trackingNumber}`, "_blank")
    }
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
            Dispatch & <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Tracking</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Manage courier dispatch and track deliveries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Ready for Dispatch</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {prescriptions.filter((p) => p.status === "READY_FOR_DISPATCH").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">In Transit</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {prescriptions.filter((p) => p.dispatch?.status === "DISPATCHED" || p.dispatch?.status === "IN_TRANSIT").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Delivered</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {prescriptions.filter((p) => p.dispatch?.status === "DELIVERED").length}
                </p>
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
                <p className="text-sm text-slate-600">Delivery Issues</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
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
                  placeholder="Search by ID, Patient, Tracking Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Dispatch Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(dispatchStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Courier</Label>
              <Select value={selectedCourier} onValueChange={setSelectedCourier}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Couriers</SelectItem>
                  {couriers.map((courier) => (
                    <SelectItem key={courier.name} value={courier.name}>{courier.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Dispatch List</CardTitle>
          <CardDescription>
            {filteredPrescriptions.length} shipments found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Prescription ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Courier</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Tracking Number</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Dispatch Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Expected Delivery</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Status</th>
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
                      <span className="text-sm text-slate-600">{prescription.patientName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{prescription.dispatch?.courierName || "—"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-slate-900">
                        {prescription.dispatch?.trackingNumber || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">
                        {prescription.dispatch ? formatDateTime(prescription.dispatch.dispatchDate) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">
                        {prescription.dispatch?.expectedDeliveryDate ? formatDate(prescription.dispatch.expectedDeliveryDate) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {prescription.dispatch ? (
                        <Badge className={cn("text-xs font-semibold border", dispatchStatusColors[prescription.dispatch.status])}>
                          {dispatchStatusLabels[prescription.dispatch.status]}
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-slate-100 text-slate-700 border-slate-200">Not Dispatched</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg"
                          onClick={() => handleViewDetails(prescription)}
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </Button>
                        {!prescription.dispatch && prescription.status === "READY_FOR_DISPATCH" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 rounded-lg text-primary"
                            onClick={() => handleDispatch(prescription)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Dispatch
                          </Button>
                        )}
                        {prescription.dispatch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg"
                            onClick={() => openTrackingUrl(prescription)}
                          >
                            <ExternalLink className="h-4 w-4 text-slate-600" />
                          </Button>
                        )}
                        {prescription.dispatch?.status === "DISPATCHED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 rounded-lg text-emerald-600"
                            onClick={() => {
                              setSelectedPrescription(prescription)
                              handleConfirmDelivery()
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Dispatch Details</DialogTitle>
            <DialogDescription>
              Complete dispatch and tracking information
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
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm text-slate-600">{selectedPrescription.patientPhone || selectedPrescription.patientContact || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-slate-600">{selectedPrescription.patientEmail || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Delivery Address</p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                  <p className="text-sm text-slate-600">{selectedPrescription.patientAddress || "—"}</p>
                </div>
              </div>
              {selectedPrescription.dispatch ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-bold text-blue-900">Dispatch Information</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Courier</span>
                        <span className="text-sm font-medium text-slate-900">{selectedPrescription.dispatch.courierName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Tracking Number</span>
                        <span className="text-sm font-medium text-slate-900">{selectedPrescription.dispatch.trackingNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Status</span>
                        <Badge className={cn("text-xs font-semibold border", dispatchStatusColors[selectedPrescription.dispatch.status as DispatchStatus])}>
                          {dispatchStatusLabels[selectedPrescription.dispatch.status as DispatchStatus]}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Dispatch Date</span>
                        <span className="text-sm text-slate-600">{formatDateTime(selectedPrescription.dispatch.dispatchDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Expected Delivery</span>
                        <span className="text-sm text-slate-600">
                          {selectedPrescription.dispatch.expectedDeliveryDate ? formatDate(selectedPrescription.dispatch.expectedDeliveryDate) : "TBD"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedPrescription.dispatch.status !== "DELIVERED" && (
                    <Card className="border border-slate-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-slate-900">Update Status</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">New Status</Label>
                          <Select value={newDispatchStatus} onValueChange={(v) => setNewDispatchStatus(v as DispatchStatus)}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                              <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                              <SelectItem value="DELIVERED">Delivered</SelectItem>
                              <SelectItem value="DELIVERY_FAILED">Delivery Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Remarks</Label>
                          <Textarea
                            value={statusRemarks}
                            onChange={(e) => setStatusRemarks(e.target.value)}
                            placeholder="Enter remarks..."
                            className="min-h-[60px] rounded-xl border-slate-200 resize-none mt-2"
                          />
                        </div>
                        <Button onClick={handleUpdateStatus} className="w-full h-10 rounded-xl bg-primary text-white">
                          Update Status
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <Truck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Not yet dispatched</p>
                  <Button
                    onClick={() => {
                      setShowDetailDialog(false)
                      handleDispatch(selectedPrescription)
                    }}
                    className="mt-3 h-9 px-4 rounded-lg bg-primary text-white"
                  >
                    Dispatch Now
                  </Button>
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

      <Dialog open={showDispatchDialog} onOpenChange={setShowDispatchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Dispatch Prescription</DialogTitle>
            <DialogDescription>
              Enter courier details for prescription {selectedPrescription?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Courier Service</Label>
              <Select value={dispatchData.courierName} onValueChange={(v) => setDispatchData({ ...dispatchData, courierName: v })}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {couriers.map((courier) => (
                    <SelectItem key={courier.name} value={courier.name}>{courier.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Tracking Number</Label>
              <Input
                value={dispatchData.trackingNumber}
                onChange={(e) => setDispatchData({ ...dispatchData, trackingNumber: e.target.value })}
                placeholder="Enter tracking number"
                className="h-10 rounded-xl border-slate-200 mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Expected Delivery Date</Label>
              <Input
                type="date"
                value={dispatchData.expectedDeliveryDate}
                onChange={(e) => setDispatchData({ ...dispatchData, expectedDeliveryDate: e.target.value })}
                className="h-10 rounded-xl border-slate-200 mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Remarks</Label>
              <Textarea
                value={dispatchData.remarks}
                onChange={(e) => setDispatchData({ ...dispatchData, remarks: e.target.value })}
                placeholder="Enter dispatch remarks..."
                className="min-h-[80px] rounded-xl border-slate-200 resize-none mt-2"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowDispatchDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleDispatchSubmit} className="h-10 px-6 rounded-xl bg-primary text-white">
              <Truck className="h-4 w-4 mr-2" />
              Confirm Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
