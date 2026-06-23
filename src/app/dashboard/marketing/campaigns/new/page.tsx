"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Megaphone, Globe, Target, DollarSign, Calendar, Copy, CheckCircle2, Zap, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function CreateCampaign() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<{ full: string; short: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        program: '',
        code: '',
        source: '',
        geography: '',
        language: '',
        description: '',
        budget: '',
        vendor: '',
        startDate: '',
        endDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call to generate URL
        setTimeout(() => {
            const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const code = formData.code || 'CMP';
            setGeneratedUrl({
                full: `https://vita.health/registration?campaign=${code}&source=${formData.source || 'direct'}&slug=${slug}`,
                short: `vh.fit/${slug || 'campaign'}`
            });
            setIsLoading(false);
        }, 1200);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-6 pb-20 px-4 md:px-0 bg-slate-50/50 min-h-screen">
            {/* Premium Header (Doctor Style) */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-6 md:p-10 shadow-2xl border border-white/5 mx-1">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/20 blur-[130px]" />
                    <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-indigo-500/10 blur-[130px]" />
                </div>

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="h-10 w-10 rounded-full bg-white/5 text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">DESIGN SYSTEM</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest px-4 transition-all">
                                <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Reset Form
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-0.5 rounded-full bg-blue-500" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Campaign Architect Axis</p>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Growth <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">Blueprint</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-1">
                {generatedUrl ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none bg-slate-900 text-white shadow-2xl rounded-[3rem] overflow-hidden relative">
                            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                                <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/20 blur-[130px]" />
                            </div>
                            <div className="p-12 text-center relative z-10">
                                <div className="absolute top-0 right-0 p-12 opacity-5">
                                    <Megaphone className="w-40 h-40" />
                                </div>
                                <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/30 border border-white/10">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-4xl font-black italic uppercase tracking-tight mb-4 leading-none">Blueprint <span className="text-blue-400">Deployed</span></h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-12">Tracking linkages and smart nodes are now operational.</p>

                                <div className="max-w-xl mx-auto space-y-6">
                                    <div className="space-y-3 text-left">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Full Operational URL</Label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-xs font-mono text-blue-300 truncate font-bold">
                                                {generatedUrl.full}
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/5" onClick={() => copyToClipboard(generatedUrl.full)}>
                                                <Copy className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-left">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Smart Hub Shortlink</Label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-blue-600/10 border border-blue-500/20 rounded-2xl px-5 py-4 text-xl font-black italic text-blue-400 shadow-inner">
                                                {generatedUrl.short}
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20" onClick={() => copyToClipboard(generatedUrl.short)}>
                                                <Copy className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 flex gap-4 justify-center">
                                    <Button
                                        variant="outline"
                                        className="h-14 px-10 rounded-2xl border-white/10 text-white hover:bg-white/5 font-black uppercase text-[11px] tracking-widest"
                                        onClick={() => setGeneratedUrl(null)}
                                    >
                                        Modify Setup
                                    </Button>
                                    <Button
                                        className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-600/20"
                                        onClick={() => router.push('/dashboard/marketing/campaigns')}
                                    >
                                        Return to Registry
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border-none bg-white shadow-sm rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="p-8 border-b border-slate-50">
                                    <CardTitle className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-900 italic">
                                        <Megaphone className="w-5 h-5 text-blue-600" />
                                        Core Identity Context
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign Title</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Summer Wellness 2024"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 border-slate-100 rounded-xl font-extrabold italic bg-slate-50/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="program" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Specialty</Label>
                                        <Select
                                            required
                                            value={formData.program}
                                            onValueChange={v => setFormData({ ...formData, program: v })}
                                        >
                                            <SelectTrigger className="h-12 border-slate-100 rounded-xl font-black uppercase text-[10px] tracking-widest bg-slate-50/50">
                                                <SelectValue placeholder="Select specialty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="diabetes" className="font-bold">DIABETES</SelectItem>
                                                <SelectItem value="thyroid" className="font-bold">THYROID</SelectItem>
                                                <SelectItem value="obesity" className="font-bold">OBESITY</SelectItem>
                                                <SelectItem value="weightloss" className="font-bold">WEIGHT LOSS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="code" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Ref Code</Label>
                                            <Input
                                                id="code"
                                                placeholder="SW2024"
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                className="h-12 border-slate-100 rounded-xl font-mono font-black italic bg-slate-50/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="source" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Traffic Source</Label>
                                            <Select
                                                required
                                                value={formData.source}
                                                onValueChange={v => setFormData({ ...formData, source: v })}
                                            >
                                                <SelectTrigger className="h-12 border-slate-100 rounded-xl font-black uppercase text-[10px] tracking-widest bg-slate-50/50">
                                                    <SelectValue placeholder="Select source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="facebook" className="font-bold">FACEBOOK</SelectItem>
                                                    <SelectItem value="google" className="font-bold">GOOGLE</SelectItem>
                                                    <SelectItem value="instagram" className="font-bold">INSTAGRAM</SelectItem>
                                                    <SelectItem value="referral" className="font-bold">REFERRAL</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none bg-white shadow-sm rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="p-8 border-b border-slate-50">
                                    <CardTitle className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-900 italic">
                                        <Globe className="w-5 h-5 text-indigo-600" />
                                        Geo-Linguistics Matrix
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="geography" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Geography</Label>
                                            <Input
                                                id="geography"
                                                placeholder="Metro Cities"
                                                required
                                                value={formData.geography}
                                                onChange={e => setFormData({ ...formData, geography: e.target.value })}
                                                className="h-12 border-slate-100 rounded-xl font-extrabold italic bg-slate-50/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="language" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Linguistic Hub</Label>
                                            <Input
                                                id="language"
                                                placeholder="English, Hindi"
                                                required
                                                value={formData.language}
                                                onChange={e => setFormData({ ...formData, language: e.target.value })}
                                                className="h-12 border-slate-100 rounded-xl font-extrabold italic bg-slate-50/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Objectives</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Outline campaign objectives and value proposition..."
                                            rows={4}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="border-slate-100 rounded-2xl font-bold italic p-4 bg-slate-50/50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none bg-white shadow-sm rounded-[3rem] overflow-hidden md:col-span-2">
                                <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/10">
                                    <CardTitle className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-900 italic">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                        Financials & Epoch Allocation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-10">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                        <div className="space-y-2">
                                            <Label htmlFor="budget" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Budget (₹)</Label>
                                            <div className="relative">
                                                <Input
                                                    id="budget"
                                                    type="number"
                                                    placeholder="Enter amount"
                                                    required
                                                    value={formData.budget}
                                                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                                    className="h-12 border-slate-100 rounded-xl font-black tabular-nums pl-10 bg-slate-50/50"
                                                />
                                                <DollarSign className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="vendor" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Node</Label>
                                            <Input
                                                id="vendor"
                                                placeholder="Marketing Node"
                                                value={formData.vendor}
                                                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                                                className="h-12 border-slate-100 rounded-xl font-black italic bg-slate-50/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Launch Date</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                required
                                                value={formData.startDate}
                                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                                className="h-12 border-slate-100 rounded-xl font-black italic bg-slate-50/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Epoch End</Label>
                                            <Input
                                                id="endDate"
                                                type="date"
                                                required
                                                value={formData.endDate}
                                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                                className="h-12 border-slate-100 rounded-xl font-black italic bg-slate-50/50"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-end gap-3 pt-8">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="h-12 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400"
                            >
                                Abort Setup
                            </Button>
                            <Button
                                type="submit"
                                className="h-14 px-12 rounded-[1.5rem] bg-slate-900 border border-white/5 shadow-2xl shadow-slate-900/20 text-white font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? 'System Deploying...' : 'Deploy Blueprint'}
                                {!isLoading && <Zap className="w-4 h-4 ml-2 fill-current" />}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
