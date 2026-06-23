import { apiClient } from "@/lib/api-client"
import type {
  DietTemplate,
  DietTemplateDetail,
  DietTemplateMeal,
  DayDetail,
  CreateDietTemplateRequest,
  CreateDayDetailRequest,
  CreateMealRequest,
  AssignTemplateRequest,
  AssignTemplateResponse,
  ApiResponse,
  Phase
} from "@/types/diet-template"

export async function createDietTemplate(
  payload: CreateDietTemplateRequest
): Promise<DietTemplate> {
  const { data } = await apiClient.post<DietTemplate>("/diet-templates", payload)
  return data
}

export async function getDietTemplates(): Promise<DietTemplate[]> {
  const { data } = await apiClient.get<DietTemplate[]>("/diet-templates")
  return data
}

export async function getDietTemplateById(templateId: string): Promise<DietTemplateDetail> {
  const { data } = await apiClient.get<DietTemplateDetail>(`/diet-templates/${templateId}`)
  return data
}

export async function updateDietTemplate(
  templateId: string,
  payload: Partial<CreateDietTemplateRequest>
): Promise<DietTemplate> {
  const { data } = await apiClient.patch<DietTemplate>(`/diet-templates/${templateId}`, payload)
  return data
}

export async function deleteDietTemplate(templateId: string): Promise<void> {
  await apiClient.delete(`/diet-templates/${templateId}`)
}

export async function deepDeletePhase(phaseId: string): Promise<void> {
  await apiClient.delete(`/diet-templates/phases/${phaseId}`)
}

export async function updatePhase(
  phaseId: string,
  payload: Partial<Phase>
): Promise<Phase> {
  const { data } = await apiClient.put<Phase>(
    `/diet-templates/phases/${phaseId}`,
    payload
  )
  return data
}

export async function addDayDetail(
  templateId: string,
  payload: CreateDayDetailRequest
): Promise<DayDetail> {
  const { data } = await apiClient.post<DayDetail>(
    `/diet-templates/${templateId}/day-details`,
    payload
  )
  return data
}

export async function updateDayDetail(
  templateId: string,
  dayDetailId: string,
  payload: Partial<CreateDayDetailRequest>
): Promise<DayDetail> {
  const { data } = await apiClient.patch<DayDetail>(
    `/diet-templates/${templateId}/day-details/${dayDetailId}`,
    payload
  )
  return data
}

export async function deleteDayDetail(templateId: string, dayDetailId: string): Promise<void> {
  await apiClient.delete(`/diet-templates/${templateId}/day-details/${dayDetailId}`)
}

export async function addMeal(
  templateId: string,
  payload: CreateMealRequest
): Promise<DietTemplateMeal> {
  const { data } = await apiClient.post<DietTemplateMeal>(
    `/diet-templates/${templateId}/meals`,
    payload
  )
  return data
}

export async function updateMeal(
  templateId: string,
  mealId: string,
  payload: Partial<CreateMealRequest>
): Promise<DietTemplateMeal> {
  const { data } = await apiClient.patch<DietTemplateMeal>(
    `/diet-templates/${templateId}/meals/${mealId.trim().replace(/'+$/, '')}`,
    payload
  )
  return data
}

export async function deleteMeal(templateId: string, mealId: string): Promise<void> {
  await apiClient.delete(`/diet-templates/${templateId}/meals/${mealId.trim().replace(/'+$/, '')}`)
}

export async function updateMealV1(
  mealId: string,
  payload: Partial<CreateMealRequest>
): Promise<DietTemplateMeal> {
  const { data } = await apiClient.put<DietTemplateMeal>(
    `/diet-templates/meals/${mealId.trim().replace(/'+$/, '')}`,
    payload
  )
  return data
}
export async function deleteMealV1(mealId: string): Promise<void> {
  await apiClient.delete(`/diet-templates/meals/${mealId.trim().replace(/'+$/, '')}`)
}

export async function updateDayDetailV1(
  detailId: string,
  payload: Partial<CreateDayDetailRequest>
): Promise<DayDetail> {
  const { data } = await apiClient.put<DayDetail>(
    `/diet-templates/day-details/${detailId}`,
    payload
  )
  return data
}

export async function assignTemplateToPatient(
  templateId: string,
  payload: AssignTemplateRequest
): Promise<AssignTemplateResponse> {
  const { data } = await apiClient.post<AssignTemplateResponse>(
    `/diet-templates/${templateId}/assign`,
    payload
  )
  return data
}

export async function addPhase(
  templateId: string,
  payload: Omit<Phase, 'id' | 'created_at' | 'updated_at'>
): Promise<Phase> {
  const { data } = await apiClient.post<Phase>(
    `/diet-templates/${templateId}/phases`,
    payload
  )
  return data
}

export async function importDietTemplate(
  file: File,
  templateId: string,
  clearExisting: boolean = false,
  phaseId?: string
): Promise<ApiResponse<any>> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("template_id", templateId)
  formData.append("clear_existing", clearExisting.toString())
  if (phaseId) {
    formData.append("phase_id", phaseId)
  }

  const { data } = await apiClient.post<ApiResponse<any>>("/diet-templates/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return data
}

export async function addPhaseDay(templateId: string, phaseId: string): Promise<any> {
  const { data } = await apiClient.post(
    `/diet-templates/${templateId}/phases/${phaseId}/add-day`
  )
  return data
}
