"use client"

import * as React from "react"

import { useSales } from "@/components/sales/sales-context"
import { EnhancedWebinarStatus } from "@/components/sales/enhanced-webinar-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export default function WebinarStatusPage() {
  const { leads } = useSales()

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Sales Portal / Webinar Status</p>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Webinar Status Tracking</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">Monitor registrations, attendance, and follow-up outcomes in one place.</p>
        </div>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">Webinar Status Board</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <EnhancedWebinarStatus data={leads} />
        </CardContent>
      </Card>
    </div>
  )
}
