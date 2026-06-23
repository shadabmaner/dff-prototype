import { apiClient } from "@/lib/api-client"
import type {
  DoctorPatient,
  DoctorPatientsParams,
  DoctorPatientDetails,
  DoctorAppointment,
  BookAppointmentRequest,
  DoctorApiResponse,
  StaffSlot,
  RescheduleAppointmentRequest,
} from "@/types/doctor-clinical"

export async function getFitnessCoachPatients(
  params: DoctorPatientsParams
): Promise<DoctorApiResponse<DoctorPatient[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    ...(params.search ? { search: params.search } : {}),
    ...(params.status ? { status: params.status } : {}),
  }

  const { data } = await apiClient.get<DoctorApiResponse<DoctorPatient[]>>("/clinical/my-patients", {
    params: query,
  })

  return data
}

export async function getFitnessCoachPatientDetails(
  patientId: string
): Promise<DoctorApiResponse<DoctorPatientDetails>> {
  const { data } = await apiClient.get<DoctorApiResponse<DoctorPatientDetails>>(
    `/clinical/patients/${patientId}`
  )
  return data
}

export async function bookFitnessCoachAppointment(
  request: BookAppointmentRequest
): Promise<DoctorApiResponse<DoctorAppointment>> {
  const { data } = await apiClient.post<DoctorApiResponse<DoctorAppointment>>(
    "/appointments",
    request
  )
  return data
}

export async function confirmFitnessCoachAppointment(
  appointmentId: string
): Promise<DoctorApiResponse<DoctorAppointment>> {
  const { data } = await apiClient.post<DoctorApiResponse<DoctorAppointment>>(
    `/appointments/${appointmentId}/accept`
  )
  return data
}

export async function getFitnessCoachPendingAppointments(): Promise<DoctorApiResponse<DoctorAppointment[]>> {
  const { data } = await apiClient.get<DoctorApiResponse<DoctorAppointment[]>>("/appointments/pending")
  return data
}

export async function getStaffSlots(date: string): Promise<DoctorApiResponse<StaffSlot[]>> {
  const { data } = await apiClient.get<DoctorApiResponse<StaffSlot[]>>("/staff/me/slots", {
    params: { date },
  })
  return data
}

export async function rescheduleFitnessCoachAppointment(
  appointmentId: string,
  payload: RescheduleAppointmentRequest
): Promise<DoctorApiResponse<DoctorAppointment>> {
  const { data } = await apiClient.post<DoctorApiResponse<DoctorAppointment>>(
    `/appointments/${appointmentId}/reschedule`,
    payload
  )
  return data
}

export async function getFitnessCoachAppointments(
  params: DoctorPatientsParams & { status?: string; date?: string }
): Promise<DoctorApiResponse<DoctorAppointment[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.status ? { status: params.status } : {}),
    ...(params.date ? { date: params.date } : {}),
  }

  // Uses extended scheduling endpoint for current user's appointments
  const { data } = await apiClient.get<DoctorApiResponse<DoctorAppointment[]>>(
    "/appointments/me",
    {
      params: query,
    },
  )
  return data
}

export async function getFitnessCoachAppointmentsList(
  params: DoctorPatientsParams
): Promise<DoctorApiResponse<DoctorAppointment[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    ...(params.search ? { search: params.search } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.date ? { date: params.date } : {}),
    ...(typeof params.isUpcoming === "boolean" ? { isUpcoming: params.isUpcoming } : {}),
  }

  const { data } = await apiClient.get<DoctorApiResponse<DoctorAppointment[]>>("/appointments/me", {
    params: query,
  })

  return data
}

export async function getFitnessCoachUpcomingAppointments(
  params: DoctorPatientsParams & { status?: string }
): Promise<DoctorApiResponse<DoctorAppointment[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.status ? { status: params.status } : {}),
  }
  const { data } = await apiClient.get<DoctorApiResponse<DoctorAppointment[]>>(
    "/appointments/upcoming",
    {
      params: query,
    },
  )
  return data
}

export async function completeFitnessCoachAppointment(
  appointmentId: string
): Promise<DoctorApiResponse<DoctorAppointment>> {
  const { data } = await apiClient.post<DoctorApiResponse<DoctorAppointment>>(
    `/appointments/${appointmentId}/complete`,
  )
  return data
}

export interface GenerateSlotsRequest {
  dates: string[]
  startTime: string
  endTime: string
  offlineLocation?: {
    address: string
    city: string
    pincode: string
  }
}

export interface GroupedSlot {
  date: string
  startTime: string
  endTime: string
}

export async function generateFitnessCoachSlots(
  request: GenerateSlotsRequest
): Promise<any> {
  const { data } = await apiClient.post(
    "/staff/me/slots/generate",
    request
  )
  return data
}

export interface SyncSlotsRequest {
  date: string
  blocks: Array<{
    startTime: string
    endTime: string
    offlineLocation?: {
      address: string
      city: string
      pincode: string
      displayName?: string
      name?: string
    }
  }>
}

export async function syncFitnessCoachSlots(
  request: SyncSlotsRequest
): Promise<any> {
  const { data } = await apiClient.put(
    "/staff/me/slots/sync",
    request
  )
  return data
}

export async function getGroupedSlots(): Promise<{ data: GroupedSlot[] }> {
  const { data } = await apiClient.get("/staff/me/slots/grouped")
  return data
}


export async function cancelFitnessCoachAppointment(
  appointmentId: string,
  reason: string
): Promise<DoctorApiResponse<DoctorAppointment>> {
  const { data } = await apiClient.post<DoctorApiResponse<DoctorAppointment>>(
    `/appointments/${appointmentId}/cancel`,
    { reason }
  )
  return data
}

export async function getCancelledFitnessCoachAppointments(
  params: DoctorPatientsParams
): Promise<DoctorApiResponse<DoctorAppointment[]>> {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    ...(params.status ? { status: params.status } : {}),
  }

  const { data } = await apiClient.get<DoctorApiResponse<DoctorAppointment[]>>(
    "/appointments/cancelled",
    { params: query }
  )
  return data
}
