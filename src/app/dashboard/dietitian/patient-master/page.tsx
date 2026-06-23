"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Search,
  RefreshCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  Users,
  SlidersHorizontal,
  ClipboardList,
} from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { dietitianPatients } from "../data"

const pageSizeOptions = [10, 25, 50, 100]
const defaultComplianceRange: [number, number] = [0, 100]
// const CLEAR_OPTION_VALUE = "__ALL__"

type SortKey = "name" | "age" | "compliancePercentage" | "nextReviewDate" | "programStatus"

type Filters = {
  batch: string | null
  specialty: string | null
  programStatus: string | null
  dietPlanStatus: string | null
  reviewStatus: string | null
  compliance: [number, number]
  enrollmentStart: string | null
  enrollmentEnd: string | null
}

const programStatusColor: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Pending: "bg-slate-100 text-slate-600",
  Completed: "bg-blue-100 text-blue-700",
  Paused: "bg-amber-100 text-amber-700",
}

const reviewStatusColor: Record<string, string> = {
  Due: "bg-amber-100 text-amber-700",
  Overdue: "bg-rose-100 text-rose-600",
  Completed: "bg-emerald-100 text-emerald-700",
}

export default function DietitianPatientMasterPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Filters>({
    batch: null,
    specialty: null,
    programStatus: null,
    dietPlanStatus: null,
    reviewStatus: null,
    compliance: defaultComplianceRange,
    enrollmentStart: null,
    enrollmentEnd: null,
  })
  const [sortKey, setSortKey] = useState<SortKey>("nextReviewDate")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const batches = useMemo(() => Array.from(new Set(dietitianPatients.map((p) => p.batchName))), [])
  const specialties = useMemo(() => Array.from(new Set(dietitianPatients.map((p) => p.specialty))), [])
  const programStatuses = useMemo(() => Array.from(new Set(dietitianPatients.map((p) => p.programStatus))), [])
  const dietStatuses = useMemo(() => Array.from(new Set(dietitianPatients.map((p) => p.dietPlanStatus))), [])
  const reviewStatuses = useMemo(() => Array.from(new Set(dietitianPatients.map((p) => p.reviewStatus))), [])

  const filteredPatients = useMemo(() => {
    return dietitianPatients
      .filter((patient) => {
        const haystack = `${patient.name} ${patient.patientCode} ${patient.mobile} ${patient.batchName} ${patient.programName}`.toLowerCase()
        if (search && !haystack.includes(search.toLowerCase())) return false
        if (filters.batch && patient.batchName !== filters.batch) return false
        if (filters.specialty && patient.specialty !== filters.specialty) return false
        if (filters.programStatus && patient.programStatus !== filters.programStatus) return false
        if (filters.dietPlanStatus && patient.dietPlanStatus !== filters.dietPlanStatus) return false
        if (filters.reviewStatus && patient.reviewStatus !== filters.reviewStatus) return false
        if (patient.compliancePercentage < filters.compliance[0] || patient.compliancePercentage > filters.compliance[1]) return false
        if (filters.enrollmentStart && patient.enrollmentDate < filters.enrollmentStart) return false
        if (filters.enrollmentEnd && patient.enrollmentDate > filters.enrollmentEnd) return false
        return true
      })
      .sort((a, b) => {
        let compare = 0
        switch (sortKey) {
          case "name": compare = a.name.localeCompare(b.name); break
          case "age": compare = a.age - b.age; break
          case "compliancePercentage": compare = a.compliancePercentage - b.compliancePercentage; break
          case "programStatus": compare = a.programStatus.localeCompare(b.programStatus); break
          case "nextReviewDate": default: compare = a.nextReviewDate.localeCompare(b.nextReviewDate); break
        }
        return sortDir === "asc" ? compare : -compare
      })
  }, [search, filters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateFilter = <Key extends keyof Filters>(key: Key, value: Filters[Key]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({ batch: null, specialty: null, programStatus: null, dietPlanStatus: null, reviewStatus: null, compliance: defaultComplianceRange, enrollmentStart: null, enrollmentEnd: null })
    setSearch("")
    setPage(1)
    setPageSize(pageSizeOptions[0])
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Patient Master</p>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Portfolio Grid</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, filter, and triage your assigned cohort.{" "}
              <span className="font-semibold text-slate-700">{filteredPatients.length} records</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={resetFilters}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn("rounded-xl gap-1.5", showFilters && "bg-slate-900 text-white border-slate-900")}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
            <Button size="sm" className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href="/dashboard/dietitian/diet-plan-management">
                <ClipboardList className="h-3.5 w-3.5" />
                Create Diet Plan
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          { label: "Total Patients", value: dietitianPatients.length, color: "text-slate-900", icon: <Users className="h-4 w-4 text-blue-500" /> },
          { label: "Active Programs", value: dietitianPatients.filter(p => p.programStatus === "Active").length, color: "text-emerald-700", icon: <span className="h-4 w-4 rounded-full bg-emerald-400 inline-block" /> },
          { label: "Pending Plans", value: dietitianPatients.filter(p => p.dietPlanStatus === "Pending").length, color: "text-amber-700", icon: <span className="h-4 w-4 rounded-full bg-amber-400 inline-block" /> },
          { label: "Overdue Reviews", value: dietitianPatients.filter(p => p.reviewStatus === "Overdue").length, color: "text-rose-700", icon: <span className="h-4 w-4 rounded-full bg-rose-400 inline-block" /> },
        ].map((s) => (
          <Card key={s.label} className="border-none shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">{s.icon}</div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-[0.15em] font-semibold">{s.label}</p>
                <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b border-slate-100/70 pb-4">
            {/* Search row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search by patient, ID, mobile, batch, or program…"
                  className="h-11 rounded-xl border-slate-200 pl-11 text-sm focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            {/* Collapsible Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
              >
                <SelectFilter label="Batch" value={filters.batch} options={batches} placeholder="All Batches" onChange={(v) => updateFilter("batch", v || null)} />
                <SelectFilter label="Specialty" value={filters.specialty} options={specialties} placeholder="All Specialties" onChange={(v) => updateFilter("specialty", v || null)} />
                <SelectFilter label="Program Status" value={filters.programStatus} options={programStatuses} placeholder="All Statuses" onChange={(v) => updateFilter("programStatus", v || null)} />
                <SelectFilter label="Diet Plan Status" value={filters.dietPlanStatus} options={dietStatuses} placeholder="All" onChange={(v) => updateFilter("dietPlanStatus", v || null)} />
                <SelectFilter label="Review Status" value={filters.reviewStatus} options={reviewStatuses} placeholder="All" onChange={(v) => updateFilter("reviewStatus", v || null)} />
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Compliance Range</p>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} max={100} value={filters.compliance[0]} onChange={(e) => updateFilter("compliance", [Number(e.target.value) || 0, filters.compliance[1]])} className="h-10 rounded-xl" />
                    <span className="text-slate-400">–</span>
                    <Input type="number" min={0} max={100} value={filters.compliance[1]} onChange={(e) => updateFilter("compliance", [filters.compliance[0], Number(e.target.value) || 100])} className="h-10 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Enroll Start</p>
                  <Input type="date" value={filters.enrollmentStart ?? ""} onChange={(e) => updateFilter("enrollmentStart", e.target.value || null)} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Enroll End</p>
                  <Input type="date" value={filters.enrollmentEnd ?? ""} onChange={(e) => updateFilter("enrollmentEnd", e.target.value || null)} className="h-10 rounded-xl" />
                </div>
              </motion.div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {/* Pagination bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100/70 px-6 py-3">
              <p className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-900">{paginated.length}</span> of{" "}
                <span className="font-bold text-slate-900">{filteredPatients.length}</span> records
              </p>
              <div className="flex items-center gap-3">
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
                  <SelectTrigger className="h-9 w-[110px] rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((s) => (
                      <SelectItem key={s} value={String(s)}>{s} / page</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="inline-flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold text-slate-900">{currentPage} / {totalPages}</span>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                    <SortableHead label="Patient" sortKey="name" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortableHead label="Age" sortKey="age" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortableHead label="Program" sortKey="name" currentKey={sortKey} dir={sortDir} />
                    <SortableHead label="Batch" />
                    <SortableHead label="Compliance" sortKey="compliancePercentage" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortableHead label="Next Review" sortKey="nextReviewDate" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortableHead label="Status" sortKey="programStatus" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <TableHead className="pr-6 text-right text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                          <PackageOpen className="h-12 w-12" />
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">No records found</p>
                          <Button variant="outline" size="sm" className="rounded-xl mt-1" onClick={resetFilters}>Clear filters</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((patient) => (
                      <TableRow key={patient.id} className="group hover:bg-slate-50/80">
                        <TableCell>
                          <div>
                            <Link
                              href={`/dashboard/dietitian/patients/${patient.id}`}
                              className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                            >
                              {patient.name}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-slate-400">{patient.patientCode}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-200" />
                              <span className="text-[11px] text-slate-400">{patient.mobile}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-semibold text-slate-900">{patient.age}y</p>
                          <p className="text-xs text-slate-400">{patient.gender}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-semibold text-slate-900">{patient.programName}</p>
                          <p className="text-xs text-slate-400">{patient.specialty}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg text-xs font-medium">{patient.batchName}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5 min-w-[100px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className={cn(
                                "font-black",
                                patient.compliancePercentage < 60 ? "text-rose-500" :
                                  patient.compliancePercentage < 80 ? "text-amber-600" : "text-emerald-600"
                              )}>
                                {patient.compliancePercentage}%
                              </span>
                              <span className="text-slate-400">/{patient.complianceGoal}%</span>
                            </div>
                            <Progress
                              value={patient.compliancePercentage}
                              className={cn(
                                "h-1.5",
                                patient.compliancePercentage < 60 ? "[&>div]:bg-rose-500" :
                                  patient.compliancePercentage < 80 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"
                              )}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-semibold text-slate-900">{patient.nextReviewDate}</p>
                          <Badge className={cn("mt-1 text-xs border-none", reviewStatusColor[patient.reviewStatus])}>
                            {patient.reviewStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs border-none", programStatusColor[patient.programStatus])}>
                            {patient.programStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild size="sm" variant="outline" className="h-8 rounded-lg px-3 text-xs">
                              <Link href={`/dashboard/dietitian/patients/${patient.id}`}>View</Link>
                            </Button>
                            <Button asChild size="sm" className="h-8 rounded-lg px-3 text-xs bg-emerald-600 hover:bg-emerald-700">
                              <Link href={`/dashboard/dietitian/diet-plan-management?patient=${patient.id}`}>Plan</Link>
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
      </motion.div>
    </div>
  )
}

function SelectFilter({ label, value, options, placeholder, onChange }: {
  label: string; value: string | null; options: string[]; placeholder: string; onChange: (value: string | undefined) => void
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <Select value={value ?? undefined} onValueChange={(v) => onChange(v === CLEAR_OPTION_VALUE ? undefined : v)}>
        <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={CLEAR_OPTION_VALUE}>All</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function SortableHead({ label, sortKey, currentKey, dir, onSort }: {
  label: string; sortKey?: SortKey; currentKey?: SortKey; dir?: "asc" | "desc"; onSort?: (key: SortKey) => void; className?: string
}) {
  const isActive = sortKey && currentKey === sortKey
  return (
    <TableHead className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
      {onSort && sortKey ? (
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className={cn("inline-flex items-center gap-1 transition hover:text-slate-700", isActive && "text-slate-900")}
        >
          {label}
          <ArrowUpDown className={cn("h-3 w-3", isActive ? "text-emerald-500" : "text-slate-300", isActive && dir === "asc" && "rotate-180")} />
        </button>
      ) : label}
    </TableHead>
  )
}

const CLEAR_OPTION_VALUE = "__ALL__"
