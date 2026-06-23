"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getPatients, getPatientById, getStaff, getStaffById, createStaff, updateStaff, scheduleHistoryCall, rescheduleHistoryCall, updateKitEligibility, getMissingAppointments } from "@/lib/api/service-client"
import type {
  PatientListItem,
  PatientDetail,
  PatientListParams,
  StaffMember,
  StaffDetailResponse,
  StaffListParams,
  CreateStaffRequest,
  CreateStaffResponse,
  HistoryCallRequest,
  ApiResponse,
  MissingAppointmentsParams
} from "@/types/service-api"

export function usePatients(params: PatientListParams = {}, options?: { enabled?: boolean }) {
  return useQuery<ApiResponse<PatientListItem[]>, Error>({
    queryKey: ["service-patients", params],
    queryFn: () => getPatients(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

export function usePatientDetail(patientId: string | null) {
  return useQuery<PatientDetail, Error>({
    queryKey: ["service-patient", patientId],
    enabled: Boolean(patientId),
    queryFn: async () => {
      if (!patientId) {
        throw new Error("Patient ID is required")
      }
      const response = await getPatientById(patientId)
      if (!response.success || !response.data) {
        throw new Error("Failed to fetch patient details")
      }
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useStaff(params: StaffListParams = {}) {
  return useQuery<ApiResponse<StaffMember[]>, Error>({
    queryKey: ["service-staff", params],
    queryFn: async () => {
      const response = await getStaff(params)
      if (!response.success || !response.data) {
        throw new Error("Failed to fetch staff")
      }
      return response
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useStaffDetail(staffId: string | null) {
  return useQuery<StaffDetailResponse, Error>({
    queryKey: ["service-staff", staffId],
    enabled: Boolean(staffId),
    queryFn: async () => {
      if (!staffId) {
        throw new Error("Staff ID is required")
      }
      const response = await getStaffById(staffId)
      if (!response.success || !response.data) {
        throw new Error("Failed to fetch staff details")
      }
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<CreateStaffResponse>, Error, CreateStaffRequest>({
    mutationFn: (data: CreateStaffRequest) => createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-staff"] })
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<StaffMember>, Error, { staffId: string; data: Partial<CreateStaffRequest> }>({
    mutationFn: ({ staffId, data }) => updateStaff(staffId, data),
    onSuccess: (_, { staffId }) => {
      queryClient.invalidateQueries({ queryKey: ["service-staff"] })
      queryClient.invalidateQueries({ queryKey: ["service-staff", staffId] })
    },
  })
}

export function useScheduleHistoryCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: HistoryCallRequest }) =>
      scheduleHistoryCall(patientId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service-patient", variables.patientId] })
      queryClient.invalidateQueries({ queryKey: ["service-patients"] })
    },
  })
}

export function useRescheduleHistoryCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: string; data: HistoryCallRequest }) =>
      rescheduleHistoryCall(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-missing-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["service-patients"] })
    },
  })
}

export function useUpdateKitEligibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ patientId, status }: { patientId: string; status: "eligible_for_kit" | "initiated" | "dispatched" }) =>
      updateKitEligibility(patientId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service-patient", variables.patientId] })
      queryClient.invalidateQueries({ queryKey: ["service-patients"] })
    },
  })
}

export function useMissingAppointments(params: MissingAppointmentsParams = {}, options?: { enabled?: boolean }) {
  return useQuery<ApiResponse<any[]>, Error>({
    queryKey: ["service-missing-appointments", params],
    queryFn: () => getMissingAppointments(params),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}
