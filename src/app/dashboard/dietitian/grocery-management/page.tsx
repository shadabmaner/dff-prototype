"use client"

import { useState, useRef } from "react"
import {
  Search,
  Eye,
  Upload,
  FileText,
  Loader2,
  ShoppingCart,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BookOpen,
  X,
  Calendar,
  Sparkles,
  Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useDietTemplates } from "@/hooks/use-diet-template"
import {
  useTemplatePhases,
  useUpdatePhaseConfigs,
  useUploadGroceryPdf,
} from "@/hooks/use-grocery"
import type { GroceryPhase } from "@/types/grocery"

type PdfType = "grocery" | "diet"

interface EditingState {
  phase: GroceryPhase
  pdfType: PdfType
  uploadedFileUrl: string
  selectedFileName: string
  name: string
}

function getPdfUrl(phase: GroceryPhase, type: PdfType): string {
  if (type === "grocery") {
    return (
      phase.grocery_list_config?.url ??
      phase.grocery_list_config?.pdf_url ??
      phase.grocery_list_pdf_url ??
      ""
    )
  }
  return phase.diet_pdf_config?.url ?? phase.diet_pdf_config?.pdf_url ?? ""
}

function getPdfName(phase: GroceryPhase, type: PdfType): string {
  if (type === "grocery") {
    return phase.grocery_list_config?.name ?? "Grocery List"
  }
  return phase.diet_pdf_config?.name ?? "Diet Phase PDF"
}

export default function GroceryManagementPage() {
  const { data: templates, isLoading: templatesLoading } = useDietTemplates()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data: phasesResponse,
    isLoading: phasesLoading,
    error: phasesError,
  } = useTemplatePhases(selectedTemplateId)

  const updatePhaseConfigs = useUpdatePhaseConfigs()
  const uploadPdf = useUploadGroceryPdf()

  const [editingState, setEditingState] = useState<EditingState | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const templatesList: any[] = templates?.data ?? []
  const phases: GroceryPhase[] = Array.isArray(phasesResponse)
    ? phasesResponse
    : (phasesResponse as any)?.data ?? []

  const filteredTemplates = templatesList.filter(
    (t: any) =>
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedTemplate = templatesList.find(
    (t: any) => t.id === selectedTemplateId
  )

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

  const openUpdateDialog = (phase: GroceryPhase, pdfType: PdfType) => {
    setEditingState({
      phase,
      pdfType,
      uploadedFileUrl: getPdfUrl(phase, pdfType),
      selectedFileName: "",
      name: getPdfName(phase, pdfType) === (pdfType === "grocery" ? "Grocery List" : "Diet Phase PDF") ? "" : getPdfName(phase, pdfType),
    })
  }

  const handleUpdate = async () => {
    if (!selectedTemplateId || !editingState) return

    if (!editingState.uploadedFileUrl) {
      toast.error("Please upload a PDF first")
      return
    }

    if (!editingState.name?.trim()) {
      toast.error("Please enter a document name")
      return
    }

    const { phase, pdfType, uploadedFileUrl, name } = editingState
    const payload =
      pdfType === "grocery"
        ? {
            grocery_list_config: {
              url: uploadedFileUrl,
              name: name || undefined,
            },
          }
        : {
            diet_pdf_config: {
              url: uploadedFileUrl,
              name: name || undefined,
            },
          }

    try {
      await updatePhaseConfigs.mutateAsync({
        templateId: selectedTemplateId,
        phaseNumber: phase.phase_number,
        data: payload,
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

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Diet Phase Management
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Manage grocery lists and diet phase PDFs for each phase of your
              diet templates. Upload PDFs and control patient access.
            </p>
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <Card className="border border-slate-200/60 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-md shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">Select Diet Template</h2>
            </div>
            <p className="text-sm text-slate-600">Choose a template to manage grocery lists for each phase</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search diet templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-white/80 border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 rounded-lg shadow-sm"
              />
            </div>
          </div>

          {templatesLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <div className="absolute inset-0 h-8 w-8 rounded-full bg-emerald-500/20 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">Loading templates...</p>
                <p className="text-xs text-slate-500 mt-1">Fetching your diet templates</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-slate-300 rounded-full animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">No templates found</p>
                <p className="text-xs text-slate-500">Try adjusting your search criteria</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={cn(
                    "group text-left rounded-xl border p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1",
                    selectedTemplateId === t.id
                      ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                      : "border-slate-200 bg-white/80 backdrop-blur-sm hover:border-emerald-300 hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-teal-50/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-bold text-sm truncate transition-colors",
                          selectedTemplateId === t.id
                            ? "text-white"
                            : "text-slate-900 group-hover:text-emerald-700"
                        )}
                      >
                        {t.title}
                      </p>
                      {t.description && (
                        <p className={cn(
                          "text-xs mt-1 line-clamp-2 transition-colors",
                          selectedTemplateId === t.id
                            ? "text-white/70"
                            : "text-slate-500 group-hover:text-slate-600"
                        )}>
                          {t.description}
                        </p>
                      )}
                    </div>
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300",
                      selectedTemplateId === t.id
                        ? "bg-white/20"
                        : "bg-slate-100 group-hover:bg-emerald-100"
                    )}>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-300",
                          selectedTemplateId === t.id
                            ? "text-white"
                            : "text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all",
                      selectedTemplateId === t.id
                        ? "bg-white/20 text-white/90"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    )}>
                      <Calendar className="h-3 w-3" />
                      {t.total_days} Days
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "relative h-2 w-2 rounded-full transition-all duration-300",
                        t.is_active 
                          ? selectedTemplateId === t.id
                            ? "bg-white"
                            : "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                          : selectedTemplateId === t.id
                            ? "bg-white/40"
                            : "bg-slate-300"
                      )}>
                        {t.is_active && (
                          <div className="absolute inset-0 h-2 w-2 rounded-full bg-current animate-ping opacity-30" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase transition-colors",
                          selectedTemplateId === t.id
                            ? "text-white/80"
                            : t.is_active
                              ? "text-emerald-600"
                              : "text-slate-400"
                        )}
                      >
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  
                  {selectedTemplateId === t.id && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-white/80" />
                        <span className="text-[10px] text-white/80 font-medium">Selected for management</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phases Table */}
      {selectedTemplateId && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedTemplate?.title || "Template"} — Phases
                    </h2>
                    <p className="text-xs text-slate-500">
                      {phases.length} phase{phases.length !== 1 ? "s" : ""}{" "}
                      found
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {phasesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <span className="ml-3 text-sm text-slate-500">
                  Loading phases...
                </span>
              </div>
            ) : phasesError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle className="h-8 w-8 text-rose-400" />
                <p className="text-sm text-rose-600">
                  {phasesError.message || "Failed to load phases"}
                </p>
              </div>
            ) : phases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ShoppingCart className="h-10 w-10 text-slate-200" />
                <p className="text-sm text-slate-400">
                  No phases found for this template
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {phases.map((phase) => {
                  const groceryUrl = getPdfUrl(phase, "grocery")
                  const dietUrl = getPdfUrl(phase, "diet")

                  return (
                    <div
                      key={phase.phase_number}
                      className="px-6 py-5 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Phase Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 shrink-0">
                          <span className="text-sm font-black text-emerald-700">
                            P{phase.phase_number}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {phase.phase_name || `Phase ${phase.phase_number}`}
                          </p>
                          {(phase.start_day != null || phase.end_day != null) && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              Day {phase.start_day} – {phase.end_day}
                              {phase.duration_days != null && ` · ${phase.duration_days} days`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Two-column: Grocery List + Diet PDF */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Grocery List Card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4 text-emerald-600" />
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                {getPdfName(phase, "grocery")}
                              </span>
                            </div>
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
                                className="h-8 text-xs border-slate-300 flex-1"
                                onClick={() => window.open(groceryUrl, "_blank")}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white flex-1"
                              onClick={() => openUpdateDialog(phase, "grocery")}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              {groceryUrl ? "Update" : "Upload"}
                            </Button>
                          </div>
                        </div>

                        {/* Diet Phase PDF Card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-indigo-600" />
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                {getPdfName(phase, "diet")}
                              </span>
                            </div>
                          </div>
                          {dietUrl ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>PDF available</span>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No PDF uploaded</p>
                          )}
                          <div className="flex gap-2">
                            {dietUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs border-slate-300 flex-1"
                                onClick={() => window.open(dietUrl, "_blank")}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white flex-1"
                              onClick={() => openUpdateDialog(phase, "diet")}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              {dietUrl ? "Update" : "Upload"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No template selected */}
      {!selectedTemplateId && !templatesLoading && (
        <Card className="border border-dashed border-slate-300/60 bg-gradient-to-br from-slate-50/80 to-white/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-10 w-10 text-slate-300" />
              </div>
              <div className="absolute -top-2 -right-2 h-4 w-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full animate-pulse shadow-lg shadow-emerald-500/40" />
              <div className="absolute -bottom-1 -left-1 h-3 w-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse shadow-lg shadow-blue-500/40" style={{ animationDelay: '1s' }} />
            </div>
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-emerald-500" />
                <p className="text-xl font-bold text-slate-700">
                  Select a diet template
                </p>
                <Zap className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                Choose a template above to manage its grocery lists by phase. Upload PDFs and control access for patients.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="sm:max-w-[520px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Update {pdfTypeLabel}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {editingState?.phase.phase_name ||
                `Phase ${editingState?.phase.phase_number}`}
              {" — "}Upload a new PDF for this phase.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* File Upload */}
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
                    <p className="text-sm font-medium text-amber-700">
                      Uploading...
                    </p>
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
                    <p className="text-sm font-medium text-slate-600">
                      Click to upload PDF
                    </p>
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

            {/* Current PDF URL preview */}
            {editingState?.uploadedFileUrl && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  PDF URL
                </Label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-600 truncate max-w-[200px] flex-1">
                    {editingState.uploadedFileUrl}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() =>
                      window.open(editingState.uploadedFileUrl, "_blank")
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={resetDialog}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={updatePhaseConfigs.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={
                updatePhaseConfigs.isPending ||
                uploadPdf.isPending ||
                !editingState?.uploadedFileUrl ||
                !editingState?.name?.trim()
              }
            >
              {updatePhaseConfigs.isPending ? (
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
    </div>
  )
}
