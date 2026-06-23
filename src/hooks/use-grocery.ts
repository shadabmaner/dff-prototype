"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getTemplatePhases,
  updatePhaseGrocery,
  updatePhaseConfigs,
  uploadGroceryPdf,
} from "@/lib/api/grocery-client"
import type { UpdatePhaseConfigsRequest } from "@/lib/api/clinical-diet-plan-client"
import { UpdateGroceryRequest } from "@/types/grocery"

export function useTemplatePhases(templateId: string | null) {
  return useQuery<any, Error>({
    queryKey: ["template-phases", templateId],
    queryFn: () => {
      if (!templateId) throw new Error("Template ID is required")
      return getTemplatePhases(templateId)
    },
    enabled: Boolean(templateId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdatePhaseGrocery() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { templateId: string; phaseNumber: number; data: UpdateGroceryRequest }
  >({
    mutationFn: ({ templateId, phaseNumber, data }) =>
      updatePhaseGrocery(templateId, phaseNumber, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["template-phases", variables.templateId],
      })
    },
  })
}

export function useUploadGroceryPdf() {
  return useMutation<string, Error, File>({
    mutationFn: (file: File) => uploadGroceryPdf(file),
  })
}

/** Hook for updating a template phase's grocery and/or diet PDF configs via the new consolidated endpoint */
export function useUpdatePhaseConfigs() {
  const queryClient = useQueryClient()

  return useMutation<
    any,
    Error,
    { templateId: string; phaseNumber: number; data: UpdatePhaseConfigsRequest }
  >({
    mutationFn: ({ templateId, phaseNumber, data }) =>
      updatePhaseConfigs(templateId, phaseNumber, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["template-phases", variables.templateId],
      })
    },
  })
}
