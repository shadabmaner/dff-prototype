import type { Lead } from "@/components/sales/types"
import {
  SALES_LEAD_SOURCE_LABELS,
  SALES_LEAD_SOURCES,
  SALES_SPECIALTIES,
} from "@/lib/sales/lead-assignment-constants"

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function formatLeadSource(source?: string | null): string {
  if (!source) return "Direct"
  const normalized = source.toLowerCase().replace(/\s+/g, "_")
  return SALES_LEAD_SOURCE_LABELS[normalized] ?? source
}

export function enrichLeadForDisplay(lead: Lead): Lead {
  const hash = hashString(lead.id)

  const specialty_name =
    lead.specialty_name && lead.specialty_name !== "N/A"
      ? lead.specialty_name
      : SALES_SPECIALTIES[hash % SALES_SPECIALTIES.length]

  const rawSource = lead.source || lead.utmSource || lead.campaign
  const hasKnownSource =
    rawSource &&
    SALES_LEAD_SOURCES.some(
      (option) =>
        option.value === rawSource.toLowerCase() ||
        option.label.toLowerCase() === rawSource.toLowerCase()
    )

  const source = hasKnownSource
    ? formatLeadSource(rawSource)
    : SALES_LEAD_SOURCES[hash % SALES_LEAD_SOURCES.length].label

  return {
    ...lead,
    specialty_name,
    source,
  }
}
