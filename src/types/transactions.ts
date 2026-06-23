export interface Transaction {
  id: string
  transaction_id?: string
  razorpay_payment_id?: string
  razorpay_order_id?: string
  reference_id?: string
  amount: number
  currency?: string
  status: string
  payment_method?: string
  payment_mode?: string
  payment_type?: string
  patient_name?: string
  first_name?: string
  last_name?: string
  phone?: string
  patient_id?: string
  program?: string
  program_name?: string
  notes?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export interface GetTransactionsResponse {
  data?: Transaction[]
  transactions?: Transaction[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages?: number
    last_page?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
  total?: number
  page?: number
  limit?: number
}