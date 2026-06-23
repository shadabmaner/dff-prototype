import { create } from "zustand"
import type { AssessmentLeadStatus } from "@/types/assessment-leads"

interface LeadFilterState {
  page: number
  limit: number
  search: string
}

interface AssessmentLeadsStoreState {
  activeStatus: AssessmentLeadStatus
  filters: Record<AssessmentLeadStatus, LeadFilterState>
  setActiveStatus: (status: AssessmentLeadStatus) => void
  setPage: (status: AssessmentLeadStatus, page: number) => void
  setSearch: (status: AssessmentLeadStatus, search: string) => void
  resetFilters: (status?: AssessmentLeadStatus) => void
}

const defaultFilterState: LeadFilterState = {
  page: 1,
  limit: 20,
  search: "",
}

export const useAssessmentLeadsStore = create<AssessmentLeadsStoreState>((set) => ({
  activeStatus: "assessment_done",
  filters: {
    assessment_done: { ...defaultFilterState },
    assessment_paid: { ...defaultFilterState },
  },
  setActiveStatus: (status) => set({ activeStatus: status }),
  setPage: (status, page) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [status]: {
          ...state.filters[status],
          page,
        },
      },
    })),
  setSearch: (status, search) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [status]: {
          ...state.filters[status],
          search,
          page: 1,
        },
      },
    })),
  resetFilters: (status) =>
    set((state) => {
      if (status) {
        return {
          filters: {
            ...state.filters,
            [status]: { ...defaultFilterState },
          },
        }
      }
      return {
        filters: {
          assessment_done: { ...defaultFilterState },
          assessment_paid: { ...defaultFilterState },
        },
      }
    }),
}))
