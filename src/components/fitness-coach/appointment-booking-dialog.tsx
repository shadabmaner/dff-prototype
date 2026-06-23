"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useBookFitnessCoachAppointment } from "@/hooks/use-fitness-coach"
import type { DoctorPatient } from "@/types/doctor-clinical"
import { Video, Phone, MapPin, Link } from "lucide-react"

const appointmentModeOptions = [
  { value: "audio", label: "Telephonic - Audio", icon: Phone },
  { value: "video", label: "Online - Video", icon: Video },
  { value: "in_person", label: "Offline - In Person", icon: MapPin },
]

const appointmentTypeOptions = [
  { value: "consultation", label: "Consultation" },
  { value: "follow_up", label: "Follow-up" },
  { value: "history_call", label: "History Call" },
]

interface FitnessCoachAppointmentBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: DoctorPatient | null
  onSuccess?: () => void
}

const getPatientDisplayName = (patient?: DoctorPatient | null) => {
  if (!patient) return "Unknown patient"
  const combinedName = [patient.first_name, patient.last_name]
    .filter((name) => !!name && name.toString().trim())
    .join(" ")
    .trim()
  if (combinedName) return combinedName
  if (patient.phone?.trim()) return patient.phone.trim()
  return `Patient #${patient.patient_id.slice(0, 6)}`
}

export default function FitnessCoachAppointmentBookingDialog({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: FitnessCoachAppointmentBookingDialogProps) {
  const [appointmentDate, setAppointmentDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [duration, setDuration] = useState("30")
  const [mode, setMode] = useState<"video" | "audio" | "in_person">("audio")
  const [callType, setCallType] = useState<"consultation" | "follow_up" | "history_call">("consultation")
  const [meetingLink, setMeetingLink] = useState("")
  const [selectedAddress, setSelectedAddress] = useState("")
  const [reason, setReason] = useState("")
  const bookAppointment = useBookFitnessCoachAppointment()

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], [])

  useEffect(() => {
    if (open) {
      setAppointmentDate("")
      setStartTime("")
      setDuration("30")
      setMode("audio")
      setCallType("consultation")
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

    if (!appointmentDate || !startTime) {
      toast.error("Please fill date and start time")
      return
    }

    if (!reason.trim()) {
      toast.error("Please add a reason for the appointment")
      return
    }

    if (mode === "video" && !meetingLink.trim()) {
      toast.error("Please provide a meeting link for video consultation")
      return
    }

    if (mode === "in_person" && !selectedAddress) {
      toast.error("Please select an address for in-person consultation")
      return
    }

    try {
      await bookAppointment.mutateAsync({
        patientId: patient.patient_id,
        appointmentDate,
        startTime,
        durationMins: parseInt(duration),
        //@ts-ignore
        mode:mode,
        callType,
        reason: reason.trim(),
        meetingLink: mode === "video" ? meetingLink.trim() : undefined,
        address: mode === "in_person" ? selectedAddress : undefined,
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
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Book Fitness Coach Session</DialogTitle>
          <DialogDescription>
            Schedule a fitness coach session for {getPatientDisplayName(patient)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="booking-date">Date *</Label>
            <Input
              id="booking-date"
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={minDate}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="booking-start">Start Time *</Label>
              <Input
                id="booking-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="booking-duration">Duration (mins)</Label>
              <Input
                id="booking-duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="15"
                step="15"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="booking-mode">Mode</Label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger id="booking-mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentModeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="booking-type">Type</Label>
              <Select value={callType} onValueChange={(v: any) => setCallType(v)}>
                <SelectTrigger id="booking-type">
                  <SelectValue placeholder="Select type" />
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
          </div>
          {/* Conditional fields based on consultation mode */}
          {mode === "video" && (
            <div className="grid gap-2">
              <Label htmlFor="booking-video-link">Meeting Link *</Label>
              <div className="relative">
                <Link className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="booking-video-link"
                  type="url"
                  placeholder="https://zoom.us/meeting/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {mode === "in_person" && (
            <div className="grid gap-2">
              <Label htmlFor="booking-address">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="booking-address"
                  type="text"
                  placeholder="Enter consultation address"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="booking-reason">Reason *</Label>
            <Textarea
              id="booking-reason"
              placeholder="Add a short note for this session"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[90px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={bookAppointment.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={bookAppointment.isPending}>
            {bookAppointment.isPending ? "Booking..." : "Book Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

