import { useState } from "react"
import { toast } from "sonner"
import type { GetTransactionsResponse } from "@/types/transactions"
import { apiClient } from "@/lib/api-client"

interface GetTransactionsParams {
  page: number
  limit: number
}

export interface ManualPaymentPayload {
  patientId: string
  paymentType: string
  amount: number
  paymentMethod: string
  referenceId: string
  leadId: string
  notes: string
  receipt: string
  programId?: string
  planId?: string
  specialityId?: string
  installmentType?: 'one-time' | 'phase'
  phaseNumber?: number
  totalPhases?: number
}

export function useTransactionsApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [manualPayLoading, setManualPayLoading] = useState(false)

  const getTransactions = async (
    params: GetTransactionsParams
  ): Promise<GetTransactionsResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
      })
      const response = await apiClient.get(`/payments/transactions?${searchParams}`)
      console.log(response, "response")
      return response.data
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status
      if (status === 403 || status === 401) return null
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = async (transactionId: string) => {
    try {
      const response = await apiClient.get(
        `/payments/invoices/${transactionId}`,
        { responseType: "blob" }
      )
      const url  = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href  = url
      link.setAttribute("download", `invoice-${transactionId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Invoice downloaded")
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status
      if (status === 403 || status === 401) return
      toast.error("Failed to download invoice")
    }
  }

  const recordManualPayment = async (payload: ManualPaymentPayload): Promise<boolean> => {
    setManualPayLoading(true)
    try {
      const response = await apiClient.post("/payments/manual", payload)
      toast.success("Manual payment recorded successfully")
      return true
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status
      if (status === 403 || status === 401) return false
      const errorMessage = err instanceof Error ? err.message : "Failed to record manual payment"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setManualPayLoading(false)
    }
  }

  return {
    loading,
    error,
    invoiceLoading,
    manualPayLoading,
    getTransactions,
    downloadInvoice,
    recordManualPayment,
  }
}