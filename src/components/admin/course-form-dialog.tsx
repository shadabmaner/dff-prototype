"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, Upload, Loader2 } from "lucide-react"
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Course, CreateCourseData, UpdateCourseData, FAQ } from "@/lib/api/courses-client"
import { cn } from "@/lib/utils"

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCourseData | UpdateCourseData | any) => Promise<void>
  course?: Course | null
  specialties: Array<{ id: string; name: string }>
  programs: Array<{ id: string; name: string }>
  mode: "create" | "edit"
}

export function CourseFormDialog({
  open,
  onOpenChange,
  onSubmit,
  course,
  specialties,
  programs,
  mode,
}: CourseFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false)
  const [pendingSubmitData, setPendingSubmitData] = useState<CreateCourseData | UpdateCourseData | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    speciality_id: "",
    program_id: "",
    language_code: "mr",
    status: "active" as "active" | "inactive",
    duration: "",
    duration_number: 12,
    duration_unit: "weeks",
    faqs: [] as FAQ[],
    file: null as File | null,
  })

  const priceRegex = /^\d*(?:\.\d{0,2})?$/
  const integerRegex = /^\d*$/
  const durationNumberRegex = /^\d{0,3}$/

  const labelClass = (field: keyof typeof errors) =>
    cn("text-sm font-medium", errors[field] && "text-red-500")

  const labelAsteriskClass = (field: keyof typeof errors) =>
    cn("text-red-500", errors[field] && "font-semibold")

  const controlClass = (field: keyof typeof errors) =>
    cn("", errors[field] && "border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0")

  useEffect(() => {
    if (course && mode === "edit") {
      setFormData({
        title: course.title,
        description: course.description || "",
        speciality_id: course.speciality_id,
        program_id: course.program_id || "",
        language_code: course.language_code || "mr",
        status: course.status,
        duration: course.duration || "",
        duration_number: course.duration_number ?? 12,
        duration_unit: course.duration_unit ?? "weeks",
        faqs: course.faqs || [],
        file: null,
      })
      if (course.course_image) {
        setImagePreview(course.course_image)
      }
    } else {
      setFormData({
        title: "",
        description: "",
        speciality_id: "",
        program_id: "",
        language_code: "mr",
        status: "active",
        duration: "",
        duration_number: 12,
        duration_unit: "weeks",
        faqs: [],
        file: null,
      })
      setImagePreview(null)
    }
    setErrors({})
  }, [course, mode, open])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be 200 characters or less"
    }

    if (!formData.speciality_id) {
      newErrors.speciality_id = "Speciality is required"
    }

    if (formData.language_code && formData.language_code.length > 10) {
      newErrors.language_code = "Language code must be 10 characters or less"
    }


    if (!formData.duration_number || formData.duration_number <= 0 || formData.duration_number > 999) {
      newErrors.duration_number = "Enter a duration up to 3 digits"
    }



    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, file: "Please select an image file" })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, file: "Image must be less than 5MB" })
        return
      }
      setFormData({ ...formData, file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setErrors({ ...errors, file: "" })
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setFormData({ ...formData, file: null })
    setErrors((prev) => ({ ...prev, file: "" }))
  }

  const addFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: "", answer: "" }],
    })
  }

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    const newFaqs = [...formData.faqs]
    newFaqs[index][field] = value
    setFormData({ ...formData, faqs: newFaqs })
  }

  const removeFAQ = (index: number) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData: CreateCourseData | UpdateCourseData = {
      title: formData.title,
      description: formData.description || undefined,
      speciality_id: formData.speciality_id,
      program_id: formData.program_id || undefined,
      language_code: formData.language_code || undefined,
      status: formData.status,
      duration: formData.duration || undefined,
      duration_number: formData.duration_number,
      duration_unit: formData.duration_unit,
      faqs: formData.faqs.filter(faq => faq.question && faq.answer),
      file: formData.file || undefined,
    }

    setPendingSubmitData(submitData)
    setConfirmSubmitOpen(true)
  }

  const confirmSubmit = async () => {
    if (!pendingSubmitData) return

    setLoading(true)
    try {
      await onSubmit(pendingSubmitData)
      onOpenChange(false)
      setConfirmSubmitOpen(false)
      setPendingSubmitData(null)
    } catch (error) {
      console.error("Form submission error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const closeConfirmDialog = () => {
    if (loading) return
    setConfirmSubmitOpen(false)
    setPendingSubmitData(null)
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="inset-y-0 right-0 h-full min-w-lg max-w-3xl overflow-y-auto border-l bg-white px-0 py-0">
        <DrawerHeader className="flex flex-row items-start justify-between border-b px-8 pb-4 pt-8">
          <div>
            <DrawerTitle className="text-2xl font-bold">
              {mode === "create" ? "Create New Course" : "Edit Course"}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-slate-500">
              {mode === "create"
                ? "Fill in the details to create a new course"
                : "Update the course information"}
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <form noValidate onSubmit={handleSubmit} className="space-y-6 px-8 py-8">
          <div className="grid gap-4 md:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="title" className={labelClass("title")}>
                Title <span className={labelAsteriskClass("title")}>*</span>
              </Label>
              <Input
                id="title"
                className={controlClass("title")}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Course title"
                maxLength={200}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>


          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Course description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speciality_id" className={labelClass("speciality_id")}>
              Speciality <span className={labelAsteriskClass("speciality_id")}>*</span>
            </Label>
            <Select
              value={formData.speciality_id}
              onValueChange={(value) => setFormData({ ...formData, speciality_id: value })}
            >
              <SelectTrigger className={cn("w-full", controlClass("speciality_id"))}>
                <SelectValue
                  placeholder="Select speciality"
                  className={cn(errors.speciality_id && "text-red-500")}
                />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.speciality_id && <p className="text-sm text-red-500">{errors.speciality_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="file" className="text-sm font-medium">
              Course Cover Image
            </Label>
            <input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5">
              {!imagePreview ? (
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-slate-600 transition hover:border-slate-400 hover:bg-white cursor-pointer"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-800">Drag & drop or click to upload</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5 MB</p>
                  </div>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <img src={imagePreview} alt="Course preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow hover:bg-white hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      htmlFor="file"
                      className="inline-flex cursor-pointer items-center rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400"
                    >
                      Change Image
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm font-medium text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <p className="mt-4 text-xs text-slate-500">Recommended size 1280×720px. Larger images will be cropped.</p>
            </div>
            {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>FAQs</Label>
              <Button type="button" variant="outline" size="sm" onClick={addFAQ}>
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </div>

            {formData.faqs.map((faq, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <Label className="text-sm">FAQ {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFAQ(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <Input
                  value={faq.question}
                  onChange={(e) => updateFAQ(index, "question", e.target.value)}
                  placeholder="Question"
                />
                <Textarea
                  value={faq.answer}
                  onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                  placeholder="Answer"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "create" ? "Create Course" : "Update Course"}
            </Button>
          </div>
        </form>
      </DrawerContent>
      <AlertDialog open={confirmSubmitOpen} onOpenChange={(open) => (open ? setConfirmSubmitOpen(true) : closeConfirmDialog())}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {mode === "create" ? "Create this course?" : "Update this course?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mode === "create"
                ? "Confirm to create the course with the provided details."
                : "Confirm to apply the updates to this course."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={closeConfirmDialog} disabled={loading}>
                Review Details
              </Button>
            </AlertDialogCancel>
            <Button onClick={confirmSubmit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {mode === "create" ? "Confirm Create" : "Confirm Update"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  )
}
