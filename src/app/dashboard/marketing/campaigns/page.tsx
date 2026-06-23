"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Megaphone,
  Eye,
  Edit,
  Plus,
  Download,
  Users,
  Target,
  Zap,
  RefreshCcw,
  Play,
  Pause,
  Facebook,
  Instagram,
  LineChart,
  BarChart,
  ChevronRight
} from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/shared/DataTable';
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
    leadCount: 125,
    conversionRate: 12.5,
  },
  {
    id: 'camp2',
    title: 'Weight Loss Challenge',
    code: 'WL-2024-002',
    status: 'active',
    specialty: 'weightloss',
    source: 'google',
    startDate: subDays(new Date(), 15),
    endDate: addDays(new Date(), 45),
    budget: 75000,
    leadCount: 89,
    conversionRate: 15.2,
  },
  {
    id: 'camp3',
    title: 'Thyroid Health Month',
    code: 'THY-2024-003',
    status: 'paused',
    specialty: 'thyroid',
    source: 'instagram',
    startDate: subDays(new Date(), 45),
    endDate: addDays(new Date(), 15),
    budget: 30000,
    leadCount: 71,
    conversionRate: 8.9,
  },
  {
    id: 'camp4',
    title: 'Obesity Management Program',
    code: 'OB-2024-004',
    status: 'draft',
    specialty: 'obesity',
    source: 'referral',
    startDate: addDays(new Date(), 7),
    endDate: addDays(new Date(), 67),
    budget: 40000,
    leadCount: 0,
    conversionRate: 0,
  }
];

export default function CampaignManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCampaigns = mockCampaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.code.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(campaign =>
    statusFilter === 'all' || campaign.status === statusFilter
  );

  const campaignColumns = [
    {
      key: 'title',
      header: 'Campaign Context',
      render: (item: any) => (
        <div className="py-1">
          <p className="font-extrabold text-slate-900 uppercase italic tracking-tight">{item.title}</p>
          <p className="text-[10px] font-black font-mono text-slate-400 mt-0.5">{item.code}</p>
        </div>
      )
    },
    {
      key: 'specialty',
      header: 'Clinical Domain',
      render: (item: any) => <ProgramBadge program={item.specialty} size="sm" />,
    },
    {
      key: 'source',
      header: 'Deployment Node',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            {item.source === 'facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
            {item.source === 'google' && <Search className="w-4 h-4 text-red-600" />}
            {item.source === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
            {item.source === 'referral' && <Users className="w-4 h-4 text-slate-500" />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.source}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Logical State',
      render: (item: any) => (
        <Badge variant="outline" className={cn(
          "text-[9px] font-black uppercase tracking-[0.1em] border-none px-3 py-1",
          item.status === 'active' ? "bg-emerald-50 text-emerald-600" :
            item.status === 'paused' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
        )}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'performance',
      header: 'Growth metrics',
      render: (item: any) => (
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[14px] font-black text-blue-600 leading-none italic">{item.leadCount}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Leads</p>
          </div>
          <div>
            <p className="text-[14px] font-black text-emerald-600 leading-none italic">{item.conversionRate}%</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Conv.</p>
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Architectural Hook',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/marketing/campaigns/${item.id}`)}
            className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-all"
          >
            <Edit className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      ),
    },
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
                <Target className="h-5 w-5 text-white" />
              </div>
              <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">OPERATIONAL REGISTRY</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest px-4 transition-all">
                <Download className="mr-2 h-3.5 w-3.5" /> Export DB
              </Button>
              <Button size="sm" onClick={() => router.push('/dashboard/marketing/campaigns/new')} className="h-9 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 text-[9px] font-black uppercase tracking-widest px-5 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-3.5 w-3.5" /> Launch Blueprint
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-0.5 rounded-full bg-blue-500" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Campaign Management Console</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Operational <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">Registry</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 px-1">
        {[
          { label: "Total Active", value: mockCampaigns.filter(c => c.status === 'active').length, sub: "Live nodes", icon: Play, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Paused Cycles", value: mockCampaigns.filter(c => c.status === 'paused').length, sub: "Review required", icon: Pause, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Concepts", value: mockCampaigns.filter(c => c.status === 'draft').length, sub: "In blueprinting", icon: Edit, color: "text-slate-400", bg: "bg-slate-50" },
          { label: "Aggregate Yield", value: mockCampaigns.reduce((sum, c) => sum + c.leadCount, 0), sub: "Total leads captured", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" }
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

      {/* Main Registry Subheader */}
      <div className="flex items-center justify-between px-2 pt-4">
        <div className="flex items-center gap-2">
          <BarChart className="h-4 w-4 text-slate-400" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Campaign Data Vectors</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search Code..."
              className="h-9 w-48 pl-9 rounded-xl border-slate-100 bg-white text-[10px] font-bold uppercase tracking-wider"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9 rounded-xl border-slate-100 bg-white text-[9px] font-black uppercase tracking-widest">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white mx-1">
        <CardContent className="p-0">
          <DataTable
            data={filteredCampaigns}
            columns={campaignColumns}
          />
        </CardContent>
      </Card>
    </div>
  );
}
