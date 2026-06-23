"use client"

import { use, useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Video,
  FileText,
  ImageIcon,
  Plus,
  ArrowUpDown,
  Trash2,
  Undo2,
  Eye,
  Edit,
  MinusCircle,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  Paperclip,
  Link as LinkIcon,
  X as CloseIcon,
  RefreshCw as RefreshIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
import { DraggableList } from "@/components/admin/draggable-list"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSpecialitiesQuery } from "@/hooks/use-specialities"
import {
  knowledgeBaseModulesClient,
  type KnowledgeBaseModule,
} from "@/lib/api/knowledge-base-modules-client"
import {
  knowledgeBaseClient,
  type KnowledgeBaseResource,
  type ResourceListResponse,
  type KnowledgeBaseFaq,
} from "@/lib/api/knowledge-base-client"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useCreateResource, useUpdateResource, useDeleteResource, useRestoreResource } from "@/hooks/use-knowledge-base"
import { uploadDocument } from "@/lib/upload-document"

interface AddResourceFormState {
  title: string
  description: string
  contentType: string
  resourceUrl: string
  specialityId: string
  status: "active" | "inactive"
  file: File | null
  thumbnail: File | null
  faqs: KnowledgeBaseFaq[]
  languageCode: string
}

const RESOURCE_TITLE_MIN = 3
const RESOURCE_TITLE_MAX = 120
const RESOURCE_DESCRIPTION_MAX = 600
const RESOURCE_FILE_MAX_MB = 200

const initialAddResourceForm: AddResourceFormState = {
  title: "",
  description: "",
  contentType: "video",
  resourceUrl: "",
  specialityId: "",
  status: "active",
  file: null,
  thumbnail: null,
  faqs: [],
  languageCode: "mr",
}

export default function ModuleDetailsPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>
}) {
  const { id, moduleId } = use(params)
  const queryClient = useQueryClient()

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [addResourceForm, setAddResourceForm] = useState<AddResourceFormState>(initialAddResourceForm)
  const [resourceFilePreview, setResourceFilePreview] = useState<string | undefined>(undefined)
  const [resourceFileName, setResourceFileName] = useState<string | undefined>(undefined)
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({})
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file")
  const [isReorderDrawerOpen, setIsReorderDrawerOpen] = useState(false)
  const [reorderResources, setReorderResources] = useState<KnowledgeBaseResource[]>([])
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [resourceToActOn, setResourceToActOn] = useState<KnowledgeBaseResource | null>(null)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [viewResource, setViewResource] = useState<KnowledgeBaseResource | null>(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [editResource, setEditResource] = useState<KnowledgeBaseResource | null>(null)
  const [editForm, setEditForm] = useState<AddResourceFormState>(initialAddResourceForm)
  const [editPreview, setEditPreview] = useState<string | undefined>(undefined)
  const [editFileName, setEditFileName] = useState<string | undefined>(undefined)
  const [editUploadMode, setEditUploadMode] = useState<"file" | "url">("file")
  const [isFileRemoved, setIsFileRemoved] = useState(false)

  const moduleQuery = useQuery({
    queryKey: ["knowledge-base-module", moduleId],
    enabled: Boolean(moduleId),
    queryFn: () => knowledgeBaseModulesClient.getModule(moduleId),
  })

  const resourcesQuery = useQuery({
    queryKey: ["module-resources", moduleId],
    enabled: Boolean(moduleId),
    queryFn: () => knowledgeBaseClient.getResourcesByModule(moduleId),
  })



  const specialitiesQuery = useSpecialitiesQuery()
  const specialityOptions = specialitiesQuery.data?.data ?? []

  const { mutate: createResource, isPending: isCreating } = useCreateResource()
  const { mutate: updateResource, isPending: isUpdating } = useUpdateResource()
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource()
  const { mutate: restoreResource, isPending: isRestoring } = useRestoreResource()

  const renderResourceIcon = (resource: KnowledgeBaseResource) => {
    if (resource.content_type === "video") return <Video className="h-4 w-4" />
    if (resource.content_type === "pdf") return <FileText className="h-4 w-4" />
    if (resource.content_type === "image") return <ImageIcon className="h-4 w-4" />
    if (resource.content_type === "external_link") return <ExternalLink className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const renderResourcePreview = (resource: KnowledgeBaseResource) => {
    // If thumbnail exists, show it first
    if (resource.thumbnail_url) {
      return (
        <img
          src={resource.thumbnail_url}
          alt={resource.title}
          className="h-full w-full object-cover"
        />
      )
    }
    const src = resource.resource_url
    if (!src) {
      return (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <FileText className="h-6 w-6" />
        </div>
      )
    }

    const type = resource.content_type?.toLowerCase()
    if (type === "video") {
      return (
        <video
          src={src}
          className="h-full w-full object-cover"
          controls={false}
          muted
          playsInline
        />
      )
    }

    if (type === "image") {
      return <img src={src} alt={resource.title} className="h-full w-full object-cover" />
    }

    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        {renderResourceIcon(resource)}
      </div>
    )
  }
  //@ts-ignore
  const rawResources = resourcesQuery.data?.data || []
  const moduleData = moduleQuery.data
  const resources = Array.isArray(rawResources)
    ? rawResources
    : (rawResources as { data?: KnowledgeBaseResource[] } | undefined)?.data ?? []
  const isLoading = moduleQuery.isLoading || resourcesQuery.isLoading
  const isRefreshing = moduleQuery.isFetching || resourcesQuery.isFetching
  const handleRefresh = () =>
    Promise.all([moduleQuery.refetch(), resourcesQuery.refetch()])

  const resetResourceForm = () => {
    setAddResourceForm(initialAddResourceForm)
    setResourceFilePreview(undefined)
    setResourceFileName(undefined)
    setAddFormErrors({})
  }

  const clearAddFormError = (field: string) => {
    setAddFormErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const [isUploading, setIsUploading] = useState(false)

  const reorderResourcesMutation = useMutation({
    mutationFn: (resourceIds: string[]) => knowledgeBaseClient.reorderModuleResources(moduleId, resourceIds),
    onSuccess: () => {
      toast.success("Resource order updated")
      queryClient.invalidateQueries({ queryKey: ["module-resources", moduleId] })
      setIsReorderDrawerOpen(false)
    },
    onError: (error: any) => {
      toast.error("Reorder failed", {
        description: error.response?.data?.message || "Please try again."
      })
    },
  })

  const handleResourceFileChange = (file?: File | null) => {
    if (!file) {
      setAddResourceForm((prev) => ({ ...prev, file: null }))
      setResourceFilePreview(undefined)
      setResourceFileName(undefined)
      return
    }

    if (file.size > RESOURCE_FILE_MAX_MB * 1024 * 1024) {
      setAddFormErrors((prev) => ({
        ...prev,
        file: `File must be under ${RESOURCE_FILE_MAX_MB} MB`,
      }))
      return
    }

    setAddResourceForm((prev) => ({ ...prev, file }))
    setResourceFilePreview(URL.createObjectURL(file))
    setResourceFileName(file.name)
    setUploadMode("file")
    clearAddFormError("file")
  }



  const validateAddResourceForm = () => {
    const errors: Record<string, string> = {}
    const trimmedTitle = addResourceForm.title.trim()
    if (!trimmedTitle) {
      errors.title = "Title is required"
    } else if (trimmedTitle.length < RESOURCE_TITLE_MIN) {
      errors.title = `Title must be at least ${RESOURCE_TITLE_MIN} characters`
    } else if (trimmedTitle.length > RESOURCE_TITLE_MAX) {
      errors.title = `Title must be under ${RESOURCE_TITLE_MAX} characters`
    }
    console.log(addResourceForm, "addResourceForm")
    if (!addResourceForm.description) {
      errors.description = "Description is required"
    }

    if (!addResourceForm.specialityId.trim()) {
      errors.specialityId = "Speciality selection is required"
    }

    // if (uploadMode === "file") {
    //   if (!addResourceForm.file) {
    //     errors.file = "Critical asset upload required"
    //   }
    // } else {
    //   if (!addResourceForm.resourceUrl.trim()) {
    //     errors.resourceUrl = "Resource URL required for external link"
    //   }
    // }

    setAddFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddResource = async () => {
    if (!validateAddResourceForm()) {
      toast.error("Please fix the highlighted fields")
      return
    }

    setIsUploading(true)
    try {
      const sanitizedFaqs = (addResourceForm.faqs || [])
        .map((faq) => ({
          question: faq.question?.trim() || "",
          answer: faq.answer?.trim() || "",
        }))
        .filter((faq) => faq.question || faq.answer)

      // Assets Logic: Pre-upload to get URLs
      let finalResourceUrl = addResourceForm.resourceUrl?.trim() || ""
      if (addResourceForm.file && uploadMode === "file") {
        finalResourceUrl = await uploadDocument(addResourceForm.file, {
          prefix: `knowledge-base/${addResourceForm.contentType}`
        })
      }

      let finalThumbnailUrl = undefined
      if (addResourceForm.thumbnail) {
        finalThumbnailUrl = await uploadDocument(addResourceForm.thumbnail, {
          prefix: `knowledge-base/thumbnails`
        })
      }

      // Dispatch Payload as JSON object
      const payload = {
        module_id: moduleId,
        title: addResourceForm.title.trim(),
        description: addResourceForm.description.trim(),
        content_type: addResourceForm.contentType,
        resource_url: finalResourceUrl,
        speciality_id: addResourceForm.specialityId.trim(),
        status: addResourceForm.status,
        language_code: addResourceForm.languageCode || "mr",
        thumbnail_url: finalThumbnailUrl || undefined,
        faqs: sanitizedFaqs.length > 0 ? sanitizedFaqs : undefined,
      }

      //@ts-ignore
      createResource(payload, {
        onSuccess: () => {
          toast.success("Resource created successfully")
          resetResourceForm()
          setIsAddDrawerOpen(false)
          queryClient.invalidateQueries({ queryKey: ["module-resources", moduleId] })
          setIsUploading(false)
        },
        onError: (error: any) => {
          toast.error("Failed to create resource", {
            description: error.response?.data?.message || "Please try again."
          })
          setIsUploading(false)
        }
      })
    } catch (error: any) {
      toast.error("Process failed", {
        description: error?.message || "Something went wrong during initialization."
      })
      setIsUploading(false)
    }
  }

  const handleOpenDelete = (resource: KnowledgeBaseResource) => {
    setResourceToActOn(resource)
    setConfirmDialogOpen(true)
  }

  const handleOpenView = (resource: KnowledgeBaseResource) => {
    setViewResource(resource)
    setIsViewDrawerOpen(true)
  }

  const handleViewDrawerOpenChange = (open: boolean) => {
    setIsViewDrawerOpen(open)
    if (!open) {
      setViewResource(null)
    }
  }

  const handleOpenEdit = (resource: KnowledgeBaseResource) => {
    setEditResource(resource)
    setEditForm({
      title: resource.title || "",
      description: resource.description || "",
      contentType: resource.content_type || "video",
      resourceUrl: resource.resource_url || "",
      specialityId: resource.speciality_id || "",
      status: (resource.status as "active" | "inactive") || "active",
      file: null,
      thumbnail: null,
      faqs: Array.isArray(resource.faqs) ? [...resource.faqs] : [],
      languageCode: resource.language_code || "mr",
    })
    setEditPreview(undefined)
    setEditFileName(resource.resource_url?.split("/").pop())
    setIsFileRemoved(false)
    setIsEditDrawerOpen(true)
  }

  const handleEditDrawerOpenChange = (open: boolean) => {
    setIsEditDrawerOpen(open)
    if (!open) {
      setEditResource(null)
      setEditForm(initialAddResourceForm)
      setEditPreview(undefined)
      setEditFileName(undefined)
      setIsFileRemoved(false)
      setEditUploadMode("file")
    }
  }

  const handleUpdateResource = async () => {
    if (!editResource) return

    // Standard Validation
    if (!editForm.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!editForm.specialityId.trim()) {
      toast.error("Speciality selection is required")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("module_id", moduleId)
      let hasChanges = false

      // Support for selective updates with FormData
      const appendIfChanged = (key: string, newValue: any, originalValue: any) => {
        const normalizedNew = newValue === null || newValue === undefined ? "" : String(newValue).trim()
        const normalizedOriginal = originalValue === null || originalValue === undefined ? "" : String(originalValue).trim()

        if (normalizedNew !== normalizedOriginal) {
          formData.append(key, normalizedNew)
          hasChanges = true
        }
      }

      // Core diffing
      appendIfChanged("title", editForm.title.trim(), editResource.title)
      appendIfChanged("description", editForm.description.trim() || "", editResource.description || "")
      appendIfChanged("content_type", editForm.contentType, editResource.content_type)
      appendIfChanged("speciality_id", editForm.specialityId.trim(), editResource.speciality_id)
      appendIfChanged("status", editForm.status, editResource.status)
      appendIfChanged("language_code", editForm.languageCode, editResource.language_code || "mr")

      // FAQ Analysis & Diffing
      const sanitizedFaqs = (editForm.faqs || [])
        .map((faq) => ({
          question: faq.question?.trim() || "",
          answer: faq.answer?.trim() || "",
        }))
        .filter((faq) => faq.question || faq.answer)

      const originalFaqsArr = Array.isArray(editResource.faqs) ? editResource.faqs : []
      const originalFaqsJson = JSON.stringify(originalFaqsArr.map(f => ({
        question: (f.question || "").trim(),
        answer: (f.answer || "").trim()
      })))
      const newFaqsJson = JSON.stringify(sanitizedFaqs)

      if (originalFaqsJson !== newFaqsJson) {
        formData.append("faqs", newFaqsJson)
        hasChanges = true
      }

      // Asset Logic: Pre-upload files to get URLs and then append to Form Data
      if (editForm.file && editUploadMode === "file") {
        const uploadedUrl = await uploadDocument(editForm.file, {
          prefix: `knowledge-base/${editForm.contentType}`,
        })
        formData.append("resource_url", uploadedUrl)
        hasChanges = true
      } else if (editUploadMode === "url") {
        const trimmedUrl = editForm.resourceUrl.trim()
        if (trimmedUrl !== (editResource.resource_url || "")) {
          formData.append("resource_url", trimmedUrl)
          hasChanges = true
        }
      }

      // Visual Identity: Pre-upload thumbnail and then append to Form Data
      if (editForm.thumbnail) {
        const thumbUrl = await uploadDocument(editForm.thumbnail, {
          prefix: `knowledge-base/thumbnails`,
        })
        formData.append("thumbnail_url", thumbUrl)
        hasChanges = true
      }

      // Optimization: No changes, No network call.
      if (!hasChanges) {
        toast.info("No modifications detected.")
        setIsUploading(false)
        setIsEditDrawerOpen(false)
        return
      }

      updateResource(
        { id: editResource.id, data: formData },
        {
          onSuccess: () => {
            toast.success("Resource updated successfully")
            setIsEditDrawerOpen(false)
            setEditResource(null)
            queryClient.invalidateQueries({ queryKey: ["module-resources", moduleId] })
            setIsUploading(false)
          },
          onError: (error: any) => {
            toast.error("Failed to update resource", {
              description: error.response?.data?.message || "Please try again.",
            })
            setIsUploading(false)
          },
        }
      )
    } catch (error: any) {
      toast.error("Process failed", {
        description: error?.message || "Something went wrong during dynamic sync.",
      })
      setIsUploading(false)
    }
  }

  const handleDeleteResource = (resourceId: string) => {
    deleteResource(resourceId, {
      onSuccess: () => {
        toast.success("Resource deleted")
        queryClient.invalidateQueries({ queryKey: ["module-resources", moduleId] })
        queryClient.invalidateQueries({ queryKey: ["module-deleted-resources", moduleId] })
        setConfirmDialogOpen(false)
        setResourceToActOn(null)
      }
    })
  }

  const handleRestoreResource = (resourceId: string) => {
    restoreResource(resourceId, {
      onSuccess: () => {
        toast.success("Resource restored")
        queryClient.invalidateQueries({ queryKey: ["module-resources", moduleId] })
        queryClient.invalidateQueries({ queryKey: ["module-deleted-resources", moduleId] })
      }
    })
  }

  const openReorderDrawer = () => {
    setReorderResources(resources)
    setIsReorderDrawerOpen(true)
  }

  const handleReorderSave = () => {
    reorderResourcesMutation.mutate(reorderResources.map((resource) => resource.id))
  }

  const isAddingResource = isCreating || isUploading
  const isSavingOrder = reorderResourcesMutation.isPending
  const isConfirmLoading = isDeleting
  const isUpdatingResource = isUpdating || isUploading

  const handleAddDrawerOpenChange = (open: boolean) => {
    setIsAddDrawerOpen(open)
    if (!open) {
      resetResourceForm()
    }
  }

  const resourceContentOptions = useMemo(
    () => [
      { label: "Video", value: "video", accept: "video/*" },
      { label: "PDF", value: "pdf", accept: ".pdf" },
      { label: "Article", value: "article", accept: "text/plain,.md" },
      { label: "Document", value: "document", accept: ".doc,.docx,.txt,.rtf" },
      { label: "Image", value: "image", accept: "image/*" },
      { label: "Recipe", value: "recipe", accept: "application/pdf,.doc,.docx" },
      { label: "External Link", value: "external_link", accept: "" },
    ],
    []
  )

  const selectedContentType = resourceContentOptions.find(
    (option) => option.value === addResourceForm.contentType
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 p-6 md:p-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <section className="rounded-3xl border bg-gradient-to-br from-card via-card to-muted/40 p-6 shadow-sm">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-72" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={`module-chip-${idx}`} className="h-5 w-32" />
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28 rounded-full" />
                  <Skeleton className="h-9 w-28 rounded-full" />
                </div>
              </div>
              <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`resource-skeleton-${idx}`} className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-24 w-32 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-4 w-80" />
                        <div className="flex gap-3">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6 md:p-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {/* Redesigned Minimalist Header */}
          <div className="space-y-8 py-4">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-6">
                <div>
                  <Link href={`/dashboard/admin/courses/manage/${id}`}>
                    <Button variant="outline" size="sm" className="h-8 px-0 text-slate-900 transition-colors uppercase tracking-[0.2em] text-[10px] font-black">
                      <ArrowLeft className="mr-2 h-3 w-3" /> Back
                    </Button>
                  </Link>
                </div>

                <div className="max-w-3xl space-y-4">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-[1.1]">
                    {moduleData?.title || "Loading..."}
                  </h1>
                  <p className="text-base font-medium leading-relaxed text-slate-400/80">
                    {moduleData?.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6 shrink-0 lg:w-[340px]">
                {/* Minimal Stats Row */}
                <div className="flex items-center gap-6 border-b border-slate-100 pb-6">
                  <div className="flex flex-col border-r border-slate-100 pr-6 bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Updated</span>
                    <span className="text-sm font-bold text-slate-600">
                      {moduleData ? new Date(moduleData.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "-"}
                    </span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-100" />
                  <div className="flex flex-col bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Resources</span>
                    <span className="text-sm font-bold text-slate-600">{resources.length} Items</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => handleAddDrawerOpenChange(true)}
                    className="h-14 flex-1 rounded-[1.25rem] bg-slate-900 text-white hover:bg-black transition-all shadow-xl shadow-slate-900/10 font-bold uppercase text-[10px] tracking-widest active:translate-y-px"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Resource
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="h-14 w-14 rounded-[1.25rem] border-slate-200 hover:border-slate-900 transition-all p-0 flex items-center justify-center shrink-0"
                    >
                      {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={openReorderDrawer}
                      disabled={resources.length < 2}
                      className="h-14 w-14 rounded-[1.25rem] border-slate-200 hover:border-slate-900 transition-all p-0 flex items-center justify-center shrink-0"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" /> Loading module…
            </div>
          ) : moduleData ? (
            <>
              <section className="rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Linked resources</h3>
                    <p className="text-sm text-muted-foreground">
                      All learning materials attached to this module.
                    </p>
                  </div>
                  <Badge>{resources.length} items</Badge>
                </div>

                {resources.length ? (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {resources.map((resource: any) => (
                      <div
                        key={resource.id}
                        className="group relative flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                      >
                        {/* Status Badge Overlay */}
                        <div className="absolute top-4 right-4 z-10">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "rounded-full px-4 h-6 font-black uppercase text-[8px] tracking-widest border-0 shadow-sm backdrop-blur-md",
                              resource.status === "active"
                                ? "bg-emerald-100/80 text-emerald-700"
                                : "bg-rose-100/80 text-rose-700"
                            )}
                          >
                            {resource.status}
                          </Badge>
                        </div>

                        {/* Card Image/Preview */}
                        <div className="h-44 w-full bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                          {renderResourcePreview(resource)}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Content Header & Metadata */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg ring-4 ring-slate-100">
                                {renderResourceIcon(resource)}
                              </div>
                              <div className="overflow-hidden">
                                <h4 className="font-black text-slate-900 truncate leading-tight tracking-tight">
                                  {resource.title}
                                </h4>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-0.5">
                                  {resource.content_type?.replace("_", " ")} · Index #{resource.display_order ?? "-"}
                                </p>
                              </div>
                            </div>

                            <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed italic">
                              {resource.description || "No deep analysis provided for this asset."}
                            </p>
                          </div>

                          <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex -space-x-2">
                              {/* Quick summary avatars - can represent different data points if needed, or just visual polish */}
                              <div className="h-6 w-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">Q</div>
                              <div className="h-6 w-6 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">A</div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenView(resource)}
                                className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(resource)}
                                className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDelete(resource)}
                                className="h-9 w-9 rounded-xl font-black text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-12 mb-20 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-16 text-center">
                    <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center mb-6">
                      <Plus className="h-10 w-10 text-slate-200" strokeWidth={3} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Empty Knowledge Repository</h4>
                    <p className="text-sm font-medium text-slate-400 mt-2 max-w-sm">No clinical assets remain linked to this module. Initialize yours to begin.</p>
                    <Button
                      variant="outline"
                      onClick={() => handleAddDrawerOpenChange(true)}
                      className="mt-8 h-12 px-8 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
                    >
                      Connect First Resource
                    </Button>
                  </div>
                )}
              </section>


            </>
          ) : (
            <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
              Module not found.
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={isAddDrawerOpen}
        onOpenChange={handleAddDrawerOpenChange}
        direction="right"
      >
        <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl flex max-h-[100vh] flex-col border-0 rounded-l-[3rem] shadow-2xl bg-[#f8fafc]">
          <DrawerHeader className="px-10 pt-10 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Knowledge Asset</span>
                </div>
                <DrawerTitle className="text-3xl font-black text-slate-900 tracking-tight">Upload Resource</DrawerTitle>
                <DrawerDescription className="text-slate-500 font-medium">Add a new learning material to this module.</DrawerDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-slate-200"
                onClick={() => handleAddDrawerOpenChange(false)}
              >
                <CloseIcon className="h-5 w-5" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="px-10 space-y-12 overflow-y-auto pb-10 flex-1">
            {/* Step 1: Core Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">01</div>
                <h3 className="text-xl font-black text-slate-900">Core Information</h3>
              </div>

              <div className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Resource Title *</Label>
                  <Input
                    placeholder="e.g. Advanced Neurological Assessments"
                    value={addResourceForm.title}
                    onChange={(event) =>
                      setAddResourceForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className={cn(
                      "h-14 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-2xl text-base font-bold px-6",
                      addFormErrors.title && "border-destructive focus-visible:ring-destructive/40"
                    )}
                  />
                  {addFormErrors.title && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{addFormErrors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Description</Label>
                  <Textarea
                    rows={4}
                    value={addResourceForm.description}
                    placeholder="Describe the learning objectives of this resource..."
                    onChange={(event) => {
                      setAddResourceForm((prev) => ({ ...prev, description: event.target.value }))
                      if (addFormErrors.description) clearAddFormError("description")
                    }}
                    className={cn(
                      "border-slate-200 bg-slate-50/50 max-h-[200px] overflow-y-auto focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-2xl text-sm font-medium p-6 resize-none",
                      addFormErrors.description && "border-destructive focus-visible:ring-destructive/40"
                    )}
                  />
                  {addFormErrors.description && (
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{addFormErrors.description}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Step 2: Content & Asset */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">02</div>
                <h3 className="text-xl font-black text-slate-900">Content & Asset</h3>
              </div>

              <div className="space-y-8 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Resource Type</Label>
                    <Select
                      value={addResourceForm.contentType}
                      onValueChange={(value) =>
                        setAddResourceForm((prev) => ({
                          ...prev,
                          contentType: value,
                          file: null,
                          resourceUrl: "",
                        }))
                      }
                    >
                      <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-slate-50/50 font-bold px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200">
                        {resourceContentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Status</Label>
                    <Select
                      value={addResourceForm.status}
                      onValueChange={(value: "active" | "inactive") =>
                        setAddResourceForm((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-slate-50/50 font-bold px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200">
                        <SelectItem value="active" className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">Active</SelectItem>
                        <SelectItem value="inactive" className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Primary Asset Content</Label>
                    {addResourceForm.contentType === "external_link" ? (
                      <div className="flex bg-slate-100 p-1 rounded-lg w-fit border border-slate-200">
                        <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md bg-white shadow-sm text-slate-900 flex items-center">
                          <LinkIcon className="h-3 w-3 mr-2" /> External URL
                        </div>
                      </div>
                    ) : (
                      <div className="flex bg-slate-100 p-1 rounded-lg w-fit border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setUploadMode("file")}
                          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all duration-200 flex items-center ${uploadMode === "file" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                        >
                          <Paperclip className="h-3 w-3 mr-2" /> File Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode("url")}
                          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all duration-200 flex items-center ${uploadMode === "url" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                        >
                          <LinkIcon className="h-3 w-3 mr-2" /> External URL
                        </button>
                      </div>
                    )}
                  </div>

                  {addResourceForm.contentType === "external_link" || uploadMode === "url" ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="https://example.com/resource"
                        type="url"
                        value={addResourceForm.resourceUrl}
                        onChange={(event) =>
                          setAddResourceForm((prev) => ({ ...prev, resourceUrl: event.target.value }))
                        }
                        className={cn(
                          "h-16 border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white px-6 font-mono text-sm",
                          addFormErrors.resourceUrl && "border-destructive focus-visible:ring-destructive/40"
                        )}
                      />
                      {addFormErrors.resourceUrl && (
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{addFormErrors.resourceUrl}</p>
                      )}
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 pl-1 italic">YouTube, Vimeo, or a direct link to the content asset.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative group">
                        <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] cursor-pointer hover:bg-blue-50/30 hover:border-blue-300 transition-all text-center">
                          <div className="h-14 w-14 rounded-[1.25rem] bg-white border border-slate-100 flex items-center justify-center shadow-xl mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="text-lg font-black text-slate-900 tracking-tight">Select Asset File</span>
                          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-black">
                            {selectedContentType?.label} (MAX {RESOURCE_FILE_MAX_MB}MB)
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept={selectedContentType?.accept ?? "*/*"}
                            onChange={(event) => handleResourceFileChange(event.target.files?.[0])}
                          />
                        </label>
                      </div>

                      {resourceFilePreview && (
                        <div className="p-6 rounded-[1.5rem] bg-blue-50 border border-blue-100 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <Paperclip className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 truncate max-w-[200px] text-sm tracking-tight">{resourceFileName}</p>
                                <p className="text-[9px] uppercase font-black text-blue-400 tracking-widest mt-0.5">Ready for upload</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 rounded-lg text-rose-500 hover:bg-rose-100/50 font-bold"
                              onClick={() => {
                                handleResourceFileChange(null)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                            </Button>
                          </div>

                          {addResourceForm.contentType === "video" && (
                            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 aspect-video bg-black">
                              <video src={resourceFilePreview} className="h-full w-full object-contain" controls />
                            </div>
                          )}
                          {addResourceForm.contentType === "image" && (
                            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 aspect-video bg-white">
                              <img src={resourceFilePreview} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}
                      {addFormErrors.file && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{addFormErrors.file}</p>}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Step 3: Visual Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">03</div>
                <h3 className="text-xl font-black text-slate-900">Visual Identity</h3>
              </div>

              <div className="space-y-8 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Knowledge Classification *</Label>
                  <Select
                    value={addResourceForm.specialityId}
                    onValueChange={(value) =>
                      setAddResourceForm((prev) => ({ ...prev, specialityId: value }))
                    }
                    disabled={specialitiesQuery.isLoading}
                  >
                    <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-slate-50/50 font-bold px-6">
                      <SelectValue placeholder={specialitiesQuery.isLoading ? "Loading specialities..." : "Select speciality"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200">
                      {specialityOptions.map((speciality) => (
                        <SelectItem key={speciality.id} value={speciality.id} className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">
                          {speciality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {addFormErrors.specialityId && (
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{addFormErrors.specialityId}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Primary Thumbnail (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <label className="flex h-32 flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl cursor-pointer hover:bg-orange-50/30 hover:border-orange-200 transition-all text-center">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-md mb-2">
                          <Plus className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tight">Select Poster</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) setAddResourceForm(prev => ({ ...prev, thumbnail: file }))
                          }}
                        />
                      </label>
                    </div>

                    {addResourceForm.thumbnail && (
                      <div className="relative group rounded-2xl overflow-hidden border-2 border-white shadow-lg aspect-video ring-1 ring-slate-100">
                        <img
                          src={URL.createObjectURL(addResourceForm.thumbnail)}
                          alt="Thumbnail preview"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setAddResourceForm(prev => ({ ...prev, thumbnail: null }))}
                            className="rounded-lg h-9 px-4 font-black uppercase text-[9px] tracking-widest"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Poster
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4: Supplemental Knowledge */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">04</div>
                <h3 className="text-xl font-black text-slate-900">Supplemental Knowledge</h3>
              </div>

              <div className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-slate-700 font-bold">Frequently Asked Questions</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setAddResourceForm((prev) => ({
                        ...prev,
                        faqs: [...(Array.isArray(prev.faqs) ? prev.faqs : []), { question: "", answer: "" }],
                      }))
                    }
                    className="h-9 rounded-xl border-blue-200 bg-blue-50 text-blue-700 font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-blue-100 transition-all"
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" /> New FAQ Node
                  </Button>
                </div>

                {Array.isArray(addResourceForm.faqs) && addResourceForm.faqs.length > 0 ? (
                  <div className="grid gap-6">
                    {addResourceForm.faqs.map((faq, index) => (
                      <div
                        key={`add-faq-${index}`}
                        className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-white hover:border-blue-200 shadow-sm"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-rose-500 text-white opacity-0 shadow-lg shadow-rose-200 transition-opacity group-hover:opacity-100 hover:bg-rose-600"
                          onClick={() =>
                            setAddResourceForm((prev) => ({
                              ...prev,
                              faqs: (Array.isArray(prev.faqs) ? prev.faqs : []).filter((_, i) => i !== index),
                            }))
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <div className="space-y-6">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">The Question {index + 1}</Label>
                            <Input
                              placeholder="e.g. What are the key takeaways?"
                              value={faq.question}
                              onChange={(e) => {
                                const currentFaqs = Array.isArray(addResourceForm.faqs) ? addResourceForm.faqs : []
                                const newFaqs = [...currentFaqs]
                                newFaqs[index] = { ...newFaqs[index], question: e.target.value }
                                setAddResourceForm((prev) => ({ ...prev, faqs: newFaqs }))
                              }}
                              className="h-12 border-slate-200 bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-xl text-sm font-bold px-4"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">The Response</Label>
                            <Textarea
                              placeholder="Provide a comprehensive answer..."
                              value={faq.answer}
                              rows={3}
                              onChange={(e) => {
                                const currentFaqs = Array.isArray(addResourceForm.faqs) ? addResourceForm.faqs : []
                                const newFaqs = [...currentFaqs]
                                newFaqs[index] = { ...newFaqs[index], answer: e.target.value }
                                setAddResourceForm((prev) => ({ ...prev, faqs: newFaqs }))
                              }}
                              className="border-slate-200 bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-xl text-sm font-medium p-4 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center bg-slate-50/50 text-slate-300">
                    <HelpCircle className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm font-black tracking-tight">Structured Data Empty</p>
                    <p className="text-[10px] uppercase tracking-widest mt-1">Add FAQs to improve comprehension.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <DrawerFooter className="border-t bg-white px-10 py-8">
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="ghost"
                onClick={() => handleAddDrawerOpenChange(false)}
                className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:text-slate-900"
              >
                Cancel Process
              </Button>
              <Button
                onClick={handleAddResource}
                disabled={isAddingResource}
                className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-900/20 active:translate-y-1 transition-all"
              >
                {isAddingResource ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-400" />
                    Processing...
                  </>
                ) : (
                  "Finalize & Upload"
                )}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isReorderDrawerOpen}
        onOpenChange={setIsReorderDrawerOpen}
        direction="right"
      >
        <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>Reorder resources</DrawerTitle>
            <DrawerDescription>Drag and drop to adjust the display order.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            {reorderResources.length ? (
              <DraggableList
                items={reorderResources}
                getItemId={(item) => item.id}
                onReorder={setReorderResources}
                renderItem={(resource, index) => (
                  <div className="flex flex-col">
                    <span className="font-medium">#{index + 1} {resource.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {resource.content_type?.toUpperCase()}
                    </span>
                  </div>
                )}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No resources to reorder.</p>
            )}
          </div>
          <DrawerFooter className="border-t bg-muted/40">
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReorderDrawerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReorderSave} disabled={isSavingOrder || reorderResources.length < 2}>
                {isSavingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save order
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] border-0 shadow-2xl overflow-hidden p-0">
          <div className="h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500" />
          <div className="p-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Trash2 className="h-6 w-6 text-rose-500" />
                Confirm Resource Purge
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium pt-2">
                This will move the resource <span className="font-black text-slate-900">"{resourceToActOn?.title}"</span> to the archives.
                Internal links will be severed and learners will lose access immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 pt-6 border-t border-slate-50">
              <AlertDialogCancel className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 border-0 hover:bg-slate-50">
                Abort Action
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => resourceToActOn && handleDeleteResource(resourceToActOn.id)}
                className="h-12 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-200"
              >
                {isConfirmLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Execute Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Drawer
        open={isViewDrawerOpen}
        onOpenChange={handleViewDrawerOpenChange}
        direction="right"
      >
        <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl flex max-h-[100vh] flex-col border-0 rounded-l-[3rem] shadow-2xl bg-[#f8fafc]">
          <DrawerHeader className="px-10 pt-10 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Resource Analysis</span>
                </div>
                <DrawerTitle className="text-3xl font-black text-slate-900 tracking-tight">{viewResource?.title || "Asset Preview"}</DrawerTitle>
                <DrawerDescription className="text-slate-500 font-medium">Deep dive into the resource metadata and content.</DrawerDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-slate-200"
                onClick={() => handleViewDrawerOpenChange(false)}
              >
                <CloseIcon className="h-5 w-5" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="px-10 space-y-12 overflow-y-auto pb-10 flex-1">
            {/* Visual Identification Section */}
            {viewResource?.resource_url && (
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">A</div>
                  <h3 className="text-xl font-black text-slate-900">Primary Material</h3>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                  {viewResource.content_type?.toLowerCase() === "video" ? (
                    <div className="rounded-[1.5rem] overflow-hidden bg-black shadow-2xl aspect-video relative group">
                      <video
                        src={viewResource.resource_url}
                        className="w-full h-full object-contain"
                        controls
                        playsInline
                      />
                    </div>
                  ) : viewResource.content_type?.toLowerCase() === "image" ? (
                    <div className="rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-2xl bg-white aspect-video">
                      <img src={viewResource.resource_url} alt={viewResource.title} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video w-full overflow-hidden rounded-[1.5rem] bg-slate-50 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-10">
                      <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4">
                        {renderResourceIcon(viewResource)}
                      </div>
                      <span className="text-lg font-black text-slate-900 tracking-tight">{viewResource.content_type?.toUpperCase()} Resource</span>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">Click to open or download the attachment.</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                      <p className="text-xs font-bold text-slate-600 truncate">{viewResource.resource_url}</p>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-blue-600 hover:text-blue-700 shrink-0">
                      <a href={viewResource.resource_url} target="_blank" rel="noreferrer">
                        Open <ExternalLink className="ml-1.5 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* Metadata Summary Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">B</div>
                <h3 className="text-xl font-black text-slate-900">Technical Context</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asset Status</p>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", viewResource?.status === "active" ? "bg-emerald-500" : "bg-rose-500")} />
                    <span className="text-base font-black text-slate-900 capitalize">{viewResource?.status}</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Index</p>
                  <span className="text-base font-black text-slate-900">#{viewResource?.display_order ?? "UNSET"}</span>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Classification</p>
                  <span className="text-base font-black text-slate-900 uppercase tracking-tighter">{viewResource?.content_type}</span>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Synchronized</p>
                  <span className="text-base font-black text-slate-900">
                    {viewResource?.updated_at ? new Date(viewResource.updated_at).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>

              {viewResource?.description && (
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Executive Summary</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                    "{viewResource.description}"
                  </p>
                </div>
              )}
            </section>

            {/* Supplemental Knowledge Section */}
            {Array.isArray(viewResource?.faqs) && viewResource.faqs.length > 0 && (
              <section className="space-y-6 pb-12">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">C</div>
                  <h3 className="text-xl font-black text-slate-900">Supplemental Logic ({viewResource.faqs.length})</h3>
                </div>

                <div className="grid gap-6">
                  {viewResource.faqs.map((faq, index) => (
                    <div
                      key={`view-faq-item-${index}`}
                      className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-50 space-y-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100">Q</div>
                        <p className="text-base font-black text-slate-900 leading-tight pt-1">
                          {faq.question}
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs border border-emerald-100">A</div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed pt-2">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <DrawerFooter className="border-t bg-white px-10 py-8">
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => handleViewDrawerOpenChange(false)}
                className="h-14 px-10 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:text-slate-900"
              >
                Close Analysis
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Drawer
        open={isEditDrawerOpen}
        onOpenChange={handleEditDrawerOpenChange}
        direction="right"
      >
        <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl flex max-h-[100vh] flex-col border-0 rounded-l-[3rem] shadow-2xl bg-[#f8fafc]">
          <DrawerHeader className="px-10 pt-10 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Knowledge Asset Edit</span>
                </div>
                <DrawerTitle className="text-3xl font-black text-slate-900 tracking-tight">Modify Resource</DrawerTitle>
                <DrawerDescription className="text-slate-500 font-medium">Update metadata or replace the core asset.</DrawerDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-slate-200"
                onClick={() => handleEditDrawerOpenChange(false)}
              >
                <CloseIcon className="h-5 w-5" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="px-10 space-y-12 overflow-y-auto pb-10 flex-1">
            {/* Step 1: Core Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">01</div>
                <h3 className="text-xl font-black text-slate-900">Core Information</h3>
              </div>

              <div className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Resource Title *</Label>
                  <Input
                    placeholder="e.g. Advanced Neurological Assessments"
                    value={editForm.title}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="h-14 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-2xl text-base font-bold px-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Executive Summary</Label>
                  <Textarea
                    rows={4}
                    value={editForm.description}
                    placeholder="Describe the learning objectives of this resource..."
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    className="border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-2xl text-sm font-medium p-6 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Content & Asset */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">02</div>
                <h3 className="text-xl font-black text-slate-900">Content & Asset</h3>
              </div>

              <div className="space-y-8 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Resource Type</Label>
                    <Select
                      value={editForm.contentType}
                      onValueChange={(value) =>
                        setEditForm((prev) => ({
                          ...prev,
                          contentType: value,
                          file: null,
                          resourceUrl: "",
                        }))
                      }
                    >
                      <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-slate-50/50 font-bold px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200">
                        {resourceContentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Status</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value: "active" | "inactive") =>
                        setEditForm((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-slate-50/50 font-bold px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200">
                        <SelectItem value="active" className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">Active</SelectItem>
                        <SelectItem value="inactive" className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Asset Control</Label>
                    <div className="flex bg-slate-100 p-1 rounded-lg w-fit border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setEditUploadMode("file")}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all duration-200 flex items-center ${editUploadMode === "file" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        <Paperclip className="h-3 w-3 mr-2" /> File Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditUploadMode("url")}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all duration-200 flex items-center ${editUploadMode === "url" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        <LinkIcon className="h-3 w-3 mr-2" /> External URL
                      </button>
                    </div>
                  </div>

                  {editForm.contentType === "external_link" || editUploadMode === "url" ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="https://example.com/resource"
                        type="url"
                        value={editForm.resourceUrl}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, resourceUrl: event.target.value }))
                        }
                        className="h-16 border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white px-6 font-mono text-sm"
                      />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 pl-1 italic">Providing a link will override the existing file if applicable.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Current file notification */}
                      {editResource?.resource_url && !isFileRemoved && !editForm.file && (
                        <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                <FileText className="h-4 w-4 text-slate-400" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Active System File</p>
                                <p className="font-black text-slate-900 truncate max-w-[240px] text-sm tracking-tight">{editResource.resource_url.split("/").pop()}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              asChild
                              className="h-8 px-3 rounded-lg text-slate-600 font-bold border-slate-200"
                            >
                              <a href={editResource.resource_url} target="_blank" rel="noreferrer">
                                <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="relative group">
                        <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] cursor-pointer hover:bg-blue-50/30 hover:border-blue-300 transition-all text-center">
                          <div className="h-14 w-14 rounded-[1.25rem] bg-white border border-slate-100 flex items-center justify-center shadow-xl mb-4 group-hover:scale-110 transition-transform">
                            <RefreshCw className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="text-lg font-black text-slate-900 tracking-tight">Replace Existing Asset</span>
                          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-black">
                            {editForm.contentType.toUpperCase()} (MAX {RESOURCE_FILE_MAX_MB}MB)
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept={selectedContentType?.accept ?? "*/*"}
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (!file) return
                              setEditForm((prev) => ({ ...prev, file }))
                              setEditPreview(URL.createObjectURL(file))
                              setEditFileName(file.name)
                              setIsFileRemoved(false)
                            }}
                          />
                        </label>
                      </div>

                      {editForm.file && editPreview && (
                        <div className="p-6 rounded-[1.5rem] bg-emerald-50 border border-emerald-100 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <Paperclip className="h-4 w-4 text-emerald-500" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 truncate max-w-[200px] text-sm tracking-tight">{editFileName}</p>
                                <p className="text-[9px] uppercase font-black text-emerald-400 tracking-widest mt-0.5">Replacement Loaded</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 rounded-lg text-rose-500 hover:bg-rose-100/50 font-bold"
                              onClick={() => {
                                setEditForm((prev) => ({ ...prev, file: null }))
                                setEditPreview(undefined)
                                setEditFileName(undefined)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Revert
                            </Button>
                          </div>

                          {editForm.contentType === "video" && (
                            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 aspect-video bg-black">
                              <video src={editPreview} className="h-full w-full object-contain" controls />
                            </div>
                          )}
                          {editForm.contentType === "image" && (
                            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 aspect-video bg-white">
                              <img src={editPreview} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Step 3: Visual Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">03</div>
                <h3 className="text-xl font-black text-slate-900">Visual Identity</h3>
              </div>

              <div className="space-y-8 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Knowledge Classification *</Label>
                  <Select
                    value={editForm.specialityId}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({ ...prev, specialityId: value }))
                    }
                    disabled={specialitiesQuery.isLoading}
                  >
                    <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-slate-50/50 font-bold px-6">
                      <SelectValue placeholder={specialitiesQuery.isLoading ? "Loading specialities..." : "Select speciality"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200">
                      {specialityOptions.map((speciality) => (
                        <SelectItem key={speciality.id} value={speciality.id} className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">
                          {speciality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-900 font-black text-[10px] uppercase tracking-widest pl-1">Primary Thumbnail (Optional)</Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <label className="flex h-32 flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl cursor-pointer hover:bg-orange-50/30 hover:border-orange-200 transition-all text-center">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-md mb-2">
                          <Plus className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tight">Modify Poster</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) setEditForm(prev => ({ ...prev, thumbnail: file }))
                          }}
                        />
                      </label>
                    </div>

                    <div className="relative group rounded-2xl overflow-hidden border-2 border-white shadow-lg aspect-video ring-1 ring-slate-100 bg-slate-50">
                      {editForm.thumbnail ? (
                        <img
                          src={URL.createObjectURL(editForm.thumbnail as File)}
                          alt="New Thumbnail"
                          className="h-full w-full object-cover"
                        />
                      ) : editResource?.thumbnail_url ? (
                        <img
                          src={editResource.thumbnail_url}
                          alt="Current Thumbnail"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No Poster Set</div>
                      )}

                      {(editForm.thumbnail || editResource?.thumbnail_url) && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setEditForm(prev => ({ ...prev, thumbnail: null }))
                            }}
                            className="rounded-lg h-9 px-4 font-black uppercase text-[9px] tracking-widest"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Reset Poster
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4: Supplemental Knowledge */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">04</div>
                <h3 className="text-xl font-black text-slate-900">Supplemental Knowledge</h3>
              </div>

              <div className="space-y-6 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-slate-700 font-bold">Frequently Asked Questions</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setEditForm((prev: any) => ({
                        ...prev,
                        faqs: [...(Array.isArray(prev?.faqs) ? prev.faqs : []), { question: "", answer: "" }],
                      }))
                    }
                    className="h-9 rounded-xl border-blue-200 bg-blue-50 text-blue-700 font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-blue-100 transition-all"
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" /> New FAQ Node
                  </Button>
                </div>

                {Array.isArray(editForm.faqs) && editForm.faqs.length > 0 ? (
                  <div className="grid gap-6">
                    {editForm.faqs.map((faq, index) => (
                      <div
                        key={`edit-faq-${index}`}
                        className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-white hover:border-blue-200 shadow-sm"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-rose-500 text-white opacity-0 shadow-lg shadow-rose-200 transition-opacity group-hover:opacity-100 hover:bg-rose-600"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              faqs: (Array.isArray(prev.faqs) ? prev.faqs : []).filter((_, i) => i !== index),
                            }))
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <div className="space-y-6">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">The Question {index + 1}</Label>
                            <Input
                              placeholder="e.g. What are the key takeaways?"
                              value={faq.question}
                              onChange={(e) => {
                                const currentFaqs = Array.isArray(editForm.faqs) ? editForm.faqs : []
                                const newFaqs = [...currentFaqs]
                                newFaqs[index] = { ...newFaqs[index], question: e.target.value }
                                setEditForm((prev) => ({ ...prev, faqs: newFaqs }))
                              }}
                              className="h-12 border-slate-200 bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-xl text-sm font-bold px-4"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">The Response</Label>
                            <Textarea
                              placeholder="Provide a comprehensive answer..."
                              value={faq.answer}
                              rows={3}
                              onChange={(e) => {
                                const currentFaqs = Array.isArray(editForm.faqs) ? editForm.faqs : []
                                const newFaqs = [...currentFaqs]
                                newFaqs[index] = { ...newFaqs[index], answer: e.target.value }
                                setEditForm((prev) => ({ ...prev, faqs: newFaqs }))
                              }}
                              className="border-slate-200 bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-xl text-sm font-medium p-4 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center bg-slate-50/50 text-slate-300">
                    <HelpCircle className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm font-black tracking-tight">Structured Data Empty</p>
                    <p className="text-[10px] uppercase tracking-widest mt-1">Add FAQs to improve comprehension.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <DrawerFooter className="border-t bg-white px-10 py-8">
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="ghost"
                onClick={() => handleEditDrawerOpenChange(false)}
                className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:text-slate-900"
              >
                Cancel Edits
              </Button>
              <Button
                onClick={handleUpdateResource}
                disabled={isUpdatingResource}
                className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-900/20 active:translate-y-1 transition-all"
              >
                {isUpdatingResource ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-400" />
                    Syncing...
                  </>
                ) : (
                  "Push Changes"
                )}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
