import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  app_source: string
  status: string
  created_at: string
  amount?: number
  program?: string
  notes?: string
}

interface LeadsResponse {
  data: Lead[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface GetLeadsParams {
  page: number
  limit: number
  search?: string
}

export function useLeadsApi(params: GetLeadsParams) {
  return useQuery({
    queryKey: ["leads", "app-source", params],
    queryFn: async () => {
      const response = await apiClient.get('/leads/app-source', {
        params
      })
      return response.data as LeadsResponse
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}
