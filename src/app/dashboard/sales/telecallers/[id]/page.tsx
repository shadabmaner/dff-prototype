"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"

import { useTelecallerDetail } from "@/hooks/use-telecaller-detail"
import { useUpdateTelecallerStatus } from "@/hooks/use-update-telecaller-status"
import { useTelecallers } from "@/hooks/use-telecallers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/ui/stat-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CallHistoryDialog } from "@/components/sales/call-history-dialog"
import { formatDate } from "@/lib/utils"

function getInitials(name?: string) {
  if (!name) return "TC"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case "converted":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "interested":
    case "follow_up":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "contacted":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "not_connected":
    case "busy":
      return "bg-rose-100 text-rose-700 border-rose-200"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

export default function TelecallerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get("tab")
  const initialTab = rawTab === "callLogs" ? "callLogs" : "patients"

  const [activeTab, setActiveTab] = React.useState(initialTab)
  const [patientSearch, setPatientSearch] = React.useState("")
  const [patientStatusFilter, setPatientStatusFilter] = React.useState("all")

  // Call history dialog state
  const [selectedLeadForHistory, setSelectedLeadForHistory] = React.useState<{ id: string; name: string } | null>(null)

  const telecallerId = params.id as string
  const { data: telecallers = [] } = useTelecallers()
  const cachedTelecaller = telecallers.find((item) => item.id === telecallerId)
  const { data: telecaller, isLoading, isError, error } = useTelecallerDetail(telecallerId, cachedTelecaller)
  const updateStatus = useUpdateTelecallerStatus()

  // Filter patients
  const filteredPatients = React.useMemo(() => {
    if (!telecaller?.patients) return []
    return telecaller.patients.filter((patient) => {
      const matchesStatus =
        patientStatusFilter === "all" ? true : patient.status.toLowerCase() === patientStatusFilter.toLowerCase()
      const term = patientSearch.trim().toLowerCase()
      const matchesSearch = term
        ? [patient.name, patient.phone, patient.email, patient.specialty]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(term))
        : true
      return matchesStatus && matchesSearch
    })
  }, [telecaller?.patients, patientSearch, patientStatusFilter])

  if (isLoading && !telecaller) {
    return (
      <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    )
  }

  if (isError || !telecaller) {
    return (
      <div className="grid min-h-[50vh] place-items-center p-8">
        <Card className="max-w-lg border-rose-100 bg-rose-50/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <AlertCircle className="h-5 w-5" />
              Unable to load telecaller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-rose-600">{error?.message ?? "Telecaller not found"}</p>
            <Button variant="outline" onClick={() => router.push("/dashboard/sales/telecallers")}>
              Back to Telecallers
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isActive = telecaller.is_active !== false
  const outboundRate = telecaller.totalCalls ? Math.round(((telecaller.outboundCalls ?? 0) / telecaller.totalCalls) * 100) : 0
  const connectionRate = telecaller.totalCalls ? Math.round(((telecaller.connectedCalls ?? 0) / telecaller.totalCalls) * 100) : 0

  const performanceCards = [
    {
      title: "Total Calls Till Date",
      value: telecaller.totalCalls?.toLocaleString("en-IN") ?? "0",
      subtitle: `${telecaller.outboundCalls?.toLocaleString("en-IN") ?? 0} Outbound (${outboundRate}%) • ${telecaller.inboundCalls?.toLocaleString("en-IN") ?? 0} Inbound`,
      icon: PhoneCall,
      gradient: "from-[#1F56A3] to-[#192B42]",
    },
    {
      title: "Connected Calls",
      value: telecaller.connectedCalls?.toLocaleString("en-IN") ?? "0",
      subtitle: `${connectionRate}% connection success rate`,
      icon: Phone,
      gradient: "from-[#1F56A3] to-[#FFC20E]",
    },
    {
      title: "Contacted Persons",
      value: telecaller.contactedCount?.toLocaleString("en-IN") ?? "0",
      subtitle: `Out of ${telecaller.patientCount?.toLocaleString("en-IN") ?? 0} assigned patients`,
      icon: Users,
      gradient: "from-[#FFC20E] to-[#1F56A3]",
    },
    {
      title: "Total Conversions",
      value: telecaller.conversions?.toLocaleString("en-IN") ?? "0",
      subtitle: `${telecaller.conversionRate?.toFixed(1) ?? 0}% conversion rate`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
    },
  ]

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="h-9 px-0 text-slate-600 hover:text-slate-900 font-medium"
            onClick={() => router.push("/dashboard/sales/telecallers")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Telecallers List
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1F56A3]/10 text-xl font-bold text-[#1F56A3] border border-[#1F56A3]/20 shadow-sm">
              {getInitials(telecaller.name)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {telecaller.name || "Telecaller"}
                </h1>
                <Badge variant="secondary" className={isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                  {isActive ? "Active Account" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Individual performance analysis, call log records, and assigned patient list
              </p>
            </div>
          </div>
        </div>

        {/* Account Status Switch Controls */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-700">Account Access</p>
            <p className="text-[11px] text-slate-500">{isActive ? "Can receive lead allocations" : "Lead allocation paused"}</p>
          </div>
          <Switch
            checked={isActive}
            disabled={updateStatus.isPending}
            onCheckedChange={(checked) =>
              updateStatus.mutate({ telecallerId: telecaller.id, isActive: checked })
            }
            aria-label={`Toggle ${telecaller.name} account status`}
          />
        </div>
      </div>

      {/* Basic Details Card */}
      <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm rounded-3xl overflow-hidden">
        <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Telecaller Basic Details & Work Profile
        </div>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase font-medium tracking-wide text-slate-400">Phone</p>
              <p className="text-sm font-semibold text-slate-900">{telecaller.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase font-medium tracking-wide text-slate-400">Email</p>
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">{telecaller.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase font-medium tracking-wide text-slate-400">Joined Date</p>
              <p className="text-sm font-semibold text-slate-900">
                {telecaller.joinedAt ? formatDate(telecaller.joinedAt, "MMM dd, yyyy") : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase font-medium tracking-wide text-slate-400">Avg Calls / Day</p>
              <p className="text-sm font-bold text-slate-900">{telecaller.avgCallsPerDay ?? "—"} calls</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase font-medium tracking-wide text-slate-400">Avg Call Duration</p>
              <p className="text-sm font-bold text-slate-900">
                {Math.floor((telecaller.avgCallDurationSeconds ?? 180) / 60)}m {(telecaller.avgCallDurationSeconds ?? 180) % 60}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary Metrics Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {performanceCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            gradient={card.gradient}
            subtitle={card.subtitle}
          />
        ))}
      </div>

      {/* Main Tabs: Assigned Patients and Call Activity Logs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white/80 border border-slate-200 p-1 rounded-2xl">
          <TabsTrigger value="patients" className="rounded-xl px-5 py-2 font-semibold text-sm data-[state=active]:bg-[#1F56A3] data-[state=active]:text-white">
            <Users className="mr-2 h-4 w-4" />
            Assigned Patients ({telecaller.patients.length})
          </TabsTrigger>
          <TabsTrigger value="callLogs" className="rounded-xl px-5 py-2 font-semibold text-sm data-[state=active]:bg-[#1F56A3] data-[state=active]:text-white">
            <History className="mr-2 h-4 w-4" />
            Call Activity Logs ({telecaller.recentCallLogs?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Assigned Patients List */}
        <TabsContent value="patients" className="space-y-4">
          <Card className="border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/40">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-[#1F56A3]" />
                    <CardTitle className="text-base font-bold text-slate-900">
                      Assigned Patients for {telecaller.name || "Telecaller"}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    Direct list of patients and leads assigned to this telecaller for sales conversion
                  </CardDescription>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search patient or phone..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="h-9 rounded-xl pl-9 text-xs border-slate-200"
                    />
                  </div>
                  <Select value={patientStatusFilter} onValueChange={setPatientStatusFilter}>
                    <SelectTrigger className="h-9 rounded-xl text-xs w-[150px] border-slate-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="not_connected">Not Connected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 border-b border-slate-100">
                      <TableHead className="pl-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Patient</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Specialty</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Source</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Last Contacted</TableHead>
                      <TableHead className="pr-6 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length ? (
                      filteredPatients.map((patient) => (
                        <TableRow key={patient.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100/60">
                          <TableCell className="pl-6">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                              <p className="text-xs text-slate-400">{patient.email || "—"}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-700">
                            {patient.phone}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs bg-blue-50/50 text-blue-700 border-blue-200/60 font-medium">
                              {patient.specialty || "General"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium">
                            {patient.source || "Website"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${getStatusBadgeClass(patient.status)} border text-xs capitalize font-semibold`}>
                              {patient.status.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {patient.lastContactedAt
                              ? formatDate(patient.lastContactedAt, "MMM dd, yyyy")
                              : "Never"}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg text-xs font-semibold text-[#1F56A3] hover:bg-[#1F56A3]/10"
                                onClick={() => setSelectedLeadForHistory({ id: patient.id, name: patient.name })}
                                title="View Call History for this patient"
                              >
                                <History className="mr-1 h-3.5 w-3.5" />
                                Call History
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-xs font-semibold"
                                asChild
                              >
                                <Link href={`/dashboard/sales/leads/${patient.id}?from=telecaller&telecallerId=${telecaller.id}`}>
                                  <ExternalLink className="mr-1 h-3 w-3" />
                                  Details
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-sm text-slate-500">
                          No patients match your search criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Call Activity Logs */}
        <TabsContent value="callLogs" className="space-y-4">
          <Card className="border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">Recent Call Activity Logs</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Live feed of outbound and inbound customer conversations</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-blue-50 text-[#1F56A3] border-blue-200">
                  {telecaller.recentCallLogs?.length ?? 0} Recorded Sessions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 border-b border-slate-100">
                      <TableHead className="pl-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Call Type</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Patient</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Outcome</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Timestamp</TableHead>
                      <TableHead className="pr-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Notes / Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(telecaller.recentCallLogs ?? []).map((log) => {
                      const isOutbound = log.callType === "outbound"
                      return (
                        <TableRow key={log.id} className="hover:bg-slate-50/70 border-b border-slate-100/60">
                          <TableCell className="pl-6">
                            <Badge variant="outline" className={`text-[11px] font-medium ${isOutbound ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                              {isOutbound ? (
                                <span className="flex items-center gap-1">
                                  <PhoneOutgoing className="h-3 w-3" /> Outbound
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <PhoneIncoming className="h-3 w-3" /> Inbound
                                </span>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-sm text-slate-900">
                            {log.patientName}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium">
                            {log.patientPhone}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusBadgeClass(log.outcome)} border text-xs capitalize`}>
                              {log.outcome.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 font-medium">
                            {log.durationFormatted}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {formatDate(log.calledAt, "MMM dd, HH:mm")}
                          </TableCell>
                          <TableCell className="pr-6 text-xs text-slate-600 max-w-[280px] truncate">
                            {log.notes || "—"}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call History Dialog for individual patients */}
      {selectedLeadForHistory && (
        <CallHistoryDialog
          open={Boolean(selectedLeadForHistory)}
          onOpenChange={(open) => {
            if (!open) setSelectedLeadForHistory(null)
          }}
          leadId={selectedLeadForHistory.id}
          leadName={selectedLeadForHistory.name}
        />
      )}
    </div>
  )
}
