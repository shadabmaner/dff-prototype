import { useQuery } from "@tanstack/react-query";
import { getPatientMetricsHistory } from "@/lib/api/patient-metrics-client";

export function usePatientMetricsHistory(patientId: string) {
  return useQuery({
    queryKey: ["patient-metrics-history", patientId],
    queryFn: () => getPatientMetricsHistory(patientId),
    enabled: !!patientId,
  });
}

export function usePatientMetricsHistoryWithLoading(patientId: string) {
  return useQuery({
    queryKey: ["patient-metrics-history", patientId],
    queryFn: () => getPatientMetricsHistory(patientId),
    enabled: !!patientId,
  });
}
