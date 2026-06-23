import { apiClient } from "../api-client";

export interface WeightLog {
  id: string;
  weight_kg: number;
  logged_date: string;
  bmi?: number;
  bmi_category?: string;
  notes?: string;
  created_at: string;
}

export interface BodyMeasurement {
  id: string;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  arm_cm?: number;
  calf_cm?: number;
  muscle_mass_percentage?: number;
  logged_date: string;
  notes?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  weight_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  bmi?: number;
  arm_cm?: number;
  calf_cm?: number;
  muscle_mass_percentage?: number;
  target_date?: string;
  status?: string;
  created_at: string;
}

export interface PatientMetricsHistory {
  weight_logs: WeightLog[];
  body_measurements: BodyMeasurement[];
  goals: Goal[];
}

export async function getPatientMetricsHistory(patientId: string) {
  const response = await apiClient.get<{
    statusCode: number;
    success: boolean;
    data: PatientMetricsHistory;
    message: string;
  }>(`/clinical/patients/${patientId}/metrics-history`);
  return response.data;
}
