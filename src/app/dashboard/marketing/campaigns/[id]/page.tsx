"use client"

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    Edit,
    Copy,
    Megaphone,
    Globe,
    Target,
    Users,
    BarChart3,
    ExternalLink,
    Facebook,
    Instagram,
    Search as SearchIcon,
    Zap,
    RefreshCcw,
    TrendingUp,
    Download
} from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProgramBadge } from '@/components/shared/ProgramBadge';

// Mock data (keep existing mock data)
const mockCampaigns = [
    {
        id: 'camp1',
        title: 'Diabetes Awareness Campaign',
        code: 'DIA-2024-001',
        status: 'active',
        specialty: 'diabetes',
        source: 'facebook',
        startDate: subDays(new Date(), 30),
        endDate: addDays(new Date(), 30),
        budget: 50000,
        assignedVendor: 'Digital Marketing Agency',
        geography: 'All India',
        language: 'English',
        description: 'Comprehensive diabetes awareness campaign targeting urban and semi-urban areas. Focuses on preventative care and early screening.',
        createdBy: 'Marketing Manager',
        createdAt: subDays(new Date(), 35),
        modifiedBy: 'Marketing Manager',
        modifiedAt: subDays(new Date(), 10),
        leadCount: 125,
        conversionRate: 12.5,
        url: 'https://vita.health/registration?campaign=DIA-2024-001&source=facebook',
        shortLink: 'vh.fit/dia-aw-01',
        clickCount: 850,
        conversionCount: 106,
    },
];

export default function CampaignDetails() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Find campaign (mock)
    const campaign = mockCampaigns.find(c => c.id === id) || mockCampaigns[0];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

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
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="h-10 w-10 rounded-full bg-white/5 text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">SYSTEM DETAILS</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.push('/dashboard/marketing/campaigns/new')} size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest px-4 transition-all">
                                <Edit className="mr-2 h-3.5 w-3.5" /> Modify Blueprint
                            </Button>
                            <Button size="sm" className="h-9 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 text-[9px] font-black uppercase tracking-widest px-5 transition-all hover:scale-105 active:scale-95">
                                <TrendingUp className="mr-2 h-3.5 w-3.5" /> Live Metrics
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-0.5 rounded-full bg-blue-500" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Clinical Campaign Telemetry</p>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            {campaign.title.split(' ')[0]} <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">{campaign.title.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <Badge className="bg-blue-600 text-white border-none py-1 px-4 rounded-full text-[9px] font-black uppercase tracking-widest">
                                {campaign.status}
                            </Badge>
                            <ProgramBadge program={campaign.specialty} size="sm" className="bg-white/5 text-white border-white/10" />
                            <span className="text-white/20 font-mono text-xs font-bold">{campaign.code}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1">
                {/* Main Intel */}
                <Card className="lg:col-span-2 fresh-card-alt border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden p-0">
                    <div className="p-10 border-b border-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Megaphone className="w-40 h-40" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Strategic Analysis</p>
                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic max-w-2xl italic">
                                "{campaign.description}"
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-50/30">
                        {[
                            { label: "Total Yield", value: campaign.leadCount, icon: Users, color: "text-blue-500" },
                            { label: "Web Nodes", value: campaign.clickCount, icon: Globe, color: "text-indigo-500" },
                            { label: "Conversions", value: campaign.conversionCount, icon: Target, color: "text-emerald-500" },
                            { label: "Velocity", value: `${campaign.conversionRate}%`, icon: BarChart3, color: "text-amber-500" }
                        ].map((stat, i) => (
                            <div key={i} className="p-8 border-r last:border-r-0 border-slate-100 group hover:bg-white transition-all">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                <div className="flex items-center gap-2">
                                    <stat.icon className={cn("w-4 h-4 opacity-20", stat.color)} />
                                    <p className="text-2xl font-black italic tracking-tighter text-slate-900 leading-none">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Node Context */}
                <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] bg-white flex flex-col justify-center text-center p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                        {campaign.source === 'facebook' && <Facebook className="w-40 h-40" />}
                        {campaign.source === 'instagram' && <Instagram className="w-40 h-40" />}
                        {campaign.source === 'google' && <SearchIcon className="w-40 h-40" />}
                    </div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                            {campaign.source === 'facebook' && <Facebook className="w-6 h-6" />}
                            {campaign.source === 'instagram' && <Instagram className="w-6 h-6" />}
                            {campaign.source === 'google' && <SearchIcon className="w-6 h-6" />}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Operational Node</p>
                        <p className="text-3xl font-black italic uppercase tracking-tighter text-slate-950">{campaign.source}</p>
                        <Badge variant="outline" className="mt-8 border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-widest px-4 py-2 rounded-full">
                            {campaign.assignedVendor || 'Internal Desk'}
                        </Badge>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                {/* Tracking Links */}
                <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/10">
                        <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-900 italic flex items-center gap-3">
                            <Globe className="w-4 h-4 text-blue-500" />
                            Clinical Linkages Axis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Deployment URL</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-mono font-bold text-slate-500 truncate">
                                    {campaign.url}
                                </div>
                                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-300 border border-slate-100" onClick={() => copyToClipboard(campaign.url)}>
                                    <Copy className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Smart Hub Shortlink</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-blue-600/5 border border-blue-600/10 rounded-2xl px-5 py-4 text-xl font-black italic text-blue-600 shadow-inner">
                                    {campaign.shortLink}
                                </div>
                                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-blue-600/5 hover:bg-blue-600/10 text-blue-600 border border-blue-600/10 shadow-sm" onClick={() => copyToClipboard(campaign.shortLink)}>
                                    <Copy className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Campaign Config */}
                <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/10">
                        <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-900 italic flex items-center gap-3">
                            <Target className="w-4 h-4 text-indigo-500" />
                            Target Matrix Vectors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 font-bold italic">
                        <div className="grid grid-cols-2 gap-y-10 gap-x-8">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Jurisdiction</p>
                                <p className="text-xl font-black italic text-slate-900 leading-none">{campaign.geography}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Linguistic Hub</p>
                                <p className="text-xl font-black italic text-slate-900 leading-none">{campaign.language}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Epoch Start</p>
                                <p className="text-xl font-black italic text-slate-900 leading-none">{format(campaign.startDate, 'MMM d, yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Epoch Termination</p>
                                <p className="text-xl font-black italic text-slate-900 leading-none">{format(campaign.endDate, 'MMM d, yyyy')}</p>
                            </div>
                            <div className="col-span-2 pt-10 border-t border-slate-50 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Allocated Resources</p>
                                    <p className="text-3xl font-black italic text-slate-950 tabular-nums">₹{campaign.budget.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Yield Velocity ROI</p>
                                    <p className="text-3xl font-black italic text-emerald-600 tabular-nums leading-none">3.4x</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
