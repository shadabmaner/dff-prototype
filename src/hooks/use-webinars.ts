"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getWebinars,
  getWebinarById,
  createWebinar,
  updateWebinar,
  deleteWebinar,
} from "@/lib/api/webinar-client"
import type {
  WebinarListParams,
  WebinarListResponse,
  Webinar,
  CreateWebinarRequest,
  UpdateWebinarRequest,
} from "@/lib/api/webinar-client"

export function useWebinars(params: WebinarListParams = {}) {
  return useQuery<WebinarListResponse, Error>({
    queryKey: ["webinars", params],
    queryFn: () => getWebinars(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useWebinarById(id: string, enabled = true) {
  return useQuery<Webinar, Error>({
    queryKey: ["webinar", id],
    queryFn: () => getWebinarById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateWebinar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateWebinarRequest) => createWebinar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webinars"] })
    },
  })
}

export function useUpdateWebinar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWebinarRequest }) =>
      updateWebinar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webinars"] })
      queryClient.invalidateQueries({ queryKey: ["webinar"] })
    },
  })
}

export function useDeleteWebinar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWebinar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webinars"] })
    },
  })
}
