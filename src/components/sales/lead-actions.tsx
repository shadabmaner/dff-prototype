"use client"

import * as React from "react"
import { MoreHorizontal, UserPlus } from "lucide-react"
import { toast } from "sonner"

import type { Lead, LeadStage } from "@/components/sales/types"
import { useSales } from "@/components/sales/sales-context"
import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function StageMenu({ lead }: { lead: Lead }) {
  const { updateLeadStage } = useSales()

  const stages: LeadStage[] = [
    "NEW",
    "UNASSIGNED",
    "MY_LEAD",
    "HOT",
    "FOLLOW_UP",
    "CONVERTED",
    "DROPPED",
  ]

  return (
    <>
      {stages.map((s) => (
        <DropdownMenuItem
          key={s}
          onClick={() => {
            updateLeadStage(lead.id, s)
            toast.success(`Stage updated to ${s}`)
          }}
        >
          Set stage: {s}
        </DropdownMenuItem>
      ))}
    </>
  )
}

function PaymentLinkDialog({ lead }: { lead: Lead }) {
  const { sendPaymentLink } = useSales()
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState(String(lead.programValue ?? 0))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Send payment link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send payment link</DialogTitle>
          <DialogDescription>
            This will create a mock payment link entry and move the lead to LINK_SENT.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const n = Number(amount)
                if (!Number.isFinite(n) || n <= 0) return
                sendPaymentLink({ leadId: lead.id, amount: n })
                toast.success("Payment link sent")
                setOpen(false)
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CallbackDialog({ leadId }: { leadId: string }) {
  const { scheduleCallback } = useSales()
  const [open, setOpen] = React.useState(false)
  const [scheduledAt, setScheduledAt] = React.useState("")
  const [notes, setNotes] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Schedule callback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule callback</DialogTitle>
          <DialogDescription>Set a follow-up time for this lead.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!scheduledAt) return
                scheduleCallback({ leadId, scheduledAt, notes: notes || undefined })
                toast.success("Callback scheduled")
                setNotes("")
                setScheduledAt("")
                setOpen(false)
              }}
            >
              Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RemarkDialog({ leadId }: { leadId: string }) {
  const { addRemark } = useSales()
  const [open, setOpen] = React.useState(false)
  const [remark, setRemark] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add remark
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add remark</DialogTitle>
          <DialogDescription>Save a note against this lead.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Remark..." />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!remark.trim()) return
                addRemark(leadId, remark.trim())
                toast.success("Remark added")
                setRemark("")
                setOpen(false)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function HistoryDialog({ lead }: { lead: Lead }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Lead history</DialogTitle>
          <DialogDescription>{lead.id} • {lead.patientName}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[360px] space-y-2 overflow-auto rounded-md border p-3 text-sm">
          {lead.history.length ? (
            lead.history.map((e) => (
              <div key={e.id} className="flex items-start justify-between gap-4">
                <div className="font-medium">{e.action}</div>
                <div className="shrink-0 text-muted-foreground">{new Date(e.at).toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No history</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function LeadActions({ lead }: { lead: Lead }) {
  const { reassignLead } = useSales()
  const { hasPermission } = useAuth()

  const canReassign = hasPermission("admin")

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-slate-200/80 bg-white/90 px-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
        onClick={() => {
          if (!canReassign) {
            toast.error("You don't have permission to reassign leads")
            return
          }
          reassignLead(lead.id, "sales-1")
          toast.success(lead.assignedTo ? "Lead reassigned" : "Lead assigned")
        }}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {lead.assignedTo ? "Reassign" : "Assign"}
      </Button>
      <RemarkDialog leadId={lead.id} />
      <HistoryDialog lead={lead} />
      <PaymentLinkDialog lead={lead} />
      <CallbackDialog leadId={lead.id} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <StageMenu lead={lead} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
