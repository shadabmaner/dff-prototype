export interface DoctorPatient {
  patient_id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  program_id?: string
  program_stage?: string
  program_name?: string
  enrollment_status?: string
  starts_at?: string | null
  ends_at?: string | null
  current_day?: string | number | null
  age?: number
  gender?: string
  last_consulted_at?: string
  adherence_percentage?: number
  risk_level?: string
  severity_level?: string
  date_of_birth?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  blood_group?: string | null
  medical_conditions?: string | null
  allergies?: string | null
  current_medications?: string | null
}

export interface DoctorPatientsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  // Optional filters used primarily for appointments queries
  date?: string
  isUpcoming?: boolean
}

export interface DoctorPatientDetails {
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
    current_medications?: string | null
    dietary_preferences?: string | null
    lifestyle?: string | null
    occupation?: string | null
    emergency_contact_name?: string | null
    emergency_contact_phone?: string | null
    address_line1?: string | null
    city?: string | null
    state?: string | null
    pincode?: string | null
  }
  enrollment?: {
    id: string
    program_id?: string | null
    status?: string | null
    enrolled_at?: string | null
    starts_at?: string | null
    ends_at?: string | null
    assigned_staff?: {
      doctor?: { id: string; name?: string | null; phone?: string | null } | null
      nutritionist?: { id: string; name?: string | null; phone?: string | null } | null
      fitness_coach?: { id: string; name?: string | null; phone?: string | null } | null
    }
  }
  recent_appointments?: DoctorAppointment[]
  assessment_submissions?: Array<{
    id: string
    speciality_name?: string | null
    created_at?: string | null
    questions_and_answers?: any[]
  }>
}

export interface DoctorAppointment {
  id?: string
  appointment_id: string
  patient_id?: string
  staff_id?: string
  host_staff_id?: string
  slot_id?: string | null
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
  reason?: string | null
  created_at?: string
  updated_at?: string
}

export interface DoctorAppointmentsParams {
  page?: number
  limit?: number
  status?: string
  date?: string
}

export interface BookAppointmentRequest {
  patientId: string
  appointmentDate: string
  startTime: string
  endTime?: string
  slotId?: string
  durationMins: number
  mode: "video" | "offline" | "audio"
  callType: "consultation" | "follow_up" | "history_call"
  reason?: string
  meetingLink?: string
  address?: string
}

export interface DoctorApiResponse<T> {
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

export interface RescheduleAppointmentRequest {
  newDate: string
  newStartTime: string
  newEndTime: string
  slotId?: string
  reason?: string
}
