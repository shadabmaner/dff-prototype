"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Users, Flame, RefreshCw, Languages, Activity, Loader2 } from "lucide-react"

import { useUnassignedLeads } from "@/hooks/use-unassigned-leads"
import { TodaysLeadsTable, type TodaysLeadsFilterParams } from "@/components/sales/todays-leads-table"
import { AddLeadDialog } from "@/components/sales/add-lead-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TodayLeadsSkeleton } from "@/components/sales/skeletons"

export default function TodaysLeadsPage() {
  const queryClient = useQueryClient()
  const [apiFilters, setApiFilters] = React.useState<TodaysLeadsFilterParams>({})
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)

  const { data: leadsData, isLoading, isFetching, error, refetch } = useUnassignedLeads({
    page,
    limit,
    search: apiFilters.search,
  })
  const leads = leadsData?.leads || []
  const totalLeads = leadsData?.meta?.total || 0
  const totalPages = leadsData?.meta?.totalPages || 1
  const hasNext = leadsData?.meta?.hasNext || false
  const hasPrev = leadsData?.meta?.hasPrev || false
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [lastRefreshed, setLastRefreshed] = React.useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false)

  // Function to refresh leads data after assignment
  const handleLeadUpdate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["unassigned-leads"] })
  }

  React.useEffect(() => {
    if (!isLoading && leadsData) {
      setHasLoadedOnce(true)
      if (leads.length > 0) {
        setLastRefreshed(new Date())
      }
    }
  }, [isLoading, leadsData, leads.length])

  const highPriorityLeads = React.useMemo(
    () => leads.filter((lead) => lead.priority === "high").length,
    [leads],
  )

  const followUpReadyLeads = React.useMemo(
    () => leads.filter((lead) => lead.stage === "FOLLOW_UP").length,
    [leads],
  )

  const languageCoverage = React.useMemo(() => {
    const unique = new Set(
      leads.map((lead) => lead.language_name || lead.language).filter(Boolean) as string[],
    )
    return unique.size
  }, [leads])

  const handleLeadAdded = async () => {
    await refetch()
    setLastRefreshed(new Date())
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      await queryClient.invalidateQueries({ queryKey: ["unassigned-leads"] })
      const result = await refetch()
      if (!result.error) {
        setLastRefreshed(new Date())
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatNumber = (value: number) => value.toLocaleString("en-IN")

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to page 1 when limit changes
  }

  const handleFiltersChange = React.useCallback((filters: TodaysLeadsFilterParams) => {
    setApiFilters((prev) => {
      if (prev.search === (filters.search ?? undefined)) {
        return prev
      }
      return {
        search: filters.search ?? undefined,
      }
    })
  }, [])

  const highlightTiles = [
    {
      label: "Fresh Leads",
      value: formatNumber(totalLeads),
      subtext: "Unassigned in queue",
      icon: Users,
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "High Priority",
      value: formatNumber(highPriorityLeads),
      subtext: "Flagged for telecallers",
      icon: Flame,
      accent: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Follow-up Ready",
      value: formatNumber(followUpReadyLeads),
      subtext: "Need callbacks today",
      icon: Activity,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Language Mix",
      value: languageCoverage ? `${languageCoverage}+` : "—",
      subtext: "Active vernacular tracks",
      icon: Languages,
      accent: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ]

  if (!hasLoadedOnce && isLoading) {
    return <TodayLeadsSkeleton />
  }

  if (error) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Card className="max-w-lg border-rose-100 bg-rose-50/80">
          <CardHeader>
            <CardTitle className="text-rose-600">Unable to load leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-rose-700">
            <p>{error.message}</p>
            <Button variant="destructive" size="sm" onClick={() => refetch()}>
              Retry sync
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Lead Assignment</h1>
            {isFetching && (
              <p className="mt-1 text-xs font-medium text-slate-500 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Syncing latest results…
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleManualRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <AddLeadDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={handleLeadAdded} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {highlightTiles.map((tile) => {
          const Icon = tile.icon
          const gradientMap: Record<string, string> = {
            "bg-blue-50": "from-blue-50 to-indigo-50",
            "bg-rose-50": "from-rose-50 to-pink-50",
            "bg-emerald-50": "from-emerald-50 to-teal-50",
            "bg-indigo-50": "from-indigo-50 to-purple-50",
          }
          const iconGradientMap: Record<string, string> = {
            "bg-blue-50": "from-blue-500 to-indigo-500",
            "bg-rose-50": "from-rose-500 to-pink-500",
            "bg-emerald-50": "from-emerald-500 to-teal-500",
            "bg-indigo-50": "from-indigo-500 to-purple-500",
          }
          const textColorMap: Record<string, string> = {
            "text-blue-600": "text-blue-700",
            "text-rose-600": "text-rose-700",
            "text-emerald-600": "text-emerald-700",
            "text-indigo-600": "text-indigo-700",
          }
          return (
            <Card key={tile.label} className={`border-0 bg-gradient-to-br shadow-lg hover:shadow-xl transition-shadow overflow-hidden ${gradientMap[tile.bg]}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-3 w-3 ${tile.accent}`} />
                      <p className={`text-[10px] uppercase tracking-[0.15em] font-semibold ${textColorMap[tile.accent]}`}>{tile.label}</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mb-2">{tile.value}</p>
                    <p className={`text-xs font-medium ${textColorMap[tile.accent]}/80`}>{tile.subtext}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg ${iconGradientMap[tile.bg]}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div> */}

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">Unassigned Leads</CardTitle>
            </div>
            <Badge className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold">
              {formatNumber(totalLeads)} Leads
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <TodaysLeadsTable 
            data={leads} 
            total={totalLeads} 
            page={page}
            limit={limit}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onUpdate={handleLeadUpdate} 
            onFiltersChange={handleFiltersChange} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
