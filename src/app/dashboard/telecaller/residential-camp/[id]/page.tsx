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
  IndianRupee,
  Send,
  User,
  ShieldCheck,
  ExternalLink,
  Phone,
  Mail,
  Building,
  Check,
  CreditCard,
  MessageSquare,
  AlertCircle,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"
import {
  useResidentialCampStore,
  type CampPatient,
} from "@/store/residential-camp-store"
import { CampBulkNotifyModal } from "@/components/telecaller/camp-bulk-notify-modal"
import { CampCallLogModal } from "@/components/telecaller/camp-call-log-modal"
import { CampPaymentModal } from "@/components/telecaller/camp-payment-modal"
import { toast } from "sonner"

export default function TelecallerCampBoostDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ? decodeURIComponent(params.id) : "CP-301"

  const { patients, defaultEvent, logCall, getPatientById } = useResidentialCampStore()

  // Fetch patient from store, or fallback to first patient
  const patient = getPatientById(id) || patients.find((p) => p.id === id) || patients[0]

  const [isNotifyOpen, setIsNotifyOpen] = React.useState(false)
  const [isCallLogOpen, setIsCallLogOpen] = React.useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false)

  if (!patient) {
    return (
      <div className="p-8 min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-semibold text-slate-700">Patient not found</p>
        <Link href="/dashboard/telecaller/residential-camp">
          <Button variant="outline">Back to Queue</Button>
        </Link>
      </div>
    )
  }

  const isBoost = patient.category === "boost_and_payment"

  const handleCallComplete = (patientId: string, log: any) => {
    logCall(patientId, {
      callerName: "Divya Rao",
      callerRole: "Residential Camp Booster",
      duration: `${log.durationMins} mins`,
      outcome: log.status === "seat_reserved" ? "Seat Reserved @ ₹35,000" : log.status,
      notes: log.notes,
    })
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50 rounded-[50px]">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/telecaller/residential-camp">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {patient.name}
              </h1>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold text-xs">
                {patient.id}
              </Badge>
              {isBoost ? (
                <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
                  ⚡ Add-on Camp Booster (₹35K Fee)
                </Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs">
                  🎁 Pre-Paid VIP Retreat (₹0 Fee)
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Assigned Telecaller: <strong className="text-slate-800">{patient.assignedCaller}</strong> · Specialty:{" "}
              <strong className="text-slate-800">{patient.specialty}</strong>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <TelecallerRoleHeaderBadge />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNotifyOpen(true)}
            className="h-9 rounded-xl text-xs font-bold border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Send Camp Notification
          </Button>

          {isBoost && patient.paymentSummary.campPaymentStatus !== "paid" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPaymentOpen(true)}
              className="h-9 rounded-xl text-xs font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50 shadow-sm"
            >
              <IndianRupee className="mr-1 h-3.5 w-3.5 text-emerald-600" />
              Pay Link / Collect
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setIsCallLogOpen(true)}
            className="h-9 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-md"
          >
            <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
            Log Booster Call
          </Button>
        </div>
      </div>

      {/* 1. Basic Patient Information (Clean, No Dense Clinical Charts) */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Patient Profile Card */}
        <Card className="border border-slate-200/90 bg-white/95 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-500" />
              Patient Details
            </span>
            <Badge variant="outline" className="text-[10px] font-bold text-slate-600">
              {patient.tenureDays} Days in Care
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Patient ID:</span>
              <span className="font-mono font-bold text-slate-900">{patient.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mobile Phone:</span>
              <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-600" />
                {patient.phone}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email Address:</span>
              <span className="text-slate-800 truncate max-w-[170px]" title={patient.email}>
                {patient.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">City / Location:</span>
              <span className="font-bold text-slate-800">{patient.city}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500">Active Program:</span>
              <span className="font-bold text-purple-900 text-right">{patient.program}</span>
            </div>
          </div>
        </Card>

        {/* 2. Concise Payment Status (Short Manner) */}
        <Card className="border border-slate-200/90 bg-white/95 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
              Concise Payment Status
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Short Summary</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Enrolled Program:</span>
              <span className="font-bold text-slate-900 truncate max-w-[160px]">
                {patient.paymentSummary.programEnrolled}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Base Program Paid:</span>
              <span className="font-bold text-emerald-700">
                ₹{patient.paymentSummary.programPaid.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 mt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Residential Retreat Status:
              </span>
              {patient.paymentSummary.campPaymentStatus === "included_prepaid" ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Pre-Paid in VIP Package (₹0 Balance)
                </div>
              ) : patient.paymentSummary.campPaymentStatus === "paid" ? (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    Seat Reserved & Paid: ₹{patient.paymentSummary.paidAmount.toLocaleString("en-IN")}
                  </div>
                  {patient.paymentSummary.transactionRef && (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Ref: {patient.paymentSummary.transactionRef}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">
                    Add-on Fee: ₹35,000 Pending
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsPaymentOpen(true)}
                    className="h-6 px-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg"
                  >
                    Collect Fee
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Target Retreat & Milestone Highlight */}
        <Card className="border border-purple-200 bg-gradient-to-br from-purple-50/80 via-white to-slate-50 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              Target Retreat Event
            </span>
            <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold">
              Sept 2026 Batch
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <p className="text-[11px] text-slate-500">Event Dates & Venue:</p>
              <p className="font-bold text-slate-900 mt-0.5">{defaultEvent.dates}</p>
              <p className="text-slate-700 text-[11px] mt-0.5">{defaultEvent.locationName}</p>
              <a
                href={defaultEvent.mapLink}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
              >
                Open Venue Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="pt-2 border-t border-purple-100">
              <span className="text-[11px] text-slate-500">Clinical Milestone Achieved:</span>
              <p className="font-bold text-emerald-700 mt-0.5">{patient.clinicalMilestone}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Multi-Agent Call History (Who called, when, welcome call notes, follow-up notes) */}
      <Card className="border border-slate-200/90 bg-white/95 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-700" />
                Multi-Agent Call History & Team Touchpoints
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Complete log of calls made by Welcome Call Specialists, Clinical Doctors, and Camp Boosters for this patient.
              </CardDescription>
            </div>

            <Button
              size="sm"
              onClick={() => setIsCallLogOpen(true)}
              className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl h-8 px-3 shadow-sm self-start sm:self-auto"
            >
              <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
              Log New Call
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {patient.callHistory && patient.callHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="text-xs font-bold text-slate-700 pl-6">Caller & Role</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Call Type</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Date & Time</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Duration</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Outcome</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 pr-6">Call Notes & Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.callHistory.map((call) => (
                  <TableRow key={call.id} className="hover:bg-slate-50/60">
                    <TableCell className="pl-6">
                      <p className="text-xs font-bold text-slate-900">{call.callerName}</p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold mt-0.5 ${
                          call.callerRole.includes("Welcome")
                            ? "border-emerald-200 text-emerald-800 bg-emerald-50"
                            : call.callerRole.includes("Clinical") || call.callerRole.includes("Doctor")
                            ? "border-blue-200 text-blue-800 bg-blue-50"
                            : "border-purple-200 text-purple-800 bg-purple-50"
                        }`}
                      >
                        {call.callerRole}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-800">
                      {call.callType}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {call.date}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">
                      {call.duration}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] font-bold ${
                          call.outcome.includes("Reserved") || call.outcome.includes("Confirmed")
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {call.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 max-w-md pr-6 leading-relaxed">
                      "{call.notes}"
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No previous calls logged yet for this patient. Click "Log Booster Call" to record the first conversation.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Dispatched Camp Notifications History */}
      <Card className="border border-slate-200/90 bg-white/95 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="h-4 w-4 text-purple-700" />
                Dispatched Camp Notifications & Reminders
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Record of event dates, venue links, and WhatsApp / SMS brochures delivered to the patient.
              </CardDescription>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsNotifyOpen(true)}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-xl h-8 px-3 shadow-sm self-start sm:self-auto"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Dispatch New Notification
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {patient.notificationHistory && patient.notificationHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="text-xs font-bold text-slate-700 pl-6">Dispatched At</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Retreat Dates</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Venue & Map Link</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Fee Mentioned</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700">Channels</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 pr-6">Message Excerpt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.notificationHistory.map((notif) => (
                  <TableRow key={notif.id} className="hover:bg-slate-50/60">
                    <TableCell className="text-xs font-mono text-slate-500 pl-6">
                      {notif.sentAt}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-purple-900">
                      {notif.eventDates}
                    </TableCell>
                    <TableCell className="text-xs">
                      <p className="font-semibold text-slate-800">{notif.locationName}</p>
                      <a
                        href={notif.mapLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 underline flex items-center gap-1 font-bold"
                      >
                        Maps Link <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] font-bold ${
                          notif.feeMentioned.includes("₹0") || notif.feeMentioned.toLowerCase().includes("included")
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {notif.feeMentioned}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {notif.channels.map((ch) => (
                          <Badge key={ch} variant="outline" className="text-[10px] text-slate-600">
                            {ch}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-sm pr-6 truncate" title={notif.message}>
                      {notif.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No notifications dispatched yet. Click "Send Camp Notification" to share event dates and maps link.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CampBulkNotifyModal
        open={isNotifyOpen}
        onOpenChange={setIsNotifyOpen}
        selectedPatients={[patient]}
      />

      <CampCallLogModal
        open={isCallLogOpen}
        onOpenChange={setIsCallLogOpen}
        patientId={patient.id}
        patientName={patient.name}
        patientPhone={patient.phone}
        campName={defaultEvent.title}
        onComplete={handleCallComplete}
      />

      <CampPaymentModal
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        patient={patient}
      />
    </div>
  )
}
