"use client"

import { useState } from "react"
import { Upload, X, File, Video, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface EnhancedFileUploadProps {
  label: string
  accept: string
  value?: string
  onChange: (file: File | null, preview?: string) => void
  preview?: boolean
  className?: string
}

export function EnhancedFileUpload({
  label,
  accept,
  value,
  onChange,
  preview = false,
  className,
}: EnhancedFileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value)
  const [fileName, setFileName] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [fileType, setFileType] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setFileType(file.type)
      
      setIsUploading(true)
      setUploadProgress(0)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setIsUploading(false)
            return 100
          }
          return prev + 10
        })
      }, 200)

      if (preview && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const url = reader.result as string
          setPreviewUrl(url)
          onChange(file, url)
        }
        reader.readAsDataURL(file)
      } else {
        onChange(file)
      }
    }
  }

  const handleRemove = () => {
    setPreviewUrl(undefined)
    setFileName("")
    setUploadProgress(0)
    setFileType("")
    onChange(null)
  }

  const isVideo = fileType.startsWith("video/")
  const isImage = fileType.startsWith("image/")

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      
      {previewUrl && preview ? (
        <div className="relative inline-block">
          {isImage && (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-48 w-full object-cover rounded-lg border"
            />
          )}
          {isVideo && (
            <div className="relative h-48 w-full bg-black rounded-lg border overflow-hidden">
              <video
                src={previewUrl}
                controls
                className="h-full w-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <Video className="h-3 w-3" />
                Video Preview
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : fileName ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted">
            <File className="h-4 w-4" />
            <span className="text-sm flex-1 truncate">{fileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isUploading && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept.includes("video") && "Video files supported"}
              {accept.includes("image") && "Image files supported"}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  )
}
