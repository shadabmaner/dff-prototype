import { apiClient } from "@/lib/api-client"
import type {
  DashboardDocument,
  CreateDashboardDocumentRequest,
  UpdateDashboardDocumentRequest,
  DashboardDocumentListParams,
  DashboardDocumentResponse,
  SingleDashboardDocumentResponse,
} from "@/types/prerequisite"

export async function getDashboardDocuments(
  params: DashboardDocumentListParams = {}
): Promise<DashboardDocumentResponse> {
  const { data } = await apiClient.get<DashboardDocumentResponse>("/admin/dashboard-documents", {
    params,
  })
  return data
}

export async function getDashboardDocumentById(id: string): Promise<SingleDashboardDocumentResponse> {
  const { data } = await apiClient.get<SingleDashboardDocumentResponse>(`/admin/dashboard-documents/${id}`)
  return data
}

export async function createDashboardDocument(
  payload: CreateDashboardDocumentRequest
): Promise<SingleDashboardDocumentResponse> {
  const { data } = await apiClient.post<SingleDashboardDocumentResponse>("/admin/dashboard-documents", payload)
  return data
}

export async function updateDashboardDocument(
  id: string,
  payload: UpdateDashboardDocumentRequest
): Promise<SingleDashboardDocumentResponse> {
  const { data } = await apiClient.put<SingleDashboardDocumentResponse>(`/admin/dashboard-documents/${id}`, payload)
  return data
}

export async function deleteDashboardDocument(id: string): Promise<{ success: boolean; statusCode: number }> {
  const { data } = await apiClient.delete<{ success: boolean; statusCode: number }>(
    `/admin/dashboard-documents/${id}`
  )
  return data
}
