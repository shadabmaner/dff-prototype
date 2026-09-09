"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  PhoneCall,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/ui/stat-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
      return "bg-emerald-100 text-emerald-700"
    case "interested":
    case "follow_up":
      return "bg-amber-100 text-amber-700"
    case "contacted":
      return "bg-blue-100 text-blue-700"
    case "not_connected":
      return "bg-rose-100 text-rose-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

export default function TelecallerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const telecallerId = params.id as string
  const { data: telecallers = [] } = useTelecallers()
  const cachedTelecaller = telecallers.find((item) => item.id === telecallerId)
  const { data: telecaller, isLoading, isError, error } = useTelecallerDetail(telecallerId, cachedTelecaller)
  const updateStatus = useUpdateTelecallerStatus()

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
  const performanceCards = [
    {
      title: "Total Calls",
      value: telecaller.totalCalls?.toLocaleString("en-IN") ?? "0",
      subtitle: `${telecaller.outboundCalls?.toLocaleString("en-IN") ?? 0} outbound`,
      icon: PhoneCall,
      gradient: "from-[#1F56A3] to-[#192B42]",
    },
    {
      title: "Connected Calls",
      value: telecaller.connectedCalls?.toLocaleString("en-IN") ?? "0",
      subtitle: "Successful connections",
      icon: Phone,
      gradient: "from-[#1F56A3] to-[#FFC20E]",
    },
    {
      title: "Contacted Persons",
      value: telecaller.contactedCount?.toLocaleString("en-IN") ?? "0",
      subtitle: `${telecaller.patientCount?.toLocaleString("en-IN") ?? 0} assigned patients`,
      icon: Users,
      gradient: "from-[#FFC20E] to-[#1F56A3]",
    },
    {
      title: "Conversions",
      value: telecaller.conversions?.toLocaleString("en-IN") ?? "0",
      subtitle: `${telecaller.conversionRate?.toFixed(1) ?? 0}% conversion rate`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
    },
  ]

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="h-9 px-0 text-slate-600 hover:text-slate-900"
            onClick={() => router.push("/dashboard/sales/telecallers")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Telecallers
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
              {getInitials(telecaller.name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {telecaller.name || "Telecaller"}
              </h1>
              <p className="text-sm text-slate-500">Individual performance and assigned patient list</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
          <Badge className={isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={isActive}
            disabled={updateStatus.isPending}
            onCheckedChange={(checked) =>
              updateStatus.mutate({ telecallerId: telecaller.id, isActive: checked })
            }
          />
          <span className="text-sm font-medium text-slate-700">
            {isActive ? "Account active" : "Account deactivated"}
          </span>
        </div>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
              <p className="text-sm font-semibold text-slate-900">{telecaller.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
              <p className="text-sm font-semibold text-slate-900">{telecaller.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Joined</p>
              <p className="text-sm font-semibold text-slate-900">
                {telecaller.joinedAt ? formatDate(telecaller.joinedAt, "MMM dd, yyyy") : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Avg Calls / Day</p>
              <p className="text-sm font-semibold text-slate-900">{telecaller.avgCallsPerDay ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-slate-700" />
              <CardTitle className="text-sm font-bold text-slate-900">Assigned Patient List</CardTitle>
            </div>
            <Badge className="bg-slate-900 text-white">
              {telecaller.patients.length} Patients
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="pl-6">Patient</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6">Last Contacted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {telecaller.patients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-slate-50/60">
                    <TableCell className="pl-6">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.email || "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">{patient.phone}</TableCell>
                    <TableCell className="text-sm text-slate-700">{patient.specialty || "—"}</TableCell>
                    <TableCell className="text-sm text-slate-700">{patient.source || "—"}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeClass(patient.status)} border-0 text-xs capitalize`}>
                        {patient.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-slate-600">
                      {patient.lastContactedAt
                        ? formatDate(patient.lastContactedAt, "MMM dd, yyyy")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
