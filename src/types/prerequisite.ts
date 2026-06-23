export interface DashboardDocument {
  id: string
  title: string
  url: string
  thumbnail_url?: string
  document_type: "pdf"
  access_type: "free" | "paid"
  category: "dashboard" | "dietitian" | "general_instructions"
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateDashboardDocumentRequest {
  title: string
  url: string
  thumbnail_url?: string
  document_type: "pdf"
  access_type: "free" | "paid"
  category: "dashboard" | "dietitian" | "general_instructions"
  is_active: boolean
}

export interface UpdateDashboardDocumentRequest {
  title?: string
  url?: string
  thumbnail_url?: string
  document_type?: "pdf"
  access_type?: "free" | "paid"
  category?: "dashboard" | "dietitian" | "general_instructions"
  is_active?: boolean
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface DashboardDocumentListParams {
  page?: number
  limit?: number
  search?: string
  access_type?: "free" | "paid"
  category?: "dashboard" | "dietitian" | "general_instructions"
  document_type?: "pdf"
}

export interface DashboardDocumentResponse {
  success: boolean
  statusCode: number
  message?: string
  data: DashboardDocument[]
  pagination?: Pagination
}

export interface SingleDashboardDocumentResponse {
  success: boolean
  statusCode: number
  message?: string
  data: DashboardDocument
}
