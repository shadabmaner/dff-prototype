"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/CalenderPicker"
import { TimePicker } from "@/components/ui/time-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Video,
  Clock,
  ExternalLink,
  Loader2,
  Save,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Calendar,
  FileText,
  X,
  Upload,
  Link as LinkIcon,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useWebinars, useCreateWebinar, useUpdateWebinar, useDeleteWebinar } from "@/hooks/use-webinars"
import type { Webinar } from "@/lib/api/webinar-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { knowledgeBaseClient } from "@/lib/api/knowledge-base-client"

interface WebinarManagementProps {
  portalLabel: string // e.g. "Service" or "Admin"
  breadcrumb: string  // e.g. "Service Operations / Webinars" or "Admin / Webinars"
}

interface WebinarForm {
  name: string
  video_url: string
  video_file: File | null
  video_source: "url" | "file"
  thumbnail_url: string
  thumbnail_file: File | null
  thumbnail_source: "url" | "file"
  description: string
  duration_mins: string
  scheduled_date: string
  scheduled_time: string
  access_type: "free" | "paid" | "both"
}

interface FormErrors {
  name?: string
  video_url?: string
  duration_mins?: string
  scheduled_date?: string
  scheduled_time?: string
}

const emptyForm: WebinarForm = {
  name: "",
  video_url: "",
  video_file: null,
  video_source: "url",
  thumbnail_url: "",
  thumbnail_file: null,
  thumbnail_source: "url",
  description: "",
  duration_mins: "",
  scheduled_date: "",
  scheduled_time: "",
  access_type: "both",
}

export default function WebinarManagement({ portalLabel, breadcrumb }: WebinarManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const todayStr = new Date().toISOString().split('T')[0]
  const [searchDebounced, setSearchDebounced] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | "view">("add")
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null)
  const [form, setForm] = useState<WebinarForm>(emptyForm)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingWebinar, setDeletingWebinar] = useState<Webinar | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(searchQuery)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Queries & mutations
  const { data: webinarData, isLoading, isFetching } = useWebinars({
    page,
    limit,
    search: searchDebounced || undefined,
  })
  const createMutation = useCreateWebinar()
  const updateMutation = useUpdateWebinar()
  const deleteMutation = useDeleteWebinar()

  const webinars = webinarData?.data ?? []
  const total = webinarData?.total ?? 0
  const totalPages = webinarData?.total_pages ?? 1

  // Open Add drawer
  const handleOpenAdd = () => {
    setDrawerMode("add")
    setEditingWebinar(null)
    setForm(emptyForm)
    setFormErrors({})
    setDrawerOpen(true)
  }

  // Open Edit drawer
  const handleOpenEdit = (webinar: Webinar) => {
    setDrawerMode("edit")
    setEditingWebinar(webinar)
    setForm({
      name: webinar.name || "",
      video_url: webinar.video_url || "",
      video_file: null,
      video_source: "url",
      thumbnail_url: webinar.thumbnail_url || "",
      thumbnail_file: null,
      thumbnail_source: "url",
      description: webinar.description || "",
      duration_mins: webinar.duration_mins?.toString() || "",
      scheduled_date: webinar.scheduled_date || "",
      scheduled_time: webinar.scheduled_time || "",
      access_type: webinar.access_type || "both",
    })
    setFormErrors({})
    setDrawerOpen(true)
  }

  // Open View drawer
  const handleOpenView = (webinar: Webinar) => {
    setDrawerMode("view")
    setEditingWebinar(webinar)
    setForm({
      name: webinar.name || "",
      video_url: webinar.video_url || "",
      video_file: null,
      video_source: "url",
      thumbnail_url: webinar.thumbnail_url || "",
      thumbnail_file: null,
      thumbnail_source: "url",
      description: webinar.description || "",
      duration_mins: webinar.duration_mins?.toString() || "",
      scheduled_date: webinar.scheduled_date || "",
      scheduled_time: webinar.scheduled_time || "",
      access_type: webinar.access_type || "both",
    })
    setFormErrors({})
    setDrawerOpen(true)
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    if (!form.name.trim()) {
      errors.name = "Webinar name is required"
    } else if (form.name.trim().length < 3) {
      errors.name = "Webinar name must be at least 3 characters"
    }
    
    // Video validation
    if (form.video_source === "url") {
      if (!form.video_url.trim()) {
        errors.video_url = "Video URL is required"
      } else {
        try {
          new URL(form.video_url)
        } catch {
          errors.video_url = "Must be a valid URL"
        }
      }
    } else if (!form.video_file) {
      errors.video_url = "Please upload a video file"
    }

    if (!form.duration_mins.trim()) {
      errors.duration_mins = "Duration is required"
    } else if (isNaN(Number(form.duration_mins)) || Number(form.duration_mins) < 1) {
      errors.duration_mins = "Duration must be greater than 0 minutes"
    }

    // Parse date for validation
    let year = 0, month = 0, day = 0
    if (form.scheduled_date) {
      ;[year, month, day] = form.scheduled_date.split('-').map(Number)
    }

    if (!form.scheduled_date.trim()) {
      errors.scheduled_date = "Scheduled date is required"
    } else if (form.scheduled_date) {
      // Use UTC dates to avoid timezone issues
      const selectedDate = new Date(Date.UTC(year, month - 1, day))
      const today = new Date()
      const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
      
      if (selectedDate < todayUtc) {
        errors.scheduled_date = "Scheduled date cannot be in the past"
      }
    }

    if (!form.scheduled_time.trim()) {
      errors.scheduled_time = "Scheduled time is required"
    } else if (form.scheduled_time && form.scheduled_date) {
      const [hours, minutes] = form.scheduled_time.split(":").map(Number)
      if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        errors.scheduled_time = "Please select a valid scheduled time"
      } else {
        const scheduledDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
        if (scheduledDateTime.getTime() < Date.now()) {
          errors.scheduled_time = "Scheduled time cannot be in the past"
        }
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Focus on first field with error
      if (formErrors.name) {
        document.getElementById('name')?.focus()
      } else if (formErrors.video_url) {
        document.getElementById('video_url')?.focus()
      } else if (formErrors.duration_mins) {
        document.getElementById('duration')?.focus()
      } else if (formErrors.scheduled_date) {
        document.getElementById('scheduled_date')?.focus()
      } else if (formErrors.scheduled_time) {
        document.getElementById('scheduled_time')?.focus()
      }
      return
    }

    try {
      let finalVideoUrl = form.video_url.trim()
      let finalThumbnailUrl = form.thumbnail_url.trim() || undefined

      // Upload files if needed
      if (form.video_source === "file" && form.video_file) {
        toast.loading("Uploading video...", { id: "uploading" })
        finalVideoUrl = await knowledgeBaseClient.uploadFileToPresignedUrl(form.video_file, "webinars/videos")
      }

      if (form.thumbnail_source === "file" && form.thumbnail_file) {
        toast.loading("Uploading thumbnail...", { id: "uploading" })
        finalThumbnailUrl = await knowledgeBaseClient.uploadFileToPresignedUrl(form.thumbnail_file, "webinars/thumbnails")
      }

      toast.dismiss("uploading")

      const payload = {
        name: form.name.trim(),
        video_url: finalVideoUrl,
        thumbnail_url: finalThumbnailUrl,
        description: form.description.trim() || undefined,
        duration_mins: parseInt(form.duration_mins, 10),
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        access_type: form.access_type,
      }

      if (drawerMode === "add") {
        await createMutation.mutateAsync(payload)
        toast.success("Webinar created successfully")
      } else if (editingWebinar) {
        await updateMutation.mutateAsync({ id: editingWebinar.id, payload })
        toast.success("Webinar updated successfully")
      }
      setDrawerOpen(false)
      setForm(emptyForm)
      setFormErrors({})
    } catch (error: any) {
      toast.dismiss("uploading")
      const messages = error.response?.data?.message
      if (Array.isArray(messages)) {
        messages.forEach((m: string) => toast.error(m))
      } else {
        toast.error(messages || (error instanceof Error ? error.message : "Something went wrong"))
      }
    }
  }

  // Delete
  const handleDeleteClick = (webinar: Webinar) => {
    setDeletingWebinar(webinar)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingWebinar) return
    try {
      await deleteMutation.mutateAsync(deletingWebinar.id)
      toast.success("Webinar deleted successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete webinar")
    } finally {
      setDeleteDialogOpen(false)
      setDeletingWebinar(null)
    }
  }

  const formatDate = (value?: string) => {
    if (!value) return "N/A"
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
    } catch {
      return value
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">{breadcrumb}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Webinar Management</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Create, edit, and manage webinar sessions for patient education and engagement.
            </p>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-lg shadow-slate-900/20 h-11 px-5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Webinar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Total Webinars</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{total}</p>
                <p className="text-xs text-blue-700/80 font-medium">Available webinars</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Total Duration</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">
                  {webinars.reduce((sum, w) => sum + (w.duration_mins || 0), 0)}
                  <span className="text-sm font-medium text-slate-500 ml-1">mins</span>
                </p>
                <p className="text-xs text-emerald-700/80 font-medium">Combined content length</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <PlayCircle className="h-3 w-3 text-violet-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-violet-700 font-semibold">This Page</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{webinars.length}</p>
                <p className="text-xs text-violet-700/80 font-medium">Showing on current page</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <PlayCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search webinars by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.trim())}
              className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-900 hover:to-slate-800 border-b-0">
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Name</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Video</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Description</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Duration</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Added On</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`} className="border-b border-slate-100">
                      <TableCell colSpan={6} className="py-6">
                        <div className="h-6 w-full animate-pulse rounded bg-slate-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : webinars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <Video className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="font-medium">No webinars found</p>
                        <p className="text-xs text-slate-400">Create your first webinar to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  webinars.map((webinar) => (
                    <TableRow key={webinar.id} className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          {webinar.thumbnail_url ? (
                            <div className="h-10 w-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-200">
                              <img
                                src={webinar.thumbnail_url}
                                alt={webinar.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                              <PlayCircle className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <p className="font-semibold text-slate-900 line-clamp-1">{webinar.name}</p>
                            {webinar.thumbnail_url && (
                              <p className="text-[10px] text-slate-400 font-medium">Session Thumbnail</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <a
                          href={webinar.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Watch
                        </a>
                      </TableCell>
                      <TableCell className="py-4 max-w-[200px]">
                        <p className="text-sm text-slate-600 truncate" title={webinar.description || ""}>
                          {webinar.description || <span className="text-slate-400 italic">No description</span>}
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="border-slate-300 text-slate-700 font-medium">
                          <Clock className="h-3 w-3 mr-1" />
                          {webinar.duration_mins} mins
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700 text-sm font-medium py-4">
                        {formatDate(webinar.created_at)}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-9 px-3"
                            onClick={() => handleOpenView(webinar)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1.5" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-9 px-3"
                            onClick={() => handleOpenEdit(webinar)}
                          >
                            <Edit className="h-4 w-4 mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold shadow-sm h-9 px-3"
                            onClick={() => handleDeleteClick(webinar)}
                          >
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-slate-900">{Math.min(page * limit, total)}</span> of{" "}
                <span className="font-semibold text-slate-900">{total}</span> webinars
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1 || isFetching}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      disabled={isFetching}
                      className={pageNum === page
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages || isFetching}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Video className="h-5 w-5 text-violet-600" />
              {drawerMode === "add" ? "Add New Webinar" : drawerMode === "view" ? "View Webinar Details" : "Edit Webinar"}
            </SheetTitle>
            <SheetDescription className="text-slate-600">
              {drawerMode === "add"
                ? "Fill in the details below to create a new webinar."
                : drawerMode === "view" ? "Inspect webinar content and details." : `Editing "${editingWebinar?.name}"`}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {drawerMode === "view" ? (
              <div className="space-y-6">
                {/* Thumbnail/Video Preview */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Preview</Label>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200 group">
                    {form.thumbnail_url ? (
                      <img
                        src={form.thumbnail_url}
                        alt={form.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <Video className="h-12 w-12 text-slate-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <a
                        href={form.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border border-white/30"
                      >
                        <PlayCircle className="h-10 w-10 text-white" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{form.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 py-1">
                        <Clock className="h-3 w-3 mr-1.5" />
                        {form.duration_mins} Minutes
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 py-1 font-medium capitalize">
                        {portalLabel} Webinar
                      </Badge>
                      {form.scheduled_date && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          {form.scheduled_date}
                        </Badge>
                      )}
                      {form.scheduled_time && (
                        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 py-1">
                          {form.scheduled_time}
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "py-1 capitalize",
                          form.access_type === "free" && "bg-green-50 text-green-700 border-green-200",
                          form.access_type === "paid" && "bg-amber-50 text-amber-700 border-amber-200",
                          form.access_type === "both" && "bg-purple-50 text-purple-700 border-purple-200"
                        )}
                      >
                        {form.access_type}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Description</Label>
                    <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {form.description || "No description provided for this webinar session."}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Resource Link</Label>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <Video className="h-4 w-4 text-slate-400" />
                      <a
                        href={form.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium truncate underline underline-offset-4 decoration-blue-200"
                      >
                        {form.video_url}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => setDrawerMode("edit")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 font-bold shadow-lg"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Webinar Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Webinar Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => {
                      // Only allow text characters: letters, numbers, spaces, and basic punctuation
                      const textOnly = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')
                      setForm({ ...form, name: textOnly })
                      if (formErrors.name) setFormErrors({ ...formErrors, name: undefined })
                    }}
                    className={`h-11 border-slate-300 bg-white ${formErrors.name ? "border-red-500 focus:border-red-500" : ""}`}
                    autoFocus
                  />
                  {formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}
                </div>

                {/* Video */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Video Content <span className="text-red-500">*</span></Label>
                  <Tabs value={form.video_source} onValueChange={(v: any) => setForm({ ...form, video_source: v })} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-slate-100/50">
                      <TabsTrigger value="url" className="text-xs transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <LinkIcon className="h-3 w-3 mr-1.5" /> URL
                      </TabsTrigger>
                      <TabsTrigger value="file" className="text-xs transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Upload className="h-3 w-3 mr-1.5" /> Upload File
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-3 space-y-2">
                      <Input
                        id="video_url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={form.video_url}
                        onChange={(e) => {
                          setForm({ ...form, video_url: e.target.value })
                          if (formErrors.video_url) setFormErrors({ ...formErrors, video_url: undefined })
                        }}
                        className={`h-11 border-slate-300 bg-white ${formErrors.video_url ? "border-red-500 focus:border-red-500" : ""}`}
                      />
                    </TabsContent>
                    <TabsContent value="file" className="mt-3">
                      {form.video_file ? (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
                            <Video className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{form.video_file.name}</p>
                            <p className="text-xs text-slate-500">{(form.video_file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setForm({ ...form, video_file: null })} className="h-8 w-8 text-slate-400 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all group">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 mb-2">
                            <Upload className="h-5 w-5 text-slate-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-600">Click to upload video</p>
                          <p className="text-[10px] text-slate-400 mt-1">MP4, WEBM up to 100MB</p>
                          <input type="file" className="hidden" accept="video/*" onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setForm({ ...form, video_file: file })
                            if (formErrors.video_url) setFormErrors({ ...formErrors, video_url: undefined })
                          }} />
                        </label>
                      )}
                    </TabsContent>
                  </Tabs>
                  {formErrors.video_url && <p className="text-sm text-red-600 mt-1">{formErrors.video_url}</p>}
                </div>

                {/* Thumbnail */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Thumbnail <span className="text-slate-400 font-normal">(Optional)</span></Label>
                  <Tabs value={form.thumbnail_source} onValueChange={(v: any) => setForm({ ...form, thumbnail_source: v })} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-slate-100/50">
                      <TabsTrigger value="url" className="text-xs transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <LinkIcon className="h-3 w-3 mr-1.5" /> URL
                      </TabsTrigger>
                      <TabsTrigger value="file" className="text-xs transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Upload className="h-3 w-3 mr-1.5" /> Upload File
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-3 space-y-3">
                      <Input
                        placeholder="https://example.com/thumbnail.jpg"
                        value={form.thumbnail_url}
                        onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                        className="h-11 border-slate-300 bg-white"
                      />
                      {form.thumbnail_url && (() => {
                        try {
                          new URL(form.thumbnail_url)
                          return (
                            <div className="relative group w-32 aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                              <img src={form.thumbnail_url} alt="Thumbnail preview" className="w-full h-full object-cover" />
                            </div>
                          )
                        } catch { return null }
                      })()}
                    </TabsContent>
                    <TabsContent value="file" className="mt-3">
                      {form.thumbnail_file ? (
                        <div className="relative w-32 aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                          <img src={URL.createObjectURL(form.thumbnail_file)} alt="Thumbnail preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setForm({ ...form, thumbnail_file: null })}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-6 w-6 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all group">
                          <Upload className="h-6 w-6 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-slate-600">Upload portrait</p>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setForm({ ...form, thumbnail_file: file })
                          }} />
                        </label>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-semibold text-slate-700">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    placeholder="e.g. 60"
                    value={form.duration_mins}
                    onChange={(e) => {
                      setForm({ ...form, duration_mins: e.target.value })
                      if (formErrors.duration_mins) setFormErrors({ ...formErrors, duration_mins: undefined })
                    }}
                    className={`h-11 border-slate-300 bg-white ${formErrors.duration_mins ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {formErrors.duration_mins && <p className="text-sm text-red-600">{formErrors.duration_mins}</p>}
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date" className="text-sm font-semibold text-slate-700">
                      Scheduled Date <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      value={form.scheduled_date ? new Date(form.scheduled_date) : undefined}
                      onChange={(date) => {
                        setForm({
                          ...form,
                          scheduled_date: date
                            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                            : "",
                        })
                        if (formErrors.scheduled_date) setFormErrors({ ...formErrors, scheduled_date: undefined })
                      }}
                      placeholder="Select date"
                      className="h-11 border-slate-300 bg-white"
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                    />
                    {formErrors.scheduled_date && <p className="text-sm text-red-600">{formErrors.scheduled_date}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time" className="text-sm font-semibold text-slate-700">
                      Scheduled Time <span className="text-red-500">*</span>
                    </Label>
                    <TimePicker
                      value={form.scheduled_time}
                      onChange={(time) => {
                        setForm({ ...form, scheduled_time: time })
                        if (formErrors.scheduled_time) setFormErrors({ ...formErrors, scheduled_time: undefined })
                      }}
                      placeholder="Select time"
                      className={`h-11 border-slate-300 bg-white ${formErrors.scheduled_time ? "border-red-500 focus:border-red-500" : ""}`}
                      selectedDate={form.scheduled_date ? (() => {
                        const [year, month, day] = form.scheduled_date.split('-').map(Number)
                        return new Date(year, month - 1, day)
                      })() : undefined}
                    />
                    {formErrors.scheduled_time && <p className="text-sm text-red-600">{formErrors.scheduled_time}</p>}
                  </div>
                </div>

                {/* Access Type */}
                <div className="space-y-2">
                  <Label htmlFor="access_type" className="text-sm font-semibold text-slate-700">
                    Access Type
                  </Label>
                  <select
                    id="access_type"
                    value={form.access_type}
                    onChange={(e) => setForm({ ...form, access_type: e.target.value as "free" | "paid" | "both" })}
                    className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="both">Both</option>
                  </select>
                  <p className="text-xs text-slate-500">Who can access this webinar: free users, paid users, or both</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the webinar content, topics covered, target audience..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="min-h-[100px] border-slate-300 bg-white resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDrawerOpen(false)
                      setForm(emptyForm)
                      setFormErrors({})
                    }}
                    className="flex-1 border-slate-300 hover:bg-slate-50 h-11 font-semibold"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white h-11 font-semibold shadow-lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {drawerMode === "add" ? "Creating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {drawerMode === "add" ? "Create Webinar" : "Save Changes"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-slate-200">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Delete Webinar?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deletingWebinar?.name}"</span>?
              This action will remove the webinar from listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
