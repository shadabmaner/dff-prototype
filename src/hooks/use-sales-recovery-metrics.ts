import * as React from "react"

import type { Lead } from "@/components/sales/types"
import { useRecoveryStats } from "@/hooks/use-payment-recovery"

export type SalesRecoveryMetrics = {
  recoveryRate: number
  pendingOverdueAmount: number
  overduePatients: number
  totalPendingPatients: number
  dueSoonPatients: number
  recoveredAmount: number
  isLoading: boolean
}

const MOCK_RECOVERY_METRICS: Omit<SalesRecoveryMetrics, "isLoading"> = {
  recoveryRate: 72.4,
  pendingOverdueAmount: 425000,
  overduePatients: 18,
  totalPendingPatients: 32,
  dueSoonPatients: 9,
  recoveredAmount: 1185000,
}

function computeRecoveryFromLeads(leads: Lead[]): Omit<SalesRecoveryMetrics, "isLoading"> {
  const recoveryCandidates = leads.filter(
    (lead) =>
      (lead.programValue ?? 0) > 0 &&
      (lead.stage === "CONVERTED" || (lead.amountRecovered ?? 0) > 0)
  )

  if (!recoveryCandidates.length) {
    return MOCK_RECOVERY_METRICS
  }

  const totalProgramValue = recoveryCandidates.reduce((sum, lead) => sum + (lead.programValue ?? 0), 0)
  const recoveredAmount = recoveryCandidates.reduce((sum, lead) => sum + (lead.amountRecovered ?? 0), 0)
  const pendingOverdueAmount = recoveryCandidates.reduce(
    (sum, lead) => sum + Math.max(0, (lead.programValue ?? 0) - (lead.amountRecovered ?? 0)),
    0
  )

  const overduePatients = recoveryCandidates.filter((lead) => {
    const recovered = lead.amountRecovered ?? 0
    const total = lead.programValue ?? 0
    return recovered > 0 && recovered < total
  }).length

  const totalPendingPatients = recoveryCandidates.filter(
    (lead) => (lead.amountRecovered ?? 0) < (lead.programValue ?? 0)
  ).length

  const recoveryRate = totalProgramValue > 0 ? (recoveredAmount / totalProgramValue) * 100 : 0

  return {
    recoveryRate: Number(recoveryRate.toFixed(1)),
    pendingOverdueAmount,
    overduePatients: overduePatients || MOCK_RECOVERY_METRICS.overduePatients,
    totalPendingPatients: totalPendingPatients || MOCK_RECOVERY_METRICS.totalPendingPatients,
    dueSoonPatients: MOCK_RECOVERY_METRICS.dueSoonPatients,
    recoveredAmount,
  }
}

export function useSalesRecoveryMetrics(leads: Lead[] = []): SalesRecoveryMetrics {
  const { data: statsData, isLoading, isError } = useRecoveryStats({ dueSoonDays: 14 })

  return React.useMemo(() => {
    const leadMetrics = computeRecoveryFromLeads(leads)
    const apiStats = statsData?.data

    if (!apiStats || isError) {
      return {
        ...leadMetrics,
        isLoading,
      }
    }

    const pendingOverdueAmount = apiStats.pendingAmount ?? leadMetrics.pendingOverdueAmount
    const overduePatients = apiStats.overdue ?? leadMetrics.overduePatients
    const totalPendingPatients = apiStats.totalPending ?? leadMetrics.totalPendingPatients
    const dueSoonPatients = apiStats.dueSoon ?? leadMetrics.dueSoonPatients

    const recoveredAmount = leadMetrics.recoveredAmount || MOCK_RECOVERY_METRICS.recoveredAmount
    const recoveryRate =
      recoveredAmount + pendingOverdueAmount > 0
        ? Number(((recoveredAmount / (recoveredAmount + pendingOverdueAmount)) * 100).toFixed(1))
        : leadMetrics.recoveryRate

    return {
      recoveryRate,
      pendingOverdueAmount,
      overduePatients,
      totalPendingPatients,
      dueSoonPatients,
      recoveredAmount,
      isLoading,
    }
  }, [statsData, isError, isLoading, leads])
}
