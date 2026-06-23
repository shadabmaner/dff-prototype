import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { Lead } from "@/components/sales/types"

// API response type
interface ApiLead {
  id: string
  name: string
  phone: string
  email: string
  source: string
  campaign_id: string | null
  event_id: string | null
  status: string
  priority: string
  assigned_to: string | null
  converted_patient_id: string | null
  notes: string | null
  city: string | null
  language: string | null
  program_interest_id: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  last_contacted_at: string | null
  converted_at: string | null
  lost_reason: string | null
  created_at: string
  updated_at: string
  assignee_email: string | null
  assignee_phone: string | null
  assignee_type: string | null
  assignee_name: string | null
  mode: string | null
  specialty_id: string | null
  specialty_name: string | null
  language_code: string | null
  language_name: string | null
}

interface UnassignedLeadsResponse {
  success: boolean
  statusCode: number
  data: ApiLead[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  message?: string
}

// Transform API lead to our Lead type
const transformApiLead = (apiLead: ApiLead): Lead => {
  const stageMap: Record<string, any> = {
    'new': 'NEW',
    'unassigned': 'UNASSIGNED',
    'contacted': 'CONTACTED',
    'follow_up': 'FOLLOW_UP',
    'hot': 'HOT',
    'converted': 'CONVERTED',
    'dropped': 'DROPPED'
  }

  const priorityMap: Record<string, any> = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high'
  }

  return {
    id: apiLead.id,
    patientName: apiLead.name,
    phone: apiLead.phone,
    email: apiLead.email,
    campaign: apiLead.source || 'Unknown',
    source: apiLead.source,
    campaignId: apiLead.campaign_id || undefined,
    eventId: apiLead.event_id || undefined,
    priority: priorityMap[apiLead.priority] || 'medium',
    city: apiLead.city || undefined,
    assignedTo: apiLead.assigned_to,
    stage: stageMap[apiLead.status] || 'NEW',
    paymentStage: 'INTERESTED',
    assessmentStatus: 'PENDING',
    webinarStatus: undefined,
    programValue: undefined,
    amountRecovered: undefined,
    history: [],
    remarks: apiLead.notes ? [{
      id: `RM-${Math.random().toString(36).slice(2, 7)}`,
      text: apiLead.notes,
      at: apiLead.created_at,
      by: 'system'
    }] : [],
    paymentLinks: [],
    callbacks: [],
    lastContactedAt: apiLead.last_contacted_at || undefined,
    nextFollowUpAt: undefined,
    language: apiLead.language || undefined,
    programInterestId: apiLead.program_interest_id || undefined,
    convertedPatientId: apiLead.converted_patient_id || undefined,
    convertedAt: apiLead.converted_at || undefined,
    lostReason: apiLead.lost_reason || undefined,
    utmSource: apiLead.utm_source || undefined,
    utmMedium: apiLead.utm_medium || undefined,
    utmCampaign: apiLead.utm_campaign || undefined,
    name: apiLead.name,
    status: apiLead.status,
    assigned_to: apiLead.assigned_to,
    notes: apiLead.notes || undefined,
    created_at: apiLead.created_at,
    updated_at: apiLead.updated_at,
    assignee_email: apiLead.assignee_email,
    assignee_phone: apiLead.assignee_phone,
    assignee_type: apiLead.assignee_type,
    assignee_name: apiLead.assignee_name,
    mode: apiLead.mode || undefined,
    specialty_name: apiLead.specialty_name || undefined,
    language_name: apiLead.language_name || undefined,
  }
}

export function useUnassignedLeads(options?: {
  page?: number;
  limit?: number;
  enabled?: boolean;
  search?: string;
}) {
  const {
    page = 1,
    limit = 20,
    enabled = true,
    search,
  } = options || {}

  // Build query parameters
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  if (search) params.append('search', search)

  return useQuery<{
    leads: Lead[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }, Error>({
    queryKey: ["unassigned-leads", page, limit, search],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<UnassignedLeadsResponse>(`/leads/unassigned-new?${params.toString()}`)

      if (!data?.success || !data?.data) {
        throw new Error(data?.message || "Unable to load unassigned leads")
      }

      return {
        leads: data.data.map(transformApiLead),
        meta: data.meta
      }
    },
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  })
}
