import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { Telecaller } from "@/hooks/use-telecallers"
import {
  buildTelecallerPatients,
  enrichTelecaller,
  type TelecallerPatient,
} from "@/lib/sales/telecaller-metrics"

export type TelecallerDetail = Telecaller & {
  patients: TelecallerPatient[]
}

function mapLeadToPatient(lead: {
  id: string
  patientName?: string
  name?: string
  phone: string
  email?: string
  status?: string
  specialty_name?: string
  source?: string
  lastContactedAt?: string
  convertedAt?: string
}): TelecallerPatient {
  return {
    id: lead.id,
    name: lead.patientName || lead.name || "Unknown",
    phone: lead.phone,
    email: lead.email,
    status: lead.status || "new",
    specialty: lead.specialty_name,
    source: lead.source,
    lastContactedAt: lead.lastContactedAt,
    convertedAt: lead.convertedAt,
  }
}

async function fetchTelecallerLeads(telecallerId: string): Promise<TelecallerPatient[]> {
  try {
    const params = new URLSearchParams({
      page: "1",
      limit: "50",
      telecallerId,
    })
    const { data } = await apiClient.get(`/leads?${params.toString()}`)
    const leads = Array.isArray(data?.data) ? data.data : []

    return leads.map((lead: any) =>
      mapLeadToPatient({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        status: lead.status,
        specialty_name: lead.specialty_name,
        source: lead.source,
        lastContactedAt: lead.last_contacted_at,
        convertedAt: lead.converted_at,
      })
    )
  } catch {
    return []
  }
}

export function useTelecallerDetail(telecallerId: string, cachedTelecaller?: Telecaller) {
  return useQuery<TelecallerDetail, Error>({
    queryKey: ["telecaller-detail", telecallerId],
    enabled: Boolean(telecallerId),
    queryFn: async () => {
      let telecaller: Telecaller | undefined = cachedTelecaller

      if (!telecaller) {
        try {
          const { data } = await apiClient.get(`/telecallers/${telecallerId}`)
          const item = data?.data ?? data
          if (item?.id) {
            telecaller = {
              id: item.id,
              name: item.name || item.full_name || item.display_name,
              email: item.email,
              phone: item.phone,
              is_active: item.is_active,
              status: item.is_active === false ? "inactive" : "active",
              patientCount: item.patient_count,
              totalCalls: item.total_calls,
              outboundCalls: item.outbound_calls,
              contactedCount: item.contacted_count,
              conversions: item.conversions,
              conversionRate: item.conversion_rate,
              joinedAt: item.created_at,
            }
          }
        } catch {
          telecaller = undefined
        }
      }

      if (!telecaller) {
        throw new Error("Telecaller not found")
      }

      const enriched = enrichTelecaller(telecaller)
      const apiPatients = await fetchTelecallerLeads(telecallerId)
      const patients = apiPatients.length > 0 ? apiPatients : buildTelecallerPatients(enriched)

      return {
        ...enriched,
        patientCount: apiPatients.length || enriched.patientCount,
        patients,
      }
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: cachedTelecaller
      ? {
          ...enrichTelecaller(cachedTelecaller),
          patients: buildTelecallerPatients(cachedTelecaller),
        }
      : undefined,
  })
}
