import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { ApiSpeciality } from "./use-specialities"
import { mapSpeciality } from "./use-specialities"
import { useSpecialitiesStore } from "@/store/specialities-store"

export type CreateSpecialityPayload = {
  name: string
  description?: string
  category?: string
  code?: string
  icon_url?: string
  cover_image_url?: string
  color_code?: string
  display_order?: number
  is_active?: boolean
}

type ApiResponse = {
  success: boolean
  statusCode: number
  message: string
  data: ApiSpeciality
}

export function useCreateSpecialityMutation() {
  const queryClient = useQueryClient()
  const updateData = useSpecialitiesStore((state) => state.updateData)
  const setError = useSpecialitiesStore((state) => state.setError)

  return useMutation({
    mutationFn: async (payload: CreateSpecialityPayload) => {
      const { data } = await apiClient.post<ApiResponse>("/specialities", payload)
      return data
    },
    onSuccess: (response) => {
      if (!response?.data) return
      const mapped = mapSpeciality(response.data)
      updateData((prev) => [mapped, ...prev])
      queryClient.invalidateQueries({ queryKey: ["super-admin-specialities"] })
      setError(null)
    },
  })
}
