import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PaymentStatus, PatientStatus, CallStatus, AssessmentStatus, PlanChangeStatus } from "@/types/service"

interface StatusBadgeProps {
  status: PaymentStatus | PatientStatus | CallStatus | AssessmentStatus | PlanChangeStatus | string
  type?: "payment" | "patient" | "call" | "assessment" | "planChange"
}

export function StatusBadge({ status, type = "payment" }: StatusBadgeProps) {
  const getStyles = () => {
    if (type === "payment") {
      switch (status) {
        case "paid":
          return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case "pending":
          return "bg-amber-50 text-amber-700 border-amber-200"
        case "failed":
          return "bg-rose-50 text-rose-700 border-rose-200"
        case "refunded":
          return "bg-slate-50 text-slate-700 border-slate-200"
        default:
          return "bg-slate-50 text-slate-700 border-slate-200"
      }
    }
    
    if (type === "patient") {
      switch (status) {
        case "active":
          return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case "pending":
          return "bg-amber-50 text-amber-700 border-amber-200"
        case "inactive":
          return "bg-slate-50 text-slate-700 border-slate-200"
        case "completed":
          return "bg-blue-50 text-blue-700 border-blue-200"
        default:
          return "bg-slate-50 text-slate-700 border-slate-200"
      }
    }
    
    if (type === "call") {
      switch (status) {
        case "completed":
          return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case "scheduled":
          return "bg-blue-50 text-blue-700 border-blue-200"
        case "pending":
          return "bg-amber-50 text-amber-700 border-amber-200"
        case "missed":
          return "bg-rose-50 text-rose-700 border-rose-200"
        default:
          return "bg-slate-50 text-slate-700 border-slate-200"
      }
    }
    
    if (type === "assessment") {
      switch (status) {
        case "completed":
          return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case "in_progress":
          return "bg-blue-50 text-blue-700 border-blue-200"
        case "pending":
          return "bg-amber-50 text-amber-700 border-amber-200"
        default:
          return "bg-slate-50 text-slate-700 border-slate-200"
      }
    }
    
    if (type === "planChange") {
      switch (status) {
        case "approved":
          return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case "pending":
          return "bg-amber-50 text-amber-700 border-amber-200"
        case "rejected":
          return "bg-rose-50 text-rose-700 border-rose-200"
        case "in_review":
          return "bg-blue-50 text-blue-700 border-blue-200"
        default:
          return "bg-slate-50 text-slate-700 border-slate-200"
      }
    }
    
    return "bg-slate-50 text-slate-700 border-slate-200"
  }

  return (
    <Badge className={cn("text-xs font-semibold border", getStyles())}>
      {status.replace(/_/g, " ").toUpperCase()}
    </Badge>
  )
}
