import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { useSpecialitiesStore } from "@/store/specialities-store"

const sortLanguages = (languages: string[]) => [...new Set(languages)].sort()

type LanguageMutationPayload = {
  specialityId: string
  languageCode: string
}

type ApiResponse = {
  success: boolean
  statusCode: number
  message: string
  data?: unknown
}

export function useAddSpecialityLanguageMutation() {
  const queryClient = useQueryClient()
  const updateData = useSpecialitiesStore((state) => state.updateData)

  return useMutation<ApiResponse, Error, LanguageMutationPayload>({
    mutationFn: async ({ specialityId, languageCode }) => {
      const { data } = await apiClient.post<ApiResponse>(`/specialities/${specialityId}/languages`, {
        language_code: languageCode,
      })
      return data
    },
    onSuccess: (_response, variables) => {
      const { specialityId, languageCode } = variables
      updateData((prev) =>
        prev.map((speciality) =>
          speciality.id === specialityId
            ? { ...speciality, languages: sortLanguages([...speciality.languages, languageCode]) }
            : speciality,
        ),
      )

      queryClient.invalidateQueries({ queryKey: ["super-admin-speciality-detail", specialityId] })
      queryClient.invalidateQueries({ queryKey: ["super-admin-specialities"] })
    },
  })
}

export function useRemoveSpecialityLanguageMutation() {
  const queryClient = useQueryClient()
  const updateData = useSpecialitiesStore((state) => state.updateData)

  return useMutation<ApiResponse, Error, LanguageMutationPayload>({
    mutationFn: async ({ specialityId, languageCode }) => {
      const { data } = await apiClient.delete<ApiResponse>(`/specialities/${specialityId}/languages/${languageCode}`)
      return data
    },
    onSuccess: (_response, variables) => {
      const { specialityId, languageCode } = variables
      updateData((prev) =>
        prev.map((speciality) =>
          speciality.id === specialityId
            ? { ...speciality, languages: speciality.languages.filter((language) => language !== languageCode) }
            : speciality,
        ),
      )

      queryClient.invalidateQueries({ queryKey: ["super-admin-speciality-detail", specialityId] })
      queryClient.invalidateQueries({ queryKey: ["super-admin-specialities"] })
    },
  })
}
