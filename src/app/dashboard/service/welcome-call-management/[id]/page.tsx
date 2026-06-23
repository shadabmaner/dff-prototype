"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, User, Phone, Mail, FileText, Activity, HeartPulse, Utensils, Target, CheckCircle2, AlertCircle, Stethoscope, Apple, Dumbbell, GraduationCap, PhoneCall, UserPlus } from "lucide-react"
import { toast } from "sonner"

interface WelcomeCallPatient {
  patient_id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  enrollment_status: string
  assessment_status: string | null
  payment_status: string
  program_name: string
  assigned_doctor_id: string | null
  assigned_nutritionist_id: string | null
  assigned_fitness_coach_id: string | null
  assigned_mentor_id: string | null
  doctor_first_name: string | null
  doctor_last_name: string | null
  dietician_first_name: string | null
  dietician_last_name: string | null
  physio_first_name: string | null
  physio_last_name: string | null
  mentor_first_name: string | null
  mentor_last_name: string | null
  welcome_call_status: "pending" | "completed" | null
  welcome_call_notes: string | null
}

export default function WelcomeCallPatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const patientId = params.id as string
  const firstName = searchParams.get("first_name") || ""
  const lastName = searchParams.get("last_name") || ""
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<WelcomeCallPatient | null>(null)

  useEffect(() => {
    fetchPatientDetails()
  }, [patientId, firstName, lastName])

  const fetchPatientDetails = async () => {
    try {
      setLoading(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock patient data based on URL parameters
      setPatient({
        patient_id: patientId,
        first_name: firstName,
        last_name: lastName,
        phone: "+91 98765 43210",
        email: "patient@example.com",
        enrollment_status: "active",
        assessment_status: "completed",
        payment_status: "paid",
        program_name: "Diabetes Reversal Program",
        assigned_doctor_id: null,
        assigned_nutritionist_id: null,
        assigned_fitness_coach_id: null,
        assigned_mentor_id: null,
        doctor_first_name: null,
        doctor_last_name: null,
        dietician_first_name: null,
        dietician_last_name: null,
        physio_first_name: null,
        physio_last_name: null,
        mentor_first_name: null,
        mentor_last_name: null,
        welcome_call_status: "pending",
        welcome_call_notes: null
      })
    } catch (error) {
      console.error("Error fetching patient details:", error)
      toast.error("Failed to load patient details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Separator />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Patient Not Found</h2>
            <p className="text-sm text-slate-600 mb-4">The patient you're looking for doesn't exist.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patient Details</h1>
            <p className="text-sm text-slate-500">View patient information and assessment details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={patient.assessment_status === "completed" ? "default" : "secondary"}>
            {patient.assessment_status === "completed" ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <Activity className="h-3 w-3 mr-1" />
            )}
            Assessment {patient.assessment_status}
          </Badge>
          <Badge variant={patient.payment_status === "paid" ? "default" : "secondary"}>
            {patient.payment_status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Patient ID</p>
                <p className="font-mono text-sm text-slate-700">{patient.patient_id.slice(0, 8)}...</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</p>
                <p className="font-semibold text-slate-900">{patient.first_name} {patient.last_name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700">{patient.phone}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700">{patient.email || "Not provided"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Enrollment Status</p>
                <Badge variant={patient.enrollment_status === "active" ? "default" : "secondary"}>
                  {patient.enrollment_status}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Program</p>
                <p className="text-sm text-slate-700">{patient.program_name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Welcome Call Status</p>
                <Badge variant={patient.welcome_call_status === "completed" ? "default" : "secondary"}>
                  {patient.welcome_call_status === "completed" ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <PhoneCall className="h-3 w-3 mr-1" />
                  )}
                  {patient.welcome_call_status || "Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Assigned Care Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Doctor</p>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700">
                    {patient.doctor_first_name && patient.doctor_last_name
                      ? `Dr. ${patient.doctor_first_name} ${patient.doctor_last_name}`
                      : "Not assigned"}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dietitian</p>
                <div className="flex items-center gap-2">
                  <Apple className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700">
                    {patient.dietician_first_name && patient.dietician_last_name
                      ? `${patient.dietician_first_name} ${patient.dietician_last_name}`
                      : "Not assigned"}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Fitness Coach</p>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700">
                    {patient.physio_first_name && patient.physio_last_name
                      ? `${patient.physio_first_name} ${patient.physio_last_name}`
                      : "Not assigned"}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Mentor</p>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700">
                    {patient.mentor_first_name && patient.mentor_last_name
                      ? `${patient.mentor_first_name} ${patient.mentor_last_name}`
                      : "Not assigned"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assessment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Health Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Age</p>
                      <p className="font-semibold text-slate-900">45</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Gender</p>
                      <p className="font-semibold text-slate-900">Male</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Height</p>
                      <p className="font-semibold text-slate-900">175 cm</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Weight</p>
                      <p className="font-semibold text-slate-900">85 kg</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <HeartPulse className="h-4 w-4" />
                    Medical Conditions
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      Type 2 Diabetes, Hypertension
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Dietary Preferences
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      Vegetarian, No onion and garlic, Low sugar diet
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Health Goals
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      Weight loss, Blood sugar control, Improve overall health
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity Level
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      Sedentary - Less than 30 minutes of activity per week
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {patient.welcome_call_notes && (
            <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Welcome Call Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{patient.welcome_call_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
