import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { SuperAdminSpecialty } from "@/components/super-admin/types"
import { mapSpeciality, type ApiSpeciality } from "./use-specialities"

type SpecialityDetailResponse = {
  success: boolean
  statusCode: number
  message: string
  data: ApiSpeciality
}

export function useSpecialityDetail(
  specialityId?: string,
  options?: { enabled?: boolean; initialData?: SuperAdminSpecialty }
): UseQueryResult<SuperAdminSpecialty, Error> {
  return useQuery<SuperAdminSpecialty, Error>({
    queryKey: ["super-admin-speciality-detail", specialityId],
    enabled: Boolean(specialityId) && (options?.enabled ?? true),
    queryFn: async () => {
      if (!specialityId) throw new Error("Missing speciality id")
      const { data } = await apiClient.get<SpecialityDetailResponse>(`/specialities/${specialityId}`)
      return mapSpeciality(data.data)
    },
    placeholderData: () => options?.initialData,
  })
}
