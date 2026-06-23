export type SpecialtyStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED"

export interface DeliveryModes {
  virtual: boolean
  inPerson: boolean
  homeVisit: boolean
}

export type SpecialtyPlanTier = "STANDARD" | "PREMIUM" | "SPECIAL"

export interface SpecialtyPlan {
  id: string
  name: string
  focus: string
  language: string
  durationWeeks: number
  sessions: number
  owner: string
  protocolId: string
  tags: string[]
  lastUpdated: string
  price: number
  tier: SpecialtyPlanTier
}

export interface SpecialtyStaffMember {
  id: string
  name: string
  role: string
  availability: "AVAILABLE" | "LIMITED" | "OOO"
  lastActive: string
  kpi: {
    patients: number
    nps: number
  }
}

export interface SpecialtyLanguageCoverage {
  code: string
  name: string
  nativeName: string | null
  programsCount: number
  tracksCount: number
}

export interface SuperAdminSpecialty {
  id: string
  name: string
  code?: string
  description?: string
  category?: string
  iconUrl?: string | null
  coverImageUrl?: string | null
  colorCode?: string | null
  displayOrder?: number | null
  isActive?: boolean
  programs_count: number
  cliniciansCount: number
  lastUpdated: string
  status: SpecialtyStatus
  languages: string[]
  languageCoverage: SpecialtyLanguageCoverage[]
  deliveryModes: DeliveryModes
  plans: SpecialtyPlan[]
  staff: SpecialtyStaffMember[]
}

export interface SpecialtyFilters {
  query: string
  status?: SpecialtyStatus | "ALL"
  category?: string | "ALL"
  page?: number
  limit?: number
}

export type LanguageOption = {
  label: string
  value: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { label: "Hindi", value: "hi" },
  { label: "Marathi", value: "mr" },
]

export const LANGUAGE_OPTION_VALUES = LANGUAGE_OPTIONS.map((option) => option.value)

export const LANGUAGE_LABEL_LOOKUP = LANGUAGE_OPTIONS.reduce<Record<string, string>>((lookup, option) => {
  lookup[option.value] = option.label
  return lookup
}, {})
