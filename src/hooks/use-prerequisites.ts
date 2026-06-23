"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getDashboardDocuments,
  getDashboardDocumentById,
  createDashboardDocument,
  updateDashboardDocument,
  deleteDashboardDocument,
} from "@/lib/api/prerequisite-client"
import type {
  DashboardDocument,
  CreateDashboardDocumentRequest,
  UpdateDashboardDocumentRequest,
  DashboardDocumentListParams,
} from "@/types/prerequisite"

export function useDashboardDocuments(params: DashboardDocumentListParams = {}) {
  return useQuery({
    queryKey: ["dashboard-documents", params],
    queryFn: () => getDashboardDocuments(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useDashboardDocument(id: string | null) {
  return useQuery({
    queryKey: ["dashboard-document", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error("Document ID is required")
      return getDashboardDocumentById(id)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateDashboardDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDashboardDocumentRequest) => createDashboardDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-documents"] })
    },
  })
}

export function useUpdateDashboardDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDashboardDocumentRequest }) =>
      updateDashboardDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-documents"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-document", variables.id] })
    },
  })
}

export function useDeleteDashboardDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDashboardDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-documents"] })
    },
  })
}
