"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/service/data-table"
import { StatusBadge } from "@/components/service/status-badge"
import { StatsCard } from "@/components/service/stats-card"
import { Users, Activity, Clock, CheckCircle2, Eye, Loader2 } from "lucide-react"
import { usePatients } from "@/hooks/use-service-api"
import type { PatientListItem } from "@/types/service-api"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPatientManagementPage() {
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

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
    enrollment_status: filterStatus === "all" ? undefined : filterStatus,
    search: debouncedSearchTerm || undefined
  })

  const patients = response?.data && response.data.length > 0 ? response.data : []
  const meta = response?.meta || { total: patients.length, page: 1, limit: 20, totalPages: 1 }

  const columns: Column<PatientListItem>[] = [
    {
      header: "Patient ID",
      cell: (row) => <p className="text-xs font-mono">{row.first_name?.charAt(0)} {row.last_name?.charAt(0)}</p>,
    },
    {
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-semibold text-[var(--foreground)]">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{row.phone}</p>
        </div>
      ),
    },
    {
      header: "Program",
      cell: (row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
            {row.program_name?   <div className="w-[100px] cursor-pointer">
                <p className="font-medium text-[var(--foreground)] truncate">
                  {row.program_name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {row.duration_days} days • {row.speciality_name}
                </p>
              </div> : <div className="w-[100px] flex justify-center">-</div>}
            </TooltipTrigger>
            <TooltipContent>
           {row.program_name ?<>
              <p>{row.program_name}</p>
              <p className="text-xs">
                {row.duration_days} days • {row.speciality_name}
              </p>
           </>:<></>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      header: "Doctor",
      cell: (row) => (
        <p className="text-sm text-[var(--muted-foreground)]">
          {row.doctor_first_name && row.doctor_last_name
            ? `${row.doctor_first_name} ${row.doctor_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Dietitian",
      cell: (row) => (
        <p className="text-sm text-[var(--muted-foreground)]">
          {row.dietician_first_name && row.dietician_last_name
            ? `${row.dietician_first_name} ${row.dietician_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Fitness Coach",
      cell: (row) => (
        <p className="text-sm text-[var(--muted-foreground)]">
          {row.physio_first_name && row.physio_last_name
            ? `${row.physio_first_name} ${row.physio_last_name}`
            : "Not assigned"}
        </p>
      ),
    },
    {
      header: "Status",
      cell: (row) => row.enrollment_status ? (
        <StatusBadge status={row.enrollment_status} type="patient" />
      ) : (
        <span className="text-sm text-[var(--muted-foreground)]">-</span>
      ),
    },
    {
      header: "Assessment",
      cell: (row) => {
        console.log(row.assessment_status,"row.assessment_status")
        return(
        <div>
          {row.assessment_status ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] capitalize">{row.assessment_status.split("_").join(" ")}</p>
            
            </div>
          ) : (
            <span className="text-xs text-[var(--muted-foreground)]">Not assessed</span>
          )}
        </div>
      )
    },
    },
    {
      header: "Actions",
      cell: (row) => (
        <Link href={`/dashboard/admin/patients/${row.patient_id}?name=${encodeURIComponent(`${row.first_name} ${row.last_name}`)}`}>
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
          <p className="text-sm text-[var(--muted-foreground)] mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const totalPatients = meta?.total || 0
  const activePatients = patients.filter(p => p.enrollment_status === "active").length

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              Patient Management
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Overview of all registered patients in the system
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-[var(--foreground)]">
              Patient List
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--border)]">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              data={patients}
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

