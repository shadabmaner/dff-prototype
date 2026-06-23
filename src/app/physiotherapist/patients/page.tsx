'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Eye,
  Calendar,
  Users,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

interface Patient {
  id: string
  patientId: string
  name: string
  age: number
  gender: string
  mobileNumber: string
  batchName: string
  specialty: string
  programStatus: 'Active' | 'On Hold' | 'Completed' | 'Discontinued'
  compliancePercentage: number
  nextFollowUpDate: string
  followUpStatus: 'Due' | 'Overdue' | 'Completed'
  enrollmentDate: string
  doctorName: string
}

interface Filters {
  batch: string
  specialty: string
  programStatus: string
  complianceRange: string
  followUpStatus: string
  dateRange: string
}

const mockPatients: Patient[] = [
  {
    id: '1',
    patientId: 'PT001',
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    mobileNumber: '+1 234-567-8901',
    batchName: 'Batch A',
    specialty: 'Orthopedic',
    programStatus: 'Active',
    compliancePercentage: 85,
    nextFollowUpDate: '2026-03-05',
    followUpStatus: 'Due',
    enrollmentDate: '2026-02-01',
    doctorName: 'Dr. Anderson'
  },
  {
    id: '2',
    patientId: 'PT002',
    name: 'Emma Wilson',
    age: 32,
    gender: 'Female',
    mobileNumber: '+1 234-567-8902',
    batchName: 'Batch B',
    specialty: 'Neurological',
    programStatus: 'Active',
    compliancePercentage: 92,
    nextFollowUpDate: '2026-03-04',
    followUpStatus: 'Overdue',
    enrollmentDate: '2026-01-15',
    doctorName: 'Dr. Martinez'
  },
  {
    id: '3',
    patientId: 'PT003',
    name: 'Michael Brown',
    age: 58,
    gender: 'Male',
    mobileNumber: '+1 234-567-8903',
    batchName: 'Batch A',
    specialty: 'Cardiopulmonary',
    programStatus: 'On Hold',
    compliancePercentage: 45,
    nextFollowUpDate: '2026-03-10',
    followUpStatus: 'Due',
    enrollmentDate: '2026-02-10',
    doctorName: 'Dr. Thompson'
  },
  {
    id: '4',
    patientId: 'PT004',
    name: 'Sarah Davis',
    age: 28,
    gender: 'Female',
    mobileNumber: '+1 234-567-8904',
    batchName: 'Batch C',
    specialty: 'Orthopedic',
    programStatus: 'Active',
    compliancePercentage: 78,
    nextFollowUpDate: '2026-03-06',
    followUpStatus: 'Completed',
    enrollmentDate: '2026-01-20',
    doctorName: 'Dr. Anderson'
  },
  {
    id: '5',
    patientId: 'PT005',
    name: 'Robert Johnson',
    age: 51,
    gender: 'Male',
    mobileNumber: '+1 234-567-8905',
    batchName: 'Batch B',
    specialty: 'Pediatric',
    programStatus: 'Completed',
    compliancePercentage: 95,
    nextFollowUpDate: '2026-02-28',
    followUpStatus: 'Completed',
    enrollmentDate: '2025-12-01',
    doctorName: 'Dr. Wilson'
  }
]

function PatientMasterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Patient | null
    direction: 'asc' | 'desc'
  }>({ key: 'nextFollowUpDate', direction: 'asc' })

  const [filters, setFilters] = useState<Filters>({
    batch: '',
    specialty: '',
    programStatus: '',
    complianceRange: '',
    followUpStatus: '',
    dateRange: ''
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('physio_token')
    if (!token) {
      router.push('/physiotherapist/login')
      return
    }

    // Get filter from URL params
    const urlFilter = searchParams.get('filter')
    if (urlFilter) {
      // Apply preset filter
      switch (urlFilter) {
        case 'overdue':
          setFilters(prev => ({ ...prev, followUpStatus: 'Overdue' }))
          break
        case 'pending-plans':
          // This would be handled differently in a real app
          break
        case 'today-followups':
          setFilters(prev => ({ ...prev, followUpStatus: 'Due' }))
          break
      }
    }

    loadPatients()
  }, [router, searchParams])

  const loadPatients = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPatients(mockPatients)
    } catch (error) {
      console.error('Failed to load patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter(patient => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm || 
        patient.name.toLowerCase().includes(searchLower) ||
        patient.patientId.toLowerCase().includes(searchLower) ||
        patient.mobileNumber.includes(searchTerm) ||
        patient.batchName.toLowerCase().includes(searchLower)

      // Other filters
      const matchesBatch = !filters.batch || patient.batchName === filters.batch
      const matchesSpecialty = !filters.specialty || patient.specialty === filters.specialty
      const matchesProgramStatus = !filters.programStatus || patient.programStatus === filters.programStatus
      const matchesFollowUpStatus = !filters.followUpStatus || patient.followUpStatus === filters.followUpStatus

      // Compliance range filter
      let matchesCompliance = true
      if (filters.complianceRange) {
        const [min, max] = filters.complianceRange.split('-').map(Number)
        matchesCompliance = patient.compliancePercentage >= min && patient.compliancePercentage <= max
      }

      return matchesSearch && matchesBatch && matchesSpecialty && 
             matchesProgramStatus && matchesFollowUpStatus && matchesCompliance
    })

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [patients, searchTerm, filters, sortConfig])

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedPatients.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedPatients, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage)

  const handleSort = (key: keyof Patient) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handlePatientClick = (patientId: string) => {
    router.push(`/physiotherapist/patients/${patientId}`)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Active': 'default',
      'On Hold': 'secondary',
      'Completed': 'outline',
      'Discontinued': 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getFollowUpBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Due': 'default',
      'Overdue': 'destructive',
      'Completed': 'outline'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Master</h1>
        <p className="text-gray-600 mt-2">Manage and monitor your assigned patients</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, ID, mobile, or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              <Select value={filters.batch} onValueChange={(value) => setFilters(prev => ({ ...prev, batch: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Batches</SelectItem>
                  <SelectItem value="Batch A">Batch A</SelectItem>
                  <SelectItem value="Batch B">Batch B</SelectItem>
                  <SelectItem value="Batch C">Batch C</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.specialty} onValueChange={(value) => setFilters(prev => ({ ...prev, specialty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specialties</SelectItem>
                  <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                  <SelectItem value="Neurological">Neurological</SelectItem>
                  <SelectItem value="Cardiopulmonary">Cardiopulmonary</SelectItem>
                  <SelectItem value="Pediatric">Pediatric</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.programStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, programStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Program Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.complianceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, complianceRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Compliance %" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Ranges</SelectItem>
                  <SelectItem value="0-50">0-50%</SelectItem>
                  <SelectItem value="51-70">51-70%</SelectItem>
                  <SelectItem value="71-85">71-85%</SelectItem>
                  <SelectItem value="86-100">86-100%</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.followUpStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, followUpStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Follow-up Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="Due">Due</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  batch: '',
                  specialty: '',
                  programStatus: '',
                  complianceRange: '',
                  followUpStatus: '',
                  dateRange: ''
                })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>
            Showing {paginatedPatients.length} of {filteredAndSortedPatients.length} patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('patientId')}
                  >
                    Patient ID
                    {sortConfig.key === 'patientId' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('name')}
                  >
                    Name
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('compliancePercentage')}
                  >
                    Compliance %
                    {sortConfig.key === 'compliancePercentage' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('nextFollowUpDate')}
                  >
                    Next Follow-up
                    {sortConfig.key === 'nextFollowUpDate' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead>Follow-up Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{patient.patientId}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handlePatientClick(patient.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {patient.name}
                      </button>
                    </TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.mobileNumber}</TableCell>
                    <TableCell>{patient.batchName}</TableCell>
                    <TableCell>{patient.specialty}</TableCell>
                    <TableCell>{getStatusBadge(patient.programStatus)}</TableCell>
                    <TableCell className={getComplianceColor(patient.compliancePercentage)}>
                      {patient.compliancePercentage}%
                    </TableCell>
                    <TableCell>{patient.nextFollowUpDate}</TableCell>
                    <TableCell>{getFollowUpBadge(patient.followUpStatus)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePatientClick(patient.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Items per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
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

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PatientMaster() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <PatientMasterContent />
    </Suspense>
  )
}
