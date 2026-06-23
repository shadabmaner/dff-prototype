"use client"

import type { PatientListItem } from "@/types/service-api"

// Export the AdminPatient type for use in components
export type AdminPatient = {
  patient_id: string
  first_name: string
  last_name: string
  phone: string
  enrollment_status?: string
  assessment_status?: string | null
  doctor_first_name?: string | null
  doctor_last_name?: string | null
  dietician_first_name?: string | null
  dietician_last_name?: string | null
  physio_first_name?: string | null
  physio_last_name?: string | null
}

// Dummy Data
const DUMMY_PATIENTS: PatientListItem[] = [
  {
    patient_id: "pat_001",
    first_name: "Amit",
    last_name: "Sharma",
    phone: "9876543210",
    weight_kg: 75,
    height_cm: 175,
    email: "amit@example.com",
    enrollment_id: "enr_001",
    enrollment_status: "active",
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_doctor_id: "doc_001",
    assigned_nutritionist_id: "nut_001",
    assigned_fitness_coach_id: null,
    program_id: "prog_001",
    program_name: "Weight Loss Program",
    duration_days: 90,
    speciality_id: "spec_001",
    speciality_name: "Nutrition",
    latest_assessment_id: "assess_001",
    severity_score: 5,
    severity_level: "medium",
    assessment_status: "completed",
    doctor_first_name: "Rahul",
    doctor_last_name: "Verma",
    dietician_first_name: "Sneha",
    dietician_last_name: "Patil",
    physio_first_name: null,
    physio_last_name: null,
    history_call_id: "hc_001",
    history_call_status: "confirmed",
    history_call_date: new Date().toISOString(),
    history_call_time: "10:00",
    supplement_kit_eligibility: "eligible_for_kit",
  },
  {
    patient_id: "pat_002",
    first_name: "Neha",
    last_name: "Joshi",
    phone: "9123456789",
    weight_kg: 65,
    height_cm: 160,
    email: "neha@example.com",
    enrollment_id: "enr_002",
    enrollment_status: "completed",
    starts_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date().toISOString(),
    assigned_doctor_id: null,
    assigned_nutritionist_id: null,
    assigned_fitness_coach_id: null,
    program_id: "prog_002",
    program_name: "Diabetes Care",
    duration_days: 120,
    speciality_id: "spec_002",
    speciality_name: "Endocrinology",
    latest_assessment_id: null,
    severity_score: null,
    severity_level: "low",
    assessment_status: null,
    doctor_first_name: null,
    doctor_last_name: null,
    dietician_first_name: null,
    dietician_last_name: null,
    physio_first_name: null,
    physio_last_name: null,
    history_call_id: null,
    history_call_status: null,
    history_call_date: null,
    history_call_time: null,
    supplement_kit_eligibility: null,
  },
]

// Fake delay (simulate API)
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function getAdminPatients(params: any) {
  await delay(500) // simulate loading

  return {
    success: true,
    data: DUMMY_PATIENTS,
    meta: {
      total: DUMMY_PATIENTS.length,
      page: params.page || 1,
      limit: params.limit || 20,
      totalPages: 1,
    },
  }
}
