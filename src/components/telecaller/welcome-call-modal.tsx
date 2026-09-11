"use client"

import * as React from "react"
import { PhoneCall, CheckCircle2, Clock, HeartHandshake, ShieldCheck, Sparkles, MessageSquare, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { CareTeamData } from "./care-team-assignment-modal"

interface WelcomeCallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  patientPhone: string
  careTeam?: Partial<CareTeamData>
  onComplete: (patientId: string, callLog: {
    status: string
    durationMins: number
    sentiment: string
    notes: string
    checklistCompleted: boolean
  }) => void
}

export function WelcomeCallModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientPhone,
  careTeam,
  onComplete,
}: WelcomeCallModalProps) {
  const [callStatus, setCallStatus] = React.useState("connected")
  const [durationMins, setDurationMins] = React.useState(14)
  const [sentiment, setSentiment] = React.useState("excited")
  const [notes, setNotes] = React.useState(
    "Patient is motivated to reverse type 2 diabetes. Briefed on Doctor & Dietitian protocols. Sent app download link via WhatsApp."
  )

  const [checklist, setChecklist] = React.useState({
    welcomeFamily: true,
    medicalHistory: true,
    introducedTeam: true,
    appGuidance: true,
  })

  const allChecklistItems =
    checklist.welcomeFamily &&
    checklist.medicalHistory &&
    checklist.introducedTeam &&
    checklist.appGuidance

  const handleFinish = () => {
    onComplete(patientId, {
      status: callStatus,
      durationMins: Number(durationMins) || 10,
      sentiment,
      notes,
      checklistCompleted: allChecklistItems,
    })
    toast.success(`Welcome Call completed for ${patientName}!`, {
      description: `Logged ${durationMins}m call. Onboarding bonding complete & care team active.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-700">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Step 2: Conduct & Complete Welcome Call
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Create trust and bonding, explain the reversal milestones, and introduce their assigned care team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Patient & Phone Info */}
        <div className="flex flex-wrap items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 gap-2">
          <div>
            <p className="text-xs font-bold text-slate-900">{patientName}</p>
            <p className="text-[11px] text-slate-500">{patientPhone} · ID: {patientId}</p>
          </div>
          {careTeam?.doctor ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Care Team Assigned
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
              <AlertCircle className="mr-1 h-3 w-3" />
              Care Team Pending
            </Badge>
          )}
        </div>

        {/* Call Parameters */}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Call Outcome</Label>
              <Select value={callStatus} onValueChange={setCallStatus}>
                <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="connected" className="text-xs">
                    Connected & Completed
                  </SelectItem>
                  <SelectItem value="callback_requested" className="text-xs">
                    Callback Requested
                  </SelectItem>
                  <SelectItem value="no_answer" className="text-xs">
                    Busy / No Answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Call Duration (Mins)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  min={1}
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  className="h-9 rounded-xl pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Onboarding Checklist */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                Onboarding Bonding Checklist
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {Object.values(checklist).filter(Boolean).length}/4 Done
              </span>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <Checkbox
                  checked={checklist.welcomeFamily}
                  onCheckedChange={(c) => setChecklist((prev) => ({ ...prev, welcomeFamily: !!c }))}
                  className="mt-0.5"
                />
                <span>Hearty welcome to Diabetes Free Forever & shared inspiring success stories</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <Checkbox
                  checked={checklist.medicalHistory}
                  onCheckedChange={(c) => setChecklist((prev) => ({ ...prev, medicalHistory: !!c }))}
                  className="mt-0.5"
                />
                <span>Validated health history, current medications, insulin dosage, and dietary preferences</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <Checkbox
                  checked={checklist.introducedTeam}
                  onCheckedChange={(c) => setChecklist((prev) => ({ ...prev, introducedTeam: !!c }))}
                  className="mt-0.5"
                />
                <span>Introduced assigned Doctor, Dietitian, Fitness Coach, Mindset Coach & Mentor</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <Checkbox
                  checked={checklist.appGuidance}
                  onCheckedChange={(c) => setChecklist((prev) => ({ ...prev, appGuidance: !!c }))}
                  className="mt-0.5"
                />
                <span>Assisted with Mobile App install, glucose sensor setup, and 1st consultation schedule</span>
              </label>
            </div>
          </div>

          {/* Patient Sentiment */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Patient Sentiment & Readiness</Label>
            <Select value={sentiment} onValueChange={setSentiment}>
              <SelectTrigger className="h-9 rounded-xl text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="excited" className="text-xs">
                  🌟 Highly Motivated & Excited for Reversal
                </SelectItem>
                <SelectItem value="reassured" className="text-xs">
                  🤝 Reassured (Had initial doubts, now clear)
                </SelectItem>
                <SelectItem value="anxious" className="text-xs">
                  ⚠️ Anxious / Needs frequent follow-up reassurance
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bonding Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Telecaller Bonding Notes & Next Steps</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter bonding dialogue notes, family support context, diet notes..."
              className="rounded-xl text-xs resize-none"
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
            onClick={handleFinish}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Complete Welcome Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
