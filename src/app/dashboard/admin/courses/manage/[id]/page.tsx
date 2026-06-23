"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  Video,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { FAQBuilder } from "@/components/admin/faq-builder"
import { DraggableList } from "@/components/admin/draggable-list"
import { useToast } from "@/components/ui/use-toast"
import {
  knowledgeBaseModulesClient,
  type KnowledgeBaseModule,
  type ModuleUnlockRule,
} from "@/lib/api/knowledge-base-modules-client"
import type { FAQ } from "@/types/admin"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type ConfirmAction = "delete"

interface ModuleFormState {
  title: string
  description: string
  unlock_rule: ModuleUnlockRule
  module_sequence?: number
  coverImageFile: File | null
  coverImagePreview?: string | null
  introVideoFile: File | null
  introVideoName?: string
  introVideoUrl?: string | null
  introVideoPreview?: string | null
}

const TITLE_MIN_LENGTH = 4
const TITLE_MAX_LENGTH = 120
const DESCRIPTION_MAX_LENGTH = 600
const COVER_IMAGE_MAX_MB = 5
const INTRO_VIDEO_MAX_MB = 200

const unlockRuleLabels: Record<string, string> = {
  immediate: "Immediate",
  sequential: "Sequential",
}

const unlockRuleOptions = [
  { label: "All unlock rules", value: "all" },
  { label: unlockRuleLabels.immediate, value: "immediate" },
  { label: unlockRuleLabels.sequential, value: "sequential" },
]

const moduleUnlockChoices: { label: string; value: ModuleUnlockRule }[] = [
  { label: unlockRuleLabels.immediate, value: "immediate" },
  { label: unlockRuleLabels.sequential, value: "sequential" },
]

const initialFormState: ModuleFormState = {
  title: "",
  description: "",
  unlock_rule: "immediate",
  module_sequence: undefined,
  coverImageFile: null,
  coverImagePreview: undefined,
  introVideoFile: null,
  introVideoName: undefined,
  introVideoUrl: undefined,
  introVideoPreview: undefined,
}

export default function ManageCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [modules, setModules] = useState<KnowledgeBaseModule[]>([])
  const [courseFaqs, setCourseFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isReorderDrawerOpen, setIsReorderDrawerOpen] = useState(false)
  const [reorderModules, setReorderModules] = useState<KnowledgeBaseModule[]>([])
  const [isSavingModule, setIsSavingModule] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [moduleForm, setModuleForm] = useState<ModuleFormState>(initialFormState)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [editingModule, setEditingModule] = useState<KnowledgeBaseModule | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [unlockRuleFilter, setUnlockRuleFilter] = useState("all")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [pendingModule, setPendingModule] = useState<KnowledgeBaseModule | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => a.module_sequence - b.module_sequence),
    [modules]
  )

  const filteredModules = useMemo(() => {
    return sortedModules.filter((module) => {
      const matchesSearch = module.title
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
      const matchesRule =
        unlockRuleFilter === "all" || module.unlock_rule === unlockRuleFilter
      return matchesSearch && matchesRule
    })
  }, [sortedModules, searchQuery, unlockRuleFilter])

  useEffect(() => {
    loadModules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (isReorderDrawerOpen) {
      setReorderModules(sortedModules)
    }
  }, [isReorderDrawerOpen, sortedModules])

  const loadModules = async () => {
    setIsLoading(true)
    try {
      const data = await knowledgeBaseModulesClient.getModulesByCourse(id)
      setModules(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(
        "Failed to load modules",
        error.response?.data?.message || "Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const clearFieldError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const openCreateDrawer = () => {
    setEditingModule(null)
    setModuleForm(initialFormState)
    setFormErrors({})
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (module: KnowledgeBaseModule) => {
    setEditingModule(module)
    setModuleForm({
      title: module.title || "",
      description: module.description || "",
      unlock_rule: (module.unlock_rule as ModuleUnlockRule) || "immediate",
      module_sequence: module.module_sequence,
      coverImageFile: null,
      coverImagePreview: module.cover_image_url || undefined,
      introVideoFile: null,
      introVideoName: module.intro_video_url
        ? module.intro_video_url.split("/").pop()
        : undefined,
      introVideoUrl: module.intro_video_url,
      introVideoPreview: undefined,
    })
    setFormErrors({})
    setIsDrawerOpen(true)
  }

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) {
      setTimeout(() => {
        setEditingModule(null)
        setModuleForm(initialFormState)
        setFormErrors({})
      }, 200)
    }
  }

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type?.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        coverImage: "Please upload a valid image file",
      }))
      return
    }
    if (file.size > COVER_IMAGE_MAX_MB * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        coverImage: `Cover image must be under ${COVER_IMAGE_MAX_MB} MB`,
      }))
      return
    }
    const previewUrl = URL.createObjectURL(file)
    setModuleForm((prev) => ({
      ...prev,
      coverImageFile: file,
      coverImagePreview: previewUrl,
    }))
    clearFieldError("coverImage")
  }

  const handleIntroVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type?.startsWith("video/")) {
      setFormErrors((prev) => ({
        ...prev,
        introVideo: "Only video files are supported",
      }))
      return
    }
    if (file.size > INTRO_VIDEO_MAX_MB * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        introVideo: `Intro video must be under ${INTRO_VIDEO_MAX_MB} MB`,
      }))
      return
    }
    const previewUrl = URL.createObjectURL(file)
    setModuleForm((prev) => ({
      ...prev,
      introVideoFile: file,
      introVideoName: file.name,
      introVideoUrl: undefined,
      introVideoPreview: previewUrl,
    }))
    clearFieldError("introVideo")
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    const trimmedTitle = moduleForm.title.trim()
    if (!trimmedTitle) {
      errors.title = "Title is required"
    } else if (trimmedTitle.length < TITLE_MIN_LENGTH) {
      errors.title = `Title must be at least ${TITLE_MIN_LENGTH} characters`
    } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      errors.title = `Title must be under ${TITLE_MAX_LENGTH} characters`
    }
    if (moduleForm.description && moduleForm.description.length > DESCRIPTION_MAX_LENGTH) {
      errors.description = `Description must be under ${DESCRIPTION_MAX_LENGTH} characters`
    }
    if (!editingModule && !moduleForm.coverImageFile) {
      errors.coverImage = "Cover image is required"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildPayload = () => {
    const basePayload = {
      title: moduleForm.title.trim(),
      description: moduleForm.description.trim() || undefined,
      unlock_rule: moduleForm.unlock_rule,
      coverImage: moduleForm.coverImageFile || undefined,
      introVideo: moduleForm.introVideoFile || undefined,
    }

    if (editingModule) {
      return basePayload
    }

    return {
      ...basePayload,
      course_id: id,
    }
  }

  const handleSubmitModule = async () => {
    if (!validateForm()) return
    setIsSavingModule(true)
    try {
      if (editingModule) {
        await knowledgeBaseModulesClient.updateModule(editingModule.id, buildPayload())
        toast("Module updated")
      } else {
        await knowledgeBaseModulesClient.createModule(buildPayload() as any)
        toast("Module created")
      }
      handleDrawerOpenChange(false)
      await loadModules()
    } catch (error: any) {
      toast.error(
        editingModule ? "Update failed" : "Creation failed",
        error.response?.data?.message || "Please try again."
      )
    } finally {
      setIsSavingModule(false)
    }
  }

  const handleDeleteRequest = (module: KnowledgeBaseModule) => {
    setPendingModule(module)
    setConfirmAction("delete")
    setConfirmDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!confirmAction || !pendingModule) return
    setIsConfirmLoading(true)
    try {
      if (confirmAction === "delete") {
        await knowledgeBaseModulesClient.deleteModule(pendingModule.id)
        toast("Module deleted")
      }
      await loadModules()
    } catch (error: any) {
      toast.error("Action failed", error.response?.data?.message || "Please try again.")
    } finally {
      setIsConfirmLoading(false)
      setConfirmDialogOpen(false)
      setPendingModule(null)
      setConfirmAction(null)
    }
  }

  const handleReorder = async () => {
    setIsSavingOrder(true)
    try {
      await knowledgeBaseModulesClient.reorderModules(
        id,
        reorderModules.map((module) => module.id)
      )
      toast("Module order updated")
      setIsReorderDrawerOpen(false)
      await loadModules()
    } catch (error: any) {
      toast.error("Reorder failed", error.response?.data?.message || "Please try again.")
    } finally {
      setIsSavingOrder(false)
    }
  }

  const handleReorderListChange = (items: KnowledgeBaseModule[]) => {
    setReorderModules(items)
  }

  const renderModuleCard = (module: KnowledgeBaseModule) => (
    <div
      key={module.id}
      className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {module.cover_image_url ? (
          <img
            src={module.cover_image_url}
            alt={module.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-background/80">
          #{module.module_sequence}
        </Badge>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/dashboard/admin/courses/manage/${id}/modules/${module.id}`}
              className="font-semibold text-lg leading-snug text-foreground hover:text-primary"
            >
              {module.title}
            </Link>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {module.description || "No description"}
            </p>
          </div>
          <div className="flex gap-2">

            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDrawer(module)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive"
              onClick={() => handleDeleteRequest(module)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {unlockRuleLabels[module.unlock_rule] || module.unlock_rule}
          </Badge>
          {module.intro_video_url && (
            <span className="inline-flex items-center gap-1">
              <Video className="h-3 w-3" /> Intro video attached
            </span>
          )}
          <span>
            Updated {new Date(module.updated_at).toLocaleDateString()}
          </span>
        </div>

      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <Link href="/dashboard/admin/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
              </Button>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold">Course Modules</h1>
            <p className="text-muted-foreground mt-1">
              Create, reorder, and manage modules for this course
            </p>
          </div>

          <Tabs defaultValue="modules" className="space-y-6">
            {/* <TabsList>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="faqs">Course FAQs</TabsTrigger>
            </TabsList> */}

            <TabsContent value="modules" className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search modules"
                      className="pl-9"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </div>
                  <Select value={unlockRuleFilter} onValueChange={setUnlockRuleFilter}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                      <SelectValue>
                        {
                          unlockRuleOptions.find((option) => option.value === unlockRuleFilter)
                            ?.label
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {unlockRuleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadModules}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReorderDrawerOpen(true)}
                    disabled={modules.length < 2}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" /> Reorder
                  </Button>
                  <Button size="sm" onClick={openCreateDrawer}>
                    <Plus className="h-4 w-4 mr-2" /> New Module
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="border rounded-xl p-4 space-y-3 animate-pulse"
                    >
                      <div className="h-40 bg-muted rounded-lg" />
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-10 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredModules.length ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {filteredModules.map((module) => renderModuleCard(module))}
                </div>
              ) : (
                <div className="border rounded-2xl p-10 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No modules found</h3>
                  <p className="text-muted-foreground mt-2">
                    Adjust your filters or create a new module to get started.
                  </p>
                  <Button className="mt-4" onClick={openCreateDrawer}>
                    <Plus className="h-4 w-4 mr-2" /> Create module
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* <TabsContent value="faqs">
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Course FAQs</h2>
                <FAQBuilder
                  faqs={courseFaqs}
                  onChange={setCourseFaqs}
                  showToggle={false}
                />
              </div>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>

      <Drawer
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        direction="right"
      >
        <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl flex flex-col max-h-[100vh]">
          <DrawerHeader>
            <DrawerTitle>{editingModule ? "Edit Module" : "Create Module"}</DrawerTitle>
            <DrawerDescription>
              {editingModule
                ? "Update this module’s content, unlock logic, and media."
                : "Set the essentials for a new module in this course."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-5 overflow-y-auto">
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Module title <span className="text-xs text-muted-foreground">*</span>
              </Label>
              <Input
                value={moduleForm.title}
                onChange={(event) =>
                  setModuleForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className={cn(formErrors.title && "border-destructive focus-visible:ring-destructive/40")}
                aria-invalid={!!formErrors.title}
              />
              {formErrors.title && (
                <p className="text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={moduleForm.description}
                rows={4}
                className={cn("resize-none", formErrors.description && "border-destructive focus-visible:ring-destructive/40")}
                onChange={(event) =>
                  setModuleForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Tell learners what this module covers"
                aria-invalid={!!formErrors.description}
              />
              {formErrors.description && (
                <p className="text-xs text-destructive">{formErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Unlock rule</Label>
              <Select
                value={moduleForm.unlock_rule}
                onValueChange={(value: ModuleUnlockRule) =>
                  setModuleForm((prev) => ({ ...prev, unlock_rule: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moduleUnlockChoices.map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Cover image <span className="text-xs text-muted-foreground">{editingModule ? "" : "*"}</span>
              </Label>
              {moduleForm.coverImagePreview ? (
                <div className="relative max-w-xs">
                  <img
                    src={moduleForm.coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7"
                    onClick={() =>
                      setModuleForm((prev) => ({
                        ...prev,
                        coverImageFile: null,
                        coverImagePreview: undefined,
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 text-center hover:border-primary/40">
                  <ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click or drag to upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageChange}
                  />
                </label>
              )}
              {formErrors.coverImage && (
                <p className="text-xs text-destructive">{formErrors.coverImage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Intro video</Label>
              {moduleForm.introVideoPreview || moduleForm.introVideoUrl ? (
                <div className="relative max-w-xs">
                  <video
                    src={moduleForm.introVideoPreview || moduleForm.introVideoUrl || ""}
                    className="w-full h-40 rounded-lg border object-cover"
                    controls
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7"
                    onClick={() =>
                      setModuleForm((prev) => ({
                        ...prev,
                        introVideoFile: null,
                        introVideoName: undefined,
                        introVideoPreview: undefined,
                        introVideoUrl: undefined,
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 text-center hover:border-primary/40">
                  <Video className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload MP4 / MOV</p>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleIntroVideoChange}
                  />
                </label>
              )}
              {formErrors.introVideo && (
                <p className="text-xs text-destructive">{formErrors.introVideo}</p>
              )}
            </div>
          </div>
          <DrawerFooter className="border-t bg-muted/40">
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => handleDrawerOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitModule} disabled={isSavingModule}>
                {isSavingModule && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingModule ? "Save changes" : "Create module"}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isReorderDrawerOpen}
        onOpenChange={setIsReorderDrawerOpen}
        direction="right"
      >
        <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>Reorder modules</DrawerTitle>
            <DrawerDescription>Drag modules into the sequence you want learners to follow.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            {reorderModules.length ? (
              <DraggableList
                items={reorderModules}
                getItemId={(module) => module.id}
                onReorder={handleReorderListChange}
                renderItem={(module, index) => (
                  <div className="flex flex-col">
                    <span className="font-medium">#{index + 1} {module.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {unlockRuleLabels[module.unlock_rule] || module.unlock_rule}
                    </span>
                  </div>
                )}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Add at least two modules to enable reordering.
              </p>
            )}
          </div>
          <DrawerFooter className="border-t bg-muted/40">
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setIsReorderDrawerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReorder} disabled={isSavingOrder || reorderModules.length < 2}>
                {isSavingOrder && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save order
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete module</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the module and rearrange the remaining modules. You can’t delete modules that contain resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirmLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmAction}
              disabled={isConfirmLoading}
            >
              {isConfirmLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete module
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
