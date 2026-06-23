import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  AssessmentQuestion,
  QuestionOption,
  AssessmentForm,
  AssessmentSubmission,
  CreateQuestionRequest,
  CreateOptionRequest,
  CreateFormRequest,
  LinkQuestionsRequest,
  UpdateFormQuestionRequest,
  SubmitAssessmentRequest,
  Speciality,
  AssessmentSection,
  CreateSectionRequest,
} from "@/types/assessment";

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Create a new assessment question
 */
export async function createQuestion(
  data: CreateQuestionRequest
): Promise<ApiResponse<AssessmentQuestion>> {
  const response = await apiClient.post<AssessmentQuestion>(
    "/admin/assessment/questions",
    data
  );
  return { data: response.data };
}

/**
 * Add an option to a question
 */
export async function addQuestionOption(
  questionId: string,
  data: CreateOptionRequest
): Promise<ApiResponse<QuestionOption>> {
  const response = await apiClient.post<QuestionOption>(
    `/admin/assessment/questions/${questionId}/options`,
    data
  );
  return { data: response.data };
}

/**
 * Create a new assessment form
 */
export async function createForm(
  data: CreateFormRequest
): Promise<ApiResponse<AssessmentForm>> {
  const response = await apiClient.post<AssessmentForm>(
    "/admin/assessment/forms",
    data
  );
  return { data: response.data };
}

/**
 * Link questions to a form
 */
export async function linkQuestionsToForm(
  formId: string,
  data: LinkQuestionsRequest
): Promise<ApiResponse<{ message: string; linked_count: number }>> {
  const response = await apiClient.post<{ message: string; linked_count: number }>(
    `/admin/assessment/forms/${formId}/questions`,
    data
  );
  return { data: response.data };
}

/**
 * Update form question configuration
 */
export async function updateFormQuestion(
  formId: string,
  questionId: string,
  data: UpdateFormQuestionRequest
): Promise<ApiResponse<{ message: string; form_id: string; question_id: string }>> {
  const response = await apiClient.patch<{ message: string; form_id: string; question_id: string }>(
    `/admin/assessment/forms/${formId}/questions/${questionId}`,
    data
  );
  return { data: response.data };
}

/**
 * Activate a form
 */
export async function activateForm(
  formId: string
): Promise<ApiResponse<{ message: string; form_id: string }>> {
  const response = await apiClient.patch<{ message: string; form_id: string }>(
    `/admin/assessment/forms/${formId}/activate`
  );
  return { data: response.data };
}

/**
 * Create a new assessment section
 */
export async function createSection(
  data: CreateSectionRequest
): Promise<ApiResponse<AssessmentSection>> {
  const response = await apiClient.post<AssessmentSection>(
    "/admin/assessment/sections",
    data
  );
  return { data: response.data };
}

/**
 * Update an assessment section
 */
export async function updateSection(
  sectionId: string,
  data: Partial<CreateSectionRequest>
): Promise<ApiResponse<AssessmentSection>> {
  const response = await apiClient.patch<AssessmentSection>(
    `/admin/assessment/sections/${sectionId}`,
    data
  );
  return { data: response.data };
}

/**
 * Delete an assessment section
 */
export async function deleteSection(
  sectionId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.delete<{ message: string }>(
    `/admin/assessment/sections/${sectionId}`
  );
  return { data: response.data };
}

/**
 * Get all sections for a specific form
 */
export async function getSections(
  formId: string
): Promise<ApiResponse<AssessmentSection[]>> {
  const response = await apiClient.get<AssessmentSection[]>(
    `/admin/assessment/sections?form_id=${formId}`
  );
  return { data: response.data };
}

/**
 * Get all questions for a speciality
 */
export async function getQuestionsBySpeciality(
  specialityId: string
): Promise<ApiResponse<AssessmentQuestion[]>> {
  const response = await apiClient.get<AssessmentQuestion[]>(
    `/admin/assessment/questions?speciality_id=${specialityId}`
  );
  return { data: response.data };
}

/**
 * Get all forms for a speciality
 */
export async function getFormsBySpeciality(
  specialityId: string
): Promise<ApiResponse<AssessmentForm[]>> {
  const response = await apiClient.get<AssessmentForm[]>(
    `/admin/assessment/forms?speciality_id=${specialityId}`
  );
  return { data: response.data };
}

/**
 * Get a specific form with questions
 */
export async function getFormById(
  formId: string
): Promise<ApiResponse<AssessmentForm>> {
  const response = await apiClient.get<AssessmentForm>(
    `/admin/assessment/forms/${formId}?include_questions=true`
  );
  return { data: response.data };
}

/**
 * Delete a question
 */
export async function deleteQuestion(
  questionId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.delete<{ message: string }>(
    `/admin/assessment/questions/${questionId}`
  );
  return { data: response.data };
}

/**
 * Delete a question option
 */
export async function deleteQuestionOption(
  questionId: string,
  optionId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.delete<{ message: string }>(
    `/admin/assessment/questions/${questionId}/options/${optionId}`
  );
  return { data: response.data };
}

/**
 * Delete a form
 */
export async function deleteForm(
  formId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.delete<{ message: string }>(
    `/admin/assessment/forms/${formId}`
  );
  return { data: response.data };
}

/**
 * Update a question
 */
export async function updateQuestion(
  questionId: string,
  data: Partial<CreateQuestionRequest>
): Promise<ApiResponse<AssessmentQuestion>> {
  const response = await apiClient.patch<AssessmentQuestion>(
    `/admin/assessment/questions/${questionId}`,
    data
  );
  return { data: response.data };
}

/**
 * Update a form
 */
export async function updateForm(
  formId: string,
  data: Partial<CreateFormRequest>
): Promise<ApiResponse<AssessmentForm>> {
  const response = await apiClient.patch<AssessmentForm>(
    `/admin/assessment/forms/${formId}`,
    data
  );
  return { data: response.data };
}

// ============================================
// PATIENT ENDPOINTS
// ============================================

/**
 * Get active assessment form for a speciality
 */
export async function getActiveForm(
  specialityId: string
): Promise<ApiResponse<AssessmentForm>> {
  const response = await apiClient.get<AssessmentForm>(
    `/assessment/speciality/${specialityId}/active-form`
  );
  return { data: response.data };
}

/**
 * Submit assessment
 */
export async function submitAssessment(
  data: SubmitAssessmentRequest
): Promise<ApiResponse<AssessmentSubmission>> {
  const response = await apiClient.post<AssessmentSubmission>(
    "/assessment/submit",
    data
  );
  return { data: response.data };
}

/**
 * Get submission details
 */
export async function getSubmission(
  submissionId: string
): Promise<ApiResponse<AssessmentSubmission>> {
  const response = await apiClient.get<AssessmentSubmission>(
    `/assessment/submissions/${submissionId}`
  );
  return { data: response.data };
}

// ============================================
// HELPER ENDPOINTS
// ============================================

/**
 * Get all specialities
 */
export async function getSpecialities(): Promise<ApiResponse<Speciality[]>> {
  const response = await apiClient.get<Speciality[]>("/specialities");
  return { data: response.data };
}
