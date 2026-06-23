import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"

export type ActionInitiator = {
  role_id: string
  role_name?: string | null
}

export type ActionNotification = {
  notification_template_id: string
  trigger_type: string
  trigger_offset_mins: number
}

export interface ActionApi {
  id: string
  name: string
  code?: string
  description?: string | null
  category_id?: string | null
  category_name?: string | null
  category?: { id?: string; name?: string | null } | null
  default_duration_mins?: number | null
  cadence?: string | null
  status?: string | null
  is_active?: boolean | null
  last_run_at?: string | null
  updated_at?: string | null
  owner_name?: string | null
  initiators?: ActionInitiator[]
  respondents?: ActionInitiator[]
  notifications?: ActionNotification[]
}

interface ActionListEnvelope {
  items?: ActionApi[]
  total?: number
  page?: number
  limit?: number
}

interface ActionsListApiResponse {
  success?: boolean
  statusCode?: number
  message?: string
  data?: ActionListEnvelope | ActionApi[]
}

export interface ActionsListResult {
  items: ActionApi[]
  total: number
}

export interface UseActionsParams {
  page?: number
  limit?: number
  query?: string
  categoryId?: string
}

export interface CreateActionPayload {
  name: string
  code?: string
  description?: string
  cadence?: string
  default_duration_mins?: number
  is_active?: boolean
  owner_name?: string
  category_id?: string
  category_name?: string
  initiators?: ActionInitiator[]
  respondents?: ActionInitiator[]
  notifications?: ActionNotification[]
}

interface CreateActionResponse {
  data?: ActionApi
  message?: string
  statusCode?: number
  success?: boolean
}

const extractActions = (payload?: ActionsListApiResponse): ActionsListResult => {
  if (!payload) {
    return { items: [], total: 0 }
  }

  const rawData = payload.data
  if (!rawData) {
    return { items: [], total: 0 }
  }

  if (Array.isArray(rawData)) {
    return { items: rawData, total: rawData.length }
  }

  return {
    items: rawData.items ?? [],
    total: rawData.total ?? rawData.items?.length ?? 0,
  }
}

export function useActions(params: UseActionsParams = {}) {
  const { page = 1, limit = 50, query, categoryId } = params

  return useQuery({
    queryKey: ["actions", { page, limit, query, categoryId }],
    queryFn: async () => {
      const { data } = await apiClient.get<ActionsListApiResponse>("/actions", {
        params: {
          page,
          limit,
          q: query || undefined,
          category_id: categoryId || undefined,
        },
      })

      return extractActions(data)
    },
    staleTime: 60 * 1000,
  })
}

export function useCreateAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateActionPayload) => {
      const { data } = await apiClient.post<CreateActionResponse>("/actions", payload)
      if (!data?.data) {
        throw new Error(data?.message ?? "Unable to create action")
      }
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actions"] })
    },
  })
}
