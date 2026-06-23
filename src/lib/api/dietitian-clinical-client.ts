import { apiClient } from "@/lib/api-client"
import type {
  DietitianPatient,
  DietitianPatientsParams,
  DietitianAppointment,
  DietitianAppointmentsParams,
  DietitianApiResponse,
  CreateAppointmentRequest,
  RescheduleAppointmentRequest,
  PatientClinicalDetails,
  StaffSlot,
} from "@/types/dietitian-clinical"

export async function getDietitianPatients(
  params: DietitianPatientsParams
): Promise<DietitianApiResponse<DietitianPatient[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.search ? { search: params.search } : {}),
    ...(params.status ? { status: params.status } : {}),
  }

  const { data } = await apiClient.get<DietitianApiResponse<DietitianPatient[]>>("/clinical/my-patients", {
    params: query,
  })

  return data
}

export async function getDietitianAppointments(
  params: DietitianAppointmentsParams
): Promise<DietitianApiResponse<DietitianAppointment[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.status ? { status: params.status } : {}),
    ...(params.date ? { date: params.date } : {}),
  }

  const { data } = await apiClient.get<DietitianApiResponse<DietitianAppointment[]>>("/appointments/me", {
    params: query,
  })

  return data
}

export async function createAppointment(
  request: CreateAppointmentRequest
): Promise<DietitianApiResponse<DietitianAppointment>> {
  const { data } = await apiClient.post<DietitianApiResponse<DietitianAppointment>>("/appointments", request)
  return data
}

export async function getPendingAppointments(): Promise<DietitianApiResponse<DietitianAppointment[]>> {
  const { data } = await apiClient.get<DietitianApiResponse<DietitianAppointment[]>>("/appointments/pending")
  return data
}

export async function acceptAppointment(
  appointmentId: string,
  payload?: any
): Promise<DietitianApiResponse<DietitianAppointment>> {
  const { data } = await apiClient.post<DietitianApiResponse<DietitianAppointment>>(
    `/appointments/${appointmentId}/accept`,
    payload
  )
  return data
}

export async function rescheduleAppointment(
  appointmentId: string,
  payload: any
): Promise<DietitianApiResponse<DietitianAppointment>> {
  const { data } = await apiClient.post<DietitianApiResponse<DietitianAppointment>>(
    `/appointments/${appointmentId}/reschedule`,
    payload
  )
  return data
}

export async function getPatientClinicalDetails(
  patientId: string
): Promise<DietitianApiResponse<PatientClinicalDetails>> {
  const { data } = await apiClient.get<DietitianApiResponse<PatientClinicalDetails>>(
    `/clinical/patients/${patientId}`
  )
  return data
}

export async function completeAppointment(
  appointmentId: string
): Promise<DietitianApiResponse<DietitianAppointment>> {
  const { data } = await apiClient.post<DietitianApiResponse<DietitianAppointment>>(
    `/appointments/${appointmentId}/complete`
  )
  return data
}

export async function getUpcomingAppointments(
  params: DietitianAppointmentsParams
): Promise<DietitianApiResponse<DietitianAppointment[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.status ? { status: params.status } : {}),
  }

  const { data } = await apiClient.get<DietitianApiResponse<DietitianAppointment[]>>("/appointments/upcoming", {
    params: query,
  })

  return data
}

export async function getMissingAppointments(
  params: DietitianAppointmentsParams
): Promise<DietitianApiResponse<DietitianAppointment[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  }

  const { data } = await apiClient.get<DietitianApiResponse<DietitianAppointment[]>>("/clinical/staff/me/missing-appointments", {
    params: query,
  })

  return data
}
export async function getStaffSlots(date: string): Promise<DietitianApiResponse<StaffSlot[]>> {
  const { data } = await apiClient.get<DietitianApiResponse<StaffSlot[]>>("/staff/me/slots", {
    params: { date },
  })
  return data
}

export async function cancelAppointment(
  appointmentId: string,
  reason: string
): Promise<DietitianApiResponse<DietitianAppointment>> {
  const { data } = await apiClient.post<DietitianApiResponse<DietitianAppointment>>(
    `/appointments/${appointmentId}/cancel`,
    { reason }
  )
  return data
}

export async function getCancelledAppointments(
  params: DietitianAppointmentsParams
): Promise<DietitianApiResponse<DietitianAppointment[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    ...(params.status ? { status: params.status } : {}),
  }

  const { data } = await apiClient.get<DietitianApiResponse<DietitianAppointment[]>>("/appointments/cancelled", {
    params: query,
  })

  return data
}
