"use client"

import { Input } from "@/components/ui/input"

import { useState, useRef } from "react"
import {
  Eye,
  Upload,
  FileText,
  Loader2,
  ShoppingCart,
  Lock,
  Unlock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  useClinicalGroceryList,
  useUpdateClinicalGroceryList,
  useGeneratePhasePdf,
} from "@/hooks/use-clinical-diet-plan"
import { useUploadGroceryPdf } from "@/hooks/use-grocery"
import { type ClinicalGroceryPhase } from "@/lib/api/clinical-diet-plan-client"

type PdfType = "grocery" | "diet"

interface GroceryListTabProps {
  patientId?: string
  dietPlanId: string | null | undefined
  readOnly?: boolean
}

function getPdfUrl(phase: ClinicalGroceryPhase, type: PdfType): string {
  if (type === "grocery") {
    return (
      (phase as any).grocery_list_config?.url ??
      (phase as any).grocery_list_config?.pdf_url ??
      phase.pdf_url ??
      ""
    )
  }
  return (
    (phase as any).diet_pdf_config?.url ??
    (phase as any).diet_pdf_config?.pdf_url ??
    ""
  )
}

function getPdfName(phase: ClinicalGroceryPhase, type: PdfType): string {
  if (type === "grocery") {
    return (phase as any).grocery_list_config?.name ?? "Grocery List"
  }
  return (phase as any).diet_pdf_config?.name ?? "Diet Phase PDF"
}

function getPdfStatus(phase: ClinicalGroceryPhase, type: PdfType): "unlocked" | "locked" {
  const s =
    type === "grocery"
      ? ((phase as any).grocery_list_config?.status ?? phase.status)
      : (phase as any).diet_pdf_config?.status
  return (s as "unlocked" | "locked") ?? "locked"
}

export default function GroceryListTab({
  patientId,
  dietPlanId,
  readOnly = false,
}: GroceryListTabProps) {
  const {
    data: groceryResponse,
    isLoading,
    error,
  } = useClinicalGroceryList(dietPlanId)

  const updateGrocery = useUpdateClinicalGroceryList()
  const uploadPdf = useUploadGroceryPdf()
  const generatePhasePdf = useGeneratePhasePdf()

  const [editingState, setEditingState] = useState<{
    phase: ClinicalGroceryPhase
    pdfType: PdfType
    uploadedFileUrl: string
    status: "unlocked" | "locked"
    selectedFileName: string
    name: string
  } | null>(null)

  const handleGeneratePdf = async (phase: ClinicalGroceryPhase) => {
    if (!patientId || !dietPlanId) {
      toast.error("Patient ID or Diet Plan ID is missing")
      return
    }

    try {
      toast.loading("Generating PDF...", { id: "generate-pdf" })
      const result = await generatePhasePdf.mutateAsync({
        patientId,
        dietPlanId,
        phaseNumber: phase.phase_number,
      })
      toast.success("PDF generated successfully!", { id: "generate-pdf" })
      if (result.pdf_url) {
        // The query invalidation in useGeneratePhasePdf should handle refreshing the data
        // but we can also provide immediate feedback by opening the URL if desired
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate PDF", { id: "generate-pdf" })
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const rawPhases: ClinicalGroceryPhase[] =
    groceryResponse?.data?.phases ?? groceryResponse?.phases ?? []

  const phases: ClinicalGroceryPhase[] = rawPhases.map((phase: any, index: number) => {
    const normalizedPhaseNumber =
      typeof phase.phase_number === "number" && phase.phase_number > 0
        ? phase.phase_number
        : index + 1

    const groceryUrl =
      phase.grocery_list_config?.url ??
      phase.grocery_list_config?.pdf_url ??
      phase.pdf_url ??
      null

    const groceryStatus =
      phase.grocery_list_config?.status ??
      phase.status ??
      "locked"

    return {
      ...phase,
      phase_number: normalizedPhaseNumber,
      pdf_url: groceryUrl,
      status: groceryStatus,
    }
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingState) return

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setEditingState((prev) => prev ? { ...prev, selectedFileName: file.name } : null)

    try {
      const fileUrl = await uploadPdf.mutateAsync(file)
      setEditingState((prev) => prev ? { ...prev, uploadedFileUrl: fileUrl } : null)
      toast.success("PDF uploaded successfully!")
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload PDF")
      setEditingState((prev) =>
        prev ? { ...prev, selectedFileName: "", uploadedFileUrl: "" } : null
      )
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const openUpdateDialog = (phase: ClinicalGroceryPhase, pdfType: PdfType) => {
    setEditingState({
      phase,
      pdfType,
      uploadedFileUrl: getPdfUrl(phase, pdfType),
      status: getPdfStatus(phase, pdfType),
      selectedFileName: "",
      name: getPdfName(phase, pdfType) === (pdfType === "grocery" ? "Grocery List" : "Diet Phase PDF") ? "" : getPdfName(phase, pdfType),
    })
  }

  const handleUpdate = async () => {
    if (!dietPlanId || !editingState) return

    if (!editingState.uploadedFileUrl) {
      toast.error("Please upload a PDF")
      return
    }

    if (!editingState.name?.trim()) {
      toast.error("Please enter a document name")
      return
    }

    const { phase, pdfType, uploadedFileUrl, status, name } = editingState
    const configKey = pdfType === "grocery" ? "grocery_list_config" : "diet_pdf_config"

    try {
      await updateGrocery.mutateAsync({
        dietPlanId,
        data: {
          phase_number: phase.phase_number,
          [configKey]: {
            url: uploadedFileUrl,
            status: status,
            is_unlocked: status === "unlocked",
            name: name || undefined,
          },
        },
      })
      toast.success(
        pdfType === "grocery" ? "Grocery list updated!" : "Diet PDF updated!"
      )
      resetDialog()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          `Failed to update ${pdfType === "grocery" ? "grocery list" : "diet PDF"}`
      )
    }
  }

  const resetDialog = () => {
    setEditingState(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const isDialogOpen = editingState !== null
  const pdfTypeLabel =
    editingState?.pdfType === "grocery" ? "Grocery List" : "Diet Phase PDF"

  if (!dietPlanId) {
    return (
      <Card className="border border-dashed border-slate-300 bg-white/50">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <ShoppingCart className="h-10 w-10 text-slate-200" />
          <p className="text-sm text-slate-400">No active diet plan to show phase PDFs</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-sm text-slate-500">Loading phase PDFs...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <AlertCircle className="h-8 w-8 text-rose-400" />
          <p className="text-sm text-rose-600">{error.message || "Failed to load phase PDFs"}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border border-slate-200/80 bg-white shadow-md overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Phase PDFs</h3>
                <p className="text-xs text-slate-500">
                  {phases.length} phase{phases.length !== 1 ? "s" : ""} · Grocery list & diet overview per phase
                </p>
              </div>
            </div>
          </div>

          {phases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <ShoppingCart className="h-10 w-10 text-slate-200" />
              <p className="text-sm text-slate-400">No grocery phases found</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {phases.map((phase: any) => {
                  const groceryUrl = getPdfUrl(phase, "grocery")
                  const dietUrl = getPdfUrl(phase, "diet")
                  const groceryStatus = getPdfStatus(phase, "grocery")
                  const dietStatus = getPdfStatus(phase, "diet")

                  return (
                    <div
                      key={phase.phase_number}
                      className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-md transition-all"
                    >
                      {/* Phase header */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0 shadow-md">
                          <span className="text-xs font-black text-white">
                            P{phase.phase_number}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {phase.phase_name || `Phase ${phase.phase_number}`}
                          </p>
                          {(phase.start_day != null || phase.end_day != null) && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              Day {phase.start_day} – {phase.end_day}
                              {phase.duration_days != null && ` · ${phase.duration_days}d`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* PDF cards stacked vertically */}
                      <div className="space-y-3">
                      {/* Grocery List card */}
                      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                              {getPdfName(phase, "grocery")}
                            </span>
                          </div>
                          <Badge
                            className={cn(
                              "text-[9px] font-bold",
                              groceryStatus === "unlocked"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            )}
                          >
                            {groceryStatus === "unlocked" ? (
                              <Unlock className="h-2.5 w-2.5 mr-1" />
                            ) : (
                              <Lock className="h-2.5 w-2.5 mr-1" />
                            )}
                            {groceryStatus}
                          </Badge>
                        </div>

                        {groceryUrl ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>PDF available</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No PDF uploaded</p>
                        )}

                        <div className="flex gap-2">
                          {groceryUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] border-slate-200 text-slate-600 hover:bg-slate-50 flex-1"
                              onClick={() => window.open(groceryUrl, "_blank")}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                          {!readOnly && (
                            <Button
                              size="sm"
                              className="h-7 text-[11px] bg-slate-900 hover:bg-slate-800 text-white flex-1"
                              onClick={() => openUpdateDialog(phase, "grocery")}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              {groceryUrl ? "Update" : "Upload"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Diet Phase PDF card */}
                      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-indigo-600" />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                              {getPdfName(phase, "diet")}
                            </span>
                          </div>
                          <Badge
                            className={cn(
                              "text-[9px] font-bold",
                              dietStatus === "unlocked"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            )}
                          >
                            {dietStatus === "unlocked" ? (
                              <Unlock className="h-2.5 w-2.5 mr-1" />
                            ) : (
                              <Lock className="h-2.5 w-2.5 mr-1" />
                            )}
                            {dietStatus}
                          </Badge>
                        </div>

                        {dietUrl ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>PDF available</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No PDF uploaded</p>
                        )}
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            {dietUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] border-slate-200 text-slate-600 hover:bg-slate-50 flex-1"
                                onClick={() => window.open(dietUrl, "_blank")}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                            {!readOnly && (
                              <Button
                                size="sm"
                                className="h-7 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white flex-1"
                                onClick={() => openUpdateDialog(phase, "diet")}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                {dietUrl ? "Update" : "Upload"}
                              </Button>
                            )}
                          </div>
                          {!readOnly && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] border-slate-200 text-slate-600 hover:bg-slate-50 w-full"
                              onClick={() => handleGeneratePdf(phase)}
                              disabled={generatePhasePdf.isPending}
                            >
                              {generatePhasePdf.isPending ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <FileText className="h-3 w-3 mr-1" />
                              )}
                              Generate PDF
                            </Button>
                          )}
                        </div>
                      </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload / Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="sm:max-w-[520px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Update {pdfTypeLabel}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {editingState?.phase.phase_name || `Phase ${editingState?.phase.phase_number}`}
              {" — "}Upload a new PDF or update the access status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Upload {pdfTypeLabel} PDF
              </Label>
              <div
                className={cn(
                  "relative rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30",
                  uploadPdf.isPending
                    ? "border-amber-300 bg-amber-50/30"
                    : editingState?.selectedFileName
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-slate-300"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {uploadPdf.isPending ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <p className="text-sm font-medium text-amber-700">Uploading...</p>
                  </div>
                ) : editingState?.selectedFileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <p className="text-sm font-medium text-emerald-700">
                      {editingState.selectedFileName}
                    </p>
                    <p className="text-xs text-slate-400">Click to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">Click to upload PDF</p>
                    <p className="text-xs text-slate-400">Max 10MB · PDF only</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Document Name
              </Label>
              <Input
                placeholder={`e.g. ${pdfTypeLabel}`}
                value={editingState?.name || ""}
                onChange={(e) =>
                  setEditingState((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className="h-11 border-slate-300 focus-visible:ring-emerald-500"
              />
            </div>

            {editingState?.uploadedFileUrl && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">PDF URL</Label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-600 truncate max-w-[200px] flex-1">
                    {editingState.uploadedFileUrl}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() => window.open(editingState.uploadedFileUrl, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Access Status</Label>
              <Select
                value={editingState?.status ?? "locked"}
                onValueChange={(v) =>
                  setEditingState((prev) =>
                    prev ? { ...prev, status: v as "unlocked" | "locked" } : null
                  )
                }
              >
                <SelectTrigger className="h-11 border-slate-300 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlocked">
                    <div className="flex items-center gap-2">
                      <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                      Unlocked
                    </div>
                  </SelectItem>
                  <SelectItem value="locked">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      Locked
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={resetDialog}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={updateGrocery.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={updateGrocery.isPending || uploadPdf.isPending || !editingState?.uploadedFileUrl || !editingState?.name?.trim()}
            >
              {updateGrocery.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
