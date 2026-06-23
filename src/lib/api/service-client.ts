import { apiClient } from "@/lib/api-client"
import type {
  ApiResponse,
  PatientListItem,
  PatientDetail,
  PatientListParams,
  StaffMember,
  StaffDetailResponse,
  StaffListParams,
  CreateStaffRequest,
  CreateStaffResponse,
  HistoryCallRequest,
  HistoryCallResponse,
  MissingAppointmentsParams,
  AssignProvidersRequest,
  AssignProvidersResponse
} from "@/types/service-api"

export async function getPatients(params: PatientListParams = {}): Promise<ApiResponse<PatientListItem[]>> {
  const { data } = await apiClient.get<ApiResponse<PatientListItem[]>>("/service-dept/patients", { params })
  return data
}

export async function getPatientById(patientId: string): Promise<ApiResponse<PatientDetail>> {
  const { data } = await apiClient.get<ApiResponse<PatientDetail>>(`/service-dept/patients/${patientId}`)
  return data
}

export async function getStaff(params: StaffListParams = {}): Promise<ApiResponse<StaffMember[]>> {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || 20,
    ...(params.staff_type && { staff_type: params.staff_type }),
    ...(params.speciality_id && { speciality_id: params.speciality_id }),
    ...(params.is_available !== undefined && { is_available: params.is_available }),
    ...(params.search && { search: params.search })
  }
  const { data } = await apiClient.get<ApiResponse<StaffMember[]>>("/clinical/staff", { params: queryParams })
  return data
}

export async function getStaffById(staffId: string): Promise<ApiResponse<StaffDetailResponse>> {
  const { data } = await apiClient.get<ApiResponse<StaffDetailResponse>>(`/service-dept/staff/${staffId}`)
  return data
}

export async function createStaff(payload: CreateStaffRequest): Promise<ApiResponse<CreateStaffResponse>> {
  const { data } = await apiClient.post<ApiResponse<CreateStaffResponse>>("/clinical/staff", payload)
  return data
}

export async function updateStaff(staffId: string, payload: Partial<CreateStaffRequest>): Promise<ApiResponse<StaffMember>> {
  const { data } = await apiClient.patch<ApiResponse<StaffMember>>(`/clinical/staff/${staffId}`, payload)
  return data
}

export async function scheduleHistoryCall(
  patientId: string,
  payload: any
): Promise<HistoryCallResponse> {
  const { data } = await apiClient.post<HistoryCallResponse>(
    `/service-dept/patients/${patientId}/history-call`,
    payload
  )
  return data
}

export async function rescheduleHistoryCall(
  appointmentId: string,
  payload: any
): Promise<HistoryCallResponse> {
  const { data } = await apiClient.patch<HistoryCallResponse>(
    `/service-dept/history-call/${appointmentId}`,
    payload
  )
  return data
}

export async function updateKitEligibility(
  patientId: string,
  status: "eligible_for_kit" | "initiated" | "dispatched"
): Promise<ApiResponse<{ patientId: string; supplementKitEligibility: string; leadUpdated: boolean }>> {
  const { data } = await apiClient.patch<ApiResponse<{ patientId: string; supplementKitEligibility: string; leadUpdated: boolean }>>(
    `/payments/kit-eligibility/${patientId}`,
    { status }
  )
  return data
}

export async function getMissingAppointments(params: MissingAppointmentsParams): Promise<ApiResponse<any[]>> {
  const { data } = await apiClient.get<ApiResponse<any[]>>("/service-dept/missing-appointments", { params })
  return data
}

export async function assignProviders(
  patientId: string,
  payload: AssignProvidersRequest
): Promise<AssignProvidersResponse> {
  const { data } = await apiClient.patch<AssignProvidersResponse>(
    `/service-dept/patients/${patientId}/assign-providers`,
    payload
  )
  return data
}

export async function getWelcomeCallPatients(params: { page?: number; limit?: number; search?: string } = {}) {
  const { data } = await apiClient.get("/service-dept/welcome-call-patients", { params })
  return data
}

export async function assignWelcomeCallProviders(
  patientId: string,
  payload: {
    doctor_id: string
    nutritionist_id: string
    fitness_coach_id: string
    mentor_id: string
  }
) {
  const { data } = await apiClient.patch(
    `/service-dept/patients/${patientId}/welcome-call-assign`,
    payload
  )
  return data
}
