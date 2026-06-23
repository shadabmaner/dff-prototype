import { useQuery } from "@tanstack/react-query"
import { getRecoveryStats, getRecoveryPatients, type RecoveryStatsParams, type RecoveryPatientsParams } from "@/lib/api/payment-recovery-client"

export function useRecoveryStats(params?: RecoveryStatsParams) {
  return useQuery({
    queryKey: ["payment-recovery-stats", params],
    queryFn: () => getRecoveryStats(params),
  })
}

export function useRecoveryPatients(params?: RecoveryPatientsParams) {
  return useQuery({
    queryKey: ["payment-recovery-patients", params],
    queryFn: () => getRecoveryPatients(params),
  })
}
