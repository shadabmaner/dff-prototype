"use client"

import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"

import { useLead } from "@/hooks/use-leads"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LeadDetailsDietTheme } from "@/components/sales/lead-details-diet-theme"
import { SalesLoader } from "@/components/sales/sales-loader"

export default function LeadDetailsPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = params.id
  const fromParam = searchParams?.get("from")
  const backFromAssignment = fromParam === "lead-assignment"
  const patientName = searchParams?.get("name")

  const { data: lead, isLoading, error, refetch, isFetching } = useLead(id, { enabled: Boolean(id) })

  if (isLoading || isFetching) {
    return <SalesLoader variant="page" title="Fetching lead details" message="Hold tight while we prepare the full profile." />
  }

  if (error || !lead) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Failed to load the lead data</AlertTitle>
          <AlertDescription>{error?.message ?? "Lead not found."}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <LeadDetailsDietTheme
      lead={lead}
      backHref={backFromAssignment ? "/dashboard/sales/lead-assignment" : undefined}
      backLabel={backFromAssignment ? "Back to Lead Assignment" : undefined}
    />
  )
}
