"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, Column } from "@/components/service/data-table"
import { StatusBadge } from "@/components/service/status-badge"
import { StatsCard } from "@/components/service/stats-card"
import { Users, Activity, Clock, CheckCircle2, Eye, Search, Filter, Loader2 } from "lucide-react"
import { usePatients } from "@/hooks/use-service-api"
import type { PatientListItem } from "@/types/service-api"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PatientManagementPage() {
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterProgramStatus, setFilterProgramStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [specialityId, setSpecialityId] = useState<string>("c645fc87-cb78-4f23-97e8-3a5282912901")

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: response, isLoading: loading, error } = usePatients({
    page,
    limit: 20,
    speciality_id: specialityId,
    enrollment_status: filterStatus === "all" ? undefined : filterStatus,
    search: debouncedSearchTerm || undefined
  })

  const patients = response?.data && response.data.length > 0 ? response.data : []
  const meta = response?.meta || { total: patients.length, page: 1, limit: 20, totalPages: 1 }

  // Filter patients by program status
  const filteredPatients = patients.filter((patient) => {
    const programStatus = (patient as any).program_status || null;
    
    if (filterProgramStatus === "all") return true;
    if (filterProgramStatus === "not_assigned") return !programStatus;
    return programStatus === filterProgramStatus;
  });

  const columns: Column<PatientListItem>[] = [
    {
      header: "Patient ID",
      cell: (row) => <p className="text-xs font-mono">{row.first_name?.charAt(0)} {row.last_name?.charAt(0)}</p>,
    },
    {
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      header: "Program",
      cell: (row) => (
        <TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="w-[100px] cursor-pointer">
        <p className="font-medium text-slate-900 truncate">
          {row.program_name}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {row.duration_days} days • {row.speciality_name}
        </p>
      </div>
    </TooltipTrigger>

    <TooltipContent>
      <p>{row.program_name}</p>
      <p className="text-xs">
        {row.duration_days} days • {row.speciality_name}
      </p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
      ),
    },
    {
      header: "Doctor",
      cell: (row) => (
        <p className="text-sm text-slate-700">
          {row.doctor_first_name && row.doctor_last_name
            ? `${row.doctor_first_name} ${row.doctor_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Dietitian",
      cell: (row) => (
        <p className="text-sm text-slate-700">
          {row.dietician_first_name && row.dietician_last_name
            ? `${row.dietician_first_name} ${row.dietician_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Fitness Coach",
      cell: (row) => (
        <p className="text-sm text-slate-700">
          {row.physio_first_name && row.physio_last_name
            ? `${row.physio_first_name} ${row.physio_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.enrollment_status} type="patient" />,
    },
    {
      header: "Assessment",
      cell: (row) => (
        <div>
          {row.assessment_status ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700">{row.assessment_status}</p>
              {row.severity_level && (
                <span className={`text-xs font-semibold ${
                  row.severity_level === "high" ? "text-rose-600" :
                  row.severity_level === "medium" ? "text-amber-600" :
                  "text-emerald-600"
                }`}>
                  {row.severity_level.toUpperCase()}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400">Not assessed</span>
          )}
        </div>
      ),
    },
    {
      header: "History Call",
      cell: (row) => (
        <div>
          {row.history_call_status ? (
            
<div className="space-y-1">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block cursor-pointer">
          <StatusBadge status={row.history_call_status} type="call" />
        </div>
      </TooltipTrigger>

      {row.history_call_date && (
        <TooltipContent>
          {new Date(row.history_call_date).toLocaleDateString()}
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
</div>
          ) : (
            <span className="text-xs text-slate-400">Not scheduled</span>
          )}
        </div>
      ),
    },
    {
      header: "Pending Actions",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {!row.history_call_status && row.assessment_status === "completed" && (
            <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 text-xs">
              Pending History Call
            </Badge>
          )}
          {row.history_call_status === "confirmed" && !(row as any).program_recommendation_status && (
            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 text-xs">
              Pending Program Recommendation
            </Badge>
          )}
          {row.enrollment_status === "active" && !(row as any).consultation_scheduled && (
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
              Pending Consultation
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Program Status",
      cell: (row) => {
        const programStatus = (row as any).program_status || null;
        const recommendedProgram = (row as any).recommended_program || null;
        
        if (programStatus === "recommended" && recommendedProgram) {
          return (
            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 text-xs">
              Recommended: {recommendedProgram}
            </Badge>
          );
        } else if (programStatus === "accepted") {
          return (
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
              Program Accepted
            </Badge>
          );
        } else if (programStatus === "assigned") {
          return (
            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-xs">
              Program Assigned
            </Badge>
          );
        } else {
          return (
            <span className="text-xs text-slate-400">Not assigned</span>
          );
        }
      },
    },
    {
      header: "Actions",
      cell: (row) => (
        <Link href={`/dashboard/service/patients/${row.patient_id}?first_name=${encodeURIComponent(row.first_name || '')}&last_name=${encodeURIComponent(row.last_name || '')}`}>
          <Button variant="outline" size="sm">
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </Link>
      ),
    },
  ]

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-rose-600 font-semibold">Error loading patients</p>
          <p className="text-sm text-slate-600 mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const totalPatients = meta?.total || 0
  const activePatients = patients.filter(p => p.enrollment_status === "active").length

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Patient Management
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Patient Management
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Manage all active and historical patients
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Patients"
              value={totalPatients.toString()}
              subtitle="All registered"
              icon={Users}
              colorScheme="blue"
            />
            <StatsCard
              title="Active Patients"
              value={activePatients.toString()}
              subtitle="Currently enrolled"
              icon={Activity}
              colorScheme="emerald"
            />
            <StatsCard
              title="High Severity"
              value={patients.filter(p => p.severity_level === "high").length.toString()}
              subtitle="Require attention"
              icon={Clock}
              colorScheme="amber"
            />
            <StatsCard
              title="Completed"
              value={patients.filter(p => p.enrollment_status === "completed").length.toString()}
              subtitle="Program finished"
              icon={CheckCircle2}
              colorScheme="purple"
            />
          </>
        )}
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">
              Patient List
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={filterProgramStatus} onValueChange={setFilterProgramStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Program Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Program Status</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="not_assigned">Not Assigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/6" />
                  </div>
                  <Skeleton className="h-4 w-1/5" />
                  <Skeleton className="h-4 w-1/5" />
                  <Skeleton className="h-4 w-1/5" />
                  <Skeleton className="h-4 w-1/5" />
                  <Skeleton className="h-4 w-1/5" />
                  <Skeleton className="h-4 w-1/5" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              data={filteredPatients}
              columns={columns}
              searchPlaceholder="Search patients by name, phone, or ID..."
              searchValue={searchTerm}
              onSearch={setSearchTerm}
              enablePagination={true}
              serverMeta={meta as any}
              currentPage={page}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
