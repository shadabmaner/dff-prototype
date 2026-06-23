"use client"

import { useState } from "react"
import { RefundRequestList } from "@/components/finance/refund-request-list"
import { RefundActionModal } from "@/components/finance/refund-action-modal"

interface RefundRequest {
  id: string
  patientName: string
  requestDate: Date
  reason: string
  amount: number
  paymentMethod: string
  status: "pending" | "approved" | "rejected"
  priority: "low" | "medium" | "high"
}

export default function RefundsPage() {
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionMode, setActionMode] = useState<"approve" | "reject">("approve")
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null)

  const handleApprove = (request: RefundRequest) => {
    setSelectedRequest(request)
    setActionMode("approve")
    setShowActionModal(true)
  }

  const handleReject = (request: RefundRequest) => {
    setSelectedRequest(request)
    setActionMode("reject")
    setShowActionModal(true)
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Clinic Portal / Finance / Refunds
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Refunds</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Manage refund requests from patients. Approve valid claims or reject with a reason.
            </p>
          </div>
        </div>
      </div>

      {/* Refund Request List */}
      <RefundRequestList
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Action Modal */}
      <RefundActionModal
        open={showActionModal}
        onOpenChange={setShowActionModal}
        mode={actionMode}
        patientName={selectedRequest?.patientName}
        requestId={selectedRequest?.id}
        amount={selectedRequest?.amount}
        paymentMethod={selectedRequest?.paymentMethod}
      />
    </div>
  )
}