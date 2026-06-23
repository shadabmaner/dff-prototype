export interface MindsetLog {
  id: string
  patient_id: string
  activity_type: string
  activity_prompt: string | null
  day_number: number
  day_title: string | null
  plan_name: string | null
  status: 'pending' | 'completed'
  response: {
    answer?: string
    value?: number
  } | null
  notes: string | null
  logged_date: string
  logged_time: string | null
  created_at: string
  files: Array<{
    url: string
    name: string
  }>
}

export interface MindsetLogsHistoryParams {
  patientId: string
  page?: number
  limit?: number
  start_date?: string
  end_date?: string
}

export interface MindsetLogsHistoryResponse {
  success: boolean
  statusCode: number
  data: {
    logs: MindsetLog[]
    pagination: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}
