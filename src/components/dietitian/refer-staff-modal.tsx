//@ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UserPlus, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useStaffDropdown } from "@/hooks/use-dropdowns"
import { apiClient } from "@/lib/api-client"
import { Input } from "@/components/ui/input"

interface ReferStaffModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName?: string
  patientId?: string
  defaultStaffId?: string
  role: "doctor" | "nutritionist" | "dietitian" | "physio" | "fitness_coach"
}

export function ReferStaffModal({
  open,
  onOpenChange,
  patientName,
  patientId,
  defaultStaffId,
  role
}: ReferStaffModalProps) {
  const [selectedStaff, setSelectedStaff] = useState(defaultStaffId || "")
  const [consultationReason, setConsultationReason] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [state, setState] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: staffList = [], isLoading: isLoadingStaff } = useStaffDropdown({ role })

  const roleLabels = {
    doctor: "Doctor",
    nutritionist: "Nutritionist",
    dietitian: "Dietitian",
    physio: "Physiotherapist",
    fitness_coach: "Fitness Coach"
  }

  const roleLabel = roleLabels[role]

  // Update selected staff if defaultStaffId changes or modal opens
  useEffect(() => {
    if (open && defaultStaffId) {
      setSelectedStaff(defaultStaffId)
    }
  }, [open, defaultStaffId])

  const handleSubmit = async () => {
    if (!selectedStaff) {
      toast.error(`Please select a ${roleLabel.toLowerCase()}`)
      return
    }


    if (!consultationReason.trim()) {
      toast.error("Please provide a consultation reason")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        patient_id: patientId,
        referred_to_id: defaultStaffId?.id,
        reason: consultationReason,
        priority: priority,
        notes: notes || undefined
      }

      await apiClient.post("/clinical/refers", payload)

      const staff = staffList.find(s => (s.staff_id || s.id) === selectedStaff)
      toast.success(`Referral sent to ${staff?.name || roleLabel}`)

      // Reset form
      setSelectedStaff("")
      setConsultationReason("")
      setNotes("")
      setPriority("medium")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send referral")
    } finally {
      setIsSubmitting(false)
    }
  }
  console.log(defaultStaffId, "defaultStaffId")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Refer to {roleLabel}
          </DialogTitle>
          <DialogDescription>
            {patientName ? `Create a ${roleLabel?.toLowerCase()} referral for ${patientName}` : `Create a ${roleLabel?.toLowerCase()} referral for consultation`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-900">{roleLabel} Consultation Required</p>
              <p className="text-xs text-amber-700">
                This will create a consultation assignment for the selected {roleLabel?.toLowerCase()}. They will be notified immediately.
              </p>
            </div>
          </div>

          {/* Select Staff */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Select {roleLabel} *</Label>
            <Select
              value={defaultStaffId?.id}
              onValueChange={setSelectedStaff}
              disabled={!defaultStaffId}
            >
              <SelectTrigger className={`border-slate-200 bg-white h-11 ${!!defaultStaffId ? "opacity-70 cursor-not-allowed" : ""}`}>
                <SelectValue placeholder={isLoadingStaff ? `Loading ${roleLabel?.toLowerCase()}s...` : `Choose a ${roleLabel?.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={defaultStaffId?.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{defaultStaffId?.name}</span>
                    {defaultStaffId?.phone && <span className="text-xs text-slate-500">• {defaultStaffId?.phone}</span>}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Consultation Reason */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Consultation Reason *</Label>
            <Textarea
              placeholder={`Describe the reason for ${roleLabel?.toLowerCase()} consultation...`}
              value={consultationReason}
              onChange={(e) => setConsultationReason(e.target.value)}
              className="min-h-[100px] bg-white border-slate-200 focus-visible:ring-slate-900/20"
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Add any additional context, observations, or patient history relevant to this referral..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] bg-white border-slate-200 focus-visible:ring-slate-900/20"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Priority (Optional)</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPriority("low")}
                className={`p-3 rounded-lg border-2 transition-all ${priority === "low"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
                  }`}
              >
                <Badge className="bg-slate-500 text-white mb-2">Low</Badge>
                <p className="text-xs text-slate-600">Routine follow-up</p>
              </button>

              <button
                onClick={() => setPriority("medium")}
                className={`p-3 rounded-lg border-2 transition-all ${priority === "medium"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
                  }`}
              >
                <Badge className="bg-amber-500 text-white mb-2">Medium</Badge>
                <p className="text-xs text-slate-600">Within a week</p>
              </button>

              <button
                onClick={() => setPriority("high")}
                className={`p-3 rounded-lg border-2 transition-all ${priority === "high"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
                  }`}
              >
                <Badge className="bg-red-600 text-white mb-2">High</Badge>
                <p className="text-xs text-slate-600">Urgent attention</p>
              </button>
            </div>
          </div>

          {/* Summary */}
          {selectedStaff && consultationReason && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-900 mb-2">Referral Summary:</p>
              <div className="space-y-1 text-xs text-slate-700">
                <p><strong>{roleLabel}:</strong> {staffList.find(s => (s.staff_id || s.id) === selectedStaff)?.name}</p>
                <p><strong>Priority:</strong> <Badge className={`text-xs ${priority === "high" ? "bg-red-600" : priority === "medium" ? "bg-amber-500" : "bg-slate-500"
                  } text-white`}>{priority.toUpperCase()}</Badge></p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-slate-900 hover:bg-slate-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Sending..." : "Send Referral"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
