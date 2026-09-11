"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  IndianRupee,
  Receipt,
  Download,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Send,
  Building2,
  QrCode,
  Banknote,
  Stethoscope,
  UserCheck,
  Upload,
  FileCheck,
  X,
  PhoneCall,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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
import { CollectPaymentModal, type TransactionRecord } from "@/components/telecaller/collect-payment-modal"
import { ProgramMappingModal, type ProgramMappingResult } from "@/components/telecaller/program-mapping-modal"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"
import { toast } from "sonner"

interface PatientPaymentDetail {
  id: string
  name: string
  phone: string
  email: string
  city: string
  enrolledDate: string
  programName: string
  specialty: string
  tier: string
  totalPlanValue: number
  enrollmentFeePaid: number
  amountPaidSoFar: number
  pendingBalance: number
  installmentNumber: number
  totalInstallments: number
  status: "pending_program_mapping" | "active_recovery" | "paid"
  overdueDays: number
  dueDate: string
  doctorName?: string
  doctorNotes?: string
  doctorRecommendedFee?: number
  transactions: TransactionRecord[]
  installmentSchedule: { phase: number; amount: number; dueDate: string; status: "paid" | "due" | "upcoming" }[]
  callLogs: {
    id: string
    date: string
    caller: string
    outcome: string
    notes: string
    followUpDate?: string
  }[]
  attachments: {
    id: string
    name: string
    uploadedAt: string
    size: string
  }[]
}

const MOCK_PATIENT_DETAILS: Record<string, PatientPaymentDetail> = {
  "HBF-2607-0024": {
    id: "HBF-2607-0024",
    name: "Shweta Kamble",
    phone: "+91 9876767696",
    email: "shwetaekamble@gmail.com",
    city: "Mumbai",
    enrolledDate: "2026-07-20",
    programName: "The Signature 90 days weight loss program",
    specialty: "Weight Management",
    tier: "Standard",
    totalPlanValue: 15000,
    enrollmentFeePaid: 1899,
    amountPaidSoFar: 1899,
    pendingBalance: 13101,
    installmentNumber: 2,
    totalInstallments: 2,
    overdueDays: 38,
    dueDate: "3 Aug 2026",
    status: "active_recovery",
    doctorName: "Dr. Bhagyesh Kulkarni",
    doctorNotes: "Target 8kg weight reduction in 90 days. Phase 1 cleared; Phase 2 installment due.",
    transactions: [
      {
        id: "tx-phase1-1",
        invoiceNumber: "INV-2026-0024-P1",
        date: "2026-07-20T11:30:00Z",
        amount: 1899,
        mode: "upi",
        status: "settled",
        reference: "UPI/20260720991823",
      },
    ],
    installmentSchedule: [
      { phase: 1, amount: 1899, dueDate: "Paid Jul 20, 2026", status: "paid" },
      { phase: 2, amount: 13101, dueDate: "3 Aug 2026 (38 Days Overdue)", status: "due" },
    ],
    callLogs: [
      {
        id: "call-1",
        date: "2026-08-10 03:30 PM",
        caller: "Sneha Nair (Payment Recovery)",
        outcome: "Follow-up Required",
        notes: "Called patient regarding Phase 2 pending payment. Patient requested call next week due to salary cycle.",
        followUpDate: "2026-08-17",
      },
      {
        id: "call-2",
        date: "2026-08-18 11:15 AM",
        caller: "Sneha Nair (Payment Recovery)",
        outcome: "Promised to Pay (PTP)",
        notes: "Spoke with Shweta. She confirmed payment of ₹13,101 will be made via UPI once link is sent.",
        followUpDate: "2026-08-25",
      },
    ],
    attachments: [
      {
        id: "att-1",
        name: "shweta_token_receipt.pdf",
        uploadedAt: "2026-07-20",
        size: "142 KB",
      },
    ],
  },
  "HBF-2607-0046": {
    id: "HBF-2607-0046",
    name: "Rekha Kokani",
    phone: "+91 98788311252",
    email: "sunrekh18@gmail.com",
    city: "Pune",
    enrolledDate: "2026-07-25",
    programName: "The Signature 90 days weight loss program",
    specialty: "Weight Management",
    tier: "Standard",
    totalPlanValue: 15000,
    enrollmentFeePaid: 1899,
    amountPaidSoFar: 1899,
    pendingBalance: 13101,
    installmentNumber: 2,
    totalInstallments: 2,
    overdueDays: 32,
    dueDate: "10 Aug 2026",
    status: "active_recovery",
    transactions: [
      {
        id: "tx-phase1-2",
        invoiceNumber: "INV-2026-0046-P1",
        date: "2026-07-25T14:15:00Z",
        amount: 1899,
        mode: "cash",
        status: "settled",
        reference: "REC-CSH-441920",
      },
    ],
    installmentSchedule: [
      { phase: 1, amount: 1899, dueDate: "Paid Jul 25, 2026", status: "paid" },
      { phase: 2, amount: 13101, dueDate: "10 Aug 2026 (32 Days Overdue)", status: "due" },
    ],
    callLogs: [],
    attachments: [],
  },
  "REC-201": {
    id: "REC-201",
    name: "Vikram Malhotra",
    phone: "+91 98201 98112",
    email: "vikram.malhotra@example.com",
    city: "Mumbai",
    enrolledDate: "2026-08-25",
    programName: "Pending Mapping (Dr. Recommended: 50K Intensive)",
    specialty: "Diabetes Free Forever",
    tier: "Intensive",
    totalPlanValue: 50000,
    enrollmentFeePaid: 2499,
    amountPaidSoFar: 2499,
    pendingBalance: 47501,
    installmentNumber: 1,
    totalInstallments: 3,
    overdueDays: 0,
    dueDate: "Immediate",
    status: "pending_program_mapping",
    doctorName: "Dr. Ritu Agarwal",
    doctorRecommendedFee: 50000,
    doctorNotes: "HbA1c 8.9, 12 years diabetic. Needs 6-month intensive care. Coordinate agreed plan and installment schedule.",
    transactions: [
      {
        id: "tx-token-1",
        invoiceNumber: "INV-2026-0814",
        date: "2026-08-25T10:15:00Z",
        amount: 2499,
        mode: "upi",
        status: "settled",
        reference: "UPI/2026082599182",
      },
    ],
    installmentSchedule: [
      { phase: 1, amount: 16000, dueDate: "Immediate / Due Now", status: "due" },
      { phase: 2, amount: 16000, dueDate: "In 30 Days", status: "upcoming" },
      { phase: 3, amount: 15501, dueDate: "In 60 Days", status: "upcoming" },
    ],
    callLogs: [],
    attachments: [],
  },
}

export default function PaymentRecoveryPatientDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const rawId = params?.id ? decodeURIComponent(params.id) : "HBF-2607-0024"

  const initialRecord = MOCK_PATIENT_DETAILS[rawId] || {
    ...MOCK_PATIENT_DETAILS["HBF-2607-0024"],
    id: rawId,
    name: "Shweta Kamble",
  }

  const [patient, setPatient] = React.useState<PatientPaymentDetail>(initialRecord)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false)
  const [isMappingModalOpen, setIsMappingModalOpen] = React.useState(false)

  // Call Logging Modal State
  const [isCallModalOpen, setIsCallModalOpen] = React.useState(false)
  const [callOutcome, setCallOutcome] = React.useState("follow_up_required")
  const [callNotes, setCallNotes] = React.useState("")
  const [followUpDate, setFollowUpDate] = React.useState("")

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const newAtt = {
        id: `att-${Date.now()}`,
        name: file.name,
        uploadedAt: new Date().toISOString().split("T")[0],
        size: `${(file.size / 1024).toFixed(0)} KB`,
      }
      setPatient((prev) => ({
        ...prev,
        attachments: [newAtt, ...prev.attachments],
      }))
      toast.success(`Attached "${file.name}" to patient records!`)
    }
  }

  const handleSaveCallLog = () => {
    if (!callNotes.trim()) {
      toast.error("Please enter conversation notes")
      return
    }

    const newLog = {
      id: `call-${Date.now()}`,
      date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      caller: "Sneha Nair (Payment Recovery)",
      outcome:
        callOutcome === "connected"
          ? "Connected"
          : callOutcome === "ptp"
          ? "Promised to Pay (PTP)"
          : callOutcome === "follow_up_required"
          ? "Follow-up Required"
          : "Call Back Later",
      notes: callNotes,
      followUpDate: followUpDate || undefined,
    }

    setPatient((prev) => ({
      ...prev,
      callLogs: [newLog, ...prev.callLogs],
    }))

    toast.success("Call log saved successfully!")
    setIsCallModalOpen(false)
    setCallNotes("")
  }

  const handleRecordPayment = (_id: string, payment: any) => {
    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      amount: payment.amount,
      mode: payment.mode,
      status: "settled",
      reference: payment.receiptNumber,
      attachmentName: payment.attachmentName,
    }

    setPatient((prev) => {
      const newPaid = prev.amountPaidSoFar + payment.amount
      const newPending = Math.max(0, prev.pendingBalance - payment.amount)
      return {
        ...prev,
        amountPaidSoFar: newPaid,
        pendingBalance: newPending,
        status: newPending <= 0 ? "paid" : "active_recovery",
        transactions: [newTx, ...prev.transactions],
        installmentSchedule: prev.installmentSchedule.map((inst) =>
          inst.phase === 2 ? { ...inst, status: "paid", dueDate: "Settled Today" } : inst
        ),
      }
    })
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-[#F8FAFC]">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/telecaller/payment-recovery">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {patient.name}
              </h1>
              <Badge className="bg-slate-100 text-slate-800 font-mono text-xs font-semibold">
                {patient.id}
              </Badge>
              {patient.status === "paid" ? (
                <Badge className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Fully Settled
                </Badge>
              ) : (
                <Badge className="bg-rose-100 text-rose-800 font-bold text-xs">
                  {patient.overdueDays} Days Overdue
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {patient.phone} · {patient.email} · {patient.city} · Enrolled: {patient.enrolledDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <TelecallerRoleHeaderBadge />

          <Button
            onClick={() => setIsCallModalOpen(true)}
            variant="outline"
            className="h-10 px-4 rounded-xl text-xs font-bold border-slate-300 gap-1.5 shadow-sm hover:bg-slate-50"
          >
            <PhoneCall className="h-4 w-4 text-emerald-600" />
            Call Patient
          </Button>

          <Button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={patient.pendingBalance <= 0}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md gap-1.5"
          >
            <Banknote className="h-4 w-4" />
            {patient.pendingBalance <= 0 ? "All Dues Cleared" : "Pay Phase 2 Now"}
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Program Plan Fee</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ₹{patient.totalPlanValue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{patient.programName}</p>
        </Card>

        <Card className="border border-emerald-100 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Phase 1 Paid</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            ₹{patient.amountPaidSoFar.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Initial enrollment cleared</p>
        </Card>

        <Card className="border border-rose-100 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Phase 2 Due Amount</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            ₹{patient.pendingBalance.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">
            {patient.pendingBalance <= 0 ? "Phase 2 Settled" : `${patient.overdueDays} Days Overdue`}
          </p>
        </Card>

        <Card className="border border-blue-100 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Phase Progress</p>
          <p className="text-2xl font-black text-[#2563EB] mt-1">
            {patient.pendingBalance <= 0 ? "2/2 Completed" : "1/2 Cleared"}
          </p>
          <p className="text-[11px] text-blue-700 font-medium mt-0.5">Next Phase: 75 Access Days</p>
        </Card>
      </div>

      {/* Main Content Grid: Payment Timeline + Invoices & Call Log */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COL: Payment Structure Timeline (1 Col) */}
        <div className="space-y-6">
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#2563EB]" />
                Payment Structure & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Phase 1 Item */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Phase 1 Installment</span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-bold border-none">
                    Paid ₹1,899
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  Paid on Jul 20, 2026 via UPI (Ref: UPI/20260720991823). Receipt #INV-2026-0024-P1.
                </p>
                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.success("Invoice Downloaded", {
                        description: "Receipt for Phase 1 (₹1,899) saved as PDF.",
                      })
                    }
                    className="h-7 text-[10px] font-bold rounded-lg border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  >
                    <Download className="mr-1 h-3 w-3" /> Download Phase 1 PDF
                  </Button>
                </div>
              </div>

              {/* Phase 2 Item */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  patient.pendingBalance <= 0
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-rose-200 bg-rose-50/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Phase 2 Installment</span>
                  <Badge
                    className={`text-[9px] font-bold border-none ${
                      patient.pendingBalance <= 0
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {patient.pendingBalance <= 0 ? "Paid ₹13,101" : "Due ₹13,101"}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  {patient.pendingBalance <= 0
                    ? "Phase 2 cleared. 75 days protocol access unlocked."
                    : "Scheduled Due: 3 Aug 2026 (38 Days Overdue). Action required: collect payment via Cash, UPI, or Razorpay."}
                </p>

                {patient.pendingBalance > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="flex-1 h-8.5 text-xs font-bold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm gap-1.5"
                    >
                      <Banknote className="h-3.5 w-3.5" />
                      Collect Phase 2
                    </Button>
                    <Link
                      href={`/dashboard/telecaller/payment-recovery/${patient.id}/collect`}
                      className="h-8.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-sm transition-colors"
                      title="Open Full Page"
                    >
                      <span>Full Page</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Proof / Attachment Section */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  Supporting Documents
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Screenshots / receipts shared by patient
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs font-bold rounded-lg gap-1 border-slate-200"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                className="hidden"
              />
            </CardHeader>
            <CardContent className="p-5 space-y-2.5">
              {patient.attachments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No document attached yet.</p>
              ) : (
                patient.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                      <span className="text-[10px] text-slate-400">({att.size})</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.success(`Viewing "${att.name}"`)}
                      className="h-7 text-xs font-semibold text-[#2563EB] hover:bg-blue-50"
                    >
                      View
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT 2 COLS: Invoices Ledger & Payment Recovery Call Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoices & Receipts Ledger */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-600" />
                  Invoices & Settlement Ledger
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Official invoice records with instant PDF download
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700">Invoice No</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Date</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Mode & Reference</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Amount</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-right">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.transactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-50/60">
                      <TableCell>
                        <p className="text-xs font-bold text-slate-900">{tx.invoiceNumber}</p>
                        <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-bold mt-0.5">
                          {tx.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-600">
                          {new Date(tx.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-bold text-slate-800 uppercase">
                          {tx.mode.replace(/_/g, " ")}
                        </p>
                        {tx.reference && (
                          <p className="text-[10px] text-slate-500 font-mono">{tx.reference}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-emerald-700">
                          ₹{tx.amount.toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toast.success(`Receipt ${tx.invoiceNumber} downloaded!`)
                          }
                          className="h-7 text-xs font-semibold rounded-lg gap-1"
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Recovery Call Logs */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl">
            <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Payment Recovery Call Logs
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Outreach history & follow-up callbacks for this patient
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsCallModalOpen(true)}
                className="h-8 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold gap-1"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                + Log New Call
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {patient.callLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No call logged yet for this patient.</p>
              ) : (
                patient.callLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-[10px] font-bold border-none ${
                            log.outcome === "Promised to Pay (PTP)"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {log.outcome}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-700">{log.caller}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{log.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{log.notes}</p>
                    {log.followUpDate && (
                      <p className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Next Follow-up Callback: {log.followUpDate}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collect Payment Wizard (Screenshot 2 Match) */}
      <CollectPaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        patientId={patient.id}
        patientName={patient.name}
        patientPhone={patient.phone}
        programName={patient.programName}
        totalPlanValue={patient.totalPlanValue}
        amountPaidSoFar={patient.amountPaidSoFar}
        pendingBalance={patient.pendingBalance}
        phase1Amount={patient.amountPaidSoFar}
        phase2Amount={patient.pendingBalance}
        onPaymentSuccess={handleRecordPayment}
      />

      {/* Payment Recovery Call Log Modal */}
      <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-emerald-600" />
              Log Recovery Call with {patient.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Dialed {patient.phone} · Record patient response & promise to pay
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Call Outcome</Label>
              <Select value={callOutcome} onValueChange={setCallOutcome}>
                <SelectTrigger className="h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up_required">Follow-up Required for Payment</SelectItem>
                  <SelectItem value="ptp">Promised to Pay (PTP)</SelectItem>
                  <SelectItem value="connected">Connected & Discussing</SelectItem>
                  <SelectItem value="call_back">Call Back Requested</SelectItem>
                  <SelectItem value="dispute">Financial Hardship / Dispute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Next Follow-up Date (Optional)</Label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Conversation Notes</Label>
              <Textarea
                placeholder="e.g. Patient agreed to clear Phase 2 (₹13,101) via UPI link by Friday 4 PM..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="text-xs rounded-xl h-24"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCallModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveCallLog}
              className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Save Recovery Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
