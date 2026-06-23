"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Megaphone,
  Users,
  Calendar,
  Target,
  LineChart,
  Facebook,
  Search,
  Instagram,
  Eye,
  Plus,
  BarChart3,
  PieChart,
  Video,
  Clock,
  Info,
  Zap,
  RefreshCcw,
  TrendingUp,
  Download
} from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts';
import { ProgramBadge } from '@/components/shared/ProgramBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatCard } from '@/components/ui/stat-card';

// Mock data (keep existing mock data)
const mockCampaigns = [
  { id: 'camp1', title: 'Diabetes Awareness Campaign', code: 'DIA-2024-001', status: 'active', specialty: 'diabetes', source: 'facebook', startDate: subDays(new Date(), 30), endDate: addDays(new Date(), 30) },
  { id: 'camp2', title: 'Weight Loss Challenge', code: 'WL-2024-002', status: 'active', specialty: 'weightloss', source: 'google', startDate: subDays(new Date(), 15), endDate: addDays(new Date(), 45) },
  { id: 'camp3', title: 'Thyroid Health Month', code: 'THY-2024-003', status: 'paused', specialty: 'thyroid', source: 'instagram', startDate: subDays(new Date(), 45), endDate: addDays(new Date(), 15) },
];

const mockLeads = [
  { id: 'lead1', name: 'John Smith', source: 'facebook', campaign: 'DIA-2024-001', specialty: 'diabetes', registrationDate: subDays(new Date(), 1), webinarStatus: 'registered' },
  { id: 'lead2', name: 'Sarah Johnson', source: 'google', campaign: 'WL-2024-002', specialty: 'weightloss', registrationDate: subDays(new Date(), 2), webinarStatus: 'attended' },
  { id: 'lead3', name: 'Mike Davis', source: 'instagram', campaign: 'THY-2024-003', specialty: 'thyroid', registrationDate: subDays(new Date(), 3), webinarStatus: 'not_attended' },
];

const mockWebinars = [
  { id: 'web1', title: 'Diabetes Management Basics', date: subDays(new Date(), 7), speaker: 'Dr. Sarah Johnson', campaign: 'DIA-2024-001', totalRegistrations: 45, attended: 32, interested: 28 },
  { id: 'web2', title: 'Weight Loss Success Stories', date: subDays(new Date(), 3), speaker: 'Dr. Mike Davis', campaign: 'WL-2024-002', totalRegistrations: 38, attended: 25, interested: 20 },
];

const mockLeadTrend = [
  { date: subDays(new Date(), 6).toISOString(), leads: 45 },
  { date: subDays(new Date(), 5).toISOString(), leads: 52 },
  { date: subDays(new Date(), 4).toISOString(), leads: 38 },
  { date: subDays(new Date(), 3).toISOString(), leads: 61 },
  { date: subDays(new Date(), 2).toISOString(), leads: 44 },
  { date: subDays(new Date(), 1).toISOString(), leads: 58 },
  { date: new Date().toISOString(), leads: 42 },
];

const mockSourceDistribution = [
  { source: 'Facebook', leads: 125, color: '#1877f2' },
  { source: 'Google', leads: 89, color: '#4285f4' },
  { source: 'Instagram', leads: 71, color: '#e4405f' },
  { source: 'Organic', leads: 36, color: '#10b981' },
];

const mockFunnelData = [
  { stage: 'Lead Generated', count: 350, percentage: 100 },
  { stage: 'Webinar Registered', count: 280, percentage: 80 },
  { stage: 'Attended', count: 196, percentage: 56 },
  { stage: 'Interested', count: 147, percentage: 42 },
  { stage: 'Passed to Sales', count: 88, percentage: 25 },
];

const mockCampaignRequests = [
  { id: 'req1', title: 'Diabetes Marathi Webinar', requestor: 'Regional Desk', schedule: 'Sunday · 11:00 AM', priority: 'High' },
  { id: 'req2', title: 'PCOS Awareness Insta Live', requestor: 'Community Team', schedule: 'Wednesday · 5:30 PM', priority: 'Medium' },
];

export default function MarketingDashboard() {
  const activeCampaigns = mockCampaigns.filter(c => c.status === 'active').length;
  const totalWebinarRegistrations = mockWebinars.reduce((sum, w) => sum + w.totalRegistrations, 0);
  const totalInterested = mockWebinars.reduce((sum, w) => sum + w.interested, 0);
  const conversionRate = ((totalInterested / totalWebinarRegistrations) * 100).toFixed(1);

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
                <Zap className="h-5 w-5 text-white" />
              </div>
              <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">GROWTH OPS</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest px-4 transition-all">
                <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Re-sync Analytics
              </Button>
              <Button size="sm" className="h-9 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 text-[9px] font-black uppercase tracking-widest px-5 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-3.5 w-3.5" /> Launch Campaign
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-0.5 rounded-full bg-blue-500" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Marketing Intelligence Hub</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Growth <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">Terminal</span>
            </h1>
            <p className="max-w-2xl text-sm text-slate-400 font-medium leading-relaxed">
              Monitoring {mockCampaigns.length} campaigns and {mockLeads.length} active leads. Reviewing funnels and orchestrating growth sequences.
            </p>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 px-1">
        {[
          { label: "Active Campaigns", value: activeCampaigns, sub: `of ${mockCampaigns.length} total`, icon: Megaphone, gradient: "from-[#1F56A3] to-[#192B42]" },
          { label: "Leads Generated", value: mockLeads.length, sub: "+15.2% lift", icon: Users, gradient: "from-[#192B42] to-[#1F56A3]" },
          { label: "Registrations", value: totalWebinarRegistrations, sub: "+8.3% intensity", icon: Calendar, gradient: "from-[#FFC20E] to-[#1F56A3]" },
          { label: "Converted Yield", value: totalInterested, sub: `${conversionRate}% velocity`, icon: Target, gradient: "from-[#1F56A3] to-[#FFC20E]" },
        ].map((m) => (
          <StatCard
            key={m.label}
            title={m.label}
            value={m.value}
            icon={m.icon}
            gradient={m.gradient}
            subtitle={m.sub}
          />
        ))}
      </div>

      {/* Middle Grid: Charts */}
      <div className="grid gap-6 lg:grid-cols-2 px-1">
        {/* Lead Trend */}
        <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-2">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-900">Lead Velocity Stream</CardTitle>
            </div>
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-100">Live Feed</Button>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={260}>
              <RechartsLineChart data={mockLeadTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#2563eb"
                  strokeWidth={4}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Source */}
        <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-900">Node Attribution</CardTitle>
            </div>
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-100">Export Meta</Button>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={mockSourceDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="leads"
                >
                  {mockSourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
              {mockSourceDistribution.map((s) => (
                <div key={s.source} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.source}</span>
                  <span className="text-[10px] font-black text-slate-900 ml-auto">{s.leads}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Section */}
      <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden mx-1">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-900">Conversion Funnel Blueprint</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="space-y-6">
            {mockFunnelData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{stage.stage}</span>
                  <span className="text-[10px] font-black tabular-nums">{stage.count} UNITS / {stage.percentage}%</span>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed">
            <p className="text-[11px] text-blue-800 font-bold leading-relaxed italic">
              <Info className="w-3.5 h-3.5 inline mr-2 text-blue-500" />
              ANALYSIS: Funnel velocity is stable at 42% for qualified interest, indicating strong content resonance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid: Recent Inbounds & Campaigns */}
      <div className="grid gap-6 lg:grid-cols-3 px-1">
        {/* Recent Campaigns */}
        <Card className="fresh-card-alt border-none shadow-sm rounded-3xl bg-white overflow-hidden pb-4 lg:col-span-2">
          <CardHeader className="p-8 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-900">Operational Registry</CardTitle>
            </div>
            <Button variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest text-blue-600">View Registry</Button>
          </CardHeader>
          <div className="px-8 space-y-3">
            {mockCampaigns.map((c) => (
              <div key={c.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    {c.source === 'facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                    {c.source === 'google' && <Search className="w-5 h-5 text-red-600" />}
                    {c.source === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-black text-slate-900 uppercase italic leading-none">{c.title}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-slate-400 font-mono">{c.code}</span>
                      <ProgramBadge program={c.specialty} size="sm" />
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-none px-3 py-1">{c.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Requests */}
        <Card className="fresh-card-alt border-none shadow-sm rounded-3xl bg-white overflow-hidden pb-4">
          <CardHeader className="p-8">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-900">Inbound concept stream</CardTitle>
            </div>
          </CardHeader>
          <div className="px-6 space-y-3">
            {mockCampaignRequests.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white transition-all">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[12px] font-black text-slate-900 uppercase italic leading-tight max-w-[80%]">{r.title}</p>
                  <Badge className={cn(
                    "text-[7px] font-black px-1.5 py-0 border-none",
                    r.priority === 'High' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                  )}>{r.priority}</Badge>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">BY {r.requestor} · {r.schedule}</p>
                <Button variant="outline" size="sm" className="w-full h-8 rounded-lg text-[8px] font-black uppercase tracking-widest border-slate-100 hover:bg-blue-600 hover:text-white transition-colors">Launch Blueprint</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Summary Analytics Footer */}
      <Card className="fresh-card-alt border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden mx-1">
        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-900">Aggregate Yield Summary</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest border-slate-100 hover:bg-slate-50 transition-all">
              <Download className="mr-2 h-3.5 w-3.5" /> Archive Reports
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Re-sync
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Total Exposure", value: "85.2K", color: "text-slate-900" },
              { label: "Click Velocity", value: "12.8%", color: "text-blue-600" },
              { label: "Conversion Lift", value: "+2.4%", color: "text-emerald-600" },
              { label: "Resource ROI", value: "3.4x", color: "text-indigo-600" }
            ].map((sa) => (
              <div key={sa.label} className="flex flex-col items-center border-r last:border-none border-slate-100">
                <p className={cn("text-3xl font-black tabular-nums tracking-tighter italic", sa.color)}>{sa.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sa.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
