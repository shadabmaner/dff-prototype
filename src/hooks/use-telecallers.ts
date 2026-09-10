import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import {
  enrichTelecaller,
  type TelecallerCallLog,
  type TelecallerOutcomeBreakdown,
  type TelecallerWeeklyTrend,
} from "@/lib/sales/telecaller-metrics"

export interface Telecaller {
  id: string
  name?: string
  email?: string
  phone?: string
  status?: string
  is_active?: boolean
  patientCount?: number
  totalCalls?: number
  outboundCalls?: number
  inboundCalls?: number
  contactedCount?: number
  connectedCalls?: number
  conversions?: number
  conversionRate?: number
  avgCallsPerDay?: number
  avgCallDurationSeconds?: number
  joinedAt?: string
  weeklyTrends?: TelecallerWeeklyTrend[]
  outcomesBreakdown?: TelecallerOutcomeBreakdown[]
  recentCallLogs?: TelecallerCallLog[]
  roleSpecialization?: "lead_nurture" | "welcome_call" | "payment_recovery" | "residential_camp"
}

export function useTelecallers(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true

  return useQuery<Telecaller[], Error>({
    queryKey: ["telecallers"],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get("/telecallers")
      const items = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []

      return (items as any[]).reduce<Telecaller[]>((acc, item) => {
        if (!item?.id) return acc

        acc.push(
          enrichTelecaller({
            id: item.id,
            name: item.name || item.full_name || item.display_name,
            email: item.email,
            phone: item.phone,
            status: item.is_active === false ? "inactive" : "active",
            is_active: item.is_active,
            patientCount: item.patient_count ?? item.patientCount,
            totalCalls: item.total_calls ?? item.totalCalls,
            outboundCalls: item.outbound_calls ?? item.outboundCalls,
            inboundCalls: item.inbound_calls ?? item.inboundCalls,
            contactedCount: item.contacted_count ?? item.contactedCount,
            connectedCalls: item.connected_calls ?? item.connectedCalls,
            conversions: item.conversions,
            conversionRate: item.conversion_rate ?? item.conversionRate,
            avgCallsPerDay: item.avg_calls_per_day ?? item.avgCallsPerDay,
            joinedAt: item.created_at ?? item.joinedAt,
            roleSpecialization: item.role_specialization ?? item.roleSpecialization,
          })
        )
        return acc
      }, [])
    },
    staleTime: 1000 * 60 * 5,
  })
}
