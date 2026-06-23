import { apiClient } from "@/lib/api-client"
import type { CommunityStats } from "@/types/community"

interface CommunityStatsApiResponse {
  success: boolean
  statusCode: number
  data: {
    totalPosts?: number
    activePosts?: number
    hiddenPosts?: number
    deletedPosts?: number
    pendingReports?: number
    totalReports?: number
    autoHiddenByAI?: number
    approvedReports?: number
    rejectedReports?: number
    activeAuthors?: number
    restrictedAuthors?: number
    bannedAuthors?: number
  }
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const { data } = await apiClient.get<CommunityStatsApiResponse>("/community/admin/stats")

  const stats: CommunityStats = {
    totalPosts: data.data.totalPosts ?? 0,
    activePosts: data.data.activePosts ?? 0,
    hiddenPosts: data.data.hiddenPosts ?? 0,
    deletedPosts: data.data.deletedPosts ?? 0,
    pendingReports: data.data.pendingReports ?? 0,
    totalReports: data.data.totalReports ?? 0,
    autoHiddenByAI: data.data.autoHiddenByAI ?? 0,
    approvedReports: data.data.approvedReports ?? 0,
    rejectedReports: data.data.rejectedReports ?? 0,
    activeAuthors: data.data.activeAuthors ?? 0,
    restrictedAuthors: data.data.restrictedAuthors ?? 0,
    bannedAuthors: data.data.bannedAuthors ?? 0,
  }

  return stats
}
