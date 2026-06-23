import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"

export type TelecallerDashboardActivity = {
  leadName: string
  outcome: string
  leadStage: string
  timeAgo: string
}

export type TelecallerDashboardPayload = {
  totalAssignedLeads: number
  callsToday: number
  connectedCalls: number
  pendingFollowUps: number
  conversionRate: number
  pendingCalls: number
  recentCallActivity: TelecallerDashboardActivity[]
}

type TelecallerDashboardResponse = {
  success: boolean
  statusCode: number
  message?: string
  data: TelecallerDashboardPayload
}

type TelecallerDashboardOptions = {
  enabled?: boolean
  staleTime?: number
  refetchOnMount?: boolean | "always"
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
}

export function useTelecallerDashboard(options?: TelecallerDashboardOptions) {
  const enabled = options?.enabled ?? true

  return useQuery<TelecallerDashboardPayload, Error>({
    queryKey: ["telecaller-dashboard"],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<TelecallerDashboardResponse>("/sales/telecaller-dashboard")

      if (!data?.success || !data?.data) {
        throw new Error(data?.message ?? "Unable to load telecaller dashboard data")
      }

      return data.data
    },
    staleTime: options?.staleTime ?? 0,
    refetchOnMount: options?.refetchOnMount ?? "always",
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
    refetchOnReconnect: options?.refetchOnReconnect ?? true,
  })
}
