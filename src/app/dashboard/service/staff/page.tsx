"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, Column } from "@/components/service/data-table"
import { StatsCard } from "@/components/service/stats-card"
import { StaffFormSheet } from "@/components/service/staff-form-sheet"
import { Users, UserPlus, Stethoscope, Apple, HeartPulse, Eye, Loader2, MapPin, Languages, Edit2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useStaff } from "@/hooks/use-service-api"
import type { StaffMember } from "@/types/service-api"
import { getErrorMessage } from "@/lib/error-handler"

export default function StaffManagementPage() {
  const [showFormSheet, setShowFormSheet] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [filterRole, setFilterRole] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const { data: staffResponse, isLoading: loading, error } = useStaff({
    staff_type: filterRole === "all" ? undefined : (filterRole as any),
    search: searchTerm || undefined,
  })

  const allStaff = staffResponse?.data ?? []

  const columns: Column<StaffMember>[] = [
    {
      header: "Staff ID",
      cell: (row) => <p className="text-xs font-mono">{row.id.slice(0, 8)}...</p>,
    },
    {
      header: "Name & Contact",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-slate-500">{row.phone || "No phone"}</p>
          {row.email && <p className="text-xs text-slate-400">{row.email}</p>}
        </div>
      ),
    },
    {
      header: "Role & Specialization",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900 capitalize">
            {row.role_name || row.staff_type.replace(/_/g, " ")}
          </p>
          {row.speciality_name && (
            <p className="text-xs text-blue-600">{row.speciality_name}</p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge className={row.is_available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-700 border-slate-200"}>
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
          <Link href={`/dashboard/service/staff/${row.id}`}>
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
  const dietitian = allStaff.filter((s:any) => s.staff_type === "dietitian")
  const fitnessCoaches = allStaff.filter(s => s.staff_type === "fitness_coach")

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-rose-600 font-semibold">Error loading staff</p>
          <p className="text-sm text-slate-600 mt-2">{getErrorMessage(error)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Staff Management
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Staff Management
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Manage healthcare staff and their assignments
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingStaff(null)
              setShowFormSheet(true)
            }}
            className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
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
              title="Total Staff"
              value={allStaff.length.toString()}
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
          </>
        )}
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">
              Staff Directory
            </CardTitle>
            <Select value={filterRole} onValueChange={setFilterRole}>
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
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              data={allStaff}
              columns={columns}
              searchPlaceholder="Search staff by name, email, or phone..."
              searchValue={searchTerm}
              onSearch={setSearchTerm}
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
