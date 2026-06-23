"use client";

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/CalenderPicker";
import { Calendar, Info, Loader2, Video, Phone, MapPin, Link2, Clock, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RescheduleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  rescheduleForm: {
    appointmentDate: string;
    startTime: string;
    endTime: string;
    slotId: string;
    appointmentType: string;
    mode: "audio" | "video" | "offline";
    meetingLink: string;
    address: string;
    reason: string;
  };
  availableSlots: any[];
  isLoadingSlots: boolean;
  isRescheduling: boolean;
  hasExistingAppointment: boolean;
  onFormChange: (field: string, value: any) => void;
  onReschedule: () => void;
  onCancel: () => void;
}

const consultationModeOptions = [
  { value: "audio" as const, label: "Telephonic - Audio", icon: Phone },
  { value: "video" as const, label: "Online - Video", icon: Video },
  { value: "offline" as const, label: "Offline - In Person", icon: MapPin },
]

const appointmentTypeOptions = [
  { value: "consultation", label: "Consultation" },
  { value: "followup", label: "Follow-up" },
  { value: "fitness_assessment", label: "Fitness Assessment" },
  { value: "training_session", label: "Training Session" },
]

export function RescheduleSheet({
  open,
  onOpenChange,
  patientName,
  rescheduleForm,
  availableSlots,
  isLoadingSlots,
  isRescheduling,
  hasExistingAppointment,
  onFormChange,
  onReschedule,
  onCancel,
}: RescheduleSheetProps) {
  console.log(availableSlots,"availableSlots")
  
  // Field validation state
  const [fieldErrors, setFieldErrors] = React.useState<Set<string>>(new Set())
  
  // Filter slots based on consultation mode and time
  const filteredSlots = React.useMemo(() => {
    if (!availableSlots.length) return []
    
    let modeFiltered = []
    if (rescheduleForm.mode === "offline") {
      // For offline mode, only show slots that have offline_location
      modeFiltered = availableSlots.filter(slot => slot.offline_location)
    } else {
      // For audio and video modes, only show slots that DON'T have offline_location
      modeFiltered = availableSlots.filter(slot => !slot.offline_location)
    }
    
    // Filter out past time slots if the selected date is today
    if (rescheduleForm.appointmentDate) {
      const now = new Date()
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      
      if (rescheduleForm.appointmentDate === todayStr) {
        const currentHours = now.getHours()
        const currentMinutes = now.getMinutes()
        
        modeFiltered = modeFiltered.filter(slot => {
          const [slotHour, slotMinute] = slot.start_time.split(':').map(Number)
          // Only show slots that are in the future
          return slotHour > currentHours || (slotHour === currentHours && slotMinute > currentMinutes)
        })
      }
    }
    
    return modeFiltered
  }, [availableSlots, rescheduleForm.mode, rescheduleForm.appointmentDate])

  // Get unique offline locations from available slots
  const offlineLocations = React.useMemo(() => {
    const locations = new Map()
    availableSlots.forEach(slot => {
      if (slot.offline_location) {
        const key = slot.offline_location.displayName || slot.offline_location.address
        if (!locations.has(key)) {
          locations.set(key, slot.offline_location)
        }
      }
    })
    return Array.from(locations.values())
  }, [availableSlots])

  // Auto-select first offline location when mode changes to offline
  React.useEffect(() => {
    if (rescheduleForm.mode === "offline" && offlineLocations.length > 0 && !rescheduleForm.address) {
      const firstLocation = offlineLocations[0]
      onFormChange("address", firstLocation.displayName || firstLocation.address)
    }
  }, [rescheduleForm.mode, offlineLocations, rescheduleForm.address, onFormChange])
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[540px] p-0 bg-slate-50 flex flex-col">
        <SheetHeader className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg bg-slate-900 text-white shadow-slate-200/50">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {isRescheduling ? "Reschedule":"Schedule Next"} Consultation
              </SheetTitle>
              <SheetDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
                Select a new date and time for the fitness consultation
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Information</p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{patientName}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  {hasExistingAppointment ? "Rescheduling existing appointment" : "Scheduling new consultation"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
              Appointment Date <span className="text-rose-500">*</span>
              {fieldErrors.has("appointmentDate") && (
                <span className="ml-2 text-rose-500 text-[10px] font-medium">Required</span>
              )}
            </Label>
            <DatePicker
              value={rescheduleForm.appointmentDate ? new Date(rescheduleForm.appointmentDate + 'T00:00:00') : undefined}
              onChange={(date) => {
                onFormChange("appointmentDate", date ? 
                  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` 
                  : ''
                )
                // Clear error when field is updated
                if (date && fieldErrors.has("appointmentDate")) {
                  setFieldErrors(prev => {
                    const newErrors = new Set(prev)
                    newErrors.delete("appointmentDate")
                    return newErrors
                  })
                }
              }}
              placeholder="Choose date"
              className={`h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white ${
                fieldErrors.has("appointmentDate") 
                  ? "border-rose-500 bg-rose-50" 
                  : "border-slate-200"
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
              Time Slot <span className="text-rose-500">*</span>
              {fieldErrors.has("timeSlot") && (
                <span className="ml-2 text-rose-500 text-[10px] font-medium">Required</span>
              )}
            </Label>
            {isLoadingSlots ? (
              <div className="flex items-center gap-2 h-12 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-500 font-bold">
                <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                Loading available slots...
              </div>
            ) : filteredSlots.length > 0 ? (
              <Select
                value={rescheduleForm.slotId}
                onValueChange={(value) => {
                  const selectedSlot = filteredSlots.find(s => s.id === value);
                  if (selectedSlot) {
                    onFormChange("slotData", {
                      slotId: selectedSlot.id,
                      startTime: selectedSlot.start_time,
                      endTime: selectedSlot.end_time
                    });
                    // Clear error when field is updated
                    if (fieldErrors.has("timeSlot")) {
                      setFieldErrors(prev => {
                        const newErrors = new Set(prev)
                        newErrors.delete("timeSlot")
                        return newErrors
                      })
                    }
                  }
                }}
              >
                <SelectTrigger className={`h-12 font-bold border-2 rounded-xl bg-white ${
                  fieldErrors.has("timeSlot") 
                    ? "border-rose-500 bg-rose-50" 
                    : "border-slate-200"
                }`}>
                  <SelectValue placeholder="Select available slot" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {slot.start_time.split(':').slice(0, 2).join(':')} - {slot.end_time.split(':').slice(0, 2).join(':')}
                        {slot.offline_location && (
                          <span className="text-xs text-blue-600 font-medium">
                            ({slot.offline_location.displayName || 'Offline'})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : rescheduleForm.appointmentDate ? (
              <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-xl">
                <p className="text-xs font-black text-amber-700">
                  No {rescheduleForm.mode === "offline" ? "offline" : "online"} slots available for this date. 
                  {rescheduleForm.mode === "offline" 
                    ? " Please try online consultation modes or select another date." 
                    : " Please try offline consultation mode or select another date."
                  }
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 border-2 border-slate-200 rounded-xl">
                <p className="text-xs font-bold text-slate-500">Please select a date first to view available slots.</p>
              </div>
            )}
            
            {rescheduleForm.startTime && rescheduleForm.endTime && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border-2 border-emerald-100 rounded-xl">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-black text-emerald-700">
                  Selected: {rescheduleForm.startTime.split(':').slice(0, 2).join(':')} – {rescheduleForm.endTime.split(':').slice(0, 2).join(':')}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-black text-xs uppercase tracking-widest text-slate-500">Appointment Type</Label>
            <Select
              value={rescheduleForm.appointmentType}
              onValueChange={(value) => onFormChange("appointmentType", value)}
            >
              <SelectTrigger className="h-12 font-bold border-2 rounded-xl bg-white">
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
                    onClick={() => {
                      // Reset slot selection when mode changes
                      onFormChange("slotData", {
                        slotId: "",
                        startTime: "",
                        endTime: ""
                      });
                      onFormChange("mode", mode.value);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      rescheduleForm.mode === mode.value
                        ? "border-indigo-600 bg-indigo-50 shadow-lg"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      rescheduleForm.mode === mode.value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-semibold text-sm ${
                        rescheduleForm.mode === mode.value ? "text-indigo-900" : "text-slate-900"
                      }`}>
                        {mode.label}
                      </p>
                    </div>
                    {rescheduleForm.mode === mode.value && (
                      <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {rescheduleForm.mode === "offline" && offlineLocations.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-900">Available Offline Locations</p>
                  <div className="space-y-1">
                    {offlineLocations.map((location, index) => (
                      <div key={index} className="text-xs text-blue-700">
                        <span className="font-medium">{location.displayName || `Location ${index + 1}`}:</span> {location.city}, {location.pincode}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {rescheduleForm.mode === "video" && (
            <div className="space-y-2">
              <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
                Meeting Link <span className="text-rose-500">*</span>
                {fieldErrors.has("meetingLink") && (
                  <span className="ml-2 text-rose-500 text-[10px] font-medium">Required</span>
                )}
              </Label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="url"
                  placeholder="https://meet.google.com/... or https://zoom.us/j/..."
                  value={rescheduleForm.meetingLink}
                  onChange={(e) => {
                    onFormChange("meetingLink", e.target.value)
                    // Clear error when field is updated
                    if (e.target.value && fieldErrors.has("meetingLink")) {
                      setFieldErrors(prev => {
                        const newErrors = new Set(prev)
                        newErrors.delete("meetingLink")
                        return newErrors
                      })
                    }
                  }}
                  className={`h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white pl-11 ${
                    fieldErrors.has("meetingLink") 
                      ? "border-rose-500 bg-rose-50" 
                      : "border-slate-200"
                  }`}
                />
              </div>
            </div>
          )}

          {rescheduleForm.mode === "offline" && (
            <div className="space-y-3">
              <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
                Consultation Address <span className="text-rose-500">*</span>
                {fieldErrors.has("address") && (
                  <span className="ml-2 text-rose-500 text-[10px] font-medium">Required</span>
                )}
              </Label>
              {offlineLocations.length > 0 ? (
                <div className="space-y-3">
                  {offlineLocations.map((location, index) => (
                    <label
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        rescheduleForm.address === (location.displayName || location.address)
                          ? "border-indigo-600 bg-indigo-50 shadow-lg"
                          : fieldErrors.has("address")
                          ? "border-rose-500 bg-rose-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="consultation-address"
                        value={location.displayName || location.address}
                        checked={rescheduleForm.address === (location.displayName || location.address)}
                        onChange={(e) => {
                          onFormChange("address", e.target.value)
                          // Clear error when field is updated
                          if (fieldErrors.has("address")) {
                            setFieldErrors(prev => {
                              const newErrors = new Set(prev)
                              newErrors.delete("address")
                              return newErrors
                            })
                          }
                        }}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="text-left">
                            <p className="font-semibold text-sm text-slate-900">
                              {location.displayName || `Location ${index + 1}`}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">{location.address}</p>
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              {location.city}, {location.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                      {rescheduleForm.address === (location.displayName || location.address) && (
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-xl">
                  <p className="text-xs font-black text-amber-700">
                    No offline locations available. Please select a different consultation mode.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
              Reason (Optional)
            </Label>
            <Textarea
              placeholder="Explain why this consultation needs to be rescheduled..."
              value={rescheduleForm.reason}
              onChange={(e) => onFormChange("reason", e.target.value)}
              className="min-h-[100px] font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white resize-none"
            />
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium">
            The patient will receive a notification about the new schedule once you submit the change.
          </div>
        </div>

        <div className="sticky bottom-0 z-10 bg-white/80 backdrop-blur-xl border-t p-6">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-slate-300 hover:bg-slate-50 h-12 font-semibold"
              disabled={isRescheduling}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Validate required fields and highlight errors
                const errors = new Set<string>()
                
                if (!rescheduleForm.appointmentDate) {
                  errors.add("appointmentDate")
                }
                if (!rescheduleForm.startTime || !rescheduleForm.endTime) {
                  errors.add("timeSlot")
                }
                if (rescheduleForm.mode === "video" && !rescheduleForm.meetingLink) {
                  errors.add("meetingLink")
                }
                if (rescheduleForm.mode === "offline" && !rescheduleForm.address) {
                  errors.add("address")
                }
                
                if (errors.size > 0) {
                  setFieldErrors(errors)
                  return
                }
                
                setFieldErrors(new Set())
                onReschedule();
              }}
              disabled={isRescheduling}
              className="flex-1 bg-slate-900 hover:bg-slate-800 h-12 font-semibold"
            >
              {isRescheduling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {hasExistingAppointment ? "Rescheduling..." : "Scheduling..."}
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  {hasExistingAppointment ? "Reschedule Consultation" : "Schedule Consultation"}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
