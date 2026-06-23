"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import {
  Stethoscope,
  Search,
  Filter,
  Users,
  Globe,
  PhoneCall,
  ClipboardList,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  Loader2,
  MapPin,
  Clock,
  LayoutGrid,
  RefreshCcw,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ProfileStatus = "ACTIVE" | "AWAY" | "ONBOARDING"
type ProfileRole = "Consultant" | "Dietitian" | "Physio" | "Nurse" | "Psychologist"

type StaffProfile = {
  id: string
  name: string
  role: ProfileRole
  location: string
  specialties: string[]
  languages: string[]
  patients: number
  responseTime: string
  status: ProfileStatus
  kpis: {
    csat: number
    adherence: number
    escalations: number
  }
}

const staffSeed: StaffProfile[] = [
  {
    id: "CL-201",
    name: "Dr. Sana Dhawan",
    role: "Consultant",
    location: "Bengaluru, IN",
    specialties: ["Cardiology", "Lifestyle Medicine"],
    languages: ["English", "Kannada", "Hindi"],
    patients: 142,
    responseTime: "28m",
    status: "ACTIVE",
    kpis: { csat: 94, adherence: 89, escalations: 1 },
  },
  {
    id: "CL-178",
    name: "Dietitian Rukmini",
    role: "Dietitian",
    location: "Hyderabad, IN",
    specialties: ["Diabetology"],
    languages: ["English", "Telugu", "Hindi"],
    patients: 98,
    responseTime: "34m",
    status: "ACTIVE",
    kpis: { csat: 90, adherence: 82, escalations: 0 },
  },
  {
    id: "CL-143",
    name: "Physio Aarav",
    role: "Physio",
    location: "Mumbai, IN",
    specialties: ["Musculoskeletal"],
    languages: ["English", "Marathi"],
    patients: 76,
    responseTime: "1h 12m",
    status: "AWAY",
    kpis: { csat: 87, adherence: 78, escalations: 2 },
  },
  {
    id: "CL-220",
    name: "Nurse Priya",
    role: "Nurse",
    location: "Delhi, IN",
    specialties: ["Critical Care"],
    languages: ["English", "Hindi"],
    patients: 64,
    responseTime: "43m",
    status: "ONBOARDING",
    kpis: { csat: 0, adherence: 0, escalations: 0 },
  },
  {
    id: "CL-199",
    name: "Psychologist Veer",
    role: "Psychologist",
    location: "Remote",
    specialties: ["Behavioural"],
    languages: ["English", "Hindi"],
    patients: 54,
    responseTime: "51m",
    status: "ACTIVE",
    kpis: { csat: 92, adherence: 85, escalations: 0 },
  },
]

export default function StaffProfilesPage() {
  const [profiles, setProfiles] = useState<StaffProfile[]>(staffSeed)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"ALL" | ProfileRole>("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProfileStatus>("ALL")
  const [selectedProfile, setSelectedProfile] = useState<StaffProfile | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [notes, setNotes] = useState("")

  const filtered = useMemo(() => {
    return profiles.filter((profile) => {
      const matchesQuery = query
        ? profile.name.toLowerCase().includes(query.toLowerCase()) ||
        profile.specialties.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
        profile.languages.some((l) => l.toLowerCase().includes(query.toLowerCase()))
        : true
      const matchesRole = roleFilter === "ALL" ? true : profile.role === roleFilter
      const matchesStatus = statusFilter === "ALL" ? true : profile.status === statusFilter
      return matchesQuery && matchesRole && matchesStatus
    })
  }, [profiles, query, roleFilter, statusFilter])

  const summary = useMemo(() => {
    const active = profiles.filter((profile) => profile.status === "ACTIVE").length
    const onboarding = profiles.filter((profile) => profile.status === "ONBOARDING").length
    const away = profiles.filter((profile) => profile.status === "AWAY").length
    const avgPatients = Math.round(
      profiles.reduce((acc, curr) => acc + curr.patients, 0) / profiles.length
    )
    return { active, onboarding, away, avgPatients }
  }, [profiles])

  const toggleStatus = (profile: StaffProfile) => {
    const nextStatus: ProfileStatus = profile.status === "ACTIVE" ? "AWAY" : "ACTIVE"
    setProfiles((prev) => prev.map((item) => (item.id === profile.id ? { ...item, status: nextStatus } : item)))
  }

  const handleAssign = () => {
    setAssigning(false)
    setNotes("")
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Super Admin / Staff Profiles</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Staff Profiles</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Monitor clinical staff readiness, coverage, and capacity across all healthcare services.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => { setQuery(""); setRoleFilter("ALL"); setStatusFilter("ALL") }}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg" onClick={() => setAssigning(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Assign Staff
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active Staff" value={summary.active.toString()} icon={Users} color="text-emerald-600" bg="from-emerald-50 to-teal-50" />
        <MetricCard label="Onboarding" value={summary.onboarding.toString()} icon={ClipboardList} color="text-blue-600" bg="from-blue-50 to-indigo-50" />
        <MetricCard label="Avg Load" value={`${summary.avgPatients}`} icon={TrendingUp} color="text-purple-600" bg="from-purple-50 to-violet-50" />
        <MetricCard label="Away" value={`${summary.away}`} icon={PhoneCall} color="text-amber-600" bg="from-amber-50 to-orange-50" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-lg">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search staff..."
            className="pl-11 h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
            <SelectTrigger className="h-12 w-[160px] rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              {(["ALL", "Consultant", "Dietitian", "Physio", "Nurse", "Psychologist"] as const).map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="h-12 w-[160px] rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              {(["ALL", "ACTIVE", "AWAY", "ONBOARDING"] as const).map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Staff Directory</h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100/50">
                <TableHead className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 w-[28%]">Clinician Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 w-[20%]">Specialisms</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 w-[15%]">Languages</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 w-[12%]">Active Load</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 w-[10%]">Hub Status</TableHead>
                <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-slate-50/20">
                    No matching clinical signals found in directory.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((profile) => (
                  <TableRow key={profile.id} className="group/row border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedProfile(profile)}>
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 font-black text-primary border border-primary/5 shadow-inner group-hover/row:scale-110 transition-transform duration-300">
                          {profile.name
                            .split(" ")
                            .map((chunk) => chunk[0])
                            .join("")}
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 uppercase tracking-tight text-[14px]">{profile.name}</p>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{profile.role} · {profile.location}</p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest bg-blue-50/80 text-blue-600 border-none">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.languages.map((language) => (
                          <Badge key={language} variant="outline" className="rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest border-slate-100 bg-white text-slate-500">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <p className="text-[14px] font-black text-slate-900 tabular-nums">{profile.patients}</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{profile.responseTime}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={profile.status} />
                    </TableCell>
                    <TableCell className="text-right pr-10" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl border-slate-200 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm" onClick={() => toggleStatus(profile)}>
                          {profile.status === "ACTIVE" ? "Away" : "Activate"}
                        </Button>
                        <Button size="sm" className="h-9 px-5 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-black/10 transition-all hover:scale-105" onClick={() => setSelectedProfile(profile)}>
                          Profile
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        </CardContent>
      </Card>

      <Drawer
        open={!!selectedProfile}
        onOpenChange={(open) => {
          if (!open) setSelectedProfile(null)
        }}
      >
        <DrawerContent className="rounded-t-[2.5rem] border-white/10">
          <DrawerHeader className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                {selectedProfile?.role}
              </Badge>
              <Badge variant="outline" className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border-slate-200">
                ID: {selectedProfile?.id}
              </Badge>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedProfile?.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">{selectedProfile?.location}</p>
            </div>
          </DrawerHeader>
          {selectedProfile ? (
            <div className="grid gap-6 p-8 md:grid-cols-2">
              <Card className="fresh-card-alt border-none shadow-sm rounded-3xl bg-slate-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Capability Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InfoGroup label="Core Specialties" values={selectedProfile.specialties} />
                  <InfoGroup label="Clinical Languages" values={selectedProfile.languages} />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoLine label="Total Patients" value={selectedProfile.patients.toString()} />
                    <InfoLine label="Avg Resolution" value={selectedProfile.responseTime} />
                  </div>
                </CardContent>
              </Card>
              <Card className="fresh-card-alt border-none shadow-sm rounded-3xl bg-slate-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Performance Signals</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <InfoMetric label="CSAT" value={`${selectedProfile.kpis.csat}%`} color="text-emerald-600" />
                  <InfoMetric label="ADHERENCE" value={`${selectedProfile.kpis.adherence}%`} color="text-blue-600" />
                  <InfoMetric label="ESCALATE" value={`${selectedProfile.kpis.escalations}`} color="text-rose-600" />
                </CardContent>
                <div className="px-6 pb-6 mt-2">
                  <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Market Status</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Clinical Ready State</p>
                    </div>
                    <StatusBadge status={selectedProfile.status} />
                  </div>
                </div>
              </Card>
              <Card className="md:col-span-2 fresh-card-alt border-none shadow-sm rounded-3xl bg-slate-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Administrative Logs</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Attach reminders for clinical allocation moves.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea rows={3} placeholder="Add supervision notes, shift restrictions, or coverage reminders..." className="rounded-2xl border-slate-100 bg-white shadow-sm resize-none focus:ring-primary/20 text-sm font-medium p-4" value={notes} onChange={(event) => setNotes(event.target.value)} />
                  <div className="flex justify-end">
                    <Button size="sm" className="rounded-xl px-6 bg-slate-900 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all" disabled={!notes.trim()} onClick={() => setNotes("")}>Save Observation</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <DrawerFooter className="p-8 pt-0 flex-row justify-end gap-3">
            <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest" onClick={() => setSelectedProfile(null)}>Dismiss Hub</Button>
            {selectedProfile && (
              <Button className="h-12 px-10 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all" onClick={() => setAssigning(true)}>
                <Globe className="mr-2 h-4 w-4" /> Move Allocation
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={assigning} onOpenChange={setAssigning}>
        <DialogContent className="rounded-[2.5rem] border-white/5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Assign Coverage</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority Hub Program</p>
              <Select defaultValue="Cardiac Rehab">
                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-medium">
                  <SelectValue placeholder="Choose program" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  <SelectItem value="Cardiac Rehab" className="rounded-lg">Cardiac Rehab</SelectItem>
                  <SelectItem value="Diabetes 360" className="rounded-lg">Diabetes 360</SelectItem>
                  <SelectItem value="Ortho Recovery" className="rounded-lg">Ortho Recovery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contextual Notes</p>
              <Textarea rows={3} placeholder="Ex: Needs Kannada telehealth availability for Phase 2..." className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white resize-none" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="ghost" className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400" onClick={() => setAssigning(false)}>Abort Move</Button>
            <Button className="h-12 px-10 rounded-xl bg-primary shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest" onClick={handleAssign}>Confirm Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}) {
  return (
    <Card className="group fresh-card-alt border-none shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2">
      <CardContent className="flex items-center gap-5 p-8">
        <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", bg)}>
          <div className={cn(color)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: ProfileStatus }) {
  const mapping: Record<ProfileStatus, { bg: string, text: string, ping: string }> = {
    ACTIVE: { bg: "bg-emerald-500/10", text: "text-emerald-600", ping: "bg-emerald-500" },
    AWAY: { bg: "bg-amber-500/10", text: "text-amber-600", ping: "bg-amber-500" },
    ONBOARDING: { bg: "bg-blue-500/10", text: "text-blue-600", ping: "bg-blue-500" },
  }
  const config = mapping[status]
  return (
    <Badge className={cn("rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm border-none gap-2", config.bg, config.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", config.ping)} />
      {status}
    </Badge>
  )
}

function InfoGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <Badge key={value} variant="secondary" className="rounded-full px-3 py-0.5 text-[10px] font-bold bg-white text-slate-600 border border-slate-100 shadow-sm">
            {value}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-[15px] font-black text-slate-900 uppercase tracking-tight tabular-nums">{value}</p>
    </div>
  )
}

function InfoMetric({ label, value, color }: { label: string; value: string, color: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm flex flex-col items-center justify-center text-center gap-1 group/metric hover:bg-slate-50 transition-colors">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={cn("text-xl font-black tracking-tighter tabular-nums transition-transform duration-500 group-hover/metric:scale-110", color)}>{value}</p>
    </div>
  )
}
