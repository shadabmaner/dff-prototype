"use client"

import * as React from "react"
import { Layers, Stethoscope, IndianRupee, CheckCircle2, AlertCircle, ArrowRight, Calendar, UserCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export interface ProgramMappingResult {
  programName: string
  totalFee: number
  enrollmentFeeDeducted: number
  netBalanceDue: number
  installmentsCount: number
  installmentSchedule: { installmentNum: number; amount: number; dueDays: number }[]
  notes: string
}

interface ProgramMappingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  doctorName?: string
  doctorRecommendation?: {
    program: string
    fee: number
    notes: string
  }
  enrollmentFeePaid?: number
  onConfirm: (patientId: string, mapping: ProgramMappingResult) => void
}

const PROGRAM_OPTIONS = [
  {
    id: "prog_25k",
    name: "DFF Core Reversal Plan (3 Months)",
    fee: 24999,
    description: "Standard dietary protocol, basic monitoring, 1 doctor & dietitian review/month.",
  },
  {
    id: "prog_50k",
    name: "DFF Intensive Care & Reversal Plan (6 Months)",
    fee: 50000,
    description: "Doctor-recommended. Continuous glucose monitoring, 24/7 dedicated clinical care.",
    isDoctorRecommended: true,
  },
  {
    id: "prog_100k",
    name: "DFF VIP Annual Reversal & Longevity Care (12 Months)",
    fee: 100000,
    description: "All-inclusive VIP suite, personalized physician access, free retreat pass.",
  },
]

export function ProgramMappingModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  doctorName = "Dr. Ritu Agarwal",
  doctorRecommendation = {
    program: "DFF Intensive Care & Reversal Plan (6 Months)",
    fee: 50000,
    notes: "Patient has 12-year HbA1c 8.9 history. Needs intensive 6-month continuous care. Hesitant about upfront 50K; counseling required.",
  },
  enrollmentFeePaid = 2499,
  onConfirm,
}: ProgramMappingModalProps) {
  const [selectedProgId, setSelectedProgId] = React.useState("prog_50k")
  const [installmentsCount, setInstallmentsCount] = React.useState(3)
  const [notes, setNotes] = React.useState(
    "Coordinated with patient & Dr. Ritu. Patient agreed on 6-month Intensive plan with 3-phase installment payment."
  )

  const selectedProgram = PROGRAM_OPTIONS.find((p) => p.id === selectedProgId) || PROGRAM_OPTIONS[1]
  const netBalanceDue = Math.max(0, selectedProgram.fee - enrollmentFeePaid)

  const installmentSchedule = React.useMemo(() => {
    if (installmentsCount === 1) {
      return [{ installmentNum: 1, amount: netBalanceDue, dueDays: 0 }]
    }
    if (installmentsCount === 2) {
      const p1 = Math.round(netBalanceDue / 2)
      return [
        { installmentNum: 1, amount: p1, dueDays: 0 },
        { installmentNum: 2, amount: netBalanceDue - p1, dueDays: 30 },
      ]
    }
    const p1 = Math.round(netBalanceDue * 0.4)
    const p2 = Math.round(netBalanceDue * 0.3)
    const p3 = netBalanceDue - (p1 + p2)
    return [
      { installmentNum: 1, amount: p1, dueDays: 0 },
      { installmentNum: 2, amount: p2, dueDays: 30 },
      { installmentNum: 3, amount: p3, dueDays: 60 },
    ]
  }, [installmentsCount, netBalanceDue])

  const handleSave = () => {
    onConfirm(patientId, {
      programName: selectedProgram.name,
      totalFee: selectedProgram.fee,
      enrollmentFeeDeducted: enrollmentFeePaid,
      netBalanceDue,
      installmentsCount,
      installmentSchedule,
      notes,
    })
    toast.success(`Program mapped successfully for ${patientName}!`, {
      description: `${selectedProgram.name} confirmed. ₹${enrollmentFeePaid.toLocaleString("en-IN")} token credited. Net balance: ₹${netBalanceDue.toLocaleString("en-IN")}.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100/70 text-amber-800">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Program Assignment & Enrollment Reconciliation
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Coordinate between doctor's clinical assessment and patient's budget to finalize program and structure recovery.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Doctor Assessment Note Banner */}
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1F56A3] flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4" />
              Doctor Assessment Recommendation · {doctorName}
            </span>
            <Badge className="bg-blue-100 text-[#1F56A3] border-blue-200 text-[10px] font-bold">
              Token Paid: ₹{enrollmentFeePaid.toLocaleString("en-IN")}
            </Badge>
          </div>
          <p className="text-xs text-slate-700 italic leading-relaxed">
            "{doctorRecommendation.notes}"
          </p>
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {/* Program Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Agreed Program
            </Label>
            <RadioGroup value={selectedProgId} onValueChange={setSelectedProgId} className="space-y-2">
              {PROGRAM_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedProgId === opt.id
                      ? "border-[#1F56A3] bg-blue-50/40 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={opt.id} className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{opt.name}</p>
                        {opt.isDoctorRecommended && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] font-bold">
                            Doctor Pick
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    ₹{opt.fee.toLocaleString("en-IN")}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Mathematical Reconciliation Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Fee Reconciliation
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Selected Plan Total Fee:</span>
                <span className="font-semibold text-slate-900">₹{selectedProgram.fee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Less Initial Enrollment Fee (Credited):</span>
                <span className="font-semibold">- ₹{enrollmentFeePaid.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                <span>Net Pending Balance for Recovery:</span>
                <span className="text-blue-700">₹{netBalanceDue.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Installment Structure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Installment Structure
              </Label>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={installmentsCount === num ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInstallmentsCount(num)}
                    className={`h-7 px-2.5 text-[11px] rounded-lg ${
                      installmentsCount === num ? "bg-[#1F56A3] text-white" : "border-slate-200"
                    }`}
                  >
                    {num} {num === 1 ? "Full Pay" : "Phases"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {installmentSchedule.map((inst) => (
                <div
                  key={inst.installmentNum}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm space-y-0.5"
                >
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Phase {inst.installmentNum} {inst.dueDays === 0 ? "(Due Now)" : `(+${inst.dueDays}d)`}
                  </p>
                  <p className="text-sm font-bold text-slate-900">₹{inst.amount.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coordination Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Coordination & Agreement Notes</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record coordination details between patient and doctor..."
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
            className="rounded-xl bg-[#1F56A3] hover:bg-[#192B42] text-white text-xs font-bold shadow-md"
          >
            <UserCheck className="mr-1.5 h-4 w-4" />
            Confirm Program & Activate Recovery
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
