import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"

interface DeleteWorkflowProgramResponse {
  success?: boolean
  message?: string
}

export function useDeleteWorkflowProgram() {
  const queryClient = useQueryClient()

  return useMutation<string, Error, string>({
    mutationFn: async (programId: string) => {
      const { data } = await apiClient.delete<DeleteWorkflowProgramResponse>(`/workflow-programs/${programId}`)
      if (data?.success === false) {
        throw new Error(data?.message ?? "Unable to delete workflow program")
      }
      return programId
    },
    onSuccess: (_programId, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-program", variables] })
      queryClient.invalidateQueries({ queryKey: ["workflow-programs"] })
    },
  })
}
