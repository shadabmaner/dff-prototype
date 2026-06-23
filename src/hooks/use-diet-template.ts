"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createDietTemplate,
  getDietTemplates,
  getDietTemplateById,
  updateDietTemplate,
  deleteDietTemplate,
  addDayDetail,
  updateDayDetail,
  deleteDayDetail,
  addMeal,
  updateMeal,
  deleteMeal,
  assignTemplateToPatient,
  importDietTemplate,
  addPhase,
  updatePhase,
  updateMealV1,
  updateDayDetailV1,
  deleteMealV1,
  addPhaseDay,
  deepDeletePhase
} from "@/lib/api/diet-template-client"
import { updateClinicalDayDetail } from "@/lib/api/clinical-diet-plan-client"
import type {
  CreateDietTemplateRequest,
  CreateDayDetailRequest,
  CreateMealRequest,
  AssignTemplateRequest,
  DietTemplate,
  DietTemplateDetail,
  DietTemplateMeal,
  DayDetail,
  AssignTemplateResponse,
  Phase
} from "@/types/diet-template"

export function useDietTemplates() {
  return useQuery<any, Error>({
    queryKey: ["diet-templates"],
    queryFn: getDietTemplates,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDietTemplateById(templateId: string | null) {
  return useQuery<any, Error>({
    queryKey: ["diet-template", templateId],
    queryFn: () => {
      if (!templateId) throw new Error("Template ID is required")
      return getDietTemplateById(templateId)
    },
    enabled: Boolean(templateId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateDietTemplate() {
  const queryClient = useQueryClient()

  return useMutation<DietTemplate, Error, CreateDietTemplateRequest>({
    mutationFn: createDietTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-templates"] })
    },
  })
}

export function useUpdateDietTemplate() {
  const queryClient = useQueryClient()

  return useMutation<
    DietTemplate,
    Error,
    { templateId: string; data: Partial<CreateDietTemplateRequest> }
  >({
    mutationFn: ({ templateId, data }) => updateDietTemplate(templateId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-templates"] })
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useDeleteDietTemplate() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteDietTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-templates"] })
    },
  })
}

export function useAddDayDetail() {
  const queryClient = useQueryClient()

  return useMutation<
    DayDetail,
    Error,
    { templateId: string; data: CreateDayDetailRequest }
  >({
    mutationFn: ({ templateId, data }) => addDayDetail(templateId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useUpdateDayDetail() {
  const queryClient = useQueryClient()

  return useMutation<
    DayDetail,
    Error,
    { templateId: string; dayDetailId: string; data: Partial<CreateDayDetailRequest> }
  >({
    mutationFn: ({ templateId, dayDetailId, data }) =>
      updateDayDetail(templateId, dayDetailId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useDeleteMealV1() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { mealId: string; templateId: string }>({
    mutationFn: ({ mealId }) => deleteMealV1(mealId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useUpdateDayDetailV1() {
  const queryClient = useQueryClient()

  return useMutation<
    DayDetail,
    Error,
    { detailId: string; data: Partial<CreateDayDetailRequest>; templateId?: string }
  >({
    mutationFn: ({ detailId, data }) => updateDayDetailV1(detailId, data),
    onSuccess: (_, variables) => {
      if (variables.templateId) {
        queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
      }
    },
  })
}

export function useDeleteDayDetail() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { templateId: string; dayDetailId: string }>({
    mutationFn: ({ templateId, dayDetailId }) => deleteDayDetail(templateId, dayDetailId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useAddMeal() {
  const queryClient = useQueryClient()

  return useMutation<
    DietTemplateMeal,
    Error,
    { templateId: string; data: CreateMealRequest }
  >({
    mutationFn: ({ templateId, data }) => addMeal(templateId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useUpdateMeal() {
  const queryClient = useQueryClient()

  return useMutation<
    DietTemplateMeal,
    Error,
    { templateId: string; mealId: string; data: Partial<CreateMealRequest> }
  >({
    mutationFn: ({ templateId, mealId, data }) => updateMeal(templateId, mealId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useUpdateMealV1() {
  const queryClient = useQueryClient()

  return useMutation<
    DietTemplateMeal,
    Error,
    { mealId: string; data: Partial<CreateMealRequest>; templateId?: string }
  >({
    mutationFn: ({ mealId, data }) => updateMealV1(mealId, data),
    onSuccess: (_, variables) => {
      if (variables.templateId) {
        queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
      }
    },
  })
}

export function useDeleteMeal() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { templateId: string; mealId: string }>({
    mutationFn: ({ templateId, mealId }) => deleteMeal(templateId, mealId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useAssignTemplate() {
  const queryClient = useQueryClient()

  return useMutation<
    AssignTemplateResponse,
    Error,
    { templateId: string; data: AssignTemplateRequest }
  >({
    mutationFn: ({ templateId, data }) => assignTemplateToPatient(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-templates"] })
    },
  })
}

export function useUpdateClinicalDayDetail() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { dayDetailId: string; data: { tips: string } }
  >({
    mutationFn: ({ dayDetailId, data }) => updateClinicalDayDetail(dayDetailId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-diet-plan"] })
      queryClient.invalidateQueries({ queryKey: ["patient-diet-plan"] })
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-details"] })
    },
  })
}

export function useImportDietTemplate() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { file: File; templateId: string; clearExisting: boolean; phaseId?: string }
  >({
    mutationFn: ({ file, templateId, clearExisting, phaseId }) =>
      importDietTemplate(file, templateId, clearExisting, phaseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["diet-templates"] })
    },
  })
}

export function useAddPhase() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { templateId: string; data: Omit<Phase, 'id' | 'created_at' | 'updated_at'> }
  >({
    mutationFn: ({ templateId, data }) => addPhase(templateId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useUpdatePhase() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { templateId: string; phaseId: string; data: Partial<Phase> }
  >({
    mutationFn: ({ phaseId, data }) => updatePhase(phaseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useAddPhaseDay() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { templateId: string; phaseId: string }
  >({
    mutationFn: ({ templateId, phaseId }) => addPhaseDay(templateId, phaseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}

export function useDeepDeletePhase() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { templateId: string; phaseId: string }>({
    mutationFn: ({ phaseId }) => deepDeletePhase(phaseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diet-template", variables.templateId] })
    },
  })
}
