"use client"

import * as React from "react"

import type {
  DeliveryModes,
  SpecialtyFilters,
  SpecialtyPlan,
  SpecialtyPlanTier,
  SpecialtyStaffMember,
  SpecialtyStatus,
  SuperAdminSpecialty,
} from "./types"
import { useSpecialitiesStore } from "@/store/specialities-store"
import { mapSpeciality, useSpecialitiesQuery } from "@/hooks/use-specialities"
import { useCreateSpecialityMutation } from "@/hooks/use-create-speciality"
import {
  useAddSpecialityLanguageMutation,
  useRemoveSpecialityLanguageMutation,
} from "@/hooks/use-speciality-languages"
import { useUpdateSpecialityMutation } from "@/hooks/use-update-speciality"

export type SpecialtyError = {
  code: "DUPLICATE" | "UNKNOWN"
  message: string
}

type SpecialtyState = {
  data: SuperAdminSpecialty[]
  loading: boolean
  error: string | null
  filters: SpecialtyFilters
}

type UpdateSpecialtyPayload = {
  name?: string
  description?: string
  code?: string
  category?: string
  is_active?: boolean
  status?: SpecialtyStatus
  languages?: string[]
  deliveryModes?: DeliveryModes
  plans?: SuperAdminSpecialty["plans"]
  staff?: SuperAdminSpecialty["staff"]
  icon_url?: string | null
  cover_image_url?: string | null
}

type CreateSpecialtyInput = {
  name: string
  description?: string
  category?: string
  code?: string
  icon_url?: string | null
  cover_image_url?: string | null
}

type SuperAdminContextValue = {
  specialties: SpecialtyState
  setFilters: (filters: Partial<SpecialtyFilters>) => void
  createSpecialty: (payload: CreateSpecialtyInput) => Promise<void>
  updateSpecialty: (id: string, payload: UpdateSpecialtyPayload) => Promise<void>
  addLanguageToSpecialty: (id: string, languageCode: string) => Promise<void>
  removeLanguageFromSpecialty: (id: string, languageCode: string) => Promise<void>
  softDeleteSpecialty: (id: string) => Promise<void>
  restoreSpecialty: (id: string) => Promise<void>
  addStaffMember: (
    specialtyId: string,
    payload: { name: string; role: string; availability: SpecialtyStaffMember["availability"]; patients: number; nps: number }
  ) => Promise<void>
  createPlan: (
    specialtyId: string,
    payload: {
      name: string
      focus: string
      language: string
      durationWeeks: number
      sessions: number
      owner: string
      tier: SpecialtyPlanTier
      price: number
    }
  ) => Promise<void>
}

const SuperAdminContext = React.createContext<SuperAdminContextValue | null>(null)

const simulateLatency = () => new Promise((resolve) => setTimeout(resolve, 450))
const generateId = () => `sa-${Math.random().toString(36).slice(2, 8)}`

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const data = useSpecialitiesStore((state) => state.data)
  const loading = useSpecialitiesStore((state) => state.loading)
  const error = useSpecialitiesStore((state) => state.error)
  const filters = useSpecialitiesStore((state) => state.filters)
  const setFilters = useSpecialitiesStore((state) => state.setFilters)
  const updateData = useSpecialitiesStore((state) => state.updateData)
  const { mutateAsync: createSpecialityMutation } = useCreateSpecialityMutation()
  const { mutateAsync: addLanguageMutation } = useAddSpecialityLanguageMutation()
  const { mutateAsync: removeLanguageMutation } = useRemoveSpecialityLanguageMutation()
  const { mutateAsync: updateSpecialityMutation } = useUpdateSpecialityMutation()

  useSpecialitiesQuery()

  const createSpecialty = React.useCallback(
    async (payload: CreateSpecialtyInput) => {
      const normalizedName = payload.name.trim()
      const exists = useSpecialitiesStore
        .getState()
        .data.some((s) => s.name.toLowerCase() === normalizedName.toLowerCase())

      if (exists) {
        throw { code: "DUPLICATE", message: "Speciality name already exists" } satisfies SpecialtyError
      }
      await createSpecialityMutation({
        name: normalizedName,
        description: payload.description?.trim(),
        category: payload.category?.trim(),
        code: payload.code?.trim(),
        icon_url: payload.icon_url ?? undefined,
        cover_image_url: payload.cover_image_url ?? undefined,
        is_active: true,
      })
    },
    [createSpecialityMutation]
  )

  const updateSpecialty = React.useCallback(
    async (
      id: string,
      payload: {
        name?: string
        description?: string
        code?: string
        category?: string
        status?: SpecialtyStatus
        languages?: string[]
        deliveryModes?: DeliveryModes
        plans?: SpecialtyPlan[]
        staff?: SpecialtyStaffMember[]
        icon_url?: string | null
        cover_image_url?: string | null
      }
    ) => {
      const normalizedName = payload.name?.trim()
      if (normalizedName) {
        const existsByName = useSpecialitiesStore
          .getState()
          .data.some((item) => item.id !== id && item.name.toLowerCase() === normalizedName.toLowerCase())
        if (existsByName) {
          throw { code: "DUPLICATE", message: "Speciality name already exists" } satisfies SpecialtyError
        }
      }

      const response = await updateSpecialityMutation({
        id,
        payload: {
          name: normalizedName,
          description: payload.description?.trim(),
          category: payload.category?.trim(),
          code: payload.code?.trim(),
          status: payload.status,
          is_active: payload.status ? payload.status === "ACTIVE" : undefined,
          icon_url: payload.icon_url === undefined ? undefined : payload.icon_url,
          cover_image_url: payload.cover_image_url === undefined ? undefined : payload.cover_image_url,
        },
      })

      const mapped = mapSpeciality(response)
      updateData((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...mapped,
                languages: payload.languages ?? mapped.languages ?? s.languages,
                deliveryModes: payload.deliveryModes ?? s.deliveryModes,
                plans: payload.plans ?? s.plans,
                staff: payload.staff ?? s.staff,
              }
            : s
        )
      )
    },
    [updateData, updateSpecialityMutation]
  )

  const softDeleteSpecialty = React.useCallback(
    async (id: string) => {
      const response = await updateSpecialityMutation({
        id,
        payload: {
          is_active: false,
        },
      })

      const mapped = mapSpeciality(response)
      updateData((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...mapped,
                status: "ARCHIVED",
                isActive: false,
                lastUpdated: new Date().toISOString(),
              }
            : s
        )
      )
    },
    [updateData, updateSpecialityMutation]
  )

  const restoreSpecialty = React.useCallback(
    async (id: string) => {
      const response = await updateSpecialityMutation({
        id,
        payload: {
          is_active: true,
        },
      })

      const mapped = mapSpeciality(response)
      updateData((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...mapped,
                status: "ACTIVE",
                isActive: true,
                lastUpdated: new Date().toISOString(),
              }
            : s
        )
      )
    },
    [updateData, updateSpecialityMutation]
  )

  const addLanguageToSpecialty = React.useCallback(
    async (id: string, languageCode: string) => {
      await addLanguageMutation({ specialityId: id, languageCode })
    },
    [addLanguageMutation]
  )

  const removeLanguageFromSpecialty = React.useCallback(
    async (id: string, languageCode: string) => {
      await removeLanguageMutation({ specialityId: id, languageCode })
    },
    [removeLanguageMutation]
  )

  const addStaffMember = React.useCallback(
    async (
      specialtyId: string,
      payload: { name: string; role: string; availability: SpecialtyStaffMember["availability"]; patients: number; nps: number }
    ) => {
      await simulateLatency()
      const staffMember: SpecialtyStaffMember = {
        id: generateId(),
        name: payload.name.trim(),
        role: payload.role.trim(),
        availability: payload.availability,
        lastActive: new Date().toISOString(),
        kpi: { patients: payload.patients, nps: payload.nps },
      }

      updateData((prev) => prev.map((s) => (s.id === specialtyId ? { ...s, staff: [staffMember, ...s.staff] } : s)))
    },
    [updateData]
  )

  const createPlan = React.useCallback(
    async (
      specialtyId: string,
      payload: {
        name: string
        focus: string
        language: string
        durationWeeks: number
        sessions: number
        owner: string
        tier: SpecialtyPlanTier
        price: number
      }
    ) => {
      await simulateLatency()
      const plan: SpecialtyPlan = {
        id: generateId(),
        name: payload.name.trim(),
        focus: payload.focus.trim(),
        language: payload.language,
        durationWeeks: payload.durationWeeks,
        sessions: payload.sessions,
        owner: payload.owner.trim(),
        protocolId: `proto-${generateId()}`,
        tags: [],
        lastUpdated: new Date().toISOString(),
        price: payload.price,
        tier: payload.tier,
      }

      updateData((prev) =>
        prev.map((specialty) =>
          specialty.id === specialtyId
            ? {
                ...specialty,
                plans: [plan, ...specialty.plans],
                languages: Array.from(new Set([...specialty.languages, payload.language])),
              }
            : specialty
        )
      )
    },
    [updateData]
  )

  const state: SpecialtyState = React.useMemo(
    () => ({ data, loading, error, filters }),
    [data, loading, error, filters]
  )

  const value = React.useMemo<SuperAdminContextValue>(
    () => ({
      specialties: state,
      setFilters,
      createSpecialty,
      updateSpecialty,
      addLanguageToSpecialty,
      removeLanguageFromSpecialty,
      softDeleteSpecialty,
      restoreSpecialty,
      addStaffMember,
      createPlan,
    }),
    [
      state,
      setFilters,
      createSpecialty,
      updateSpecialty,
      addLanguageToSpecialty,
      removeLanguageFromSpecialty,
      softDeleteSpecialty,
      restoreSpecialty,
      addStaffMember,
      createPlan,
    ]
  )

  return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>
}

export function useSuperAdmin() {
  const ctx = React.useContext(SuperAdminContext)
  if (!ctx) {
    throw new Error("useSuperAdmin must be used within SuperAdminProvider")
  }
  return ctx
}
