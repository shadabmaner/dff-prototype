"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, User, Calendar, FileText, Video, Users, Activity } from "lucide-react"
import Link from "next/link"

interface Patient {
  id: string
  name: string
  age: number
  programStage: "Month 1" | "Month 2" | "Month 3"
  lastConsult: string
  status: "active" | "completed" | "inactive"
  adherence: number
  riskLevel: "low" | "medium" | "high"
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Rahul Patil",
    age: 45,
    programStage: "Month 2",
    lastConsult: "Mar 8, 2026",
    status: "active",
    adherence: 88,
    riskLevel: "low"
  },
  {
    id: "2",
    name: "Priya Sharma",
    age: 38,
    programStage: "Month 1",
    lastConsult: "Mar 9, 2026",
    status: "active",
    adherence: 92,
    riskLevel: "low"
  },
  {
    id: "3",
    name: "Amit Kumar",
    age: 52,
    programStage: "Month 3",
    lastConsult: "Mar 7, 2026",
    status: "active",
    adherence: 65,
    riskLevel: "high"
  },
  {
    id: "4",
    name: "Sneha Rao",
    age: 42,
    programStage: "Month 2",
    lastConsult: "Mar 6, 2026",
    status: "active",
    adherence: 75,
    riskLevel: "medium"
  },
  {
    id: "5",
    name: "Vikram Shah",
    age: 48,
    programStage: "Month 3",
    lastConsult: "Feb 28, 2026",
    status: "completed",
    adherence: 95,
    riskLevel: "low"
  },
]

export default function PatientsListClient() {
  const [patients] = useState(mockPatients)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    const matchesStage = stageFilter === "all" || patient.programStage === stageFilter
    const matchesRisk = riskFilter === "all" || patient.riskLevel === riskFilter
    return matchesSearch && matchesStatus && matchesStage && matchesRisk
  })

  const activeCount = patients.filter(p => p.status === "active").length
  const completedCount = patients.filter(p => p.status === "completed").length
  const highRiskCount = patients.filter(p => p.riskLevel === "high" && p.status === "active").length

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">Manage all your patients and their programs</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <p className="text-3xl font-bold">{activeCount}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Programs</p>
                <p className="text-3xl font-bold">{completedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-3xl font-bold">{highRiskCount}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Month 1">Month 1</SelectItem>
              <SelectItem value="Month 2">Month 2</SelectItem>
              <SelectItem value="Month 3">Month 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Program Stage</TableHead>
                <TableHead>Last Consult</TableHead>
                <TableHead>Adherence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.programStage}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {patient.lastConsult}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[100px] h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              patient.adherence >= 80
                                ? "bg-green-500"
                                : patient.adherence >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${patient.adherence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{patient.adherence}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            patient.status === "active"
                              ? "default"
                              : patient.status === "completed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {patient.status}
                        </Badge>
                        {patient.riskLevel === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            High Risk
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/dietitian/patients/${patient.id}`}>
                          <Button size="sm" variant="outline">
                            <User className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-1" />
                          Book
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Notes
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
