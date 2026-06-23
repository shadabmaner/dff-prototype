import { useQuery } from "@tanstack/react-query"
import { getCommunityStats } from "@/lib/api/community-client"
import type { CommunityStats } from "@/types/community"

export function useCommunityStats() {
  return useQuery<CommunityStats, Error>({
    queryKey: ["community-stats"],
    queryFn: () => getCommunityStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
