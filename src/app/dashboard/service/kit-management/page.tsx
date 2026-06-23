"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/service/data-table"
import { StatsCard } from "@/components/service/stats-card"
import { Package, PackageCheck, Truck, Search, Loader2, Edit } from "lucide-react"
import { usePatients, useUpdateKitEligibility } from "@/hooks/use-service-api"
import type { PatientListItem } from "@/types/service-api"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function KitManagementPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<PatientListItem | null>(null)
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false)
  const [newStatus, setNewStatus] = useState<"eligible_for_kit" | "initiated" | "dispatched">("eligible_for_kit")
  const specialityId = "c645fc87-cb78-4f23-97e8-3a5282912901"

  const updateKitMutation = useUpdateKitEligibility()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: response, isLoading: loading, error } = usePatients({
    page,
    limit: 10,
    speciality_id: specialityId,
    search: debouncedSearchTerm || undefined
  })

  const patients = response?.data && response.data.length > 0 ? response.data : []
  const meta = response?.meta || { total: patients.length, page: 1, limit: 20, totalPages: 1 }

  const handleUpdateKit = (patient: PatientListItem, status: "eligible_for_kit" | "initiated" | "dispatched") => {
    setSelectedPatient(patient)
    setNewStatus(status)
    setShowUpdateDrawer(true)
  }

  const handleConfirmUpdate = async () => {
    if (!selectedPatient) return

    try {
      await updateKitMutation.mutateAsync({
        patientId: selectedPatient.patient_id,
        status: newStatus,
      })
      toast.success("Kit eligibility status updated successfully")
      setShowUpdateDrawer(false)
      setSelectedPatient(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update kit eligibility")
    }
  }

  const getKitStatusBadge = (status?: string | null) => {
    if (!status) return <Badge variant="outline" className="bg-slate-50 text-slate-600">Not Eligible</Badge>
    
    switch (status) {
      case "eligible_for_kit":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Eligible</Badge>
      case "initiated":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Initiated</Badge>
      case "dispatched":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Dispatched</Badge>
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-600">{status}</Badge>
    }
  }

  const columns: Column<PatientListItem>[] = [
    {
      header: "Patient Name",
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
        <div>
          <p className="font-medium text-slate-900">{row.program_name}</p>
          <p className="text-xs text-slate-500">{row.duration_days} days</p>
        </div>
      ),
    },
    {
      header: "Kit Status",
      cell: (row) =>
        //@ts-ignore
        getKitStatusBadge(row.supplement_kit_eligibility),
    },
    {
      header: "Enrollment Status",
      cell: (row) => (
        <Badge variant="outline" className={
          row.enrollment_status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
          row.enrollment_status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200" :
          "bg-slate-50 text-slate-600"
        }>
          {row.enrollment_status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          { row.supplement_kit_eligibility === "eligible_for_kit" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateKit(row, "initiated")}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Package className="h-3 w-3 mr-1" />
              Initiate Kit
            </Button>
          ) : null}
          
          {row.supplement_kit_eligibility === "initiated" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateKit(row, "dispatched")}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Package  className="h-3 w-3 mr-1" />
              Initiated Kit
            </Button>
          ) : null}
          {row.supplement_kit_eligibility === "dispatched" ? (
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 cursor-default"
            >
              <Truck className="h-3 w-3 mr-1" />
              Dispatched Kit
            </Button>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedPatient(row)
              setNewStatus(row.supplement_kit_eligibility as any || "eligible_for_kit")
              setShowUpdateDrawer(true)
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
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
  const eligibleCount = patients.filter(p => p.supplement_kit_eligibility === "eligible_for_kit").length
  const initiatedCount = patients.filter(p => p.supplement_kit_eligibility === "initiated").length
  const dispatchedCount = patients.filter(p => p.supplement_kit_eligibility === "dispatched").length

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Kit Management
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Supplement Kit Management
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Track and manage supplement kit eligibility and dispatch status
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
              subtitle="All enrolled"
              icon={Package}
              colorScheme="blue"
            />
            <StatsCard
              title="Eligible for Kit"
              value={eligibleCount.toString()}
              subtitle="Ready to initiate"
              icon={PackageCheck}
              colorScheme="emerald"
            />
            <StatsCard
              title="Initiated"
              value={initiatedCount.toString()}
              subtitle="Awaiting dispatch"
              icon={Package}
              colorScheme="amber"
            />
            <StatsCard
              title="Dispatched"
              value={dispatchedCount.toString()}
              subtitle="Successfully sent"
              icon={Truck}
              colorScheme="purple"
            />
          </>
        )}
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">
              Kit Eligibility List
            </CardTitle>
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
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              data={patients}
              columns={columns}
              searchPlaceholder="Search patients by name or phone..."
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

      {/* Update Kit Eligibility Drawer */}
      <Sheet open={showUpdateDrawer} onOpenChange={setShowUpdateDrawer}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900">
              Update Kit Eligibility Status
            </SheetTitle>
            <SheetDescription className="text-slate-600">
              Update the supplement kit eligibility status for {selectedPatient?.first_name} {selectedPatient?.last_name}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Patient Info</p>
              <p className="font-semibold text-slate-900">{selectedPatient?.first_name} {selectedPatient?.last_name}</p>
              <p className="text-sm text-slate-600">{selectedPatient?.phone}</p>
              <p className="text-sm text-slate-600 mt-1">{selectedPatient?.program_name}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Current Status
              </Label>
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                {getKitStatusBadge(selectedPatient?.supplement_kit_eligibility)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                New Status *
              </Label>
              <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                <SelectTrigger className="h-11 border-slate-300 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eligible_for_kit">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Eligible for Kit
                    </div>
                  </SelectItem>
                  <SelectItem value="initiated">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Initiated
                    </div>
                  </SelectItem>
                  <SelectItem value="dispatched">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Dispatched
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Updating the status will trigger notifications and update the lead status accordingly.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUpdateDrawer(false)}
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                disabled={updateKitMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpdate}
                className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
                disabled={updateKitMutation.isPending}
              >
                {updateKitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
