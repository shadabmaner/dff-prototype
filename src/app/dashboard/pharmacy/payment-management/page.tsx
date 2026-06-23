"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Eye,
  IndianRupee,
  Download,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  CreditCard,
  Smartphone,
  QrCode,
  Send,
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

type InvoiceStatus = "PENDING" | "PAID" | "FAILED" | "OVERDUE" | "CANCELLED"

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
}

const invoiceStatusColors: Record<InvoiceStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  OVERDUE: "bg-orange-100 text-orange-700 border-orange-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
}

export default function PaymentManagementPage() {
  const { prescriptions, generateInvoice, updatePaymentStatus } = usePharmacy()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showManualPaymentDialog, setShowManualPaymentDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [transactionId, setTransactionId] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [invoiceData, setInvoiceData] = useState({
    medicationCost: "",
    deliveryCharges: "50",
    additionalCharges: "0",
    discount: "0",
    tax: "",
    dueDate: "",
    billingNotes: "",
  })

  const prescriptionsWithInvoices = prescriptions.filter((p) => p.invoice !== null || p.status === "MEDICINES_PACKED")

  const filteredPrescriptions = prescriptionsWithInvoices
    .filter((prescription) => {
      const matchesSearch =
        prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.invoice?.id || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || (prescription.invoice?.status === selectedStatus)
      return matchesSearch && matchesStatus
    })

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

  const handleGenerateInvoice = (prescription: any) => {
    setSelectedPrescription(prescription)
    const estimatedCost = prescription.medications.reduce((sum: number, med: any) => sum + (med.quantity * 10), 0)
    setInvoiceData({
      ...invoiceData,
      medicationCost: estimatedCost.toString(),
      tax: (estimatedCost * 0.1).toString(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
    setShowGenerateDialog(true)
  }

  const handleInvoiceSubmit = () => {
    if (selectedPrescription) {
      const totalAmount =
        parseFloat(invoiceData.medicationCost) +
        parseFloat(invoiceData.deliveryCharges) +
        parseFloat(invoiceData.additionalCharges) -
        parseFloat(invoiceData.discount) +
        parseFloat(invoiceData.tax)

      generateInvoice(selectedPrescription.id, {
        medicationCost: parseFloat(invoiceData.medicationCost),
        deliveryCharges: parseFloat(invoiceData.deliveryCharges),
        additionalCharges: parseFloat(invoiceData.additionalCharges),
        discount: parseFloat(invoiceData.discount),
        tax: parseFloat(invoiceData.tax),
        totalAmount,
        dueDate: invoiceData.dueDate,
        billingNotes: invoiceData.billingNotes,
        generatedBy: "Pharmacy Staff",
      })

      alert(`Invoice generated successfully. Total: ₹${totalAmount}. Payment request sent to patient.`)
      setShowGenerateDialog(false)
      setInvoiceData({
        medicationCost: "",
        deliveryCharges: "50",
        additionalCharges: "0",
        discount: "0",
        tax: "",
        dueDate: "",
        billingNotes: "",
      })
    }
  }

  const handleSendReminder = (prescription: any) => {
    setSelectedPrescription(prescription)
    setShowReminderDialog(true)
  }

  const sendReminder = () => {
    if (!selectedPrescription || !selectedPrescription.invoice) {
      alert("No invoice found for this prescription.")
      setShowReminderDialog(false)
      return
    }
    alert(`Payment reminder sent to ${selectedPrescription.patientName} for invoice ${selectedPrescription.invoice.id}`)
    setShowReminderDialog(false)
  }

  const handleMarkPaid = (prescription: any) => {
    if (confirm(`Mark invoice ${prescription.invoice?.id} as paid?`)) {
      updatePaymentStatus(prescription.id, "PAID")
      alert("Payment status updated to Paid. Prescription is now ready for dispatch.")
    }
  }

  const handleManualPayment = (prescription: any) => {
    setSelectedPrescription(prescription)
    setPaymentAmount(prescription.invoice?.totalAmount?.toString() || "")
    setShowManualPaymentDialog(true)
  }

  const handleManualPaymentSubmit = () => {
    if (!selectedPrescription) {
      alert("No prescription selected")
      return
    }
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount")
      return
    }
    if (!transactionId && paymentMethod !== "link") {
      alert("Please enter the transaction ID/receipt number")
      return
    }

    updatePaymentStatus(selectedPrescription.id, "PAID")
    alert(`Payment recorded successfully via ${paymentMethod.toUpperCase()}. Transaction ID: ${transactionId || "N/A"}`)
    setShowManualPaymentDialog(false)
    setPaymentMethod("cash")
    setTransactionId("")
    setPaymentAmount("")
    setPaymentNotes("")
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
            Payment <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Generate invoices and track payment status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  ₹{prescriptionsWithInvoices.reduce((sum, p) => sum + (p.invoice?.totalAmount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Payments</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {prescriptionsWithInvoices.filter((p) => p.invoice?.status === "PENDING").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Paid Today</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  ₹{prescriptionsWithInvoices
                    .filter((p) => p.invoice?.status === "PAID")
                    .reduce((sum, p) => sum + (p.invoice?.totalAmount || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overdue</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {prescriptionsWithInvoices.filter((p) => p.invoice?.status === "OVERDUE").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
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
                  placeholder="Search by ID, Patient Name, Invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Payment Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(invoiceStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Invoices</CardTitle>
          <CardDescription>
            {filteredPrescriptions.length} invoices found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Invoice ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Prescription ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Due Date</th>
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
                        <span className="text-sm font-medium text-slate-900">{prescription.invoice?.id || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{prescription.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">{prescription.patientName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-slate-900">
                        ₹{prescription.invoice?.totalAmount?.toLocaleString() || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600">
                        {prescription.invoice?.dueDate ? formatDate(prescription.invoice.dueDate) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {prescription.invoice ? (
                        <Badge className={cn("text-xs font-semibold border", invoiceStatusColors[prescription.invoice.status])}>
                          {invoiceStatusLabels[prescription.invoice.status]}
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-slate-100 text-slate-700 border-slate-200">Not Generated</Badge>
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
                        {!prescription.invoice && prescription.status === "MEDICINES_PACKED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 rounded-lg text-primary"
                            onClick={() => handleGenerateInvoice(prescription)}
                          >
                            <IndianRupee className="h-4 w-4" />
                          </Button>
                        )}
                        {prescription.invoice?.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 rounded-lg text-amber-600"
                              onClick={() => handleSendReminder(prescription)}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 rounded-lg text-primary"
                              onClick={() => handleManualPayment(prescription)}
                            >
                              <IndianRupee className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 rounded-lg text-emerald-600"
                              onClick={() => handleMarkPaid(prescription)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {prescription.invoice && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg"
                            onClick={() => alert("Downloading invoice PDF...")}
                          >
                            <Download className="h-4 w-4 text-slate-600" />
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
            <DialogTitle className="text-lg font-bold text-slate-900">Invoice Details</DialogTitle>
            <DialogDescription>
              Complete invoice information
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && selectedPrescription.invoice && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Invoice ID</p>
                  <p className="text-sm font-medium text-slate-900">{selectedPrescription.invoice.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Prescription ID</p>
                  <p className="text-sm text-slate-600">{selectedPrescription.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Patient</p>
                  <p className="text-sm text-slate-600">{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <Badge className={cn("text-xs font-semibold border", invoiceStatusColors[selectedPrescription.invoice?.status as InvoiceStatus])}>
                    {invoiceStatusLabels[selectedPrescription.invoice?.status as InvoiceStatus]}
                  </Badge>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Medication Cost</span>
                    <span className="text-sm font-medium text-slate-900">₹{selectedPrescription.invoice.medicationCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Delivery Charges</span>
                    <span className="text-sm font-medium text-slate-900">₹{selectedPrescription.invoice.deliveryCharges}</span>
                  </div>
                  {selectedPrescription.invoice.additionalCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Additional Charges</span>
                      <span className="text-sm font-medium text-slate-900">₹{selectedPrescription.invoice.additionalCharges}</span>
                    </div>
                  )}
                  {selectedPrescription.invoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Discount</span>
                      <span className="text-sm font-medium text-emerald-600">-₹{selectedPrescription.invoice.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Tax (10%)</span>
                    <span className="text-sm font-medium text-slate-900">₹{selectedPrescription.invoice.tax}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-sm font-bold text-slate-900">Total Amount</span>
                    <span className="text-lg font-bold text-primary">₹{selectedPrescription.invoice.totalAmount}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Due Date</p>
                  <p className="text-sm text-slate-600">{formatDate(selectedPrescription.invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Generated On</p>
                  <p className="text-sm text-slate-600">{formatDate(selectedPrescription.invoice.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Generate Invoice</DialogTitle>
            <DialogDescription>
              Create invoice for prescription {selectedPrescription?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Medication Cost</Label>
              <Input
                type="number"
                value={invoiceData.medicationCost}
                onChange={(e) => setInvoiceData({ ...invoiceData, medicationCost: e.target.value })}
                placeholder="Enter medication cost"
                className="h-10 rounded-xl border-slate-200 mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Delivery Charges</Label>
                <Input
                  type="number"
                  value={invoiceData.deliveryCharges}
                  onChange={(e) => setInvoiceData({ ...invoiceData, deliveryCharges: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Discount</Label>
                <Input
                  type="number"
                  value={invoiceData.discount}
                  onChange={(e) => setInvoiceData({ ...invoiceData, discount: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 mt-2"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Payment Due Date</Label>
              <Input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                className="h-10 rounded-xl border-slate-200 mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Billing Notes</Label>
              <Textarea
                value={invoiceData.billingNotes}
                onChange={(e) => setInvoiceData({ ...invoiceData, billingNotes: e.target.value })}
                placeholder="Enter billing notes..."
                className="min-h-[80px] rounded-xl border-slate-200 resize-none mt-2"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-900">Estimated Total</span>
                <span className="text-lg font-bold text-primary">
                  ₹{(
                    parseFloat(invoiceData.medicationCost || "0") +
                    parseFloat(invoiceData.deliveryCharges || "0") -
                    parseFloat(invoiceData.discount || "0") +
                    parseFloat(invoiceData.tax || "0")
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleInvoiceSubmit} className="h-10 px-6 rounded-xl bg-primary text-white">
              <IndianRupee className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send payment reminder to {selectedPrescription?.patientName}
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && selectedPrescription.invoice && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-5 w-5 text-amber-600" />
                <p className="text-sm font-bold text-amber-900">Payment Reminder</p>
              </div>
              <p className="text-sm text-amber-700">
                Invoice {selectedPrescription.invoice.id} for ₹{selectedPrescription.invoice.totalAmount} is due on {formatDate(selectedPrescription.invoice.dueDate)}.
              </p>
            </div>
          )}
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowReminderDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={sendReminder} className="h-10 px-6 rounded-xl bg-primary text-white">
              <Bell className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showManualPaymentDialog} onOpenChange={setShowManualPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Record Manual Payment</DialogTitle>
            <DialogDescription>
              Record payment for {selectedPrescription?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="upi">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      UPI
                    </div>
                  </SelectItem>
                  <SelectItem value="qr">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      QR Code
                    </div>
                  </SelectItem>
                  <SelectItem value="check">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Check
                    </div>
                  </SelectItem>
                  <SelectItem value="bank">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bank/NEFT
                    </div>
                  </SelectItem>
                  <SelectItem value="link">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Payment Link
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Amount</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-2"
              />
            </div>
            {paymentMethod !== "link" && (
              <div>
                <Label className="text-sm font-medium text-slate-700">
                  {paymentMethod === "cash" ? "Receipt ID" : 
                   paymentMethod === "upi" || paymentMethod === "qr" ? "UTR/Reference ID" :
                   paymentMethod === "check" ? "Check Number" :
                   paymentMethod === "bank" ? "Transaction ID" : "Transaction ID"}
                </Label>
                <Input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={`Enter ${paymentMethod === "cash" ? "receipt ID" : 
                              paymentMethod === "upi" || paymentMethod === "qr" ? "UTR/reference ID" :
                              paymentMethod === "check" ? "check number" :
                              paymentMethod === "bank" ? "transaction ID" : "transaction ID"}`}
                  className="mt-2"
                />
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-slate-700">Notes</Label>
              <Textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Add payment notes..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowManualPaymentDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleManualPaymentSubmit} className="h-10 px-6 rounded-xl bg-primary text-white">
              <IndianRupee className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
