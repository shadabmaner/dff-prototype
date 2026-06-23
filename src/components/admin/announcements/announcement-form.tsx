"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MapPin } from "lucide-react";
import {
  AnnouncementChannel,
  AnnouncementPriority,
  type Announcement,
} from "@/types/announcement";
import { useSpecialitiesQuery } from "@/hooks/use-specialities";
import { Loader2, Upload, X } from "lucide-react";
import { uploadImage } from "@/lib/upload-image";
import { toast } from "sonner";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  scheduled_at: z.string().min(1, "Scheduled date is required"),
  speciality_id: z.string().min(1, "Speciality is required"),
  thumbnail_url: z.string().optional().or(z.literal("")),
  target_audience: z.string().optional(),
  channels: z.array(z.nativeEnum(AnnouncementChannel)).min(1, "Select at least one channel"),
  priority: z.nativeEnum(AnnouncementPriority).optional(),
  expires_at: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  pincode: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  location_url: z.string().optional().or(z.literal("")).refine((val) => !val || z.string().url().safeParse(val).success, "Please enter a valid URL"),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AnnouncementFormData) => void;
  announcement?: Announcement | null;
  isLoading?: boolean;
}

const TARGET_AUDIENCE_OPTIONS = [
  { value: "ALL_PATIENTS", label: "All Patients" },
  // { value: "ALL_USERS", label: "All Users" },
  // { value: "SPECIFIC_USERS", label: "Specific Users" },
];

const CHANNEL_OPTIONS = [
  { value: AnnouncementChannel.FCM, label: "Push Notification (FCM)" },
  { value: AnnouncementChannel.EMAIL, label: "Email" },
  { value: AnnouncementChannel.SMS, label: "SMS" },
  { value: AnnouncementChannel.WHATSAPP, label: "WhatsApp" },
  { value: AnnouncementChannel.IN_APP, label: "In-App" },
];

export function AnnouncementForm({
  open,
  onClose,
  onSubmit,
  announcement,
  isLoading = false,
}: AnnouncementFormProps) {
  const { data: specialitiesData, isLoading: loadingSpecialities } = useSpecialitiesQuery();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduled_at: "",
      speciality_id: "",
      thumbnail_url: "",
      target_audience: "",
      channels: [],
      priority: AnnouncementPriority.NORMAL,
      expires_at: "",
      state: "",
      city: "",
      pincode: "",
      address: "",
      location_url: "",
    },
  });

  const emptyValues: AnnouncementFormData = {
    title: "",
    description: "",
    scheduled_at: "",
    speciality_id: "",
    thumbnail_url: "",
    target_audience: "ALL_PATIENTS",
    channels: [],
    priority: AnnouncementPriority.NORMAL,
    expires_at: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    location_url: "",
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    form.clearErrors();

    if (announcement) {
      form.reset({
        title: announcement.title,
        description: announcement.description,
        scheduled_at: announcement.scheduled_at
          ? new Date(announcement.scheduled_at).toISOString().slice(0, 16)
          : "",
        speciality_id: announcement.speciality_id,
        thumbnail_url: announcement.thumbnail_url || "",
        target_audience: announcement.target_audience || "",
        channels: announcement.channel ? [announcement.channel] : [],
        priority: announcement.priority || AnnouncementPriority.NORMAL,
        expires_at: announcement.expires_at
          ? new Date(announcement.expires_at).toISOString().slice(0, 16)
          : "",
        state: announcement.state || "",
        city: announcement.city || "",
        pincode: announcement.pincode || "",
        address: announcement.address || "",
        location_url: announcement.location_url || "",
      });
      setPreviewImage(announcement.thumbnail_url);
    } else {
      form.reset(emptyValues);
      setPreviewImage(null);
    }
  }, [announcement, form, open]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file, { prefix: "announcements" });
      form.setValue("thumbnail_url", imageUrl);
      setPreviewImage(imageUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    form.setValue("thumbnail_url", "");
    setPreviewImage(null);
  };

  const handleSubmit = (data: AnnouncementFormData) => {
    const payload = {
      ...data,
      thumbnail_url: data.thumbnail_url || undefined,
      target_audience: data.target_audience || undefined,
      scheduled_at: new Date(data.scheduled_at).toISOString(),
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : undefined,
      state: data.state || undefined,
      city: data.city || undefined,
      pincode: data.pincode || undefined,
      address: data.address || undefined,
      location_url: data.location_url || undefined,
    };
    onSubmit(payload);
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{announcement ? "Edit Announcement" : "Create Announcement"}</SheetTitle>
          <SheetDescription>
            {announcement
              ? "Update announcement details. Only scheduled announcements can be edited."
              : "Create a new announcement to notify users about important updates."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter announcement title" {...field} />
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter announcement description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="speciality_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speciality *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select speciality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingSpecialities ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        specialitiesData?.data?.map((speciality) => (
                          <SelectItem key={speciality.id} value={speciality.id}>
                            {speciality.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the medical speciality this announcement is related to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date & Time *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be a future date and time
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AnnouncementPriority.LOW}>Low</SelectItem>
                      <SelectItem value={AnnouncementPriority.NORMAL}>Normal</SelectItem>
                      <SelectItem value={AnnouncementPriority.HIGH}>High</SelectItem>
                      <SelectItem value={AnnouncementPriority.URGENT}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channels"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Channels *</FormLabel>
                    <FormDescription>
                      Select one or more delivery channels for this announcement
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {CHANNEL_OPTIONS.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="channels"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option.value])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value: any) => value !== option.value
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TARGET_AUDIENCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Define who should receive this announcement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {previewImage ? (
                        <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                          <img
                            src={previewImage}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-6">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                              <label
                                htmlFor="thumbnail-upload"
                                className="cursor-pointer text-sm font-medium text-primary hover:underline"
                              >
                                Click to upload
                              </label>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                            <Input
                              id="thumbnail-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                            />
                          </div>
                          {uploadingImage && (
                            <div className="flex items-center justify-center mt-4">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              <span className="ml-2 text-sm text-muted-foreground">
                                Uploading...
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <Input type="hidden" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload an image for the announcement thumbnail
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Set when this announcement should expire
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-base font-medium">Location Information</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode/ZIP</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Google Maps link" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter Google Maps link for event location
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter full address"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Full street address for the event location
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {announcement ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
