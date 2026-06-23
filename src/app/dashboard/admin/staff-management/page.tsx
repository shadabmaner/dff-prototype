"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { DataTable, Column } from "@/components/service/data-table"
import { StatsCard } from "@/components/service/stats-card"
import { StaffFormSheet } from "@/components/service/staff-form-sheet"
import { Users, UserPlus, Stethoscope, Apple, HeartPulse, Eye, Loader2, Edit2 } from "lucide-react"
import { useStaff } from "@/hooks/use-service-api"
import { useSpecialitiesQuery } from "@/hooks/use-specialities"
import type { StaffMember } from "@/types/service-api"
import { getErrorMessage } from "@/lib/error-handler"

const ITEMS_PER_PAGE = 20

export default function AdminStaffManagementPage() {
  const [showFormSheet, setShowFormSheet] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSpeciality, setFilterSpeciality] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: staffResponse, isLoading: loading, error } = useStaff({
    staff_type: filterRole === "all" ? undefined : (filterRole as any),
    is_available: filterStatus === "all" ? undefined : filterStatus === "available",
    speciality_id: filterSpeciality === "all" ? undefined : filterSpeciality,
    search: debouncedSearchTerm || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  })

  const { data: specialitiesData } = useSpecialitiesQuery()
  const specialities = specialitiesData?.data ?? []

  const allStaff = staffResponse?.data ?? []
  const meta = staffResponse?.meta

  const handleFilterChange = (value: string) => {
    setFilterRole(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setFilterStatus(value)
    setCurrentPage(1)
  }

  const handleSpecialityChange = (value: string) => {
    setFilterSpeciality(value)
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const columns: Column<StaffMember>[] = [
    {
      header: "Name & Contact",
      cell: (row) => (
        <div>
          <p className="font-semibold text-[var(--foreground)] capitalize">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{row.phone || "No phone"}</p>
          {row.email && <p className="text-xs text-[var(--muted-foreground)]">{row.email}</p>}
        </div>
      ),
    },
    {
      header: "Role & Specialization",
      cell: (row) => (
        <div>
          <p className="font-medium text-[var(--foreground)] capitalize">
            {row.staff_type.replace(/_/g, " ")}
          </p>
          {row.speciality_name && (
            <p className="text-xs text-[var(--primary)]">{row.speciality_name}</p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge className={row.is_available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]"}>
          {row.is_available ? "AVAILABLE" : "UNAVAILABLE"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingStaff(row)
              setShowFormSheet(true)
            }}
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Link href={`/dashboard/admin/staff-management/${row.id}?name=${encodeURIComponent(`${row.first_name} ${row.last_name}`)}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  const doctors = allStaff.filter(s => s.staff_type === "doctor")
  const dietitian = allStaff.filter((s: any) => s.staff_type === "dietitian")
  const fitnessCoaches = allStaff.filter(s => s.staff_type === "fitness_coach")

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-rose-600 font-semibold">Error loading staff</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">{getErrorMessage(error)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              Staff Management
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Manage clinical professionals and their assignments
              {meta && (
                <span className="ml-2 text-[var(--muted-foreground)]">
                  · {meta.total} total staff
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingStaff(null)
              setShowFormSheet(true)
            }}
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)/80] hover:from-[var(--primary)/90] hover:to-[var(--primary)/70] text-white shadow-lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* {loading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </>
        ) : (
          <> */}
            <StatsCard
              title="Total Staff"
              value={(meta?.total ?? allStaff.length).toString()}
              subtitle="All staff members"
              icon={Users}
              colorScheme="blue"
            />
            <StatsCard
              title="Doctors"
              value={doctors.length.toString()}
              subtitle="Active doctors"
              icon={Stethoscope}
              colorScheme="purple"
            />
            <StatsCard
              title="Dietitians"
              value={dietitian.length.toString()}
              subtitle="Active nutritionists"
              icon={Apple}
              colorScheme="emerald"
            />
            <StatsCard
              title="Fitness Coaches"
              value={fitnessCoaches.length.toString()}
              subtitle="Active coaches"
              icon={HeartPulse}
              colorScheme="rose"
            />
          {/* </>
        )} */}
      </div>

      <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-[var(--foreground)]">
              Staff Directory
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="dietitian">Dietitian</SelectItem>
                  <SelectItem value="fitness_coach">Fitness Coaches</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSpeciality} onValueChange={handleSpecialityChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Speciality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialities</SelectItem>
                  {specialities.map((spec: any) => (
                    <SelectItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Input
            placeholder="Search staff by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--border)]">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              data={allStaff}
              columns={columns}
              serverMeta={meta}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              enablePagination={true}
              showSearch={false}
            />
          )}
        </CardContent>
      </Card>

      <StaffFormSheet
        open={showFormSheet}
        onOpenChange={setShowFormSheet}
        staff={editingStaff}
      />
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {children}
    </span>
  )
}
