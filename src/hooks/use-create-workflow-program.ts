import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { WorkflowProgram } from "./use-workflow-programs"

export type CreateWorkflowProgramPayload = {
  speciality_id: string
  name: string
  code: string
  description?: string
  duration_type_v2: string
  duration_value: number
  duration_extra_days?: number
  language_code: string
  min_batch_size: number
  max_batch_size: number
  auto_generate_batch: boolean
  auto_generate_trigger_day?: number
  auto_enroll_patients: boolean
  status: string
}

type CreateWorkflowProgramResponse = {
  success: boolean
  statusCode: number
  message: string
  data: WorkflowProgram
}

export function useCreateWorkflowProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateWorkflowProgramPayload) => {
      const { data } = await apiClient.post<CreateWorkflowProgramResponse>("/workflow-programs", payload)
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to create workflow program")
      }
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-programs"] })
    },
  })
}
