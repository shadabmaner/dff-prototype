"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { getAssessmentLeads, getLeadTimeline, type AssessmentLeadParams, type LeadTimelineResponse } from "@/lib/api/assessment-leads-client"
import type { AssessmentLead } from "@/types/assessment-leads"

interface UseAssessmentLeadsOptions extends AssessmentLeadParams {}

export type AssessmentLeadsQueryData = {
  leads: AssessmentLead[]
  meta: UseAssessmentMeta
}

export function useAssessmentLeads(
  options: UseAssessmentLeadsOptions & { enabled?: boolean }
): UseQueryResult<AssessmentLeadsQueryData, Error> {
  const { status, page = 1, limit = 20, search, enabled = true } = options

  return useQuery<AssessmentLeadsQueryData, Error>({
    queryKey: ["assessment-leads", status, page, limit, search],
    queryFn: async () => {
      const response = await getAssessmentLeads({ status, page, limit, search })
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch assessment leads")
      }
      return {
        leads: response.data,
        meta: response.meta,
      }
    },
    staleTime: 1000 * 30,
    enabled,
  })
}

interface UseAssessmentMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function useLeadTimeline(leadId: string, options?: { enabled?: boolean }): UseQueryResult<LeadTimelineResponse, Error> {
  return useQuery<LeadTimelineResponse, Error>({
    queryKey: ["lead-timeline", leadId],
    queryFn: () => getLeadTimeline(leadId),
    staleTime: 1000 * 60 * 2,
    enabled: options?.enabled ?? !!leadId,
  })
}
