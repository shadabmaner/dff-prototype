import { useState } from "react"
import { apiClient } from "@/lib/api-client"

export interface GetInstallmentsParams {
  patientProgramId?: string
  page?: number
  limit?: number
}

export function useInstallmentsApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const getInstallments = async (params: GetInstallmentsParams = {}) => {
    setLoading(true)
    setError(null)
    try {
      const { patientProgramId, page = 1, limit = 10 } = params

      const url = patientProgramId
        ? `/payments/installments/${patientProgramId}`
        : `/payments/installments`

      const response = await apiClient.get(url, { params: { page, limit } })

      console.log(response, "response")

      return response.data

    } catch (err: any) {
      const status = err?.response?.status ?? err?.status

      // 403/401 → silently return null (component shows empty state)
      if (status === 403 || status === 401 || status ===404) return null

      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { getInstallments, loading, error }
}