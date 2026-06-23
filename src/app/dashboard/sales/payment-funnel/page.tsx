"use client"

import * as React from "react"
import { CreditCard, Sparkles, TrendingUp } from "lucide-react"

import { useSales } from "@/components/sales/sales-context"
import { EnhancedPaymentFunnel } from "@/components/sales/enhanced-payment-funnel"

export default function PaymentFunnelPage() {
  const { leads } = useSales()
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Sales Portal / Payment Funnel</p>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Revenue Conversion Workspace</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">Track movement from interested to recovered with better conversion visibility and a polished pipeline table.</p>
        </div>
      </div>

      <EnhancedPaymentFunnel data={leads} />
    </div>
  )
}
