"use client"

import { useState } from 'react'
import { motion } from "framer-motion"
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Filter,
    Search,
    TrendingUp,
    LayoutGrid,
    ChevronRight,
    Download,
    Zap,
    Droplets,
    Dumbbell,
    Utensils,
    ArrowUpRight,
    Target,
    FlaskConical,
    Scale,
    ShieldCheck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/shared/DataTable"
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell
} from "recharts"

// Mock Compliance History Data
const complianceTimeline = [
    { date: 'Feb 01', compliance: 82, risk: 2 },
    { date: 'Feb 05', compliance: 85, risk: 1 },
    { date: 'Feb 10', compliance: 78, risk: 4 },
    { date: 'Feb 15', compliance: 88, risk: 0 },
    { date: 'Feb 20', compliance: 92, risk: 0 },
    { date: 'Feb 25', compliance: 90, risk: 1 },
    { date: 'Mar 01', compliance: 94, risk: 0 },
]

const riskNodes = [
    { id: 'P-1003', name: 'Vikram Shah', severity: 'High', reason: '3 days missed logs', program: 'Thyroid Care' },
    { id: 'P-1005', name: 'Ananya Iyer', severity: 'Medium', reason: 'Water intake < 50%', program: 'Diabetes Reversal' },
    { id: 'P-1008', name: 'Rahul Sharma', severity: 'High', reason: 'Abnormal glucose peak', program: 'Obesity Management' },
]

export default function ComplianceMonitoring() {
    const [searchTerm, setSearchTerm] = useState("");

    const riskColumns = [
        {
            key: 'profile',
            header: 'Risk Node Profile',
            render: (item: any) => (
                <div className="py-2">
                    <p className="font-extrabold text-slate-900 uppercase italic tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-black font-mono text-slate-400 mt-0.5">{item.id}</p>
                </div>
            )
        },
        {
            key: 'reason',
            header: 'Insolvency Logic',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        item.severity === 'High' ? "bg-rose-50" : "bg-amber-50"
                    )}>
                        <AlertTriangle className={cn("w-4 h-4", item.severity === 'High' ? "text-rose-500" : "text-amber-500")} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 italic uppercase italic">{item.reason}</p>
                </div>
            )
        },
        {
            key: 'severity',
            header: 'Severity Vector',
            render: (item: any) => (
                <Badge variant="outline" className={cn(
                    "text-[9px] font-black uppercase tracking-[0.2em] border-none px-3 py-1",
                    item.severity === 'High' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                )}>
                    {item.severity} SEVERITY
                </Badge>
            )
        },
        {
            key: 'actions',
            header: 'Intervention',
            render: (item: any) => (
                <Button className="h-9 px-4 rounded-xl bg-slate-950 text-white font-black uppercase text-[9px] tracking-[0.1em] shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-all italic">
                    Call Node
                    <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                </Button>
            )
        }
    ]

    return (
        <div className="space-y-6 pb-20 px-4 md:px-0 bg-slate-50/50 min-h-screen">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0c1425] p-6 md:p-10 shadow-2xl border border-white/5 mx-1">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/10 blur-[130px]" />
                    <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-emerald-500/10 blur-[130px]" />
                </div>

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 shadow-xl shadow-blue-500/25 border border-white/10">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner italic">INTELLIGENCE TERMINAL</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest px-4 transition-all italic">
                                <Download className="mr-2 h-3.5 w-3.5" /> Stability Report
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-0.5 rounded-full bg-blue-500" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Global Adherence Monitoring Axis</p>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            Compliance <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent italic">Risk Vectors</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1">
                <Card className="lg:col-span-2 fresh-card-alt border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Aggregate Compliance Velocity</h2>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] tracking-widest px-3 py-1 italic">+4.2% PROGRESSION</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={complianceTimeline}>
                                <defs>
                                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                <YAxis hide domain={[0, 110]} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10">
                                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 italic">{payload[0].payload.date}</p>
                                                    <p className="text-xl font-black text-blue-400 italic tabular-nums leading-none mb-1">{payload[0].value}%</p>
                                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Global Adherence</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area type="monotone" dataKey="compliance" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorComp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] bg-slate-950 p-10 overflow-hidden relative group">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 right-0 p-10 opacity-5 grayscale group-hover:scale-125 transition-transform duration-1000">
                            <AlertTriangle className="w-40 h-40" />
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="h-12 w-12 rounded-[1.25rem] bg-rose-500 flex items-center justify-center mb-8 shadow-xl shadow-rose-500/20">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 italic">Urgent Intervention Logic</p>
                            <h2 className="text-3xl font-black italic text-white leading-tight uppercase">High Severity Risk Nodes</h2>
                            <p className="text-xs font-bold text-white/40 mt-4 leading-relaxed italic">
                                The system has identified 3 nodes requiring immediate clinical review due to log insolvency or vital destabilization.
                            </p>
                        </div>
                        <Button className="w-full h-14 rounded-2xl bg-white text-rose-600 font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-white/5 hover:scale-[1.02] transition-all italic">
                            Open Intervention Queue
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Detailed Risk Stream */}
            <div className="flex items-center justify-between px-2 pt-4">
                <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-slate-400" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 italic">Insolvency Detected Nodes</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search Node UID..."
                            className="h-10 w-64 pl-10 rounded-xl border-none bg-white shadow-sm text-[12px] font-bold italic"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white mx-1">
                <CardContent className="p-0">
                    <DataTable
                        data={riskNodes}
                        columns={riskColumns}
                    />
                </CardContent>
            </Card>

            {/* Stability Components */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
                {[
                    { label: "Stability Alert Threshold", value: "< 50%", sub: "Automated trigger node", icon: Target, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Notification Velocity", value: "2.4h", sub: "Avg intervention time", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Recovery Success", value: "94%", sub: "Post-intervention lift", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" }
                ].map((m) => (
                    <Card key={m.label} className="fresh-card-alt border-none shadow-sm rounded-3xl bg-white p-8">
                        <div className="flex items-center gap-5">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", m.bg)}>
                                <m.icon className={cn("w-6 h-6", m.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{m.label}</p>
                                <p className="text-2xl font-black text-slate-900 italic leading-none">{m.value}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1">{m.sub}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
