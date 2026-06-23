"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/CalenderPicker"
import { TimePicker } from "@/components/ui/time-picker"
import { Calendar, Clock, Loader2, MapPin, Phone, Video } from "lucide-react"

const MODE_OPTIONS = [
  { value: "audio" as const, label: "Telephonic - Audio", icon: Phone },
  { value: "video" as const, label: "Online - Video", icon: Video },
  { value: "offline" as const, label: "Offline - In Person", icon: MapPin },
]

export const PREDEFINED_LOCATIONS = {
  head_office: {
    address: "Diabetes Free Forever Clinic, Shree Ganesh Ace Arcade, Office no 514 to 517 S.N. 6/1b, Opp Mirchandani Palms, Near, Kokane Chowk, Rahatani, Pune, Maharashtra 411017.",
    city: "Pune",
    pincode: "411017",
    displayName: "Head Office - Rahatani",
  },
  chinchwad: {
    address: "Diabetes Free Forever Clinic, SR No. 268/5, Shakuntala Building, First Floor, Link Road, Laxmi Nagar, Pimpri Chinchwad, Pune - 411033",
    city: "Pune",
    pincode: "411033",
    displayName: "Chinchwad Branch",
  },
  kothrud: {
    address: "Diabetes Free Forever Clinic, Deshpande Puram, Patliputra Housing society, office no -1, Ground Floor, Paud Phata, Behind Dashbhuja Ganpati, Off Karve Road, Kothrud, Pune - 411038",
    city: "Pune",
    pincode: "411038",
    displayName: "Kothrud Branch",
  },
} as const

export type OfflineLocationId = keyof typeof PREDEFINED_LOCATIONS

export type HistoryCallFormState = {
  doctor_id: string
  nutritionist_id: string
  fitness_coach_id: string
  scheduled_date: string
  scheduled_time: string
  duration_mins: number
  mode: "video" | "audio" | "offline"
  notes: string
  meeting_link?: string
  offline_location_id?: OfflineLocationId | ""
}

type StaffMember = {
  staff_id: string
  first_name?: string
  last_name?: string
  description?: string
}

type HistoryCallSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: any | null
  form: HistoryCallFormState
  doctors: StaffMember[]
  nutritionists: StaffMember[]
  fitnessCoaches: StaffMember[]
  isSubmitting: boolean
  onFormChange: <K extends keyof HistoryCallFormState>(field: K, value: HistoryCallFormState[K]) => void
  onSubmit: () => void
}

export function HistoryCallSheet({
  open,
  onOpenChange,
  patient,
  form,
  doctors,
  nutritionists,
  fitnessCoaches,
  isSubmitting,
  onFormChange,
  onSubmit,
}: HistoryCallSheetProps) {
  const locationOptions = React.useMemo(() => Object.entries(PREDEFINED_LOCATIONS), [])

  const selectedDate = React.useMemo(() => {
    if (!form.scheduled_date) return undefined
    const [year, month, day] = form.scheduled_date.split("-").map(Number)
    return new Date(year, month - 1, day)
  }, [form.scheduled_date])

  const isReschedule = Boolean(patient?.history_call_id || patient?.appointment_id)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[540px] p-0 bg-slate-50 flex flex-col">
        {patient ? (
          <>
            <SheetHeader className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6 text-left">
              <SheetTitle className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {isReschedule ? "Reschedule" : "Schedule"} History Call
              </SheetTitle>
              <SheetDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
                {patient.first_name} {patient.last_name}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-900">
                    Assigned Doctor
                  </Label>
                  <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md">
                    {patient?.doctor_first_name && patient?.doctor_last_name ? (
                      <p className="text-sm font-medium text-slate-900">
                        Dr. {patient.doctor_first_name} {patient.doctor_last_name}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">No doctor assigned</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-900">
                    Assigned Dietitian
                  </Label>
                  <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md">
                    {patient?.dietician_first_name && patient?.dietician_last_name ? (
                      <p className="text-sm font-medium text-slate-900">
                        Dt. {patient.dietician_first_name} {patient.dietician_last_name}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">No dietitian assigned</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-900">
                    Assigned Fitness Coach
                  </Label>
                  <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md">
                    {patient?.fitness_coach_first_name && patient?.fitness_coach_last_name ? (
                      <p className="text-sm font-medium text-slate-900">
                        {patient.fitness_coach_first_name} {patient.fitness_coach_last_name}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">No fitness coach assigned</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-900">
                    Assigned Mentor
                  </Label>
                  <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md">
                    {patient?.mentor_first_name && patient?.mentor_last_name ? (
                      <p className="text-sm font-medium text-slate-900">
                        {patient.mentor_first_name} {patient.mentor_last_name}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">No mentor assigned</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date" className="text-sm font-semibold text-slate-900">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      value={selectedDate}
                      onChange={(date) => {
                        onFormChange(
                          "scheduled_date",
                          date
                            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                            : ""
                        )
                      }}
                      placeholder="Select appointment date"
                      className="w-full"
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time" className="text-sm font-semibold text-slate-900">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Time <span className="text-red-500">*</span>
                    </Label>
                    <TimePicker
                      value={form.scheduled_time}
                      onChange={(value) => onFormChange("scheduled_time", value)}
                      placeholder="Select time"
                      className="w-full"
                      interval={20}
                      selectedDate={selectedDate}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_mins" className="text-sm font-semibold text-slate-900">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.duration_mins.toString()}
                    onValueChange={(value) => onFormChange("duration_mins", parseInt(value))}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
                    <Video className="h-3 w-3 inline mr-1" />
                    Call Mode <span className="text-rose-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {MODE_OPTIONS.map((mode) => {
                      const Icon = mode.icon
                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => onFormChange("mode", mode.value)}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            form.mode === mode.value
                              ? "border-indigo-600 bg-indigo-50 shadow-lg"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            form.mode === mode.value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className={`font-semibold text-sm ${
                              form.mode === mode.value ? "text-indigo-900" : "text-slate-900"
                            }`}>
                              {mode.label}
                            </p>
                          </div>
                          {form.mode === mode.value && (
                            <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {form.mode === "video" && (
                  <div className="space-y-2">
                    <Label htmlFor="meeting_link" className="text-sm font-semibold text-slate-900">
                      Meeting Link <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="meeting_link"
                      type="url"
                      placeholder="https://meet.google.com/abc-xyz"
                      value={form.meeting_link}
                      onChange={(e) => onFormChange("meeting_link", e.target.value)}
                    />
                  </div>
                )}

                {form.mode === "offline" && (
                  <div className="space-y-2 max-w-full">
                    <Label htmlFor="address" className="font-black text-xs uppercase tracking-widest text-slate-500">
                      Consultation Address <span className="text-rose-500">*</span>
                    </Label>
                    <div className="">

                    <Select
                      value={form.offline_location_id || ""}
                      onValueChange={(value) => onFormChange("offline_location_id", value as OfflineLocationId)}
                    >
                      <SelectTrigger id="address" className="h-full max-w-full font-bold border-2 rounded-xl bg-white">
                        <SelectValue placeholder="Select consultation address">
                          {form.offline_location_id && PREDEFINED_LOCATIONS[form.offline_location_id]?.displayName}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="w-[380px] max-w-full">
                        {locationOptions.map(([key, location]) => (
                          <SelectItem key={key} value={key} className="py-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                              <div className="text-left flex-1 min-w-0">
                                <p className="font-semibold text-sm text-slate-900">
                                  {location.displayName || `Location ${locationOptions.findIndex(([k]) => k === key) + 1}`}
                                </p>
                                <p className="text-xs text-slate-600 mt-1 break-words">{location.address}</p>
                                <p className="text-xs text-blue-600 font-medium mt-1">
                                  {location.city}, {location.pincode}
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold text-slate-900">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes or instructions..."
                    value={form.notes}
                    onChange={(e) => onFormChange("notes", e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Separator />

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Summary</h4>
                  <div className="space-y-1 text-xs text-blue-800">
                    <p><strong>Patient:</strong> {patient.first_name} {patient.last_name}</p>
                    <p><strong>Doctor:</strong> {doctors.find((d) => d.staff_id === form.doctor_id)?.first_name || "Not selected"} {doctors.find((d) => d.staff_id === form.doctor_id)?.last_name || ""}</p>
                    <p><strong>Nutritionist:</strong> {nutritionists.find((n) => n.staff_id === form.nutritionist_id)?.first_name || "Not selected"} {nutritionists.find((n) => n.staff_id === form.nutritionist_id)?.last_name || ""}</p>
                    {form.fitness_coach_id && (
                      <p><strong>Fitness Coach:</strong> {fitnessCoaches.find((f) => f.staff_id === form.fitness_coach_id)?.first_name} {fitnessCoaches.find((f) => f.staff_id === form.fitness_coach_id)?.last_name}</p>
                    )}
                    <p><strong>Date:</strong> {form.scheduled_date || "Not set"}</p>
                    <p><strong>Time:</strong> {form.scheduled_time || "Not set"}</p>
                    <p><strong>Duration:</strong> {form.duration_mins} minutes</p>
                    <p><strong>Mode:</strong> {MODE_OPTIONS.find((item) => item.value === form.mode)?.label}</p>
                    {form.mode === "video" && (
                      <p><strong>Meeting Link:</strong> {form.meeting_link || "Not added"}</p>
                    )}
                    {form.mode === "offline" && form.offline_location_id && (
                      <div className="space-y-1">
                        <p><strong>Address:</strong></p>
                        <p className="ml-2">{PREDEFINED_LOCATIONS[form.offline_location_id].displayName}</p>
                        <p className="ml-2 text-xs text-slate-600">{PREDEFINED_LOCATIONS[form.offline_location_id].address}</p>
                        <p className="ml-2 text-xs text-blue-600 font-medium">{PREDEFINED_LOCATIONS[form.offline_location_id].city}, {PREDEFINED_LOCATIONS[form.offline_location_id].pincode}</p>
                      </div>
                    )}
                    {form.mode === "offline" && !form.offline_location_id && (
                      <p><strong>Address:</strong> Not selected</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    onClick={onSubmit}
                    disabled={
                      isSubmitting ||
                      !form.doctor_id ||
                      !form.nutritionist_id ||
                      !form.scheduled_date ||
                      !form.scheduled_time ||
                      (form.mode === "video" && !form.meeting_link) ||
                      (form.mode === "offline" && !form.offline_location_id)
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isReschedule ? "Rescheduling..." : "Scheduling..."}
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        {isReschedule ? "Reschedule Call" : "Schedule Call"}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="text-sm text-slate-500">Select a patient to schedule a history call.</div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
