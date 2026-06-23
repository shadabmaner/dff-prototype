"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export interface Referral {
  id: string
  patient_id: string
  referred_to_id: string
  referred_by_id: string
  reason: string
  priority: string
  notes?: string | null
  status: string
  created_at: string
  updated_at: string
  patient?: {
    id?: string
    first_name: string
    last_name: string
    phone?: string
    email?: string
  }
  referred_by?: {
    id?: string
    name: string
    role?: string
  }
  referred_to?: {
    id?: string
    name: string
    role?: string
  }
  // Flat fields from new response
  patient_first_name?: string
  patient_last_name?: string
  patient_phone?: string
  referred_by_first_name?: string
  referred_by_last_name?: string
  referred_by_staff_type?: string
}

interface ReferralsResponse {
  success: boolean
  data: Referral[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface UseReferralsParams {
  page?: number
  limit?: number
  status?: string
}

async function getReferrals(params: UseReferralsParams): Promise<ReferralsResponse> {
  const { data } = await apiClient.get("/clinical/refers/my-refers", { params })
  return data
}

export function useReferrals(params: UseReferralsParams = {}) {
  return useQuery<ReferralsResponse, Error>({
    queryKey: ["clinical-referrals", params],
    queryFn: () => getReferrals({ page: params.page || 1, limit: params.limit || 20, ...params }),
    staleTime: 1000 * 60 * 2,
  })
}
