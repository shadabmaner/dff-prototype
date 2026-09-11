"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  Smartphone,
  TrendingUp,
  Award,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CampReminderModal, type CampReminderData } from "@/components/telecaller/camp-reminder-modal"
import { CampCallLogModal } from "@/components/telecaller/camp-call-log-modal"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"

interface CampPatientDetail {
  id: string
  name: string
  phone: string
  email: string
  city: string
  protocol: string
  tenureDays: number
  clinicalImprovement: string
  campLocation: string
  status: "eligible" | "reminder_sent" | "call_logged" | "seat_reserved"
  callNotes?: string
  remindersDispatched?: string[]
}

const MOCK_CAMP_PATIENT: CampPatientDetail = {
  id: "CP-301",
  name: "Harishchandra Mehta",
  phone: "+91 98210 55432",
  email: "harishchandra.m@example.com",
  city: "Mumbai",
  protocol: "DFF VIP Annual Reversal Care",
  tenureDays: 110,
  clinicalImprovement: "HbA1c: 9.1% → 6.9% (-4.5 kg, Insulin completely stopped)",
  campLocation: "Lonavala Wellness Retreat (The Dukes Retreat)",
  status: "eligible",
}

export default function TelecallerCampBoostDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ? decodeURIComponent(params.id) : "CP-301"

  const [patient, setPatient] = React.useState<CampPatientDetail>({
    ...MOCK_CAMP_PATIENT,
    id,
    name: id === "CP-302" ? "Sunanda Kadam" : id === "CP-303" ? "Ashok Singhania" : "Harishchandra Mehta",
    status: id === "CP-303" ? "seat_reserved" : id === "CP-302" ? "reminder_sent" : "eligible",
  })

  const [isReminderOpen, setIsReminderOpen] = React.useState(false)
  const [isCallLogOpen, setIsCallLogOpen] = React.useState(false)

  const handleSendReminder = (_patientId: string, data: CampReminderData) => {
    setPatient((prev) => ({
      ...prev,
      status: "reminder_sent",
      campLocation: data.location,
      remindersDispatched: [
        data.channels.whatsapp && "WhatsApp Brochure",
        data.channels.mobileApp && "Mobile App Push Card",
      ].filter(Boolean) as string[],
    }))
  }

  const handleCompleteCall = (_patientId: string, log: any) => {
    setPatient((prev) => ({
      ...prev,
      status: log.status === "seat_reserved" ? "seat_reserved" : "call_logged",
      callNotes: log.notes,
    }))
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/telecaller/residential-camp">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {patient.name}
              </h1>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold text-xs">
                {patient.id}
              </Badge>
              {patient.status === "seat_reserved" ? (
                <Badge className="bg-purple-100 text-purple-900 font-bold text-xs">
                  🌟 Seat Reserved (₹35K)
                </Badge>
              ) : patient.status === "reminder_sent" ? (
                <Badge className="bg-blue-100 text-blue-800 font-bold text-xs">
                  Reminders Sent
                </Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Eligible (&gt;90 Days)
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {patient.phone} · {patient.email} · {patient.city} · {patient.protocol}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <TelecallerRoleHeaderBadge />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsReminderOpen(true)}
            className="h-9 rounded-xl text-xs font-bold border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Initiate Camp Reminder
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCallLogOpen(true)}
            className="h-9 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-md"
          >
            <PhoneCall className="mr-1.5 h-4 w-4" />
            Log Boosting Call
          </Button>
        </div>
      </div>

      {/* Clinical Milestone Progress */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-purple-200 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Protocol Tenure</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{patient.tenureDays} Days</p>
          <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold mt-1">
            Eligible for Reversal Booster
          </Badge>
        </Card>

        <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Clinical Achievement</p>
          <p className="text-base font-bold text-slate-900 mt-1">{patient.clinicalImprovement}</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">Ready for 7-Day Residential Detox</p>
        </Card>

        <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Retreat Venue</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{patient.campLocation}</p>
          <p className="text-[11px] text-purple-700 font-bold mt-1">Special Booster Fee: ₹35,000</p>
        </Card>
      </div>

      {/* Call History & Outreach Notes */}
      <Card className="border border-slate-200 bg-white p-6 rounded-2xl shadow-sm space-y-3">
        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600" />
          Retreat Outreach Log & Activity
        </CardTitle>

        {patient.callNotes ? (
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">Latest Call Summary</span>
              <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold">
                {patient.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-700 italic">"{patient.callNotes}"</p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No boost phone call logged yet. Click "Log Boosting Call" to record the conversation with the patient.
          </p>
        )}
      </Card>

      {/* Modals */}
      <CampReminderModal
        open={isReminderOpen}
        onOpenChange={setIsReminderOpen}
        patientId={patient.id}
        patientName={patient.name}
        patientPhone={patient.phone}
        tenureDays={patient.tenureDays}
        programName={patient.protocol}
        clinicalImprovement={patient.clinicalImprovement}
        onSend={handleSendReminder}
      />

      <CampCallLogModal
        open={isCallLogOpen}
        onOpenChange={setIsCallLogOpen}
        patientId={patient.id}
        patientName={patient.name}
        patientPhone={patient.phone}
        campName={patient.campLocation}
        onComplete={handleCompleteCall}
      />
    </div>
  )
}
