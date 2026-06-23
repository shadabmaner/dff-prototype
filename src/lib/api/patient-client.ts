import { apiClient } from "@/lib/api-client"

export interface PatientClinicalDetails {
  success: boolean
  statusCode: number
  data: {
    patient: {
      id: string
      first_name: string
      last_name: string
      email: string | null
      phone: string
      date_of_birth: string
      gender: string
      height_cm: number | null
      weight_kg: number | null
      blood_group: string | null
      medical_conditions: string | null
      allergies: string | null
      food_allergies: string | null
      current_medications: string | null
      dietary_preferences: string | null
      lifestyle: string | null
      occupation: string | null
      emergency_contact_name: string | null
      emergency_contact_phone: string | null
      address_line1: string | null
      address_line2: string | null
      city: string | null
      state: string | null
      pincode: string | null
      country: string | null
    }
    enrollment: {
      id: string
      program_id: string
      status: string
      enrolled_at: string | null
      starts_at: string | null
      ends_at: string | null
      assigned_staff: {
        doctor: {
          id: string
          name: string
          phone: string
        } | null
        nutritionist: {
          id: string
          name: string
          phone: string
        } | null
        fitness_coach: {
          id: string
          name: string
          phone: string
        } | null
        physio: {
          id: string
          name: string
          phone: string
        } | null
      }
    }
    active_diet_plan: {
      id: string
      patient_id: string
      created_by: string
      approved_by: string | null
      enrollment_id: string | null
      title: string
      description: string | null
      target_calories: number | null
      target_protein_g: number | null
      target_carbs_g: number | null
      target_fat_g: number | null
      target_fiber_g: number | null
      status: string
      start_date: string
      end_date: string
      tips: string | null
      rejection_reason: string | null
      created_at: string
      updated_at: string
      attachments: any | null
      template_id: string
      modifications_notes: string | null
      meals: any[]
      day_details: any[]
    } | null
    recent_meals: any[]
    latest_weight?: WeightLog | null
    assessment_submissions?: AssessmentSubmission[]
    consultations?: Appointment[]
    history_calls?: Appointment[]
    current_appointments?: any[]
    upcoming_appointments?: any[]
    completed_appointments?: any[]
    missing_appointments?: any[]
    call_logs?: any[]
    recent_appointments?: any
    sales_lead?: SalesLead | null
    body_measurement_goals?: any[]
    latest_body_measurements?: BodyMeasurement | null
  }
}

export interface AssessmentSubmission {
  id: string
  speciality_name: string
  created_at: string
  questions_and_answers: any[]
  raw_responses_json: {
    data: {
      form_id: string
      speciality_id: string
      questions_and_ans: Array<{
        ans: string | string[]
        type: string
        ans_id: string
        question: string
        questions_id: string
      }>
    }
  }
}

export interface WeightLog {
  id: string
  patient_id: string
  weight_kg: number
  bmi: number | null
  bmi_category: string | null
  logged_date: string
  notes: string | null
  source: string
  created_at: string
  updated_at: string
}

export interface BodyMeasurement {
  id: string;
  patient_id: string;
  chest_cm: number | null;
  arm_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  thighs_cm: number | null;
  calf_cm: number | null;
  body_fat_percentage: number | null;
  muscle_mass_percentage: number | null;
  logged_date: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
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
  staff_first_name: string
  staff_last_name: string
  staff_type: string
  staff_phone: string
  staff_email: string
}

export interface SalesLead {
  id: string
  name: string
  phone: string
  email: string | null
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
  specialty_id: string | null
  program: string | null
  mode: string | null
  language_code: string | null
  assessment_status: string
  assessment_payment_date: string | null
  assessment_completed_at: string | null
  selected_plan_id: string | null
  payment_reference: string | null
  next_follow_up_date: string | null
  user_id: string
}

export interface UserJourneyResponse {
  patient_id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  lead: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    source: string | null;
    status: string;
    created_at: string;
    converted_at: string | null;
  } | null;
  assessment_payment: {
    id: string;
    amount: number;
    currency: string;
    payment_method: string | null;
    payment_type: string | null;
    paid_at: string;
    razorpay_payment_id: string | null;
  } | null;
  assessment_submission: {
    id: string;
    speciality_id: string;
    form_id: string;
    patient_id: string;
    submitted_at: string;
  } | null;
  history_call: {
    appointment_id: string;
    call_type: string;
    status: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_mins: number;
    mode: string;
    notes: string | null;
    meeting_link: string | null;
    host_staff: {
      id: string;
      first_name: string;
      last_name: string;
      staff_type: string;
    } | null;
    participants: Array<{
      staff_id: string;
      role: string;
      is_host: boolean;
      first_name: string;
      last_name: string;
    }>;
    history_call_completed_at: string | null;
  } | null;
  enrollment: {
    enrollment_id: string;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    enrolled_at: string | null;
    program: {
      id: string;
      name: string;
      description: string | null;
      category: string | null;
      duration_days: number | null;
      is_active: boolean;
    } | null;
    plan: {
      id: string;
      name: string;
      description: string | null;
      code: string | null;
      plan_type: string | null;
      is_default: boolean;
    } | null;
    assigned_staff: boolean;
    assigned_nutritionist_id: string | null;
  } | null;
}

export interface PatientRoleBasedDetails {
  success: boolean
  statusCode: number
  data: {
    patient: {
      id: string
      first_name: string
      last_name: string
      email: string | null
      phone: string
      date_of_birth: string
      gender: string
      height_cm: number | null
      weight_kg: number | null
      blood_group: string | null
      medical_conditions: string | null
      allergies: string | null
      food_allergies: string | null
      current_medications: string | null
      dietary_preferences: string | null
      lifestyle: string | null
      occupation: string | null
      emergency_contact_name: string | null
      emergency_contact_phone: string | null
      address_line1: string | null
      address_line2: string | null
      city: string | null
      state: string | null
      pincode: string | null
      country: string | null
    }
    enrollment: {
      id: string
      program_id: string
      status: string
      enrolled_at: string | null
      starts_at: string | null
      ends_at: string | null
      assigned_staff: {
        doctor: {
          id: string
          name: string
          phone: string
        } | null
        nutritionist: {
          id: string
          name: string
          phone: string
        } | null
        fitness_coach: {
          id: string
          name: string
          phone: string
        } | null
        physio: {
          id: string
          name: string
          phone: string
        } | null
      }
    } | null
    active_diet_plan: any | null
    latest_weight: WeightLog | null
    recent_meals: any[]
    assessment_submissions: any[]
    history_calls: Appointment[]
    consultations: Appointment[]
    sales_lead: SalesLead | null
    call_logs: any[]
  }
}

export async function getPatientClinicalDetails(
  patientId: string
): Promise<PatientClinicalDetails> {
  const { data } = await apiClient.get<any>(
    `/clinical/patients/${patientId}`
  )
  return data
}

export async function getPatientRoleBasedDetails(
  patientId: string
): Promise<any> {
  const { data } = await apiClient.get<any>(
    `/clinical/patients/${patientId}/role-based`
  )
  return data
}

export async function getPatientDietPlan(
  patientId: string
): Promise<any> {
  const { data } = await apiClient.get<any>(
    `/clinical/patients/${patientId}/diet-plan`
  )
  return data
}

export async function getPatientCollectionProgress(
  patientId: string,
  params?: { page?: number; limit?: number; start_date?: string; end_date?: string }
): Promise<any> {
  const { data } = await apiClient.get<any>(
    `/patients/${patientId}/collection-progress`,
    { params }
  )
  return data
}

export async function getPatientMindsetActivityLogs(
  patientId: string,
  params?: { page?: number; limit?: number; start_date?: string; end_date?: string }
): Promise<any> {
  const { data } = await apiClient.get<any>(
    `/clinical/patients/${patientId}/mindset-activity-logs`,
    { params }
  )
  return data
}

export async function getUserJourney(
  patientId: string
): Promise<UserJourneyResponse> {
  const { data } = await apiClient.get<UserJourneyResponse>(
    `/user-journey/${patientId}`
  )
  return data
}
