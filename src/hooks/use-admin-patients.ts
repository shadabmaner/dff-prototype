"use client"

import { useQuery } from "@tanstack/react-query"
import { getAdminPatients } from "@/lib/api/admin-patient-client"
import type { PatientListItem } from "@/types/service-api"

export function useAdminPatients(params: any = {}) {
  return useQuery({
    queryKey: ["admin-patients", params],
    queryFn: () => getAdminPatients(params),
    staleTime: 1000 * 60 * 5,
  })
}
