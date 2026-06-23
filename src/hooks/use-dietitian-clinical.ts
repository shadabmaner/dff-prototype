"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getDietitianPatients,
  getDietitianAppointments,
  getPendingAppointments,
  acceptAppointment,
  rescheduleAppointment,
  getPatientClinicalDetails,
  completeAppointment,
  getUpcomingAppointments,
  getMissingAppointments,
  getStaffSlots,
  cancelAppointment,
  getCancelledAppointments,
} from "@/lib/api/dietitian-clinical-client"
import type {
  DietitianPatientsParams,
  DietitianAppointmentsParams,
  DietitianPatient,
  DietitianAppointment,
  DietitianApiResponse,
  RescheduleAppointmentRequest,
  PatientClinicalDetails,
  StaffSlot,
} from "@/types/dietitian-clinical"

export function useDietitianPatients(params: DietitianPatientsParams) {
  return useQuery<DietitianApiResponse<DietitianPatient[]>, Error>({
    queryKey: ["dietitian-my-patients", params],
    queryFn: () => getDietitianPatients(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useDietitianAppointments(params: DietitianAppointmentsParams) {
  return useQuery<DietitianApiResponse<DietitianAppointment[]>, Error>({
    queryKey: ["dietitian-appointments", params],
    queryFn: () => getDietitianAppointments(params),
    staleTime: 0, // Always consider data stale to force fresh fetch
  })
}

export function usePendingAppointments(options?: { enabled?: boolean }) {
  return useQuery<DietitianApiResponse<DietitianAppointment[]>, Error>({
    queryKey: ["dietitian-pending-appointments"],
    queryFn: () => getPendingAppointments(),
    staleTime: 1000 * 30,
    enabled: options?.enabled ?? true,
  })
}

export function useAcceptAppointmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, payload }: { appointmentId: string; payload?: { meetingLink?: string } }) =>
      acceptAppointment(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietitian-pending-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["dietitian-appointments"] })
    },
  })
}

export function useRescheduleAppointmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, payload }: { appointmentId: string; payload: RescheduleAppointmentRequest }) =>
      rescheduleAppointment(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietitian-pending-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["dietitian-appointments"] })
    },
  })
}

export function usePatientClinicalDetails(patientId: string, options?: { enabled?: boolean }) {
  return useQuery<DietitianApiResponse<PatientClinicalDetails>, Error>({
    queryKey: ["patient-clinical-details", patientId],
    queryFn: () => getPatientClinicalDetails(patientId),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? !!patientId,
  })
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (appointmentId: string) => completeAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietitian-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["dietitian-pending-appointments"] })
    },
  })
}

export function useUpcomingAppointments(params: DietitianAppointmentsParams) {
  return useQuery<DietitianApiResponse<DietitianAppointment[]>, Error>({
    queryKey: ["dietitian-upcoming-appointments", params],
    queryFn: () => getUpcomingAppointments(params),
    staleTime: 0, // Always consider data stale to force fresh fetch
  })
}

export function useMissingAppointments(params: DietitianAppointmentsParams) {
  return useQuery<DietitianApiResponse<DietitianAppointment[]>, Error>({
    queryKey: ["dietitian-missing-appointments", params],
    queryFn: () => getMissingAppointments(params),
    staleTime: 0, // Always consider data stale to force fresh fetch
  })
}

export function useStaffSlots(date: string) {
  return useQuery<DietitianApiResponse<StaffSlot[]>, Error>({
    queryKey: ["staff-slots", date],
    queryFn: () => getStaffSlots(date),
    enabled: !!date,
    staleTime: 0,
  })
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason: string }) =>
      cancelAppointment(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietitian-pending-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["dietitian-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["dietitian-cancelled-appointments"] })
    },
  })
}

export function useCancelledAppointments(params: DietitianAppointmentsParams) {
  return useQuery<DietitianApiResponse<DietitianAppointment[]>, Error>({
    queryKey: ["dietitian-cancelled-appointments", params],
    queryFn: () => getCancelledAppointments(params),
    staleTime: 1000 * 60 * 2,
  })
}
