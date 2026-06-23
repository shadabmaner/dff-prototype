"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/service/data-table"
import { StatusBadge } from "@/components/service/status-badge"
import { StatsCard } from "@/components/service/stats-card"
import { RefreshCcw, CheckCircle2, Clock, XCircle, Eye } from "lucide-react"
import type { PlanChangeRequest } from "@/types/service"

const mockRequests: PlanChangeRequest[] = [
  {
    id: "PCR001",
    patientId: "PT001",
    patientName: "Rahul Kumar",
    currentPlan: "Weight Loss - Phase 1",
    requestedChange: "Increase protein intake to 120g/day",
    reason: "Not feeling satiated with current meal plan",
    status: "pending",
    requestedAt: "2026-03-10T10:00:00Z"
  },
  {
    id: "PCR002",
    patientId: "PT002",
    patientName: "Priya Sharma",
    currentPlan: "Diabetes Care - Month 2",
    requestedChange: "Add evening snack option",
    reason: "Experiencing low blood sugar in evenings",
    status: "approved",
    requestedAt: "2026-03-09T14:30:00Z",
    reviewedAt: "2026-03-09T16:00:00Z",
    reviewedBy: "Dt. Sharma"
  },
  {
    id: "PCR003",
    patientId: "PT003",
    patientName: "Amit Verma",
    currentPlan: "PCOS Management - Week 3",
    requestedChange: "Replace gym workout with home exercises",
    reason: "Unable to access gym facilities",
    status: "in_review",
    requestedAt: "2026-03-11T09:15:00Z"
  }
]

export default function PlanChangesPage() {
  const [requests, setRequests] = useState<PlanChangeRequest[]>(mockRequests)

  const columns: Column<PlanChangeRequest>[] = [
    {
      header: "Request ID",
      accessorKey: "id",
    },
    {
      header: "Patient",
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.patientName}</p>
          <p className="text-xs text-slate-500">{row.patientId}</p>
        </div>
      ),
    },
    {
      header: "Current Plan",
      cell: (row) => (
        <p className="text-sm text-slate-700">{row.currentPlan}</p>
      ),
    },
    {
      header: "Requested Change",
      cell: (row) => (
        <div className="max-w-xs">
          <p className="text-sm text-slate-900 font-medium">{row.requestedChange}</p>
          {row.reason && (
            <p className="text-xs text-slate-500 mt-1">{row.reason}</p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} type="planChange" />,
    },
    {
      header: "Requested Date",
      cell: (row) => (
        <p className="text-xs text-slate-600">{new Date(row.requestedAt).toLocaleDateString()}</p>
      ),
    },
    {
      header: "Reviewed By",
      cell: (row) => (
        <p className="text-xs text-slate-600">{row.reviewedBy || "Pending"}</p>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "pending" || row.status === "in_review" ? (
            <>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Approve
              </Button>
              <Button size="sm" variant="outline" className="text-rose-600 hover:text-rose-700">
                Reject
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Plan Change Requests
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Plan Change Requests
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Review and manage patient plan modification requests
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Requests"
          value="24"
          subtitle="All requests"
          icon={RefreshCcw}
          colorScheme="blue"
        />
        <StatsCard
          title="Pending Review"
          value="8"
          subtitle="Awaiting action"
          icon={Clock}
          colorScheme="amber"
        />
        <StatsCard
          title="Approved"
          value="14"
          subtitle="This month"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatsCard
          title="Rejected"
          value="2"
          subtitle="This month"
          icon={XCircle}
          colorScheme="rose"
        />
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Change Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable
            data={requests}
            columns={columns}
            searchPlaceholder="Search requests by patient or plan..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
