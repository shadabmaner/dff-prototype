import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"

export type SalesDashboardSummary = {
  totalLeads: number
  activeLeads: number
  newToday: number
  newLast7Days: number
  unassignedLeads: number
}

export type SalesDashboardConversions = {
  totalConverted: number
  convertedThisMonth: number
  conversionRate: number
  avgTimeToConvertDays: number
}

export type SalesDashboardPipelineStage = {
  status: string
  count: number
}

export type SalesDashboardFollowUps = {
  pendingToday: number
  overdue: number
  completedLast7Days: number
  scheduledLast7Days: number
  responseRate: number
}

export type SalesDashboardActivities = {
  callLogsToday: number
  callLogsLast7Days: number
  activeTelecallersLast7Days: number
}

export type SalesDashboardFunnelHealth = {
  stuckLeads: number
}

export type SalesDashboardLeadSource = {
  source: string
  count: number
}

export type SalesDashboardKpi = {
  summary: SalesDashboardSummary
  conversions: SalesDashboardConversions
  pipeline: SalesDashboardPipelineStage[]
  followUps: SalesDashboardFollowUps
  activities: SalesDashboardActivities
  funnelHealth: SalesDashboardFunnelHealth
  leadSources: SalesDashboardLeadSource[]
}

type SalesDashboardResponse = {
  success: boolean
  statusCode: number
  message?: string
  data: SalesDashboardKpi
}

export function useSalesDashboardKpi(options?: { enabled?: boolean }) {
  return useQuery<SalesDashboardKpi, Error>({
    queryKey: ["sales-dashboard-kpi"],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const { data } = await apiClient.get<SalesDashboardResponse>("/sales/dashboard/kpi")
      if (!data?.success || !data?.data) {
        throw new Error(data?.message ?? "Unable to load sales KPIs")
      }
      return data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Enable refetch on window focus
    refetchOnReconnect: true, // Enable refetch on network reconnection
  })
}
