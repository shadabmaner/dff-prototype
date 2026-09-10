"use client"

import * as React from "react"
import Link from "next/link"
import {
  IndianRupee,
  Zap,
  Users,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  ExternalLink,
  CreditCard,
  Send,
  Calendar,
  AlertCircle,
} from "lucide-react"

import { useTelecallers } from "@/hooks/use-telecallers"
import { AutoAssignQuantityModal } from "@/components/sales/auto-assign-quantity-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface RecoveryPatient {
  id: string
  name: string
  phone: string
  email: string
  specialty: string
  totalPlanValue: number
  amountPaidSoFar: number
  installmentNumber: number
  totalInstallments: number
  pendingBalance: number
  dueDate: string
  overdueDays: number
  recoveryStatus: "overdue" | "due_soon" | "follow_up" | "recovered"
  assignedRecoveryCaller?: string
  lastContactedAt?: string
}

const MOCK_RECOVERY_PATIENTS: RecoveryPatient[] = [
  {
    id: "REC-201",
    name: "Vikram Singhania",
    phone: "+91 98210 99823",
    email: "vikram.s@example.com",
    specialty: "Diabetes Free Forever",
    totalPlanValue: 24999,
    amountPaidSoFar: 10000,
    installmentNumber: 2,
    totalInstallments: 3,
    pendingBalance: 14999,
    dueDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    overdueDays: 5,
    recoveryStatus: "overdue",
    assignedRecoveryCaller: "Rohan Varma",
    lastContactedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "REC-202",
    name: "Anita Saxena",
    phone: "+91 98190 45612",
    email: "anita.saxena@example.com",
    specialty: "Weight Management",
    totalPlanValue: 18999,
    amountPaidSoFar: 6000,
    installmentNumber: 2,
    totalInstallments: 3,
    pendingBalance: 12999,
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    overdueDays: 2,
    recoveryStatus: "overdue",
    assignedRecoveryCaller: undefined,
  },
  {
    id: "REC-203",
    name: "Rajesh Kulkarni",
    phone: "+91 98401 23456",
    email: "rajesh.k@example.com",
    specialty: "Diabetes Free Forever",
    totalPlanValue: 24999,
    amountPaidSoFar: 16500,
    installmentNumber: 3,
    totalInstallments: 3,
    pendingBalance: 8499,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    overdueDays: 0,
    recoveryStatus: "due_soon",
    assignedRecoveryCaller: "Rohan Varma",
    lastContactedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "REC-204",
    name: "Sunil Joshi",
    phone: "+91 98700 88712",
    email: "sunil.joshi@example.com",
    specialty: "Hypertension Control",
    totalPlanValue: 14999,
    amountPaidSoFar: 5000,
    installmentNumber: 2,
    totalInstallments: 3,
    pendingBalance: 9999,
    dueDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    overdueDays: 12,
    recoveryStatus: "overdue",
    assignedRecoveryCaller: undefined,
  },
  {
    id: "REC-205",
    name: "Preeti Mahajan",
    phone: "+91 98320 67123",
    email: "preeti.m@example.com",
    specialty: "PCOS Care",
    totalPlanValue: 21999,
    amountPaidSoFar: 14000,
    installmentNumber: 3,
    totalInstallments: 3,
    pendingBalance: 7999,
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    overdueDays: 0,
    recoveryStatus: "follow_up",
    assignedRecoveryCaller: "Sneha Nair",
    lastContactedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "REC-206",
    name: "Mahesh Dandekar",
    phone: "+91 98811 55432",
    email: "mahesh.d@example.com",
    specialty: "Diabetes Free Forever",
    totalPlanValue: 24999,
    amountPaidSoFar: 10000,
    installmentNumber: 2,
    totalInstallments: 3,
    pendingBalance: 14999,
    dueDate: new Date(Date.now() - 86400000 * 8).toISOString(),
    overdueDays: 8,
    recoveryStatus: "overdue",
    assignedRecoveryCaller: undefined,
  },
]

export default function PaymentRecoveryPage() {
  const [patients, setPatients] = React.useState<RecoveryPatient[]>(MOCK_RECOVERY_PATIENTS)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [pendingUnassigned, setPendingUnassigned] = React.useState(210)
  const [isAutoAssignOpen, setIsAutoAssignOpen] = React.useState(false)

  const { data: telecallers = [] } = useTelecallers()
  const recoveryTelecallers = React.useMemo(() => {
    const list = telecallers.filter((tc) => (tc.roleSpecialization || "payment_recovery") === "payment_recovery")
    return list.length > 0 ? list : telecallers
  }, [telecallers])

  const filteredPatients = React.useMemo(() => {
    return patients.filter((p) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "unassigned"
            ? !p.assignedRecoveryCaller
            : p.recoveryStatus === statusFilter

      const term = search.trim().toLowerCase()
      const matchesSearch = term
        ? [p.name, p.phone, p.email, p.specialty]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(term))
        : true

      return matchesStatus && matchesSearch
    })
  }, [patients, search, statusFilter])

  const handleSendPaymentLink = (patient: RecoveryPatient) => {
    toast.success(`Payment link for ₹${patient.pendingBalance.toLocaleString("en-IN")} sent to ${patient.name} via SMS & WhatsApp!`)
  }

  const handleAutoAssign = async (quantity: number, selectedCallerIds: string[]) => {
    setPendingUnassigned((prev) => Math.max(0, prev - quantity))
    const callers = recoveryTelecallers.filter((c) => selectedCallerIds.includes(c.id))
    if (!callers.length) return

    setPatients((prev) => {
      let idx = 0
      return prev.map((item) => {
        if (!item.assignedRecoveryCaller) {
          const caller = callers[idx % callers.length]
          idx += 1
          return {
            ...item,
            assignedRecoveryCaller: caller.name || "Recovery Specialist",
          }
        }
        return item
      })
    })
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Payment Recovery Management
              </h1>
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 font-bold text-xs py-0.5">
                Installment Follow-ups
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Active patient installments, overdue balances, and automated FIFO recovery telecaller assignments
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsAutoAssignOpen(true)}
              className="bg-[#1F56A3] hover:bg-[#192B42] text-white font-bold h-11 px-5 rounded-2xl shadow-lg shadow-[#1F56A3]/20"
            >
              <Zap className="mr-2 h-4 w-4 text-[#FFC20E] fill-[#FFC20E]" />
              Auto Assignment ({pendingUnassigned} Pending)
            </Button>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Installments</p>
              <p className="text-2xl font-bold text-rose-700">{pendingUnassigned}</p>
              <p className="text-[11px] text-slate-500">Awaiting telecaller follow-up</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pending Recovery</p>
              <p className="text-2xl font-bold text-slate-900">₹14,80,000</p>
              <p className="text-[11px] text-amber-700 font-medium">Installment receivables</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recovered This Month</p>
              <p className="text-2xl font-bold text-emerald-700">₹6,40,000</p>
              <p className="text-[11px] text-emerald-600 font-medium">43 installments settled</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-50 text-[#1F56A3]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Recovery Callers</p>
              <p className="text-2xl font-bold text-slate-900">
                {recoveryTelecallers.filter((tc) => tc.is_active !== false).length}
              </p>
              <p className="text-[11px] text-blue-700 font-medium">Payment follow-up reps</p>
            </div>
          </div>
        </div>
      </div>

      <AutoAssignQuantityModal
        open={isAutoAssignOpen}
        onOpenChange={setIsAutoAssignOpen}
        workstreamName="Payment Recovery Queue"
        totalPendingCount={pendingUnassigned}
        telecallers={recoveryTelecallers}
        onAssign={handleAutoAssign}
      />

      {/* Main Table Card */}
      <Card className="border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden rounded-3xl">
        <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Pending Installment Records
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Patients who completed 1st installment and have subsequent pending installments
              </CardDescription>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search patient, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-xl pl-9 text-xs border-slate-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 rounded-xl text-xs w-[170px] border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="unassigned">Unassigned Only</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="due_soon">Due This Week</SelectItem>
                  <SelectItem value="follow_up">Follow-up Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-b border-slate-100">
                  <TableHead className="pl-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Patient</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Program</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Value</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Paid So Far</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Due</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Due Date</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recovery Caller</TableHead>
                  <TableHead className="pr-6 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100/60">
                      <TableCell className="pl-6">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{patient.phone}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-xs bg-slate-50 font-medium text-slate-700">
                          {patient.specialty}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-800">
                        ₹{patient.totalPlanValue.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-bold text-emerald-700">
                          ₹{patient.amountPaidSoFar.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[10px] text-slate-400">Inst. 1 of {patient.totalInstallments} paid</p>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-bold text-rose-700">
                          ₹{patient.pendingBalance.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[10px] text-slate-500">Inst. {patient.installmentNumber} of {patient.totalInstallments}</p>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {formatDate(patient.dueDate, "MMM dd, yyyy")}
                        </div>
                        {patient.overdueDays > 0 && (
                          <span className="text-[10px] font-bold text-rose-600">
                            {patient.overdueDays} days overdue
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-xs capitalize font-semibold ${
                            patient.recoveryStatus === "overdue"
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : patient.recoveryStatus === "due_soon"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                          }`}
                        >
                          {patient.recoveryStatus.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {patient.assignedRecoveryCaller ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                            <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                            {patient.assignedRecoveryCaller}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs font-semibold text-[#1F56A3] hover:bg-[#1F56A3]/10"
                            onClick={() => handleSendPaymentLink(patient)}
                            title="Send payment link via WhatsApp"
                          >
                            <Send className="mr-1 h-3 w-3" />
                            Link
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold" asChild>
                            <Link href={`/dashboard/sales/leads/${patient.id}`}>
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Details
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-sm text-slate-500">
                      No payment recovery records found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
