import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setBodyMeasurementGoals, BodyMeasurementGoalsData } from "@/lib/api/body-measurement-goals-client";

export function useSetBodyMeasurementGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: BodyMeasurementGoalsData }) =>
      setBodyMeasurementGoals(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patient-clinical-details", variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient-role-based-details", variables.patientId] });
    },
  });
}
