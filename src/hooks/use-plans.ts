import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export interface Plan {
  id: string
  name: string
  description?: string
  total_amount: number
  duration_days: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Hook to get all plans
export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await apiClient.get("/plans")
      return response.data
    },
  })
}

// Hook to get a specific plan
export function usePlan(planId: string) {
  return useQuery({
    queryKey: ["plan", planId],
    queryFn: async () => {
      const response = await apiClient.get(`/plans/${planId}`)
      return response.data
    },
    enabled: !!planId,
  })
}
