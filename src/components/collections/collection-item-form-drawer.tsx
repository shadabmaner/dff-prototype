"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCreateCollectionItem, useUpdateCollectionItem } from "@/hooks/use-collections"
import type { CollectionItem } from "@/types/collection-api"

const itemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  media_type: z.enum(["video", "pdf", "image", "audio", "link"]).optional(),
  media_url: z.string().min(1, "Media URL is required"),
  media_source: z.enum(["external", "s3"]).optional(),
  thumbnail_url: z.string().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  display_order: z.number().optional(),
  step_label: z.string().nullable().optional(),
  tags: z.string().optional(),
  notification_time: z.string().optional(),
  auto_complete_after_seconds: z.number().nullable().optional(),
  uploaded_by_role: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

type ItemFormData = z.infer<typeof itemSchema>

interface CollectionItemFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  item?: CollectionItem | null
}

export function CollectionItemFormDrawer({
  open,
  onOpenChange,
  collectionId,
  item,
}: CollectionItemFormDrawerProps) {
  const createMutation = useCreateCollectionItem()
  const updateMutation = useUpdateCollectionItem()
  const isEditing = Boolean(item)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ItemFormData>({
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
      auto_complete_after_seconds: null,
      uploaded_by_role: "",
      is_active: true,
    },
  })

  React.useEffect(() => {
    if (item) {
      reset({
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
        auto_complete_after_seconds: item.auto_complete_after_seconds,
        uploaded_by_role: item.uploaded_by_role,
        is_active: item.is_active,
      })
      setSelectedFile(null)
      setFileError("")
    } else {
      reset({
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
        auto_complete_after_seconds: null,
        uploaded_by_role: "",
        is_active: true,
      })
      setSelectedFile(null)
      setFileError("")
    }
  }, [item, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileError("")
    }
  }

  const onSubmit = async (data: ItemFormData) => {
    const tagsArray = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : []
    
    const payload = {
      ...data,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    }

    if (isEditing && item) {
      await updateMutation.mutateAsync({
        itemId: item.id,
        payload,
      })
    } else {
      await createMutation.mutateAsync({
        collectionId,
        payload,
      })
    }
    onOpenChange(false)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEditing ? "Edit Item" : "Add Item"}</DrawerTitle>
          <DrawerDescription>
            {isEditing ? "Update collection item details" : "Add a new item to this collection"}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Day 1 — Diaphragmatic Breathing"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Learn proper breathing technique"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="media_type">Media Type</Label>
                <Select
                  value={watch("media_type")}
                  onValueChange={(value) => setValue("media_type", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="media_source">Media Source</Label>
                <Select
                  value={watch("media_source")}
                  onValueChange={(value) => {
                    setValue("media_source", value as any)
                    setSelectedFile(null)
                    setFileError("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">External URL</SelectItem>
                    <SelectItem value="s3">Upload to S3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {watch("media_source") === "external" ? (
              <div className="space-y-2">
                <Label htmlFor="media_url">Media URL *</Label>
                <Input
                  id="media_url"
                  {...register("media_url")}
                  placeholder="https://youtu.be/xxxxx or https://example.com/video.mp4"
                />
                {errors.media_url && (
                  <p className="text-sm text-red-500">{errors.media_url.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="file">Upload File {isEditing ? "(optional)" : "*"}</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept={watch("media_type") === "video" ? "video/*" : watch("media_type") === "audio" ? "audio/*" : watch("media_type") === "image" ? "image/*" : watch("media_type") === "pdf" ? ".pdf" : "*/*"}
                />
                {selectedFile && (
                  <p className="text-xs text-slate-500">Selected: {selectedFile.name}</p>
                )}
                {fileError && <p className="text-xs text-red-600">{fileError}</p>}
                {isEditing && watch("media_url") && (
                  <p className="text-xs text-slate-500">Current: {watch("media_url")}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                {...register("thumbnail_url")}
                placeholder="https://cdn.drapp.com/thumbs/day1.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  {...register("duration_seconds", { 
                    setValueAs: (v) => v === "" ? null : parseInt(v) 
                  })}
                  placeholder="480"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  {...register("display_order", { valueAsNumber: true })}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="step_label">Step Label</Label>
              <Input
                id="step_label"
                {...register("step_label")}
                placeholder="Week 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                {...register("tags")}
                placeholder="yoga, breathing, posture"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_time">Notification Time</Label>
              <Input
                id="notification_time"
                type="time"
                {...register("notification_time")}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DrawerFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
