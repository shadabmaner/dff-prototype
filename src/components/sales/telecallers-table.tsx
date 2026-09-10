"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ClipboardList,
  Mail,
  Phone,
  PhoneCall,
  RefreshCw,
  Search,
  Users,
} from "lucide-react"

import { Telecaller } from "@/hooks/use-telecallers"
import { useUpdateTelecallerStatus } from "@/hooks/use-update-telecaller-status"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface TelecallersTableProps {
  data: Telecaller[]
  onRefresh?: () => void
  isRefreshing?: boolean
}

const statusConfig: Record<"active" | "inactive", { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Inactive", className: "bg-slate-100 text-slate-600" },
}

function getInitials(name?: string) {
  if (!name) return "TC"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const roleConfig: Record<string, { label: string; className: string }> = {
  lead_nurture: { label: "Lead Nurture", className: "bg-blue-50 text-blue-700 border-blue-200" },
  welcome_call: { label: "Welcome Call", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  payment_recovery: { label: "Payment Recovery", className: "bg-amber-50 text-amber-700 border-amber-200" },
  residential_camp: { label: "Residential Camp Booster", className: "bg-purple-50 text-purple-700 border-purple-200" },
}

export function TelecallersTable({ data, onRefresh, isRefreshing }: TelecallersTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all")
  const [roleFilter, setRoleFilter] = React.useState<"all" | "lead_nurture" | "welcome_call" | "payment_recovery" | "residential_camp">("all")
  const updateStatus = useUpdateTelecallerStatus()

  const roleCounts = React.useMemo(() => {
    const counts = {
      all: data.length,
      lead_nurture: 0,
      welcome_call: 0,
      payment_recovery: 0,
      residential_camp: 0,
    }
    data.forEach((tc) => {
      const role = tc.roleSpecialization || "lead_nurture"
      if (role in counts) {
        counts[role as keyof typeof counts] += 1
      }
    })
    return counts
  }, [data])

  const filteredData = React.useMemo(() => {
    return data
      .filter((telecaller) => {
        const matchesRole =
          roleFilter === "all"
            ? true
            : (telecaller.roleSpecialization || "lead_nurture") === roleFilter

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "active"
              ? telecaller.is_active !== false
              : telecaller.is_active === false

        const term = searchTerm.trim().toLowerCase()
        const matchesSearch = term
          ? [telecaller.name, telecaller.email, telecaller.phone]
              .filter(Boolean)
              .some((value) => value!.toLowerCase().includes(term))
          : true

        return matchesRole && matchesStatus && matchesSearch
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  }, [data, searchTerm, statusFilter, roleFilter])

  const handleStatusToggle = (telecaller: Telecaller, checked: boolean) => {
    updateStatus.mutate({
      telecallerId: telecaller.id,
      isActive: checked,
    })
  }

  const roleTabs = [
    { id: "all", label: "All Telecallers", count: roleCounts.all },
    { id: "lead_nurture", label: "Lead Nurture", count: roleCounts.lead_nurture },
    { id: "welcome_call", label: "Welcome Call", count: roleCounts.welcome_call },
    { id: "payment_recovery", label: "Payment Recovery", count: roleCounts.payment_recovery },
    { id: "residential_camp", label: "Residential Camp Boosting", count: roleCounts.residential_camp },
  ] as const

  return (
    <div className="space-y-4">
      {/* Role Bifurcation Filter Pill Bar at Top */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        {roleTabs.map((tab) => {
          const isActive = roleFilter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-[#1F56A3] text-white shadow-md shadow-[#1F56A3]/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by telecaller name, email or phone..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-11 rounded-xl border-slate-200 pl-9 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 text-sm md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
          {onRefresh ? (
            <Button
              variant="outline"
              className="h-11 rounded-full px-5"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing" : "Refresh"}
            </Button>
          ) : null}
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        <div className="max-h-[70vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100/80 bg-slate-50/60 hover:bg-slate-50/60">
                <TableHead className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 first:pl-6">Telecaller & Role</TableHead>
                <TableHead className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Contact</TableHead>
                <TableHead className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Account Status</TableHead>
                <TableHead className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Patients</TableHead>
                <TableHead className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Total Calls</TableHead>
                <TableHead className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Contacted Persons</TableHead>
                <TableHead className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Conversions</TableHead>
                <TableHead className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right last:pr-6">Patient List</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length ? (
                filteredData.map((telecaller) => {
                  const statusKey = telecaller.is_active === false ? "inactive" : "active"
                  const status = statusConfig[statusKey]
                  const isActive = telecaller.is_active !== false
                  const role = roleConfig[telecaller.roleSpecialization || "lead_nurture"] || roleConfig.lead_nurture

                  return (
                    <TableRow
                      key={telecaller.id}
                      className="border-b border-slate-100/70 transition-colors hover:bg-slate-50/80 cursor-pointer"
                      onClick={() => router.push(`/dashboard/sales/telecallers/${telecaller.id}`)}
                    >
                      <TableCell className="px-4 py-4 align-middle first:pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F56A3]/10 text-sm font-bold text-[#1F56A3]">
                            {getInitials(telecaller.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/sales/telecallers/${telecaller.id}`}
                                className="text-sm font-semibold text-slate-900 hover:text-primary hover:underline"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {telecaller.name || "Unnamed Telecaller"}
                              </Link>
                              <Badge variant="outline" className={`${role.className} border text-[10px] font-bold px-1.5 py-0`}>
                                {role.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {telecaller.conversionRate?.toFixed(1)}% conversion rate
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-middle">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {telecaller.phone || "—"}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {telecaller.email || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-middle" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2.5">
                          <Badge variant="secondary" className={`${status.className} border-0 text-xs font-semibold px-2.5 py-0.5`}>
                            {status.label}
                          </Badge>
                          <Switch
                            checked={isActive}
                            disabled={updateStatus.isPending}
                            onCheckedChange={(checked) => handleStatusToggle(telecaller, checked)}
                            aria-label={`Toggle ${telecaller.name} account status`}
                            title={isActive ? "Deactivate Telecaller" : "Activate Telecaller"}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center align-middle">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          {telecaller.patientCount?.toLocaleString("en-IN") ?? "0"}
                        </span>
                        <p className="text-[11px] text-slate-400">Assigned</p>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center align-middle">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {telecaller.totalCalls?.toLocaleString("en-IN") ?? "0"}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {telecaller.outboundCalls ?? 0} outbound
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center align-middle">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {telecaller.contactedCount?.toLocaleString("en-IN") ?? "0"}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {telecaller.patientCount ? Math.round(((telecaller.contactedCount ?? 0) / telecaller.patientCount) * 100) : 0}% contacted
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center align-middle">
                        <span className="text-sm font-bold text-emerald-600 tabular-nums">
                          {telecaller.conversions?.toLocaleString("en-IN") ?? "0"}
                        </span>
                        <p className="text-[11px] text-emerald-600/80 font-medium">
                          {telecaller.conversionRate?.toFixed(1)}% rate
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right align-middle last:pr-6" onClick={(event) => event.stopPropagation()}>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-[#1F56A3] hover:bg-[#192B42] text-white rounded-xl shadow-sm text-xs font-semibold h-9 px-3.5"
                          asChild
                        >
                          <Link href={`/dashboard/sales/telecallers/${telecaller.id}?tab=patients`}>
                            <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                            Patient List
                            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.2 text-[11px]">
                              {telecaller.patientCount ?? 0}
                            </span>
                            <ArrowRight className="ml-1.5 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <Search className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">No telecallers match the current filters</p>
                        <p className="mt-1 text-sm text-slate-500">Try a different search term or status filter.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
