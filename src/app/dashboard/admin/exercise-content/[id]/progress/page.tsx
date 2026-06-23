"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PatientProgress {
  id: string
  name: string
  journeyDay: string
  completed: number
  total: number
  progress: number
  lastActivity: string
}

const mockPatientProgress: PatientProgress[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    journeyDay: "Day 11",
    completed: 10,
    total: 21,
    progress: 48,
    lastActivity: "2h ago",
  },
  {
    id: "2",
    name: "Priya Patel",
    journeyDay: "Day 8",
    completed: 7,
    total: 21,
    progress: 33,
    lastActivity: "1d ago",
  },
  {
    id: "3",
    name: "Amit Kumar",
    journeyDay: "Day 15",
    completed: 14,
    total: 21,
    progress: 67,
    lastActivity: "30m ago",
  },
  {
    id: "4",
    name: "Sneha Reddy",
    journeyDay: "Day 5",
    completed: 4,
    total: 21,
    progress: 19,
    lastActivity: "3h ago",
  },
]

export default function PatientProgressPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [selectedCollection, setSelectedCollection] = useState("1")
  const [patientProgress] = useState(mockPatientProgress)

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <Link href={`/dashboard/admin/exercise-content/${id}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Patient Progress
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Track completion across all patients for a collection.
          </p>
        </div>
      </div>

      {/* Collection Filter */}
      <Select value={selectedCollection} onValueChange={setSelectedCollection}>
        <SelectTrigger className="w-[280px] bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Month 1 — 21-Day Collection</SelectItem>
          <SelectItem value="2">Month 2 — 21-Day Collection</SelectItem>
          <SelectItem value="3">Month 3 — 21-Day Collection</SelectItem>
        </SelectContent>
      </Select>

      {/* Patient Progress Table */}
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Patient</TableHead>
                <TableHead className="font-semibold">Journey Day</TableHead>
                <TableHead className="font-semibold">Completed</TableHead>
                <TableHead className="font-semibold">Progress</TableHead>
                <TableHead className="font-semibold">Last Activity</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientProgress.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{patient.name}</TableCell>
                  <TableCell className="text-slate-600">{patient.journeyDay}</TableCell>
                  <TableCell className="text-slate-600">
                    {patient.completed}/{patient.total}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${patient.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 min-w-[3rem]">
                        {patient.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{patient.lastActivity}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm" className="text-indigo-600">
                      View Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
