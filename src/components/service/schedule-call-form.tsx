"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TimePicker } from "@/components/ui/time-picker"
import { useStaff, useScheduleHistoryCall } from "@/hooks/use-service-api"
import { Loader2 } from "lucide-react"

interface ScheduleCallFormProps {
  patientId: string
  onClose: () => void
  onSuccess?: () => void
}

export function ScheduleCallForm({ patientId, onClose, onSuccess }: ScheduleCallFormProps) {
  const [doctorId, setDoctorId] = useState("")
  const [nutritionistId, setNutritionistId] = useState("")
  const [fitnessCoachId, setFitnessCoachId] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [durationMins, setDurationMins] = useState("45")
  const [mode, setMode] = useState<"video" | "audio" | "in_person">("video")
  const [meetingLink, setMeetingLink] = useState("")
  const [notes, setNotes] = useState("")

  const { data: doctorsResponse, isLoading: loadingDoctors } = useStaff({ staff_type: "doctor" })
  //@ts-ignore
  const { data: nutritionistsResponse, isLoading: loadingNutritionists } = useStaff({ staff_type: "dietitian" })
  const { data: coachesResponse, isLoading: loadingCoaches } = useStaff({ staff_type: "fitness_coach" })
  const doctors = doctorsResponse?.data ?? []
  const nutritionists = nutritionistsResponse?.data ?? []
  const fitnessCoaches = coachesResponse?.data ?? []
  const { mutate: scheduleCall, isPending: submitting, error } = useScheduleHistoryCall()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!doctorId || !nutritionistId || !scheduledDate || !scheduledTime || (mode === "video" && !meetingLink)) {
      alert("Please fill in all required fields")
      return
    }

    scheduleCall(
      {
        patientId,
        data: {
          doctor_id: doctorId,
          nutritionist_id: nutritionistId,
          fitness_coach_id: fitnessCoachId || undefined,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          duration_mins: parseInt(durationMins),
          mode,
          meeting_link: mode === "video" ? meetingLink : undefined,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          alert("History call scheduled successfully!")
          onSuccess?.()
          onClose()
        },
        onError: (err) => {
          console.error("Failed to schedule call:", err)
          alert("Failed to schedule call. Please try again.")
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Staff Selection</h3>

        <div className="space-y-2">
          <Label>Select Doctor *</Label>
          {loadingDoctors ? (
            <div className="flex items-center gap-2 p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-slate-600">Loading doctors...</span>
            </div>
          ) : (
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem className="capitalize" key={doctor.id} value={doctor.id}>
                    {doctor.first_name} {doctor.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label>Select Nutritionist *</Label>
          {loadingNutritionists ? (
            <div className="flex items-center gap-2 p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-slate-600">Loading nutritionists...</span>
            </div>
          ) : (
            <Select value={nutritionistId} onValueChange={setNutritionistId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose nutritionist" />
              </SelectTrigger>
              <SelectContent>
                {nutritionists.map((nutritionist) => (
                  <SelectItem className="capitalize" key={nutritionist.id} value={nutritionist.id}>
                    {nutritionist.first_name} {nutritionist.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label>Select Fitness Coach (Optional)</Label>
          {loadingCoaches ? (
            <div className="flex items-center gap-2 p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-slate-600">Loading coaches...</span>
            </div>
          ) : (
            <Select value={fitnessCoachId} onValueChange={setFitnessCoachId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose fitness coach (optional)" />
              </SelectTrigger>
              <SelectContent>
                {fitnessCoaches.map((coach) => (
                  <SelectItem className="capitalize" key={coach.id} value={coach.id}>
                    {coach.first_name} {coach.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Call Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Time *</Label>
            <TimePicker
              value={scheduledTime}
              onChange={(time) => setScheduledTime(time)}
              placeholder="Select time"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value)}
              min="15"
              step="15"
            />
          </div>
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v: any) => setMode(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="audio">Audio Call</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {mode === "video" && (
          <div className="space-y-2">
            <Label>Meeting Link *</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special instructions or notes..."
            rows={3}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-600">{error instanceof Error ? error.message : "An error occurred"}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" onClick={onClose} variant="outline" className="flex-1" disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule Call"
          )}
        </Button>
      </div>
    </form>
  )
}
