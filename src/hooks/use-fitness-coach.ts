"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getFitnessCoachPatients,
  getFitnessCoachPatientDetails,
  bookFitnessCoachAppointment,
  confirmFitnessCoachAppointment,
  getFitnessCoachAppointments,
  getFitnessCoachAppointmentsList,
  getFitnessCoachUpcomingAppointments,
  completeFitnessCoachAppointment,
  getFitnessCoachPendingAppointments,
  rescheduleFitnessCoachAppointment,
  getStaffSlots,
  cancelFitnessCoachAppointment,
  getCancelledFitnessCoachAppointments,
} from "@/lib/api/fitness-coach-client"
import type {
  DoctorPatientsParams,
  DoctorPatient,
  DoctorPatientDetails,
  DoctorAppointment,
  BookAppointmentRequest,
  DoctorApiResponse,
  DoctorAppointmentsParams,
  StaffSlot,
  RescheduleAppointmentRequest,
} from "@/types/doctor-clinical"

export function useFitnessCoachPatients(params: DoctorPatientsParams) {
  return useQuery<DoctorApiResponse<DoctorPatient[]>, Error>({
    queryKey: ["fitness-coach-patients", params],
    queryFn: () => getFitnessCoachPatients(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useFitnessCoachPatientDetails(patientId: string, options?: { enabled?: boolean }) {
  return useQuery<DoctorApiResponse<DoctorPatientDetails>, Error>({
    queryKey: ["fitness-coach-patient-details", patientId],
    queryFn: () => getFitnessCoachPatientDetails(patientId),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? !!patientId,
  })
}

export function useBookFitnessCoachAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: BookAppointmentRequest) => bookFitnessCoachAppointment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-patients"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-patient-details"] })
    },
  })
}

export function useConfirmFitnessCoachAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (appointmentId: string) => confirmFitnessCoachAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-patients"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-pending-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-appointments"] })
    },
  })
}

export function useFitnessCoachPendingAppointments() {
  return useQuery<DoctorApiResponse<DoctorAppointment[]>, Error>({
    queryKey: ["fitness-coach-pending-appointments"],
    queryFn: () => getFitnessCoachPendingAppointments(),
    staleTime: 1000 * 30,
  })
}

export function useRescheduleFitnessCoachAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, payload }: { appointmentId: string; payload: any }) => rescheduleFitnessCoachAppointment(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-pending-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-appointments"] })
    },
  })
}

export function useFitnessCoachAppointments(params: DoctorAppointmentsParams) {
  return useQuery<DoctorApiResponse<DoctorAppointment[]>, Error>({
    queryKey: ["fitness-coach-appointments", params],
    queryFn: () => getFitnessCoachAppointments(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useFitnessCoachAppointmentsList(params: DoctorPatientsParams) {
  return useQuery<DoctorApiResponse<DoctorAppointment[]>, Error>({
    queryKey: ["fitness-coach-appointments-list", params],
    queryFn: () => getFitnessCoachAppointmentsList(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useFitnessCoachUpcomingAppointments(params: DoctorAppointmentsParams) {
  return useQuery<DoctorApiResponse<DoctorAppointment[]>, Error>({
    queryKey: ["fitness-coach-upcoming-appointments", params],
    queryFn: () => getFitnessCoachUpcomingAppointments(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCompleteFitnessCoachAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (appointmentId: string) => completeFitnessCoachAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-upcoming-appointments"] })
    },
  })
}

export function useStaffSlots(date: string) {
  return useQuery<DoctorApiResponse<StaffSlot[]>, Error>({
    queryKey: ["fitness-coach-staff-slots", date],
    queryFn: () => getStaffSlots(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useRescheduleFitnessCoachAppointmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, payload }: { appointmentId: string; payload: RescheduleAppointmentRequest }) =>
      rescheduleFitnessCoachAppointment(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-appointments-list"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-upcoming-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-appointments"] })
    },
  })
}

export function useCancelFitnessCoachAppointmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason: string }) =>
      cancelFitnessCoachAppointment(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-pending-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-upcoming-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["fitness-coach-cancelled-appointments"] })
    },
  })
}

export function useCancelledFitnessCoachAppointments(params: DoctorPatientsParams = {}) {
  return useQuery<DoctorApiResponse<DoctorAppointment[]>, Error>({
    queryKey: ["fitness-coach-cancelled-appointments", params],
    queryFn: () => getCancelledFitnessCoachAppointments(params),
    staleTime: 1000 * 60 * 2,
  })
}
