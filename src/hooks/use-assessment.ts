import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuestion,
  addQuestionOption,
  createForm,
  linkQuestionsToForm,
  updateFormQuestion,
  activateForm,
  getQuestionsBySpeciality,
  getFormsBySpeciality,
  getFormById,
  deleteQuestion,
  deleteQuestionOption,
  deleteForm,
  updateQuestion,
  updateForm,
  getActiveForm,
  submitAssessment,
  getSubmission,
  getSpecialities,
  createSection,
  updateSection,
  deleteSection,
  getSections,
} from "@/lib/api/assessment-client";
import type {
  CreateQuestionRequest,
  CreateOptionRequest,
  CreateFormRequest,
  LinkQuestionsRequest,
  UpdateFormQuestionRequest,
  SubmitAssessmentRequest,
  AssessmentSection,
  CreateSectionRequest,
} from "@/types/assessment";

// ============================================
// ADMIN HOOKS
// ============================================

/**
 * Hook to create a new question
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionRequest) => createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-questions"] });
    },
  });
}

/**
 * Hook to add an option to a question
 */
export function useAddQuestionOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: CreateOptionRequest }) =>
      addQuestionOption(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-questions"] });
    },
  });
}

/**
 * Hook to create a new form
 */
export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormRequest) => createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-forms"] });
    },
  });
}

/**
 * Hook to link questions to a form
 */
export function useLinkQuestionsToForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: LinkQuestionsRequest }) =>
      linkQuestionsToForm(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-forms"] });
    },
  });
}

/**
 * Hook to update form question configuration
 */
export function useUpdateFormQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      questionId,
      data,
    }: {
      formId: string;
      questionId: string;
      data: UpdateFormQuestionRequest;
    }) => updateFormQuestion(formId, questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-forms"] });
    },
  });
}

/**
 * Hook to activate a form
 */
export function useActivateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formId: string) => activateForm(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-forms"] });
    },
  });
}

/**
 * Hook to get questions by speciality
 */
export function useQuestionsBySpeciality(specialityId: string | null) {
  return useQuery({
    queryKey: ["assessment-questions", specialityId],
    queryFn: () => (specialityId ? getQuestionsBySpeciality(specialityId) : Promise.resolve({ data: [] })),
    enabled: !!specialityId,
  });
}

/**
 * Hook to get forms by speciality
 */
export function useFormsBySpeciality(specialityId: string | null) {
  return useQuery({
    queryKey: ["assessment-forms", specialityId],
    queryFn: () => (specialityId ? getFormsBySpeciality(specialityId) : Promise.resolve({ data: [] })),
    enabled: !!specialityId,
  });
}

/**
 * Hook to get a specific form
 */
export function useFormById(formId: string | null) {
  return useQuery({
    queryKey: ["assessment-form", formId],
    queryFn: () => {
      if (!formId) {
        return Promise.resolve({ data: null as any });
      }
      return getFormById(formId);
    },
    enabled: !!formId,
  });
}

/**
 * Hook to delete a question
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-questions"] });
    },
  });
}

/**
 * Hook to delete a question option
 */
export function useDeleteQuestionOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, optionId }: { questionId: string; optionId: string }) =>
      deleteQuestionOption(questionId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-questions"] });
    },
  });
}

/**
 * Hook to delete a form
 */
export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formId: string) => deleteForm(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-forms"] });
    },
  });
}

/**
 * Hook to update a question
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: Partial<CreateQuestionRequest> }) =>
      updateQuestion(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-questions"] });
    },
  });
}

/**
 * Hook to update a form
 */
export function useUpdateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: Partial<CreateFormRequest> }) =>
      updateForm(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-forms"] });
    },
  });
}

/**
 * Hook to get sections for a specific form
 */
export function useSections(formId: string | null) {
  return useQuery({
    queryKey: ["assessment-sections", formId],
    queryFn: () => (formId ? getSections(formId) : Promise.resolve({ data: [] })),
    enabled: !!formId,
  });
}

/**
 * Hook to create a new section
 */
export function useCreateSection(formId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSectionRequest) => createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-sections", formId || null] });
      queryClient.invalidateQueries({ queryKey: ["assessment-form"] });
    },
  });
}

/**
 * Hook to update a section
 */
export function useUpdateSection(formId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      data,
    }: {
      sectionId: string;
      data: Partial<CreateSectionRequest>;
    }) => updateSection(sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-sections", formId || null] });
      queryClient.invalidateQueries({ queryKey: ["assessment-form"] });
    },
  });
}

/**
 * Hook to delete a section
 */
export function useDeleteSection(formId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) => deleteSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-sections", formId || null] });
      queryClient.invalidateQueries({ queryKey: ["assessment-form"] });
    },
  });
}

// ============================================
// PATIENT HOOKS
// ============================================

/**
 * Hook to get active form for a speciality
 */
export function useActiveForm(specialityId: string | null) {
  return useQuery({
    queryKey: ["assessment-active-form", specialityId],
    queryFn: () => {
      if (!specialityId) {
        return Promise.resolve({ data: null as any });
      }
      return getActiveForm(specialityId);
    },
    enabled: !!specialityId,
  });
}

/**
 * Hook to submit assessment
 */
export function useSubmitAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitAssessmentRequest) => submitAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-submissions"] });
    },
  });
}

/**
 * Hook to get submission details
 */
export function useSubmission(submissionId: string | null) {
  return useQuery({
    queryKey: ["assessment-submission", submissionId],
    queryFn: () => {
      if (!submissionId) {
        return Promise.resolve({ data: null as any });
      }
      return getSubmission(submissionId);
    },
    enabled: !!submissionId,
  });
}

// ============================================
// HELPER HOOKS
// ============================================

