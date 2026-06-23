"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getDoctorPatients,
  getDoctorPatientDetails,
  bookDoctorAppointment,
  confirmDoctorAppointment,
  getDoctorAppointments,
  getDoctorAppointmentsList,
  getDoctorUpcomingAppointments,
  completeDoctorAppointment,
  getStaffSlots,
  rescheduleDoctorAppointment,
  cancelDoctorAppointment,
  getCancelledDoctorAppointments,
} from "@/lib/api/doctor-client"
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

export function useDoctorPatients(params: DoctorPatientsParams) {
  return useQuery<DoctorApiResponse<DoctorPatient[]>, Error>({
    queryKey: ["doctor-patients", params],
    queryFn: () => getDoctorPatients(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useDoctorPatientDetails(patientId: string, options?: { enabled?: boolean }) {
  return useQuery<DoctorApiResponse<DoctorPatientDetails>, Error>({
    queryKey: ["doctor-patient-details", patientId],
    queryFn: () => getDoctorPatientDetails(patientId),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? !!patientId,
  })
}

export function useBookDoctorAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: BookAppointmentRequest) => bookDoctorAppointment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-details"] })
    },
    onError: (error) => {
      console.log(error,"error")
    }
  })
}

export function useConfirmDoctorAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (appointmentId: string) => confirmDoctorAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-details"] })
    },
  })
}

export function useDoctorAppointments(params: DoctorAppointmentsParams) {
  return useQuery<DoctorApiResponse<DoctorAppointment[]>, Error>({
    queryKey: ["doctor-appointments", params],
    queryFn: () => getDoctorAppointments(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useDoctorAppointmentsList(params: DoctorPatientsParams) {
  return useQuery<DoctorApiResponse<DoctorAppointment[]>, Error>({
    queryKey: ["doctor-appointments-list", params],
    queryFn: () => getDoctorAppointmentsList(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useDoctorUpcomingAppointments(params: DoctorAppointmentsParams) {
  return useQuery<DoctorApiResponse<DoctorAppointment[]>, Error>({
    queryKey: ["doctor-upcoming-appointments", params],
    queryFn: () => getDoctorUpcomingAppointments(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCompleteDoctorAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (appointmentId: string) => completeDoctorAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-upcoming-appointments"] })
    },
  })
}

export function useStaffSlots(date: string) {
  return useQuery<DoctorApiResponse<StaffSlot[]>, Error>({
    queryKey: ["doctor-staff-slots", date],
    queryFn: () => getStaffSlots(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useRescheduleDoctorAppointmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, payload }: { appointmentId: string; payload: RescheduleAppointmentRequest }) =>
      rescheduleDoctorAppointment(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments-list"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-upcoming-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] })
    },
  })
}
export function useCancelDoctorAppointmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason: string }) =>
      cancelDoctorAppointment(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments-list"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-upcoming-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-cancelled-appointments"] })
    },
  })
}

export function useCancelledDoctorAppointments(params: DoctorPatientsParams = {}) {
  return useQuery<DoctorApiResponse<DoctorAppointment[]>, Error>({
    queryKey: ["doctor-cancelled-appointments", params],
    queryFn: () => getCancelledDoctorAppointments(params),
    staleTime: 1000 * 60 * 2,
  })
}
