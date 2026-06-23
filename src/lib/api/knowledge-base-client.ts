import { apiClient } from "../api-client"

export type ResourceContentType = "video" | "pdf" | "article" | "recipe" | "image" | "document" | "external_link"
export type ResourceStatus = "active" | "inactive"

export interface KnowledgeBaseFaq {
  question: string
  answer: string
}

export interface KnowledgeBaseResource {
  id: string
  module_id?: string | null
  title: string
  description?: string | null
  content_type: ResourceContentType
  resource_url: string
  speciality_id: string
  program_id?: string | null
  language_code?: string | null
  status: ResourceStatus
  thumbnail_url?: string | null
  pin_for_dashboard?: boolean
  deleted_at?: string | null
  display_order: number
  created_at: string
  updated_at: string
  faqs?: KnowledgeBaseFaq[]
}

export interface CreateResourceDto {
  module_id?: string
  title: string
  description?: string
  content_type: ResourceContentType
  resource_url: string
  speciality_id: string
  program_id?: string
  language_code?: string
  status?: ResourceStatus
  faqs?: KnowledgeBaseFaq[]
  thumbnail?: any
}

export interface UpdateResourceDto {
  module_id?: string
  title?: string
  description?: string
  content_type?: ResourceContentType
  resource_url?: string
  speciality_id?: string
  program_id?: string
  language_code?: string
  status?: ResourceStatus
  display_order?: number
  faqs?: KnowledgeBaseFaq[]
  thumbnail?: any
}

export interface ResourceListParams {
  page?: number
  limit?: number
  moduleId?: string
  specialityId?: string
  programId?: string
  search?: string
  contentType?: ResourceContentType
  status?: ResourceStatus
}

export interface ResourceListResponse {
  data: KnowledgeBaseResource[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    count: number
  }
}

export interface DeletedResourcesParams {
  page?: number
  limit?: number
  specialityId?: string
  moduleId?: string
}

export interface ReorderResourcesDto {
  resource_ids: string[]
}

export interface UpdateOrderDto {
  display_order: number
}

export const knowledgeBaseClient = {
  // List resources with pagination and filters
  async getResources(params?: ResourceListParams): Promise<ResourceListResponse> {
    const { data } = await apiClient.get("/knowledge-base/resources", { params })
    return data
  },

  // Get resource by ID
  async getResourceById(id: string): Promise<KnowledgeBaseResource> {
    const { data } = await apiClient.get(`/knowledge-base/resources/${id}`)
    return data.data
  },

  // Get resources by module
  async getResourcesByModule(moduleId: string): Promise<KnowledgeBaseResource[]> {
    const { data } = await apiClient.get(`/knowledge-base/resources/module/${moduleId}`)
    return data
  },

  async getIndependentResources(params?: { specialityId?: string; programId?: string }): Promise<KnowledgeBaseResource[]> {
    const { data } = await apiClient.get("/knowledge-base/resources/independent/list", { params })
    return data
  },

  async uploadFileToPresignedUrl(file: File, folder: string = "thumbnails"): Promise<string> {
    const sanitize = (name: string) => name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "")
    const safeName = sanitize(file.name)
    const timestamp = Date.now()
    const key = `${folder}/${timestamp}-${safeName}`

    const { data } = await apiClient.post<{ success: boolean; data: { presignedUrl: string; fileUrl: string }; message: string }>("/storage/presigned-url", {
      key,
      expiresIn: 3600,
    })

    if (!data?.success || !data?.data?.presignedUrl || !data?.data?.fileUrl) {
      throw new Error(data?.message ?? "Unable to generate upload URL")
    }

    const uploadResponse = await fetch(data.data.presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error("Upload failed. Please try again.")
    }

    return data.data.fileUrl
  },

  // Create resource
  async createResource(resource: CreateResourceDto | FormData): Promise<KnowledgeBaseResource> {
    const config = resource instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    const { data } = await apiClient.post("/knowledge-base/resources", resource, config)
    return data
  },

  // Update resource
  async updateResource(id: string, resource: UpdateResourceDto | FormData): Promise<KnowledgeBaseResource> {
    const config = resource instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    const { data } = await apiClient.put(`/knowledge-base/resources/${id}`, resource, config)
    return data
  },

  // Delete resource (soft delete)
  async deleteResource(id: string): Promise<{ message: string; id: string }> {
    const { data } = await apiClient.delete(`/knowledge-base/resources/${id}`)
    return data
  },

  // Toggle resource status
  async toggleResourceStatus(id: string): Promise<{ id: string; status: ResourceStatus; message: string }> {
    const { data } = await apiClient.patch(`/knowledge-base/resources/${id}/toggle-status`)
    return data
  },

  // Restore resource
  async restoreResource(id: string): Promise<{ id: string; deleted_at: null; message: string }> {
    const { data } = await apiClient.patch(`/knowledge-base/resources/${id}/restore`)
    return data
  },

  // Get deleted resources
  async getDeletedResources(params?: DeletedResourcesParams): Promise<ResourceListResponse> {
    const { data } = await apiClient.get("/knowledge-base/resources/deleted", { params })
    return data
  },

  // Reorder resources
  async reorderResources(specialityId: string, resourceIds: string[]): Promise<{ message: string; updated_count: number }> {
    const { data } = await apiClient.post("/knowledge-base/resources/reorder", {
      resource_ids: resourceIds,
    }, {
      params: { specialityId }
    })
    return data
  },

  // Update resource order
  async updateResourceOrder(id: string, displayOrder: number): Promise<{ id: string; display_order: number; message: string }> {
    const { data } = await apiClient.patch(`/knowledge-base/resources/${id}/order`, {
      display_order: displayOrder,
    })
    return data
  },

  async addResourceToModule(resourceId: string, moduleId: string): Promise<KnowledgeBaseResource> {
    const { data } = await apiClient.post(`/knowledge-base/resources/${resourceId}/add-to-module/${moduleId}`)
    return data?.data ?? data
  },

  async reorderModuleResources(moduleId: string, resourceIds: string[]): Promise<KnowledgeBaseResource[]> {
    const { data } = await apiClient.post(`/knowledge-base/resources/module/${moduleId}/reorder`, {
      resource_ids: resourceIds,
    })
    return data?.data ?? data
  },

  // Upload resource with file
  async uploadResourceWithFile(formData: FormData): Promise<KnowledgeBaseResource> {
    const { data } = await apiClient.post("/knowledge-base/resources/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return data
  },

  // Toggle pin for dashboard
  async toggleResourcePin(id: string): Promise<KnowledgeBaseResource> {
    const { data } = await apiClient.patch(`/knowledge-base/resources/${id}/toggle-pin`)
    return data?.data ?? data
  },
}
