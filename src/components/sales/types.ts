export type LeadStage = 
  | "NEW"
  | "UNASSIGNED"
  | "MY_LEAD"
  | "HOT"
  | "FOLLOW_UP"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "ASSESSMENT_PAID"
  | "ASSESSMENT_DONE"
  | "CONVERTED"
  | "DROPPED"

export type Priority = "low" | "medium" | "high"

export type PaymentStage =
  | "INTERESTED"
  | "LINK_SENT"
  | "RECEIVED"
  | "FAILED"
  | "DROPPED"

export type AssessmentStatus = "PENDING" | "COMPLETED"

export type WebinarStatus = "INVITED" | "ATTENDED" | "NOT_ATTENDED"

export type CallOutcome =
  | "NO_RESPONSE"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "CALL_BACK_LATER"
  | "CONVERTED"
  | "CONNECTED"
  | "NOT_ANSWERED"
  | "BUSY"
  | "WRONG_NUMBER"
  | "CALL_BACK_REQUESTED"
  | "FOLLOW_UP_REQUIRED"

export interface HistoryEvent {
  id: string
  action: string
  at: string
  by: string
  changes?: Record<string, { from: any; to: any }>
  metadata?: Record<string, any>
}

export interface PaymentLink {
  id: string
  sentAt: string
  sentBy: string
  status: 'PENDING' | 'OPENED' | 'PAID' | 'EXPIRED'
  amount: number
  paymentLink: string
}

export interface Callback {
  id: string
  scheduledAt: string
  status: 'PENDING' | 'COMPLETED' | 'MISSED'
  notes?: string
  createdBy: string
  completedAt?: string
  completedNotes?: string
}

export interface Lead {
  language_name?: string
  specialty_name?: string
  id: string
  patientName: string
  phone: string
  email: string
  campaign: string
  source?: string
  campaignId?: string
  eventId?: string
  priority?: Priority
  city?: string
  assignedTo: string | null | undefined
  stage: LeadStage
  paymentStage: PaymentStage
  assessmentStatus: AssessmentStatus
  webinarStatus?: WebinarStatus
  programValue?: number
  amountRecovered?: number
  history: HistoryEvent[]
  remarks: Array<{ id: string; text: string; at: string; by: string }>
  paymentLinks: PaymentLink[]
  callbacks: Callback[]
  lastContactedAt?: string
  nextFollowUpAt?: string
  language?: string
  programInterestId?: string
  convertedPatientId?: string
  convertedAt?: string
  lostReason?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  // API specific fields
  name?: string // API uses 'name' instead of 'patientName'
  status?: string // API uses 'status' instead of 'stage'
  assigned_to?: string | null // API uses snake_case
  notes?: string // API uses 'notes' instead of 'remarks'
  created_at?: string // API uses snake_case
  updated_at?: string // API uses snake_case
  assignee_email?: string | null
  assignee_phone?: string | null
  assignee_type?: string | null
  assignee_name?: string | null
  specialtyProgramMode?: string
  mode?: string
  specialty?: string
}

export interface CallLog {
  id: string
  leadId: string
  leadName: string
  phone: string
  callAt: string
  callTime: string
  duration: string
  durationSec: number
  outcome: CallOutcome
  remarks: string
  callbackDate?: string
  callbackTime?: string
  nextFollowUpAt?: string
  notes?: string
  recordingUrl?: string
  userId: string
  createdBy: string
  createdAt: string
}

export interface LeadDetails extends Lead {
  callLogs: CallLog[]
  relatedLeads: Array<{ id: string; relation: string }>
  documents: Array<{ id: string; name: string; type: string; url: string; uploadedAt: string }>
}
