"use client"

import { useState } from "react"
import { Upload, X, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  label: string
  accept: string
  value?: string
  onChange: (file: File | null, preview?: string) => void
  preview?: boolean
  className?: string
  maxSize?: number // in MB
  onUpload?: (url: string) => void
}

export function FileUpload({
  label,
  accept,
  value,
  onChange,
  preview = false,
  className,
  maxSize,
  onUpload,
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value)
  const [fileName, setFileName] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)

      if (maxSize && file.size > maxSize * 1024 * 1024) {
        alert(`File size exceeds the ${maxSize}MB limit.`)
        e.target.value = ""
        return
      }

      if (preview && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const url = reader.result as string
          setPreviewUrl(url)
          onChange(file, url)
          onUpload?.(url)
        }
        reader.readAsDataURL(file)
      } else {
        onChange(file)
        const tempUrl = URL.createObjectURL(file)
        onUpload?.(tempUrl)
      }
    }
  }

  const handleRemove = () => {
    setPreviewUrl(undefined)
    setFileName("")
    onChange(null)
    onUpload?.("")
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      
      {previewUrl && preview ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border"
          />
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
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
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
