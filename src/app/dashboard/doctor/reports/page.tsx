"use client"

import * as React from "react"
import { useState } from "react"
import {
    FileText,
    Search,
    Plus,
    Filter,
    Download,
    MoreHorizontal,
    ChevronRight,
    TrendingUp,
    Activity,
    Archive,
    Star,
    Clock,
    ExternalLink,
    ShieldCheck,
    Stethoscope,
    Zap,
    RefreshCcw,
    Layers,
} from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const reports = [
    {
        id: "REP-4401",
        patientName: "Aditya Sharma",
        type: "Lab Result",
        date: "2024-12-19",
        status: "Reviewed",
        findings: "Elevated HbA1c (7.2%). Fasting glucose normal.",
        priority: "High",
        doctor: "Dr. Wilson",
    },
    {
        id: "REP-4395",
        patientName: "Priya Patel",
        type: "Imaging",
        date: "2024-12-17",
        status: "Pending",
        findings: "Thyroid Ultrasound: Small nodule detected (3mm).",
        priority: "Medium",
        doctor: "Dr. Wilson",
    },
    {
        id: "REP-4382",
        patientName: "Rajesh Kumar",
        type: "Cardiology",
        date: "2024-12-15",
        status: "Reviewed",
        findings: "ECG: Normal sinus rhythm. No anomalies detected.",
        priority: "Low",
        doctor: "Dr. Wilson",
    },
    {
        id: "REP-4370",
        patientName: "Meera Desai",
        type: "Blood Panel",
        date: "2024-12-12",
        status: "Archived",
        findings: "Standard lipid profile. All values within range.",
        priority: "Low",
        doctor: "Dr. Wilson",
    },
]

export default function DoctorReportsPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredReports = reports.filter((r) =>
        r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 pb-20 px-4 md:px-0">
            {/* Premium Header Banner */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 md:p-10 shadow-2xl border border-white/5">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-primary/20 blur-[130px]" />
                    <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/10 blur-[130px]" />
                </div>

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 shadow-xl shadow-primary/25 border border-white/10">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">DIAGNOSTIC VAULT</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest px-4 transition-all" onClick={() => setSearchTerm("")}>
                                <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Re-sync Reports
                            </Button>
                            <Button size="sm" className="h-9 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 text-[9px] font-black uppercase tracking-widest px-5 transition-all hover:scale-105 active:scale-95">
                                <Plus className="mr-2 h-3.5 w-3.5" /> Upload Lab
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-0.5 rounded-full bg-primary" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Diagnostic Intelligence</p>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Clinical <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent">Intelligence</span> Hub
                        </h1>
                        <p className="max-w-2xl text-sm text-slate-400 font-medium leading-relaxed">
                            Analyze diagnostic patterns, review clinical findings, and finalize medical sequences with high-fidelity visualization.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-1">
                <MetricCard label="Pending Review" value="14" icon={Clock} color="text-amber-600" bg="bg-amber-50" />
                <MetricCard label="Finalized Total" value="2,481" icon={ShieldCheck} color="text-emerald-600" bg="bg-emerald-50" />
                <MetricCard label="High Priority" value="04" icon={Activity} color="text-rose-600" bg="bg-rose-50" />
                <MetricCard label="Avg. Resolution" value="4.2h" icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" />
            </div>

            <Card className="fresh-card-alt border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-8 border-b border-slate-100/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Report Flow</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Query patient diagnostic vault signals.</CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
                            <Download className="mr-2 h-4 w-4" /> Export Bulk
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8 bg-slate-50/30">
                    <div className="relative mb-8">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                        <Input
                            placeholder="Query by patient name, encrypted ID, or diagnostic type..."
                            className="pl-11 h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-primary/20 font-medium text-sm"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {filteredReports.map((r) => (
                            <Card key={r.id} className="group fresh-card-alt border-none shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:scale-110 transition-transform">
                                                <FileText className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight italic leading-tight group-hover:text-primary transition-colors">{r.patientName}</p>
                                                <div className="flex items-center gap-2 mt-1 opacity-60">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{r.id}</span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{r.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border-none shadow-sm",
                                            r.priority === "High" ? "bg-rose-500 text-white animate-pulse" :
                                                r.priority === "Medium" ? "bg-amber-50 text-amber-600 font-black" : "bg-blue-50 text-blue-600 font-black border border-blue-100/50"
                                        )}>
                                            {r.priority} Priority
                                        </Badge>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-all duration-300 mb-8 min-h-[100px] flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-3 opacity-40">
                                            <Stethoscope className="h-4 w-4" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Clinical Findings</span>
                                        </div>
                                        <p className="text-[14px] font-bold text-slate-700 leading-relaxed italic">
                                            "{r.findings}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-none",
                                                r.status === "Reviewed" ? "bg-emerald-50 text-emerald-600" :
                                                    r.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"
                                            )}>
                                                {r.status}
                                            </Badge>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{r.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-primary transition-colors">
                                                <Star className="h-4 w-4" />
                                            </Button>
                                            <Button className="h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest bg-slate-900 text-white shadow-lg shadow-black/5 hover:scale-105 transition-all">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Review Report
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function MetricCard({
    label,
    value,
    icon: Icon,
    color,
    bg,
}: {
    label: string
    value: string
    icon: any
    color: string
    bg: string
}) {
    return (
        <Card className="group fresh-card-alt border-none shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-white">
            <CardContent className="flex items-center gap-5 p-8">
                <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", bg)}>
                    <div className={cn(color)}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
