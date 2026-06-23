import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export interface WorkflowProgram {
  id: string
  speciality_id: string
  name: string
  code: string
  description?: string
  duration_type: string
  duration_value: number
  duration_extra_days?: number
  language_code: string
  min_batch_size: number
  max_batch_size: number
  auto_generate_batch: boolean
  auto_generate_trigger_day?: number
  auto_enroll_patients: boolean
  status: string
  duration_type_v2?: string
  created_at?: string
  updated_at?: string
}

export interface WorkflowProgramPricing {
  id: string
  program_id: string
  base_price: number
  currency: string
  enrollment_fee?: number
  enrollment_fee_adjustable?: boolean
  max_discount_percent?: number
  max_discount_amount?: number
  effective_from: string
  effective_to?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  status?: string
}

interface WorkflowProgramsResponse {
  success: boolean
  message: string
  statusCode: number
  data: {
    items: WorkflowProgram[]
    total: number
    page: number
    limit: number
  }
}

export interface WorkflowProgramDetailResponse {
  success: boolean
  message: string
  statusCode: number
  data: WorkflowProgram & { pricing?: WorkflowProgramPricing[] }
}

export function useWorkflowPrograms(
  params: { page?: number; limit?: number; specialityId?: string; language?: string } = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["workflow-programs", params],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.set("page", params.page.toString())
      if (params.limit) searchParams.set("limit", params.limit.toString())
      if (params.specialityId) searchParams.set("specialityId", params.specialityId)
      if (params.language) searchParams.set("language", params.language)
      const queryString = searchParams.toString()
      const { data } = await apiClient.get<WorkflowProgramsResponse>(
        `/workflow-programs${queryString ? `?${queryString}` : ""}`,
      )
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to load workflow programs")
      }
      return data
    },
    staleTime: 1000 * 60,
  })
}

export function useWorkflowProgram(programId?: string) {
  return useQuery({
    enabled: Boolean(programId),
    queryKey: ["workflow-program", programId],
    queryFn: async () => {
      if (!programId) throw new Error("Program ID is required")
      const { data } = await apiClient.get<WorkflowProgramDetailResponse>(`/workflow-programs/${programId}`)
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to load workflow program")
      }
      return data.data
    },
  })
}
