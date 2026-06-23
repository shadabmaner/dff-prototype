export type MealType =
  | "EARLY_MORNING"
  | "BREAKFAST"
  | "MID_MORNING"
  | "LUNCH"
  | "EVENING_SNACK"
  | "DINNER"
  | "SNACK";

export interface FoodItem {
  name: string
  quantity: string
}

export type FoodItemOrChoice = FoodItem | FoodItem[]

export interface DietTemplateMeal {
  id: string
  template_id: string
  day_number: number
  meal_type: MealType
  meal_time: string
  food_items: FoodItemOrChoice[]
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fats_g: number | null
  notes: string | null
  reason: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface DayDetail {
  id: string
  template_id: string
  day_number: number
  tips: string | null
  created_at: string
  updated_at: string
}

export interface DietTemplate {
  id: string
  title: string
  description: string | null
  total_days: number
  target_calories_min: number | null
  target_calories_max: number | null
  notes: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface DietTemplateDetail extends DietTemplate {
  meals: DietTemplateMeal[]
  day_details: DayDetail[]
  phases?: Phase[]
  dayWisePlan?: any[]
}

export interface PhaseConfig {
  url?: string;
  pdf_url?: string;
  name?: string;
  is_unlocked?: boolean;
  status?: 'locked' | 'unlocked';
}

export interface Phase {
  phase_number: number
  phase_name: string
  start_day: number
  end_day: number
  guidelines?: string;
  instructions?: string;
  grocery_list_config?: PhaseConfig;
  diet_pdf_config?: PhaseConfig;
}

export interface CreateDietTemplateRequest {
  title: string
  description?: string
  total_days: number
  target_calories_min?: number
  target_calories_max?: number
  notes?: string
  phases?: Phase[]
}

export interface CreateDayDetailRequest {
  day_number: number
  tips: string
}

export interface CreateMealRequest {
  day_number: number
  meal_type: MealType
  meal_time: string
  food_items: FoodItemOrChoice[]
  calories?: number
  protein_g?: number
  carbs_g?: number
  fats_g?: number
  notes?: string
  reason?: string
}

export interface AssignTemplateRequest {
  patient_id: string
  title: string
  start_date: string
  modifications_notes?: string
}

export interface AssignTemplateResponse {
  id: string
  patient_id: string
  template_id: string
  title: string
  start_date: string
  end_date: string
  status: string
  modifications_notes: string | null
  created_at: string
}

export interface ApiResponse<T> {
  success?: boolean
  statusCode?: number
  data?: T
  message?: string
}
