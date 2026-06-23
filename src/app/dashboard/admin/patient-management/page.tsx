"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/service/data-table"
import { StatusBadge } from "@/components/service/status-badge"
import { StatsCard } from "@/components/service/stats-card"
import { Users, Activity, Clock, CheckCircle2, Eye, Loader2 } from "lucide-react"
import { useAdminPatients } from "@/hooks/use-admin-patients"
import type { PatientListItem } from "@/types/service-api"

export default function AdminPatientManagementPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: response, isLoading: loading, error } = useAdminPatients({
    page,
    limit: 20,
    search: debouncedSearchTerm,
  })

  const patients = response?.data || []
  const meta = response?.meta || { total: 0, page: 1, totalPages: 1 }

  const columns: Column<PatientListItem>[] = [
    {
      header: "Patient ID",
      cell: (row) => <p className="text-xs font-mono">{row.patient_id}</p>,
    },
    {
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-semibold">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-slate-500">{row.phone}</p>
        </div>
      ),
    },
    {
      header: "Program",
      cell: (row) => (
        <p className="text-sm">{row.program_name}</p>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.enrollment_status} type="patient" />,
    },
    {
      header: "Actions",
      cell: (row) => (
        <Link href={`/dashboard/admin/patients/${row.patient_id}`}>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            View
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

  const totalPatients = meta.total
  const activePatients = patients.filter(p => p.enrollment_status === "active").length

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Admin / Patient Management
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

      {/* ── Stats ── */}
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

      {/* ── Table ── */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">
              Patient List
              {loading && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <DataTable
                data={patients}
                columns={columns}
                searchValue={searchTerm}
                onSearch={setSearchTerm}
                searchPlaceholder="Search patients..."
                enablePagination={false}
              />

              {/* ── Pagination ── */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-600">
                    Showing {patients.length} of {meta.total} patients
                    <span className="ml-2">(Page {meta.page} of {meta.totalPages})</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={meta.page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={meta.page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-9"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                      disabled={meta.page === meta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}