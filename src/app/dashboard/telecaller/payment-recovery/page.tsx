"use client"

import * as React from "react"
import { IndianRupee, Layers, Receipt, CheckCircle2, Clock, AlertCircle, ArrowLeft, Search, Filter, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangeFilter, type DateRangeFilterValue } from "@/components/shared/date-range-filter"
import { ProgramMappingModal, type ProgramMappingResult } from "@/components/telecaller/program-mapping-modal"
import { CollectPaymentModal } from "@/components/telecaller/collect-payment-modal"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"

interface RecoveryItem {
  id: string
  name: string
  phone: string
  programName: string
  totalPlanValue: number
  amountPaidSoFar: number
  pendingBalance: number
  dueDate: string
  overdueDays: number
  status: "pending_program_mapping" | "active_recovery" | "paid"
  installmentNumber: number
  totalInstallments: number
  isEnrollmentTokenOnly?: boolean
  doctorName?: string
  doctorNotes?: string
}

const INITIAL_RECOVERY_QUEUE: RecoveryItem[] = [
  {
    id: "REC-201",
    name: "Vikram Malhotra",
    phone: "+91 98201 98112",
    programName: "Pending Mapping (Dr. Recommended: 50K Intensive)",
    totalPlanValue: 50000,
    amountPaidSoFar: 2499,
    pendingBalance: 47501,
    dueDate: "Immediate Mapping Required",
    overdueDays: 0,
    status: "pending_program_mapping",
    installmentNumber: 1,
    totalInstallments: 3,
    isEnrollmentTokenOnly: true,
    doctorName: "Dr. Ritu Agarwal",
    doctorNotes: "HbA1c 8.9, 12 years diabetic. Needs 6-month intensive care. Coordinate agreed program with patient.",
  },
  {
    id: "REC-202",
    name: "Deepika Rao",
    phone: "+91 98450 67341",
    programName: "Pending Mapping (Dr. Recommended: 1 Lakh VIP)",
    totalPlanValue: 100000,
    amountPaidSoFar: 2499,
    pendingBalance: 97501,
    dueDate: "Assessment Completed Today",
    overdueDays: 0,
    status: "pending_program_mapping",
    installmentNumber: 1,
    totalInstallments: 3,
    isEnrollmentTokenOnly: true,
    doctorName: "Dr. Anil Deshpande",
    doctorNotes: "Severe diabetic neuropathy. Doctor advised VIP continuous monitoring. Reconcile 2499 token.",
  },
  {
    id: "REC-203",
    name: "Rajesh Kulkarni",
    phone: "+91 98220 11984",
    programName: "Diabetes Free Forever (DFF)",
    totalPlanValue: 24999,
    amountPaidSoFar: 10000,
    pendingBalance: 14999,
    dueDate: "3 Days Overdue",
    overdueDays: 3,
    status: "active_recovery",
    installmentNumber: 2,
    totalInstallments: 2,
  },
  {
    id: "REC-204",
    name: "Smita Joshi",
    phone: "+91 98901 88722",
    programName: "DFF Intensive Care",
    totalPlanValue: 49999,
    amountPaidSoFar: 25000,
    pendingBalance: 24999,
    dueDate: "7 Days Overdue",
    overdueDays: 7,
    status: "active_recovery",
    installmentNumber: 2,
    totalInstallments: 3,
  },
  {
    id: "REC-205",
    name: "Preeti Mahajan",
    phone: "+91 98320 67123",
    programName: "PCOS Reversal Protocol",
    totalPlanValue: 21999,
    amountPaidSoFar: 14000,
    pendingBalance: 7999,
    dueDate: "Tomorrow",
    overdueDays: 0,
    status: "active_recovery",
    installmentNumber: 3,
    totalInstallments: 3,
  },
]

export default function TelecallerPaymentRecoveryPage() {
  const [items, setItems] = React.useState<RecoveryItem[]>(INITIAL_RECOVERY_QUEUE)
  const [tab, setTab] = React.useState("all")
  const [search, setSearch] = React.useState("")
  const [dateFilter, setDateFilter] = React.useState<DateRangeFilterValue>({
    preset: "last_7_days",
    label: "Last 7 Days",
  })

  const [activePatient, setActivePatient] = React.useState<RecoveryItem | null>(null)
  const [isMappingOpen, setIsMappingOpen] = React.useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false)

  const handleConfirmMapping = (patientId: string, mapping: ProgramMappingResult) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === patientId
          ? {
              ...item,
              programName: mapping.programName,
              totalPlanValue: mapping.totalFee,
              pendingBalance: mapping.netBalanceDue,
              status: "active_recovery",
              isEnrollmentTokenOnly: false,
              dueDate: "Phase 1 Due Now",
            }
          : item
      )
    )
  }

  const handleRecordPayment = (patientId: string, payment: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === patientId
          ? {
              ...item,
              amountPaidSoFar: item.amountPaidSoFar + payment.amount,
              pendingBalance: Math.max(0, item.pendingBalance - payment.amount),
              status: item.pendingBalance - payment.amount <= 0 ? "paid" : "active_recovery",
            }
          : item
      )
    )
  }

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchTab =
        tab === "all"
          ? true
          : tab === "pending_mapping"
          ? item.status === "pending_program_mapping"
          : tab === "active_recovery"
          ? item.status === "active_recovery"
          : tab === "paid"
          ? item.status === "paid"
          : true

      const term = search.trim().toLowerCase()
      const matchSearch = term
        ? item.name.toLowerCase().includes(term) || item.phone.includes(term) || item.programName.toLowerCase().includes(term)
        : true

      return matchTab && matchSearch
    })
  }, [items, tab, search])

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/telecaller">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Payment Recovery Desk
            </h1>
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
              Installment Reconciliation
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Program Mapping (Deduct ₹2,499 token) · Overdue Installments · Cash & Online Recovery
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          <TelecallerRoleHeaderBadge />
        </div>
      </div>

      {/* Main Table */}
      <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
              <TabsList className="bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="all" className="text-xs font-bold rounded-lg">
                  All ({items.length})
                </TabsTrigger>
                <TabsTrigger value="pending_mapping" className="text-xs font-bold rounded-lg">
                  Pending Mapping ({items.filter((i) => i.status === "pending_program_mapping").length})
                </TabsTrigger>
                <TabsTrigger value="active_recovery" className="text-xs font-bold rounded-lg">
                  Active Installments ({items.filter((i) => i.status === "active_recovery").length})
                </TabsTrigger>
                <TabsTrigger value="paid" className="text-xs font-bold rounded-lg">
                  Paid ({items.filter((i) => i.status === "paid").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search patient or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs rounded-xl"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="text-xs font-bold text-slate-700">Patient Details</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Program & Notes</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Amount Paid</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Pending Balance</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={
                    item.isEnrollmentTokenOnly
                      ? "bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500"
                      : "hover:bg-slate-50/60"
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <Link
                          href={`/dashboard/telecaller/payment-recovery/${item.id}`}
                          className="text-xs font-bold text-slate-900 hover:text-[#1F56A3] hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-slate-500">{item.phone} · {item.id}</p>
                      </div>
                      {item.isEnrollmentTokenOnly && (
                        <Badge className="bg-amber-100 text-amber-900 text-[9px] font-bold">
                          Token Paid ₹2,499
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-slate-800">{item.programName}</p>
                    {item.doctorNotes && (
                      <p className="text-[10px] text-slate-500 italic line-clamp-1">
                        {item.doctorName}: "{item.doctorNotes}"
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-emerald-600">
                      ₹{item.amountPaidSoFar.toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-rose-600">
                      ₹{item.pendingBalance.toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.status === "pending_program_mapping" ? (
                      <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                        Pending Program Mapping
                      </Badge>
                    ) : item.status === "paid" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Settled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 text-[10px] font-bold">
                        {item.dueDate}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/telecaller/payment-recovery/${item.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5 text-slate-500" />
                          View Details
                        </Button>
                      </Link>

                      {item.status === "pending_program_mapping" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setActivePatient(item)
                            setIsMappingOpen(true)
                          }}
                          className="h-8 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                        >
                          <Layers className="mr-1 h-3.5 w-3.5" />
                          Map Agreed Program
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setActivePatient(item)
                            setIsPaymentOpen(true)
                          }}
                          className="h-8 text-xs font-bold rounded-xl bg-[#1F56A3] hover:bg-[#192B42] text-white shadow-sm"
                        >
                          <IndianRupee className="mr-1 h-3.5 w-3.5" />
                          Pay Now / Invoices
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {activePatient && (
        <ProgramMappingModal
          open={isMappingOpen}
          onOpenChange={setIsMappingOpen}
          patientId={activePatient.id}
          patientName={activePatient.name}
          doctorName={activePatient.doctorName}
          doctorRecommendation={{
            program: activePatient.programName,
            fee: activePatient.totalPlanValue,
            notes: activePatient.doctorNotes || "Doctor recommended intensive reversal care.",
          }}
          enrollmentFeePaid={activePatient.amountPaidSoFar}
          onConfirm={handleConfirmMapping}
        />
      )}

      {activePatient && (
        <CollectPaymentModal
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
          patientId={activePatient.id}
          patientName={activePatient.name}
          patientPhone={activePatient.phone}
          programName={activePatient.programName}
          totalPlanValue={activePatient.totalPlanValue}
          amountPaidSoFar={activePatient.amountPaidSoFar}
          pendingBalance={activePatient.pendingBalance}
          installmentNumber={activePatient.installmentNumber}
          onPaymentSuccess={handleRecordPayment}
        />
      )}
    </div>
  )
}
