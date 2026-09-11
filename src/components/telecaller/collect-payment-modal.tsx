"use client"

import * as React from "react"
import {
  IndianRupee,
  CreditCard,
  QrCode,
  Send,
  FileText,
  Download,
  CheckCircle2,
  Receipt,
  Banknote,
  Building2,
  Layers,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export interface TransactionRecord {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  mode: "cash" | "upi" | "razorpay_link" | "net_banking" | "cheque"
  status: "paid" | "settled"
  reference?: string
}

interface CollectPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  patientPhone: string
  programName?: string
  totalPlanValue: number
  amountPaidSoFar: number
  pendingBalance: number
  installmentNumber?: number
  transactions?: TransactionRecord[]
  onPaymentSuccess: (patientId: string, payment: {
    amount: number
    mode: string
    receiptNumber: string
    notes: string
  }) => void
}

const DEFAULT_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "tx-1",
    invoiceNumber: "INV-2026-0814",
    date: "2026-08-25T11:30:00Z",
    amount: 2499,
    mode: "upi",
    status: "settled",
    reference: "UPI/2390149019",
  },
  {
    id: "tx-2",
    invoiceNumber: "INV-2026-0902",
    date: "2026-09-01T15:45:00Z",
    amount: 10000,
    mode: "razorpay_link",
    status: "settled",
    reference: "pay_Op91283kaL",
  },
]

export function CollectPaymentModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientPhone,
  programName = "Diabetes Free Forever (DFF)",
  totalPlanValue,
  amountPaidSoFar,
  pendingBalance,
  installmentNumber = 2,
  transactions = DEFAULT_TRANSACTIONS,
  onPaymentSuccess,
}: CollectPaymentModalProps) {
  const [activeTab, setActiveTab] = React.useState<"pay_now" | "invoices">("pay_now")
  const [amountToCollect, setAmountToCollect] = React.useState<number>(
    Math.min(pendingBalance, 14999) || pendingBalance
  )
  const [paymentMode, setPaymentMode] = React.useState<"cash" | "upi" | "razorpay_link" | "net_banking" | "cheque">("cash")
  const [receiptNumber, setReceiptNumber] = React.useState(`REC-CSH-${Math.floor(100000 + Math.random() * 900000)}`)
  const [reference, setReference] = React.useState("")
  const [notes, setNotes] = React.useState("Collected installment balance from patient.")

  React.useEffect(() => {
    if (open) {
      setAmountToCollect(Math.min(pendingBalance, 14999) || pendingBalance)
      setReceiptNumber(`REC-CSH-${Math.floor(100000 + Math.random() * 900000)}`)
    }
  }, [open, pendingBalance])

  const handleRecordPayment = () => {
    if (!amountToCollect || amountToCollect <= 0) {
      toast.error("Please enter a valid payment amount")
      return
    }

    onPaymentSuccess(patientId, {
      amount: amountToCollect,
      mode: paymentMode,
      receiptNumber: paymentMode === "cash" ? receiptNumber : reference || `TXN-${Date.now().toString().slice(-6)}`,
      notes,
    })

    toast.success(`Payment of ₹${amountToCollect.toLocaleString("en-IN")} recorded!`, {
      description: `Mode: ${paymentMode.toUpperCase()} · Receipt #${receiptNumber} generated.`,
    })
    onOpenChange(false)
  }

  const handleSendLink = () => {
    toast.success(`Razorpay Payment Link sent to ${patientPhone}!`, {
      description: `SMS & WhatsApp link for ₹${amountToCollect.toLocaleString("en-IN")} dispatched.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100/70 text-amber-800">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Payment Recovery & Collection Desk
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Manage upcoming installments, collect payments via Cash/Online, and view invoice records.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Financial Summary Card */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Plan Value</p>
            <p className="text-sm font-bold text-slate-900">₹{totalPlanValue.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-slate-500 line-clamp-1">{programName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Paid So Far</p>
            <p className="text-sm font-bold text-emerald-600">₹{amountPaidSoFar.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-emerald-700 font-medium">Phase {installmentNumber - 1} cleared</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Pending Balance</p>
            <p className="text-sm font-bold text-rose-600">₹{pendingBalance.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-rose-700 font-medium">Due for recovery</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="pay_now" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
              <IndianRupee className="mr-1.5 h-3.5 w-3.5" />
              Collect Payment (Pay Now)
            </TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-lg text-xs font-bold data-[state=active]:bg-white">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Invoices & Transaction Ledger
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PAY NOW WIZARD */}
          <TabsContent value="pay_now" className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {/* Amount input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">Amount to Collect (₹)</Label>
                <button
                  type="button"
                  onClick={() => setAmountToCollect(pendingBalance)}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Pay Full Balance (₹{pendingBalance.toLocaleString("en-IN")})
                </button>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  value={amountToCollect}
                  onChange={(e) => setAmountToCollect(Number(e.target.value))}
                  className="pl-9 h-10 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Payment Mode
              </Label>
              <RadioGroup
                value={paymentMode}
                onValueChange={(v: any) => setPaymentMode(v)}
                className="grid grid-cols-2 gap-2"
              >
                {/* 1. Cash */}
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                    paymentMode === "cash"
                      ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <RadioGroupItem value="cash" className="mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                      Cash Payment
                    </span>
                    <p className="text-[10px] text-slate-500">Collected by telecaller / clinic counter</p>
                  </div>
                </label>

                {/* 2. UPI */}
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                    paymentMode === "upi"
                      ? "border-blue-600 bg-blue-50/50 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <RadioGroupItem value="upi" className="mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <QrCode className="h-3.5 w-3.5 text-blue-600" />
                      UPI / QR Code
                    </span>
                    <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm QR</p>
                  </div>
                </label>

                {/* 3. Razorpay Link */}
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                    paymentMode === "razorpay_link"
                      ? "border-purple-600 bg-purple-50/50 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <RadioGroupItem value="razorpay_link" className="mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Send className="h-3.5 w-3.5 text-purple-600" />
                      Razorpay Link
                    </span>
                    <p className="text-[10px] text-slate-500">Instant SMS & WhatsApp link</p>
                  </div>
                </label>

                {/* 4. Net Banking / Cheque */}
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                    paymentMode === "net_banking"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <RadioGroupItem value="net_banking" className="mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                      Net Banking / NEFT
                    </span>
                    <p className="text-[10px] text-slate-500">Direct bank account transfer</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Dynamic Mode Fields */}
            {paymentMode === "cash" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-emerald-900">Physical Cash Receipt Number</Label>
                  <span className="text-[10px] font-semibold text-emerald-700">Auto-Generated</span>
                </div>
                <Input
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="h-9 bg-white text-xs font-bold"
                />
              </div>
            )}

            {paymentMode === "razorpay_link" && (
              <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-purple-900">Send Payment Link Instantly</p>
                    <p className="text-[11px] text-purple-700">Recipient: {patientPhone}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSendLink}
                    className="h-8 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold"
                  >
                    <Send className="mr-1 h-3 w-3" />
                    Send Payment Link
                  </Button>
                </div>
              </div>
            )}

            {paymentMode === "upi" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">UPI Reference / UTR Number</span>
                </div>
                <Input
                  placeholder="Enter 12-digit UTR from GPay / PhonePe..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="h-9 bg-white text-xs"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Telecaller Recovery Remarks</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional recovery notes..."
                className="text-xs rounded-xl resize-none"
              />
            </div>
          </TabsContent>

          {/* TAB 2: INVOICES & LEDGER */}
          <TabsContent value="invoices" className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{tx.invoiceNumber}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(tx.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })} · Mode: <span className="uppercase font-semibold">{tx.mode.replace(/_/g, " ")}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">₹{tx.amount.toLocaleString("en-IN")}</p>
                      <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        {tx.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.success(`Invoice PDF ${tx.invoiceNumber} downloaded`, {
                          description: "Simulated receipt downloaded to local drive.",
                        })
                      }
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Close
          </Button>
          {activeTab === "pay_now" && (
            <Button
              type="button"
              onClick={handleRecordPayment}
              className="rounded-xl bg-[#1F56A3] hover:bg-[#192B42] text-white text-xs font-bold shadow-md"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Confirm & Record Payment (₹{amountToCollect.toLocaleString("en-IN")})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
