export interface PatientListItem {
  patient_id: string
  first_name: string
  last_name: string
  phone: string
  weight_kg: number | null
  height_cm: number | null
  email: string | null
  enrollment_id: string
  enrollment_status: "active" | "inactive" | "completed" | "cancelled" | "fee_paid"
  starts_at: string
  ends_at: string
  assigned_doctor_id: string | null
  assigned_nutritionist_id: string | null
  assigned_fitness_coach_id: string | null
  program_id: string
  program_name: string
  duration_days: number
  speciality_id: string
  speciality_name: string
  latest_assessment_id: string | null
  severity_score: number | null
  severity_level: "low" | "medium" | "high" | null
  assessment_status: "pending" | "completed" | null
  doctor_first_name: string | null
  doctor_last_name: string | null
  dietician_first_name: string | null
  dietician_last_name: string | null
  physio_first_name: string | null
  physio_last_name: string | null
  history_call_id: string | null
  history_call_status: "pending" | "confirmed" | "completed" | "cancelled" | null
  history_call_date: string | null
  history_call_time: string | null
  supplement_kit_eligibility: "eligible_for_kit" | "initiated" | "dispatched" | null
}

export interface PatientDetail extends PatientListItem {
  // Additional fields from detail endpoint
}

export interface StaffMember {
  id: string
  user_id?: string
  staff_type: "doctor" | "nutritionist" | "fitness_coach" | "finance" | string
  first_name: string
  last_name: string
  specialization: string | null
  qualification: string | null
  registration_number: string | null
  experience_years: number | null
  bio: string | null
  profile_photo_url: string | null
  languages: string[] | null
  consultation_fee: number | null
  max_patients: number | null
  current_patient_count: number
  is_available: boolean
  rating: number | null
  total_reviews: number
  created_at?: string
  updated_at?: string
  name: string | null
  role_id: string | null
  speciality_id: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  pincode: string | null
  speciality_name: string | null
  role_name: string | null
}

export interface StaffAssignedPatient {
  patient_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  enrollment_status: string | null
  program_id: string | null
  enrolled_at: string | null
  starts_at: string | null
  ends_at: string | null
  last_consultation: string | null
}

export interface StaffAppointment {
  id: string
  appointment_date: string | null
  start_time: string | null
  end_time: string | null
  status: string | null
  patient_id: string
  patient_name: string | null
  call_type: string | null
  mode: string | null
  appointment_type: string | null
}

export interface StaffStats {
  total_assigned_patients: number
  total_appointments: number
  upcoming_appointments_count: number
  completed_appointments_count: number
  pending_appointments_count: number
  cancelled_appointments_count: number
}

export interface StaffDetailResponse {
  profile: StaffMember
  assigned_patients: {
    data: StaffAssignedPatient[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  appointments: {
    data: StaffAppointment[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  stats: StaffStats
}

export interface CreateStaffRequest {
  phone: string
  password: string
  email: string
  first_name: string
  last_name: string
  role_id: string
  specialization?: string
  qualification?: string
  registration_number?: string
  experience_years?: number
  bio?: string
  profile_photo_url?: string
  consultation_fee?: number
  max_patients?: number
  languages?: string[]
  address?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
}

export interface CreateStaffResponse extends StaffMember {
  user_email: string
  user_phone: string
  user_is_active: boolean
  role_display_name: string
}

export interface HistoryCallRequest {
  doctor_id: string
  nutritionist_id: string
  fitness_coach_id?: string
  scheduled_date: string
  scheduled_time: string
  duration_mins: number
  mode: "video" | "audio" | "in_person" | "offline"
  notes?: string
  meeting_link?: string
  address?: string
  offline_location?: {
    city: string
    address: string
    pincode: string
    displayName: string
  }
}

export interface HistoryCallResponse {
  success: boolean
  statusCode: number
  data: {
    appointment: {
      id: string
      patient_id: string
      staff_id: string
      slot_id: string | null
      enrollment_id: string | null
      appointment_type: string
      status: string
      appointment_date: string
      start_time: string
      end_time: string
      reason: string | null
      notes: string | null
      cancellation_reason: string | null
      rejection_reason: string | null
      created_at: string
      updated_at: string
      call_type: string
      mode: string
      host_staff_id: string
      scheduled_date: string
      scheduled_time: string
      duration_mins: number
    }
    participants: Array<{
      appointment_id: string
      staff_id: string
      role: string
      is_host: boolean
    }>
    enrollment_updated: {
      assigned_doctor_id: string
      assigned_nutritionist_id: string
      status: string
    }
  }
}

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface PatientListParams {
  page?: number
  limit?: number
  speciality_id?: string
  enrollment_status?: string
  search?: string
  history?: boolean
  history_call_status?: "pending" | "confirmed" | "completed" | "cancelled" | "not_scheduled"
  supplement_kit_eligibility?: "eligible_for_kit" | "initiated" | "dispatched"
}

export interface StaffListParams {
  page?: number
  limit?: number
  staff_type?: "doctor" | "nutritionist" | "fitness_coach"
  speciality_id?: string
  is_available?: boolean
  search?: string
}

export interface MissingAppointmentsParams {
  page?: number
  limit?: number
  call_type?: "history_call" | "consultation" | string
}

export interface AssignProvidersRequest {
  doctor_id: string
  nutritionist_id: string
  fitness_coach_id: string
}

export interface AssignProvidersResponse {
  success: boolean
  statusCode: number
  data: {
    patient_id: string
    assigned_doctor_id: string
    assigned_nutritionist_id: string
    assigned_fitness_coach_id: string
  }
}
