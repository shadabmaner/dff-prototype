"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/CalenderPicker"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createAppointment } from "@/lib/api/dietitian-clinical-client"
import type { DietitianPatient } from "@/types/dietitian-clinical"
import { Calendar, Clock, Loader2, User, Video, Phone, MapPin, Link } from "lucide-react"
import { useStaffSlots } from "@/hooks/use-dietitian-clinical"

const appointmentTypeOptions = [
  { value: "consultation", label: "Consultation" },
  { value: "followup", label: "Follow-up" },
  { value: "diet-review", label: "Diet Review" },
  { value: "progress", label: "Progress Check" },
]

const consultationModeOptions = [
  { value: "audio", label: "Telephonic - Audio", icon: Phone },
  { value: "video", label: "Online - Video", icon: Video },
  { value: "in_person", label: "Offline - In Person", icon: MapPin },
]

interface AppointmentBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: DietitianPatient | null
  onSuccess?: () => void
}

const getPatientDisplayName = (patient?: DietitianPatient | null) => {
  if (!patient) return "Unknown patient"
  if (patient.patient_name?.trim()) return patient.patient_name.trim()
  const combinedName = [patient.first_name, patient.last_name]
    .filter((name) => !!name && name.toString().trim())
    .join(" ")
    .trim()
  if (combinedName) return combinedName
  if (patient.phone?.trim()) return patient.phone.trim()
  return `Patient #${patient.patient_id.slice(0, 6)}`
}

export default function AppointmentBookingDialog({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: AppointmentBookingDialogProps) {
  const [appointmentDate, setAppointmentDate] = useState("")
  const [slotId, setSlotId] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [appointmentType, setAppointmentType] = useState("consultation")
  const [consultationMode, setConsultationMode] = useState("audio")
  const [meetingLink, setMeetingLink] = useState("")
  const [selectedAddress, setSelectedAddress] = useState("")
  const [reason, setReason] = useState("")
  const [isBooking, setIsBooking] = useState(false)

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], [])

  // Fetch available slots for selected date
  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(appointmentDate)
  const availableSlots = slotsResponse?.data || []

  useEffect(() => {
    if (open) {
      setAppointmentDate("")
      setSlotId("")
      setStartTime("")
      setEndTime("")
      setAppointmentType("consultation")
      setConsultationMode("audio")
      setMeetingLink("")
      setSelectedAddress("")
      setReason("")
    }
  }, [open, patient?.patient_id])

  const handleSubmit = async () => {
    if (!patient) {
      toast.error("Please select a patient")
      return
    }

    if (!appointmentDate || !startTime || !endTime) {
      toast.error("Please select a date and time slot")
      return
    }

    if (!reason.trim()) {
      toast.error("Please add a reason for the appointment")
      return
    }

    if (consultationMode === "video" && !meetingLink.trim()) {
      toast.error("Please provide a meeting link for video consultation")
      return
    }

    if (consultationMode === "in_person" && !selectedAddress) {
      toast.error("Please select an address for in-person consultation")
      return
    }

    setIsBooking(true)
    try {
      await createAppointment({
        patientId: patient.patient_id,
        appointmentDate,
        startTime,
        endTime,
        reason: reason.trim(),
        //@ts-ignore
        mode: consultationMode,
        meetingLink: consultationMode === "video" ? meetingLink.trim() : undefined,
        address: consultationMode === "in_person" ? selectedAddress : undefined,
      })
      toast.success(
        `Appointment booked for ${getPatientDisplayName(patient)} on ${appointmentDate} at ${startTime}`
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors;
      const errorMessage = Array.isArray(apiErrors) && apiErrors.length > 0 
        ? apiErrors.join(". ") 
        : error?.response?.data?.message || "Failed to book appointment";
      toast.error(errorMessage)
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 bg-slate-50 flex flex-col">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Book Appointment</DialogTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Schedule a new appointment</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Patient Info Card */}
          {patient && (
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{getPatientDisplayName(patient)}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                     {patient.phone || "No phone"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="booking-date" className="font-black text-xs uppercase tracking-widest text-slate-500">
              Appointment Date <span className="text-rose-500">*</span>
            </Label>
            <DatePicker
              value={appointmentDate ? new Date(appointmentDate + 'T00:00:00') : undefined}
              onChange={(date) => {
                setAppointmentDate(date ? 
                  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` 
                  : ''
                )
                setSlotId('')
                setStartTime('')
                setEndTime('')
              }}
              placeholder="Select appointment date"
              className="h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white"
            />
          </div>

          {/* Slot Picker */}
          <div className="space-y-2">
            <Label htmlFor="booking-slot" className="font-black text-xs uppercase tracking-widest text-slate-500">
              Time Slot <span className="text-rose-500">*</span>
            </Label>
            {isLoadingSlots ? (
              <div className="flex items-center gap-2 h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-xs text-slate-500 font-bold">
                <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                Loading available slots...
              </div>
            ) : availableSlots.length > 0 ? (
              <Select
                value={slotId}
                onValueChange={(value) => {
                  const selectedSlot = availableSlots.find((s: any) => s.id === value)
                  if (selectedSlot) {
                    setSlotId(selectedSlot.id)
                    setStartTime(selectedSlot.start_time)
                    setEndTime(selectedSlot.end_time)
                  }
                }}
              >
                <SelectTrigger id="booking-slot" className="h-12 font-bold border-2 rounded-xl bg-white">
                  <SelectValue placeholder="Select available slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot: any) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {slot.start_time.split(':').slice(0, 2).join(':')} - {slot.end_time.split(':').slice(0, 2).join(':')}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : appointmentDate ? (
              <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-xl">
                <p className="text-xs font-black text-amber-700">No slots available for this date. Please select another date.</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 border-2 border-slate-200 rounded-xl">
                <p className="text-xs font-bold text-slate-500">Please select a date first to view available slots.</p>
              </div>
            )}

            {/* Selected slot preview */}
            {startTime && endTime && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border-2 border-emerald-100 rounded-xl">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-black text-emerald-700">
                  Selected: {startTime.split(':').slice(0, 2).join(':')} – {endTime.split(':').slice(0, 2).join(':')}
                </span>
              </div>
            )}
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="booking-type" className="font-black text-xs uppercase tracking-widest text-slate-500">Appointment Type</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger id="booking-type" className="h-12 font-bold border-2 rounded-xl bg-white">
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consultation Mode */}
          <div className="space-y-2">
            <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
              Consultation Mode <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {consultationModeOptions.map((mode) => {
                const Icon = mode.icon
                return (
                  <button
                    key={mode.value}
                    onClick={() => setConsultationMode(mode.value)}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      consultationMode === mode.value
                        ? "border-indigo-600 bg-indigo-50 shadow-lg"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      consultationMode === mode.value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-semibold text-sm ${
                        consultationMode === mode.value ? "text-indigo-900" : "text-slate-900"
                      }`}>
                        {mode.label}
                      </p>
                    </div>
                    {consultationMode === mode.value && (
                      <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Video Link (conditional) */}
          {consultationMode === "video" && (
            <div className="space-y-2">
              <Label htmlFor="meeting-link" className="font-black text-xs uppercase tracking-widest text-slate-500">
                Meeting Link <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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

          {/* Address Selection (conditional) */}
          {consultationMode === "in_person" && (
            <div className="space-y-2">
              <Label htmlFor="address" className="font-black text-xs uppercase tracking-widest text-slate-500">
                Consultation Address <span className="text-rose-500">*</span>
              </Label>
              <Select value={selectedAddress} onValueChange={setSelectedAddress}>
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

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="booking-reason" className="font-black text-xs uppercase tracking-widest text-slate-500">
              Reason <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="booking-reason"
              placeholder="Add a short note for this session"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t p-6 flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBooking} className="flex-1 h-12 font-black border-2 rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isBooking || !appointmentDate || !startTime || (consultationMode === "video" && !meetingLink.trim()) || (consultationMode === "in_person" && !selectedAddress)}
            className="flex-1 h-12 bg-gradient-to-r from-slate-900 to-slate-800 font-black shadow-xl rounded-xl"
          >
            {isBooking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
