import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

// Types
export interface PhaseConfig {
  id: string
  plan_id: string
  phase_number: number
  label: string
  amount: number
  access_days: number
  due_gap_days: number
  grace_period_days: number
  is_active: boolean
  is_unlocked?: boolean
}

export interface CreatePhaseConfigPayload {
  planId: string
  phaseNumber: number
  label: string
  amount: number
  accessDays: number
  dueGapDays?: number
  gracePeriodDays?: number
}

export interface UpdatePhaseConfigPayload {
  phaseNumber?: number
  label?: string
  amount?: number
  accessDays?: number
  dueGapDays?: number
  gracePeriodDays?: number
  isActive?: boolean
}

// Hook to get phase configurations for a plan
export function usePhaseConfigs(planId: string) {
  return useQuery({
    queryKey: ["phase-configs", planId],
    queryFn: async () => {
      const response = await apiClient.get(`/payments/phase-config/${planId}`)
      return response.data
    },
    enabled: !!planId,
  })
}

// Hook to create phase configuration
export function useCreatePhaseConfig() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (payload: CreatePhaseConfigPayload) => {
      const response = await apiClient.post("/payments/phase-config", payload)
      return response.data
    },
    onSuccess: (data, variables) => {
      toast.success("Phase configuration created successfully")
      queryClient.invalidateQueries({ queryKey: ["phase-configs", variables.planId] })
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create phase configuration"
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    }
  })
}

// Hook to update phase configuration
export function useUpdatePhaseConfig() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdatePhaseConfigPayload }) => {
      const response = await apiClient.patch(`/payments/phase-config/${id}`, payload)
      return response.data
    },
    onSuccess: (data, variables) => {
      toast.success("Phase configuration updated successfully")
      queryClient.invalidateQueries({ queryKey: ["phase-configs"] })
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update phase configuration"
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    }
  })
}

// Hook to delete phase configuration
export function useDeletePhaseConfig() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/payments/phase-config/${id}`)
      return response.data
    },
    onSuccess: () => {
      toast.success("Phase configuration deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["phase-configs"] })
    },
    onError: (error: any) => {
      let errorMessage = "Failed to delete phase configuration"
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    }
  })
}
