import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"

export interface RoleDropdownOption {
  id: string
  label: string
  code?: string | null
  type?: string | null
}

interface RoleDropdownApiItem {
  id?: string
  name?: string
  code?: string
  type?: string
  role_id?: string
  role_name?: string
  role_code?: string
}

interface RoleDropdownApiResponse {
  success?: boolean
  message?: string
  data?: RoleDropdownApiItem[]
}

const mapRoleOption = (item: RoleDropdownApiItem, index: number): RoleDropdownOption | null => {
  const id = item.id ?? item.role_id ?? item.role_code
  if (!id) return null
  const label = item.name ?? item.role_name ?? item.code ?? `Role ${index + 1}`
  return {
    id,
    label,
    code: item.code ?? item.role_code ?? null,
    type: item.type ?? null,
  }
}

export function useRolesDropdown() {
  return useQuery<RoleDropdownOption[], Error>({
    queryKey: ["roles-dropdown"],
    queryFn: async () => {
      const { data } = await apiClient.get<RoleDropdownApiResponse>("/roles/dropdown")
      const payload = data.data ?? []
      const unique = new Map<string, RoleDropdownOption>()
      payload.forEach((item, index) => {
        const option = mapRoleOption(item, index)
        if (option) {
          unique.set(option.id, option)
        }
      })
      return Array.from(unique.values())
    },
    staleTime: 1000 * 60 * 5,
  })
}
