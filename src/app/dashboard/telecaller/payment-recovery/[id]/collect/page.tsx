"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  IndianRupee,
  CheckCircle2,
  FileText,
  Upload,
  ArrowLeft,
  X,
  Receipt,
  FileCheck,
  Sparkles,
  User,
  ShieldCheck,
  Calendar,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TelecallerRoleHeaderBadge } from "@/components/telecaller/telecaller-role-switcher"
import { toast } from "sonner"

export default function FullPagePaymentCollection() {
  const params = useParams()
  const router = useRouter()
  const patientId = (params?.id as string) || "HBF-2607-0024"

  const patientName = patientId === "HBF-2607-0024" ? "Shweta Kamble" : "Rekha Kokani"
  const patientPhone = "+91 9876767696"
  const programName = "The Signature 90 days weight loss program"
  const totalPlanValue = 15000
  const phase1Amount = 1899
  const phase2Amount = 13101
  const finalAmount = 13101

  const [discount, setDiscount] = React.useState<string>("")
  const [hasPriorTrial, setHasPriorTrial] = React.useState<boolean>(false)
  const [paymentMode, setPaymentMode] = React.useState<string>("cash")
  const [receiptNumber, setReceiptNumber] = React.useState(`REC-CSH-${Math.floor(100000 + Math.random() * 900000)}`)
  const [utrNumber, setUtrNumber] = React.useState("")
  const [chequeNumber, setChequeNumber] = React.useState("")
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
      toast.success(`Attached "${e.target.files[0].name}" as payment proof!`)
    }
  }

  const handleRecordPayment = () => {
    let refNo = receiptNumber
    if (paymentMode === "upi") {
      if (!utrNumber.trim()) {
        toast.error("Please enter the UPI / UTR reference number")
        return
      }
      refNo = utrNumber.trim()
    } else if (paymentMode === "cheque") {
      if (!chequeNumber.trim()) {
        toast.error("Please enter the Cheque number")
        return
      }
      refNo = chequeNumber.trim()
    }

    toast.success(`Payment of ₹${finalAmount.toLocaleString("en-IN")} recorded successfully!`, {
      description: `Receipt #${refNo} issued for ${patientName}. Protocol access extended by 75 days.`,
    })

    router.push(`/dashboard/telecaller/payment-recovery/${patientId}`)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Top App Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/telecaller/payment-recovery/${patientId}`}
              className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Dashboard</span>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs text-slate-400 font-medium">Payment Recovery</span>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs text-blue-600 font-bold">Collect Payment</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Phase 2 Payment Collection Wizard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-bold text-slate-800">{patientName}</span>
              <span className="text-slate-400 font-mono text-[11px]">({patientId})</span>
            </div>
            <TelecallerRoleHeaderBadge />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 mt-6 space-y-6">
        {/* Stepper Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-9 w-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800">1. Patient Registration</p>
              <p className="text-[10px] text-slate-400">Select Patient & Vitals</p>
            </div>

            <div className="flex-1 h-0.5 bg-[#2563EB] mx-4 -mt-5" />

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-9 w-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800">2. Program Selection</p>
              <p className="text-[10px] text-slate-400">Specialty & Plan Mapping</p>
            </div>

            <div className="flex-1 h-0.5 bg-[#2563EB] mx-4 -mt-5" />

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-9 w-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shadow-md ring-4 ring-blue-100">
                3
              </div>
              <p className="mt-2 text-xs font-bold text-[#2563EB]">3. Payment Configuration</p>
              <p className="text-[10px] text-slate-400">Pricing & Payment Setup</p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-sm space-y-6">
              {/* Heading */}
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 ring-1 ring-blue-100">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Payment Configuration</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record payment collected at reception or via customer online link — choose one-time or phased
                  </p>
                </div>
              </div>

              {/* Payment Type */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Payment Type</Label>
                <div className="rounded-xl border-2 border-blue-500 bg-blue-50/40 p-4.5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Phase / Installment Payment</p>
                    <p className="text-xs text-slate-500">Collecting the next scheduled phase payment for this patient</p>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/60 space-y-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <IndianRupee className="h-3.5 w-3.5 text-slate-600" /> Price Summary
                </p>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Standard Program Price</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">₹{totalPlanValue.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Final Program Price</p>
                    <p className="text-lg font-black text-[#2563EB] mt-0.5">₹{totalPlanValue.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>

              {/* Apply Discount */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Apply Discount (₹)</Label>
                <Input
                  placeholder="Enter discount amount"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  disabled
                  className="h-11 text-xs rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
                />
                <p className="text-[11px] text-slate-400">
                  Discount is locked and cannot be changed when collecting Phase 2 or later payments.
                </p>
              </div>

              {/* Trial Payment Checkbox */}
              <div className="rounded-xl border border-slate-200 p-4 flex items-start gap-3 bg-white">
                <Checkbox
                  id="trial-full"
                  checked={hasPriorTrial}
                  onCheckedChange={(val) => setHasPriorTrial(Boolean(val))}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <label htmlFor="trial-full" className="text-xs font-bold text-slate-900 cursor-pointer">
                    Patient has a prior trial payment
                  </label>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Check if a trial amount was already paid and should be deducted from the balance.
                  </p>
                </div>
              </div>

              {/* Phase 2 Payment Amount */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Phase 2 Payment Amount (₹)</span>
                  <span className="text-rose-500 text-[10px] uppercase tracking-wider font-bold">Mandatory</span>
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={phase2Amount.toLocaleString("en-IN")}
                    readOnly
                    className="pl-9 h-11 text-sm font-black rounded-xl bg-slate-50 text-slate-900 border-slate-200"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Phase 2 amount is determined from the existing payment schedule and cannot be modified.
                </p>
              </div>

              {/* Phase Schedule Table */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  Phase Schedule
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Existing phase schedule from the patient record. Adjusted values reflect the amount you collect today.
                  Total access days across all phases equal 90 days.
                </p>

                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="border-b border-slate-200">
                        <TableHead className="text-xs font-bold text-slate-700 py-3">Phase</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">Standard</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">Adjusted</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 text-center">Access Days</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 text-center">Grace Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-slate-100 bg-white">
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">Phase 1</span>
                            <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px] font-bold">
                              Paid
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-700">
                          ₹{phase1Amount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-emerald-800 bg-emerald-50/50">
                          ₹{phase1Amount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 text-center font-medium">15 days</TableCell>
                        <TableCell className="text-xs text-slate-600 text-center font-medium">0 days</TableCell>
                      </TableRow>

                      <TableRow className="bg-blue-50/20">
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">Phase 2</span>
                            <Badge className="bg-amber-100 text-amber-800 border-none text-[10px] font-bold">
                              Collecting now
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-700">
                          ₹{phase2Amount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-emerald-800 bg-emerald-50/70">
                          ₹{phase2Amount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 text-center font-medium">75 days</TableCell>
                        <TableCell className="text-xs text-slate-600 text-center font-medium">0 days</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Amount Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200 p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Amount to Collect Now (Phase 2)</p>
                    <p className="text-xs text-slate-500">Completes full enrollment & activates 75-day access</p>
                  </div>
                </div>
                <span className="text-3xl font-black text-[#2563EB] tracking-tight">
                  ₹{finalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Payment Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Payment Mode <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="h-11 rounded-xl text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash (In-person at reception)</SelectItem>
                      <SelectItem value="upi">UPI / Dynamic QR Code</SelectItem>
                      <SelectItem value="cheque">Cheque / Demand Draft</SelectItem>
                      <SelectItem value="card">Card / POS Terminal</SelectItem>
                      <SelectItem value="net_banking">Net Banking (IMPS / NEFT)</SelectItem>
                      <SelectItem value="razorpay_link">Razorpay Link (SMS / WhatsApp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  {paymentMode === "cash" && (
                    <>
                      <Label className="text-xs font-semibold text-slate-700">
                        Cash Receipt No. <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        placeholder="e.g. REC-CSH-102910"
                        className="h-11 text-xs rounded-xl bg-white border-slate-200"
                      />
                    </>
                  )}

                  {paymentMode === "upi" && (
                    <>
                      <Label className="text-xs font-semibold text-slate-700">
                        UPI / UTR Ref Number <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 202608159821019"
                        className="h-11 text-xs rounded-xl bg-white border-slate-200"
                      />
                    </>
                  )}

                  {paymentMode === "cheque" && (
                    <>
                      <Label className="text-xs font-semibold text-slate-700">
                        Cheque Number <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        value={chequeNumber}
                        onChange={(e) => setChequeNumber(e.target.value)}
                        placeholder="e.g. CHQ-882190"
                        className="h-11 text-xs rounded-xl bg-white border-slate-200"
                      />
                    </>
                  )}

                  {(paymentMode === "card" || paymentMode === "net_banking" || paymentMode === "razorpay_link") && (
                    <>
                      <Label className="text-xs font-semibold text-slate-700">
                        Transaction / Auth Ref <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. pay_Qx91823901"
                        className="h-11 text-xs rounded-xl bg-white border-slate-200"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Supporting Document Upload */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Attach Supporting Document / Customer Screenshot (Optional)</span>
                  {uploadedFile && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5" /> File Ready
                    </span>
                  )}
                </Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf"
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs shadow-sm">
                    <div className="flex items-center gap-3 truncate">
                      <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-emerald-950 truncate">{uploadedFile.name}</p>
                        <p className="text-[10px] text-emerald-700">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • Attached for finance verification
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer transition-all"
                  >
                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">
                      Upload customer payment screenshot, bank slip, or UPI receipt
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, or PDF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Wizard Progress Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Wizard Progress</h3>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                  Step 3 of 3
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Patient Registration</p>
                    <p className="text-[10px] text-slate-400">Patient confirmed & registered</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Program Selection</p>
                    <p className="text-[10px] text-slate-400">90-Day Signature Program</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#2563EB] font-bold">
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 shadow-md ring-2 ring-blue-200">
                    3
                  </div>
                  <div>
                    <p className="font-black text-blue-700">Payment Configuration</p>
                    <p className="text-[10px] text-blue-500">Collecting Phase 2 (₹13,101)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Breakdown</h3>
              <div className="space-y-2.5 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Total Program Fee</span>
                  <span className="font-bold text-slate-800">₹{totalPlanValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-slate-500">Phase 1 Paid</span>
                  <span className="font-bold text-emerald-600">-₹{phase1Amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-slate-500">Collecting Now (Phase 2)</span>
                  <span className="font-black text-blue-600">₹{phase2Amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <span className="font-bold text-slate-700">Balance Post Collection</span>
                  <span className="font-black text-emerald-600">₹0 (Fully Settled)</span>
                </div>
              </div>
            </div>

            {/* Configuration Tips */}
            <div className="bg-blue-50/60 rounded-2xl border border-blue-200/80 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F56A3]">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Payment Configuration Tips</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 leading-relaxed">
                <li>Confirm whether payment was received at clinic reception or deposited via customer UPI.</li>
                <li>Receipt number is auto-generated but can be replaced with official counter receipt ID.</li>
                <li>Attaching customer payment screenshot ensures immediate clearance by finance desk.</li>
                <li>Recording this payment immediately extends patient protocol access by 75 days.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <Link
            href={`/dashboard/telecaller/payment-recovery/${patientId}`}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/telecaller/payment-recovery/${patientId}`)}
              className="h-11 px-5 rounded-xl border-slate-200 text-xs font-bold gap-1.5 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Patient Overview
            </Button>

            <Button
              type="button"
              onClick={handleRecordPayment}
              className="h-11 px-8 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-500/25 gap-2 transition-all hover:scale-[1.01]"
            >
              <Receipt className="h-4 w-4" />
              <span>Record Manual Payment of ₹{finalAmount.toLocaleString("en-IN")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
