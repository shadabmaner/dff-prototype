"use client"

import { AlertTriangle, IndianRupee, PhoneCall, TrendingUp, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { useSalesRecoveryMetrics } from "@/hooks/use-sales-recovery-metrics"
import type { Lead } from "@/components/sales/types"
import { StatCard } from "@/components/ui/stat-card"

type SalesRecoveryOverviewProps = {
  leads?: Lead[]
  recoveryRoute?: string
  title?: string
}

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function SalesRecoveryOverview({
  leads = [],
  recoveryRoute = "/dashboard/sales/recovery-view",
  title = "Payment Recovery",
}: SalesRecoveryOverviewProps) {
  const router = useRouter()
  const metrics = useSalesRecoveryMetrics(leads)

  const cards = [
    {
      title: "Recovery Rate",
      value: `${metrics.recoveryRate.toFixed(1)}%`,
      subtitle: `${formatINR(metrics.recoveredAmount)} recovered`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Pending Overdue",
      value: formatINR(metrics.pendingOverdueAmount),
      subtitle: "Amount due from partial payers",
      icon: IndianRupee,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Overdue Patients",
      value: metrics.overduePatients.toLocaleString("en-IN"),
      subtitle: "Available for recovery calls",
      icon: PhoneCall,
      gradient: "from-rose-500 to-red-600",
      route: recoveryRoute,
    },
    {
      title: "Pending Recovery",
      value: metrics.totalPendingPatients.toLocaleString("en-IN"),
      subtitle: `${metrics.dueSoonPatients} due within 14 days`,
      icon: Users,
      gradient: "from-[#1F56A3] to-[#192B42]",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">
            Track partial payments, overdue balances, and recovery call opportunities
          </p>
        </div>
        {metrics.overduePatients > 0 && (
          <div className="hidden items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 md:flex">
            <AlertTriangle className="h-3.5 w-3.5" />
            {metrics.overduePatients} patients need recovery calls
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => card.route && router.push(card.route)}
            className={card.route ? "cursor-pointer" : undefined}
          >
            <StatCard
              title={card.title}
              value={metrics.isLoading ? "—" : card.value}
              icon={card.icon}
              gradient={card.gradient}
              subtitle={card.subtitle}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
