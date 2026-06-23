"use client"

import { useRouter } from "next/navigation"
import { usePharmacy } from "@/components/pharmacy/pharmacy-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Pill, Package, Truck, Activity, RefreshCw, Box, ClipboardCheck, PieChart as PieChartIcon, BarChart3, FileText, IndianRupee, Clock, AlertCircle, CheckCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const categoryColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#06b6d4"]

export default function PharmacyDashboardPage() {
  const router = useRouter()
  const { prescriptions } = usePharmacy()

  const newPrescriptions = prescriptions.filter((p) => p.status === "NEW_PRESCRIPTION_RECEIVED").length
  const underReview = prescriptions.filter((p) => p.status === "UNDER_REVIEW").length
  const medicinesPacked = prescriptions.filter((p) => p.status === "MEDICINES_PACKED").length
  const paymentPending = prescriptions.filter((p) => p.status === "PAYMENT_PENDING").length
  const readyForDispatch = prescriptions.filter((p) => p.status === "READY_FOR_DISPATCH").length
  const dispatched = prescriptions.filter((p) => p.status === "DISPATCHED").length
  const delivered = prescriptions.filter((p) => p.status === "DELIVERED").length

  const totalRevenue = prescriptions
    .filter((p) => p.invoice?.status === "PAID")
    .reduce((sum, p) => sum + (p.invoice?.totalAmount || 0), 0)

  const pendingRevenue = prescriptions
    .filter((p) => p.invoice?.status === "PENDING")
    .reduce((sum, p) => sum + (p.invoice?.totalAmount || 0), 0)

  const statCards = [
    {
      title: "New Prescriptions",
      value: newPrescriptions,
      subtitle: "Awaiting processing",
      icon: FileText,
      shell: "from-blue-50 to-indigo-50",
      iconShell: "from-blue-500 to-indigo-500",
      text: "text-blue-700",
      action: () => router.push("/dashboard/pharmacy/prescription-management"),
    },
    {
      title: "Under Review",
      value: underReview,
      subtitle: "Being processed",
      icon: Activity,
      shell: "from-amber-50 to-orange-50",
      iconShell: "from-amber-500 to-orange-500",
      text: "text-amber-700",
      action: () => router.push("/dashboard/pharmacy/prescription-management"),
    },
    {
      title: "Medicines Packed",
      value: medicinesPacked,
      subtitle: "Ready for billing",
      icon: Package,
      shell: "from-purple-50 to-pink-50",
      iconShell: "from-purple-500 to-pink-500",
      text: "text-purple-700",
      action: () => router.push("/dashboard/pharmacy/packing-management"),
    },
    {
      title: "Payment Pending",
      value: paymentPending,
      subtitle: "Awaiting payment",
      icon: IndianRupee,
      shell: "from-orange-50 to-red-50",
      iconShell: "from-orange-500 to-red-500",
      text: "text-orange-700",
      action: () => router.push("/dashboard/pharmacy/payment-management"),
    },
    {
      title: "Ready for Dispatch",
      value: readyForDispatch,
      subtitle: "Awaiting dispatch",
      icon: Truck,
      shell: "from-cyan-50 to-sky-50",
      iconShell: "from-cyan-500 to-sky-500",
      text: "text-cyan-700",
      action: () => router.push("/dashboard/pharmacy/dispatch-tracking"),
    },
    {
      title: "Delivered",
      value: delivered,
      subtitle: "Completed deliveries",
      icon: CheckCircle,
      shell: "from-emerald-50 to-teal-50",
      iconShell: "from-emerald-500 to-teal-500",
      text: "text-emerald-700",
      action: () => router.push("/dashboard/pharmacy/dispatch-tracking"),
    },
  ]

  const statusData = [
    { status: "New", count: newPrescriptions },
    { status: "Review", count: underReview },
    { status: "Packed", count: medicinesPacked },
    { status: "Payment", count: paymentPending },
    { status: "Ready", count: readyForDispatch },
    { status: "Dispatched", count: dispatched },
    { status: "Delivered", count: delivered },
  ]

  const categoryData = [
    { category: "Diabetes", count: 45 },
    { category: "Cardiovascular", count: 32 },
    { category: "Thyroid", count: 28 },
    { category: "Gastric", count: 22 },
    { category: "Respiratory", count: 15 },
    { category: "Others", count: 8 },
  ]

  const pendingTasks = [
    {
      id: 1,
      title: "Review new prescription RX-1001",
      description: "New prescription from Dr. Smith requires review",
      priority: "high",
      action: () => router.push("/dashboard/pharmacy/prescription-management"),
    },
    {
      id: 2,
      title: "Pack medicines for RX-1003",
      description: "All medications available, ready for packing",
      priority: "high",
      action: () => router.push("/dashboard/pharmacy/packing-management"),
    },
    {
      id: 3,
      title: "Generate invoice for RX-1003",
      description: "Medicines packed, generate invoice",
      priority: "medium",
      action: () => router.push("/dashboard/pharmacy/payment-management"),
    },
    {
      id: 4,
      title: "Dispatch prescription RX-1005",
      description: "Payment received, ready for dispatch",
      priority: "high",
      action: () => router.push("/dashboard/pharmacy/dispatch-tracking"),
    },
    {
      id: 5,
      title: "Follow up on payment RX-1004",
      description: "Invoice pending for 2 days, send reminder",
      priority: "medium",
      action: () => router.push("/dashboard/pharmacy/payment-management"),
    },
  ]

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Pharmacy Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Pharmacy <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Track prescriptions, payments, and delivery status from a single dashboard
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20 h-11 px-6 rounded-xl">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.title}
              className={`border-0 bg-gradient-to-br ${card.shell} shadow-lg hover:shadow-xl transition-all overflow-hidden group cursor-pointer`}
              onClick={card.action}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`flex items-center gap-2 mb-3 ${card.text}`}>
                      <Icon className="h-3 w-3" />
                      <p className="text-[10px] uppercase tracking-[0.15em] font-semibold">{card.title}</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-2">{card.value}</p>
                    <p className={`text-xs font-medium ${card.text}`}>{card.subtitle}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.iconShell} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden lg:col-span-2">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Prescription Status Distribution</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-blue-200 text-blue-700 bg-blue-50">
                {prescriptions.length} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1">Status: {payload[0].payload.status}</p>
                            <p className="text-sm font-bold text-blue-600">Prescriptions: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Revenue Summary</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-900">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-emerald-700">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 mt-1">Collected payments</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-900">Pending Revenue</p>
              </div>
              <p className="text-2xl font-bold text-amber-700">₹{pendingRevenue.toLocaleString()}</p>
              <p className="text-xs text-amber-600 mt-1">Awaiting payment</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Collection Rate</span>
                <span className="text-lg font-bold text-slate-900">
                  {totalRevenue + pendingRevenue > 0 ? Math.round((totalRevenue / (totalRevenue + pendingRevenue)) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Pending Tasks</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-amber-200 text-amber-700 bg-amber-50">
                {pendingTasks.length} tasks
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={task.action}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>
                      <Badge
                        className={cn(
                          "text-[10px] font-semibold",
                          task.priority === "high"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-amber-100 text-amber-700 border-amber-200"
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{task.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-slate-700" />
                <CardTitle className="text-sm font-bold text-slate-900">Medication Categories</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-emerald-200 text-emerald-700 bg-emerald-50">
                {categoryData.length} categories
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[240px] bg-gradient-to-br from-slate-50/50 to-emerald-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="count" nameKey="category" innerRadius={55} outerRadius={82} paddingAngle={4}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`${entry.category}-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1 capitalize">{String(payload[0].name)}</p>
                            <p className="text-sm font-bold text-slate-900">Prescriptions: {payload[0].value}</p>
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
              {categoryData.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-700 capitalize">{item.category}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
