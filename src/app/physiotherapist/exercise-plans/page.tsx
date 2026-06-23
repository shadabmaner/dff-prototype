'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Activity,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ExercisePlan {
  id: string
  patientId: string
  patientName: string
  planName: string
  description: string
  startDate: string
  endDate: string
  status: 'Active' | 'Completed' | 'Paused' | 'Draft'
  exercises: Exercise[]
  complianceRate: number
  lastUpdated: string
}

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  duration: string
  frequency: string
  instructions: string
  videoUrl?: string
  contraindications?: string
}

interface ExercisePlanForm {
  patientId: string
  planName: string
  description: string
  startDate: string
  endDate: string
  exercises: Exercise[]
  notes: string
}

const mockExercisePlans: ExercisePlan[] = [
  {
    id: '1',
    patientId: 'PT001',
    patientName: 'John Smith',
    planName: 'Knee Rehabilitation Phase 1',
    description: 'Initial phase focusing on range of motion and basic strengthening',
    startDate: '2026-02-01',
    endDate: '2026-03-15',
    status: 'Active',
    exercises: [
      {
        id: '1',
        name: 'Quadriceps Sets',
        sets: 3,
        reps: 10,
        duration: '5 minutes',
        frequency: 'Twice daily',
        instructions: 'Sit with leg extended, tighten thigh muscles, hold for 5 seconds',
        videoUrl: 'https://example.com/video1',
        contraindications: 'Stop if pain increases'
      },
      {
        id: '2',
        name: 'Heel Slides',
        sets: 3,
        reps: 15,
        duration: '10 minutes',
        frequency: 'Twice daily',
        instructions: 'Lie on back, slowly slide heel towards buttocks',
        videoUrl: 'https://example.com/video2'
      }
    ],
    complianceRate: 85,
    lastUpdated: '2026-03-01'
  },
  {
    id: '2',
    patientId: 'PT002',
    patientName: 'Emma Wilson',
    planName: 'Shoulder Mobility Program',
    description: 'Post-surgery shoulder rehabilitation focusing on mobility',
    startDate: '2026-02-15',
    endDate: '2026-04-15',
    status: 'Active',
    exercises: [
      {
        id: '3',
        name: 'Pendulum Exercises',
        sets: 3,
        reps: 10,
        duration: '8 minutes',
        frequency: 'Three times daily',
        instructions: 'Gently swing arm in circular motions'
      }
    ],
    complianceRate: 92,
    lastUpdated: '2026-03-02'
  },
  {
    id: '3',
    patientId: 'PT003',
    patientName: 'Michael Brown',
    planName: 'Lower Back Strengthening',
    description: 'Core strengthening and flexibility for chronic back pain',
    startDate: '2026-01-20',
    endDate: '2026-03-20',
    status: 'Paused',
    exercises: [],
    complianceRate: 45,
    lastUpdated: '2026-02-28'
  }
]

const mockPatients = [
  { id: 'PT001', name: 'John Smith' },
  { id: 'PT002', name: 'Emma Wilson' },
  { id: 'PT003', name: 'Michael Brown' },
  { id: 'PT004', name: 'Sarah Davis' },
  { id: 'PT005', name: 'Robert Johnson' }
]

export default function ExercisePlanManagement() {
  const router = useRouter()
  const [plans, setPlans] = useState<ExercisePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ExercisePlan | null>(null)
  const [formData, setFormData] = useState<ExercisePlanForm>({
    patientId: '',
    planName: '',
    description: '',
    startDate: '',
    endDate: '',
    exercises: [],
    notes: ''
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('physio_token')
    if (!token) {
      router.push('/physiotherapist/login')
      return
    }

    loadExercisePlans()
  }, [router])

  const loadExercisePlans = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPlans(mockExercisePlans)
    } catch (error) {
      console.error('Failed to load exercise plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlans = plans.filter(plan =>
    plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Active': 'default',
      'Completed': 'outline',
      'Paused': 'secondary',
      'Draft': 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleCreatePlan = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real app, this would save to backend
      const newPlan: ExercisePlan = {
        id: Date.now().toString(),
        ...formData,
        patientName: mockPatients.find(p => p.id === formData.patientId)?.name || '',
        status: 'Draft',
        complianceRate: 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      }
      
      setPlans(prev => [newPlan, ...prev])
      setIsCreateDialogOpen(false)
      setFormData({
        patientId: '',
        planName: '',
        description: '',
        startDate: '',
        endDate: '',
        exercises: [],
        notes: ''
      })
    } catch (error) {
      console.error('Failed to create exercise plan:', error)
    }
  }

  const handleViewPlan = (plan: ExercisePlan) => {
    setSelectedPlan(plan)
    setIsViewDialogOpen(true)
  }

  const handleUpdatePlan = (planId: string) => {
    // Navigate to update page or open update dialog
    router.push(`/physiotherapist/exercise-plans/${planId}/edit`)
  }

  const handleDeletePlan = async (planId: string) => {
    if (confirm('Are you sure you want to delete this exercise plan?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        setPlans(prev => prev.filter(plan => plan.id !== planId))
      } catch (error) {
        console.error('Failed to delete exercise plan:', error)
      }
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercise Plan Management</h1>
          <p className="text-gray-600 mt-2">Create and manage exercise plans for your patients</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create New Plan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Exercise Plan</DialogTitle>
              <DialogDescription>
                Design a personalized exercise plan for your patient
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select 
                    value={formData.patientId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    value={formData.planName}
                    onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                    placeholder="e.g., Knee Rehabilitation Phase 1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the goals and focus of this exercise plan"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions or contraindications"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlan}>
                  Create Plan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by patient name or plan name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
            <p className="text-xs text-muted-foreground">
              Active exercise plans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Plans</CardTitle>
          <CardDescription>
            Showing {filteredPlans.length} of {plans.length} plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.patientName}</div>
                        <div className="text-sm text-gray-500">{plan.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.planName}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {plan.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {plan.startDate} - {plan.endDate}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                    <TableCell className={getComplianceColor(plan.complianceRate)}>
                      {plan.complianceRate}%
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{plan.lastUpdated}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPlan(plan)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdatePlan(plan.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Plan Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.planName}</DialogTitle>
            <DialogDescription>
              {selectedPlan?.patientName} ({selectedPlan?.patientId})
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedPlan.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPlan.startDate} - {selectedPlan.endDate}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPlan.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Compliance Rate</Label>
                  <p className={`text-sm font-medium mt-1 ${getComplianceColor(selectedPlan.complianceRate)}`}>
                    {selectedPlan.complianceRate}%
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Exercises</Label>
                <div className="space-y-4 mt-2">
                  {selectedPlan.exercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{exercise.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Sets:</span>
                          <p className="font-medium">{exercise.sets}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Reps:</span>
                          <p className="font-medium">{exercise.reps}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-medium">{exercise.duration}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Frequency:</span>
                          <p className="font-medium">{exercise.frequency}</p>
                        </div>
                      </div>
                      {exercise.instructions && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-600">Instructions:</span>
                          <p className="text-sm text-gray-700 mt-1">{exercise.instructions}</p>
                        </div>
                      )}
                      {exercise.contraindications && (
                        <div className="mt-3">
                          <span className="text-sm text-red-600 font-medium">Contraindications:</span>
                          <p className="text-sm text-red-700 mt-1">{exercise.contraindications}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false)
                  handleUpdatePlan(selectedPlan.id)
                }}>
                  Edit Plan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
