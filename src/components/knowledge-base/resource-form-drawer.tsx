"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useCreateResource, useUpdateResource, useUploadResourceWithFile } from "@/hooks/use-knowledge-base"
import { useSpecialities, useProgramsDropdown } from "@/hooks/use-dropdowns"
import type {
  KnowledgeBaseResource,
  ResourceContentType,
  ResourceStatus,
  CreateResourceDto,
  UpdateResourceDto,
} from "@/lib/api/knowledge-base-client"

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  content_type: z.enum(["video", "pdf", "article", "recipe", "image", "document", "external_link"]),
  resource_url: z
    .string()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  speciality_id: z.string().uuid("Must be a valid speciality"),
  program_id: z.string().uuid("Must be a valid program").optional().or(z.literal("")),
  module_id: z.string().uuid("Must be a valid module").optional().or(z.literal("")),
  language_code: z.string().max(10).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
})

type ResourceFormData = z.infer<typeof resourceSchema>

interface ResourceFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource?: KnowledgeBaseResource | null
  specialityId?: string
  viewMode?: boolean
}

const CONTENT_TYPES: { value: ResourceContentType; label: string }[] = [
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF Document" },
  { value: "article", label: "Article" },
  { value: "recipe", label: "Recipe" },
  { value: "image", label: "Image" },
  { value: "document", label: "Document" },
  { value: "external_link", label: "External Link" },
]

const STATUS_OPTIONS: { value: ResourceStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const ACCEPT_MAP: Record<ResourceContentType, string> = {
  video: "video/*",
  pdf: "application/pdf",
  article: ".pdf,.doc,.docx,.md,.txt",
  recipe: ".pdf,.doc,.docx,.md,.txt",
  image: "image/*",
  document: ".pdf,.doc,.docx",
  external_link: "",
}

const getAcceptFromContentType = (type: ResourceContentType) => ACCEPT_MAP[type] || "*/*"

type CommonPayload = Omit<CreateResourceDto, "resource_url">

const buildCommonPayload = (data: ResourceFormData): CommonPayload => ({
  title: data.title.trim(),
  description: data.description?.trim() || undefined,
  content_type: data.content_type,
  speciality_id: data.speciality_id,
  program_id: data.program_id || undefined,
  module_id: data.module_id || undefined,
  language_code: data.language_code?.trim() || undefined,
  status: data.status || "inactive",
})

const appendCommonPayloadToFormData = (formData: FormData, payload: CommonPayload) => {
  formData.append("title", payload.title)
  if (payload.description) formData.append("description", payload.description)
  formData.append("content_type", payload.content_type)
  formData.append("speciality_id", payload.speciality_id)
  if (payload.program_id) formData.append("program_id", payload.program_id)
  if (payload.module_id) formData.append("module_id", payload.module_id)
  if (payload.language_code) formData.append("language_code", payload.language_code)
  if (payload.status) formData.append("status", payload.status)
}

const buildFileFormData = (payload: CommonPayload, file: File) => {
  const formData = new FormData()
  appendCommonPayloadToFormData(formData, payload)
  formData.append("file", file)
  return formData
}

export function ResourceFormDrawer({ open, onOpenChange, resource, specialityId, viewMode = false }: ResourceFormDrawerProps) {
  const isEditing = !!resource
  const isReadOnly = viewMode && isEditing

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      content_type: "video",
      resource_url: "",
      speciality_id: specialityId || "",
      program_id: "",
      module_id: "",
      language_code: "en",
      status: "inactive",
    },
  })

  const { data: specialitiesResponse } = useSpecialities()
  const specialities = specialitiesResponse || []

  const selectedSpecialityId = form.watch("speciality_id")
  const { data: programsResponse } = useProgramsDropdown({ speciality_id: selectedSpecialityId })
  const programs = programsResponse || []

  const { mutate: createResource, isPending: isCreating } = useCreateResource()
  const { mutate: updateResource, isPending: isUpdating } = useUpdateResource()
  const { mutate: uploadResourceWithFile, isPending: isUploading } = useUploadResourceWithFile()

  const isExternalLink = form.watch("content_type") === "external_link"

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const isPending = isCreating || isUpdating || isUploading

  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        description: resource.description || "",
        content_type: resource.content_type,
        resource_url: resource.resource_url,
        speciality_id: resource.speciality_id,
        program_id: resource.program_id || "",
        module_id: resource.module_id || "",
        language_code: resource.language_code || "en",
        status: resource.status,
      })
    } else {
      form.reset({
        title: "",
        description: "",
        content_type: "video",
        resource_url: "",
        speciality_id: specialityId || "",
        program_id: "",
        module_id: "",
        language_code: "en",
        status: "inactive",
      })
    }
    setSelectedFile(null)
    setFileError(null)
  }, [resource, form, specialityId])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    if (file) {
      setFileError(null)
    }
  }

  const onSubmit = (data: ResourceFormData) => {
    const commonPayload = buildCommonPayload(data)
    const trimmedUrl = data.resource_url?.trim()

    if (isExternalLink && !trimmedUrl) {
      form.setError("resource_url", {
        message: "Resource URL is required for external links",
      })
      return
    }

    if (!isExternalLink && !selectedFile && !isEditing) {
      setFileError("Please upload a file for this resource")
      return
    }

    const handleSuccess = () => {
      onOpenChange(false)
      form.reset()
      setSelectedFile(null)
      setFileError(null)
    }

    if (isExternalLink) {
      const updatePayload: UpdateResourceDto = {
        ...commonPayload,
        resource_url: trimmedUrl!,
      }

      if (isEditing) {
        updateResource(
          { id: resource.id, data: updatePayload },
          {
            onSuccess: handleSuccess,
          }
        )
      } else {
        const createPayload: CreateResourceDto = {
          ...commonPayload,
          resource_url: trimmedUrl!,
        }
        createResource(createPayload, {
          onSuccess: handleSuccess,
        })
      }
      return
    }

    if (selectedFile) {
      const formData = buildFileFormData(commonPayload, selectedFile)

      if (isEditing) {
        updateResource(
          { id: resource.id, data: formData },
          {
            onSuccess: handleSuccess,
          }
        )
      } else {
        uploadResourceWithFile(formData, {
          onSuccess: handleSuccess,
        })
      }
      return
    }

    if (isEditing) {
      const updatePayload: UpdateResourceDto = {
        ...commonPayload,
      }
      updateResource(
        { id: resource.id, data: updatePayload },
        {
          onSuccess: handleSuccess,
        }
      )
    } else {
      setFileError("Please upload a file for this resource")
    }
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="">
        <div className="mx-auto w-full max-w-2xl h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>
              {isReadOnly ? "View Resource" : isEditing ? "Edit Resource" : "Create New Resource"}
            </DrawerTitle>
            <DrawerDescription>
              {isReadOnly
                ? "Resource details and information"
                : isEditing
                ? "Update the resource details below"
                : "Add a new resource to the knowledge base"}
            </DrawerDescription>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 overflow-y-auto">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduction to Anatomy" {...field} disabled={isReadOnly} />
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
                        placeholder="Brief description of the resource"
                        rows={3}
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="content_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONTENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
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
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
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

              {isExternalLink ? (
                <FormField
                  control={form.control}
                  name="resource_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource URL *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/resource.mp4"
                          type="url"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormDescription>Direct URL to the resource</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  <FormLabel>Upload File {isEditing ? "(optional)" : "*"}</FormLabel>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept={getAcceptFromContentType(form.watch("content_type"))}
                    disabled={isPending || isReadOnly}
                  />
                  {selectedFile && (
                    <p className="text-xs text-slate-500">Selected: {selectedFile.name}</p>
                  )}
                  {fileError && <p className="text-xs text-rose-600">{fileError}</p>}
                  <p className="text-xs text-slate-500">
                    Upload the resource file that will be hosted in the knowledge base.
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="speciality_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speciality *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select speciality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialities.map((speciality) => (
                          <SelectItem key={speciality.id} value={speciality.id}>
                            {speciality.name}
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
                name="program_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      value={field.value && field.value.length > 0 ? field.value : "none"}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
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
                name="language_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language Code</FormLabel>
                    <FormControl>
                      <Input placeholder="en" {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormDescription>
                      ISO language code (e.g., en, es, fr)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {isReadOnly ? "Close" : "Cancel"}
                </Button>
                {!isReadOnly && (
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Update Resource" : "Create Resource"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
