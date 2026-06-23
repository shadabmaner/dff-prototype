"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  useDashboardDocuments,
  useCreateDashboardDocument,
  useUpdateDashboardDocument,
  useDeleteDashboardDocument,
} from "@/hooks/use-prerequisites"
import { FileText, Plus, Edit, Trash2, ExternalLink, Loader2, AlertCircle, Upload, File, CheckCircle2, Lock, Unlock, LayoutDashboard, X, Image } from "lucide-react"
import { toast } from "sonner"
import type { DashboardDocument, CreateDashboardDocumentRequest } from "@/types/prerequisite"
import { uploadDocument } from "@/lib/upload-document"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PrerequisitesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<DashboardDocument | null>(null)
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CreateDashboardDocumentRequest>({
    title: "",
    url: "",
    thumbnail_url: "",
    document_type: "pdf",
    access_type: "free",
    category: "dashboard",
    is_active: true,
  })

  // Filter and Pagination State
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: response, isLoading, error, refetch } = useDashboardDocuments({
    page: currentPage,
    limit: 10,
    search: search || undefined,
    //@ts-ignore
    category: selectedCategory === "all" ? undefined : selectedCategory,
  })

  const createMutation = useCreateDashboardDocument()
  const updateMutation = useUpdateDashboardDocument()
  const deleteMutation = useDeleteDashboardDocument()

  const documents = response?.data || []

  const activeCount = documents.filter((d: DashboardDocument) => d.is_active).length
  const freeCount = documents.filter((d: DashboardDocument) => d.access_type === "free").length

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      thumbnail_url: "",
      document_type: "pdf",
      access_type: "free",
      category: "dashboard",
      is_active: true,
    })
    setSelectedFile(null)
    setSelectedThumbnail(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
  }

  const handleOpenDrawer = () => {
    resetForm()
    setEditingDocument(null)
    setIsDrawerOpen(true)
  }

  const handleOpenEditDrawer = (document: DashboardDocument) => {
    setEditingDocument(document)
    setFormData({
      title: document.title,
      url: document.url,
      thumbnail_url: document.thumbnail_url || "",
      document_type: document.document_type,
      access_type: document.access_type,
      category: document.category,
      is_active: document.is_active,
    })
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setEditingDocument(null)
    resetForm()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF document only')
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      setSelectedFile(file)
      setFormData(prev => ({ ...prev, document_type: 'pdf' }))
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file only (JPG, PNG, etc.)')
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = ""
        }
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail image must be less than 5MB')
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = ""
        }
        return
      }

      setSelectedThumbnail(file)
    }
  }

  const handleRemoveThumbnail = () => {
    setSelectedThumbnail(null)
    setFormData(prev => ({ ...prev, thumbnail_url: "" }))
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error("Please enter a title")
      return
    }

    setIsUploading(true)
    try {
      let finalUrl = formData.url
      let finalThumbnailUrl = formData.thumbnail_url

      // Upload document file
      if (selectedFile) {
        try {
          finalUrl = await uploadDocument(selectedFile, { prefix: 'prerequisites' })
        } catch (error: any) {
          toast.error(error?.message || "Failed to upload file")
          setIsUploading(false)
          return
        }
      }

      // Upload thumbnail file
      if (selectedThumbnail) {
        try {
          setIsUploadingThumbnail(true)
          finalThumbnailUrl = await uploadDocument(selectedThumbnail, { prefix: 'thumbnails' })
        } catch (error: any) {
          toast.error(error?.message || "Failed to upload thumbnail")
          setIsUploadingThumbnail(false)
          setIsUploading(false)
          return
        } finally {
          setIsUploadingThumbnail(false)
        }
      }

      if (!finalUrl.trim()) {
        toast.error("Please upload a document")
        setIsUploading(false)
        return
      }

      const submissionData = { ...formData, url: finalUrl, thumbnail_url: finalThumbnailUrl }

      if (editingDocument) {
        await updateMutation.mutateAsync({ id: editingDocument.id, data: submissionData })
        toast.success("Document updated successfully")
      } else {
        await createMutation.mutateAsync(submissionData)
        toast.success("Document created successfully")
      }
      handleCloseDrawer()
      refetch()
    } catch (error: any) {
      toast.error(error?.message || "Failed to save document")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDocumentId) return

    try {
      await deleteMutation.mutateAsync(deleteDocumentId)
      toast.success("Document deleted successfully")
      setDeleteDocumentId(null)
      refetch()
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete document")
    }
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen bg-slate-50/60">
        <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-red-600" />
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Error Loading Prerequisites</h3>
            <p className="text-sm text-slate-500 font-medium">{error.message || "Failed to load dashboard documents"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8 min-h-screen bg-slate-50/60">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">
            Service Portal / Prerequisites
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Prerequisites Management
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl font-medium">
              Manage dashboard documents and clinical resources for patient onboarding.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] h-9 border-0 bg-transparent text-[10px] font-black uppercase tracking-widest focus:ring-0">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="dietitian">Dietitian</SelectItem>
                  <SelectItem value="general_instructions">General Instructions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleOpenDrawer}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-black shadow-xl shadow-slate-900/20 h-11 px-6 rounded-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-white overflow-hidden group hover:shadow-xl transition-shadow rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-black">Total Documents</p>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-2">{documents.length}</p>
                <p className="text-xs text-blue-700/80 font-bold">All resources</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden group hover:shadow-xl transition-shadow rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-black">Active</p>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-2">{activeCount}</p>
                <p className="text-xs text-emerald-700/80 font-bold">Published & live</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden group hover:shadow-xl transition-shadow rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Unlock className="h-3 w-3 text-purple-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-purple-700 font-black">Free Access</p>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-2">{freeCount}</p>
                <p className="text-xs text-purple-700/80 font-bold">Open resources</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Unlock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      {isLoading ? (
        <Card className="border-0 shadow-xl bg-white rounded-2xl">
          <CardContent className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] w-full animate-pulse rounded-xl bg-slate-100" />
            ))}
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Documents Found"
          description="Create your first prerequisite document to get started with patient onboarding resources."
          buttonText="Add First Document"
          onButtonClick={handleOpenDrawer}
          className=""
        />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {documents.map((document: DashboardDocument, index: number) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all group ring-1 ring-slate-900/5">
                  <div className="flex">
                    {/* Left accent panel */}
                    <div className={cn(
                      "w-[100px] shrink-0 flex flex-col items-center justify-center gap-2",
                      document.document_type === "pdf"
                        ? "bg-gradient-to-b from-rose-300 to-red-400"
                        : document.document_type === "image"
                          ? "bg-gradient-to-b from-indigo-300 to-blue-400"
                          : "bg-gradient-to-b from-amber-300 to-orange-400",
                          document.thumbnail_url !== "" || document.thumbnail_url !== null ? "p-0":"p-4"
                    )}>
                      <div className="h-full w-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden relative">
                        {document.thumbnail_url ? (
                          <img
                            src={document.thumbnail_url}
                            alt="Thumbnail"
                            className="h-full w-full object-fill absolute inset-0"
                            onError={(e) => {
                              // Fallback to icon if thumbnail fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {(!document.thumbnail_url || document.thumbnail_url === '') && (
                          <>
                            {document.document_type === "pdf" ? (
                              <FileText className="h-7 w-7 text-white" />
                            ) : document.document_type === "image" ? (
                              <Upload className="h-7 w-7 text-white" />
                            ) : (
                              <ExternalLink className="h-7 w-7 text-white" />
                            )}
                          </>
                        )}
                      </div>
                      <span className="text-[9px] font-black text-white/90 uppercase tracking-widest pb-2">{document.document_type}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-black text-slate-900 truncate tracking-tight leading-tight">
                              {document.title}
                            </h3>
                            <Badge variant="secondary" className="rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border-none px-3">
                              {document.category || 'Uncategorized'}
                            </Badge>
                            {/* Access badge */}
                            {document.access_type === "free" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-sm shadow-violet-200">
                                <Unlock className="h-3 w-3" />
                                Free
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-sm shadow-amber-200">
                                <Lock className="h-3 w-3" />
                                Paid
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Status badge */}
                            {document.is_active ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-sm shadow-emerald-200">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                                Inactive
                              </span>
                            )}



                            {/* Type chip */}
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border",
                              document.document_type === "pdf"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-indigo-200 bg-indigo-50 text-indigo-700"
                            )}>
                              <File className="h-3 w-3" />
                              {document.document_type}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-10 px-4 flex items-center gap-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 p-0 border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                            onClick={() => handleOpenEditDrawer(document)}
                            title="Edit Document"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 p-0 border-2 border-slate-200 text-slate-400 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                            onClick={() => setDeleteDocumentId(document.id)}
                            title="Delete Document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pagination */}
          {response?.pagination && response.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Showing {((response.pagination.page - 1) * response.pagination.limit) + 1} - {Math.min(response.pagination.page * response.pagination.limit, response.pagination.total)} of {response.pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!response.pagination.hasPrev}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 hover:bg-slate-50 transition-all"
                >
                  Prev
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: response.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={currentPage === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        "h-9 w-9 p-0 rounded-xl text-[10px] font-black transition-all",
                        currentPage === p
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "border-2 hover:bg-slate-50 text-slate-600"
                      )}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!response.pagination.hasNext}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 hover:bg-slate-50 transition-all"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={isDrawerOpen} onOpenChange={handleCloseDrawer}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto bg-slate-50 p-0">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6 flex flex-col gap-1">
              <SheetTitle className="text-2xl font-black text-slate-900">
                {editingDocument ? "Edit Document" : "New Document"}
              </SheetTitle>
              <SheetDescription className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                {editingDocument
                  ? "Update document configuration"
                  : "Add a new prerequisite resource"}
              </SheetDescription>
            </div>

            <div className="flex-1 space-y-6 p-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-black text-xs uppercase tracking-widest text-slate-500">
                  Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Weight Loss Guide Book"
                  required
                  className="h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
                  Upload Document <span className="text-rose-500">*</span>
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className="flex-1 h-12 font-bold border-2 rounded-xl bg-white file:font-black file:text-slate-700 file:bg-slate-100 file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3"
                    />
                  </div>

                  {selectedFile && (
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-slate-100">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <File className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.url && (
                    <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <p className="text-xs font-black text-emerald-700 uppercase tracking-wider">Uploaded</p>
                      </div>
                      <p className="text-xs text-emerald-600 font-bold truncate">{formData.url}</p>
                    </div>
                  )}
                </div>
              </div>


              {/* Thumbnail Upload */}
              <div className="space-y-3">
                <Label className="font-black text-xs uppercase tracking-widest text-slate-500">
                  Thumbnail Image (Optional)
                </Label>
                
                {/* Thumbnail Preview */}
                {(selectedThumbnail || formData.thumbnail_url) ? (
                  <div className="relative group">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-100">
                      <div className="relative group/thumbnail">
                        <div className="h-20 w-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                          {selectedThumbnail ? (
                            <img
                              src={URL.createObjectURL(selectedThumbnail)}
                              alt="Thumbnail preview"
                              className="h-full w-full object-cover"
                            />
                          ) : formData.thumbnail_url ? (
                            <img
                              src={formData.thumbnail_url}
                              alt="Thumbnail"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = ""
                                e.currentTarget.className = "h-8 w-8 text-slate-400"
                                e.currentTarget.alt = ""
                              }}
                            />
                          ) : (
                            <Image className="h-8 w-8 text-slate-400" />
                          )}
                        </div>
                        
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={handleRemoveThumbnail}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity shadow-lg hover:bg-rose-700"
                          title="Remove thumbnail"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900">
                          {selectedThumbnail ? selectedThumbnail.name : "Current thumbnail"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {selectedThumbnail 
                            ? `${(selectedThumbnail.size / 1024 / 1024).toFixed(2)} MB`
                            : "Uploaded thumbnail"
                          }
                        </p>
                        {formData.thumbnail_url && !selectedThumbnail && (
                          <p className="text-xs text-emerald-600 font-bold truncate mt-1">{formData.thumbnail_url}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                        disabled={isUploading || isUploadingThumbnail}
                        className="flex-1 h-12 font-bold border-2 rounded-xl bg-white file:font-black file:text-slate-700 file:bg-slate-100 file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3"
                      />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Upload a thumbnail image (JPG, PNG, etc.) - Max 5MB
                    </p>
                  </div>
                )}
              </div>

              {/* Document type is now PDF only and handled automatically */}

              <div className="space-y-2">
                <Label htmlFor="category" className="font-black text-xs uppercase tracking-widest text-slate-500">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "dashboard" | "dietitian" | "general_instructions") => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" className="h-12 font-bold border-2 rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="dietitian">Dietitian</SelectItem>
                    <SelectItem value="general_instructions">General Instructions</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div className="space-y-2">
                <Label htmlFor="access_type" className="font-black text-xs uppercase tracking-widest text-slate-500">Access Type</Label>
                <Select
                  value={formData.access_type}
                  onValueChange={(value: "free" | "paid") => setFormData({ ...formData, access_type: value })}
                >
                  <SelectTrigger id="access_type" className="h-12 font-bold border-2 rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-slate-100">
                <div>
                  <Label htmlFor="is_active" className="font-black text-sm text-slate-900">Active Status</Label>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Toggle document visibility</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t p-6 flex gap-3">
              <Button type="button" variant="outline" onClick={handleCloseDrawer} className="flex-1 h-12 font-black border-2 rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || isUploading || isUploadingThumbnail}
                className="flex-1 h-12 bg-gradient-to-r from-slate-900 to-slate-800 font-black shadow-xl rounded-xl"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingDocument ? "Update Document" : "Create Document"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDocumentId} onOpenChange={() => setDeleteDocumentId(null)}>
        <AlertDialogContent className="bg-white border-2 border-slate-200 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900">Delete Document?</AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-slate-500">
              This action cannot be undone. This will permanently remove the document from the clinical resource library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="font-black border-slate-200 rounded-xl">Keep Document</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 font-black px-8 rounded-xl"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
