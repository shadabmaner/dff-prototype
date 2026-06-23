import { useQuery } from "@tanstack/react-query"
import { dropdownClient } from "@/lib/api/dropdown-client"

export function useSpecialities() {
  return useQuery({
    queryKey: ["dropdowns", "specialities"],
    queryFn: () => dropdownClient.getSpecialities(),
    select: (response) => response.data,
  })
}

export function useStaffDropdown(params: {
  speciality_id?: string
  role?: "doctor" | "nutritionist" | "dietitian" | "physio" | "fitness_coach"
}) {
  return useQuery({
    queryKey: ["dropdowns", "staff", params],
    queryFn: () => dropdownClient.getStaff(params),
    select: (response) => response.data,
    enabled: !!params.speciality_id || !!params.role,
  })
}

export function useProgramsDropdown(params: {
  speciality_id?: string
}) {
  return useQuery({
    queryKey: ["dropdowns", "programs", params],
    queryFn: () => dropdownClient.getPrograms(params),
    select: (response) => response.data,
    enabled: !!params.speciality_id,
  })
}

export function usePlansDropdown(params: {
  program_id?: string
}) {
  return useQuery({
    queryKey: ["dropdowns", "plans", params],
    queryFn: () => params.program_id ? dropdownClient.getWorkflowPlans(params.program_id, { active_only: true }) : Promise.resolve({ success: true, data: [] }),
    select: (response) => response.data,
    enabled: !!params.program_id,
  })
}

export function usePatientsDropdown(params?: {
  search?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ["dropdowns", "patients", params],
    queryFn: () => dropdownClient.getPatients(params),
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}
