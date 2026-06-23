"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { PatientProfile } from "@/components/dietitian/patient-profile"
import { ConsultationHistory } from "@/components/dietitian/consultation-history"
import { DietPlanEditor } from "@/components/dietitian/diet-plan-editor"
import { ProgressCharts } from "@/components/dietitian/progress-charts"
import { DietPlanPDF } from "@/components/dietitian/diet-plan-pdf"

interface PatientProfileIntegratedProps {
  patientId: string
}

export default function PatientProfileIntegrated({ patientId }: PatientProfileIntegratedProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("overview")

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Profile</h1>
          <p className="text-muted-foreground">Complete patient information and management</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diet-plan">Diet Plan</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PatientProfile patientId={patientId} />
        </TabsContent>

        <TabsContent value="diet-plan" className="space-y-6">
          <DietPlanEditor />
        </TabsContent>

        <TabsContent value="consultations" className="space-y-6">
          <ConsultationHistory />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressCharts />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DietPlanPDF 
            patientName="Rahul Patil" 
            planName="Diabetes Reversal Diet Plan - Month 2"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
