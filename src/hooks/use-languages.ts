import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export type Language = {
  code: string
  name: string
  native_name?: string
  is_active?: boolean
  display_order?: number
}

type LanguagesApiResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Language[]
}

export function useLanguages() {
  return useQuery<LanguagesApiResponse, Error>({
    queryKey: ["languages"],
    queryFn: async () => {
      const { data } = await apiClient.get<LanguagesApiResponse>("/languages")
      return data
    },
  })
}
