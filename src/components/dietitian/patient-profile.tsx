"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { User, Phone, Mail, Calendar, Activity, TrendingDown, Droplets, Dumbbell, Brain, Moon } from "lucide-react"

interface PatientProfileProps {
  patientId: string
}

export function PatientProfile({ patientId }: PatientProfileProps) {
  const patient = {
    name: "Rahul Patil",
    age: 45,
    gender: "Male",
    phone: "+91 98765 43210",
    email: "rahul.patil@example.com",
    programStage: "Month 2",
    enrolledDate: "Jan 15, 2026",
    lastConsult: "Mar 8, 2026",
    status: "Active",
    healthDetails: {
      height: "175 cm",
      currentWeight: "85 kg",
      initialWeight: "95 kg",
      targetWeight: "75 kg",
      bmi: "27.8",
      bloodGroup: "O+",
      conditions: ["Type 2 Diabetes", "Hypertension"]
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{patient.name}</h2>
                <p className="text-muted-foreground">{patient.age} years • {patient.gender}</p>
              </div>
            </div>
            <Badge variant="default" className="text-sm">
              {patient.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{patient.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Enrolled: {patient.enrolledDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Last Consult: {patient.lastConsult}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-lg font-semibold">{patient.healthDetails.height}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="text-lg font-semibold">{patient.healthDetails.bloodGroup}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-lg font-semibold">{patient.healthDetails.currentWeight}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">BMI</p>
                <p className="text-lg font-semibold">{patient.healthDetails.bmi}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Medical Conditions</p>
              <div className="flex flex-wrap gap-2">
                {patient.healthDetails.conditions.map(condition => (
                  <Badge key={condition} variant="outline">{condition}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              Weight Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Initial</span>
                <span className="text-sm font-medium">{patient.healthDetails.initialWeight}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="text-sm font-medium">{patient.healthDetails.currentWeight}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Target</span>
                <span className="text-sm font-medium">{patient.healthDetails.targetWeight}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Progress</span>
                <span className="text-sm font-medium">50%</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Lost 10 kg so far! Great progress!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AdherenceTracking />
    </div>
  )
}

function AdherenceTracking() {
  const adherenceData = [
    { category: "Diet Adherence", value: 88, icon: Activity, color: "text-green-600", bgColor: "bg-green-100" },
    { category: "Water Intake", value: 75, icon: Droplets, color: "text-blue-600", bgColor: "bg-blue-100" },
    { category: "Exercise", value: 92, icon: Dumbbell, color: "text-orange-600", bgColor: "bg-orange-100" },
    { category: "Stress Level", value: 65, icon: Brain, color: "text-purple-600", bgColor: "bg-purple-100" },
    { category: "Sleep Quality", value: 80, icon: Moon, color: "text-indigo-600", bgColor: "bg-indigo-100" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adherence Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adherenceData.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
