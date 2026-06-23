"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useLeads } from "@/hooks/use-leads"
import { EnhancedLeadsTable } from "@/components/sales/enhanced-leads-table"
import { AddLeadDialog } from "@/components/sales/add-lead-dialog"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Sparkles, ShieldCheck, CircleCheck } from "lucide-react"
import { LeadsSkeleton } from "@/components/sales/skeletons"

type LeadTab = "all" | "unassigned" | "my" | "hot" | "followup" | "converted" | "dropped"

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export default function LeadsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Extract search parameters from URL
  const search = searchParams?.get('search') || undefined
  const status = searchParams?.get('status') || undefined
  const specialtyId = searchParams?.get('specialtyId') || undefined
  const campaignId = searchParams?.get('campaignId') || undefined
  const telecallerId = searchParams?.get('telecallerId') || undefined
  const registrationDateFrom = searchParams?.get('registrationDateFrom') || undefined
  const registrationDateTo = searchParams?.get('registrationDateTo') || undefined
  
  const queryPage = parsePositiveInt(searchParams?.get('page'), 1)
  const queryLimit = parsePositiveInt(searchParams?.get('limit'), 10)

  const updatePaginationParams = React.useCallback((pageValue: number, limitValue: number) => {
    const nextPage = Math.max(1, pageValue)
    const nextLimit = Math.max(1, limitValue)

    const currentPageParam = searchParams?.get('page')
    const currentLimitParam = searchParams?.get('limit')
    if (String(nextPage) === (currentPageParam || String(queryPage)) && String(nextLimit) === (currentLimitParam || String(queryLimit))) {
      return
    }

    const params = new URLSearchParams(searchParams?.toString())
    params.set('page', String(nextPage))
    params.set('limit', String(nextLimit))

    const pathname = typeof window !== "undefined" ? window.location.pathname : "/dashboard/sales/leads"
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, searchParams, queryPage, queryLimit])

  const { data: leadsData, isLoading, error, refetch } = useLeads({ 
    page: queryPage, 
    limit: queryLimit,
    search,
    status,
    specialtyId,
    campaignId,
    telecallerId,
    registrationDateFrom,
    registrationDateTo
  })
  const leads = leadsData?.leads || []
  const paginationMeta = leadsData?.meta
  const currentPage = paginationMeta?.page ?? queryPage
  const currentLimit = paginationMeta?.limit ?? queryLimit
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false)

  // Track if we've loaded data at least once
  React.useEffect(() => {
    if (leads.length > 0 && !hasLoadedOnce) {
      setHasLoadedOnce(true)
    }
  }, [leads, hasLoadedOnce])

  const handleLeadAdded = async () => {
    await refetch()
    setShowAddDialog(false)
  }
  
  const tabParam = searchParams?.get("tab")
  const initialTab: LeadTab = tabParam && ["all", "unassigned", "my", "hot", "followup", "converted", "dropped"].includes(tabParam)
    ? (tabParam as LeadTab)
    : "all"
  const [tab, setTab] = React.useState<LeadTab>(initialTab)

  // Update tab when URL parameter changes
  React.useEffect(() => {
    if (tabParam && ["all", "unassigned", "my", "hot", "followup", "converted", "dropped"].includes(tabParam)) {
      setTab(tabParam as LeadTab)
    }
  }, [tabParam])

  const filtered = React.useMemo(() => {
    let result = leads

    // Apply tab-based filtering only
    switch (tab) {
      case "unassigned":
        result = result.filter((l) => !l.assignee_name || l.stage === "UNASSIGNED")
        break
      case "my":
        result = result.filter((l) => l.assignee_name)
        break
      case "hot":
        result = result.filter((l) => l.stage === "HOT")
        break
      case "followup":
        result = result.filter((l) => l.stage === "FOLLOW_UP")
        break
      case "converted":
        result = result.filter((l) => l.stage === "CONVERTED")
        break
      case "dropped":
        result = result.filter((l) => l.stage === "DROPPED")
        break
      default:
        break
    }

    return result
  }, [leads, tab])

  // Only show full page loader for initial load, not for filter changes
  if (isLoading && !hasLoadedOnce) {
    return <LeadsSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-red-600">Error loading leads: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Lead Management </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Sync now
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              Export leads
            </Button> */}
            <AddLeadDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={handleLeadAdded} />
          </div>
        </div>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <Tabs value={tab} onValueChange={(value) => setTab(value as LeadTab)} className="space-y-6 cursor-pointer">
            <TabsList className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-2 cursor-pointer">
              {[
                { id: "all", label: "All" },
                { id: "unassigned", label: "Unassigned" },
                // { id: "my", label: "My Leads" },
                // { id: "hot", label: "Hot" },
                // { id: "followup", label: "Follow-ups" },
                // { id: "converted", label: "Converted" },
                // { id: "dropped", label: "Dropped" },
              ].map((tabItem) => (
                <TabsTrigger
                  key={tabItem.id}
                  value={tabItem.id}
                  className="rounded-lg px-4 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  {tabItem.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={tab} className="space-y-4">
              <EnhancedLeadsTable 
                data={filtered} 
                onRefresh={refetch} 
                isLoading={isLoading} 
                paginationMeta={paginationMeta}
                currentPage={currentPage}
                pageSize={currentLimit}
                onPageChange={(page: number) => {
                  if (!paginationMeta) return
                  const nextPage = Math.min(Math.max(page, 1), paginationMeta.totalPages || 1)
                  if (nextPage === currentPage) return
                  updatePaginationParams(nextPage, currentLimit)
                }}
                onPageSizeChange={(size: number) => {
                  if (size === currentLimit) return
                  updatePaginationParams(1, size)
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
