"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, Paperclip, X, Plus, Trash2, Image as ImageIcon, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useUpdateResource, useResourceById } from "@/hooks/use-knowledge-base"
import { useSpecialities, useProgramsDropdown } from "@/hooks/use-dropdowns"
import type { ResourceContentType, ResourceStatus } from "@/lib/api/knowledge-base-client"
import { uploadDocument } from "@/lib/upload-document"
import { MediaRenderer } from "@/components/renderComponent"
import { toast } from "sonner"

const faqSchema = z.object({
  question: z
    .string()
    .max(300, "Question must be under 300 characters")
    .optional()
    .or(z.literal("")),
  answer: z
    .string()
    .max(2000, "Answer must be under 2000 characters")
    .optional()
    .or(z.literal("")),
})

const resourceSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be under 200 characters"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(4000, "Description can’t exceed 4000 characters"),
    content_type: z.enum(["video", "article", "recipe"]),
    resource_url: z
      .string()
      .max(500, "URL must be less than 500 characters")
      .optional()
      .or(z.literal("")),
    speciality_id: z
      .string()
      .uuid("Please choose a valid speciality"),
    module_id: z
      .string()
      .uuid("Please choose a valid module")
      .optional()
      .or(z.literal("")),
    language_code: z
      .string()
      .max(10, "Language code can’t be longer than 10 characters")
      .optional()
      .or(z.literal("")),
    status: z.enum(["active", "inactive"]).optional(),
    faqs: z.array(faqSchema).optional(),
    thumbnail_url: z
      .string()
      .url("Please enter a valid thumbnail URL")
      .max(500, "URL must be less than 500 characters")
      .optional()
      .or(z.literal("")),
  })

type ResourceFormData = z.infer<typeof resourceSchema>

const CONTENT_TYPES: { value: ResourceContentType; label: string }[] = [
  { value: "video", label: "Video" },
  { value: "article", label: "Article" },
  { value: "recipe", label: "Recipe" },
]

const STATUS_OPTIONS: { value: ResourceStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const ACCEPT_MAP: Record<any, string> = {
  video: "video/*",
  article: ".pdf,.doc,.docx,.md,.txt",
  recipe: ".pdf,.doc,.docx,.md,.txt",
}

const getAcceptFromContentType = (type: ResourceContentType) => ACCEPT_MAP[type] || "*/*"

const IMAGE_ACCEPT_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
] as const

const IMAGE_ACCEPT_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg"] as const

const IMAGE_ACCEPT_STRING = [...IMAGE_ACCEPT_MIME_TYPES, ...IMAGE_ACCEPT_EXTENSIONS].join(",")

const isValidImageFile = (file: File) => {
  const mime = file.type?.toLowerCase()
  const name = file.name?.toLowerCase() || ""
  const mimeAllowed = mime ? IMAGE_ACCEPT_MIME_TYPES.includes(mime as typeof IMAGE_ACCEPT_MIME_TYPES[number]) : false
  const extensionAllowed = IMAGE_ACCEPT_EXTENSIONS.some((ext) => name.endsWith(ext))
  return mimeAllowed || extensionAllowed
}

export default function EditResourcePage() {
  const router = useRouter()
  const params = useParams()
  const resourceId = params.id as string

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>("")
  const [showExistingFile, setShowExistingFile] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null)
  const [thumbnailError, setThumbnailError] = useState<string>("")

  const { data: resource, isLoading: isLoadingResource } = useResourceById(resourceId)
  const { mutate: updateResource, isPending: isUpdating } = useUpdateResource()
  const { data: specialitiesResponse } = useSpecialities()
  const specialities = specialitiesResponse || []

  const [uploadMode, setUploadMode] = useState<"file" | "url">("file")
  const [isUploading, setIsUploading] = useState(false)
  const isPending = isUploading || isUpdating

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      content_type: "video",
      resource_url: "",
      speciality_id: "",
      module_id: "",
      language_code: "mr",
      status: "active",
      faqs: [{ question: "", answer: "" }],
      thumbnail_url: "",
    },
  })

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: "faqs",
  })

  const contentType = form.watch("content_type")
  const specialityId = form.watch("speciality_id")

  const specialityDisplayName = useMemo(() => {
    const fromList = specialities.find((speciality) => String(speciality.id) === specialityId)?.name
    if (fromList) return fromList
    if (resource?.speciality_id) return `Speciality #${resource.speciality_id}`
    return "Not available"
  }, [resource?.speciality_id, specialities, specialityId])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    if (!resource) return

    form.reset({
      title: resource.title,
      description: resource.description || "",
      content_type: resource.content_type as any,
      resource_url: resource.resource_url || "",
      speciality_id: resource.speciality_id ? String(resource.speciality_id) : "",
      module_id: resource.module_id || "",
      language_code: resource.language_code || "mr",
      status: resource.status,
      faqs: resource.faqs && resource.faqs.length > 0 ? resource.faqs : [{ question: "", answer: "" }],
      thumbnail_url: resource.thumbnail_url || "",
    })

    setShowExistingFile(!!resource.resource_url)
    setSelectedFile(null)
    setFileError("")
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous)
      }
      return null
    })
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
      setThumbnailPreview(null)
    }
    setThumbnailFile(null)
    setThumbnailError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
  }, [resource])

  const getFileNameFromUrl = (url?: string | null) => {
    if (!url) return "Current file"
    try {
      const pathname = new URL(url).pathname
      const name = pathname.split("/").pop()
      return decodeURIComponent(name || "Current file")
    } catch (error) {
      return url.split("/").pop() || "Current file"
    }
  }

  const detectContentTypeFromFile = (file: File): ResourceContentType => {
    const fileName = file.name.toLowerCase()
    const mimeType = file.type.toLowerCase()

    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType === 'application/pdf') return 'pdf'

    if (fileName.endsWith('.mp4') || fileName.endsWith('.webm') || fileName.endsWith('.mov')) return 'video'
    if (fileName.endsWith('.pdf')) return 'pdf'
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.webp') || fileName.endsWith('.gif')) return 'image'
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'document'
    if (fileName.endsWith('.md') || fileName.endsWith('.txt')) return 'article'

    return 'document'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const currentType = form.getValues("content_type")
    // Standardize file validation
    if (currentType === "video" && !file.type.startsWith("video/")) {
      setFileError("Please upload a valid video file.")
      return
    }

    setSelectedFile(file)
    setFileError("")
    setShowExistingFile(false)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setFileError("")
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    form.setValue("resource_url", "")
  }

  const handleRemoveExistingFile = () => {
    setShowExistingFile(false)
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    form.setValue("resource_url", "")
    form.clearErrors("resource_url")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    if (uploadMode === "url") {
      handleClearFile()
    } else {
      form.setValue("resource_url", "")
      form.clearErrors("resource_url")
    }
  }, [uploadMode, form])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidImageFile(file)) {
      setThumbnailError("Unsupported format. Please upload PNG, JPG, WEBP, AVIF or SVG.")
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = ""
      }
      return
    }

    setThumbnailFile(file)
    setThumbnailError("")
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnailPreview(URL.createObjectURL(file))
  }

  const handleClearThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailError("")
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnailPreview(null)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
    form.setValue("thumbnail_url", "")
  }

  const onSubmit = async (data: ResourceFormData) => {
    if (!resource) return

    if (uploadMode === "url" && !data.resource_url?.trim()) {
      form.setError("resource_url", { type: "manual", message: "Please enter a valid URL." })
      return
    }
    if (uploadMode === "file" && !selectedFile && !showExistingFile) {
      setFileError("Please upload a file for this resource.")
      return
    }

    setIsUploading(true)
    try {
      const sanitizedFaqs = (data.faqs || [])
        .map((faq) => ({
          question: faq.question?.trim() || "",
          answer: faq.answer?.trim() || "",
        }))
        .filter((faq) => faq.question || faq.answer)

      const formData = new FormData()
      let hasChanges = false

      // Helper to append if changed
      const appendIfChanged = (key: string, newValue: any, originalValue: any) => {
        if (newValue !== originalValue) {
          formData.append(key, newValue)
          hasChanges = true
        }
      }

      // Core Information
      appendIfChanged("title", data.title.trim(), resource.title)
      appendIfChanged("description", data.description?.trim() || "", resource.description || "")
      appendIfChanged("content_type", data.content_type, resource.content_type)
      appendIfChanged("status", data.status || "inactive", resource.status)
      appendIfChanged("speciality_id", data.speciality_id, resource.speciality_id)
      appendIfChanged("module_id", data.module_id || "", resource.module_id || "")
      appendIfChanged("language_code", data.language_code?.trim() || "mr", resource.language_code || "mr")

      // FAQs diffing
      const originalFaqsJson = JSON.stringify(resource.faqs || [])
      const newFaqsJson = JSON.stringify(sanitizedFaqs)
      if (originalFaqsJson !== newFaqsJson) {
        formData.append("faqs", newFaqsJson)
        hasChanges = true
      }

      // Asset Strategy: Pre-upload changes first
      if (selectedFile) {
        const uploadedUrl = await uploadDocument(selectedFile, { prefix: `knowledge-base/${data.content_type}` })
        formData.append("resource_url", uploadedUrl)
        hasChanges = true
      } else if (uploadMode === "url" && data.resource_url?.trim() !== resource.resource_url) {
        formData.append("resource_url", data.resource_url!.trim())
        hasChanges = true
      }

      // Visual Identity: Pre-upload thumbnail if changed
      const trimmedThumbnailUrl = data.thumbnail_url?.trim() || ""
      const originalThumbnailUrl = resource.thumbnail_url || ""

      if (thumbnailFile) {
        const thumbUrl = await uploadDocument(thumbnailFile, { prefix: `knowledge-base/thumbnails` })
        formData.append("thumbnail_url", thumbUrl)
        hasChanges = true
      } else if (trimmedThumbnailUrl !== originalThumbnailUrl) {
        formData.append("thumbnail_url", trimmedThumbnailUrl)
        hasChanges = true
      }

      if (!hasChanges) {
        toast.info("No modifications detected")
        setIsUploading(false)
        return
      }

      updateResource(
        { id: resourceId, data: formData },
        {
          onSuccess: () => {
            router.push("/dashboard/admin/knowledge-base")
          },
          onError: () => {
            setIsUploading(false)
          }
        }
      )
    } catch (err: any) {
      toast.error("Process failed", { description: err?.message || "Something went wrong" })
      setIsUploading(false)
    }
  }

  if (isLoadingResource) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-slate-500 mb-4">Resource not found</p>
        <Link href="/dashboard/admin/knowledge-base">
          <Button>Back to Knowledge Base</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-12 pb-24">
        <div className="space-y-6">
          <Link href="/dashboard/admin/knowledge-base">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 transition-colors p-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Catalog
            </Button>
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Resource Enhancement</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {resource.title}
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Refine the metadata, accessibility, and supplemental content for this resource.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            {/* Step 1: Core Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">01</div>
                <h3 className="text-2xl font-black text-slate-900">Core Information</h3>
              </div>

              <Card className="border-0 shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Target Resource Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Advanced Neurological Assessments"
                            className="h-16 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-2xl text-lg font-bold px-6"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a comprehensive summary of this resource's objectives..."
                            rows={5}
                            className="border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-2xl text-base font-medium p-6 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Step 2: Content Delivery */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">02</div>
                <h3 className="text-2xl font-black text-slate-900">Content & Asset</h3>
              </div>

              <Card className="border-0 shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="content_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Delivery Mechanism</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            key={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-slate-50/50 font-bold px-6">
                                <SelectValue placeholder="Resource Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-200">
                              {CONTENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value} className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Access Lifecycle</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                            key={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-slate-50/50 font-bold px-6">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-200">
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} value={status.value} className="rounded-xl my-1 mx-1 px-4 py-3 cursor-pointer">
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <Label className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Primary Asset Content</Label>
                      <div className="flex bg-slate-200/60 p-1 rounded-lg w-fit border border-slate-200">
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
                    </div>

                    {uploadMode === "url" ? (
                      <FormField
                        control={form.control}
                        name="resource_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="https://secure-link.com/asset"
                                type="url"
                                className="h-16 border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white px-6 font-mono text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-slate-400 font-medium italic">Direct external link to the hosted resource.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : showExistingFile && resource?.resource_url && !selectedFile ? (
                      <div className="group relative space-y-4 rounded-[2rem] border-2 border-slate-100 bg-slate-50/30 p-8 transition-all hover:bg-slate-50">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                              <Paperclip className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="max-w-[300px]">
                              <p className="text-sm font-black text-slate-900 truncate tracking-tight">
                                {getFileNameFromUrl(resource.resource_url)}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Asset</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                            onClick={handleRemoveExistingFile}
                          >
                            <X className="h-6 w-6" />
                          </Button>
                        </div>
                        <div className="rounded-[1.5rem] overflow-hidden border border-slate-200/50 shadow-2xl aspect-video bg-black">
                          <MediaRenderer url={resource.resource_url} typeHint={resource.content_type} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="relative group">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            accept={getAcceptFromContentType(form.watch("content_type"))}
                            disabled={isPending}
                            className="hidden"
                            id="file-upload-input"
                          />
                          <Label
                            htmlFor="file-upload-input"
                            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2.5rem] cursor-pointer group-hover:bg-blue-50/30 group-hover:border-blue-300 transition-all text-center"
                          >
                            <div className="h-16 w-16 rounded-[1.25rem] bg-white border border-slate-100 flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform">
                              <Plus className="h-8 w-8 text-blue-600" />
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tight">Upload New Asset</span>
                            <span className="text-xs text-slate-400 mt-2 uppercase tracking-[0.2em] font-black">
                              {getAcceptFromContentType(form.watch("content_type")) || "Select Category"}
                            </span>
                          </Label>
                        </div>

                        {selectedFile && (
                          <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                  <Paperclip className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="font-black text-slate-900 truncate max-w-[200px] tracking-tight">{selectedFile.name}</p>
                                  <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • READY</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-rose-500 hover:bg-rose-100/50 font-bold" onClick={handleClearFile}>
                                Change File
                              </Button>
                            </div>
                            {previewUrl && (
                              <div className="rounded-2xl overflow-hidden shadow-2xl aspect-video bg-black">
                                <MediaRenderer url={previewUrl} typeHint={form.watch("content_type")} />
                              </div>
                            )}
                          </div>
                        )}
                        {fileError && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-2">{fileError}</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Step 3: Visual Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">03</div>
                <h3 className="text-2xl font-black text-slate-900">Visual Identity</h3>
              </div>

              <Card className="border-0 shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-10">
                  <FormField
                    control={form.control}
                    name="thumbnail_url"
                    render={({ field }) => (
                      <FormItem className="space-y-6">
                        <Label className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Poster Frame / Thumbnail</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="relative group min-h-[200px]">
                            <input
                              id="thumbnail-upload"
                              ref={thumbnailInputRef}
                              type="file"
                              accept={IMAGE_ACCEPT_STRING}
                              onChange={handleThumbnailChange}
                              disabled={isPending}
                              className="hidden"
                            />
                            <Label
                              htmlFor="thumbnail-upload"
                              className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] cursor-pointer hover:bg-orange-50/30 hover:border-orange-200 transition-all text-center"
                            >
                              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-4">
                                <Plus className="h-6 w-6 text-orange-600" />
                              </div>
                              <span className="text-lg font-black text-slate-900 tracking-tight">Select Poster</span>
                              <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">ULTRA-HD RECOMMENDED</span>
                            </Label>
                          </div>

                          {(thumbnailPreview || field.value) && (
                            <div className="relative group rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl aspect-video">
                              <img
                                src={thumbnailPreview ?? field.value}
                                alt="Poster"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                                <p className="text-white text-xs font-black uppercase tracking-widest mb-4">Active Thumbnail</p>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest"
                                  onClick={handleClearThumbnail}
                                >
                                  Remove & Replace
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        {thumbnailError && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2">{thumbnailError}</p>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="speciality_id"
                    render={({ field }) => (
                      <FormItem className="pt-10 border-t border-slate-100">
                        <FormLabel className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Knowledge Classification</FormLabel>
                        <FormControl>
                          <div className="mt-4 p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 flex items-center justify-between group transition-all hover:border-blue-200">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-blue-500" />
                              </div>
                              <span className="text-lg font-bold text-slate-900 italic tracking-tight">{specialityDisplayName}</span>
                            </div>
                            <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Paperclip className="h-4 w-4 text-blue-600" />
                            </div>
                            <input type="hidden" {...field} value={field.value || ""} />
                          </div>
                        </FormControl>
                        <FormDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 pl-1">Inherited from specialized domain settings.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Step 4: Supplemental Knowledge */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">04</div>
                <h3 className="text-2xl font-black text-slate-900">Supplemental Knowledge</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <p className="text-sm text-slate-500 font-medium">Add structured FAQ data to enhance user comprehension.</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-200 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest h-12 px-6 rounded-2xl shadow-sm hover:bg-slate-50 transition-all border-b-4 active:border-b-0 active:translate-y-[2px]"
                    onClick={() => appendFaq({ question: "", answer: "" })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> New FAQ Node
                  </Button>
                </div>

                <div className="space-y-6">
                  {faqFields.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300">
                      <Plus className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-lg font-black tracking-tight">Structured Data Empty</p>
                      <p className="text-xs uppercase tracking-widest mt-1">Add FAQs to improve SEO and user clarity</p>
                    </div>
                  )}
                  {faqFields.map((field, index) => (
                    <Card key={field.id} className="border-0 shadow-2xl shadow-slate-200/60 bg-white rounded-[2rem] overflow-hidden group">
                      <div className="p-4 bg-slate-50 flex items-center justify-between px-8 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Node {index + 1}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          onClick={() => removeFaq(index)}
                          disabled={faqFields.length === 1 && index === 0}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <CardContent className="p-10 space-y-8">
                        <FormField
                          control={form.control}
                          name={`faqs.${index}.question` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">The Question</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="What is the core objective of this study?"
                                  className="h-14 border-slate-100 bg-slate-50/50 focus:bg-white rounded-2xl font-bold px-6"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`faqs.${index}.answer` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">The Resolution</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Detailed explanation goes here..."
                                  className="border-slate-100 bg-slate-50/50 focus:bg-white rounded-2xl font-medium p-6 resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Final Submission */}
            <div className="pt-12 border-t border-slate-200">
              <div className="flex flex-col gap-6">
                <Button
                  type="submit"
                  className="w-full h-24 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] shadow-2xl shadow-slate-900/20 flex items-center justify-between px-10 transition-all active:scale-[0.98] group relative overflow-hidden"
                  disabled={isPending}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col items-start relative z-10 text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Final Authorization</span>
                    <span className="text-2xl font-black tracking-tight">Synchronize Enhancements</span>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl group-hover:translate-x-2 transition-transform relative z-10 border border-white/20">
                    {isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <ArrowLeft className="h-6 w-6 rotate-180" />
                    )}
                  </div>
                </Button>

                <div className="grid grid-cols-2 gap-6">
                  <Link href="/dashboard/admin/knowledge-base" className="block">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-16 text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                      disabled={isPending}
                    >
                      Abort Changes
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-3 px-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    <p className="text-[10px] text-blue-900 font-bold uppercase tracking-tight leading-none">Global System Auto-Sync</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
      {isPending && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center transition-all duration-300">
          <div className="flex flex-col items-center gap-6 p-12 rounded-[3rem] bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-500">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-50 animate-pulse"></div>
              <Loader2 className="h-20 w-20 animate-spin text-blue-600 relative z-10" strokeWidth={1} />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Finalizing Resource</h3>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">Synchronizing Data Assets...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
