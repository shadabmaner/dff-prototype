"use client"

import * as React from "react"
import { Phone, CheckCircle2, Clock, Calendar, MessageSquare, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface CampCallLogModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  patientPhone: string
  campName?: string
  onComplete: (patientId: string, log: {
    status: string
    durationMins: number
    notes: string
    messageConfirmed: boolean
  }) => void
}

export function CampCallLogModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientPhone,
  campName = "Lonavala Reversal Retreat",
  onComplete,
}: CampCallLogModalProps) {
  const [callStatus, setCallStatus] = React.useState("seat_reserved")
  const [durationMins, setDurationMins] = React.useState(8)
  const [notes, setNotes] = React.useState(
    "Explained 7-day retreat agenda. Patient was excited about doctor-led detox and cooking masterclasses. Committed to reserving seat."
  )
  const [messageConfirmed, setMessageConfirmed] = React.useState(true)

  const handleSave = () => {
    onComplete(patientId, {
      status: callStatus,
      durationMins: Number(durationMins) || 5,
      notes,
      messageConfirmed,
    })

    const statusLabel =
      callStatus === "seat_reserved"
        ? "Seat Reserved (₹35,000)"
        : callStatus === "considering"
        ? "Considering Retreat"
        : "Call Logged"

    toast.success(`Camp Boost Call logged for ${patientName}!`, {
      description: `Status updated: ${statusLabel} · Duration: ${durationMins}m.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100/70 text-purple-700">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Log Residential Camp Boost Call
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Record conventional call conversation, duration, and retreat reservation status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Patient recap */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div>
            <p className="text-xs font-bold text-slate-900">{patientName}</p>
            <p className="text-[11px] text-slate-500">{patientPhone} · {campName}</p>
          </div>
          <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold">
            ₹35,000 Booster
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Call Outcome & Status</Label>
              <Select value={callStatus} onValueChange={setCallStatus}>
                <SelectTrigger className="h-10 rounded-xl text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="seat_reserved" className="text-xs font-bold text-purple-700">
                    🌟 Seat Reserved (₹35K Committed)
                  </SelectItem>
                  <SelectItem value="considering" className="text-xs">
                    🤝 Considering (Family Discussion)
                  </SelectItem>
                  <SelectItem value="callback_requested" className="text-xs">
                    📞 Callback Requested
                  </SelectItem>
                  <SelectItem value="not_interested" className="text-xs">
                    ❌ Not Interested for This Batch
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Call Duration (Mins)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  min={1}
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  className="pl-9 h-10 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer text-xs font-medium text-slate-700">
            <Checkbox
              checked={messageConfirmed}
              onCheckedChange={(c) => setMessageConfirmed(!!c)}
            />
            <span>Patient confirmed receipt of WhatsApp brochure & mobile notification</span>
          </label>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Telecaller Call Notes</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record counseling conversation, travel queries, room preferences..."
              className="text-xs rounded-xl resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Save Call Log & Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
