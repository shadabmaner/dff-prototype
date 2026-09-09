import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"
import type { Telecaller } from "@/hooks/use-telecallers"

type UpdateTelecallerStatusInput = {
  telecallerId: string
  isActive: boolean
}

export function useUpdateTelecallerStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ telecallerId, isActive }: UpdateTelecallerStatusInput) => {
      try {
        await apiClient.patch(`/telecallers/${telecallerId}`, { is_active: isActive })
      } catch {
        try {
          await apiClient.patch(`/telecallers/${telecallerId}/status`, { is_active: isActive })
        } catch {
          // Keep local state for prototype when backend endpoint is unavailable
        }
      }
      return { telecallerId, isActive }
    },
    onMutate: async ({ telecallerId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ["telecallers"] })

      const previousTelecallers = queryClient.getQueryData<Telecaller[]>(["telecallers"])

      queryClient.setQueryData<Telecaller[]>(["telecallers"], (current) =>
        (current ?? []).map((telecaller) =>
          telecaller.id === telecallerId
            ? {
                ...telecaller,
                is_active: isActive,
                status: isActive ? "active" : "inactive",
              }
            : telecaller
        )
      )

      queryClient.setQueryData<Telecaller>(["telecaller-detail", telecallerId], (current: any) =>
        current
          ? {
              ...current,
              is_active: isActive,
              status: isActive ? "active" : "inactive",
            }
          : current
      )

      return { previousTelecallers }
    },
    onSuccess: (_data, variables) => {
      toast.success(`Telecaller ${variables.isActive ? "activated" : "deactivated"} successfully`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["telecallers"] })
      queryClient.invalidateQueries({ queryKey: ["telecaller-detail"] })
    },
  })
}
