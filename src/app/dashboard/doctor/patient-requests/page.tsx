"use client"

import { useCallback, useState } from "react"
import { RequestActionModal } from "@/components/dietitian/request-action-modal"
import { RescheduleSheet } from "@/components/dietitian/patient-details/RescheduleSheet"
import { useMemo } from "react"
import {
  usePendingAppointments,
  useCancelledAppointments,
  useAcceptAppointmentMutation,
  useRescheduleAppointmentMutation,
  useCancelAppointmentMutation,
  useStaffSlots,
} from "@/hooks/use-dietitian-clinical"
import type { DietitianAppointment } from "@/types/dietitian-clinical"
import { PatientRequestList } from "@/components/doctor/patient-details/patient-request-list"

export default function PatientRequestsPage() {
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionMode, setActionMode] = useState<"confirm" | "reschedule" | "cancel">("confirm")
  const [selectedRequest, setSelectedRequest] = useState<DietitianAppointment | null>(null)
  const [showRescheduleSheet, setShowRescheduleSheet] = useState(false)
  const [isRescheduling,setIsRescheduling]=useState(false)
  // Reschedule form state
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: "",
    startTime: "",
    endTime: "",
    slotId: "",
    appointmentType: "consultation",
    mode: "video" as "audio" | "video" | "offline",
    meetingLink: "",
    address: "",
    reason: "",
  })

  const { data: pendingResponse, isLoading: isPendingLoading } = usePendingAppointments()
  const { data: cancelledResponse, isLoading: isCancelledLoading } = useCancelledAppointments({})

  const acceptMutation = useAcceptAppointmentMutation()
  const rescheduleMutation = useRescheduleAppointmentMutation()
  const cancelMutation = useCancelAppointmentMutation()
  
  // Fetch available slots for selected date
  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(rescheduleForm.appointmentDate)
  const availableSlots = slotsResponse?.data || []

  const allAppointments = useMemo(() => {
    const list: DietitianAppointment[] = []
    if (pendingResponse?.data) list.push(...pendingResponse.data)
    if (cancelledResponse?.data) list.push(...cancelledResponse.data)
    return list
  }, [pendingResponse?.data, cancelledResponse?.data])

  const openModal = useCallback((request: DietitianAppointment, mode: "confirm" | "reschedule" | "cancel") => {
    setSelectedRequest(request)
    setActionMode(mode)
    if (mode === "reschedule") {
      setShowRescheduleSheet(true)

    } else {
      setShowActionModal(true)
    }
  }, [])

  const handleConfirm = (request: DietitianAppointment) => openModal(request, "confirm")
  const handleReschedule = (request: DietitianAppointment) => openModal(request, "reschedule")
  const handleCancel = (request: DietitianAppointment) => openModal(request, "cancel")

  const handleConfirmAction = async (appointment: DietitianAppointment, payload?: { meetingLink?: string,mode?:string }) => {
    const formData = new FormData()
    if (payload?.meetingLink) formData.append("meetingLink", payload.meetingLink)
    if (payload?.mode) formData.append("mode", payload.mode)
    //@ts-ignore
    await acceptMutation.mutateAsync({ appointmentId: appointment.id, payload: formData })
  }

  const handleRescheduleAction = async ({
    appointment,
    payload,
  }: {
    appointment: DietitianAppointment
    payload: { newDate: string; newStartTime: string; newEndTime: string; slotId?: string; reason?: string; mode?: string; meetingLink?: string; offline_location?: any }
  }) => {
    setIsRescheduling(true);
    const formData = new FormData()
    formData.append("newDate", payload.newDate)
    formData.append("newStartTime", payload.newStartTime)
    formData.append("newEndTime", payload.newEndTime)
    if (payload.slotId) formData.append("slotId", payload.slotId)
    if (payload.reason) formData.append("reason", payload.reason)
    if (payload.mode) formData.append("mode", payload.mode)
    if (payload.meetingLink) formData.append("meetingLink", payload.meetingLink)
    if (payload.offline_location) {
      formData.append("offline_location", JSON.stringify(payload.offline_location))
    }
    //@ts-ignore
    await rescheduleMutation.mutateAsync({ appointmentId: appointment.id, payload: formData })
    setIsRescheduling(false);
  }

  const handleCancelAction = async (appointment: DietitianAppointment, reason: string) => {
    //@ts-ignore
    await cancelMutation.mutateAsync({ appointmentId: appointment.id, reason })
  }

  const closeModal = (open: boolean) => {
    setShowActionModal(open)
    if (!open) setSelectedRequest(null)
  }

  const closeRescheduleSheet = (open: boolean) => {
    setShowRescheduleSheet(open)
    if (!open) {
      setSelectedRequest(null)
      // Reset form
      setRescheduleForm({
        appointmentDate: "",
        startTime: "",
        endTime: "",
        slotId: "",
        appointmentType: "consultation",
        mode: "video",
        meetingLink: "",
        address: "",
        reason: "",
      })
    }
  }

const handleRescheduleFormChange = (field: string, value: any) => {
    if (field === "slotData") {
      setRescheduleForm(prev => ({
        ...prev,
        slotId: value.slotId,
        startTime: value.startTime,
        endTime: value.endTime,
      }));
    } else {
      setRescheduleForm(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedRequest) return
    
    try {
      const payload: any = {
        newDate: rescheduleForm.appointmentDate,
        newStartTime: rescheduleForm.startTime,
        newEndTime: rescheduleForm.endTime,
        // slotId: rescheduleForm.slotId,
        reason: rescheduleForm.reason,
        mode: rescheduleForm.mode,
      }
      
      if (rescheduleForm.mode === "video" && rescheduleForm.meetingLink) {
        payload.meetingLink = rescheduleForm.meetingLink
      }
      if (rescheduleForm.mode === "offline" && rescheduleForm.slotId) {
        const selectedSlot = availableSlots.find((slot: any) => slot.id === rescheduleForm.slotId);
        if (selectedSlot?.offline_location) {
          payload.offline_location = selectedSlot.offline_location;
        }
      }
      
      await handleRescheduleAction({
        appointment: selectedRequest,
        payload,
      })
      closeRescheduleSheet(false)
    } catch (error) {
      console.error("Reschedule failed:", error)
    }
  }

  const isLoading = isPendingLoading || isCancelledLoading

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Clinical Requests</h1>
          <p className="text-sm font-medium text-slate-500 mt-3 max-w-2xl">
            Centralized hub for managing patient consultation requests, schedule adjustments, and clinical session terminations.
          </p>
        </div>
      </div>

      <PatientRequestList
        appointments={allAppointments}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
      />

      <RequestActionModal
        open={showActionModal}
        onOpenChange={closeModal}
        mode={actionMode}
        appointment={selectedRequest}
        onConfirm={handleConfirmAction}
        onReschedule={handleRescheduleAction}
        onCancel={handleCancelAction}
        isSubmitting={acceptMutation.isPending || rescheduleMutation.isPending || cancelMutation.isPending}
      />

      <RescheduleSheet
        open={showRescheduleSheet}
        onOpenChange={closeRescheduleSheet}
        patientName={selectedRequest ? 
          (selectedRequest.patient_name || 
           `${selectedRequest.patient_first_name || ""} ${selectedRequest.patient_last_name || ""}`.trim() || 
           `Patient #${selectedRequest.patient_id?.slice(0, 6)}`) 
          : ""
        }
        rescheduleForm={rescheduleForm}
        availableSlots={availableSlots}
        isLoadingSlots={isLoadingSlots}
        isRescheduling={isRescheduling}
        hasExistingAppointment={true}
        onFormChange={handleRescheduleFormChange}
        onReschedule={handleRescheduleSubmit}
        onCancel={() => closeRescheduleSheet(false)}
      />
    </div>
  )
}
