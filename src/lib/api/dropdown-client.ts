import { apiClient } from "../api-client"

export interface DropdownSpeciality {
  id: string
  name: string
  code: string
  description: string
}

export interface DropdownStaffMember {
  id: string
  name: string
  code: string
  description: string
  first_name: string
  last_name: string
  user_id:string
  staff_id:string
}

export interface DropdownProgram {
  id: string
  name: string
  code: string
  description: string
}

export interface DropdownPlan {
  id: string
  name: string
  code: string
  description: string
  price?: number
  base_price?: string
  enrollment_fee?: string
  currency?: string
  current_pricing?:any
}

export interface DropdownPatient {
  id: string
  name: string
  phone: string
  email?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const dropdownClient = {
  async getSpecialities(): Promise<ApiResponse<DropdownSpeciality[]>> {
    const { data } = await apiClient.get("/dropdowns/specialities")
    return data
  },

  async getStaff(params: {
    speciality_id?: string
    role?: "doctor" | "nutritionist" | "dietitian" | "physio" | "fitness_coach"
  }): Promise<ApiResponse<DropdownStaffMember[]>> {
    const { data } = await apiClient.get("/dropdowns/staff", { params })
    return data
  },

  async getPrograms(params: {
    speciality_id?: string
  }): Promise<ApiResponse<DropdownProgram[]>> {
    const { data } = await apiClient.get("/dropdowns/programs", { params })
    return data
  },

  async getPlans(params: {
    program_id?: string
  }): Promise<ApiResponse<DropdownPlan[]>> {
    const { data } = await apiClient.get("/dropdowns/plans", { params })
    return data
  },

  async getWorkflowPlans(programId: string, params?: {
    active_only?: boolean
  }): Promise<ApiResponse<DropdownPlan[]>> {
    const { data } = await apiClient.get(`/workflow-programs/${programId}/plans`, { params })
    return data
  },

  async getPatients(params?: {
    search?: string
    limit?: number
  }): Promise<ApiResponse<DropdownPatient[]>> {
    const { data } = await apiClient.get("/dropdowns/patients", { params })
    return data
  },
}
