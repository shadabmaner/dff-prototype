import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export interface PlanPricing {
  id: string
  plan_id: string
  base_price: string
  currency: string
  enrollment_fee: string
  enrollment_fee_adjustable: boolean
  max_discount_percent: string
  max_discount_amount: string
  emi_months: number | null
  emi_interest_rate: string | null
  effective_from: string
  effective_to: string | null
  is_active: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

interface PricingHistoryResponse {
  success: boolean
  statusCode: number
  data: PlanPricing[]
  message: string
}

interface CurrentPricingResponse {
  success: boolean
  statusCode: number
  data: PlanPricing | null
  message: string
}

interface CreatePricingPayload {
  base_price: number
  currency?: string
  enrollment_fee?: number
  enrollment_fee_adjustable?: boolean
  max_discount_percent?: number
  max_discount_amount?: number
  emi_months?: number
  emi_interest_rate?: number
  effective_from: string
  effective_to?: string | null
}

export function usePlanPricingHistory(programId: string, planId: string, enabled = true) {
  return useQuery<PlanPricing[], Error>({
    queryKey: ["plan-pricing-history", programId, planId],
    enabled: enabled && !!programId && !!planId,
    queryFn: async () => {
      const { data } = await apiClient.get<PricingHistoryResponse>(
        `/workflow-programs/${programId}/plans/${planId}/pricing`
      )
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to load pricing history")
      }
      return data.data ?? []
    },
    staleTime: 1000 * 60,
  })
}

export function useCurrentPlanPricing(programId: string, planId: string, enabled = true) {
  return useQuery<PlanPricing | null, Error>({
    queryKey: ["current-plan-pricing", programId, planId],
    enabled: enabled && !!programId && !!planId,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<CurrentPricingResponse>(
          `/workflow-programs/${programId}/plans/${planId}/pricing/current`
        )
        return data?.data ?? null
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null
        }
        throw error
      }
    },
    staleTime: 1000 * 60,
  })
}

export function useCreatePlanPricing() {
  const queryClient = useQueryClient()

  return useMutation<
    PlanPricing,
    Error,
    { programId: string; planId: string; payload: CreatePricingPayload }
  >({
    mutationFn: async ({ programId, planId, payload }) => {
      const { data } = await apiClient.post<{ success: boolean; data: PlanPricing; message?: string }>(
        `/workflow-programs/${programId}/plans/${planId}/pricing`,
        payload
      )
      if (data?.success === false) {
        throw new Error(data?.message ?? "Unable to create pricing")
      }
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plan-pricing-history", variables.programId, variables.planId] })
      queryClient.invalidateQueries({ queryKey: ["current-plan-pricing", variables.programId, variables.planId] })
      queryClient.invalidateQueries({ queryKey: ["workflow-program-plans", variables.programId] })
    },
  })
}

export function useDeactivatePlanPricing() {
  const queryClient = useQueryClient()

  return useMutation<
    PlanPricing,
    Error,
    { programId: string; planId: string; pricingId: string }
  >({
    mutationFn: async ({ programId, pricingId }) => {
      const { data } = await apiClient.patch<{ success: boolean; data: PlanPricing; message?: string }>(
        `/workflow-programs/${programId}/plans/pricing/${pricingId}/deactivate`
      )
      if (data?.success === false) {
        throw new Error(data?.message ?? "Unable to deactivate pricing")
      }
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plan-pricing-history", variables.programId, variables.planId] })
      queryClient.invalidateQueries({ queryKey: ["current-plan-pricing", variables.programId, variables.planId] })
      queryClient.invalidateQueries({ queryKey: ["workflow-program-plans", variables.programId] })
    },
  })
}
