import { create } from "zustand"

import type { SuperAdminSpecialty, SpecialtyFilters } from "@/components/super-admin/types"

export interface SpecialitiesMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface SpecialitiesStoreState {
  data: SuperAdminSpecialty[]
  loading: boolean
  error: string | null
  filters: SpecialtyFilters
  meta: SpecialitiesMeta | null
  setFilters: (filters: Partial<SpecialtyFilters>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setData: (data: SuperAdminSpecialty[]) => void
  updateData: (updater: (prev: SuperAdminSpecialty[]) => SuperAdminSpecialty[]) => void
  setMeta: (meta: SpecialitiesMeta | null) => void
}

export const useSpecialitiesStore = create<SpecialitiesStoreState>((set) => ({
  data: [],
  loading: true,
  error: null,
  filters: { query: "", status: "ALL", category: "ALL", page: 1, limit: 20 },
  meta: null,
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setData: (data) => set({ data }),
  updateData: (updater) =>
    set((state) => ({
      data: updater(state.data),
    })),
  setMeta: (meta) => set({ meta }),
}))
