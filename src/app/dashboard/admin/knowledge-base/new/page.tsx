"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { useCreateResource } from "@/hooks/use-knowledge-base"
import { useSpecialities } from "@/hooks/use-dropdowns"
import type { ResourceContentType, ResourceStatus } from "@/lib/api/knowledge-base-client"
import { MediaRenderer } from "@/components/renderComponent"
import { uploadDocument } from "@/lib/upload-document"
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
    speciality_id: z.string().min(1, "Speciality is required"),
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

const isValidImageFile = (file: File) => {
  const mime = file.type?.toLowerCase()
  const name = file.name?.toLowerCase() || ""
  const mimeAllowed = mime ? IMAGE_ACCEPT_MIME_TYPES.includes(mime as typeof IMAGE_ACCEPT_MIME_TYPES[number]) : false
  const extensionAllowed = IMAGE_ACCEPT_EXTENSIONS.some((ext) => name.endsWith(ext))
  return mimeAllowed || extensionAllowed
}

export default function CreateResourcePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultSpecialityId = searchParams.get("specialityId") || ""

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null)
  const [thumbnailError, setThumbnailError] = useState<string>("")

  const { mutate: createResource, isPending: isCreating } = useCreateResource()
  const { data: specialitiesResponse } = useSpecialities()
  const specialities = specialitiesResponse || []

  const [uploadMode, setUploadMode] = useState<"file" | "url">("file")
  const [isUploading, setIsUploading] = useState(false)
  const isPending = isUploading || isCreating

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      content_type: "video",
      resource_url: "",
      speciality_id: defaultSpecialityId,
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
    return fromList || "Select Domain"
  }, [specialities, specialityId])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
    }
  }, [previewUrl, thumbnailPreview])

  useEffect(() => {
    if (!form.getValues("speciality_id") && specialities.length > 0) {
      form.setValue("speciality_id", specialities[0].id)
    }
  }, [specialities, form])

  useEffect(() => {
    form.setValue("language_code", "mr")
  }, [form])

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
    if (currentType === "article" && !isValidImageFile(file)) {
      setFileError("Unsupported image format. Please upload PNG, JPG, WEBP, AVIF or SVG.")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setSelectedFile(file)
    setFileError("")
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(file))
  }

  const renderFilePreview = () => {
    if (!selectedFile) return null

    if (previewUrl && selectedFile.type.startsWith("image/")) {
      return (
        <img
          src={previewUrl}
          alt={selectedFile.name}
          className="h-full w-full object-cover"
        />
      )
    }

    if (previewUrl && selectedFile.type.startsWith("video/")) {
      return (
        <video
          src={previewUrl}
          controls
          className="h-full w-full rounded-xl bg-black object-contain"
          controlsList="nodownload"
        />
      )
    }

    if (previewUrl && selectedFile.type === "application/pdf") {
      return (
        <iframe
          src={previewUrl}
          className="h-full w-full rounded-xl bg-white"
          title="PDF preview"
        />
      )
    }

    if (previewUrl) {
      return <MediaRenderer url={previewUrl} />
    }

    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-500">
        Preview will be available after the file loads.
      </div>
    )
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
  }

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

  useEffect(() => {
    if (uploadMode === "url") {
      handleClearFile();
    } else {
      form.setValue("resource_url", "");
      form.clearErrors("resource_url");
    }
  }, [uploadMode])

  const onSubmit = async (data: ResourceFormData) => {
    if (uploadMode === "url" && !data.resource_url?.trim()) {
      form.setError("resource_url", { type: "manual", message: "Please enter a valid URL." })
      return
    }
    if (uploadMode === "file" && !selectedFile) {
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

      let finalResourceUrl = data.resource_url?.trim() || ""
      if (selectedFile && uploadMode === "file") {
        finalResourceUrl = await uploadDocument(selectedFile, { prefix: `knowledge-base/${data.content_type}` })
      }

      let finalThumbnailUrl = data.thumbnail_url?.trim() || ""
      if (thumbnailFile) {
        finalThumbnailUrl = await uploadDocument(thumbnailFile, { prefix: `knowledge-base/thumbnails` })
      }

      const payload = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        content_type: data.content_type,
        resource_url: finalResourceUrl,
        speciality_id: data.speciality_id,
        module_id: data.module_id || undefined,
        language_code: data.language_code?.trim() || undefined,
        status: data.status || "inactive",
        faqs: sanitizedFaqs.length ? sanitizedFaqs : undefined,
        thumbnail_url: finalThumbnailUrl || undefined,
      } as any

      createResource(payload, {
        onSuccess: () => {
          toast.success("Resource created successfully")
          router.push("/dashboard/admin/knowledge-base")
        },
        onError: (err: any) => {
          toast.error("Failed to create resource", { description: err.message })
          setIsUploading(false)
        }
      })
    } catch (err: any) {
      toast.error("Upload failed", { description: err?.message || "Something went wrong" })
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-12">
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] pointer-events-auto">
          <div className="bg-white/80 p-6 rounded-2xl shadow-xl border border-blue-100 flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-base font-bold text-slate-800 animate-pulse tracking-tight">
              {isUploading ? "Uploading Asset..." : "Creating Resource..."}
            </p>
            <p className="text-xs text-slate-500 mt-1">Please wait, do not close this page.</p>
          </div>
        </div>
      )}
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
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Add New Content</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Create New Knowledge Base
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Add helpful information, videos, and articles for your patients to learn from.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            {/* Step 1: Core Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">01</div>
                <h3 className="text-2xl font-black text-slate-900">Basic Details</h3>
              </div>

              <Card className="border-0 shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Healthy Eating Guide"
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
                            placeholder="Explain what this content is about and how it helps patients..."
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
                <h3 className="text-2xl font-black text-slate-900">Content & Files</h3>
              </div>

              <Card className="border-0 shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="content_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Content Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            key={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-slate-50/50 font-bold px-6">
                                <SelectValue placeholder="Choose content type" />
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
                          <FormLabel className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Status</FormLabel>
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
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <Label className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Main Content</Label>
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
                            <FormDescription className="text-xs text-slate-400 font-medium italic">Link to video or document on another website.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                            <span className="text-xl font-black text-slate-900 tracking-tight">Upload File</span>
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
                                  <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
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
                <h3 className="text-2xl font-black text-slate-900">Cover Image</h3>
              </div>

              <Card className="border-0 shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-10">
                  <FormField
                    control={form.control}
                    name="thumbnail_url"
                    render={({ field }) => (
                      <FormItem className="space-y-6">
                        <Label className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Thumbnail Image</Label>
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
                              <span className="text-lg font-black text-slate-900 tracking-tight">Choose Image</span>
                              <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">High quality recommended</span>
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
                                <p className="text-white text-xs font-black uppercase tracking-widest mb-4">Current Image</p>
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
                        <FormLabel className="text-slate-900 font-black text-xs uppercase tracking-widest pl-1">Category</FormLabel>
                        <FormControl>
                          <div className="mt-4 p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 flex items-center justify-between group transition-all hover:border-blue-200">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selected Category</span>
                                <span className="text-lg font-bold text-slate-900 italic tracking-tight">{specialityDisplayName}</span>
                              </div>
                            </div>
                            <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Paperclip className="h-4 w-4 text-blue-600" />
                            </div>
                            <input type="hidden" {...field} value={field.value || ""} />
                          </div>
                        </FormControl>
                        <FormDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 pl-1">Choose the medical specialty this content belongs to.</FormDescription>
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
                <h3 className="text-2xl font-black text-slate-900">FAQ Section</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <p className="text-sm text-slate-500 font-medium">Add common questions and answers to help patients understand better.</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-200 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest h-12 px-6 rounded-2xl shadow-sm hover:bg-slate-50 transition-all border-b-4 active:border-b-0 active:translate-y-[2px]"
                    onClick={() => appendFaq({ question: "", answer: "" })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Question
                  </Button>
                </div>

                <div className="space-y-6">
                  {faqFields.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300">
                      <Plus className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-lg font-black tracking-tight">No Questions Added</p>
                      <p className="text-xs uppercase tracking-widest mt-1">Add FAQs to help patients find answers quickly</p>
                    </div>
                  )}
                  {faqFields.map((field, index) => (
                    <Card key={field.id} className="border-0 shadow-2xl shadow-slate-200/60 bg-white rounded-[2rem] overflow-hidden group">
                      <div className="p-4 bg-slate-50 flex items-center justify-between px-8 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Question {index + 1}</span>
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
                              <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Question</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="What symptoms should patients watch for?"
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
                              <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Answer</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Provide a clear and helpful answer..."
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
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Final Step</span>
                    <span className="text-2xl font-black tracking-tight">Create Knowledge Base</span>
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
                      Cancel
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-3 px-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    <p className="text-[10px] text-blue-900 font-bold uppercase tracking-tight leading-none">Auto-saves your progress</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
