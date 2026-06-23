import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"

export interface Telecaller {
  id: string
  name?: string
  email?: string
  phone?: string
  status?: string
  is_active?: boolean
}

export function useTelecallers(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true

  return useQuery<Telecaller[], Error>({
    queryKey: ["telecallers"],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get("/telecallers")
      const items = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []

      return (items as any[]).reduce<Telecaller[]>((acc, item) => {
        if (!item?.id) return acc
        acc.push({
          id: item.id,
          name: item.name || item.full_name || item.display_name,
          email: item.email,
          phone: item.phone,
          status: item.is_active === false ? "inactive" : "active",
          is_active: item.is_active,
        })
        return acc
      }, [])
    },
    staleTime: 1000 * 60 * 5,
  })
}
