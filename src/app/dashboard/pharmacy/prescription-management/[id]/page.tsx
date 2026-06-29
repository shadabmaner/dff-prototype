"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  User,
  FileText,
  Package,
  IndianRupee,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  QrCode,
  Smartphone,
  Send,
  Calculator,
  Bell,
  ChevronRight,
  Printer,
  Eye,
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

type PrescriptionStatus = "NEW_PRESCRIPTION_RECEIVED" | "UNDER_REVIEW" | "CALCULATING_AMOUNT" | "PAYMENT_PENDING" | "PENDING_FOR_PACKING" | "MEDICINES_PACKED" | "READY_FOR_DISPATCH" | "DISPATCHED" | "DELIVERED" | "CANCELLED"

const statusLabels: Record<PrescriptionStatus, string> = {
  NEW_PRESCRIPTION_RECEIVED: "New Prescription",
  UNDER_REVIEW: "Under Review",
  CALCULATING_AMOUNT: "Calculating Amount",
  PAYMENT_PENDING: "Payment Pending",
  PENDING_FOR_PACKING: "Pending for Packaging",
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
  PENDING_FOR_PACKING: "bg-pink-100 text-pink-700 border-pink-200",
  MEDICINES_PACKED: "bg-cyan-100 text-cyan-700 border-cyan-200",
  READY_FOR_DISPATCH: "bg-emerald-100 text-emerald-700 border-emerald-200",
  DISPATCHED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

export default function PrescriptionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { prescriptions, updateStatus, generateInvoice, updatePaymentStatus } = usePharmacy()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [paymentAmount, setPaymentAmount] = useState<string>("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0)
  const [medicationPrices, setMedicationPrices] = useState<Record<number, string>>({})
  const [transactionId, setTransactionId] = useState("")
  const [deliveryCharge, setDeliveryCharge] = useState(50)

  const prescriptionId = params.id as string
  const prescription = prescriptions.find((p) => p.id === prescriptionId)

  if (!prescription) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Prescription Not Found</h2>
          <p className="text-slate-600 mb-4">The prescription you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const calculateTotalAmount = () => {
    const medicationTotal = prescription.medications.reduce((sum: number, med: any, index: number) => {
      const price = parseFloat(medicationPrices[index] || "0")
      return sum + (price * med.quantity)
    }, 0)
    const tax = medicationTotal * 0.05
    const total = medicationTotal + deliveryCharge + tax
    setCalculatedAmount(total)
    updateStatus(prescription.id, "CALCULATING_AMOUNT" as PrescriptionStatus, "Amount calculated")
  }

  const handleCapturePayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) !== calculatedAmount) {
      alert("Please enter the correct amount")
      return
    }
    if (!transactionId && paymentMethod !== "link") {
      alert("Please enter the transaction ID/receipt number")
      return
    }
    generateInvoice(prescription.id, {
      medicationCost: prescription.medications.reduce((sum: number, med: any, index: number) => {
        const price = parseFloat(medicationPrices[index] || "0")
        return sum + (price * med.quantity)
      }, 0),
      deliveryCharges: deliveryCharge,
      additionalCharges: 0,
      discount: 0,
      tax: prescription.medications.reduce((sum: number, med: any, index: number) => {
        const price = parseFloat(medicationPrices[index] || "0")
        return sum + (price * med.quantity)
      }, 0) * 0.05,
      totalAmount: calculatedAmount,
      dueDate: new Date().toISOString().split('T')[0],
      billingNotes: `Payment via ${paymentMethod.toUpperCase()}. Transaction ID: ${transactionId || "N/A"}`,
      generatedBy: "Pharmacy Staff",
    })
    updatePaymentStatus(prescription.id, "PAID")
    updateStatus(prescription.id, "PENDING_FOR_PACKING" as PrescriptionStatus, "Payment captured, pending for packaging")
    setShowPaymentDialog(false)
    setPaymentMethod("cash")
    setPaymentAmount("")
    setTransactionId("")
    setPaymentNotes("")
    alert("Payment captured successfully! Prescription is now pending for packaging.")
  }

  const handleSendReminder = () => {
    alert(`Payment reminder sent to ${prescription.patientName} via mobile notification`)
    setShowReminderDialog(false)
  }

  const handleStatusUpdate = (newStatus: PrescriptionStatus) => {
    updateStatus(prescription.id, newStatus, "Status updated")
    alert(`Status updated to ${statusLabels[newStatus]}`)
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const medicationTotal = prescription.medications.reduce((sum: number, med: any, index: number) => {
    const price = parseFloat(medicationPrices[index] || "0")
    return sum + (price * med.quantity)
  }, 0)

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Pharmacy</span>
            <ChevronRight className="h-4 w-4" />
            <span>Prescription Management</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-slate-900">{prescription.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Prescription Details</h1>
        </div>
        <Badge className={cn("text-xs font-semibold border", statusColors[prescription.status as PrescriptionStatus])}>
          {statusLabels[prescription.status as PrescriptionStatus]}
        </Badge>
        <Button variant="outline" onClick={() => setShowPreviewDialog(true)} className="h-10 px-4">
          <Eye className="h-4 w-4 mr-2" />
          View Prescription
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Patient Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Patient Name</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{prescription.patientName}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Patient ID</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{prescription.patientId}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Phone</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-900">{prescription.patientPhone || "—"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-900">{prescription.patientEmail || "—"}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Address</Label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                    <p className="text-sm font-medium text-slate-900">{prescription.patientAddress || "—"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Prescription Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Prescription ID</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{prescription.id}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Batch ID</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{prescription.batchId}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Doctor</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{prescription.doctorName}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Prescription Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-900">{formatDate(prescription.prescriptionDate)}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Doctor Notes</Label>
                  <p className="text-sm text-slate-700 mt-1">{prescription.doctorNotes || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Medications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Medication</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Dosage</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Quantity</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Price (₹)</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.medications.map((med: any, index: number) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">{med.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-600">{med.dosage}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-600">{med.quantity}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            placeholder="0"
                            value={medicationPrices[index] || ""}
                            onChange={(e) => setMedicationPrices({ ...medicationPrices, [index]: e.target.value })}
                            className="w-24 h-8 text-sm"
                            disabled={prescription.status === "CALCULATING_AMOUNT" || prescription.status === "PAYMENT_PENDING"}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">₹{(parseFloat(medicationPrices[index] || "0") * med.quantity).toFixed(2)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Amount Calculation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Medications Total</span>
                <span className="text-sm font-bold text-slate-900">₹{medicationTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Delivery Charge</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-sm"
                    disabled={prescription.status === "CALCULATING_AMOUNT" || prescription.status === "PAYMENT_PENDING"}
                  />
                  <span className="text-sm font-bold text-slate-900">₹{deliveryCharge}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Tax (5%)</span>
                <span className="text-sm font-bold text-slate-900">₹{(medicationTotal * 0.05).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Total Amount</span>
                  <span className="text-lg font-bold text-primary">₹{calculatedAmount.toFixed(2) || "—"}</span>
                </div>
              </div>
              <Button
                onClick={calculateTotalAmount}
                className="w-full bg-gradient-to-r from-primary to-pink-500 text-white"
                disabled={prescription.status === "CALCULATING_AMOUNT" || prescription.status === "PAYMENT_PENDING"}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Amount
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Payment Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button
                onClick={() => setShowPaymentDialog(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!calculatedAmount || prescription.status === "PAYMENT_PENDING" || prescription.status === "MEDICINES_PACKED"}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Capture Payment
              </Button>
              {prescription.status === "PAYMENT_PENDING" && (
                <Button
                  onClick={() => setShowReminderDialog(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Payment Reminder
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Status Workflow</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button
                onClick={() => handleStatusUpdate("UNDER_REVIEW")}
                className="w-full"
                variant="outline"
                disabled={prescription.status !== "NEW_PRESCRIPTION_RECEIVED"}
              >
                Mark as Under Review
              </Button>
              <Button
                onClick={() => handleStatusUpdate("PENDING_FOR_PACKING")}
                className="w-full"
                variant="outline"
                disabled={prescription.status !== "PAYMENT_PENDING"}
              >
                Mark as Pending for Packaging
              </Button>
              <Button
                onClick={() => handleStatusUpdate("MEDICINES_PACKED")}
                className="w-full"
                variant="outline"
                disabled={prescription.status !== "PENDING_FOR_PACKING"}
              >
                Mark as Medicines Packed
              </Button>
              <Button
                onClick={() => handleStatusUpdate("READY_FOR_DISPATCH")}
                className="w-full"
                variant="outline"
                disabled={prescription.status !== "MEDICINES_PACKED"}
              >
                Mark as Ready for Dispatch
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capture Payment</DialogTitle>
            <DialogDescription>
              Capture payment for {prescription.patientName}
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
                placeholder={`₹${calculatedAmount.toFixed(2)}`}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCapturePayment}>
              Capture Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send payment reminder to {prescription.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              This will send a mobile notification to the patient reminding them to pay ₹{calculatedAmount} for prescription {prescription.id}.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminder}>
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Prescription Preview</DialogTitle>
            <DialogDescription>
              View prescription with DFF branding and medication color coding
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
                  <p className="text-xs text-slate-500">{prescription.id}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(prescription.prescriptionDate)}</p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Patient Name</p>
                <p className="text-sm font-bold text-slate-900">{prescription.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Patient ID</p>
                <p className="text-sm font-medium text-slate-900">{prescription.patientId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Contact</p>
                <p className="text-sm font-medium text-slate-900">{prescription.patientContact}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Batch ID</p>
                <p className="text-sm font-medium text-primary">{prescription.batchId}</p>
              </div>
            </div>

            {/* Doctor Notes */}
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Doctor Notes</p>
              <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">{prescription.doctorNotes || "No notes provided"}</p>
            </div>

            {/* Medications with Color Coding */}
            {prescription.medications.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-3">Medications</p>
                
                {/* DFF Medications Section */}
                {prescription.medications.filter((m: any) => !m.isCustom).length > 0 && (
                  <div className="mb-4">
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-3 mb-2">
                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                        DFF Pharmacy Medications (Buy from DFF Pharmacy)
                      </p>
                    </div>
                    <div className="space-y-2">
                      {prescription.medications.filter((m: any) => !m.isCustom).map((med: any, idx: number) => (
                        <div key={idx} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{idx + 1}. {med.name}</p>
                              <p className="text-xs text-slate-600">Strength: {med.strength}</p>
                            </div>
                            <Badge className="bg-emerald-600 text-white text-xs">{med.frequency}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500">Dosage:</span> {med.dosage}
                            </div>
                            <div>
                              <span className="text-slate-500">Quantity:</span> {med.quantity}
                            </div>
                            <div>
                              <span className="text-slate-500">Meal Timing:</span> {med.mealTiming || "As prescribed"}
                            </div>
                            <div>
                              <span className="text-slate-500">Price:</span> ₹{med.price || 0}
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
                {prescription.medications.filter((m: any) => m.isCustom).length > 0 && (
                  <div>
                    <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 mb-2">
                      <p className="text-xs font-bold text-orange-800 flex items-center gap-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                        Other Medications (Buy from External Pharmacy)
                      </p>
                    </div>
                    <div className="space-y-2">
                      {prescription.medications.filter((m: any) => m.isCustom).map((med: any, idx: number) => (
                        <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{idx + 1}. {med.name}</p>
                              <p className="text-xs text-slate-600">Strength: {med.strength || "As prescribed"}</p>
                            </div>
                            <Badge className="bg-orange-600 text-white text-xs">{med.frequency}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500">Dosage:</span> {med.dosage}
                            </div>
                            <div>
                              <span className="text-slate-500">Quantity:</span> {med.quantity}
                            </div>
                            <div>
                              <span className="text-slate-500">Meal Timing:</span> {med.mealTiming || "As prescribed"}
                            </div>
                            <div>
                              <span className="text-slate-500">Price:</span> ₹{med.price || 0}
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
                  <p className="text-xs text-slate-400">Valid prescription ID: {prescription.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
            <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
