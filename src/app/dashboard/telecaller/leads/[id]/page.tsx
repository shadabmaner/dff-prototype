"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { LeadDetailsDietTheme } from "@/components/sales/lead-details-diet-theme"
import { useLead } from "@/hooks/use-leads"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LeadDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id ? decodeURIComponent(params.id) : undefined

  const { data: lead, isLoading, error, refetch, isFetching } = useLead(id, { enabled: Boolean(id) })

  if (isLoading || isFetching) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="flex h-72 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">Loading lead details...</p>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="space-y-4 max-w-2xl">
          <Alert variant="destructive" className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg">
            <AlertTitle className="text-rose-900 font-bold">Unable to load lead</AlertTitle>
            <AlertDescription className="text-rose-700">{error?.message ?? "Lead not found."}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <LeadDetailsDietTheme lead={lead} backHref="/dashboard/telecaller/assigned-leads" backLabel="Back to leads" />
    </div>
  )
}
