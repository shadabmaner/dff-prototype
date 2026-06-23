import { apiClient } from "../api-client"

export type ModuleUnlockRule = "immediate" | "previous_completed" | "scheduled" | "custom" | string

export interface KnowledgeBaseModule {
  id: string
  title: string
  description?: string | null
  course_id: string
  course_title?: string
  module_sequence: number
  unlock_rule: ModuleUnlockRule
  cover_image_url?: string | null
  intro_video_url?: string | null
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface CreateModulePayload {
  title: string
  description?: string
  course_id: string
  unlock_rule?: ModuleUnlockRule
  module_sequence?: number
  coverImage?: File | null
  introVideo?: File | null
}

export interface UpdateModulePayload {
  title?: string
  description?: string
  course_id?: string
  unlock_rule?: ModuleUnlockRule
  module_sequence?: number
  coverImage?: File | null
  introVideo?: File | null
}

const buildFormData = (payload: CreateModulePayload | UpdateModulePayload) => {
  const formData = new FormData()

  if ("course_id" in payload && payload.course_id) {
    formData.append("course_id", payload.course_id)
  }

  if (payload.title) {
    formData.append("title", payload.title)
  }

  if (payload.description !== undefined) {
    formData.append("description", payload.description ?? "")
  }

  if (payload.unlock_rule) {
    formData.append("unlock_rule", payload.unlock_rule)
  }

  if (payload.module_sequence !== undefined) {
    formData.append("module_sequence", String(payload.module_sequence))
  }

  if (payload.coverImage) {
    formData.append("coverImage", payload.coverImage)
  }

  if (payload.introVideo) {
    formData.append("introVideo", payload.introVideo)
  }

  return formData
}

export const knowledgeBaseModulesClient = {
  async getModule(id: string): Promise<KnowledgeBaseModule> {
    const response = await apiClient.get(`/knowledge-base/modules/${id}`)
    return response.data?.data ?? response.data
  },

  async getModulesByCourse(courseId: string): Promise<KnowledgeBaseModule[]> {
    const response = await apiClient.get(`/knowledge-base/modules/course/${courseId}`)
    const data = response.data?.data ?? response.data
    return Array.isArray(data) ? data : []
  },

  async createModule(payload: CreateModulePayload): Promise<KnowledgeBaseModule> {
    const formData = buildFormData(payload)
    const response = await apiClient.post("/knowledge-base/modules", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data?.data ?? response.data
  },

  async updateModule(id: string, payload: UpdateModulePayload): Promise<KnowledgeBaseModule> {
    const formData = buildFormData(payload)
    const response = await apiClient.put(`/knowledge-base/modules/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data?.data ?? response.data
  },

  async deleteModule(id: string): Promise<{ message: string; deletedModule: Partial<KnowledgeBaseModule> }> {
    const response = await apiClient.delete(`/knowledge-base/modules/${id}`)
    return response.data
  },

  async reorderModules(courseId: string, moduleIds: string[]): Promise<KnowledgeBaseModule[]> {
    const response = await apiClient.put(`/knowledge-base/modules/course/${courseId}/reorder`, {
      module_ids: moduleIds,
    })
    return response.data?.data ?? response.data
  },
}
