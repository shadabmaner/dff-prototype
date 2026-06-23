"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, Column } from "@/components/service/data-table"
import { StatusBadge } from "@/components/service/status-badge"
import { StatsCard } from "@/components/service/stats-card"
import { Badge } from "@/components/ui/badge"
import { IndianRupee, CreditCard, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react"
import type { Payment } from "@/types/service"

const mockPayments: Payment[] = [
  {
    id: "PAY001",
    patientId: "PT001",
    patientName: "Rahul Kumar",
    amount: 25000,
    method: "UPI",
    status: "paid",
    transactionId: "TXN123456789",
    date: "2026-02-15T10:00:00Z",
    program: "Weight Loss"
  },
  {
    id: "PAY002",
    patientId: "PT002",
    patientName: "Priya Sharma",
    amount: 30000,
    method: "Razorpay",
    status: "paid",
    transactionId: "TXN987654321",
    date: "2026-02-20T11:30:00Z",
    program: "Diabetes Care"
  },
  {
    id: "PAY003",
    patientId: "PT003",
    patientName: "Amit Verma",
    amount: 20000,
    method: "PhonePe",
    status: "pending",
    date: "2026-03-10T09:00:00Z",
    program: "PCOS Management"
  },
  {
    id: "PAY004",
    patientId: "PT004",
    patientName: "Sneha Patel",
    amount: 15000,
    method: "GooglePay",
    status: "failed",
    date: "2026-03-11T14:20:00Z",
    program: "Fitness"
  }
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [filterMethod, setFilterMethod] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      UPI: "bg-purple-50 text-purple-700 border-purple-200",
      Razorpay: "bg-blue-50 text-blue-700 border-blue-200",
      PhonePe: "bg-indigo-50 text-indigo-700 border-indigo-200",
      GooglePay: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Cash: "bg-slate-50 text-slate-700 border-slate-200"
    }
    return colors[method] || "bg-slate-50 text-slate-700 border-slate-200"
  }

  const columns: Column<Payment>[] = [
    {
      header: "Payment ID",
      accessorKey: "id",
    },
    {
      header: "Patient",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.patientName}</p>
          <p className="text-xs text-slate-500">{row.patientId}</p>
        </div>
      ),
    },
    {
      header: "Program",
      cell: (row) => (
        <p className="text-sm text-slate-700">{row.program || "N/A"}</p>
      ),
    },
    {
      header: "Amount",
      cell: (row) => (
        <p className="text-lg font-bold text-slate-900">₹{row.amount.toLocaleString()}</p>
      ),
    },
    {
      header: "Method",
      cell: (row) => (
        <Badge className={getMethodBadge(row.method)}>
          {row.method}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} type="payment" />,
    },
    {
      header: "Transaction ID",
      cell: (row) => (
        <p className="text-xs text-slate-600 font-mono">{row.transactionId || "N/A"}</p>
      ),
    },
    {
      header: "Date",
      cell: (row) => (
        <div>
          <p className="text-sm text-slate-900">{new Date(row.date).toLocaleDateString()}</p>
          <p className="text-xs text-slate-500">{new Date(row.date).toLocaleTimeString()}</p>
        </div>
      ),
    },
  ]

  const filteredPayments = payments.filter(payment => {
    const methodMatch = filterMethod === "all" || payment.method === filterMethod
    const statusMatch = filterStatus === "all" || payment.status === filterStatus
    return methodMatch && statusMatch
  })

  const totalRevenue = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Payments
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Payment Management
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Track and manage all patient payments
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`₹${(totalRevenue / 1000).toFixed(0)}K`}
          subtitle="Successful payments"
          icon={IndianRupee}
          colorScheme="emerald"
          trend={{ value: "+15%", positive: true }}
        />
        <StatsCard
          title="Pending Amount"
          value={`₹${(pendingAmount / 1000).toFixed(0)}K`}
          subtitle="Awaiting payment"
          icon={AlertTriangle}
          colorScheme="amber"
        />
        <StatsCard
          title="Total Transactions"
          value={payments.length.toString()}
          subtitle="All payments"
          icon={CreditCard}
          colorScheme="blue"
        />
        <StatsCard
          title="Success Rate"
          value="87%"
          subtitle="Payment completion"
          icon={CheckCircle2}
          colorScheme="purple"
        />
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Payment Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Razorpay">Razorpay</SelectItem>
                  <SelectItem value="PhonePe">PhonePe</SelectItem>
                  <SelectItem value="GooglePay">Google Pay</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable
            data={filteredPayments}
            columns={columns}
            searchPlaceholder="Search payments by patient, ID, or transaction..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
