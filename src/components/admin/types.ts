export type DepartmentKey =
  | "marketing"
  | "sales"
  | "service"
  | "doctor"
  | "dietitian"
  | "physio"
  | "pharmacy"
  | "finance"

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export interface Kpi {
  id: string
  label: string
  value: string
  delta?: string
}

export interface DepartmentPerformance {
  dept: DepartmentKey
  name: string
  score: number
  openItems: number
}

export interface RiskIndicator {
  id: string
  title: string
  level: RiskLevel
  detail: string
  createdAt: string
}

export interface Specialty {
  id: string
  name: string
  isActive: boolean
}

export interface Plan {
  id: string
  specialtyId: string
  name: string
  durationDays: number
  price: number
  isActive: boolean
}

export interface CommunityPost {
  id: string
  authorName: string
  authorId: string
  title: string
  body: string
  createdAt: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export interface UserControl {
  id: string
  userId: string
  userName: string
  isBanned: boolean
  notes?: string
}

export type TestimonialType = "VIDEO" | "TEXT" | "DOCUMENT"

export interface Testimonial {
  id: string
  type: TestimonialType
  title: string
  submittedBy: string
  submittedAt: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  assetUrl?: string
  content?: string
}

export type StaffRole = "doctor" | "dietitian" | "physio" | "sales" | "pharmacist"

export interface StaffMember {
  id: string
  name: string
  role: StaffRole
  isActive: boolean
  specialty?: string
  email?: string
}

export interface AppConfig {
  featureFlags: Record<string, boolean>
  notificationGovernance: {
    allowMarketingBroadcasts: boolean
    allowPatientReminders: boolean
    requireApprovalForBroadcasts: boolean
  }
  contentRules: {
    communityAutoApprove: boolean
    bannedWords: string
  }
}

export interface AuditEvent {
  id: string
  patientId: string
  patientName: string
  actor: string
  action: string
  at: string
  metadata?: Record<string, any>
}
