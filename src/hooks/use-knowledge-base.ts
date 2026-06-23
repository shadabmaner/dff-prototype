import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  knowledgeBaseClient,
  type CreateResourceDto,
  type UpdateResourceDto,
  type ResourceListParams,
  type DeletedResourcesParams,
} from "@/lib/api/knowledge-base-client"
import { getErrorMessage } from "@/lib/error-handler"

// Get resources list with pagination
export function useResources(params?: ResourceListParams) {
  return useQuery({
    queryKey: ["knowledge-base-resources", params],
    queryFn: () => knowledgeBaseClient.getResources(params),
  })
}

// Get resource by ID
export function useResourceById(id: string) {
  return useQuery({
    queryKey: ["knowledge-base-resource", id],
    queryFn: () => knowledgeBaseClient.getResourceById(id),
    enabled: !!id,
  })
}

// Get resources by module
export function useResourcesByModule(moduleId: string) {
  return useQuery({
    queryKey: ["knowledge-base-resources", "module", moduleId],
    queryFn: () => knowledgeBaseClient.getResourcesByModule(moduleId),
    enabled: !!moduleId,
  })
}

// Get independent resources
export function useIndependentResources(params?: { specialityId?: string; programId?: string }) {
  return useQuery({
    queryKey: ["knowledge-base-resources", "independent", params],
    queryFn: () => knowledgeBaseClient.getIndependentResources(params),
  })
}

// Get deleted resources
export function useDeletedResources(params?: DeletedResourcesParams) {
  return useQuery({
    queryKey: ["knowledge-base-resources", "deleted", params],
    queryFn: () => knowledgeBaseClient.getDeletedResources(params),
  })
}

// Create resource mutation
export function useCreateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateResourceDto | FormData) => knowledgeBaseClient.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resources"] })
      toast.success("Resource created successfully!")
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: getErrorMessage(error),
      })
    },
  })
}

// Update resource mutation
type UpdateResourcePayload = UpdateResourceDto | FormData

export function useUpdateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourcePayload }) =>
      knowledgeBaseClient.updateResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resources"] })
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resource"] })
      toast.success("Resource updated successfully!")
    },
    onError: (error: any) => {
      toast.error("Failed to update resource", {
        description: getErrorMessage(error),
      })
    },
  })
}

// Delete resource mutation
export function useDeleteResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => knowledgeBaseClient.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resources"] })
      toast.success("Resource deleted successfully!")
    },
    onError: (error: any) => {
      toast.error("Failed to delete resource", {
        description: getErrorMessage(error),
      })
    },
  })
}

// Toggle resource status mutation
export function useToggleResourceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => knowledgeBaseClient.toggleResourceStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resources"] })
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resource"] })
      toast.success("Resource status toggled successfully!")
    },
    onError: (error: any) => {
      toast.error("Failed to toggle resource status", {
        description: getErrorMessage(error),
      })
    },
  })
}

// Restore resource mutation
export function useRestoreResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => knowledgeBaseClient.restoreResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resources"] })
      toast.success("Resource restored successfully!")
    },
    onError: (error: any) => {
      toast.error("Failed to restore resource", {
        description: getErrorMessage(error),
      })
    },
  })
}

// Reorder resources mutation
export function useReorderResources() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ specialityId, resourceIds }: { specialityId: string; resourceIds: string[] }) =>
      knowledgeBaseClient.reorderResources(specialityId, resourceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resources"] })
      toast.success("Resources reordered successfully!")
    },
    onError: (error: any) => {
      toast.error("Failed to reorder resources", {
        description: getErrorMessage(error),
      })
    },
  })
}

// Update resource order mutation
export function useUpdateResourceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, displayOrder }: { id: string; displayOrder: number }) =>
      knowledgeBaseClient.updateResourceOrder(id, displayOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resources"] })
      toast.success("Resource order updated successfully!")
    },
    onError: (error: any) => {
      toast.error("Failed to update resource order", {
        description: getErrorMessage(error),
      })
    },
  })
}

// Upload resource with file mutation
export function useUploadResourceWithFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => knowledgeBaseClient.uploadResourceWithFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resources"] })
      toast.success("Resource uploaded successfully!")
    },
    onError: (error: any) => {
      toast.error("Failed to upload resource", {
        description: getErrorMessage(error),
      })
    },
  })
}
// Toggle resource pin mutation
export function useToggleResourcePin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => knowledgeBaseClient.toggleResourcePin(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resources"] })
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-resource"] })
      toast.success(data.pin_for_dashboard ? "Resource pinned to dashboard!" : "Resource unpinned from dashboard!")
    },
    onError: (error: any) => {
      toast.error("Failed to toggle resource pin", {
        description: getErrorMessage(error),
      })
    },
  })
}
