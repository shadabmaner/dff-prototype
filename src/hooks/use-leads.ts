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

interface LeadResponse {
  success: boolean
  statusCode: number
  data: ApiLead
  message?: string
}

interface LeadsResponse {
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
const transformApiLead = (apiLead: any): Lead => {
  // Map API status to our LeadStage
  const stageMap: Record<string, any> = {
    'new': 'NEW',
    'unassigned': 'UNASSIGNED',
    'contacted': 'CONTACTED',
    'follow_up': 'FOLLOW_UP',
    'interested': 'INTERESTED',
    'not_interested': 'NOT_INTERESTED',
    'assessment_paid': 'ASSESSMENT_PAID',
    'assessment_done': 'ASSESSMENT_DONE',
    'hot': 'HOT',
    'converted': 'CONVERTED',
    'dropped': 'DROPPED'
  }

  // Map API priority to our Priority type
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
    paymentStage: 'INTERESTED', // Default value
    assessmentStatus: apiLead.assessment_status, // Default value
    webinarStatus: undefined,
    programValue: undefined,
    amountRecovered: undefined,
    history: [], // Empty for now
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
    // API specific fields
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
    // Specialty and language fields
    specialty_name: apiLead.specialty_name || undefined,
    language_name: apiLead.language_name || undefined,
  }
}

export function useLeads(options?: {
  page?: number;
  limit?: number;
  enabled?: boolean;
  search?: string;
  status?: string;
  specialtyId?: string;
  campaignId?: string;
  telecallerId?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
}) {
  const {
    page = 1,
    limit = 20,
    enabled = true,
    search,
    status,
    specialtyId,
    campaignId,
    telecallerId,
    registrationDateFrom,
    registrationDateTo
  } = options || {}

  // Build query parameters
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  if (search) params.append('search', search)
  if (status) {
    // Map UI status values to API status values
    const statusMap: Record<string, string> = {
      'follow_up_required': 'follow_up',
      'call_back_requested': 'follow_up',
      'not_connected': 'new',
      'connected': 'connected',
      'interested': 'interested',
      'not_interested': 'not_interested',
      'assessment_paid': 'assessment_paid',
      'assessment_done': 'assessment_done',
      'converted': 'converted'
    }
    const apiStatus = statusMap[status] || status
    params.append('status', apiStatus)
  }
  if (specialtyId) params.append('specialtyId', specialtyId)
  if (campaignId) params.append('campaignId', campaignId)
  if (telecallerId) params.append('telecallerId', telecallerId)
  if (registrationDateFrom) params.append('registrationDateFrom', registrationDateFrom)
  if (registrationDateTo) params.append('registrationDateTo', registrationDateTo)

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
    queryKey: ["leads", page, limit, search, status, specialtyId, campaignId, telecallerId, registrationDateFrom, registrationDateTo],
    enabled,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<LeadsResponse>(`/leads?${params.toString()}`)
        if (data?.success && data?.data && data.data.length > 0) {
          return {
            leads: data.data.map(transformApiLead),
            meta: data.meta
          }
        }
      } catch {
        // Fall back to rich mock data below
      }

      // Static fallback leads
      const allStaticLeads = [
        generateMockLead("1a2b3c4d"),
        generateMockLead("2b3c4d5e"),
        generateMockLead("3c4d5e6f"),
        generateMockLead("4d5e6f7g"),
        generateMockLead("5e6f7g8h"),
        generateMockLead("6f7g8h9i"),
        generateMockLead("7g8h9i0j"),
        generateMockLead("8h9i0j1k"),
        ...Array.from({ length: 14 }).map((_, i) => generateMockLead(`lead-${101 + i}`)),
      ]

      return {
        leads: allStaticLeads,
        meta: {
          page: page || 1,
          limit: limit || 20,
          total: allStaticLeads.length,
          totalPages: Math.ceil(allStaticLeads.length / (limit || 20)),
          hasNext: false,
          hasPrev: false,
        }
      }
    },
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  })
}

const KNOWN_PATIENT_RECORDS: Record<string, {
  name: string
  phone: string
  city: string
  specialty?: string
  doctor?: string
  dietitian?: string
  fitnessCoach?: string
  mentor?: string
  stage?: Lead["stage"]
}> = {
  "1a2b3c4d": { name: "Rajesh Kumar", phone: "+91 98765 43210", city: "Mumbai", stage: "ASSESSMENT_PAID" },
  "2b3c4d5e": { name: "Priya Sharma", phone: "+91 98765 43211", city: "Pune", doctor: "Dr. Bhagyesh Kulkarni", dietitian: "Anjali Patel", stage: "ASSESSMENT_PAID" },
  "3c4d5e6f": { name: "Amit Singh", phone: "+91 98765 43212", city: "Delhi", stage: "CONVERTED" },
  "4d5e6f7g": { name: "Sneha Patel", phone: "+91 98765 43213", city: "Ahmedabad", doctor: "Dr. Ramesh Gupta", dietitian: "Pooja Verma", fitnessCoach: "Vikram Singh", mentor: "Rahul Mehta", stage: "CONVERTED" },
  "5e6f7g8h": { name: "Vikram Reddy", phone: "+91 98765 43214", city: "Hyderabad", stage: "ASSESSMENT_PAID" },
  "6f7g8h9i": { name: "Neha Joshi", phone: "+91 98765 43215", city: "Bengaluru", stage: "ASSESSMENT_PAID" },
  "7g8h9i0j": { name: "Suresh Nair", phone: "+91 98765 43216", city: "Chennai", doctor: "Dr. Bhagyesh Kulkarni", dietitian: "Anjali Patel", fitnessCoach: "Vikram Singh", stage: "CONVERTED" },
  "8h9i0j1k": { name: "Anita Desai", phone: "+91 98765 43217", city: "Nagpur", stage: "ASSESSMENT_PAID" },
}

function generateMockLead(id: string): Lead {
  const known = KNOWN_PATIENT_RECORDS[id]

  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  const absHash = Math.abs(hash)

  const NAMES = [
    "Aarav Mehta",
    "Neha Sharma",
    "Vikram Singh",
    "Priya Patel",
    "Rahul Kumar",
    "Anjali Gupta",
    "Suresh Reddy",
    "Meera Joshi",
    "Amit Tiwari",
    "Kavita Nair",
    "Rohan Desai",
    "Sneha Iyer",
    "Arjun Malhotra",
    "Divya Rao",
    "Karan Gill",
    "Pooja Verma",
    "Rajesh Kulkarni"
  ]

  const SPECIALTIES = ["Diabetes Free Forever", "Weight Management", "Thyroid Free Forever", "PCOS Care", "Hypertension Control"]
  const SOURCES = ["Meta", "Google Ads", "YouTube Ads", "Website Direct", "Referral"]
  const CAMPAIGNS = [
    "DFM Marathi Webinar",
    "DFF Hindi Reversal Bootcamp",
    "PCOS Care Sunday Masterclass",
    "Diabetes Freedom Live Workshop",
    "Weight Loss Acceleration Webinar"
  ]
  const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Ahmedabad", "Chennai"]
  const STAGES: Lead["stage"][] = ["NEW", "MY_LEAD", "HOT", "FOLLOW_UP", "INTERESTED", "ASSESSMENT_PAID", "CONVERTED"]

  const patientName = known ? known.name : NAMES[absHash % NAMES.length]
  const specialty = known?.specialty || SPECIALTIES[absHash % SPECIALTIES.length]
  const source = SOURCES[absHash % SOURCES.length]
  const campaign = CAMPAIGNS[absHash % CAMPAIGNS.length]
  const city = known ? known.city : CITIES[absHash % CITIES.length]
  const stage = known?.stage || STAGES[absHash % STAGES.length]
  const phone = known ? known.phone : `+91 98${String(10000000 + absHash).slice(0, 8)}`
  const email = `${patientName.toLowerCase().replace(/\s+/g, ".")}@example.com`

  const initialLabels = [
    "YouTube Video Watched",
    absHash % 2 === 0 ? "Instagram Post Engaged" : "Webinar Attended (Full)",
    absHash % 3 === 0 ? "High Intent Lead" : undefined
  ].filter(Boolean) as string[]

  const createdDate = new Date()
  createdDate.setDate(createdDate.getDate() - (5 + (absHash % 25)))

  const lastContactedDate = new Date()
  lastContactedDate.setDate(lastContactedDate.getDate() - (1 + (absHash % 4)))

  return {
    id,
    patientName,
    name: patientName,
    phone,
    email,
    city,
    source,
    campaign,
    campaignId: `CAMP-${100 + (absHash % 50)}`,
    labels: initialLabels,
    stage,
    status: stage.toLowerCase(),
    priority: (absHash % 3 === 0 ? "high" : absHash % 2 === 0 ? "medium" : "low"),
    paymentStage: stage === "CONVERTED" || stage === "ASSESSMENT_PAID" ? "RECEIVED" : "INTERESTED",
    assessmentStatus: stage === "CONVERTED" || stage === "ASSESSMENT_PAID" ? "COMPLETED" : "PENDING",
    programValue: 24999,
    amountRecovered: stage === "CONVERTED" ? 24999 : stage === "ASSESSMENT_PAID" ? 1499 : 0,
    assignedTo: "telecaller-1",
    assignee_name: "Priya Sharma",
    assignee_email: "priya.sharma@dr.com",
    assignee_phone: "+91 98765 43210",
    assignee_type: "telecaller",
    specialty_name: specialty,
    specialty,
    language: "English",
    language_name: "English",
    created_at: createdDate.toISOString(),
    updated_at: lastContactedDate.toISOString(),
    lastContactedAt: lastContactedDate.toISOString(),
    nextFollowUpAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    notes: `Lead registered interest for ${specialty} after seeing our online webinar. Initial inquiry completed.`,
    utmSource: source.toLowerCase().replace(/\s+/g, "_"),
    utmMedium: "cpc",
    utmCampaign: `${specialty.toLowerCase().replace(/\s+/g, "_")}_funnel`,
    remarks: [
      {
        id: `RM-${id.slice(0, 4)}-1`,
        text: `Customer is eager to begin the reversal protocol. Requested doctor appointment slot.`,
        at: lastContactedDate.toISOString(),
        by: "Priya Sharma"
      }
    ],
    history: [
      {
        id: `HIST-${id.slice(0, 4)}-1`,
        action: "Lead Created",
        at: createdDate.toISOString(),
        by: "System / Inbound Form"
      },
      {
        id: `HIST-${id.slice(0, 4)}-2`,
        action: "Assigned to Telecaller",
        at: new Date(createdDate.getTime() + 3600000).toISOString(),
        by: "Sales Manager"
      }
    ],
    paymentLinks: [
      {
        id: `PL-${absHash % 1000}`,
        amount: 1499,
        paymentLink: "https://pay.example.com/dr-assessment",
        sentAt: lastContactedDate.toISOString(),
        sentBy: "Priya Sharma",
        status: stage === "CONVERTED" || stage === "ASSESSMENT_PAID" ? "PAID" : "PENDING"
      }
    ],
    callbacks: []
  }
}

export function useLead(id?: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true

  return useQuery<Lead, Error>({
    queryKey: ["lead", id],
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      if (!id) {
        throw new Error("Lead id is required")
      }

      try {
        const { data } = await apiClient.get<LeadResponse>(`/leads/${id}`)
        if (data?.success && data?.data) {
          return transformApiLead(data.data)
        }
      } catch {
        // Fallback to rich prototype mock data when lead is not found on live backend
      }

      return generateMockLead(id)
    },
    staleTime: 1000 * 60 * 5,
  })
}
