"use client"

import * as React from "react"
import { Users, UserCheck, Stethoscope, Apple, Dumbbell, Brain, Award, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export interface CareTeamData {
  doctor: string
  dietitian: string
  fitnessCoach: string
  mindsetCoach: string
  mentor: string
}

interface CareTeamAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  programName?: string
  currentCareTeam?: Partial<CareTeamData>
  onSave: (patientId: string, team: CareTeamData) => void
}

const DOCTORS = [
  "Dr. Ritu Agarwal (Chief Diabetologist)",
  "Dr. Anil Deshpande (Senior Physician)",
  "Dr. Priya Shah (Endocrinologist)",
  "Dr. Sanjay Verma (Reversal Specialist)",
]

const DIETITIANS = [
  "Sneha Phadke (Senior Clinical Nutritionist)",
  "Pooja Sharma (Metabolic Dietitian)",
  "Neha Kulkarni (Diabetes Diet Lead)",
  "Aarti Patil (Renal & Diabetic Dietitian)",
]

const FITNESS_COACHES = [
  "Rahul Patil (Strength & Functional Coach)",
  "Vikram Shinde (Metabolic Conditioning Lead)",
  "Amit Kadam (Postural & Mobility Trainer)",
  "Pooja Nair (Yoga & Low-Impact Coach)",
]

const MINDSET_COACHES = [
  "Dr. Manisha Joshi (Behavioral Health Specialist)",
  "Aarav Mehta (Habit & Lifestyle Coach)",
  "Shalini Iyer (Stress & Sleep Therapist)",
]

const MENTORS = [
  "Kavita Kulkarni (Patient Mentor · 4 Yrs Insulin Free)",
  "Suresh Sawant (Patient Mentor · 3 Yrs Reversed)",
  "Dilip Joshi (Patient Mentor · 2 Yrs HbA1c 5.8%)",
]

export function CareTeamAssignmentModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  programName = "Diabetes Free Forever (DFF)",
  currentCareTeam,
  onSave,
}: CareTeamAssignmentModalProps) {
  const [doctor, setDoctor] = React.useState(currentCareTeam?.doctor || DOCTORS[0])
  const [dietitian, setDietitian] = React.useState(currentCareTeam?.dietitian || DIETITIANS[0])
  const [fitnessCoach, setFitnessCoach] = React.useState(currentCareTeam?.fitnessCoach || FITNESS_COACHES[0])
  const [mindsetCoach, setMindsetCoach] = React.useState(currentCareTeam?.mindsetCoach || MINDSET_COACHES[0])
  const [mentor, setMentor] = React.useState(currentCareTeam?.mentor || MENTORS[0])

  React.useEffect(() => {
    if (open) {
      setDoctor(currentCareTeam?.doctor || DOCTORS[0])
      setDietitian(currentCareTeam?.dietitian || DIETITIANS[0])
      setFitnessCoach(currentCareTeam?.fitnessCoach || FITNESS_COACHES[0])
      setMindsetCoach(currentCareTeam?.mindsetCoach || MINDSET_COACHES[0])
      setMentor(currentCareTeam?.mentor || MENTORS[0])
    }
  }, [open, currentCareTeam])

  const handleConfirm = () => {
    const team: CareTeamData = {
      doctor,
      dietitian,
      fitnessCoach,
      mindsetCoach,
      mentor,
    }
    onSave(patientId, team)
    toast.success(`Care Team successfully assigned to ${patientName}!`, {
      description: "5 care specialists mapped. Patient is now ready for Welcome Call.",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100/70 text-[#1F56A3]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Step 1: Care Team Assignment
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Map the 5-pillar clinical and support care team before conducting the Welcome Call.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Patient Header Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div>
            <p className="text-xs font-bold text-slate-900">{patientName}</p>
            <p className="text-[11px] text-slate-500">ID: {patientId} · {programName}</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
            <ShieldCheck className="mr-1 h-3 w-3" />
            5 Specialists
          </Badge>
        </div>

        {/* Team Selectors */}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          {/* 1. Doctor */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
              1. Primary Doctor (Diabetologist)
            </Label>
            <Select value={doctor} onValueChange={setDoctor}>
              <SelectTrigger className="h-10 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {DOCTORS.map((doc) => (
                  <SelectItem key={doc} value={doc} className="text-xs">
                    {doc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Dietitian */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Apple className="h-3.5 w-3.5 text-emerald-600" />
              2. Clinical Dietitian
            </Label>
            <Select value={dietitian} onValueChange={setDietitian}>
              <SelectTrigger className="h-10 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Select Dietitian" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {DIETITIANS.map((d) => (
                  <SelectItem key={d} value={d} className="text-xs">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Fitness Coach */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5 text-amber-600" />
              3. Fitness & Mobility Coach
            </Label>
            <Select value={fitnessCoach} onValueChange={setFitnessCoach}>
              <SelectTrigger className="h-10 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Select Fitness Coach" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {FITNESS_COACHES.map((fc) => (
                  <SelectItem key={fc} value={fc} className="text-xs">
                    {fc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4. Mindset Coach */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-purple-600" />
              4. Mindset & Stress Coach
            </Label>
            <Select value={mindsetCoach} onValueChange={setMindsetCoach}>
              <SelectTrigger className="h-10 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Select Mindset Coach" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {MINDSET_COACHES.map((mc) => (
                  <SelectItem key={mc} value={mc} className="text-xs">
                    {mc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 5. Patient Mentor */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-indigo-600" />
              5. Patient Mentor (Peer Guide)
            </Label>
            <Select value={mentor} onValueChange={setMentor}>
              <SelectTrigger className="h-10 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Select Mentor" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {MENTORS.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            onClick={handleConfirm}
            className="rounded-xl bg-[#1F56A3] hover:bg-[#192B42] text-white text-xs font-bold shadow-md"
          >
            <UserCheck className="mr-1.5 h-4 w-4" />
            Save & Confirm Care Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
