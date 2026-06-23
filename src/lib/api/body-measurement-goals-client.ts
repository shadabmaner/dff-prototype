import { apiClient } from "../api-client";

export interface BodyMeasurementGoalsData {
  weight_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  bmi?: number;
  arm_cm?: number;
  calf_cm?: number;
  muscle_mass_percentage?: number;
  target_date?: string;
}

export async function setBodyMeasurementGoals(
  patientId: string,
  data: BodyMeasurementGoalsData
) {
  const response = await apiClient.post(
    `/clinical/patients/${patientId}/body-measurement-goals`,
    data
  );
  return response.data;
}
