"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable, Column } from "@/components/service/data-table"
import { StatusBadge } from "@/components/service/status-badge"
import { StatsCard } from "@/components/service/stats-card"
import { UserCheck, Users, Stethoscope, Apple, HeartPulse, Plus } from "lucide-react"

interface Assignment {
  id: string
  patientId: string
  patientName: string
  program: string
  doctor?: string
  dietitian?: string
  physiotherapist?: string
  assignedDate: string
  status: "active" | "inactive"
}

const mockAssignments: Assignment[] = [
  {
    id: "A001",
    patientId: "PT001",
    patientName: "Rahul Kumar",
    program: "Weight Loss",
    doctor: "Dr. Mehta",
    dietitian: "Dt. Sharma",
    physiotherapist: "Pt. Reddy",
    assignedDate: "2026-02-16",
    status: "active"
  },
  {
    id: "A002",
    patientId: "PT002",
    patientName: "Priya Sharma",
    program: "Diabetes Care",
    doctor: "Dr. Singh",
    dietitian: "Dt. Patel",
    assignedDate: "2026-02-20",
    status: "active"
  }
]

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments)
  const [showAssignModal, setShowAssignModal] = useState(false)

  const columns: Column<Assignment>[] = [
    {
      header: "Assignment ID",
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
      header: "Program",
      accessorKey: "program",
    },
    {
      header: "Doctor",
      cell: (row) => (
        <p className="text-sm text-slate-700">{row.doctor || "Not assigned"}</p>
      ),
    },
    {
      header: "Dietitian",
      cell: (row) => (
        <p className="text-sm text-slate-700">{row.dietitian || "Not assigned"}</p>
      ),
    },
    {
      header: "Physiotherapist",
      cell: (row) => (
        <p className="text-sm text-slate-700">{row.physiotherapist || "Not assigned"}</p>
      ),
    },
    {
      header: "Assigned Date",
      cell: (row) => (
        <p className="text-xs text-slate-600">{row.assignedDate}</p>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} type="patient" />,
    },
    {
      header: "Actions",
      cell: (row) => (
        <Button variant="outline" size="sm">
          Edit Assignment
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Assignments
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Staff Assignments
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Manage doctor, dietitian, and physiotherapist allocations
            </p>
          </div>
          <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assign Healthcare Staff</DialogTitle>
              </DialogHeader>
              <AssignmentForm onClose={() => setShowAssignModal(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Assignments"
          value="156"
          subtitle="All active assignments"
          icon={UserCheck}
          colorScheme="blue"
        />
        <StatsCard
          title="Doctor Assignments"
          value="48"
          subtitle="Active allocations"
          icon={Stethoscope}
          colorScheme="purple"
        />
        <StatsCard
          title="Dietitian Assignments"
          value="52"
          subtitle="Active allocations"
          icon={Apple}
          colorScheme="emerald"
        />
        <StatsCard
          title="Physio Assignments"
          value="28"
          subtitle="Active allocations"
          icon={HeartPulse}
          colorScheme="rose"
        />
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Assignment List</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable
            data={assignments}
            columns={columns}
            searchPlaceholder="Search assignments..."
          />
        </CardContent>
      </Card>
    </div>
  )
}

function AssignmentForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Patient Selection</h3>
        <div className="space-y-2">
          <Label>Select Patient</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choose patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PT001">PT001 - Rahul Kumar</SelectItem>
              <SelectItem value="PT002">PT002 - Priya Sharma</SelectItem>
              <SelectItem value="PT003">PT003 - Amit Verma</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Staff Assignment</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Select Doctor</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="D001">Dr. Mehta - General Physician</SelectItem>
                <SelectItem value="D002">Dr. Singh - Diabetologist</SelectItem>
                <SelectItem value="D003">Dr. Kumar - Cardiologist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Select Dietitian</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose dietitian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DT001">Dt. Sharma - Weight Management</SelectItem>
                <SelectItem value="DT002">Dt. Patel - Diabetes Care</SelectItem>
                <SelectItem value="DT003">Dt. Gupta - PCOS Specialist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Select Physiotherapist (Optional)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose physiotherapist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PT001">Pt. Reddy - Sports Therapy</SelectItem>
                <SelectItem value="PT002">Pt. Iyer - Orthopedic</SelectItem>
                <SelectItem value="PT003">Pt. Das - Rehabilitation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assignment Notes</Label>
        <Textarea placeholder="Add any special instructions or notes..." rows={3} />
      </div>

      <div className="flex gap-3">
        <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Assign Staff</Button>
      </div>
    </div>
  )
}
