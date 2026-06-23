"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, BarChart, Pie, PieChart, Cell } from "recharts"
import { usePharmacy } from "@/components/pharmacy/pharmacy-context"
import { cn } from "@/lib/utils"

const categoryColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#06b6d4"]

export default function RevenueReportsPage() {
  const { prescriptions } = usePharmacy()
  const [timeRange, setTimeRange] = useState<string>("month")
  const [reportType, setReportType] = useState<string>("overview")

  const totalRevenue = prescriptions
    .filter((p) => p.invoice?.status === "PAID")
    .reduce((sum, p) => sum + (p.invoice?.totalAmount || 0), 0)

  const pendingRevenue = prescriptions
    .filter((p) => p.invoice?.status === "PENDING")
    .reduce((sum, p) => sum + (p.invoice?.totalAmount || 0), 0)

  const totalInvoices = prescriptions.filter((p) => p.invoice !== null).length
  const paidInvoices = prescriptions.filter((p) => p.invoice?.status === "PAID").length
  const pendingInvoices = prescriptions.filter((p) => p.invoice?.status === "PENDING").length

  const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0

  const revenueData = [
    { month: "Jan", revenue: 45000, prescriptions: 45 },
    { month: "Feb", revenue: 52000, prescriptions: 52 },
    { month: "Mar", revenue: 48000, prescriptions: 48 },
    { month: "Apr", revenue: 61000, prescriptions: 61 },
    { month: "May", revenue: 58000, prescriptions: 58 },
    { month: "Jun", revenue: 67000, prescriptions: 67 },
  ]

  const categoryRevenueData = [
    { category: "Diabetes", revenue: 45000, percentage: 28 },
    { category: "Cardiovascular", revenue: 38000, percentage: 24 },
    { category: "Thyroid", revenue: 28000, percentage: 18 },
    { category: "Gastric", revenue: 22000, percentage: 14 },
    { category: "Respiratory", revenue: 18000, percentage: 11 },
    { category: "Others", revenue: 9000, percentage: 5 },
  ]

  const paymentStatusData = [
    { status: "Paid", count: paidInvoices, amount: totalRevenue },
    { status: "Pending", count: pendingInvoices, amount: pendingRevenue },
  ]

  const topMedications = [
    { name: "Metformin", revenue: 25000, prescriptions: 85 },
    { name: "Amlodipine", revenue: 18000, prescriptions: 62 },
    { name: "Insulin Glargine", revenue: 15000, prescriptions: 45 },
    { name: "Atorvastatin", revenue: 12000, prescriptions: 38 },
    { name: "Omeprazole", revenue: 10000, prescriptions: 32 },
  ]

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const exportReport = () => {
    alert("Exporting revenue report as PDF...")
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
            Revenue <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Reports</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Comprehensive revenue analytics and financial insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-11 w-40 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="h-11 px-6 rounded-xl bg-slate-900 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-emerald-600" />
                  <p className="text-xs text-emerald-600 font-medium">+12.5%</p>
                </div>
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
                <p className="text-sm text-slate-600">Pending Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">₹{pendingRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDown className="h-3 w-3 text-amber-600" />
                  <p className="text-xs text-amber-600 font-medium">-3.2%</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Invoices</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalInvoices}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-emerald-600" />
                  <p className="text-xs text-emerald-600 font-medium">+8.3%</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Collection Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{collectionRate}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-emerald-600" />
                  <p className="text-xs text-emerald-600 font-medium">+2.1%</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Revenue Trend</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-blue-200 text-blue-700 bg-blue-50">
                Last 6 months
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length && payload[0]) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1">{payload[0].payload?.month}</p>
                            <p className="text-sm font-bold text-primary">₹{(payload[0].value || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-600">{payload[0].payload?.prescriptions} prescriptions</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Revenue by Category</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryRevenueData} dataKey="revenue" nameKey="category" innerRadius={55} outerRadius={82} paddingAngle={4}>
                    {categoryRevenueData.map((entry, index) => (
                      <Cell key={`${entry.category}-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length && payload[0]) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1 capitalize">{String(payload[0].name)}</p>
                            <p className="text-sm font-bold text-primary">₹{(payload[0].value || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-600">{payload[0].payload?.percentage}% of total</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
              {categoryRevenueData.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
                    <p className="text-sm font-medium text-slate-700 capitalize">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Payment Status Distribution</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                  <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1">{payload[0].payload.status}</p>
                            <p className="text-sm font-bold text-slate-900">{payload[0].value} invoices</p>
                            <p className="text-xs text-slate-600">₹{payload[0].payload.amount.toLocaleString()}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Top Medications by Revenue</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {topMedications.map((med, index) => (
                <motion.div
                  key={med.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{med.name}</p>
                      <p className="text-xs text-slate-500">{med.prescriptions} prescriptions</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900">₹{med.revenue.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">Recent Transactions</CardTitle>
          <CardDescription>Latest paid invoices</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Invoice ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions
                  .filter((p) => p.invoice !== null)
                  .slice(0, 5)
                  .map((prescription, index) => (
                    <motion.tr
                      key={prescription.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-900">{prescription.invoice?.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-600">{prescription.patientName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-600">{prescription.invoice ? formatDate(prescription.invoice.createdAt) : "—"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-slate-900">₹{prescription.invoice?.totalAmount?.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={cn(
                            "text-xs font-semibold border",
                            prescription.invoice?.status === "PAID"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-amber-100 text-amber-700 border-amber-200"
                          )}
                        >
                          {prescription.invoice?.status}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
