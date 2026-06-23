import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  listSDUIConfigs,
  getSDUIConfig,
  createSDUIConfig,
  updateSDUIConfig,
  deleteSDUIConfig,
  updateDynamicUI,
} from "@/lib/api/sdui-config-client"
import { ListSDUIConfigsDto, CreateSDUIConfigDto, UpdateSDUIConfigDto } from "@/types/sdui-config"
import { toast } from "sonner"

export function useSDUIConfigs(params?: ListSDUIConfigsDto) {
  return useQuery({
    queryKey: ["sdui-configs", params],
    queryFn: () => listSDUIConfigs(params),
  })
}

export function useSDUIConfig(idOrName: string) {
  return useQuery({
    queryKey: ["sdui-configs", idOrName],
    queryFn: () => getSDUIConfig(idOrName),
    enabled: !!idOrName,
  })
}

export function useCreateSDUIConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSDUIConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sdui-configs"] })
      toast.success("SDUI configuration created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create SDUI configuration")
    },
  })
}

export function useUpdateSDUIConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSDUIConfigDto }) =>
      updateSDUIConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sdui-configs"] })
      toast.success("SDUI configuration updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update SDUI configuration")
    },
  })
}

export function useDeleteSDUIConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSDUIConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sdui-configs"] })
      toast.success("SDUI configuration deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete SDUI configuration")
    },
  })
}

export function useUpdateDynamicUI() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ filename, data }: { filename: string; data: any }) =>
      updateDynamicUI(filename, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sdui-configs"] })
      toast.success("Dynamic UI updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update dynamic UI")
    },
  })
}
