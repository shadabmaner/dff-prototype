"use client"

import * as React from "react"
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react"

import { useTelecallers } from "@/hooks/use-telecallers"
import { TelecallersTable } from "@/components/sales/telecallers-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TelecallersSkeleton } from "@/components/sales/skeletons"

export default function SalesTelecallersPage() {
  const { data: telecallers = [], isLoading, error, refetch, isRefetching } = useTelecallers()

  if (isLoading) {
    return <TelecallersSkeleton />
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/60">
        <CardContent className="flex flex-col gap-4 py-10 text-center">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-600">Failed to load telecallers. {error.message}</p>
          </div>
          <Button onClick={() => refetch()} className="mx-auto">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
       
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Telecaller </h1>
          </div>
         
        </div>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
      
        <CardContent className="p-6">
          <TelecallersTable data={telecallers} onRefresh={() => refetch()} isRefreshing={isRefetching} />
        </CardContent>
      </Card>
    </div>
  )
}
