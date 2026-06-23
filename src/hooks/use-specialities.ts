import { useEffect } from "react"
import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import {
  LANGUAGE_LABEL_LOOKUP,
  type SpecialtyLanguageCoverage,
  type SuperAdminSpecialty,
  type SpecialtyStatus,
} from "@/components/super-admin/types"
import { useSpecialitiesStore, type SpecialitiesMeta } from "@/store/specialities-store"

type ApiLanguageCoverageEntry = {
  language_code?: string | null
  language_name?: string | null
  native_name?: string | null
  programs_count?: number | null
  tracks_count?: number | null
}

export type ApiSpeciality = {
  id: string
  name: string
  code?: string
  description?: string
  category?: string
  icon_url?: string | null
  cover_image_url?: string | null
  color_code?: string | null
  display_order?: number | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
  status?: string
  languages?: string[]
  programs_count?: number
  clinicians_count?: number
  programs_covered?: number
  languages_enabled?: number
  language_coverage?: (string | ApiLanguageCoverageEntry)[]
}

export type SpecialitiesApiResponse = {
  success: boolean
  statusCode: number
  message: string
  data: ApiSpeciality[]
  meta?: SpecialitiesMeta
}

const normalizeStatus = (status?: string, isActive?: boolean): SpecialtyStatus => {
  const normalized = status?.toUpperCase()
  if (normalized === "ACTIVE" || normalized === "INACTIVE" || normalized === "ARCHIVED") {
    return normalized
  }
  if (isActive === false) return "ARCHIVED"
  return "ACTIVE"
}

const resolveLanguages = (
  input?: ApiSpeciality["languages"] | ApiSpeciality["language_coverage"],
) => {
  if (!input) return [] as string[]
  return input
    .map((entry) => {
      if (!entry) return null
      if (typeof entry === "string") return entry
      if (typeof entry === "object" && "language_code" in entry) {
        return entry.language_code ?? null
      }
      return null
    })
    .filter((value): value is string => Boolean(value))
}

const mapLanguageCoverage = (
  input?: ApiSpeciality["language_coverage"],
): SpecialtyLanguageCoverage[] => {
  if (!input) return []
  return input
    .map((entry) => {
      if (!entry) return null
      if (typeof entry === "string") {
        const label = LANGUAGE_LABEL_LOOKUP[entry] ?? entry
        return {
          code: entry,
          name: label,
          nativeName: null,
          programsCount: 0,
          tracksCount: 0,
        }
      }

      const code = entry.language_code ?? undefined
      if (!code) return null
      return {
        code,
        name: entry.language_name ?? LANGUAGE_LABEL_LOOKUP[code] ?? code,
        nativeName: entry.native_name ?? null,
        programsCount: entry.programs_count ?? 0,
        tracksCount: entry.tracks_count ?? 0,
      }
    })
    .filter((value): value is SpecialtyLanguageCoverage => Boolean(value))
}

export const mapSpeciality = (item: ApiSpeciality): SuperAdminSpecialty => {
  const timestamp = item.updated_at ?? item.created_at ?? new Date().toISOString()
  const coverageEntries = mapLanguageCoverage(item.language_coverage)
  const fallbackLanguages = resolveLanguages(item.languages)
  const fallbackCoverage = fallbackLanguages
    .filter((code) => !coverageEntries.some((entry) => entry.code === code))
    .map((code) => ({
      code,
      name: LANGUAGE_LABEL_LOOKUP[code] ?? code,
      nativeName: null,
      programsCount: 0,
      tracksCount: 0,
    }))
  const languageCoverage = [...coverageEntries, ...fallbackCoverage]
  const languages = languageCoverage.map((entry) => entry.code)
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    description: item.description,
    category: item.category,
    iconUrl: item.icon_url ?? null,
    coverImageUrl: item.cover_image_url ?? null,
    colorCode: item.color_code ?? null,
    displayOrder: item.display_order ?? null,
    isActive: item.is_active,
    programs_count: item.programs_count ?? item.programs_covered ?? 0,
    cliniciansCount: item.clinicians_count ?? 0,
    lastUpdated: timestamp,
    status: normalizeStatus(item.status, item.is_active),
    languages,
    languageCoverage,
    deliveryModes: {
      virtual: true,
      inPerson: false,
      homeVisit: false,
    },
    plans: [],
    staff: [],
  }
}

export function useSpecialitiesQuery(): UseQueryResult<SpecialitiesApiResponse, Error> {
  const filters = useSpecialitiesStore((state) => state.filters)
  const setData = useSpecialitiesStore((state) => state.setData)
  const setMeta = useSpecialitiesStore((state) => state.setMeta)
  const setLoading = useSpecialitiesStore((state) => state.setLoading)
  const setError = useSpecialitiesStore((state) => state.setError)

  const query = useQuery<SpecialitiesApiResponse, Error>({
    queryKey: ["super-admin-specialities", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (filters.page) params.page = filters.page
      if (filters.limit) params.limit = filters.limit
      if (filters.query) params.search = filters.query
      if (filters.status && filters.status !== "ALL") params.status = filters.status
      if (filters.category && filters.category !== "ALL") params.category = filters.category

      const { data } = await apiClient.get<SpecialitiesApiResponse>("/specialities", { params })
      return data
    },
    placeholderData: (previousData) => previousData,
  })

  useEffect(() => {
    const current = useSpecialitiesStore.getState().loading
    if (current !== query.isFetching) {
      setLoading(query.isFetching)
    }
  }, [query.isFetching, setLoading])

  useEffect(() => {
    if (query.data?.data) {
      setData(query.data.data.map(mapSpeciality))
      setMeta(query.data.meta ?? null)
      setError(null)
    }
  }, [query.data, setData, setMeta, setError])

  useEffect(() => {
    if (query.error) {
      const message =
        // @ts-expect-error axios error shape
        query.error?.response?.data?.message ?? (query.error as Error).message ?? "Unable to load specialities"
      setError(message)
    }
  }, [query.error, setError])

  return query
}
