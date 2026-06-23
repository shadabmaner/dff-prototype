import { useState } from "react"
import { toast } from "sonner"
import type {
  CreateDoctorReferralRequest,
  CreateDoctorReferralResponse,
  StartDietPlanRequest,
  StartDietPlanResponse,
  UpdateDietPlanRequest,
  UpdateDietPlanResponse,
  GetConsultationHistoryRequest,
  GetConsultationHistoryResponse,
  ConfirmPatientRequestRequest,
  ConfirmPatientRequestResponse,
  ReschedulePatientRequestRequest,
  ReschedulePatientRequestResponse,
} from "@/types/dietitian-api"

export function useDietitianApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createDoctorReferral = async (
    data: CreateDoctorReferralRequest
  ): Promise<CreateDoctorReferralResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/dietitian/doctor-referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create doctor referral")
      }

      const result: CreateDoctorReferralResponse = await response.json()
      toast.success(result.message)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const startDietPlan = async (
    data: StartDietPlanRequest
  ): Promise<StartDietPlanResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/dietitian/diet-plan/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to start diet plan")
      }

      const result: StartDietPlanResponse = await response.json()
      toast.success(result.message)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateDietPlan = async (
    data: UpdateDietPlanRequest
  ): Promise<UpdateDietPlanResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/dietitian/diet-plan/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update diet plan")
      }

      const result: UpdateDietPlanResponse = await response.json()
      toast.success(result.message)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getConsultationHistory = async (
    data: GetConsultationHistoryRequest
  ): Promise<GetConsultationHistoryResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        patientId: data.patientId,
        ...(data.limit && { limit: data.limit.toString() }),
        ...(data.offset && { offset: data.offset.toString() }),
      })

      const response = await fetch(`/api/dietitian/consultation-history?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch consultation history")
      }

      const result: GetConsultationHistoryResponse = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const confirmPatientRequest = async (
    data: ConfirmPatientRequestRequest
  ): Promise<ConfirmPatientRequestResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/dietitian/patient-request/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to confirm patient request")
      }

      const result: ConfirmPatientRequestResponse = await response.json()
      toast.success(result.message)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const reschedulePatientRequest = async (
    data: ReschedulePatientRequestRequest
  ): Promise<ReschedulePatientRequestResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/dietitian/patient-request/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to reschedule patient request")
      }

      const result: ReschedulePatientRequestResponse = await response.json()
      toast.success(result.message)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createDoctorReferral,
    startDietPlan,
    updateDietPlan,
    getConsultationHistory,
    confirmPatientRequest,
    reschedulePatientRequest,
  }
}
