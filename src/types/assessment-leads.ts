export type AssessmentLeadStatus = "assessment_done" | "assessment_paid"

export interface AssessmentLead {
  id: string
  name: string
  phone: string
  email: string | null
  source: string | null
  campaign_id: string | null
  event_id: string | null
  status: AssessmentLeadStatus | string
  priority: string | null
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
  specialty_id: string | null
  specialty_name: string | null
  language_code: string | null
  language_name: string | null
  mode: string | null
  assessment_status?: string | null
  assessment_payment_date?: string | null
  assessment_completed_at?: string | null
  selected_plan_id?: string | null
  payment_reference?: string | null
  next_follow_up_date?: string | null
  user_id?: string | null
  assignee_name?: string | null
  assignee_email?: string | null
  assignee_phone?: string | null
  assignee_type?: string | null
  user_name?: string | null
  user_email?: string | null
  user_phone?: string | null
  user_type?: string | null
}

export interface AssessmentLeadsResponse {
  success: boolean
  statusCode: number
  data: AssessmentLead[]
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
