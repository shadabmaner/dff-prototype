export const SALES_SPECIALTIES = [
  "Weight Management",
  "Diabetes Free Forever",
  "Thyroid Free Forever",
] as const

export const SALES_LEAD_SOURCES = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "website", label: "Website" },
  { value: "app", label: "App" },
] as const

export type SalesSpecialty = (typeof SALES_SPECIALTIES)[number]
export type SalesLeadSourceValue = (typeof SALES_LEAD_SOURCES)[number]["value"]

export const SALES_LEAD_SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  SALES_LEAD_SOURCES.map((source) => [source.value, source.label])
)
