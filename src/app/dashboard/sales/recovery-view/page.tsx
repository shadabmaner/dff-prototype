"use client"

import { useSales } from "@/components/sales/sales-context"
import { EnhancedRecoveryView } from "@/components/sales/enhanced-recovery-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function RecoveryViewPage() {
  const { leads } = useSales()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Recovery Visibility</h1>
        <p className="text-sm text-gray-500">
          Program value and amount recovered (Read Only)
        </p>
      </div>

      <EnhancedRecoveryView data={leads} />
    </div>
  )
}
