import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateClinicalDietPlanMeal,
  deleteClinicalDietPlanMeal,
  addClinicalDietPlanMeal,
  getClinicalGroceryList,
  getAllDietPlanPdfs,
  updateClinicalGroceryList,
  updateTemplatePhaseConfigs,
  startClinicalDietPlanJourney,
  type UpdateClinicalMealRequest,
  type AddClinicalMealRequest,
  type UpdatePhaseConfigsRequest,
  type StartClinicalDietPlanRequest,
  getSuggestedDocuments,
  toggleDocumentAssignment,
  generatePhasePdf,
  type SuggestedDocument,
} from "@/lib/api/clinical-diet-plan-client"

export function useGeneratePhasePdf() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { patientId: string; dietPlanId: string; phaseNumber: number }
  >({
    mutationFn: ({ patientId, dietPlanId, phaseNumber }) =>
      generatePhasePdf(patientId, dietPlanId, phaseNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["clinical-grocery-list", variables.dietPlanId],
      })
    },
  })
}

export function useAddClinicalMeal() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { dietPlanId: string; data: AddClinicalMealRequest }
  >({
    mutationFn: ({ dietPlanId, data }) => addClinicalDietPlanMeal(dietPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-diet-plan"] })
      queryClient.invalidateQueries({ queryKey: ["patient-diet-plan"] })
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-details"] })
    },
  })
}

export function useUpdateClinicalMeal() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { mealId: string; data: UpdateClinicalMealRequest }
  >({
    mutationFn: ({ mealId, data }) => updateClinicalDietPlanMeal(mealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-template"] })
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-details"] })
      queryClient.invalidateQueries({ queryKey: ["patient-diet-plan"] })
    },
  })
}

export function useDeleteClinicalMeal() {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { mealId: string }>({
    mutationFn: ({ mealId }) => deleteClinicalDietPlanMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-template"] })
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-details"] })
      queryClient.invalidateQueries({ queryKey: ["patient-diet-plan"] })
    },
  })
}

export function useStartClinicalDietPlan() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { dietPlanId: string; data: StartClinicalDietPlanRequest }
  >({
    mutationFn: ({ dietPlanId, data }) =>
      startClinicalDietPlanJourney(dietPlanId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["clinical-grocery-list", variables.dietPlanId],
      })
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-details"] })
    },
  })
}

export function useClinicalGroceryList(dietPlanId: string | null | undefined) {
  return useQuery<any, Error>({
    queryKey: ["clinical-grocery-list", dietPlanId],
    queryFn: () => {
      if (!dietPlanId) throw new Error("Diet plan ID is required")
      return getAllDietPlanPdfs(dietPlanId)
    },
    enabled: Boolean(dietPlanId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateClinicalGroceryList() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { dietPlanId: string; data: any }
  >({
    mutationFn: ({ dietPlanId, data }) =>
      updateClinicalGroceryList(dietPlanId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["clinical-grocery-list", variables.dietPlanId],
      })
    },
  })
}

/** Hook for updating a diet TEMPLATE phase's grocery/diet PDF configs via the new consolidated endpoint */
export function useUpdateTemplatePhaseConfigs() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { templateId: string; phaseNumber: number; data: UpdatePhaseConfigsRequest }
  >({
    mutationFn: ({ templateId, phaseNumber, data }) =>
      updateTemplatePhaseConfigs(templateId, phaseNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-grocery-list"] })
      queryClient.invalidateQueries({ queryKey: ["diet-template"] })
    },
  })
}

export function useSuggestedDocuments(dietPlanId: string | null | undefined, options?: { enabled?: boolean }) {
  return useQuery<SuggestedDocument[], Error>({
    queryKey: ["suggested-documents", dietPlanId],
    queryFn: () => {
      if (!dietPlanId) throw new Error("Diet plan ID is required")
      return getSuggestedDocuments(dietPlanId)
    },
    enabled: options?.enabled !== undefined ? options.enabled && Boolean(dietPlanId) : Boolean(dietPlanId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useToggleDocumentAssignment() {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { dietPlanId: string; documentId: string }>({
    mutationFn: ({ dietPlanId, documentId }) =>
      toggleDocumentAssignment(dietPlanId, documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["suggested-documents", variables.dietPlanId],
      })
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-details"] })
    },
  })
}
