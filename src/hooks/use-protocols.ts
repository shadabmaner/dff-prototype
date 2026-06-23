import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

export interface Protocol {
  id: string
  program_id: string
  plan_id: string
  name: string
  code: string
  description: string
  version: number
  duration_type: string
  duration_value: number
  duration_extra_days: number
  diet_guidelines: string | null
  exercise_guidelines: string | null
  general_guidelines: string | null
  is_active: boolean
  status: string
  published_at: string | null
  published_by: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  plan_name: string
  plan_code: string
}

export interface CreateProtocolPayload {
  program_id: string
  plan_id: string
  name: string
  code: string
  description: string
  duration_type: string
  duration_value: number
  duration_extra_days: number
  status: string
}

export interface UpdateProtocolPayload {
  program_id: string
  plan_id: string
  name: string
  code: string
  description: string
  duration_type: string
  duration_value: number
  duration_extra_days: number
  status: string
}

async function fetchProtocols(programId?: string): Promise<Protocol[]> {
  const response = await apiClient.get<{ data: Protocol[] }>("/protocols")
  return response.data.data
}

async function fetchProtocol(id: string): Promise<Protocol> {
  const response = await apiClient.get<{ data: Protocol }>(`/protocols/${id}`)
  return response.data.data
}

async function createProtocol(payload: CreateProtocolPayload): Promise<Protocol> {
  const response = await apiClient.post<{ data: Protocol }>("/protocols", payload)
  return response.data.data
}

async function updateProtocol(id: string, payload: UpdateProtocolPayload): Promise<Protocol> {
  const response = await apiClient.put<{ data: Protocol }>(`/protocols/${id}`, payload)
  return response.data.data
}

async function deleteProtocol(id: string): Promise<void> {
  await apiClient.delete(`/protocols/${id}`)
}

export function useProtocols(programId?: string) {
  return useQuery({
    queryKey: ["protocols", programId],
    queryFn: () => fetchProtocols(programId),
    staleTime: 30000,
  })
}

export function useProtocol(id: string | null) {
  return useQuery({
    queryKey: ["protocol", id],
    queryFn: () => fetchProtocol(id!),
    enabled: !!id,
    staleTime: 30000,
  })
}

export function useCreateProtocol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] })
      toast.success("Protocol created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create protocol")
    },
  })
}

export function useUpdateProtocol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProtocolPayload }) =>
      updateProtocol(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] })
      queryClient.invalidateQueries({ queryKey: ["protocol"] })
      toast.success("Protocol updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update protocol")
    },
  })
}

export function useDeleteProtocol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] })
      toast.success("Protocol deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete protocol")
    },
  })
}
