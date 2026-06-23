"use client"

import * as React from "react"

import { useSales } from "@/components/sales/sales-context"
import { EnhancedAssessmentCoordination } from "@/components/sales/enhanced-assessment-coordination"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AssessmentTrackingPage() {
  const { leads } = useSales()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Assessment Coordination</h1>
        <p className="text-sm text-gray-500">
          Monitor assessment status and completion progress
        </p>
      </div>

      <EnhancedAssessmentCoordination data={leads} />
    </div>
  )
}
