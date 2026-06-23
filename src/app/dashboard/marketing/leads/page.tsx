"use client"

import { useState } from 'react';
import { ProgramBadge } from '@/components/shared/ProgramBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Users,
  Calendar,
  Phone,
  Mail,
  Target,
  Clock,
  CheckCircle2,
  Eye,
  Download,
  Facebook,
  Instagram,
  Globe,
  Monitor,
  MapPin,
  ChevronRight,
  UserPlus,
  Zap,
  RefreshCcw,
  TrendingUp,
  Filter
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/shared/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data (keep existing mock data)
const mockLeads = [
  {
    id: 'L-1001',
    name: 'Amit Patel',
    email: 'amit.patel@gmail.com',
    phone: '+91 98765 43210',
    specialty: 'diabetes',
    source: 'facebook',
    campaign: 'DIA-2024-001',
    status: 'interested',
    registrationDate: subDays(new Date(), 1),
    utmSource: 'fb_ad',
    utmMedium: 'cpc',
    utmCampaign: 'dia_awareness',
    device: 'iOS / iPhone 13',
    location: 'Mumbai, India',
    webinarStatus: 'attended',
    notes: 'Interested in reversing Type-2 diabetes'
  },
  {
    id: 'L-1002',
    name: 'Sneha Rao',
    email: 'sneha.rao@yahoo.com',
    phone: '+91 88776 55443',
    specialty: 'weightloss',
    source: 'google',
    campaign: 'WL-2024-002',
    status: 'registered',
    registrationDate: subDays(new Date(), 2),
    utmSource: 'google_search',
    utmMedium: 'organic',
    utmCampaign: 'wl_challenge',
    device: 'Android / Samsung S22',
    location: 'Bangalore, India',
    webinarStatus: 'registered',
    notes: 'Looking for 30-day challenge'
  }
];

export default function LeadOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const filteredLeads = mockLeads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      header: 'Intelligence Profile',
      render: (item: any) => (
        <div className="py-1">
          <p className="font-extrabold text-slate-900 uppercase italic tracking-tight">{item.name}</p>
          <p className="text-[10px] font-black font-mono text-slate-400 mt-0.5">{item.id}</p>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Connection Meta',
      render: (item: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <Phone className="w-3 h-3 text-slate-300" />
            <span className="tabular-nums">{item.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic">
            <Mail className="w-3 h-3 text-slate-200" />
            {item.email}
          </div>
        </div>
      )
    },
    {
      key: 'program',
      header: 'Specialty Hub',
      render: (item: any) => <ProgramBadge program={item.specialty} size="sm" />
    },
    {
      key: 'source',
      header: 'Traffic Node',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            {item.source === 'facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
            {item.source === 'google' && <Search className="w-4 h-4 text-red-600" />}
            {item.source === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-600">{item.source}</span>
        </div>
      )
    },
    {
      key: 'state',
      header: 'Logical State',
      render: (item: any) => (
        <Badge variant="outline" className={cn(
          "border-none text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1",
          item.status === 'interested' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
        )}>
          {item.status.replace('-', ' ')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Deep View',
      render: (item: any) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedLead(item)}
              className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          {selectedLead && (
            <DialogContent className="max-w-2xl border-none shadow-2xl rounded-[3rem] p-0 overflow-hidden bg-slate-50">
              <div className="bg-slate-900 p-10 text-white relative h-48 flex items-end">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/20 blur-[130px]" />
                </div>
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Target className="w-40 h-40" />
                </div>
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div>
                    <Badge className="bg-blue-600 text-white border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 mb-3">
                      {selectedLead.id}
                    </Badge>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{selectedLead.name}</h2>
                  </div>
                  <ProgramBadge program={selectedLead.specialty} size="lg" className="bg-white/10 text-white border border-white/10" />
                </div>
              </div>

              <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Node Linkages</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[13px] font-bold text-slate-900 tabular-nums">{selectedLead.phone}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[13px] font-bold text-slate-900 truncate">{selectedLead.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[13px] font-bold text-slate-900">{selectedLead.location}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Funnel Intelligence</p>
                    <div className="space-y-4">
                      {[
                        { label: "Status Vector", value: selectedLead.status, icon: Target, color: "text-blue-500" },
                        { label: "Webinar Axis", value: selectedLead.webinarStatus, icon: Monitor, color: "text-indigo-500" },
                        { label: "Epoch Join", value: format(selectedLead.registrationDate, 'MMM d, yyyy'), icon: Calendar, color: "text-emerald-500" }
                      ].map((stat, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                          </div>
                          <span className="text-[11px] font-black uppercase italic text-slate-900">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="bg-slate-950 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                  <div className="absolute -top-[50%] -right-[10%] h-[200%] w-[50%] rounded-full bg-blue-600/10 blur-3xl opacity-50" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        {selectedLead.source === 'facebook' && <Facebook className="w-5 h-5 text-blue-400" />}
                        {selectedLead.source === 'instagram' && <Instagram className="w-5 h-5 text-pink-400" />}
                        {selectedLead.source === 'google' && <Search className="w-5 h-5 text-red-500" />}
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Attribution Blueprint</p>
                        <p className="text-base font-black italic uppercase italic text-white leading-none">{selectedLead.campaign}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { label: "Medium", value: selectedLead.utmMedium },
                        { label: "UTM Source", value: selectedLead.utmSource },
                        { label: "Device Info", value: selectedLead.device }
                      ].map((item, i) => (
                        <div key={i}>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                          <p className="text-[11px] font-black text-slate-300 italic uppercase">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-all">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Trigger Sales Handover Sequence
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>
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
                <Users className="h-5 w-5 text-white" />
              </div>
              <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">INTEL FEED</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest px-4 transition-all">
                <Download className="mr-2 h-3.5 w-3.5" /> Export Intelligence
              </Button>
              <Button size="sm" className="h-9 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 text-[9px] font-black uppercase tracking-widest px-5 transition-all hover:scale-105 active:scale-95">
                <Filter className="mr-2 h-3.5 w-3.5" /> Meta Filters
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-0.5 rounded-full bg-blue-500" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Lead Intelligence Hub</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Prospect <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">Telemetry</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 px-1">
        {[
          { label: "Live Prospects", value: mockLeads.length, sub: "Across all nodes", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "High Interest", value: mockLeads.filter(l => l.status === 'qualified' || l.status === 'interested').length, sub: "Target ready", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Webinar Velocity", value: "84%", sub: "Engagement lift", icon: Monitor, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Conversion Lift", value: "12.4%", sub: "+2.1% trend", icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" }
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

      {/* Main Registry Section */}
      <div className="flex items-center justify-between px-2 pt-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-slate-400" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Prospect Stream Analysis</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search UID / Name..."
              className="h-9 w-64 pl-9 rounded-xl border-slate-100 bg-white text-[10px] font-bold uppercase tracking-wider"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white mx-1">
        <CardContent className="p-0">
          <DataTable
            data={filteredLeads}
            columns={columns}
          />
        </CardContent>
      </Card>
    </div>
  );
}
