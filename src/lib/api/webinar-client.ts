import { apiClient } from "@/lib/api-client"

export interface Webinar {
  id: string
  name: string
  video_url: string
  thumbnail_url: string | null
  description: string | null
  duration_mins: number
  scheduled_date: string
  scheduled_time: string
  access_type: "free" | "paid" | "both"
  created_at: string
  updated_at: string
}

export interface WebinarListResponse {
  data: Webinar[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface WebinarListParams {
  page?: number
  limit?: number
  search?: string
}

export interface CreateWebinarRequest {
  name: string
  video_url: string
  thumbnail_url?: string
  description?: string
  duration_mins: number
  scheduled_date: string
  scheduled_time: string
  access_type?: "free" | "paid" | "both"
}

export interface UpdateWebinarRequest {
  name?: string
  video_url?: string
  thumbnail_url?: string
  scheduled_date?: string
  scheduled_time?: string
  description?: string
  duration_mins?: number
  access_type?: "free" | "paid" | "both"
}

export async function getWebinars(params: WebinarListParams = {}): Promise<WebinarListResponse> {
  const { data } = await apiClient.get("/service-dept/webinars", { params })
  return data
}

export async function getWebinarById(id: string): Promise<Webinar> {
  const { data } = await apiClient.get(`/service-dept/webinars/${id}`)
  return data
}

export async function createWebinar(payload: CreateWebinarRequest): Promise<Webinar> {
  const { data } = await apiClient.post("/service-dept/webinars", payload)
  return data
}

export async function updateWebinar(id: string, payload: UpdateWebinarRequest): Promise<Webinar> {
  const { data } = await apiClient.patch(`/service-dept/webinars/${id}`, payload)
  return data
}

export async function deleteWebinar(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/service-dept/webinars/${id}`)
  return data
}
