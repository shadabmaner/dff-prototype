'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  Activity,
  FileText,
  Heart,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface PatientDetail {
  id: string
  patientId: string
  name: string
  age: number
  gender: string
  mobileNumber: string
  email: string
  address: string
  batchName: string
  specialty: string
  programStatus: 'Active' | 'On Hold' | 'Completed' | 'Discontinued'
  compliancePercentage: number
  nextFollowUpDate: string
  enrollmentDate: string
  doctorName: string
  medicalCondition: string
  emergencyContact: string
}

interface ExercisePlan {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  exercises: Exercise[]
  status: 'Active' | 'Completed' | 'Paused'
}

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  duration: string
  frequency: string
  videoUrl?: string
}

interface DoctorPrescription {
  id: string
  date: string
  diagnosis: string
  prescription: string
  notes: string
  doctorName: string
}

interface DietPlan {
  id: string
  name: string
  description: string
  restrictions: string[]
  recommendations: string[]
  nutritionistName: string
  createdDate: string
}

interface ComplianceData {
  dailyCompletion: number
  weeklyTrend: number[]
  missedSessions: number
  totalSessions: number
  averageDuration: number
  plannedDuration: number
}

const mockPatientDetail: PatientDetail = {
  id: '1',
  patientId: 'PT001',
  name: 'John Smith',
  age: 45,
  gender: 'Male',
  mobileNumber: '+1 234-567-8901',
  email: 'john.smith@email.com',
  address: '123 Main St, City, State 12345',
  batchName: 'Batch A',
  specialty: 'Orthopedic',
  programStatus: 'Active',
  compliancePercentage: 85,
  nextFollowUpDate: '2026-03-05',
  enrollmentDate: '2026-02-01',
  doctorName: 'Dr. Anderson',
  medicalCondition: 'Post-knee replacement surgery rehabilitation',
  emergencyContact: '+1 234-567-8902 (Jane Smith - Wife)'
}

const mockExercisePlan: ExercisePlan = {
  id: '1',
  name: 'Knee Rehabilitation Phase 1',
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
      frequency: 'Twice daily'
    },
    {
      id: '2',
      name: 'Heel Slides',
      sets: 3,
      reps: 15,
      duration: '10 minutes',
      frequency: 'Twice daily'
    },
    {
      id: '3',
      name: 'Straight Leg Raises',
      sets: 3,
      reps: 12,
      duration: '8 minutes',
      frequency: 'Once daily'
    }
  ]
}

const mockDoctorPrescription: DoctorPrescription = {
  id: '1',
  date: '2026-01-28',
  diagnosis: 'Left knee osteoarthritis, post total knee replacement',
  prescription: 'Physical therapy for 12 weeks focusing on:\n- Range of motion exercises\n- Strengthening quadriceps and hamstrings\n- Gait training\n- Pain management',
  notes: 'Patient cleared for full weight bearing. Monitor for swelling and pain levels.',
  doctorName: 'Dr. Anderson'
}

const mockDietPlan: DietPlan = {
  id: '1',
  name: 'Anti-inflammatory Diet Plan',
  description: 'Nutrition plan to support recovery and reduce inflammation',
  restrictions: ['Processed foods', 'Excessive sugar', 'Trans fats'],
  recommendations: [
    'Omega-3 rich foods (salmon, walnuts)',
    'Leafy green vegetables',
    'Lean proteins',
    'Whole grains',
    'Adequate hydration (8-10 glasses/day)'
  ],
  nutritionistName: 'Sarah Johnson, RD',
  createdDate: '2026-02-01'
}

const mockComplianceData: ComplianceData = {
  dailyCompletion: 85,
  weeklyTrend: [75, 80, 90, 85, 88, 92, 85],
  missedSessions: 3,
  totalSessions: 20,
  averageDuration: 25,
  plannedDuration: 30
}

export default function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [exercisePlan, setExercisePlan] = useState<ExercisePlan | null>(null)
  const [doctorPrescription, setDoctorPrescription] = useState<DoctorPrescription | null>(null)
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null)
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('physio_token')
    if (!token) {
      router.push('/physiotherapist/login')
      return
    }

    loadPatientDetail()
  }, [router, params.id])

  const loadPatientDetail = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPatient(mockPatientDetail)
      setExercisePlan(mockExercisePlan)
      setDoctorPrescription(mockDoctorPrescription)
      setDietPlan(mockDietPlan)
      setComplianceData(mockComplianceData)
    } catch (error) {
      console.error('Failed to load patient detail:', error)
    } finally {
      setLoading(false)
    }
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

  if (!patient) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Patient not found</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patients</span>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-gray-600">Patient ID: {patient.patientId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(patient.programStatus)}
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Patient
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(patient.compliancePercentage)}`}>
              {patient.compliancePercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Daily completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Follow-up</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.nextFollowUpDate}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled appointment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Program Duration</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 weeks</div>
            <p className="text-xs text-muted-foreground">
              Since {patient.enrollmentDate}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatment Status</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">On Track</div>
            <p className="text-xs text-muted-foreground">
              Progressing well
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exercise-plan">Exercise Plan</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="prescription">Prescription</TabsTrigger>
          <TabsTrigger value="diet">Diet Plan</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{patient.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{patient.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile:</span>
                  <span className="font-medium">{patient.mobileNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{patient.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-right">{patient.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span className="font-medium">{patient.emergencyContact}</span>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Medical Condition:</span>
                  <span className="font-medium text-right">{patient.medicalCondition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialty:</span>
                  <span className="font-medium">{patient.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Batch:</span>
                  <span className="font-medium">{patient.batchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Treating Doctor:</span>
                  <span className="font-medium">{patient.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrollment Date:</span>
                  <span className="font-medium">{patient.enrollmentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Program Status:</span>
                  {getStatusBadge(patient.programStatus)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exercise-plan" className="space-y-4">
          {exercisePlan && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Current Exercise Plan
                  </CardTitle>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Modify Plan
                  </Button>
                </div>
                <CardDescription>{exercisePlan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-600">Start Date:</span>
                    <p className="font-medium">{exercisePlan.startDate}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">End Date:</span>
                    <p className="font-medium">{exercisePlan.endDate}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <p className="font-medium">{getStatusBadge(exercisePlan.status)}</p>
                  </div>
                </div>

                <h4 className="font-semibold mb-4">Prescribed Exercises:</h4>
                <div className="space-y-4">
                  {exercisePlan.exercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{exercise.name}</h5>
                        <Badge variant="outline">{exercise.frequency}</Badge>
                      </div>
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
                          <span className="text-gray-600">Video:</span>
                          <p className="font-medium">
                            {exercise.videoUrl ? 'Available' : 'Not assigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {complianceData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Compliance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Daily Completion</span>
                      <span className="text-sm font-medium">{complianceData.dailyCompletion}%</span>
                    </div>
                    <Progress value={complianceData.dailyCompletion} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Sessions Completed</span>
                      <p className="text-2xl font-bold text-green-600">
                        {complianceData.totalSessions - complianceData.missedSessions}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Sessions Missed</span>
                      <p className="text-2xl font-bold text-red-600">
                        {complianceData.missedSessions}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Average Duration vs Planned</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-medium">{complianceData.averageDuration} min</span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-medium">{complianceData.plannedDuration} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Trend</CardTitle>
                  <CardDescription>Last 7 days compliance percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {complianceData.weeklyTrend.map((percentage, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 w-16">Day {index + 1}</span>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="prescription" className="space-y-4">
          {doctorPrescription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Doctor's Prescription
                </CardTitle>
                <CardDescription>
                  By {doctorPrescription.doctorName} on {doctorPrescription.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Diagnosis:</h4>
                  <p className="text-gray-700">{doctorPrescription.diagnosis}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Prescription:</h4>
                  <p className="text-gray-700 whitespace-pre-line">{doctorPrescription.prescription}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Notes:</h4>
                  <p className="text-gray-700">{doctorPrescription.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="diet" className="space-y-4">
          {dietPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Diet Plan
                </CardTitle>
                <CardDescription>
                  By {dietPlan.nutritionistName} on {dietPlan.createdDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Plan Description:</h4>
                  <p className="text-gray-700">{dietPlan.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dietary Restrictions:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {dietPlan.restrictions.map((restriction, index) => (
                      <li key={index}>{restriction}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {dietPlan.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Payment information is managed by the administrative team.</p>
                <p className="text-sm text-gray-500 mt-2">Contact admin for payment-related queries.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
