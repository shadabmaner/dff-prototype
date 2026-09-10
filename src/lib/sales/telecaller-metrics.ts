import type { Telecaller } from "@/hooks/use-telecallers"

export type TelecallerPatient = {
  id: string
  name: string
  phone: string
  email?: string
  status: string
  specialty?: string
  source?: string
  lastContactedAt?: string
  convertedAt?: string
}

export type TelecallerCallLog = {
  id: string
  patientName: string
  patientPhone: string
  callType: "outbound" | "inbound"
  outcome: "connected" | "interested" | "converted" | "follow_up" | "not_connected" | "busy"
  durationSeconds: number
  durationFormatted: string
  calledAt: string
  notes?: string
}

export type TelecallerWeeklyTrend = {
  day: string
  outbound: number
  inbound: number
  connected: number
  conversions: number
}

export type TelecallerOutcomeBreakdown = {
  name: string
  value: number
  color: string
}

export type TelecallerPerformance = {
  patientCount: number
  totalCalls: number
  outboundCalls: number
  inboundCalls: number
  contactedCount: number
  connectedCalls: number
  conversions: number
  conversionRate: number
  avgCallsPerDay: number
  avgCallDurationSeconds: number
  joinedAt: string
  weeklyTrends: TelecallerWeeklyTrend[]
  outcomesBreakdown: TelecallerOutcomeBreakdown[]
  recentCallLogs: TelecallerCallLog[]
}

const PATIENT_NAMES = [
  "Aarav Mehta",
  "Neha Sharma",
  "Vikram Singh",
  "Priya Patel",
  "Rahul Kumar",
  "Anjali Gupta",
  "Suresh Reddy",
  "Meera Joshi",
  "Amit Tiwari",
  "Kavita Nair",
  "Rohan Desai",
  "Sneha Iyer",
  "Arjun Malhotra",
  "Divya Rao",
  "Karan Gill",
  "Pooja Verma",
  "Rajesh Kulkarni",
  "Deepika Padukone",
  "Manoj Bajpayee",
  "Sunita Chauhan"
]

const SPECIALTIES = ["Weight Management", "Diabetes Free Forever", "Thyroid Free Forever", "PCOS Care", "Hypertension Control"]
const SOURCES = ["Facebook", "Instagram", "Website", "App", "Referral", "Google Ads"]
const STATUSES = ["new", "contacted", "follow_up", "interested", "converted", "not_connected"]

const CALL_NOTES = [
  "Detailed discussion regarding lifestyle habits and medication schedule. Patient is receptive.",
  "Interested in 3-month reversal protocol. Requested callback on weekend.",
  "Booked consultation with chief dietitian. Sent confirmation via WhatsApp.",
  "Call was interrupted; promised to review onboarding brochure tonight.",
  "Discussed diabetes baseline HbA1c test reports. Very keen to proceed.",
  "Follow-up call regarding customized diet requirements.",
  "Patient confirmed payment for primary clinical assessment.",
  "Busy in a meeting, scheduled a callback tomorrow morning at 11 AM.",
  "Answered doubts regarding kit shipment and doctor follow-up frequency."
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

export function buildTelecallerCallLogs(telecaller: Pick<Telecaller, "id" | "name">, count = 12): TelecallerCallLog[] {
  const hash = hashString(telecaller.id)
  const outcomes: TelecallerCallLog["outcome"][] = ["converted", "interested", "follow_up", "connected", "not_connected", "busy"]

  return Array.from({ length: count }, (_, index) => {
    const itemHash = hash + index * 23
    const patientName = PATIENT_NAMES[itemHash % PATIENT_NAMES.length]
    const outcome = outcomes[itemHash % outcomes.length]
    const isOutbound = (itemHash % 5) !== 0
    const durationSeconds = outcome === "not_connected" || outcome === "busy" ? 0 : 75 + (itemHash % 320)

    const date = new Date()
    date.setHours(date.getHours() - (index * 4 + (itemHash % 5)))

    return {
      id: `CALL-${telecaller.id.slice(0, 4)}-${1000 + index}`,
      patientName,
      patientPhone: `+91 98${String(10000000 + itemHash).slice(0, 8)}`,
      callType: isOutbound ? "outbound" : "inbound",
      outcome,
      durationSeconds,
      durationFormatted: formatDuration(durationSeconds),
      calledAt: date.toISOString(),
      notes: CALL_NOTES[itemHash % CALL_NOTES.length]
    }
  })
}

export function buildTelecallerPerformance(telecaller: Pick<Telecaller, "id" | "name">): TelecallerPerformance {
  const hash = hashString(telecaller.id)
  const patientCount = 14 + (hash % 26)
  const totalCalls = patientCount * (4 + (hash % 4))
  const outboundCalls = Math.round(totalCalls * 0.84)
  const inboundCalls = totalCalls - outboundCalls
  const connectedCalls = Math.round(totalCalls * (0.52 + (hash % 15) / 100))
  const contactedCount = Math.min(patientCount, Math.round(connectedCalls * 0.88))
  const conversions = Math.max(2, Math.round(contactedCount * (0.16 + (hash % 12) / 100)))
  const conversionRate = contactedCount > 0 ? Number(((conversions / contactedCount) * 100).toFixed(1)) : 0

  const joinedDate = new Date()
  joinedDate.setMonth(joinedDate.getMonth() - (4 + (hash % 14)))

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weeklyTrends: TelecallerWeeklyTrend[] = daysOfWeek.map((day, idx) => {
    const dayHash = hash + idx * 11
    const dayOutbound = 12 + (dayHash % 16)
    const dayInbound = 2 + (dayHash % 5)
    const dayConnected = Math.round((dayOutbound + dayInbound) * 0.65)
    const dayConversions = Math.round((dayHash % 4))
    return {
      day,
      outbound: dayOutbound,
      inbound: dayInbound,
      connected: dayConnected,
      conversions: dayConversions
    }
  })

  const outcomesBreakdown: TelecallerOutcomeBreakdown[] = [
    { name: "Converted", value: conversions, color: "#10b981" },
    { name: "Interested / Follow-up", value: Math.max(1, contactedCount - conversions), color: "#f59e0b" },
    { name: "Connected General", value: Math.max(1, connectedCalls - contactedCount), color: "#3b82f6" },
    { name: "Unreachable / Busy", value: Math.max(1, totalCalls - connectedCalls), color: "#f43f5e" }
  ]

  const recentCallLogs = buildTelecallerCallLogs(telecaller, 12)

  return {
    patientCount,
    totalCalls,
    outboundCalls,
    inboundCalls,
    contactedCount,
    connectedCalls,
    conversions,
    conversionRate,
    avgCallsPerDay: Number((totalCalls / 26).toFixed(1)),
    avgCallDurationSeconds: 165 + (hash % 60),
    joinedAt: joinedDate.toISOString(),
    weeklyTrends,
    outcomesBreakdown,
    recentCallLogs
  }
}

export function buildTelecallerPatients(
  telecaller: Pick<Telecaller, "id" | "name">,
  count?: number
): TelecallerPatient[] {
  const performance = buildTelecallerPerformance(telecaller)
  const total = count ?? performance.patientCount
  const hash = hashString(telecaller.id)

  return Array.from({ length: total }, (_, index) => {
    const itemHash = hash + index * 17
    const name = PATIENT_NAMES[itemHash % PATIENT_NAMES.length]
    const status = STATUSES[itemHash % STATUSES.length]
    const isConverted = status === "converted"

    const lastContacted = new Date()
    lastContacted.setDate(lastContacted.getDate() - (itemHash % 14))

    return {
      id: `PT-${telecaller.id.slice(0, 4)}-${1000 + index}`,
      name,
      phone: `+91 98${String(10000000 + itemHash).slice(0, 8)}`,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      status,
      specialty: SPECIALTIES[itemHash % SPECIALTIES.length],
      source: SOURCES[itemHash % SOURCES.length],
      lastContactedAt: lastContacted.toISOString(),
      convertedAt: isConverted ? lastContacted.toISOString() : undefined,
    }
  })
}

export type TelecallerRole = "lead_nurture" | "welcome_call" | "payment_recovery" | "residential_camp"

export function getRoleSpecializationLabel(role?: string): string {
  switch (role) {
    case "lead_nurture":
      return "Lead Nurture Specialist"
    case "welcome_call":
      return "Welcome Call Specialist"
    case "payment_recovery":
      return "Payment Recovery Specialist"
    case "residential_camp":
      return "Residential Camp Booster"
    default:
      return "Lead Nurture Specialist"
  }
}

export function enrichTelecaller(telecaller: Telecaller): Telecaller {
  const performance = buildTelecallerPerformance(telecaller)
  const hash = hashString(telecaller.id || "tc")
  const rolePool: TelecallerRole[] = [
    "lead_nurture",
    "welcome_call",
    "lead_nurture",
    "payment_recovery",
    "residential_camp",
    "lead_nurture",
  ]
  const assignedRole = telecaller.roleSpecialization || rolePool[Math.abs(hash) % rolePool.length]

  return {
    ...telecaller,
    roleSpecialization: assignedRole,
    patientCount: telecaller.patientCount ?? performance.patientCount,
    totalCalls: telecaller.totalCalls ?? performance.totalCalls,
    outboundCalls: telecaller.outboundCalls ?? performance.outboundCalls,
    inboundCalls: telecaller.inboundCalls ?? performance.inboundCalls,
    contactedCount: telecaller.contactedCount ?? performance.contactedCount,
    connectedCalls: telecaller.connectedCalls ?? performance.connectedCalls,
    conversions: telecaller.conversions ?? performance.conversions,
    conversionRate: telecaller.conversionRate ?? performance.conversionRate,
    avgCallsPerDay: telecaller.avgCallsPerDay ?? performance.avgCallsPerDay,
    avgCallDurationSeconds: telecaller.avgCallDurationSeconds ?? performance.avgCallDurationSeconds,
    joinedAt: telecaller.joinedAt ?? performance.joinedAt,
    weeklyTrends: telecaller.weeklyTrends ?? performance.weeklyTrends,
    outcomesBreakdown: telecaller.outcomesBreakdown ?? performance.outcomesBreakdown,
    recentCallLogs: telecaller.recentCallLogs ?? performance.recentCallLogs,
    status: telecaller.is_active === false ? "inactive" : "active",
  }
}
