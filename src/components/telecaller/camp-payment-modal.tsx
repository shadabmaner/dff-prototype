"use client"

import * as React from "react"
import {
  IndianRupee,
  CreditCard,
  Send,
  Copy,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useResidentialCampStore, type CampPatient } from "@/store/residential-camp-store"
import { toast } from "sonner"

interface CampPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: CampPatient | null
  onPaymentSuccess?: () => void
}

export function CampPaymentModal({
  open,
  onOpenChange,
  patient,
  onPaymentSuccess,
}: CampPaymentModalProps) {
  const { recordPayment } = useResidentialCampStore()

  const [amount, setAmount] = React.useState(35000)
  const [paymentMode, setPaymentMode] = React.useState("razorpay_link")
  const [transactionRef, setTransactionRef] = React.useState(`pay_rzp_${Date.now().toString().slice(-6)}`)
  const [generatedLink, setGeneratedLink] = React.useState("https://rzp.io/l/dff-residential-camp-2026")
  const [isCopied, setIsCopied] = React.useState(false)

  React.useEffect(() => {
    if (patient) {
      setAmount(patient.proposedFee || 35000)
      setTransactionRef(`pay_rzp_${Date.now().toString().slice(-6)}`)
      setGeneratedLink(`https://rzp.io/l/dff-residential-camp-${patient.id.toLowerCase()}`)
    }
  }, [patient])

  if (!patient) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink)
    setIsCopied(true)
    toast.success("Razorpay payment link copied to clipboard!")
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSendLink = () => {
    toast.success(`Payment link sent to ${patient.name} via WhatsApp!`, {
      description: `Amount: ₹${amount.toLocaleString("en-IN")} · Link: ${generatedLink}`,
    })
  }

  const handleConfirmPaid = () => {
    recordPayment(patient.id, {
      amount,
      mode: paymentMode,
      reference: transactionRef,
    })

    toast.success(`Seat Reserved! Payment of ₹${amount.toLocaleString("en-IN")} recorded for ${patient.name}`, {
      description: `Ref: ${transactionRef} · Mode: ${paymentMode.toUpperCase()}`,
    })

    onPaymentSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Residential Camp Seat Booking Fee
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Generate Razorpay payment link or record offline / settled payment for 7-day retreat.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Patient recap */}
        <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-900">{patient.name}</p>
              <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold">
                {patient.id}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">{patient.program} · {patient.city}</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-900 font-bold text-xs">
            Fee: ₹{amount.toLocaleString("en-IN")}
          </Badge>
        </div>

        <div className="space-y-4 pt-1">
          {/* Payment Link Card */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700">
                Razorpay Payment Link
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSendLink}
                className="h-7 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 px-2 rounded-lg"
              >
                <Send className="mr-1 h-3 w-3" />
                Send via WhatsApp
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={generatedLink}
                className="h-9 text-xs rounded-xl font-mono bg-white text-slate-700"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-9 px-3 rounded-xl text-xs font-bold shrink-0"
              >
                {isCopied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-slate-500">
              Patient can pay via UPI, Credit/Debit Card, or NetBanking directly into DFF Razorpay account.
            </p>
          </div>

          {/* Record manual / settled transaction */}
          <div className="space-y-3 pt-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Or Record Settled Payment
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="h-10 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="razorpay_link">Razorpay Link (UPI/Card)</SelectItem>
                    <SelectItem value="upi_direct">Direct UPI QR</SelectItem>
                    <SelectItem value="bank_transfer">NEFT / IMPS Transfer</SelectItem>
                    <SelectItem value="pos_card">POS Terminal / Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Amount Received</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="pl-7 h-10 text-xs font-bold rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Transaction Reference ID</Label>
              <Input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. pay_Razorpay_123456"
                className="h-10 text-xs rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-bold"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleConfirmPaid}
            className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Mark Seat Reserved (₹{amount.toLocaleString("en-IN")})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
