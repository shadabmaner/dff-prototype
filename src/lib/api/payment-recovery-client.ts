import { apiClient } from "@/lib/api-client"

export interface RecoveryStats {
  totalPending: number
  pendingAmount: number
  overdue: number
  dueSoon: number
}

export interface RecoveryPatient {
  patient: {
    id: string
    name: string
    email: string
    phone: string
  }
  program: {
    patientProgramId: string
    specialty_id: string
    program_id: string
    plan_id: string
    name: string
    planName: string
    totalAmount: number
  }
  phases: Array<{
    id: string
    phaseNumber: number
    label: string
    amount: number
    status: string
    paymentStatus: string
    paidAt: string | null
    accessStartsAt: string | null
    accessExpiresAt: string | null
    dueDate: string | null
    isPending: boolean
  }>
  currentPhase: {
    id: string
    phaseNumber: number
    totalPhases: number
    completedPhases: number
    paid_at: string | null
    access_starts_at: string | null
    access_expires_at: string | null
    phaseStatus: string
    paymentStatus: string
  }
  dueDate: string
  daysDifference: number
  daysString: string
  amount: number
  status: 'PENDING' | 'OVERDUE' | 'DUE_SOON'
}

export interface RecoveryPatientsResponse {
  data: RecoveryPatient[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface RecoveryStatsParams {
  dueSoonDays?: number
}

export interface RecoveryPatientsParams {
  page?: number
  limit?: number
  status?: 'PENDING' | 'OVERDUE' | 'DUE_SOON'
  dueSoonDays?: number
  search?: string
}

export async function getRecoveryStats(
  params?: RecoveryStatsParams
): Promise<{ data: RecoveryStats }> {
  const { data } = await apiClient.get<{ data: RecoveryStats }>(
    "/payments/recovery/stats",
    { params }
  )
  return data
}

export async function getRecoveryPatients(
  params?: RecoveryPatientsParams
): Promise<RecoveryPatientsResponse> {
  const { data } = await apiClient.get<RecoveryPatientsResponse>(
    "/payments/recovery/patients",
    { params }
  )
  return data
}
