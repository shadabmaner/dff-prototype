"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

interface RefundActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "approve" | "reject"
  patientName?: string
  requestId?: string
  amount?: number
  paymentMethod?: string
}

const formatAmount = (amount?: number) =>
  amount != null
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
    : "—"

export function RefundActionModal({
  open,
  onOpenChange,
  mode,
  patientName,
  requestId,
  amount,
  paymentMethod,
}: RefundActionModalProps) {
  const [refundTo, setRefundTo] = useState(paymentMethod ?? "Original Payment Method")
  const [rejectionReason, setRejectionReason] = useState("")

  const isApprove = mode === "approve"

  const handleSubmit = () => {
    if (!isApprove && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    if (isApprove) {
      toast.success(`Refund of ${formatAmount(amount)} approved for ${patientName}`)
    } else {
      toast.success(`Refund request rejected for ${patientName}`)
    }
    onOpenChange(false)
    setRejectionReason("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isApprove ? "Approve Refund" : "Reject Refund Request"}</DialogTitle>
          <DialogDescription>
            {isApprove ? (
              <>
                Approving a refund of{" "}
                <span className="font-semibold text-slate-900">{formatAmount(amount)}</span> for{" "}
                <span className="font-semibold text-slate-900">{patientName}</span>.
              </>
            ) : (
              <>
                Rejecting refund request from{" "}
                <span className="font-semibold text-slate-900">{patientName}</span>. Please provide a reason.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isApprove ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="refund-to">Refund To</Label>
                <Select value={refundTo} onValueChange={setRefundTo}>
                  <SelectTrigger id="refund-to" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Original Payment Method">Original Payment Method</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                <p className="text-xs text-emerald-700 font-medium">
                  Refund of {formatAmount(amount)} will be processed via{" "}
                  <span className="font-semibold">{refundTo}</span>.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="rejection-reason">Reason for rejection</Label>
              <textarea
                id="rejection-reason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Service was fully rendered, outside refund window, terms not met..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {isApprove ? (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Approval
            </Button>
          ) : (
            <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleSubmit}>
              <XCircle className="h-4 w-4 mr-2" />
              Confirm Rejection
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}