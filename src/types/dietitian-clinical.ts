export interface DietitianPatient {
  patient_id: string
  patient_name?: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  program_id?: string
  program_stage?: string
  program_name?: string
  enrollment_status?: string
  starts_at?: string | null
  current_day?: number | string
  ends_at?: string | null
  age?: number
  gender?: string
  last_consulted_at?: string
  adherence_percentage?: number
  risk_level?: string
  severity_level?: string
}

export interface DietitianPatientsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export interface DietitianAppointment {
  id?: string
  appointment_id: string
  patient_id?: string
  staff_id?: string
  host_staff_id?: string
  slot_id?: string | null
  enrollment_id?: string | null
  patient_name?: string
  patient_first_name?: string | null
  patient_last_name?: string | null
  patient_phone?: string | null
  appointment_type?: string
  call_type?: string
  mode?: string
  appointment_date?: string
  scheduled_date?: string
  appointment_time?: string
  scheduled_time?: string
  start_time?: string | null
  end_time?: string | null
  duration_mins?: number | null
  status?: string
  program_stage?: string
  consultation_link?: string
  notes?: string
  priority?: string | null
  created_at?: string
  updated_at?: string
  reason?: string | null
  cancellation_reason?: string | null
  rejection_reason?: string | null
}

export interface CreateAppointmentRequest {
  patientId: string
  appointmentDate: string
  startTime: string
  endTime: string
  reason?: string
  consultationMode?: string
  meetingLink?: string
  address?: string
}

export interface RescheduleAppointmentRequest {
  newDate: string
  newStartTime: string
  newEndTime: string
  reason?: string
}

export interface DietitianAppointmentsParams {
  page?: number
  limit?: number
  status?: string
  date?: string
}

export interface DietitianApiResponse<T> {
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

export interface DietPlanFoodItem {
  name: string
  quantity?: string | null
}

export interface DietPlanMeal {
  id: string
  diet_plan_id: string
  meal_type?: string | null
  day_of_week?: string | null
  description?: string | null
  food_items: Array<DietPlanFoodItem | DietPlanFoodItem[]>
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fats_g?: number | null
  recommended_time?: string | null
  alternatives?: string | null
  sort_order: number
  created_at?: string | null
  updated_at?: string | null
  start_time?: string | null
  is_veg?: boolean | null
  condition_tags?: string | null
  reminder_enabled?: boolean | null
  is_required?: boolean | null
  day_number: number
}

export interface DietPlanDayDetail {
  id: string
  diet_plan_id: string
  day_number: number
  tips?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface RecentAppointment {
  id: string
  patient_id: string
  staff_id?: string | null
  appointment_type?: string | null
  status?: string | null
  appointment_date?: string | null
  start_time?: string | null
  end_time?: string | null
  duration_mins?: number | null
  mode?: string | null
  call_type?: string | null
  meeting_link?: string | null
  reason?: string | null
  notes?: string | null
  updated_at?: string | null
  scheduled_time?: string | null
  scheduled_date?: string | null
}

export interface AssessmentSubmission {
  id: string
  speciality_name?: string | null
  created_at?: string | null
  questions_and_answers?: any[]
  raw_responses_json?: any
}

export interface PatientClinicalDetails {
  patient: {
    id: string
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    phone?: string | null
    date_of_birth?: string | null
    gender?: string | null
    height_cm?: number | null
    weight_kg?: number | null
    blood_group?: string | null
    medical_conditions?: string | null
    allergies?: string | null
    food_allergies?: string | null
    current_medications?: string | null
    dietary_preferences?: string | null
    lifestyle?: string | null
    occupation?: string | null
    emergency_contact_name?: string | null
    emergency_contact_phone?: string | null
    address_line1?: string | null
    address_line2?: string | null
    city?: string | null
    state?: string | null
    pincode?: string | null
    country?: string | null
  }
  enrollment: {
    id: string
    program_id?: string | null
    status?: string | null
    enrolled_at?: string | null
    starts_at?: string | null
    ends_at?: string | null
    assigned_staff?: {
      doctor?: {
        id: string
        name?: string | null
        phone?: string | null
      } | null
      nutritionist?: {
        id: string
        name?: string | null
        phone?: string | null
      } | null
      fitness_coach?: {
        id: string
        name?: string | null
        phone?: string | null
      } | null
    }
  }
  active_diet_plan?: {
    diet_plan_id: string
    template_id?: string | null
    template_name?: string | null
    plan_name?: string | null
    title?: string | null
    description?: string | null
    status?: string | null
    start_date?: string | null
    end_date?: string | null
    is_completed?: boolean
    completion_percentage?: number | null
    created_at?: string | null
    updated_at?: string | null
    meals?: DietPlanMeal[]
    day_details?: DietPlanDayDetail[]
    tips?: string | null
  } | null
  diet_plans?: Array<{
    diet_plan_id: string
    template_id?: string | null
    template_name?: string | null
    plan_name?: string | null
    status?: string | null
    start_date?: string | null
    end_date?: string | null
    is_completed?: boolean
    completion_percentage?: number | null
    created_at?: string | null
    updated_at?: string | null
  }>
  recent_meals?: Array<any>
  assessment_submissions?: AssessmentSubmission[]
  recent_appointments?: RecentAppointment[]
}
export interface StaffSlot {
  id: string
  staff_id: string
  slot_date: string
  start_time: string
  end_time: string
  status: string
  booked_by?: string | null
  created_at?: string
  updated_at?: string
  offline_location?: string | null
}
