'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PatientRow {
  id: string
  patientId: string
  name: string
  age: number
  mobile: string
  batch: string
  specialty: string
  programStatus: 'Active' | 'On Hold' | 'Completed'
  compliance: number
  nextFollowUp: string
  followUpStatus: 'Due' | 'Overdue' | 'Completed'
  enrollmentDate: string
}

const dummyPatients: PatientRow[] = [
  {
    id: '1',
    patientId: 'PHY-001',
    name: 'Aarav Gupta',
    age: 42,
    mobile: '+91 90000 11111',
    batch: 'Batch A',
    specialty: 'Orthopedic',
    programStatus: 'Active',
    compliance: 88,
    nextFollowUp: '2026-03-06',
    followUpStatus: 'Due',
    enrollmentDate: '2026-01-15',
  },
  {
    id: '2',
    patientId: 'PHY-002',
    name: 'Mira Shah',
    age: 36,
    mobile: '+91 90000 22222',
    batch: 'Batch B',
    specialty: 'Neurological',
    programStatus: 'Active',
    compliance: 76,
    nextFollowUp: '2026-03-04',
    followUpStatus: 'Overdue',
    enrollmentDate: '2025-12-28',
  },
  {
    id: '3',
    patientId: 'PHY-003',
    name: 'Kabir Iyer',
    age: 29,
    mobile: '+91 90000 33333',
    batch: 'Batch A',
    specialty: 'Sports Rehab',
    programStatus: 'On Hold',
    compliance: 52,
    nextFollowUp: '2026-03-10',
    followUpStatus: 'Due',
    enrollmentDate: '2026-02-05',
  },
  {
    id: '4',
    patientId: 'PHY-004',
    name: 'Dia Fernandes',
    age: 54,
    mobile: '+91 90000 44444',
    batch: 'Batch C',
    specialty: 'Cardiopulmonary',
    programStatus: 'Completed',
    compliance: 94,
    nextFollowUp: '2026-02-27',
    followUpStatus: 'Completed',
    enrollmentDate: '2025-11-30',
  },
  {
    id: '5',
    patientId: 'PHY-005',
    name: 'Saanvi Nair',
    age: 47,
    mobile: '+91 90000 55555',
    batch: 'Batch D',
    specialty: 'Pediatric',
    programStatus: 'Active',
    compliance: 63,
    nextFollowUp: '2026-03-02',
    followUpStatus: 'Due',
    enrollmentDate: '2026-01-05',
  },
  {
    id: '6',
    patientId: 'PHY-006',
    name: 'Eshaan Rao',
    age: 31,
    mobile: '+91 90000 66666',
    batch: 'Batch B',
    specialty: 'Neurological',
    programStatus: 'Active',
    compliance: 71,
    nextFollowUp: '2026-03-08',
    followUpStatus: 'Due',
    enrollmentDate: '2026-02-01',
  },
]

type SortKey = keyof Pick<PatientRow, 'name' | 'age' | 'compliance' | 'nextFollowUp' | 'programStatus'>

export default function PhysioAssignedPatientsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [programStatusFilter, setProgramStatusFilter] = useState('')
  const [complianceRange, setComplianceRange] = useState('')
  const [followUpStatusFilter, setFollowUpStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'nextFollowUp',
    direction: 'asc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const filteredPatients = useMemo(() => {
    return dummyPatients.filter((patient) => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        patient.name.toLowerCase().includes(search) ||
        patient.patientId.toLowerCase().includes(search) ||
        patient.mobile.includes(searchTerm) ||
        patient.batch.toLowerCase().includes(search)

      const matchesBatch = !batchFilter || patient.batch === batchFilter
      const matchesSpecialty = !specialtyFilter || patient.specialty === specialtyFilter
      const matchesProgramStatus = !programStatusFilter || patient.programStatus === programStatusFilter
      const matchesFollowUp = !followUpStatusFilter || patient.followUpStatus === followUpStatusFilter

      let matchesCompliance = true
      if (complianceRange) {
        const [min, max] = complianceRange.split('-').map(Number)
        matchesCompliance = patient.compliance >= min && patient.compliance <= max
      }

      let matchesDate = true
      if (dateRange.start && dateRange.end) {
        const enrolled = new Date(patient.enrollmentDate).getTime()
        matchesDate =
          enrolled >= new Date(dateRange.start).getTime() &&
          enrolled <= new Date(dateRange.end).getTime()
      }

      return (
        matchesSearch &&
        matchesBatch &&
        matchesSpecialty &&
        matchesProgramStatus &&
        matchesCompliance &&
        matchesFollowUp &&
        matchesDate
      )
    })
  }, [searchTerm, batchFilter, specialtyFilter, programStatusFilter, complianceRange, followUpStatusFilter, dateRange])

  const sortedPatients = useMemo(() => {
    const sorted = [...filteredPatients].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredPatients, sortConfig])

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedPatients.slice(start, start + itemsPerPage)
  }, [sortedPatients, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(sortedPatients.length / itemsPerPage))

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Assigned Patients</h1>
        <p className="text-sm text-slate-500">
          Manage assigned patients, track exercise plan adherence, and monitor follow-up commitments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Master</CardTitle>
          <CardDescription>Showing {paginatedPatients.length} of {sortedPatients.length} records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by patient name, ID, mobile, or batch"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="w-full lg:w-auto" onClick={() => setShowFilters((prev) => !prev)}>
              <Filter className="mr-2 h-4 w-4" /> Filters
              {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          {showFilters && (
            <div className="grid gap-4 rounded-xl border bg-slate-50/50 p-4 md:grid-cols-2 xl:grid-cols-3">
              <Select value={batchFilter || 'all'} onValueChange={(value) => {
                setBatchFilter(value === 'all' ? '' : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="Batch A">Batch A</SelectItem>
                  <SelectItem value="Batch B">Batch B</SelectItem>
                  <SelectItem value="Batch C">Batch C</SelectItem>
                  <SelectItem value="Batch D">Batch D</SelectItem>
                </SelectContent>
              </Select>

              <Select value={specialtyFilter || 'all'} onValueChange={(value) => {
                setSpecialtyFilter(value === 'all' ? '' : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                  <SelectItem value="Neurological">Neurological</SelectItem>
                  <SelectItem value="Sports Rehab">Sports Rehab</SelectItem>
                  <SelectItem value="Cardiopulmonary">Cardiopulmonary</SelectItem>
                  <SelectItem value="Pediatric">Pediatric</SelectItem>
                </SelectContent>
              </Select>

              <Select value={programStatusFilter || 'all'} onValueChange={(value) => {
                setProgramStatusFilter(value === 'all' ? '' : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Program Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={complianceRange || 'all'} onValueChange={(value) => {
                setComplianceRange(value === 'all' ? '' : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Compliance %" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  <SelectItem value="0-60">0-60%</SelectItem>
                  <SelectItem value="61-80">61-80%</SelectItem>
                  <SelectItem value="81-100">81-100%</SelectItem>
                </SelectContent>
              </Select>

              <Select value={followUpStatusFilter || 'all'} onValueChange={(value) => {
                setFollowUpStatusFilter(value === 'all' ? '' : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Follow-up Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Follow-ups</SelectItem>
                  <SelectItem value="Due">Due</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Enrollment Date</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => {
                      setDateRange((prev) => ({ ...prev, start: e.target.value }))
                      setCurrentPage(1)
                    }}
                  />
                  <span className="text-xs text-slate-500">to</span>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => {
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                      setCurrentPage(1)
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setBatchFilter('')
                  setSpecialtyFilter('')
                  setProgramStatusFilter('')
                  setComplianceRange('')
                  setFollowUpStatusFilter('')
                  setDateRange({ start: '', end: '' })
                  setCurrentPage(1)
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px] cursor-pointer" onClick={() => handleSort('name')}>
                    Patient Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('age')}>
                    Age {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('programStatus')}>
                    Program Status {sortConfig.key === 'programStatus' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('compliance')}>
                    Compliance % {sortConfig.key === 'compliance' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('nextFollowUp')}>
                    Next Follow-up {sortConfig.key === 'nextFollowUp' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead>Follow-up Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => router.push(`/physiotherapist/patients/${patient.id}`)}
                        className="text-left text-blue-600 hover:text-blue-800"
                      >
                        {patient.name}
                      </button>
                    </TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.patientId}</TableCell>
                    <TableCell>{patient.mobile}</TableCell>
                    <TableCell>{patient.batch}</TableCell>
                    <TableCell>{patient.specialty}</TableCell>
                    <TableCell>
                      <Badge variant={patient.programStatus === 'Active' ? 'default' : patient.programStatus === 'On Hold' ? 'secondary' : 'outline'}>
                        {patient.programStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className={patient.compliance >= 80 ? 'text-green-600 font-semibold' : patient.compliance >= 60 ? 'text-amber-600 font-semibold' : 'text-rose-600 font-semibold'}>
                      {patient.compliance}%
                    </TableCell>
                    <TableCell>{patient.nextFollowUp}</TableCell>
                    <TableCell>
                      <Badge variant={patient.followUpStatus === 'Overdue' ? 'destructive' : patient.followUpStatus === 'Completed' ? 'outline' : 'default'}>
                        {patient.followUpStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-slate-500">
                      No patients match the selected criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Rows per page:</span>
              <Select value={String(itemsPerPage)} onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
              <span>
                Page {currentPage} of {totalPages} • {sortedPatients.length} records
              </span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
