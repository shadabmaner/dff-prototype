export type MealType = 
  | "early_morning"
  | "breakfast"
  | "mid_morning"
  | "lunch"
  | "evening_snack"
  | "dinner"
  | "bedtime"

export interface MealLog {
  id: string
  patient_id: string
  meal_type: MealType
  description: string
  food_items: string | null
  total_calories: number
  protein_g: number | null
  carbs_g: number | null
  fats_g: number | null
  fiber_g: number | null
  photo_url: string | null
  logged_date: string
  logged_time: string | null
  is_compliant: boolean
  notes: string
  created_at: string
  updated_at: string
  diet_plan_meal_id: string
  first_name: string
  last_name: string
  patient_name: string
  patient_email: string | null
}

export interface MealLogsHistoryParams {
  patientId: string
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

export interface MealLogsHistoryResponse {
  success: boolean
  statusCode: number
  data: MealLog[]
  message: string
}
