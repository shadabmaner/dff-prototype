"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cropper, { Point, Area } from "react-easy-crop";
import {
  Camera,
  Loader2,
  Save,
  Trash2,
  ArrowLeft,
  User,
  Briefcase,
  MapPin,
  Shield,
  Mail,
  Phone,
  Award,
  Languages,
  FileText,
  Building2,
  Hash,
  Globe,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  useStaffProfile,
  useUpdateStaffProfile,
  useUploadProfilePhoto,
} from "@/hooks/use-staff-profile";
import { UpdateStaffProfileDto } from "@/lib/api/staff-profile-client";

/* ── crop helper ─────────────────────────────────────────────────── */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      const maxSize = Math.max(image.width, image.height);
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

      canvas.width = safeArea;
      canvas.height = safeArea;
      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.translate(-safeArea / 2, -safeArea / 2);
      ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
      );
      const data = ctx.getImageData(0, 0, safeArea, safeArea);

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
      );

      canvas.toBlob((file) => resolve(file), "image/jpeg");
    } catch (e) {
      reject(e);
    }
  });
}

/* ── helpers ──────────────────────────────────────────────────────── */
function getInitials(source?: string) {
  if (!source) return "US";
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/* ── page ─────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useStaffProfile();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateStaffProfile();
  const { mutateAsync: uploadPhoto, isPending: isUploading } =
    useUploadProfilePhoto();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch } =
    useForm<UpdateStaffProfileDto>({
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
    });

  const watchedFirstName = watch("first_name");
  const watchedLastName = watch("last_name");

  useEffect(() => {
    const defaultEmail = user?.email || "";
    const defaultPhone = user?.phone || "";
    const authAvatar = user?.profile_photo_url || null;

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
    };

    const uAny = user as any;
    if (uAny?.name || uAny?.full_name) {
      const parts = (uAny?.name || uAny?.full_name).split(" ");
      initialData.first_name = parts[0];
      initialData.last_name = parts.slice(1).join(" ");
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
      };
      setAvatarUrl(profile.profile_photo_url || authAvatar);
    } else {
      setAvatarUrl(authAvatar);
    }

    reset(initialData);
  }, [profile, user, reset]);

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setImageSrc(imageDataUrl);
      setShowCropper(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) return;
      const file = new File([croppedImageBlob], "profile_photo.jpg", {
        type: "image/jpeg",
      });
      const uploadedUrl = await uploadPhoto(file);
      setAvatarUrl(uploadedUrl);
      setShowCropper(false);
      setImageSrc(null);
      toast.success("Profile photo uploaded successfully");
    } catch {
      toast.error("Failed to crop/upload image");
    }
  };

  const cancelCrop = () => {
    setShowCropper(false);
    setImageSrc(null);
  };

  const handleDeletePhoto = () => {
    setAvatarUrl(null);
    toast.success("Profile photo removed. Save to apply.");
  };

  const onSubmit = (data: UpdateStaffProfileDto) => {
    const payload = {
      ...data,
      profile_photo_url: avatarUrl,
      experience_years: Number(data.experience_years),
      languages:
        typeof data.languages === "string"
          ? (data.languages as string)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : data.languages,
    };

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated");
      },
    });
  };

  const displayName =
    watchedFirstName || watchedLastName
      ? `${watchedFirstName || ""} ${watchedLastName || ""}`.trim()
      : (user as any)?.name ||
        (user as any)?.full_name ||
        user?.email?.split("@")[0] ||
        "User";

  const role = user?.user_type
    ? user.user_type.replace(/_/g, " ")
    : undefined;

  /* ── loading skeleton ─ */
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30">
        {/* ── Top bar ── */}
        <div className="sticky top-0 z-20 border-b border-border/40 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 md:px-6">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              onClick={handleSubmit(onSubmit)}
              disabled={isUpdating || isUploading}
            >
              {(isUpdating || isUploading) && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 space-y-6">
          {/* ── Hero Card ── */}
          <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/60 bg-white">
            <div className="relative h-28 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.04%22/%3E%3C/g%3E%3C/svg%3E')] opacity-60" />

              {/* Role badge overlay */}
              <div className="absolute bottom-3 right-4">
                <Badge className="bg-white/15 backdrop-blur-md text-white border-white/20 text-[10px] uppercase tracking-widest font-bold px-3 py-1">
                  <Shield className="h-3 w-3 mr-1.5" />
                  {role || "Staff"}
                </Badge>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-slate-100">
                    {avatarUrl ? (
                      <AvatarImage
                        src={avatarUrl}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-2xl font-bold capitalize bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>

                {/* Name + meta */}
                <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
                  <h1 className="text-xl font-bold text-slate-900 capitalize">
                    {displayName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[12px] text-muted-foreground">
                    {user?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                    )}
                    {user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Change / Delete photo */}
                <div className="flex gap-2 sm:pb-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-slate-200"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Change Photo
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-destructive hover:text-destructive"
                      onClick={handleDeletePhoto}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ── Form ── */}
          <form
            id="profile-page-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Personal Information */}
            <Card className="border-0 shadow-lg shadow-slate-100/60 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      First Name
                    </Label>
                    <Input
                      {...register("first_name")}
                      placeholder="John"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Last Name
                    </Label>
                    <Input
                      {...register("last_name")}
                      placeholder="Doe"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      Email
                    </Label>
                    <Input
                      {...register("email")}
                      type="email"
                      disabled
                      className="h-10 bg-slate-100/80 border-slate-200 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Email is managed by the administrator
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      Phone
                    </Label>
                    <Input
                      {...register("phone")}
                      placeholder="+91..."
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card className="border-0 shadow-lg shadow-slate-100/60 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Award className="h-3 w-3" />
                      Specialization
                    </Label>
                    <Input
                      {...register("specialization")}
                      placeholder="e.g. Clinical Nutrition"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      Qualification
                    </Label>
                    <Input
                      {...register("qualification")}
                      placeholder="e.g. MBBS, MD"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Experience (Years)
                    </Label>
                    <Input
                      {...register("experience_years")}
                      type="number"
                      min="0"
                      placeholder="10"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Languages className="h-3 w-3" />
                      Languages
                    </Label>
                    <Input
                      {...register("languages")}
                      placeholder="English, Hindi"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Comma separated
                    </p>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Bio / Summary
                    </Label>
                    <Textarea
                      {...register("bio")}
                      placeholder="Brief professional background…"
                      rows={3}
                      className="bg-slate-50/50 border-slate-200 focus:bg-white transition-colors resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-0 shadow-lg shadow-slate-100/60 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                    <MapPin className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" />
                      Address
                    </Label>
                    <Input
                      {...register("address")}
                      placeholder="123 Main St"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      City
                    </Label>
                    <Input
                      {...register("city")}
                      placeholder="Mumbai"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      State
                    </Label>
                    <Input
                      {...register("state")}
                      placeholder="Maharashtra"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Globe className="h-3 w-3" />
                      Country
                    </Label>
                    <Input
                      {...register("country")}
                      placeholder="India"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Hash className="h-3 w-3" />
                      Pincode / Zip
                    </Label>
                    <Input
                      {...register("pincode")}
                      placeholder="400001"
                      className="h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom save bar */}
            <div className="flex justify-end gap-3 pt-2 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-10 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || isUploading}
                className="h-10 px-6 gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              >
                {(isUpdating || isUploading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Cropper Modal ── */}
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
                <Button variant="outline" onClick={cancelCrop}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCrop} disabled={isUploading}>
                  {isUploading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Crop & Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
