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
  AlertCircle,
  FileText,
  Clock,
  Send,
  Building2,
  QrCode,
  Banknote,
  Stethoscope,
  UserCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  totalPlanValue: number
  enrollmentFeePaid: number
  amountPaidSoFar: number
  pendingBalance: number
  installmentNumber: number
  totalInstallments: number
  status: "pending_program_mapping" | "active_recovery" | "paid"
  doctorName: string
  doctorNotes: string
  doctorRecommendedFee: number
  transactions: TransactionRecord[]
  installmentSchedule: { phase: number; amount: number; dueDate: string; status: "paid" | "due" | "upcoming" }[]
}

const MOCK_PATIENT_DETAILS: Record<string, PatientPaymentDetail> = {
  "REC-201": {
    id: "REC-201",
    name: "Vikram Malhotra",
    phone: "+91 98201 98112",
    email: "vikram.malhotra@example.com",
    city: "Mumbai",
    enrolledDate: "2026-08-25",
    programName: "Pending Mapping (Dr. Recommended: 50K Intensive)",
    totalPlanValue: 50000,
    enrollmentFeePaid: 2499,
    amountPaidSoFar: 2499,
    pendingBalance: 47501,
    installmentNumber: 1,
    totalInstallments: 3,
    status: "pending_program_mapping",
    doctorName: "Dr. Ritu Agarwal",
    doctorRecommendedFee: 50000,
    doctorNotes:
      "HbA1c 8.9, 12 years diabetic with elevated fasting insulin. Advised 6-month intensive care. Patient enrolled with ₹2,499 token; hesitant about 50K upfront. Coordinate agreed plan and installment schedule.",
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
  },
  "REC-202": {
    id: "REC-202",
    name: "Deepika Rao",
    phone: "+91 98450 67341",
    email: "deepika.rao@example.com",
    city: "Bengaluru",
    enrolledDate: "2026-09-01",
    programName: "Pending Mapping (Dr. Recommended: 1 Lakh VIP)",
    totalPlanValue: 100000,
    enrollmentFeePaid: 2499,
    amountPaidSoFar: 2499,
    pendingBalance: 97501,
    installmentNumber: 1,
    totalInstallments: 3,
    status: "pending_program_mapping",
    doctorName: "Dr. Anil Deshpande",
    doctorRecommendedFee: 100000,
    doctorNotes:
      "Severe diabetic neuropathy. Doctor advised VIP continuous monitoring. Reconcile ₹2,499 token from final program fee.",
    transactions: [
      {
        id: "tx-token-2",
        invoiceNumber: "INV-2026-0901",
        date: "2026-09-01T14:30:00Z",
        amount: 2499,
        mode: "razorpay_link",
        status: "settled",
        reference: "pay_Nkp912809",
      },
    ],
    installmentSchedule: [
      { phase: 1, amount: 33000, dueDate: "Immediate", status: "due" },
      { phase: 2, amount: 33000, dueDate: "In 30 Days", status: "upcoming" },
      { phase: 3, amount: 31501, dueDate: "In 60 Days", status: "upcoming" },
    ],
  },
  "REC-203": {
    id: "REC-203",
    name: "Rajesh Kulkarni",
    phone: "+91 98220 11984",
    email: "rajesh.k@example.com",
    city: "Pune",
    enrolledDate: "2026-08-10",
    programName: "Diabetes Free Forever (DFF Core)",
    totalPlanValue: 24999,
    enrollmentFeePaid: 2499,
    amountPaidSoFar: 10000,
    pendingBalance: 14999,
    installmentNumber: 2,
    totalInstallments: 2,
    status: "active_recovery",
    doctorName: "Dr. Ritu Agarwal",
    doctorRecommendedFee: 24999,
    doctorNotes: "3-Month Core protocol confirmed. Phase 2 installment due.",
    transactions: [
      {
        id: "tx-1",
        invoiceNumber: "INV-2026-0810",
        date: "2026-08-10T11:00:00Z",
        amount: 2499,
        mode: "upi",
        status: "settled",
        reference: "UPI/2390149019",
      },
      {
        id: "tx-2",
        invoiceNumber: "INV-2026-0815",
        date: "2026-08-15T15:45:00Z",
        amount: 7501,
        mode: "cash",
        status: "settled",
        reference: "REC-CSH-881290",
      },
    ],
    installmentSchedule: [
      { phase: 1, amount: 10000, dueDate: "Paid Aug 15", status: "paid" },
      { phase: 2, amount: 14999, dueDate: "3 Days Overdue", status: "due" },
    ],
  },
}

export default function PaymentRecoveryPatientDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id ? decodeURIComponent(params.id) : "REC-201"

  const defaultData: PatientPaymentDetail = MOCK_PATIENT_DETAILS[id] || {
    ...MOCK_PATIENT_DETAILS["REC-201"],
    id,
    name: "Patient " + id,
  }

  const [patient, setPatient] = React.useState<PatientPaymentDetail>(defaultData)
  const [isMappingModalOpen, setIsMappingModalOpen] = React.useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false)

  const handleProgramMapping = (_id: string, result: ProgramMappingResult) => {
    setPatient((prev) => ({
      ...prev,
      programName: result.programName,
      totalPlanValue: result.totalFee,
      pendingBalance: result.netBalanceDue,
      status: "active_recovery",
      installmentSchedule: result.installmentSchedule.map((s) => ({
        phase: s.installmentNum,
        amount: s.amount,
        dueDate: s.dueDays === 0 ? "Due Now" : `In ${s.dueDays} Days`,
        status: s.dueDays === 0 ? "due" : "upcoming",
      })),
    }))
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
      }
    })
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
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
              <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
                {patient.id}
              </Badge>
              {patient.status === "pending_program_mapping" ? (
                <Badge className="bg-amber-100 text-amber-900 font-bold text-xs">
                  Pending Program Mapping
                </Badge>
              ) : patient.status === "paid" ? (
                <Badge className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Fully Settled
                </Badge>
              ) : (
                <Badge className="bg-rose-100 text-rose-800 font-bold text-xs">
                  Active Installment Recovery
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

          {patient.status === "pending_program_mapping" ? (
            <Button
              onClick={() => setIsMappingModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md"
            >
              <Layers className="mr-1.5 h-4 w-4" />
              Map Agreed Program
            </Button>
          ) : (
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-[#1F56A3] hover:bg-[#192B42] text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md"
            >
              <IndianRupee className="mr-1.5 h-4 w-4" />
              Pay Now / Collect Payment
            </Button>
          )}
        </div>
      </div>

      {/* Doctor Recommendation & Clinical Assessment Loop Banner */}
      {patient.doctorNotes && (
        <Card className="border border-blue-200/90 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 shadow-sm">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1F56A3]">
                <Stethoscope className="h-4 w-4" />
                <span>Doctor Assessment Recommendation · {patient.doctorName}</span>
              </div>
              <Badge className="bg-blue-100 text-[#1F56A3] font-bold text-xs">
                Token Paid: ₹{patient.enrollmentFeePaid.toLocaleString("en-IN")}
              </Badge>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{patient.doctorNotes}"
            </p>
            {patient.status === "pending_program_mapping" && (
              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900">
                  Action required: Reconcile ₹2,499 token and confirm program choice with patient.
                </span>
                <Button
                  size="sm"
                  onClick={() => setIsMappingModalOpen(true)}
                  className="h-8 rounded-lg bg-[#1F56A3] text-white text-xs font-bold"
                >
                  <Layers className="mr-1 h-3.5 w-3.5" />
                  Map Program Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Financial Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Program Plan Fee</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{patient.totalPlanValue.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{patient.programName}</p>
        </Card>

        <Card className="border border-slate-200/80 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Initial Token Credited</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{patient.enrollmentFeePaid.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Deducted from program total</p>
        </Card>

        <Card className="border border-slate-200/80 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Amount Paid So Far</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">₹{patient.amountPaidSoFar.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-blue-700 font-medium mt-0.5">Phase {patient.installmentNumber - 1} cleared</p>
        </Card>

        <Card className="border border-slate-200/80 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Net Balance for Recovery</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">₹{patient.pendingBalance.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">
            {patient.pendingBalance <= 0 ? "Fully Paid" : "Recovery Active"}
          </p>
        </Card>
      </div>

      {/* Main Content: Installment Timeline & Invoices */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Installment Schedule (1 Col) */}
        <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm rounded-2xl">
          <CardHeader className="p-5 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#1F56A3]" />
              Installment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {patient.installmentSchedule.map((inst) => (
              <div
                key={inst.phase}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Phase {inst.phase}</p>
                  <p className="text-[11px] text-slate-500">{inst.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">₹{inst.amount.toLocaleString("en-IN")}</p>
                  {inst.status === "paid" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-bold">Paid</Badge>
                  ) : inst.status === "due" ? (
                    <Badge className="bg-rose-100 text-rose-800 text-[9px] font-bold">Due Now</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 text-[9px]">Upcoming</Badge>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-3">
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full h-9 rounded-xl bg-[#1F56A3] hover:bg-[#192B42] text-white text-xs font-bold"
              >
                <IndianRupee className="mr-1.5 h-3.5 w-3.5" />
                Collect Next Installment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Invoices & Ledger (2 Cols) */}
        <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm rounded-2xl lg:col-span-2">
          <CardHeader className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-600" />
                  Transaction Invoices & Receipts
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Complete ledger of payments made via Cash, UPI, and Razorpay links
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsPaymentModalOpen(true)}
                className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                + Record New Payment
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="text-xs font-bold text-slate-700">Invoice Number</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Date</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Mode & Reference</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Amount Paid</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 text-right">Receipt PDF</TableHead>
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
                      <div className="flex items-center gap-1.5">
                        {tx.mode === "cash" ? (
                          <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                        ) : tx.mode === "upi" ? (
                          <QrCode className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <Send className="h-3.5 w-3.5 text-purple-600" />
                        )}
                        <span className="text-xs font-bold text-slate-800 uppercase">
                          {tx.mode.replace(/_/g, " ")}
                        </span>
                      </div>
                      {tx.reference && (
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.reference}</p>
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
                          toast.success(`Receipt ${tx.invoiceNumber} downloaded`, {
                            description: `PDF invoice for ₹${tx.amount.toLocaleString("en-IN")} (${tx.mode.toUpperCase()}) saved.`,
                          })
                        }
                        className="h-8 text-xs font-semibold rounded-lg gap-1"
                      >
                        <Download className="h-3.5 w-3.5 text-slate-600" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ProgramMappingModal
        open={isMappingModalOpen}
        onOpenChange={setIsMappingModalOpen}
        patientId={patient.id}
        patientName={patient.name}
        doctorName={patient.doctorName}
        doctorRecommendation={{
          program: patient.programName,
          fee: patient.totalPlanValue,
          notes: patient.doctorNotes,
        }}
        enrollmentFeePaid={patient.enrollmentFeePaid}
        onConfirm={handleProgramMapping}
      />

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
        installmentNumber={patient.installmentNumber}
        transactions={patient.transactions}
        onPaymentSuccess={handleRecordPayment}
      />
    </div>
  )
}
