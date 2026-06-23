"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2, Download, Image as ImageIcon, Video } from "lucide-react"

export default function MediaViewerPage() {
  const searchParams = useSearchParams()
  const mediaUrl = searchParams?.get("url") || ""
  const mediaType = searchParams?.get("type") || "image"
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = mediaUrl
    link.download = `media-${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)]">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/dashboard/admin/community/posts">
            <Button variant="ghost" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-[var(--foreground)]"></div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-medium">
              Admin Portal / Community / Media Viewer
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
                Media Viewer
              </h1>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                {mediaType === "image" ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                <span className="capitalize">{mediaType}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mediaType === "image" && (
                <>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-[var(--foreground)] min-w-[60px] text-center">
                    {zoom}%
                  </span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleFullscreen}>
                <Maximize2 className="h-4 w-4 mr-2" />
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Media Display */}
        <Card className="border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="relative min-h-[600px] flex items-center justify-center bg-[var(--foreground)]">
              {mediaType === "image" ? (
                <div className="overflow-auto max-h-[80vh] w-full flex items-center justify-center p-4">
                  <img
                    src={mediaUrl}
                    alt="Media preview"
                    style={{ transform: `scale(${zoom / 100})` }}
                    className="transition-transform duration-200 max-w-full h-auto"
                  />
                </div>
              ) : mediaType === "video" ? (
                <video
                  src={mediaUrl}
                  controls
                  className="max-w-full max-h-[80vh]"
                  autoPlay
                />
              ) : (
                <div className="text-white text-center p-8">
                  <p className="text-lg">Unsupported media type</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Media Metadata */}
        <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Media Information</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Type:</span>
                <span className="font-medium text-[var(--foreground)] capitalize">{mediaType}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">URL:</span>
                <span className="font-mono text-xs text-[var(--foreground)] truncate max-w-md">
                  {mediaUrl}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Current Zoom:</span>
                <span className="font-medium text-[var(--foreground)]">{zoom}%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[var(--muted-foreground)]">Fullscreen:</span>
                <span className="font-medium text-[var(--foreground)]">
                  {isFullscreen ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
