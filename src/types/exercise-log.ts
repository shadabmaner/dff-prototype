export interface ExerciseLog {
  id: string
  patient_id: string
  exercise_name: string
  exercise_type: string
  duration_mins: number
  calories_burned: number
  intensity: string | null
  sets: number | null
  reps: number | null
  distance_km: number | null
  notes: string
  logged_date: string
  logged_time: string | null
  is_compliant: boolean
  created_at: string
  updated_at: string
  exercise_plan_id: string | null
  first_name: string
  last_name: string
  patient_name: string
  patient_email: string | null
}

export interface ExerciseLogsHistoryParams {
  patientId: string
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

export interface ExerciseLogsHistoryResponse {
  success: boolean
  statusCode: number
  data: ExerciseLog[]
  message: string
}
