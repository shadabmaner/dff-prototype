
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, Trash2, Video, Paperclip, X, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useUpdateCollectionItem, useCollectionById } from "@/hooks/use-collections"
import { MediaRenderer } from "@/components/renderComponent"
import { uploadSpecialityAsset } from "@/lib/upload-asset"

const itemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  media_type: z.enum(["video", "pdf", "image", "audio", "link"]).optional(),
  media_url: z.string().optional(),
  media_source: z.enum(["external", "s3"]).optional(),
  thumbnail_url: z.string().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  display_order: z.number().optional(),
  step_label: z.string().nullable().optional(),
  tags: z.string().optional(),
  notification_time: z.string().optional(),
}).refine(
  (data) => {
    if (data.media_source === "external") {
      return data.media_url && data.media_url.trim().length > 0
    }
    return true
  },
  {
    message: "Media URL is required for external sources",
    path: ["media_url"],
  }
)

type ItemFormData = z.infer<typeof itemSchema>

export default function EditCollectionItemPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string
  const itemId = params.itemId as string

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState<string>("")
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null)
  const [showExistingMedia, setShowExistingMedia] = React.useState(true)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadMode, setUploadMode] = React.useState<"file" | "url">("file")
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const thumbnailInputRef = React.useRef<HTMLInputElement | null>(null)

  const { data: collectionData, isLoading: isLoadingCollection } = useCollectionById(collectionId)
  const updateMutation = useUpdateCollectionItem()

  const validateS3Upload = () => {
    if (form.watch("media_source") === "s3" && !selectedFile && !showExistingMedia) {
      setFileError("Please select a file to upload or keep existing media")
      return false
    }
    setFileError("")
    return true
  }

  const collection = collectionData?.data
  const item = collection?.items?.find((i) => i.id === itemId)

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      description: "",
      media_type: "video",
      media_url: "",
      media_source: "external",
      thumbnail_url: "",
      duration_seconds: null,
      display_order: 1,
      step_label: "",
      tags: "",
      notification_time: "07:00",
    },
  })

  const thumbnailUrlValue = form.watch("thumbnail_url")

  const getVideoEmbedMeta = (url: string) => {
    // Check if it's a blob URL or S3 URL - these should use direct video player
    if (url.startsWith("blob:") || url.includes("amazonaws.com") || url.includes("s3.")) {
      return { embed: false, src: url }
    }

    try {
      const parsed = new URL(url)
      const host = parsed.hostname
      if (host.includes("youtube.com")) {
        const id = parsed.searchParams.get("v")
        if (id) {
          return { embed: true, src: `https://www.youtube.com/embed/${id}` }
        }
      }
      if (host.includes("youtu.be")) {
        const id = parsed.pathname.split("/").filter(Boolean).pop()
        if (id) {
          return { embed: true, src: `https://www.youtube.com/embed/${id}` }
        }
      }
      if (host.includes("vimeo.com")) {
        const id = parsed.pathname.split("/").filter(Boolean).pop()
        if (id) {
          return { embed: true, src: `https://player.vimeo.com/video/${id}` }
        }
      }
    } catch (error) {
      // Non URL or blob, fall back to direct video tag
    }
    return { embed: false, src: url }
  }

  const renderPreviewContent = (src: string, type?: string | null, label?: string) => {
    const normalizedType = type?.toLowerCase()
    if (normalizedType === "video") {
      const { embed, src: processedSrc } = getVideoEmbedMeta(src)
      if (embed) {
        return (
          <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/40">
            <iframe
              src={processedSrc}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="pointer-events-none absolute bottom-2 left-3 text-xs font-medium uppercase tracking-wide text-white/80">
              Preview
            </span>
          </div>
        )
      }

      return (
        <div className="rounded-2xl border border-slate-200">
          <video
            src={processedSrc}
            className="h-48 w-full rounded-2xl object-cover"
            controls
            playsInline
          />
        </div>
      )
    }

    if (normalizedType === "image") {
      return (
        <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-slate-200">
          <img
            src={src}
            alt={label || "Preview"}
            className="h-full w-full object-cover"
          />
        </div>
      )
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-muted/30 p-4 text-sm">
        <p className="font-medium">{label || "Preview not available"}</p>
        <p className="text-xs text-muted-foreground">Preview not available for this file type.</p>
      </div>
    )
  }

  React.useEffect(() => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description,
        media_type: item.media_type,
        media_url: item.media_url,
        media_source: item.media_source,
        thumbnail_url: item.thumbnail_url,
        duration_seconds: item.duration_seconds,
        display_order: item.display_order,
        step_label: item.step_label,
        tags: item.tags?.join(", ") || "",
        notification_time: item.notification_time,
      })
      setShowExistingMedia(!!item.media_url)
      setSelectedFile(null)
      setFileError("")
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
      setThumbnailPreview(null)
      setThumbnailFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
    }
  }, [previewUrl, thumbnailPreview])

  React.useEffect(() => {
    if (uploadMode === "url") {
      clearUploadedMedia()
      form.setValue("media_source", "external")
    } else {
      form.setValue("media_url", "")
      form.setValue("media_source", "s3")
      form.clearErrors("media_url")
    }
  }, [uploadMode])

  const applySelectedFile = (file: File) => {
    setSelectedFile(file)
    setFileError("")
    setShowExistingMedia(false)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(newPreviewUrl)
    form.setValue("media_url", "")
  }

  const handleExternalUpload = (file?: File) => {
    if (!file) return
    form.setValue("media_source", "s3")
    form.setValue("media_url", "")
    applySelectedFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      applySelectedFile(file)
    }
  }

  const clearUploadedMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setSelectedFile(null)
    setShowExistingMedia(!!item?.media_url)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (item?.media_url) {
      form.setValue("media_url", item.media_url)
    }
  }

  const handleClearThumbnail = () => {
    setThumbnailFile(null)
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailPreview(null)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
  }

  const renderFilePreview = () => {
    if (!previewUrl) return null

    const mediaType = form.watch("media_type")
    
    if (mediaType === "video") {
      return (
        <video
          src={previewUrl}
          controls
          className="h-full w-full rounded-xl bg-black object-contain"
        />
      )
    }

    if (mediaType === "image") {
      return (
        <img
          src={previewUrl}
          alt="Preview"
          className="h-full w-full object-cover"
        />
      )
    }

    if (mediaType === "pdf") {
      return (
        <iframe
          src={previewUrl}
          className="h-full w-full rounded-xl bg-white"
          title="PDF preview"
        />
      )
    }

    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-500">
        Preview available after upload
      </div>
    )
  }

  const getAcceptType = (mediaType: string) => {
    switch (mediaType) {
      case "video": return "video/*"
      case "audio": return "audio/*"
      case "image": return "image/*"
      case "pdf": return "application/pdf"
      default: return "*/*"
    }
  }

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    const objectUrl = URL.createObjectURL(file)
    setThumbnailFile(file)
    setThumbnailPreview(objectUrl)
    form.setValue("thumbnail_url", "")
  }

  const onSubmit = async (data: ItemFormData) => {
    if (!validateS3Upload()) {
      return
    }

    try {
      setIsUploading(true)
      setFileError("")
      const tagsArray = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : []

      let mediaUrl = data.media_url || ""
      let thumbnailUrl = data.thumbnail_url || ""

      if (data.media_source === "s3" && selectedFile) {
        mediaUrl = await uploadSpecialityAsset(selectedFile, "cover", {
          prefix: "exercise-content",
        })
      } else if (data.media_source === "s3" && showExistingMedia && item?.media_url) {
        mediaUrl = item.media_url
      }

      if (thumbnailFile) {
        thumbnailUrl = await uploadSpecialityAsset(thumbnailFile, "icon", {
          prefix: "exercise-content/thumbnails",
        })
      }

      if (!mediaUrl) {
        setFileError("Media URL is required")
        setIsUploading(false)
        return
      }

      const payload = {
        ...data,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl || data.thumbnail_url,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      }

      await updateMutation.mutateAsync({
        itemId,
        payload,
      })

      router.push(`/dashboard/admin/exercise-content/${collectionId}`)
    } catch (error: any) {
      setFileError(error?.message || "Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const isLoading = updateMutation.isPending || isUploading

  if (isLoadingCollection) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-slate-500 mb-4">Item not found</p>
        <Link href={`/dashboard/admin/exercise-content/${collectionId}`}>
          <Button>Back to Collection</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <Link href={`/dashboard/admin/exercise-content/${collectionId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collection
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-slate-900"></div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
              Admin Portal / Exercise Content / Edit Item
            </p>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Edit Collection Item
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Update collection item details
            </p>
          </div>
        </div>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Day 1 — Diaphragmatic Breathing" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Learn proper breathing technique"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="media_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select media type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Label className="text-slate-900 font-medium text-sm">Media Content</Label>
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
                </div>

                {uploadMode === "url" ? (
                  <FormField
                    control={form.control}
                    name="media_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media URL *</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Input
                              placeholder="https://youtu.be/xxxxx or https://example.com/video.mp4"
                              {...field}
                            />
                            {field.value?.trim() && (
                              <div className="space-y-2">
                                <Label className="text-xs text-slate-500">Live preview</Label>
                                <div className="relative max-w-md">
                                  {renderPreviewContent(field.value.trim(), form.watch("media_type"), field.value.trim())}
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-7 w-7"
                                    onClick={() => {
                                      field.onChange("")
                                      setShowExistingMedia(Boolean(item.media_url))
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-4">
                    {showExistingMedia && item.media_url && (
                      <div className="space-y-2">
                        <Label>Current media</Label>
                        <div className="relative max-w-xs">
                          {renderPreviewContent(item.media_url, item.media_type, item.media_url)}
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-7 w-7"
                            onClick={() => setShowExistingMedia(false)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Label className="text-sm font-semibold">Upload New File {item.media_url ? "(optional)" : "*"}</Label>
                          <p className="text-xs text-slate-500">Accepted: {
                          //@ts-ignore
                          getAcceptType(form.watch("media_type") as string )}</p>
                        </div>
                        {selectedFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500"
                            onClick={clearUploadedMedia}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <input
                        id="media-file-upload-edit"
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept={
                          //@ts-ignore
                          getAcceptType(form.watch("media_type"))}
                        className="sr-only"
                      />
                      <label htmlFor="media-file-upload-edit" className="block">
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/70 p-6 text-center transition hover:border-slate-400 cursor-pointer">
                          {!selectedFile ? (
                            <div className="flex flex-col items-center gap-3 text-slate-600">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                <Paperclip className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-base font-semibold text-slate-800">Drag & drop or click to upload</p>
                                <p className="text-xs text-slate-500 mt-1">Upload new file to replace existing media</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                      <Paperclip className="h-4 w-4" />
                                    </div>
                                    <div className="text-sm">
                                      <p className="font-medium text-slate-900 line-clamp-1">{selectedFile.name}</p>
                                      <p className="text-slate-500 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                  </div>
                                </div>
                                <label
                                  htmlFor="media-file-upload-edit"
                                  className="inline-flex cursor-pointer items-center rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400"
                                >
                                  Change File
                                </label>
                                <button
                                  type="button"
                                  onClick={clearUploadedMedia}
                                  className="text-sm font-medium text-red-500 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                              {selectedFile && (
                                <div className="relative rounded-2xl border border-slate-200 bg-white/80 p-3">
                                  <button
                                    type="button"
                                    onClick={clearUploadedMedia}
                                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow hover:text-red-500"
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove preview</span>
                                  </button>
                                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                                    {renderFilePreview()}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </label>
                      {!selectedFile && item.media_url && (
                        <p className="text-xs text-slate-500 text-center">
                          Leave empty to keep the existing file
                        </p>
                      )}
                      {fileError && <p className="text-sm text-red-500">{fileError}</p>}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Thumbnail (Optional)</Label>
                      <p className="text-xs text-slate-500">Upload image or provide URL</p>
                    </div>
                    {thumbnailFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500"
                        onClick={handleClearThumbnail}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="thumbnail_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="https://cdn.drapp.com/thumbs/day1.jpg"
                            {...field}
                            value={field.value || ""}
                            disabled={Boolean(thumbnailFile)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <input
                    id="thumbnail-upload-edit"
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="sr-only"
                  />
                  <label htmlFor="thumbnail-upload-edit" className="block">
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/70 p-6 text-center transition hover:border-slate-400 cursor-pointer">
                      {!thumbnailFile ? (
                        <div className="flex flex-col items-center gap-3 text-slate-600">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                            <Paperclip className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-slate-800">Drag & drop or click to upload</p>
                            <p className="text-xs text-slate-500 mt-1">We support image files (JPG, PNG, WebP) up to 10 MB.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                  <Paperclip className="h-4 w-4" />
                                </div>
                                <div className="text-sm">
                                  <p className="font-medium text-slate-900 line-clamp-1">{thumbnailFile.name}</p>
                                  <p className="text-slate-500 text-xs">{(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                            </div>
                            <label
                              htmlFor="thumbnail-upload-edit"
                              className="inline-flex cursor-pointer items-center rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400"
                            >
                              Change File
                            </label>
                            <button
                              type="button"
                              onClick={handleClearThumbnail}
                              className="text-sm font-medium text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                          {thumbnailFile && thumbnailPreview && (
                            <div className="relative rounded-2xl border border-slate-200 bg-white/80 p-3">
                              <button
                                type="button"
                                onClick={handleClearThumbnail}
                                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove preview</span>
                              </button>
                              <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                                <img
                                  src={thumbnailPreview}
                                  alt="Thumbnail preview"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                  {!thumbnailFile && (
                    <p className="text-xs text-slate-500 text-center">
                      Upload a thumbnail image or provide URL for this collection item.
                    </p>
                  )}
                  {!thumbnailFile && thumbnailUrlValue && (
                    <div className="relative mt-3 rounded-2xl border border-slate-200 bg-white/80 p-3">
                      <button
                        type="button"
                        onClick={() => form.setValue("thumbnail_url", "")}
                        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove thumbnail</span>
                      </button>
                      <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                        <img src={thumbnailUrlValue} alt="Thumbnail preview" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

               

                <FormField
                  control={form.control}
                  name="step_label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Week 1" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="yoga, breathing, posture" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notification_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link href={`/dashboard/admin/exercise-content/${collectionId}`}>
                    <Button type="button" variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Item
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
