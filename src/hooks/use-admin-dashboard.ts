import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"

export type AdminDashboardOverview = {
  totalActiveUsers: number
  totalPatients: number
  totalLeads: number
  activeStaffMembers: number
}

export type AdminDashboardPatientGrowth = {
  data: Array<{
    date: string
    count: number
  }>
  growthRate: number
}

export type AdminDashboardDemographics = {
  ageDistribution: Array<{
    range: string
    count: number
  }>
  genderDistribution: Array<{
    gender: string
    count: number
  }>
  locationDistribution: Array<{
    city: string
    count: number
  }>
}

export type AdminDashboardRevenue = {
  total: number
  breakdown: Array<{
    source: string
    amount: number
  }>
}

export type AdminDashboardStaffUtilization = {
  patientAssignments: Array<{
    staffId: string
    staffName: string
    patientCount: number
  }>
  completedConsultations: Array<{
    staffId: string
    staffName: string
    consultationCount: number
  }>
}

export type AdminDashboardKnowledgeBase = {
  totalItems: number
  totalCourses: number
}

export type AdminDashboardCommunityActivity = {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalShares: number
  activeUsers: number
}

export type AdminDashboardData = {
  overview: AdminDashboardOverview
  patientGrowth: AdminDashboardPatientGrowth
  patientDemographics: AdminDashboardDemographics
  revenue: AdminDashboardRevenue
  staffUtilization: AdminDashboardStaffUtilization
  knowledgeBase: AdminDashboardKnowledgeBase
  communityActivity: AdminDashboardCommunityActivity
}

type AdminDashboardResponse = {
  success: boolean
  statusCode: number
  message?: string
  data: AdminDashboardData
}

export type AdminDashboardFilters = {
  patientGrowthFilter?: 'today' | 'last_7_days' | 'last_30_days'
  revenueFilter?: 'all_time' | 'today' | 'last_7_days' | 'last_30_days'
}

export function useAdminDashboard(filters?: AdminDashboardFilters, options?: { enabled?: boolean }) {
  return useQuery<AdminDashboardData, Error>({
    queryKey: ["admin-dashboard", filters],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.patientGrowthFilter) {
        params.append('patientGrowthFilter', filters.patientGrowthFilter)
      }
      if (filters?.revenueFilter) {
        params.append('revenueFilter', filters.revenueFilter)
      }

      const { data } = await apiClient.get<AdminDashboardResponse>(`/dashboards/admin?${params.toString()}`)
      if (!data?.success || !data?.data) {
        throw new Error(data?.message ?? "Unable to load admin dashboard data")
      }
      return data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
