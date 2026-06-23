"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/CalenderPicker"
import { CheckCircle2, Edit, Loader2, X, Video, Phone, MapPin, Link2 } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStaffSlots } from "@/hooks/use-dietitian-clinical"
import { cn } from "@/lib/utils"
import type { DietitianAppointment } from "@/types/dietitian-clinical"

interface RequestActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "confirm" | "reschedule" | "cancel"
  appointment?: DietitianAppointment | null
  onConfirm?: (appointment: DietitianAppointment, payload?: { meetingLink?: string }) => Promise<void> | void
  onReschedule?: (params: {
    appointment: DietitianAppointment
    payload: { newDate: string; newStartTime: string; newEndTime: string; slotId?: string; reason?: string }
  }) => Promise<void> | void
  onCancel?: (appointment: DietitianAppointment, reason: string) => Promise<void> | void
  isSubmitting?: boolean
}

export function RequestActionModal({
  open,
  onOpenChange,
  mode,
  appointment,
  onConfirm,
  onReschedule,
  onCancel,
  isSubmitting,
}: RequestActionModalProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [slotId, setSlotId] = useState("")
  const [reason, setReason] = useState("")
  const [meetingLink, setMeetingLink] = useState("")
  const [consultationMode, setConsultationMode] = useState<"audio" | "video" | "in_person">("video")
  const [selectedAddress, setSelectedAddress] = useState("")

  const consultationModeOptions = [
    { value: "audio" as const, label: "Telephonic - Audio", icon: Phone },
    { value: "video" as const, label: "Online - Video", icon: Video },
    { value: "in_person" as const, label: "Offline - In Person", icon: MapPin },
  ]

  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(selectedDate)
  const availableSlots = slotsResponse?.data || []

  useEffect(() => {
    if (mode === "reschedule" && appointment) {
      setSelectedDate(appointment.scheduled_date?.slice(0, 10) || appointment.appointment_date?.slice(0, 10) || "")
      setStartTime("")
      setEndTime("")
      setSlotId("")
      setConsultationMode(appointment.mode?.toLowerCase() as "audio" | "video" | "in_person" || "video")
    } else if (mode === "confirm" && appointment) {
      setConsultationMode(appointment.mode?.toLowerCase() as "audio" | "video" | "in_person" || "video")
    } else {
      setSelectedDate("")
      setStartTime("")
      setEndTime("")
      setSlotId("")
      setConsultationMode("video")
    }
    setReason("")
    setMeetingLink("")
    setSelectedAddress("")
  }, [appointment, mode, open])

  const getPatientName = () => {
    if (!appointment) return "Patient"
    if (appointment.patient_name?.trim()) return appointment.patient_name
    const names = [appointment.patient_first_name, appointment.patient_last_name]
      .filter(Boolean)
      .map((name) => name!.trim())
      .join(" ")
    if (names) return names
    if (appointment.patient_phone) return appointment.patient_phone
    return appointment.patient_id ? `Patient #${appointment.patient_id.slice(0, 6)}` : "Patient"
  }

  const handleConfirmAction = async () => {
    if (!appointment || !onConfirm) return

    // Validate based on mode
    if (consultationMode === "video" && !meetingLink.trim()) {
      toast.error("Meeting link is required for video consultations")
      return
    }
    if (consultationMode === "in_person" && !selectedAddress) {
      toast.error("Consultation address is required for in-person consultations")
      return
    }

    try {
      const payload: any = {}
      payload.mode=consultationMode;
      if (consultationMode === "video") payload.meetingLink = meetingLink
      if (consultationMode === "in_person") payload.address = selectedAddress
      
      await onConfirm(appointment, Object.keys(payload).length > 0 ? payload : undefined)
      toast.success("Appointment confirmed")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to confirm appointment")
    }
  }

  const handleRescheduleAction = async () => {
    if (!appointment || !onReschedule) return
    if (!selectedDate) {
      toast.error("Please select a new date")
      return
    }
    if (!startTime || !slotId) {
      toast.error("Please select an available slot")
      return
    }
    if (!endTime) {
      toast.error("Please select an end time")
      return
    }

    try {
      await onReschedule({
        appointment,
        payload: {
          newDate: selectedDate,
          newStartTime: startTime,
          newEndTime: endTime,
          reason: reason || undefined,
        },
      })
      toast.success("Appointment rescheduled")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to reschedule appointment")
    }
  }

  const handleCancelAction = async () => {
    if (!appointment || !onCancel) return
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation")
      return
    }

    try {
      await onCancel(appointment, reason)
      toast.success("Appointment cancelled")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to cancel appointment")
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return "--"
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return "--"
    return parsed.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (time?: string) => {
    if (!time) return "--"
    try {
      const parts = time.split(":")
      const date = new Date()
      date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10))
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    } catch {
      return time
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[540px] p-0 bg-slate-50 flex flex-col">
        <SheetHeader className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg",
              mode === "cancel" ? "bg-rose-100 text-rose-600 shadow-rose-100/50" : "bg-slate-900 text-white shadow-slate-200/50"
            )}>
              {mode === "confirm" ? <CheckCircle2 className="h-5 w-5" /> : mode === "reschedule" ? <Edit className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </div>
            <div>
              <SheetTitle className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {mode === "confirm" ? "Validate Consultation" : mode === "reschedule" ? "Reschedule Consultation" : "Terminate Consultation"}
              </SheetTitle>
              <SheetDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
                {mode === "confirm" ? "Finalize the appointment slot and confirm with the patient" : mode === "reschedule" ? "Select a new date and time for the clinical discussion" : "Provide clinical justification for cancelling this request"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {mode === "confirm" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Appointment Summary</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Patient</span>
                    <span className="text-sm font-semibold text-slate-900">{getPatientName()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Date</span>
                    <span className="text-sm font-semibold text-slate-900">{formatDate(appointment?.scheduled_date || appointment?.appointment_date || undefined)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Time</span>
                    <span className="text-sm font-semibold text-slate-900">{formatTime(appointment?.scheduled_time || appointment?.appointment_time || undefined)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Mode</span>
                    <span className="text-sm font-semibold text-slate-900">{appointment?.mode || "--"}</span>
                  </div>
                </div>
              </div>

              {/* Consultation Mode Selection */}
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
                  Consultation Mode <span className="text-rose-500">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {consultationModeOptions.map((modeOption) => {
                    const Icon = modeOption.icon
                    return (
                      <button
                        key={modeOption.value}
                        onClick={() => setConsultationMode(modeOption.value)}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          consultationMode === modeOption.value
                            ? "border-indigo-600 bg-indigo-50 shadow-lg"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          consultationMode === modeOption.value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left flex-1">
                          <p className={`font-semibold text-sm ${
                            consultationMode === modeOption.value ? "text-indigo-900" : "text-slate-900"
                          }`}>
                            {modeOption.label}
                          </p>
                        </div>
                        {consultationMode === modeOption.value && (
                          <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {consultationMode === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="meeting-link" className="font-black text-xs uppercase tracking-widest text-slate-500">
                    Meeting Link <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="meeting-link"
                      type="url"
                      placeholder="https://meet.google.com/... or https://zoom.us/j/..."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white pl-11"
                    />
                  </div>
                </div>
              )}

              {consultationMode === "in_person" && (
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-black text-xs uppercase tracking-widest text-slate-500">
                    Consultation Address <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={selectedAddress || ""} onValueChange={setSelectedAddress}>
                    <SelectTrigger id="address" className="h-12 font-bold border-2 rounded-xl bg-white">
                      <SelectValue placeholder="Select consultation address" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinic_main">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <div className="text-left">
                            <p className="font-medium">Main Clinic</p>
                            <p className="text-xs text-slate-500">123 Health Street, Medical District</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="clinic_branch">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <div className="text-left">
                            <p className="font-medium">Branch Office</p>
                            <p className="text-xs text-slate-500">456 Wellness Avenue, Downtown</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="virtual_center">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <div className="text-left">
                            <p className="font-medium">Virtual Consultation Center</p>
                            <p className="text-xs text-slate-500">789 Tech Boulevard, Innovation Hub</p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium">
                Approving this request will notify the patient and add the consultation to your confirmed queue.
              </div>
            </div>
          ) : mode === "reschedule" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
                  New Date <span className="text-rose-500">*</span>
                </Label>
                <DatePicker 
                  value={selectedDate ? new Date(selectedDate + 'T00:00:00') : undefined}
                  onChange={(date) => setSelectedDate(date ? 
                    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` 
                    : ''
                  )}
                  placeholder="Select new date"
                  className="h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
                  Select Slot <span className="text-rose-500">*</span>
                </Label>
                {isLoadingSlots ? (
                  <div className="flex items-center gap-2 h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading available slots...
                  </div>
                ) : availableSlots.length > 0 ? (
                  <Select
                    value={slotId}
                    onValueChange={(value) => {
                      const selectedSlot = availableSlots.find((s) => s.id === value)
                      if (selectedSlot) {
                        setSlotId(selectedSlot.id)
                        setStartTime(selectedSlot.start_time)
                        setEndTime(selectedSlot.end_time)
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 font-bold border-2 rounded-xl bg-white">
                      <SelectValue placeholder="Select available time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.start_time.split(":").slice(0, 2).join(":")} - {slot.end_time.split(":").slice(0, 2).join(":")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : selectedDate ? (
                  <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-xs text-amber-600 font-medium">
                    No slots available for this date.
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
                    Please select a date first to see available slots.
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
                  Reason (Optional)
                </Label>
                <Textarea
                  placeholder="Explain why this consultation needs to be rescheduled..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px] border-2 focus:border-indigo-600 transition-all rounded-xl bg-white resize-none"
                />
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium">
                The patient will receive a notification about the new schedule once you submit the change.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-rose-100 bg-rose-50/30 p-6">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Cancellation Summary</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-500 uppercase">Patient</span>
                    <span className="text-sm font-semibold text-slate-900">{getPatientName()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-500 uppercase">Date</span>
                    <span className="text-sm font-semibold text-slate-900">{formatDate(appointment?.scheduled_date || appointment?.appointment_date || undefined)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-500 uppercase">Time</span>
                    <span className="text-sm font-semibold text-slate-900">{formatTime(appointment?.scheduled_time || appointment?.appointment_time || undefined)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-rose-500">
                  Reason for Cancellation <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  placeholder="Please provide a clear reason for cancelling this request. This will be shared with the patient."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[120px] border-2 border-rose-100 focus:border-rose-500 transition-all rounded-xl bg-rose-50/50 resize-none"
                  rows={4}
                />
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-100 text-[10px] font-medium text-rose-700 leading-relaxed uppercase tracking-wider">
                Note: This action is irreversible. The patient will be notified immediately about the cancellation.
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 bg-white/80 backdrop-blur-xl border-t p-6">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-300 hover:bg-slate-50 h-12 font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {mode === "confirm" ? (
              <Button onClick={handleConfirmAction} className="flex-1 bg-slate-900 hover:bg-slate-800 h-12 font-semibold" disabled={!appointment || isSubmitting}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Consultation
              </Button>
            ) : mode === "reschedule" ? (
              <Button onClick={handleRescheduleAction} className="flex-1 bg-slate-900 hover:bg-slate-800 h-12 font-semibold" disabled={!appointment || isSubmitting}>
                <Edit className="h-4 w-4 mr-2" /> Reschedule Consultation
              </Button>
            ) : (
              <Button onClick={handleCancelAction} className="flex-1 bg-rose-600 hover:bg-rose-700 h-12 font-semibold text-white" disabled={!appointment || isSubmitting}>
                <X className="h-4 w-4 mr-2" /> Cancel Consultation
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
