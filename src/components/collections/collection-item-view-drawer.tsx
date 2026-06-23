"use client"

import * as React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { MediaRenderer } from "@/components/renderComponent"
import type { CollectionItem } from "@/types/collection-api"
import { Video, FileText, Image, Headphones, Link as LinkIcon, Clock, Tag, ExternalLink, Copy } from "lucide-react"

interface CollectionItemViewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CollectionItem | null
}

export function CollectionItemViewDrawer({
  open,
  onOpenChange,
  item,
}: CollectionItemViewDrawerProps) {
  if (!item) return null

  const [copied, setCopied] = React.useState(false)

  const MediaIcon = {
    video: Video,
    pdf: FileText,
    image: Image,
    audio: Headphones,
    link: LinkIcon,
  }[item.media_type] || Video

  const resourceHost = React.useMemo(() => {
    if (!item.media_url) return ""
    try {
      return new URL(item.media_url).hostname.replace(/^www\./, "")
    } catch (error) {
      return item.media_url
    }
  }, [item.media_url])

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleCopyLink = React.useCallback(() => {
    if (!item.media_url) return
    navigator.clipboard?.writeText(item.media_url)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
  }, [item.media_url])

  React.useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-full sm:w-[600px] ml-auto">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <MediaIcon className="h-5 w-5" />
            {item.title}
          </DrawerTitle>
          <DrawerDescription>Collection item details and preview</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
          {/* Media Preview */}
          {item.media_url ? (
            <div className="space-y-2">
              <Label>Media Preview</Label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-inner">
                <MediaRenderer url={item.media_url} typeHint={item.media_type} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Media Preview</Label>
              <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center text-sm text-slate-500">
                <MediaIcon className="mb-2 h-8 w-8 text-slate-400" />
                No media attached to this item
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-500">Title</Label>
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
            </div>

            {item.description && (
              <div className="space-y-2">
                <Label className="text-slate-500">Description</Label>
                <p className="text-sm text-slate-700">{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-500">Media Type</Label>
                <Badge variant="outline" className="capitalize">
                  {item.media_type}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">Media Source</Label>
                <Badge variant="outline" className="capitalize">
                  {item.media_source}
                </Badge>
              </div>
            </div>

            {item.media_url && (
              <div className="space-y-2">
                <Label className="text-slate-500">Resource</Label>
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <MediaIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate">{resourceHost}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" /> Open Resource
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCopyLink} className="text-slate-600">
                      <Copy className="mr-2 h-4 w-4" /> {copied ? "Copied" : "Copy Link"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {item.thumbnail_url && (
              <div className="space-y-2">
                <Label className="text-slate-500">Thumbnail</Label>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="h-40 w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duration
                </Label>
                <p className="text-sm text-slate-900">{formatDuration(item.duration_seconds)}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">File Size</Label>
                <p className="text-sm text-slate-900">{formatFileSize(item.file_size_bytes)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-500">Display Order</Label>
                <p className="text-sm text-slate-900">#{item.display_order}</p>
              </div>

              {item.unlock_day !== null && (
                <div className="space-y-2">
                  <Label className="text-slate-500">Unlock Day</Label>
                  <p className="text-sm text-slate-900">Day {item.unlock_day}</p>
                </div>
              )}
            </div>

            {item.step_label && (
              <div className="space-y-2">
                <Label className="text-slate-500">Step Label</Label>
                <Badge variant="secondary">{item.step_label}</Badge>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-slate-500 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-500">Notification Time</Label>
              <p className="text-sm text-slate-900">{item.notification_time || "N/A"}</p>
            </div>

            {item.auto_complete_after_seconds !== null && (
              <div className="space-y-2">
                <Label className="text-slate-500">Auto Complete After</Label>
                <p className="text-sm text-slate-900">{item.auto_complete_after_seconds}s</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-500">Status</Label>
              {item.is_active ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
              ) : (
                <Badge className="bg-slate-50 text-slate-700 border-slate-200">Inactive</Badge>
              )}
            </div>

            {item.uploaded_by_role && (
              <div className="space-y-2">
                <Label className="text-slate-500">Uploaded By Role</Label>
                <p className="text-sm text-slate-900 capitalize">{item.uploaded_by_role}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-slate-500">Created At</Label>
                <p className="text-xs text-slate-600">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500">Updated At</Label>
                <p className="text-xs text-slate-600">
                  {new Date(item.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
