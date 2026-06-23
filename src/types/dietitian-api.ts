// API Types for Dietitian Module Enhancements

export interface DoctorReferral {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  consultationReason: string
  notes?: string
  priority: "low" | "medium" | "high"
  status: "pending" | "accepted" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface DietPlanCycle {
  id: string
  patientId: string
  startDate: Date
  currentCycle: number
  cycles: {
    cycle: number
    duration: number
    startDate: Date
    endDate: Date
    status: "completed" | "active" | "upcoming"
  }[]
  status: "active" | "completed" | "paused"
  createdAt: Date
  updatedAt: Date
}

export interface DietPlan {
  id: string
  patientId: string
  planName: string
  planType: "15days" | "90days" | "custom"
  isEditable: boolean
  isConfirmed: boolean
  confirmedAt?: Date
  sentAt?: Date
  meals: DietMeal[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface DietMeal {
  id: string
  day: number
  timing: string
  mealType: string
  foodItems: string[]
  energy: string
  protein: string
  reason: string
}

export interface ConsultationHistory {
  id: string
  patientId: string
  type: "consultation" | "diet_plan" | "follow_up" | "referral" | "progress"
  date: Date
  title: string
  description: string
  metadata?: {
    doctor?: string
    planType?: string
    weight?: number
    notes?: string
  }
}

export interface PatientRequest {
  id: string
  patientId: string
  patientName: string
  requestDate: Date
  reason: string
  status: "pending" | "confirmed" | "rescheduled" | "cancelled"
  priority: "low" | "medium" | "high"
  assignedTo?: string
  scheduledDate?: Date
  scheduledTime?: string
  createdAt: Date
  updatedAt: Date
}

// API Request/Response Types

export interface CreateDoctorReferralRequest {
  patientId: string
  doctorId: string
  consultationReason: string
  notes?: string
  priority: "low" | "medium" | "high"
}

export interface CreateDoctorReferralResponse {
  success: boolean
  referral: DoctorReferral
  message: string
}

export interface StartDietPlanRequest {
  patientId: string
  startDate: Date
  planType: "15days" | "90days" | "custom"
}

export interface StartDietPlanResponse {
  success: boolean
  dietPlanCycle: DietPlanCycle
  message: string
}

export interface UpdateDietPlanRequest {
  dietPlanId: string
  meals?: DietMeal[]
  isConfirmed?: boolean
}

export interface UpdateDietPlanResponse {
  success: boolean
  dietPlan: DietPlan
  message: string
}

export interface GetConsultationHistoryRequest {
  patientId: string
  limit?: number
  offset?: number
}

export interface GetConsultationHistoryResponse {
  success: boolean
  history: ConsultationHistory[]
  total: number
}

export interface ConfirmPatientRequestRequest {
  requestId: string
  scheduledDate: Date
  scheduledTime: string
  assignedTo: string
}

export interface ConfirmPatientRequestResponse {
  success: boolean
  request: PatientRequest
  message: string
}

export interface ReschedulePatientRequestRequest {
  requestId: string
  newDate: Date
  newTime: string
  reason: string
}

export interface ReschedulePatientRequestResponse {
  success: boolean
  request: PatientRequest
  message: string
}
