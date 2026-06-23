import { apiClient } from "@/lib/api-client"
import { MealType } from "@/types/diet-template"

export interface UpdateClinicalMealRequest {
  meal_type?: MealType
  meal_time?: string
  food_items: Array<
    | { name: string; quantity: string }
    | Array<{ name: string; quantity: string }>
  >
  calories?: number
  protein_g?: number
  carbs_g?: number
  fats_g?: number
  notes?: string
  reason?: string
}

export interface AddClinicalMealRequest {
  day_number: number
  meal_type: string
  day_of_week?: string
  start_time: string
  reminder_enabled?: boolean
  is_required?: boolean
  sort_order?: number
  food_items: Array<
    | { name: string; quantity: string }
    | Array<{ name: string; quantity: string }>
  >
  condition_tags?: string[]
  is_veg?: boolean
  notes?: string
}

export interface PhaseConfig {
  url?: string;
  pdf_url?: string;
  is_unlocked?: boolean;
  status?: 'locked' | 'unlocked';
  name?: string;

}

export interface ClinicalGroceryPhase {
  phase_number: number
  phase_name?: string | null
  start_day?: number | null
  end_day?: number | null
  duration_days?: number | null
  guidelines?: string;
  instructions?: string;
  grocery_list_config?: PhaseConfig;
  diet_pdf_config?: PhaseConfig;
  // Legacy fields for backward compatibility during transition
  pdf_url?: string | null;
  status?: "unlocked" | "locked" | string;
}

export interface UpdatePhaseConfigsRequest {
  grocery_list_config?: {
    url?: string;
    is_unlocked?: boolean;
    status?: 'locked' | 'unlocked';
    name?: string;
  };
  diet_pdf_config?: {
    url?: string;
    is_unlocked?: boolean;
    status?: 'locked' | 'unlocked';
    name?: string;
  };
  grocery_list_status?: 'locked' | 'unlocked';
  guidelines?: string;
  instructions?: string;
}

export interface StartClinicalDietPlanRequest {
  journey_start_date: string
}

export interface UpdateClinicalDayDetailRequest {
  tips: string
}

export async function updateClinicalDietPlanMeal(
  mealId: string,
  payload: UpdateClinicalMealRequest
): Promise<any> {
  const { data } = await apiClient.put(
    `/clinical/diet-plans/meals/${mealId.trim().replace(/'+$/, '')}`,
    payload
  )
  return data
}

export async function deleteClinicalDietPlanMeal(
  mealId: string
): Promise<any> {
  const { data } = await apiClient.delete(
    `/clinical/diet-plans/meals/${mealId.trim().replace(/'+$/, '')}`
  )
  return data
}

export async function addClinicalDietPlanMeal(
  dietPlanId: string,
  payload: AddClinicalMealRequest
): Promise<any> {
  const { data } = await apiClient.post(
    `/clinical/diet-plans/${dietPlanId}/meals`,
    payload
  )
  return data
}

export async function getClinicalGroceryList(
  dietPlanId: string
): Promise<ClinicalGroceryPhase[]> {
  const { data } = await apiClient.get<ClinicalGroceryPhase[]>(
    `/clinical/diet-plans/${dietPlanId}/grocery-list`
  )
  return data
}

/** New consolidated PDF retrieval endpoint */
export async function getAllDietPlanPdfs(
  dietPlanId: string
): Promise<{
  diet_plan_id: string;
  diet_plan_title: string;
  patient_id: string;
  phases: ClinicalGroceryPhase[];
}> {
  const { data } = await apiClient.get<any>(
    `/clinical/diet-plans/${dietPlanId}/all-pdfs`
  )
  return data
}

export async function updateClinicalGroceryList(
  dietPlanId: string,
  payload: any
): Promise<any> {
  // Determine endpoint based on which config is present in payload
  const endpoint = payload.diet_pdf_config 
    ? `/clinical/diet-plans/${dietPlanId}/diet-pdf` 
    : `/clinical/diet-plans/${dietPlanId}/grocery-list`;
    
  const { data } = await apiClient.put(endpoint, payload);
  return data;
}

/** New consolidated endpoint: updates both grocery_list_config and diet_pdf_config for a phase on a diet TEMPLATE */
export async function updateTemplatePhaseConfigs(
  templateId: string,
  phaseNumber: number,
  payload: UpdatePhaseConfigsRequest
): Promise<any> {
  const { data } = await apiClient.put(
    `/diet-template/${templateId}/phases/${phaseNumber}/configs`,
    payload
  )
  return data
}

export async function startClinicalDietPlanJourney(
  dietPlanId: string,
  payload: StartClinicalDietPlanRequest
): Promise<any> {
  const { data } = await apiClient.put(
    `/clinical/diet-plans/${dietPlanId}/start`,
    payload
  )
  return data
}

export async function updateClinicalDayDetail(
  dayDetailId: string,
  payload: UpdateClinicalDayDetailRequest
): Promise<any> {
  const { data } = await apiClient.put(
    `/clinical/diet-plans/day-details/${dayDetailId}`,
    payload
  )
  return data
}

export interface SuggestedDocument {
  id: string
  title: string
  url: string
  document_type: string
  category: string
  is_active: boolean
  is_assigned: boolean
}

export async function getSuggestedDocuments(dietPlanId: string): Promise<SuggestedDocument[]> {
  const { data } = await apiClient.get<SuggestedDocument[]>(`/clinical/diet-plans/${dietPlanId}/suggested-documents`)
  return data
}

export async function toggleDocumentAssignment(dietPlanId: string, documentId: string): Promise<any> {
  const { data } = await apiClient.post(`/clinical/diet-plans/${dietPlanId}/toggle-document`, { document_id: documentId })
  return data
}

export async function generatePhasePdf(
  patientId: string,
  dietPlanId: string,
  phaseNumber: number
): Promise<{
  success: boolean;
  phase_number: number;
  pdf_url: string;
}> {
  const { data } = await apiClient.post(
    `/patients/${patientId}/diet-plans/${dietPlanId}/phases/${phaseNumber}/generate-pdf`
  )
  return data
}
