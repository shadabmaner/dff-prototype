export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
export type PaymentMethod = "UPI" | "Razorpay" | "PhonePe" | "GooglePay" | "Cash"
export type PatientStatus = "pending" | "active" | "inactive" | "completed"
export type CallStatus = "scheduled" | "completed" | "pending" | "missed"
export type AssessmentStatus = "pending" | "in_progress" | "completed"
export type StaffRole = "doctor" | "dietitian" | "physiotherapist" | "service_operator" | "sales"
export type HealthGoal = "weight_loss" | "weight_gain" | "diabetes_care" | "pcos_management" | "fitness" | "physiotherapy"
export type PlanChangeStatus = "pending" | "approved" | "rejected" | "in_review"
export type AppActivityType = "meal_log" | "workout_log" | "water_intake" | "weight_update" | "app_login"

export interface PendingPatient {
  id: string
  name: string
  phone: string
  email?: string
  age?: number
  gender?: string
  city?: string
  healthGoal?: HealthGoal
  program: string
  programPrice: number
  discount: number
  finalAmount: number
  paymentStatus: PaymentStatus
  callStatus: CallStatus
  callDate?: string
  callTime?: string
  callUrl?: string
  assignedStaff?: {
    doctor?: string
    dietitian?: string
    physiotherapist?: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  age?: number
  gender?: string
  city?: string
  program: string
  programDuration?: string
  status: PatientStatus
  assignedStaff: {
    doctor?: Staff
    dietitian?: Staff
    physiotherapist?: Staff
  }
  assessment?: Assessment
  registeredAt: string
  lastActivity?: string
}

export interface Assessment {
  id: string
  patientId: string
  height?: number
  weight?: number
  bmi?: number
  medicalConditions?: string[]
  lifestyle?: string
  foodPreferences?: string[]
  completedAt?: string
}

export interface Staff {
  id: string
  name: string
  role: StaffRole
  specialization?: string
  phone: string
  email: string
  experience?: number
  availability?: string
  status: "active" | "inactive"
  metrics?: {
    patientsAssigned: number
    assessmentsCompleted: number
    activePatients: number
  }
  createdAt: string
}

export interface Payment {
  id: string
  patientId: string
  patientName: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  date: string
  program?: string
}

export interface PlanChangeRequest {
  id: string
  patientId: string
  patientName: string
  currentPlan: string
  requestedChange: string
  reason?: string
  status: PlanChangeStatus
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface AppLog {
  id: string
  patientId: string
  patientName: string
  activityType: AppActivityType
  details?: string
  date: string
  status: "success" | "failed" | "pending"
}

export interface DashboardStats {
  totalPatients: number
  activePatients: number
  pendingAssessments: number
  paymentsPending: number
  doctorsAssigned: number
  dietitiansAssigned: number
  newPatientsToday: number
  callsScheduled: number
  assessmentsCompleted: number
}

export interface ChartData {
  name: string
  value: number
}

export interface ActivityFeed {
  id: string
  type: "registration" | "payment" | "assessment" | "assignment" | "plan"
  message: string
  timestamp: string
  patientName?: string
}
