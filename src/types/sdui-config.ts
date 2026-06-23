export interface SDUIConfig {
  id: string
  name: string
  category: string
  config: any
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ListSDUIConfigsDto {
  page?: number
  limit?: number
  search?: string
  category?: string
}

export interface SDUIConfigListResponse {
  data: SDUIConfig[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message: string
}

export interface CreateSDUIConfigDto {
  name: string
  category: string
  config: any
  description?: string
  is_active?: boolean
}

export interface UpdateSDUIConfigDto {
  name?: string
  category?: string
  config?: any
  description?: string
  is_active?: boolean
}
