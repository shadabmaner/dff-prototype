"use client"

import {
  IndianRupee,
  RotateCcw,
  CalendarClock,
  TrendingUp,
  ChevronRight,
  CreditCard,
  Wallet,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Copy,
  ReceiptText,
  PieChart as PieChartIcon,
  BarChart3,
  Banknote,
  AlertTriangle,
  LayoutGrid,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { toast } from "sonner"

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const revenueTimeline = [
  { month: "Oct", revenue: 82000,  refunds: 3200, net: 78800  },
  { month: "Nov", revenue: 94000,  refunds: 2800, net: 91200  },
  { month: "Dec", revenue: 88000,  refunds: 4100, net: 83900  },
  { month: "Jan", revenue: 112000, refunds: 1900, net: 110100 },
  { month: "Feb", revenue: 127000, refunds: 3500, net: 123500 },
  { month: "Mar", revenue: 143000, refunds: 2700, net: 140300 },
]

const programRevenue = [
  { name: "Diabetes Reversal", value: 42, color: "#3b82f6" },
  { name: "Weight Management", value: 28, color: "#10b981" },
  { name: "Thyroid Care",      value: 18, color: "#8b5cf6" },
  { name: "PCOS Management",   value: 8,  color: "#f43f5e" },
  { name: "Other",             value: 4,  color: "#f59e0b" },
]

const modeBreakdown = [
  { mode: "UPI",         amount: 68000 },
  { mode: "Card",        amount: 42000 },
  { mode: "Net Banking", amount: 21000 },
  { mode: "Cash",        amount: 9000  },
  { mode: "Wallet",      amount: 3000  },
]

const programCollections = [
  { name: "Diabetes Reversal B1", patients: 28, collected: 196000, pending: 12000, program: "Diabetes" },
  { name: "Weight Management W3", patients: 32, collected: 144000, pending: 8000,  program: "Obesity"  },
  { name: "Thyroid Care T2",      patients: 24, collected: 96000,  pending: 6500,  program: "Thyroid"  },
]

type TxStatus = "success" | "pending" | "failed" | "refunded"
type PayMode  = "UPI" | "Card" | "Net Banking" | "Cash" | "Wallet"

interface Tx {
  id: string; patient: string; program: string
  amount: number; mode: PayMode; status: TxStatus; date: string
}

const recentTx: Tx[] = [
  { id: "TXN-001ABC", patient: "Priya Sharma", program: "Weight Management", amount: 7500,  mode: "UPI",         status: "success",  date: "Today, 10:30 AM" },
  { id: "TXN-002DEF", patient: "Arjun Mehta",  program: "Diabetes Reversal", amount: 14000, mode: "Card",        status: "pending",  date: "Today, 09:15 AM" },
  { id: "TXN-003GHI", patient: "Sunita Rao",   program: "PCOS Management",   amount: 8500,  mode: "Net Banking", status: "success",  date: "Yesterday"       },
  { id: "TXN-004JKL", patient: "Ravi Kumar",   program: "Weight Management", amount: 3000,  mode: "Cash",        status: "failed",   date: "Yesterday"       },
  { id: "TXN-005MNO", patient: "Deepika Nair", program: "Thyroid Care",      amount: 12000, mode: "UPI",         status: "refunded", date: "18 Mar"          },
]

const installmentsDue = [
  { patient: "Nikhil Pandey", program: "Diabetes Reversal", amount: 4667, dueIn: "Today"    },
  { patient: "Kavya Reddy",   program: "PCOS Management",   amount: 2833, dueIn: "Tomorrow" },
  { patient: "Meera Iyer",    program: "Thyroid Care",      amount: 4000, dueIn: "2 days"   },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const statusCfg: Record<TxStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  success:  { label: "Success",  cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
  pending:  { label: "Pending",  cls: "bg-amber-50 text-amber-700 border border-amber-200",       icon: <Clock className="h-3 w-3" /> },
  failed:   { label: "Failed",   cls: "bg-rose-50 text-rose-700 border border-rose-200",           icon: <XCircle className="h-3 w-3" /> },
  refunded: { label: "Refunded", cls: "bg-slate-50 text-slate-600 border border-slate-200",        icon: <RefreshCw className="h-3 w-3" /> },
}

const modeIcon: Record<PayMode, React.ReactNode> = {
  UPI:           <span className="text-[10px] font-bold text-violet-700 bg-violet-100 rounded px-1.5 py-0.5">UPI</span>,
  Card:          <CreditCard className="h-3.5 w-3.5 text-blue-600" />,
  "Net Banking": <span className="text-[10px] font-bold text-sky-700 bg-sky-100 rounded px-1.5 py-0.5">NB</span>,
  Cash:          <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />,
  Wallet:        <Wallet className="h-3.5 w-3.5 text-orange-500" />,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinanceDashboard() {
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Clinic Portal / Finance Overview</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Finance Dashboard</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Track revenue, monitor installments, and manage program payment health across all patients.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Revenue (Mar)</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">₹1,43,000</p>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                  <p className="text-xs text-emerald-700 font-medium">+12.6% vs Feb</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Net Collected</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">₹1,40,300</p>
                <p className="text-xs text-emerald-700/80 font-medium">After refunds & fees</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Banknote className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Pending</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">₹23,500</p>
                <p className="text-xs text-amber-700/80 font-medium">Awaiting confirmation</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CalendarClock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">Refunds (Mar)</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">₹2,700</p>
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3 text-emerald-600" />
                  <p className="text-xs text-emerald-700 font-medium">−22.8% vs Feb</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <RotateCcw className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Revenue Trend + Program Distribution ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Revenue Trend (6 Months)</h2>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-emerald-300 text-emerald-700 bg-emerald-50">
                +74.4% 6M Growth
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTimeline}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                          <p className="text-xs font-semibold text-slate-700 mb-2">{d.month}</p>
                          <p className="text-sm font-bold text-blue-600">Gross: {fmt(d.revenue)}</p>
                          <p className="text-sm font-bold text-emerald-600">Net: {fmt(d.net)}</p>
                          <p className="text-xs text-rose-500 mt-1">Refunds: {fmt(d.refunds)}</p>
                        </div>
                      )
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#gradRevenue)" />
                  <Area type="monotone" dataKey="net"     stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gradNet)" strokeDasharray="5 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4 px-1">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-5 rounded-full bg-blue-500" />
                <p className="text-xs font-medium text-slate-600">Gross Revenue</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-5 rounded-full bg-emerald-500" />
                <p className="text-xs font-medium text-slate-600">Net Collected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Revenue by Program</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[220px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={programRevenue} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {programRevenue.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                          <p className="text-xs font-semibold text-slate-700 mb-1">{payload[0].name}</p>
                          <p className="text-sm font-bold text-slate-900">{payload[0].value}%</p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-6">
              {programRevenue.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <p className="text-xs font-medium text-slate-600">{p.name}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{p.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Program Collection Matrix + Installments Due ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Program Collection Matrix</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {programCollections.map((prog) => (
                <div key={prog.name} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs",
                      prog.program === "Diabetes" ? "bg-gradient-to-br from-blue-100 to-indigo-50 border-blue-200 text-blue-700" :
                      prog.program === "Obesity"  ? "bg-gradient-to-br from-emerald-100 to-teal-50 border-emerald-200 text-emerald-700" :
                                                    "bg-gradient-to-br from-purple-100 to-violet-50 border-purple-200 text-purple-700"
                    )}>
                      {prog.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{prog.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{prog.patients} Patients · {prog.program} Program</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Collected</p>
                      <p className="text-sm font-bold text-slate-900">{fmt(prog.collected)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Pending</p>
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                        {fmt(prog.pending)}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Installments Due</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {installmentsDue.map((inst) => (
                <div key={inst.patient} className="relative flex items-start gap-3">
                  <div className={cn(
                    "mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0",
                    inst.dueIn === "Today"    ? "bg-rose-500" :
                    inst.dueIn === "Tomorrow" ? "bg-amber-500" : "bg-slate-400"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{inst.patient}</p>
                      <span className="text-sm font-bold text-slate-900">{fmt(inst.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-600">{inst.program}</p>
                      <Badge className={cn(
                        "text-[10px] font-semibold px-2 py-0.5",
                        inst.dueIn === "Today"    ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        inst.dueIn === "Tomorrow" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                    "bg-slate-50 text-slate-600 border border-slate-200"
                      )}>
                        Due {inst.dueIn}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6 h-11 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg">
              Send Payment Reminders
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* ── Recent Transactions + Mode Breakdown ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentTx.map((tx) => {
                const s = statusCfg[tx.status]
                return (
                  <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white text-xs font-bold">
                          {tx.patient.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{tx.patient}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{tx.program} · {tx.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="flex items-center gap-1.5">
                        {modeIcon[tx.mode]}
                        <span className="text-xs text-slate-600 font-medium hidden sm:block">{tx.mode}</span>
                      </div>
                      <p className="font-bold text-slate-900 w-20 text-right">{fmt(tx.amount)}</p>
                      <Badge className={`text-xs font-medium px-2.5 py-1 flex items-center gap-1.5 ${s.cls}`}>
                        {s.icon}{s.label}
                      </Badge>
                      <button
                        onClick={() => { navigator.clipboard.writeText(tx.id); toast.success("Copied!") }}
                        className="text-slate-400 hover:text-slate-700 transition-colors hidden md:block"
                        title={tx.id}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Collections by Mode</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[220px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modeBreakdown} barCategoryGap="38%" layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#475569" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="mode" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} width={76} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-200">
                          <p className="text-xs font-semibold text-slate-700">{payload[0].payload.mode}</p>
                          <p className="text-sm font-bold text-blue-600">{fmt(payload[0].value as number)}</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {modeBreakdown.map((_, i) => (
                      <Cell key={i} fill={["#3b82f6","#10b981","#8b5cf6","#f59e0b","#f43f5e"][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-5">
              {modeBreakdown.map((m, i) => (
                <div key={m.mode} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ["#3b82f6","#10b981","#8b5cf6","#f59e0b","#f43f5e"][i] }} />
                    <p className="text-xs font-medium text-slate-600">{m.mode}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{fmt(m.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}