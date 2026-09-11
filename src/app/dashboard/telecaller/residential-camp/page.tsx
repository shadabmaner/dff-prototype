"use client"

import * as React from "react"
import { Sparkles, PhoneCall, CheckCircle2, Clock, MapPin, ArrowLeft, Search, Filter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangeFilter, type DateRangeFilterValue } from "@/components/shared/date-range-filter"
import { CampReminderModal, type CampReminderData } from "@/components/telecaller/camp-reminder-modal"
import { CampCallLogModal } from "@/components/telecaller/camp-call-log-modal"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"

interface CampPatient {
  id: string
  name: string
  phone: string
  protocol: string
  tenureDays: number
  clinicalImprovement: string
  campLocation: string
  status: "eligible" | "reminder_sent" | "call_logged" | "seat_reserved"
  city: string
  callNotes?: string
}

const INITIAL_CAMP_PATIENTS: CampPatient[] = [
  {
    id: "CP-301",
    name: "Harishchandra Mehta",
    phone: "+91 98210 55432",
    protocol: "DFF VIP Annual Reversal Care",
    tenureDays: 110,
    clinicalImprovement: "HbA1c: 9.1 → 6.9% (-4.5 kg, Insulin stopped)",
    campLocation: "Lonavala Wellness Retreat",
    status: "eligible",
    city: "Mumbai",
  },
  {
    id: "CP-302",
    name: "Sunanda Kadam",
    phone: "+91 98450 12908",
    protocol: "DFF Standard Care (6 Months)",
    tenureDays: 98,
    clinicalImprovement: "HbA1c: 8.4 → 6.7% (Fasting 104 mg/dL)",
    campLocation: "Lonavala Wellness Retreat",
    status: "reminder_sent",
    city: "Pune",
  },
  {
    id: "CP-303",
    name: "Ashok Singhania",
    phone: "+91 98190 77654",
    protocol: "DFF VIP Annual Reversal Care",
    tenureDays: 125,
    clinicalImprovement: "Off 40 units Lantus insulin, HbA1c 6.5%",
    campLocation: "Mahabaleshwar Mountain Healing Camp",
    status: "seat_reserved",
    city: "Delhi",
    callNotes: "Seat reserved @ ₹35,000. Flight to Pune booked for Oct 12.",
  },
  {
    id: "CP-304",
    name: "Vandana Deshpande",
    phone: "+91 98811 44321",
    protocol: "DFF Standard Care",
    tenureDays: 104,
    clinicalImprovement: "HbA1c: 8.8 → 7.1% (-3.8 kg)",
    campLocation: "Lonavala Wellness Retreat",
    status: "eligible",
    city: "Nagpur",
  },
  {
    id: "CP-305",
    name: "Kishore Rao",
    phone: "+91 98320 55112",
    protocol: "DFF VIP Annual Reversal Care",
    tenureDays: 130,
    clinicalImprovement: "HbA1c: 7.9 → 6.2% (Reversal Milestone)",
    campLocation: "Goa Reversal & Longevity Camp",
    status: "reminder_sent",
    city: "Bengaluru",
  },
]

export default function TelecallerResidentialCampPage() {
  const [patients, setPatients] = React.useState<CampPatient[]>(INITIAL_CAMP_PATIENTS)
  const [tab, setTab] = React.useState("all")
  const [search, setSearch] = React.useState("")
  const [dateFilter, setDateFilter] = React.useState<DateRangeFilterValue>({
    preset: "last_7_days",
    label: "Last 7 Days",
  })

  const [activePatient, setActivePatient] = React.useState<CampPatient | null>(null)
  const [isReminderOpen, setIsReminderOpen] = React.useState(false)
  const [isCallLogOpen, setIsCallLogOpen] = React.useState(false)

  const handleSendReminder = (patientId: string, data: CampReminderData) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: "reminder_sent",
              campLocation: data.location.split("(")[0].trim(),
            }
          : p
      )
    )
  }

  const handleCompleteCall = (patientId: string, log: any) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: log.status === "seat_reserved" ? "seat_reserved" : "call_logged",
              callNotes: log.notes,
            }
          : p
      )
    )
  }

  const filteredPatients = React.useMemo(() => {
    return patients.filter((p) => {
      const matchTab =
        tab === "all"
          ? true
          : tab === "eligible"
          ? p.status === "eligible"
          : tab === "reminder_sent"
          ? p.status === "reminder_sent"
          : tab === "seat_reserved"
          ? p.status === "seat_reserved"
          : true

      const term = search.trim().toLowerCase()
      const matchSearch = term
        ? p.name.toLowerCase().includes(term) || p.phone.includes(term) || p.city.toLowerCase().includes(term)
        : true

      return matchTab && matchSearch
    })
  }, [patients, tab, search])

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/telecaller">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Residential Camp Booster Queue
            </h1>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold text-xs">
              &gt;3 Months Patient Reversal Boost
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            DFF Standard & VIP care patients eligible for 7-Day Residential Reversal Retreats (₹35,000 Booster)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          <TelecallerRoleHeaderBadge />
        </div>
      </div>

      {/* Main Table */}
      <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
              <TabsList className="bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="all" className="text-xs font-bold rounded-lg">
                  All ({patients.length})
                </TabsTrigger>
                <TabsTrigger value="eligible" className="text-xs font-bold rounded-lg">
                  Eligible ({patients.filter((p) => p.status === "eligible").length})
                </TabsTrigger>
                <TabsTrigger value="reminder_sent" className="text-xs font-bold rounded-lg">
                  Reminders Sent ({patients.filter((p) => p.status === "reminder_sent").length})
                </TabsTrigger>
                <TabsTrigger value="seat_reserved" className="text-xs font-bold rounded-lg">
                  Seats Reserved ({patients.filter((p) => p.status === "seat_reserved").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search patient or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs rounded-xl"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="text-xs font-bold text-slate-700">Patient Details</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Protocol & Tenure</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Clinical Milestone</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Outreach Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/60">
                  <TableCell>
                    <p className="text-xs font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.phone} · {item.city}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-slate-800">{item.protocol}</p>
                    <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold mt-0.5">
                      {item.tenureDays} Days Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-emerald-700">{item.clinicalImprovement}</p>
                    <p className="text-[10px] text-slate-500">Venue: {item.campLocation}</p>
                  </TableCell>
                  <TableCell>
                    {item.status === "seat_reserved" ? (
                      <Badge className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold">
                        🌟 Seat Reserved (₹35K)
                      </Badge>
                    ) : item.status === "reminder_sent" ? (
                      <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold">
                        WhatsApp & App Sent
                      </Badge>
                    ) : item.status === "call_logged" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Call Logged
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-200 text-slate-700 text-[10px] font-semibold">
                        Eligible for Boost
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActivePatient(item)
                          setIsReminderOpen(true)
                        }}
                        className="h-8 text-xs font-bold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                        Send Reminder
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          setActivePatient(item)
                          setIsCallLogOpen(true)
                        }}
                        className="h-8 text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-sm"
                      >
                        <PhoneCall className="mr-1 h-3.5 w-3.5" />
                        Log Call
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {activePatient && (
        <CampReminderModal
          open={isReminderOpen}
          onOpenChange={setIsReminderOpen}
          patientId={activePatient.id}
          patientName={activePatient.name}
          patientPhone={activePatient.phone}
          tenureDays={activePatient.tenureDays}
          programName={activePatient.protocol}
          clinicalImprovement={activePatient.clinicalImprovement}
          onSend={handleSendReminder}
        />
      )}

      {activePatient && (
        <CampCallLogModal
          open={isCallLogOpen}
          onOpenChange={setIsCallLogOpen}
          patientId={activePatient.id}
          patientName={activePatient.name}
          patientPhone={activePatient.phone}
          campName={activePatient.campLocation}
          onComplete={handleCompleteCall}
        />
      )}
    </div>
  )
}
