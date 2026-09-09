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
  joinedAt: string
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
]

const SPECIALTIES = ["Weight Management", "Diabetes Free Forever", "Thyroid Free Forever"]
const SOURCES = ["Facebook", "Instagram", "Website", "App"]
const STATUSES = ["new", "contacted", "follow_up", "interested", "converted", "not_connected"]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function buildTelecallerPerformance(telecaller: Pick<Telecaller, "id" | "name">): TelecallerPerformance {
  const hash = hashString(telecaller.id)
  const patientCount = 12 + (hash % 28)
  const totalCalls = patientCount * (3 + (hash % 5))
  const outboundCalls = Math.round(totalCalls * 0.88)
  const inboundCalls = totalCalls - outboundCalls
  const connectedCalls = Math.round(totalCalls * (0.42 + (hash % 15) / 100))
  const contactedCount = Math.min(patientCount, Math.round(connectedCalls * 0.92))
  const conversions = Math.max(1, Math.round(contactedCount * (0.12 + (hash % 10) / 100)))
  const conversionRate = contactedCount > 0 ? Number(((conversions / contactedCount) * 100).toFixed(1)) : 0

  const joinedDate = new Date()
  joinedDate.setMonth(joinedDate.getMonth() - (3 + (hash % 18)))

  return {
    patientCount,
    totalCalls,
    outboundCalls,
    inboundCalls,
    contactedCount,
    connectedCalls,
    conversions,
    conversionRate,
    avgCallsPerDay: Number((totalCalls / 30).toFixed(1)),
    joinedAt: joinedDate.toISOString(),
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

export function enrichTelecaller(telecaller: Telecaller): Telecaller {
  const performance = buildTelecallerPerformance(telecaller)

  return {
    ...telecaller,
    patientCount: telecaller.patientCount ?? performance.patientCount,
    totalCalls: telecaller.totalCalls ?? performance.totalCalls,
    outboundCalls: telecaller.outboundCalls ?? performance.outboundCalls,
    inboundCalls: telecaller.inboundCalls ?? performance.inboundCalls,
    contactedCount: telecaller.contactedCount ?? performance.contactedCount,
    connectedCalls: telecaller.connectedCalls ?? performance.connectedCalls,
    conversions: telecaller.conversions ?? performance.conversions,
    conversionRate: telecaller.conversionRate ?? performance.conversionRate,
    avgCallsPerDay: telecaller.avgCallsPerDay ?? performance.avgCallsPerDay,
    joinedAt: telecaller.joinedAt ?? performance.joinedAt,
    status: telecaller.is_active === false ? "inactive" : "active",
  }
}
