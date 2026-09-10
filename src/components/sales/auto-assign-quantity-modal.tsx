"use client"

import * as React from "react"
import {
  Users,
  CheckCircle2,
  ArrowUpDown,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { Telecaller } from "@/hooks/use-telecallers"

interface AutoAssignQuantityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workstreamName: string
  totalPendingCount: number
  telecallers: Telecaller[]
  onAssign: (quantity: number, selectedTelecallerIds: string[]) => Promise<void> | void
}

export function AutoAssignQuantityModal({
  open,
  onOpenChange,
  workstreamName,
  totalPendingCount,
  telecallers,
  onAssign,
}: AutoAssignQuantityModalProps) {
  const [quantity, setQuantity] = React.useState<number>(Math.min(200, totalPendingCount || 50))
  const [selectedTelecallerIds, setSelectedTelecallerIds] = React.useState<string[]>([])
  const [isAssigning, setIsAssigning] = React.useState(false)

  // Initialize selected telecallers when modal opens or telecallers change
  React.useEffect(() => {
    if (open && telecallers.length > 0) {
      const activeIds = telecallers
        .filter((tc) => tc.is_active !== false)
        .map((tc) => tc.id)
      setSelectedTelecallerIds(activeIds)
      setQuantity(Math.min(200, totalPendingCount || 50))
    }
  }, [open, telecallers, totalPendingCount])

  const activeTelecallers = React.useMemo(() => {
    return telecallers.filter((tc) => tc.is_active !== false)
  }, [telecallers])

  const selectedCount = selectedTelecallerIds.length
  const leadsPerTelecaller = selectedCount > 0 ? Math.floor(quantity / selectedCount) : 0
  const remainder = selectedCount > 0 ? quantity % selectedCount : 0

  const handleToggleTelecaller = (id: string) => {
    setSelectedTelecallerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTelecallerIds(activeTelecallers.map((tc) => tc.id))
    } else {
      setSelectedTelecallerIds([])
    }
  }

  const handleQuantityChange = (value: number) => {
    const clamped = Math.max(1, Math.min(value || 1, totalPendingCount || 1))
    setQuantity(clamped)
  }

  const handleConfirmAssignment = async () => {
    if (selectedCount === 0) {
      toast.error("Please select at least one active telecaller to receive assignments.")
      return
    }
    if (quantity <= 0 || quantity > totalPendingCount) {
      toast.error(`Please enter a valid quantity between 1 and ${totalPendingCount}.`)
      return
    }

    setIsAssigning(true)
    try {
      await onAssign(quantity, selectedTelecallerIds)
      toast.success(
        `Successfully auto-assigned ${quantity} leads in FIFO order across ${selectedCount} telecallers (~${leadsPerTelecaller} leads each)!`
      )
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "Failed to auto-assign leads")
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] rounded-3xl p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
              <div className="p-2 rounded-xl bg-[#1F56A3]/10 text-[#1F56A3]">
                <Layers className="h-5 w-5" />
              </div>
              Auto-Assign Leads: {workstreamName}
            </DialogTitle>
            <Badge variant="outline" className="bg-blue-50 text-[#1F56A3] border-blue-200 font-bold text-xs">
              {totalPendingCount} Pending Unassigned
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Specify the batch quantity to auto-allocate among specialized telecallers in strict FIFO arrival order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* FIFO Ascending Order Banner */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-3.5 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white mt-0.5">
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-blue-950">Ascending Order of Arrival (FIFO / Oldest First)</p>
              <p className="text-blue-800/80 mt-0.5 leading-relaxed">
                Leads that registered earliest and have waited the longest will be picked first, ensuring prompt customer outreach and compliance with service SLAs.
              </p>
            </div>
          </div>

          {/* Quantity Input Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Select Quantity to Assign
              </label>
              <span className="text-xs font-medium text-slate-500">
                Max available: <strong className="text-slate-900">{totalPendingCount}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={totalPendingCount}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                className="h-11 rounded-xl font-bold text-base w-36 border-slate-200"
              />
              <div className="flex flex-wrap gap-1.5 flex-1">
                {[50, 100, 200, 500].map((num) => {
                  if (num > totalPendingCount && num !== 50) return null
                  return (
                    <Button
                      key={num}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(num)}
                      className={`h-9 px-3 rounded-xl text-xs font-bold ${
                        quantity === num ? "bg-[#1F56A3] text-white hover:bg-[#192B42]" : ""
                      }`}
                    >
                      {num} Leads
                    </Button>
                  )
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(totalPendingCount)}
                  className={`h-9 px-3 rounded-xl text-xs font-bold ${
                    quantity === totalPendingCount ? "bg-[#1F56A3] text-white hover:bg-[#192B42]" : ""
                  }`}
                >
                  All ({totalPendingCount})
                </Button>
              </div>
            </div>
          </div>

          {/* Target Telecaller Pool Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Target Telecaller Team ({selectedCount} of {activeTelecallers.length} selected)
              </label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all-tcs"
                  checked={selectedCount === activeTelecallers.length && activeTelecallers.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                />
                <label htmlFor="select-all-tcs" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Select All Active
                </label>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 max-h-44 overflow-y-auto pr-1">
              {activeTelecallers.map((tc) => {
                const isSelected = selectedTelecallerIds.includes(tc.id)
                return (
                  <div
                    key={tc.id}
                    onClick={() => handleToggleTelecaller(tc.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/60 border-blue-200 text-slate-900"
                        : "bg-slate-50/40 border-slate-200/60 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleTelecaller(tc.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{tc.name || "Telecaller"}</p>
                      <p className="text-[10px] text-slate-500">
                        {tc.patientCount ?? 0} assigned • {tc.conversionRate?.toFixed(1) ?? 0}% conv.
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Distribution Preview Math Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Distribution Preview</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {selectedCount > 0 ? (
                  <>
                    <span className="text-[#1F56A3]">{quantity} leads</span> distributed evenly across{" "}
                    <span className="text-emerald-700">{selectedCount} telecallers</span> (~{leadsPerTelecaller} leads each
                    {remainder > 0 ? `, with ${remainder} remainder allocated` : ""})
                  </>
                ) : (
                  <span className="text-rose-600">Please select at least 1 telecaller</span>
                )}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAssigning}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAssignment}
            disabled={isAssigning || selectedCount === 0 || quantity <= 0}
            className="bg-[#1F56A3] hover:bg-[#192B42] text-white font-bold"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning Leads...
              </>
            ) : (
              `Assign ${quantity} Leads in FIFO Order`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
