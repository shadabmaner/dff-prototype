import { useQuery } from "@tanstack/react-query"
import { getPatientClinicalDetails, getPatientRoleBasedDetails, getPatientDietPlan, getPatientCollectionProgress, getPatientMindsetActivityLogs, getUserJourney } from "@/lib/api/patient-client"

export function usePatientClinicalDetails(patientId: string) {
  return useQuery({
    queryKey: ["patient-clinical-details", patientId],
    queryFn: () => getPatientClinicalDetails(patientId),
    enabled: !!patientId,
  })
}

export function usePatientRoleBasedDetails(patientId: string, options?: { enabled?: boolean } & import("@tanstack/react-query").UseQueryOptions) {
  return useQuery({
    queryKey: ["patient-role-based-details", patientId],
    queryFn: () => getPatientRoleBasedDetails(patientId),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? !!patientId,
    ...options
  })
}

export function usePatientDietPlan(patientId: string) {
  return useQuery({
    queryKey: ["patient-diet-plan", patientId],
    queryFn: () => getPatientDietPlan(patientId),
    enabled: !!patientId,
  })
}

export function usePatientCollectionProgress(patientId: string, params?: { page?: number; limit?: number; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ["patient-collection-progress", patientId, params],
    queryFn: () => getPatientCollectionProgress(patientId, params),
    enabled: !!patientId,
  })
}

export function usePatientCollectionProgressWithLoading(patientId: string, params?: { page?: number; limit?: number; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ["patient-collection-progress", patientId, params],
    queryFn: () => getPatientCollectionProgress(patientId, params),
    enabled: !!patientId,
  })
}

export function usePatientMindsetLogs(patientId: string, params?: { page?: number; limit?: number; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ["patient-mindset-logs", patientId, params],
    queryFn: () => getPatientMindsetActivityLogs(patientId, params),
    enabled: !!patientId,
  })
}

export function useUserJourney(patientId: string) {
  return useQuery({
    queryKey: ["user-journey", patientId],
    queryFn: () => getUserJourney(patientId),
    enabled: !!patientId,
  })
}
