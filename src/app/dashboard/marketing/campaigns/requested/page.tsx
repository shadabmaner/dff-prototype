"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    Plus,
    ArrowRight,
    Clock,
    User,
    Megaphone,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    MapPin,
    Calendar,
    Languages,
    ArrowUpRight,
    Zap,
    RefreshCcw,
    ClipboardList
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/shared/DataTable';

// Mock data (keep existing mock data)
const mockRequests = [
    {
        id: 'req1',
        title: 'Diabetes Marathi Webinar',
        requestor: 'Rahul Sharma',
        department: 'Regional Desk (MH)',
        schedule: '2024-04-14T11:00:00',
        channels: ['Zoom', 'WhatsApp'],
        priority: 'High',
        language: 'Marathi',
        location: 'Maharashtra',
        status: 'pending',
        createdAt: subDays(new Date(), 1)
    },
    {
        id: 'req2',
        title: 'PCOS Awareness Insta Live',
        requestor: 'Ananya Iyer',
        department: 'Community Team',
        schedule: '2024-04-10T17:30:00',
        channels: ['Instagram Live', 'Reels'],
        priority: 'Medium',
        language: 'Hindi',
        location: 'Pan India',
        status: 'pending',
        createdAt: subDays(new Date(), 2)
    }
];

export default function RequestedCampaigns() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRequests = mockRequests.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: 'title',
            header: 'Request Intel',
            render: (item: any) => (
                <div className="py-2">
                    <p className="font-extrabold text-slate-900 uppercase italic tracking-tight">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.requestor}
                        </span>
                        <span>/</span>
                        <span className="text-blue-500/60">{item.department}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'logistics',
            header: 'Operational Epoch',
            render: (item: any) => (
                <div className="text-[11px] font-bold">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span className="tabular-nums">{format(new Date(item.schedule), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 italic font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{format(new Date(item.schedule), 'hh:mm a')}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'targeting',
            header: 'Deployment Matrix',
            render: (item: any) => (
                <div className="text-[10px] font-black uppercase tracking-tight">
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        {item.location}
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600 italic">
                        <Languages className="w-3 h-3" />
                        {item.language}
                    </div>
                </div>
            )
        },
        {
            key: 'priority',
            header: 'Priority',
            render: (item: any) => (
                <Badge
                    variant="outline"
                    className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] border-none px-3 py-1",
                        item.priority === 'High' ? "bg-rose-50 text-rose-600" :
                            item.priority === 'Medium' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                    )}
                >
                    {item.priority}
                </Badge>
            )
        },
        {
            key: 'status',
            header: 'System State',
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        item.status === 'pending' ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                        {item.status.replace('-', ' ')}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Architectural Hook',
            render: (item: any) => (
                <Button
                    variant="ghost"
                    className="h-10 px-4 rounded-xl text-blue-600 hover:bg-blue-50 font-black uppercase text-[9px] tracking-[0.1em]"
                    onClick={() => router.push(`/dashboard/marketing/campaigns/new?request_id=${item.id}&title=${encodeURIComponent(item.title)}`)}
                >
                    Launch Concept
                    <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-20 px-4 md:px-0 bg-slate-50/50 min-h-screen">
            {/* Premium Banner (Doctor Style) */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-6 md:p-10 shadow-2xl border border-white/5 mx-1">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/20 blur-[130px]" />
                    <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-indigo-500/10 blur-[130px]" />
                </div>

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/25 border border-white/10">
                                <ClipboardList className="h-5 w-5 text-white" />
                            </div>
                            <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">INTAKE STREAM</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest px-4 transition-all">
                                <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Re-sync Feed
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-0.5 rounded-full bg-blue-500" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Marketing Intake Portal</p>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Campaign <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">Inbound</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 px-1">
                {[
                    { label: "Pending Intake", value: mockRequests.filter(r => r.status === 'pending').length, sub: "Waiting for blueprint", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Under Review", value: 0, sub: "System validation", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Critical Units", value: 2, sub: "High priority status", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" }
                ].map((m) => (
                    <Card key={m.label} className="fresh-card-alt border-none shadow-sm rounded-3xl bg-white group hover:shadow-md transition-all">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", m.bg)}>
                                <m.icon className={cn("h-5 w-5", m.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{m.label}</p>
                                <p className="text-2xl font-black text-slate-900 leading-none italic">{m.value}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1">{m.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex items-center justify-between px-2 pt-4">
                <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-slate-400" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Inbound Intelligence Stream</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search Requests..."
                            className="h-9 w-64 pl-9 rounded-xl border-slate-100 bg-white text-[10px] font-bold uppercase tracking-wider"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white mx-1">
                <CardContent className="p-0">
                    <DataTable
                        data={filteredRequests}
                        columns={columns}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
