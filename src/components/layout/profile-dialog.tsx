"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Cropper, { Point, Area } from "react-easy-crop"
import { Camera, Loader2, Save, Trash2, X } from "lucide-react"
import { useForm, Controller } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useStaffProfile, useUpdateStaffProfile, useUploadProfilePhoto } from "@/hooks/use-staff-profile"
import { UpdateStaffProfileDto } from "@/lib/api/staff-profile-client"

// Utility to extract image crop
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await createImage(imageSrc)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        return null
      }

      const maxSize = Math.max(image.width, image.height)
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

      canvas.width = safeArea
      canvas.height = safeArea

      ctx.translate(safeArea / 2, safeArea / 2)
      ctx.translate(-safeArea / 2, -safeArea / 2)

      ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
      )
      const data = ctx.getImageData(0, 0, safeArea, safeArea)

      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height

      ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
      )

      canvas.toBlob((file) => {
        resolve(file)
      }, "image/jpeg")
    } catch (e) {
      reject(e)
    }
  })
}

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useStaffProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateStaffProfile()
  const { mutateAsync: uploadPhoto, isPending: isUploading } = useUploadProfilePhoto()

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, control, setValue, watch } = useForm<UpdateStaffProfileDto>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      specialization: "",
      qualification: "",
      experience_years: 0,
      bio: "",
      languages: [],
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
  })

  useEffect(() => {
    if (open) {
      // Initialize with Auth user info as fallback, overwrite with Profile info if available
      const defaultEmail = user?.email || ""
      const defaultPhone = user?.phone || ""
      const authAvatar = user?.profile_photo_url || null
      
      let initialData: UpdateStaffProfileDto = {
        first_name: "",
        last_name: "",
        email: defaultEmail,
        phone: defaultPhone,
        specialization: "",
        qualification: "",
        experience_years: 0,
        bio: "",
        languages: [],
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      }

      // If user has 'name' or 'full_name' in any shape (though not strictly in interface)
      const uAny = user as any
      if (uAny?.name || uAny?.full_name) {
        const parts = (uAny?.name || uAny?.full_name).split(" ")
        initialData.first_name = parts[0]
        initialData.last_name = parts.slice(1).join(" ")
      }

      if (profile) {
        initialData = {
          ...initialData,
          first_name: profile.first_name || initialData.first_name,
          last_name: profile.last_name || initialData.last_name,
          email: profile.email || initialData.email,
          phone: profile.phone || initialData.phone,
          specialization: profile.specialization || "",
          qualification: profile.qualification || "",
          experience_years: profile.experience_years || 0,
          bio: profile.bio || "",
          languages: profile.languages || [],
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          country: profile.country || "",
          pincode: profile.pincode || "",
        }
        setAvatarUrl(profile.profile_photo_url || authAvatar)
      } else {
        setAvatarUrl(authAvatar)
      }

      reset(initialData)
    }
  }, [open, profile, user, reset])

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const imageDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      setImageSrc(imageDataUrl)
      setShowCropper(true)
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (!croppedImageBlob) return

      const file = new File([croppedImageBlob], "profile_photo.jpg", { type: "image/jpeg" })
      const uploadedUrl = await uploadPhoto(file)
      
      setAvatarUrl(uploadedUrl)
      setShowCropper(false)
      setImageSrc(null)
      toast.success("Profile photo uploaded successfully")
    } catch (e) {
      console.error(e)
      toast.error("Failed to crop/upload image")
    }
  }

  const cancelCrop = () => {
    setShowCropper(false)
    setImageSrc(null)
  }

  const handleDeletePhoto = () => {
    setAvatarUrl(null)
    toast.success("Profile photo removed. Save to apply.")
  }

  const onSubmit = (data: UpdateStaffProfileDto) => {
    const payload = {
      ...data,
      profile_photo_url: avatarUrl,
      experience_years: Number(data.experience_years),
      languages: typeof data.languages === "string" 
        ? (data.languages as string).split(",").map(s => s.trim()).filter(Boolean) 
        : data.languages
    }

    updateProfile(payload, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Update your personal and professional profile information.
            </DialogDescription>
          </DialogHeader>

          {profileLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-xl capitalize bg-primary/10 text-primary">
                        {user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                </div>
                
                <div className="flex flex-col items-center sm:items-start flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <h3 className="text-sm font-semibold">Profile Photo</h3>
                    <p className="text-xs text-muted-foreground">Recommend 1:1 square image, max 2MB.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    {avatarUrl && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleDeletePhoto} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Info fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input {...register("first_name")} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input {...register("last_name")} placeholder="Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...register("email")} type="email" disabled className="bg-muted/50" />
                  <p className="text-[10px] text-muted-foreground">Email is managed by administrator</p>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...register("phone")} placeholder="+91..." />
                </div>
              </div>

              <div className="h-px bg-border my-4" />

              {/* Professional Info */}
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Professional details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input {...register("specialization")} placeholder="e.g. Cardiology" />
                </div>
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input {...register("qualification")} placeholder="e.g. MBBS, MD" />
                </div>
                <div className="space-y-2">
                  <Label>Experience (Years)</Label>
                  <Input {...register("experience_years")} type="number" min="0" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label>Languages (Comma separated)</Label>
                  <Input {...register("languages")} placeholder="English, Hindi" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Bio / Summary</Label>
                  <Textarea {...register("bio")} placeholder="Brief professional background" rows={3} />
                </div>
              </div>

              <div className="h-px bg-border my-4" />

              {/* Location Info */}
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input {...register("address")} placeholder="123 Main St" />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input {...register("city")} placeholder="Mumbai" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input {...register("state")} placeholder="Maharashtra" />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input {...register("country")} placeholder="India" />
                </div>
                <div className="space-y-2">
                  <Label>Pincode / Zip</Label>
                  <Input {...register("pincode")} placeholder="400001" />
                </div>
              </div>
            </form>
          )}

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button form="profile-form" type="submit" disabled={isUpdating || isUploading}>
              {(isUpdating || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cropper Modal */}
      {showCropper && imageSrc && (
        <Dialog open={showCropper} onOpenChange={(v) => !v && cancelCrop()}>
          <DialogContent className="max-w-lg p-0 border-none bg-black">
            <div className="relative w-full h-[60vh] bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-4 bg-background">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-2/3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelCrop}>Cancel</Button>
                <Button onClick={handleSaveCrop} disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crop & Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
