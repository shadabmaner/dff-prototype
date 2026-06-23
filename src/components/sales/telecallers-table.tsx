"use client"

import * as React from "react"
import Link from "next/link"

import { Telecaller } from "@/hooks/use-telecallers"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, RefreshCw, Phone, Mail } from "lucide-react"

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

export function TelecallersTable({ data, onRefresh, isRefreshing }: TelecallersTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all")

  const filteredData = React.useMemo(() => {
    return data
      .filter((telecaller) => {
        const matchesStatus =
          statusFilter === "all" ? true : statusFilter === "active" ? telecaller.is_active !== false : telecaller.is_active === false

        const term = searchTerm.trim().toLowerCase()
        const matchesSearch = term
          ? [telecaller.name, telecaller.email, telecaller.phone]
              .filter(Boolean)
              .some((value) => value!.toLowerCase().includes(term))
          : true

        return matchesStatus && matchesSearch
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  }, [data, searchTerm, statusFilter])

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or phone"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-11 rounded-xl border-slate-200 pl-9 text-sm"
            />
          </div>
          {/* <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 text-sm md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select> */}
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
        <div className="border-b border-slate-100/80 bg-slate-50/70 px-6 py-4">
          
        </div>
        <div className="max-h-[70vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100/80 bg-slate-50/40 hover:bg-slate-50/40">
                <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 first:pl-6 last:pr-6">Telecaller</TableHead>
                <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 first:pl-6 last:pr-6">Phone</TableHead>
                <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 first:pl-6 last:pr-6">Email</TableHead>
                {/* <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length ? (
                filteredData.map((telecaller) => {
                  const statusKey = telecaller.is_active === false ? "inactive" : "active"
                  const status = statusConfig[statusKey]

                  return (
                    <TableRow key={telecaller.id} className="border-b border-slate-100/70 transition-colors hover:bg-primary/5/40">
                      <TableCell className="px-4 py-4 align-middle first:pl-6 last:pr-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {getInitials(telecaller.name)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {telecaller.name || "Unnamed Telecaller"}
                            </div>
                            {/* <div className="text-xs text-muted-foreground font-mono">{telecaller.id}</div> */}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-middle first:pl-6 last:pr-6">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {telecaller.phone ? (
                            <Link href={`tel:${telecaller.phone}`} className="font-medium hover:underline">
                              {telecaller.phone}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground/70">No phone</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-middle first:pl-6 last:pr-6">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {telecaller.email ? (
                            <Link href={`mailto:${telecaller.email}`} className="hover:underline">
                              {telecaller.email}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground/70">No email</span>
                          )}
                        </div>
                      </TableCell>
                      {/* <TableCell>
                        <Badge variant="secondary" className={`${status.className} border-0 text-xs font-semibold`}>
                          {status.label}
                        </Badge>
                      </TableCell> */}
                      {/* <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild disabled={!telecaller.phone}>
                            <Link href={telecaller.phone ? `tel:${telecaller.phone}` : "#"}>
                              <Phone className="mr-2 h-4 w-4" />
                              Call
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild disabled={!telecaller.email}>
                            <Link href={telecaller.email ? `mailto:${telecaller.email}` : "#"}>
                              <Mail className="mr-2 h-4 w-4" />
                              Email
                            </Link>
                          </Button>
                        </div>
                      </TableCell> */}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center">
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
