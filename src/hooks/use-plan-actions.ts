import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

interface PlanActionResponse {
  success: boolean
  statusCode: number
  data: {
    id: string
    name: string
    code: string
    is_active: boolean
    updated_at: string
  }
  message: string
}

export function useActivatePlan() {
  const queryClient = useQueryClient()

  return useMutation<
    PlanActionResponse["data"],
    Error,
    { programId: string; planId: string }
  >({
    mutationFn: async ({ programId, planId }) => {
      const { data } = await apiClient.patch<PlanActionResponse>(
        `/workflow-programs/${programId}/plans/${planId}/activate`
      )
      if (data?.success === false) {
        throw new Error(data?.message ?? "Unable to activate plan")
      }
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-program-plans", variables.programId] })
      queryClient.invalidateQueries({ queryKey: ["workflow-program-plan", variables.programId, variables.planId] })
    },
  })
}

export function useDeactivatePlan() {
  const queryClient = useQueryClient()

  return useMutation<
    PlanActionResponse["data"],
    Error,
    { programId: string; planId: string }
  >({
    mutationFn: async ({ programId, planId }) => {
      const { data } = await apiClient.patch<PlanActionResponse>(
        `/workflow-programs/${programId}/plans/${planId}/deactivate`
      )
      if (data?.success === false) {
        throw new Error(data?.message ?? "Unable to deactivate plan")
      }
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-program-plans", variables.programId] })
      queryClient.invalidateQueries({ queryKey: ["workflow-program-plan", variables.programId, variables.planId] })
    },
  })
}
