import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { SpecialtyStatus } from "@/components/super-admin/types"
import type { ApiSpeciality } from "./use-specialities"

export type UpdateSpecialityRequest = {
  name?: string
  description?: string
  category?: string
  code?: string
  status?: SpecialtyStatus
  is_active?: boolean
  icon_url?: string | null
  cover_image_url?: string | null
}

type UpdateSpecialityVariables = {
  id: string
  payload: UpdateSpecialityRequest
}

export function useUpdateSpecialityMutation() {
  const queryClient = useQueryClient()

  return useMutation<ApiSpeciality, Error, UpdateSpecialityVariables>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await apiClient.put<{ data: ApiSpeciality }>(`/specialities/${id}`, payload)
      return data.data
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-specialities"] })
      queryClient.invalidateQueries({ queryKey: ["super-admin-speciality-detail", variables.id] })
    },
  })
}
