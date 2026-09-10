"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useLeads } from "@/hooks/use-leads"
import { useTelecallers } from "@/hooks/use-telecallers"
import { EnhancedLeadsTable } from "@/components/sales/enhanced-leads-table"
import { AddLeadDialog } from "@/components/sales/add-lead-dialog"
import { AutoAssignQuantityModal } from "@/components/sales/auto-assign-quantity-modal"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Sparkles, ShieldCheck, CircleCheck, Zap, Users, UserCheck, Clock, Layers } from "lucide-react"
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

  const { data: telecallers = [] } = useTelecallers()
  const leadNurtureTelecallers = React.useMemo(() => {
    const list = telecallers.filter((tc) => (tc.roleSpecialization || "lead_nurture") === "lead_nurture")
    return list.length > 0 ? list : telecallers
  }, [telecallers])

  const [pendingUnassignedCount, setPendingUnassignedCount] = React.useState(500)
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = React.useState(false)

  const handleAutoAssign = async (quantity: number, selectedTelecallerIds: string[]) => {
    setPendingUnassignedCount((prev) => Math.max(0, prev - quantity))
  }

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                New Lead Management
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-[#1F56A3] border-blue-200 font-bold text-xs py-0.5">
                Lead Nurture Queue
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Fresh inbound leads from Meta, Google Ads & Webinars waiting for first-touch telecaller nurturing
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsAutoAssignModalOpen(true)}
              className="bg-[#1F56A3] hover:bg-[#192B42] text-white font-bold h-11 px-5 rounded-2xl shadow-lg shadow-[#1F56A3]/20"
            >
              <Zap className="mr-2 h-4 w-4 text-[#FFC20E] fill-[#FFC20E]" />
              Auto Assignment ({pendingUnassignedCount} Pending)
            </Button>
            <AddLeadDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={handleLeadAdded} />
          </div>
        </div>

        {/* Lead Nurture Queue Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-50 text-[#1F56A3]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unassigned FIFO Queue</p>
              <p className="text-2xl font-bold text-slate-900">{pendingUnassignedCount}</p>
              <p className="text-[11px] text-blue-600 font-medium">Ready for auto-distribution</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Nurture Callers</p>
              <p className="text-2xl font-bold text-slate-900">
                {leadNurtureTelecallers.filter((tc) => tc.is_active !== false).length}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">Receiving lead nurture pool</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target SLA Window</p>
              <p className="text-2xl font-bold text-slate-900">&lt; 2 Hours</p>
              <p className="text-[11px] text-amber-700 font-medium">FIFO response rule applied</p>
            </div>
          </div>
        </div>
      </div>

      <AutoAssignQuantityModal
        open={isAutoAssignModalOpen}
        onOpenChange={setIsAutoAssignModalOpen}
        workstreamName="New Lead Nurture Queue"
        totalPendingCount={pendingUnassignedCount}
        telecallers={leadNurtureTelecallers}
        onAssign={handleAutoAssign}
      />

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
