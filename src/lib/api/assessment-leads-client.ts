import { apiClient } from "@/lib/api-client"
import type { AssessmentLeadStatus, AssessmentLeadsResponse } from "@/types/assessment-leads"

export interface AssessmentLeadParams {
  status: AssessmentLeadStatus
  page?: number
  limit?: number
  search?: string
}

export interface LeadTimelineEvent {
  id: string
  timestamp: string
  event_type: string
  notes: string
  old_status: string | null
  new_status: string | null
  performed_by_name: string | null
  source: string
}

export interface LeadTimelineResponse {
  success: boolean
  statusCode: number
  data: {
    lead: {
      id: string
      name: string
      phone: string
      status: string
      lastContactedAt: string | null
      createdAt: string
      source: string
      assignment: {
        isAssigned: boolean
        assignedToName: string
        assignedToRole: string
      }
      assessment: {
        status: string
        paidDate: string | null
        completedDate: string | null
      }
    }
    callLogs: any[]
    timeline: LeadTimelineEvent[]
  }
}

export async function getAssessmentLeads({
  status,
  page = 1,
  limit = 20,
  search,
}: AssessmentLeadParams): Promise<AssessmentLeadsResponse> {
  const params = new URLSearchParams()
  params.append("status", status)
  params.append("page", page.toString())
  params.append("limit", limit.toString())
  if (search) {
    params.append("search", search)
  }

  const { data } = await apiClient.get<AssessmentLeadsResponse>(`/leads?${params.toString()}`)
  return data
}

export async function getLeadTimeline(leadId: string): Promise<LeadTimelineResponse> {
  const { data } = await apiClient.get<LeadTimelineResponse>(`/leads/${leadId}/timeline`)
  return data
}
