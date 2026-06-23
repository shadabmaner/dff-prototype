"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { getCallHistory, type CallHistoryRecord, type CallHistoryResponse } from "@/lib/api/call-history"

export function useCallHistory(leadId?: string, options?: { page?: number; limit?: number; enabled?: boolean }) {
  const { page = 1, limit = 20, enabled = true } = options || {}
  
  return useQuery({
    queryKey: ["call-history", leadId, page, limit],
    queryFn: async () => {
      if (!leadId) throw new Error("Lead ID is required")
      
      const response = await getCallHistory(leadId, page, limit)
      
      if (!response?.success) {
        throw new Error("Failed to fetch call history")
      }
      
      return response
    },
    enabled: enabled && Boolean(leadId),
  })
}

// Re-export types for convenience
export type { CallHistoryRecord, CallHistoryResponse }
