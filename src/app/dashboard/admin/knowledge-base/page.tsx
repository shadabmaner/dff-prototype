"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  FileVideo,
  FileText,
  Image,
  Link as LinkIcon,
  BookOpen,
  ArrowUpDown,
  Pin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useRouter } from "next/navigation"
import { DraggableList } from "@/components/admin/draggable-list"
import { useResources, useDeleteResource, useToggleResourceStatus, useReorderResources, useToggleResourcePin } from "@/hooks/use-knowledge-base"
import { useSpecialities } from "@/hooks/use-dropdowns"
import {
  knowledgeBaseClient,
  type KnowledgeBaseResource,
  type ResourceContentType,
  type ResourceStatus,
} from "@/lib/api/knowledge-base-client"
import { cn } from "@/lib/utils"
import { MediaRenderer } from "@/components/renderComponent"
import { Skeleton } from "@/components/ui/skeleton"

const CONTENT_TYPE_ICONS: Record<ResourceContentType, React.ElementType> = {
  video: FileVideo,
  pdf: FileText,
  article: BookOpen,
  recipe: BookOpen,
  image: Image,
  document: FileText,
  external_link: LinkIcon,
}

const ALL_VALUE = "all"

export default function KnowledgeBasePage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>(ALL_VALUE)
  const [selectedContentType, setSelectedContentType] = useState<string>(ALL_VALUE)
  const [selectedStatus, setSelectedStatus] = useState<string>(ALL_VALUE)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false)
  const [resourceToToggle, setResourceToToggle] = useState<{ id: string; currentStatus: string } | null>(null)
  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const [resourceToPin, setResourceToPin] = useState<{ id: string; currentPinStatus: boolean } | null>(null)
  const [reorderMode, setReorderMode] = useState(false)
  const [reorderItems, setReorderItems] = useState<KnowledgeBaseResource[]>([])
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewResource, setPreviewResource] = useState<KnowledgeBaseResource | null>(null)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [viewResource, setViewResource] = useState<KnowledgeBaseResource | null>(null)

  const router = useRouter()

  const { data: specialitiesResponse } = useSpecialities()
  const specialities = specialitiesResponse || []

  const canReorder = selectedSpeciality !== ALL_VALUE

  const { data: resourcesData, isLoading } = useResources({
    page,
    limit: 10,
    search: searchTerm || undefined,
    specialityId: selectedSpeciality !== ALL_VALUE ? selectedSpeciality : undefined,
    contentType:
      selectedContentType !== ALL_VALUE
        ? (selectedContentType as ResourceContentType)
        : undefined,
    status: selectedStatus !== ALL_VALUE ? (selectedStatus as "active" | "inactive") : undefined,
  })

  const resources = resourcesData?.data || []
  const pagination = resourcesData?.meta
  const currentPage = pagination?.page ?? page
  const perPage = pagination?.limit ?? 10
  const totalItems = pagination?.total ?? resources.length
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / perPage))
  const currentCount = pagination?.count ?? resources.length

  const { mutate: deleteResource } = useDeleteResource()
  const { mutate: toggleStatus } = useToggleResourceStatus()
  const { mutate: togglePin, isPending: isTogglingPin } = useToggleResourcePin()
  const { mutate: reorderResources, isPending: isReordering } = useReorderResources()

  const { data: reorderData, isLoading: isReorderDataLoading } = useQuery({
    queryKey: [
      "knowledge-base-resources",
      "reorder",
      selectedSpeciality,
      selectedContentType,
      selectedStatus,
      searchTerm,
    ],
    queryFn: () =>
      knowledgeBaseClient.getResources({
        page: 1,
        limit: 200,
        search: searchTerm || undefined,
        specialityId: selectedSpeciality,
        contentType:
          selectedContentType !== ALL_VALUE
            ? (selectedContentType as ResourceContentType)
            : undefined,
        status:
          selectedStatus !== ALL_VALUE ? (selectedStatus as ResourceStatus) : undefined,
      }),
    enabled: reorderMode && canReorder,
  })

  useEffect(() => {
    if (reorderMode && reorderData?.data) {
      const sorted = [...reorderData.data].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      )
      setReorderItems(sorted)
    }
  }, [reorderMode, reorderData])

  useEffect(() => {
    if (!canReorder && reorderMode) {
      setReorderMode(false)
      setReorderItems([])
    }
  }, [canReorder, reorderMode])

  const handleCreateClick = () => {
    const params = new URLSearchParams()
    if (selectedSpeciality !== ALL_VALUE) {
      params.set('specialityId', selectedSpeciality)
    }
    router.push(`/dashboard/admin/knowledge-base/new${params.toString() ? '?' + params.toString() : ''}`)
  }

  const handleEditClick = (resourceId: string) => {
    router.push(`/dashboard/admin/knowledge-base/${resourceId}/edit`)
  }

  const handleRowClick = (resource: KnowledgeBaseResource) => {
    setViewResource(resource)
    setViewDrawerOpen(true)
  }

  const handlePreviewClick = (resource: KnowledgeBaseResource) => {
    setPreviewResource(resource)
    setPreviewDialogOpen(true)
  }


  const renderPreviewContent = (resource?: KnowledgeBaseResource | null) => {
    if (!resource?.resource_url) {
      return <p className="text-sm text-[var(--muted-foreground)]">No preview available</p>
    }

    const { content_type, resource_url } = resource

    switch (content_type) {
      case "video":
        return (
          <video controls className="w-full max-h-[500px] rounded-lg">
            <source src={resource_url} />
            Your browser does not support the video tag.
          </video>
        )
      case "image":
        return (
          <img
            src={resource_url}
            alt={resource?.title || "Resource preview"}
            className="w-full max-h-[500px] object-contain rounded-lg"
          />
        )
      case "pdf":
        return (
          <iframe
            src={resource_url}
            className="w-full h-[600px] rounded-lg border"
            title={resource?.title || "Resource preview"}
          />
        )
      case "external_link":
        return (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">External link:</p>
            <a
              href={resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {resource_url}
            </a>
            <Button
              onClick={() => window.open(resource_url, "_blank")}
              className="w-full"
            >
              Open in New Tab
            </Button>
          </div>
        )
      case "article":
      case "recipe":
      case "document":
        return (
          <div className="space-y-4">
            <iframe
              src={resource_url}
              className="w-full h-[600px] rounded-lg border"
              title={resource?.title || "Resource preview"}
            />
            <a
              href={resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Open in New Tab
            </a>
          </div>
        )
      default:
        return (
          <a
            href={resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {resource_url}
          </a>
        )
    }
  }

  const handleDeleteClick = (id: string) => {
    setResourceToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (resourceToDelete) {
      deleteResource(resourceToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setResourceToDelete(null)
        },
      })
    }
  }

  const handleToggleStatusClick = (id: string, currentStatus: string) => {
    setResourceToToggle({ id, currentStatus })
    setToggleDialogOpen(true)
  }

  const confirmToggleStatus = () => {
    if (resourceToToggle) {
      toggleStatus(resourceToToggle.id, {
        onSuccess: () => {
          setToggleDialogOpen(false)
          setResourceToToggle(null)
        },
      })
    }
  }

  const handleTogglePinClick = (id: string, currentPinStatus: boolean) => {
    setResourceToPin({ id, currentPinStatus })
    setPinDialogOpen(true)
  }

  const confirmTogglePin = () => {
    if (resourceToPin) {
      togglePin(resourceToPin.id, {
        onSuccess: () => {
          setPinDialogOpen(false)
          setResourceToPin(null)
        },
      })
    }
  }

  const handleStartReorder = () => {
    if (!canReorder) {
      toast.warning("Select a speciality to reorder resources")
      return
    }
    setReorderMode(true)
  }

  const handleReorderChange = (items: KnowledgeBaseResource[]) => {
    setReorderItems(items.map((item, index) => ({ ...item, display_order: index + 1 })))
  }

  const handleReorderCancel = () => {
    setReorderMode(false)
    setReorderItems([])
  }

  const handleReorderSave = () => {
    if (!canReorder || reorderItems.length === 0) {
      toast.warning("Nothing to reorder")
      return
    }

    const resourceIds = reorderItems.map((item) => item.id)
    reorderResources(
      { specialityId: selectedSpeciality, resourceIds },
      {
        onSuccess: () => {
          toast.success("Resources reordered successfully!")
          handleReorderCancel()
        },
        onError: () => {
          toast.error("Failed to reorder resources")
        },
      }
    )
  }

  const isReorderViewLoading = reorderMode && (isReorderDataLoading || reorderItems.length === 0)

  const getContentTypeIcon = (type: ResourceContentType) => {
    const Icon = CONTENT_TYPE_ICONS[type]
    return <Icon className="h-4 w-4" />
  }

  const renderResourcesSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <div className="rounded-2xl border border-[var(--border)]/80 divide-y divide-[var(--border)] bg-[var(--card)]/70">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={`kb-row-skeleton-${idx}`} className="flex items-center gap-4 p-4">
            <Skeleton className="h-24 w-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-80" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[var(--foreground)]"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-medium">
            Admin Portal / Content Management
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              Knowledge Base Resources
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-2xl">
              Manage educational resources, videos, PDFs, and articles for patient education
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleStartReorder}
              disabled={!canReorder}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Reorder Resources
            </Button>
            <Button
              onClick={handleCreateClick}
              className="bg-gradient-to-r bg-[var(--foreground)] to-[var(--foreground)]/90 hover:from-[var(--foreground)]/90 hover:to-[var(--foreground)]/80 text-white shadow-lg shadow-[var(--foreground)]/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex w-full gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={selectedSpeciality} onValueChange={setSelectedSpeciality}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specialities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All Specialities</SelectItem>
                  {specialities.map((spec) => (
                    <SelectItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="recipe">Recipe</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="external_link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-[var(--border)]">
          <CardTitle className="text-lg font-bold text-[var(--foreground)]">
            Resources
            {isLoading && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {reorderMode ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/70 p-5">
                <h3 className="text-base font-semibold text-[var(--foreground)]">Reorder Resources</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Drag and drop resources to update their display order for the selected speciality.
                </p>
              </div>
              {isReorderViewLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : reorderItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/70 p-8 text-center">
                  <p className="text-sm text-[var(--muted-foreground)]">No resources available to reorder for this filter.</p>
                </div>
              ) : (
                <DraggableList
                  items={reorderItems}
                  onReorder={handleReorderChange}
                  getItemId={(item) => item.id}
                  renderItem={(item, index) => (
                    <div className="flex w-full items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">#{index + 1} {item.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">{item.description || "No description"}</p>
                      </div>
                      <Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge>
                    </div>
                  )}
                />
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleReorderCancel} disabled={isReordering}>
                  Cancel
                </Button>
                <Button onClick={handleReorderSave} disabled={isReordering || reorderItems.length === 0}>
                  {isReordering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Order
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            renderResourcesSkeleton()
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-[var(--muted-foreground)] mb-4">No resources found</p>
              <Button onClick={handleCreateClick} className="bg-gradient-to-r bg-[var(--foreground)] to-[var(--foreground)]/90 hover:from-[var(--foreground)]/90 hover:to-[var(--foreground)]/80 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create First Resource
              </Button>
            </div>
          ) : (
            <div>
              <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card)]">
                <Table>
                    <TableHeader>
                      <TableRow className="bg-[var(--muted)]">
                        <TableHead className="w-32">Type</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dashboard</TableHead>
                        <TableHead className="text-right w-40">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources.map((resource) => {
                        return (
                          <TableRow
                            key={resource.id}
                            onClick={() => handleRowClick(resource)}
                            className="cursor-pointer transition-colors hover:bg-[var(--muted)]"
                          >
                            <TableCell>
                              {/* <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
                                  {getContentTypeIcon(resource.content_type)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[var(--foreground)] capitalize">
                                    {resource.content_type.replace("_", " ")}
                                  </p>
                                  <p className="text-xs text-[var(--muted-foreground)]">
                                    #{resource.display_order ?? "-"}
                                  </p>
                                </div>
                              </div> */}
                              <div className="w-24 h-24">
                                <MediaRenderer 
                                  url={resource.resource_url} 
                                  contentType={resource.content_type}
                                  thumbnail_url={resource.thumbnail_url}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-[400px]">
                                <p className="font-medium text-[var(--foreground)] line-clamp-1">{resource.title}</p>
                                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 truncate">
                                  {resource.description || "No description"}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                                  <span className="uppercase">{resource.language_code || "EN"}</span>
                                  <span className="h-3 w-px bg-[var(--border)]" />
                                  <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={resource.status === "active" ? "default" : "secondary"}
                                className={
                                  resource.status === "active"
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : "bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]"
                                }
                              >
                                {resource.status}
                              </Badge>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant={resource.pin_for_dashboard ? "default" : "outline"}
                                size="sm"
                                disabled={isTogglingPin}
                                onClick={() => handleTogglePinClick(resource.id, !!resource.pin_for_dashboard)}
                                className={cn(
                                  "h-8 gap-2 transition-all duration-300",
                                  resource.pin_for_dashboard 
                                    ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" 
                                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                                )}
                              >
                                <Pin className={cn("h-3.5 w-3.5", resource.pin_for_dashboard && "fill-current")} />
                                {resource.pin_for_dashboard ? "On Dashboard" : "Set as Dashboard"}
                              </Button>
                            </TableCell>
                           
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditClick(resource.id)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleStatusClick(resource.id, resource.status)
                                  }}
                                >
                                  {resource.status === "active" ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteClick(resource.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-rose-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

              {pagination && totalItems > 0 && (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-4">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Page {currentPage} of {totalPages} · Showing {currentCount} resources (total {totalItems})
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog  open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resource? This action can be reversed later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Confirmation Dialog */}
      <Dialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toggle Resource Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change this resource status to{" "}
              <strong>{resourceToToggle?.currentStatus === "active" ? "inactive" : "active"}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToggleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmToggleStatus}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Pin Confirmation Dialog */}
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resourceToPin?.currentPinStatus ? "Unpin Resource" : "Pin Resource"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {resourceToPin?.currentPinStatus ? "remove this resource from" : "add this resource to"} the dashboard?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPinDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmTogglePin} disabled={isTogglingPin}>
              {isTogglingPin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Resource Drawer */}
      <Drawer direction="right" open={viewDrawerOpen} onOpenChange={setViewDrawerOpen}>
        <DrawerContent className="w-lg">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              {viewResource && getContentTypeIcon(viewResource.content_type)}
              {viewResource?.title || "Resource Details"}
            </DrawerTitle>
            <DrawerDescription>
              {viewResource?.description || "View resource details and content"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-6 pb-6 overflow-y-auto">
            {viewResource && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--muted-foreground)] mb-1">Content Type</p>
                    <Badge variant="outline" className="capitalize">
                      {viewResource.content_type.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)] mb-1">Status</p>
                    <Badge
                      variant={viewResource.status === "active" ? "default" : "secondary"}
                      className={
                        viewResource.status === "active"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]"
                      }
                    >
                      {viewResource.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)] mb-1">Display Order</p>
                    <p className="font-medium">#{viewResource.display_order ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)] mb-1">Language</p>
                    <p className="font-medium uppercase">{viewResource.language_code || "EN"}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)] mb-1">Created</p>
                    <p className="font-medium">{new Date(viewResource.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {viewResource.resource_url && (
                  <div className="space-y-3">
                    <p className="text-[var(--muted-foreground)] text-sm">Content Preview</p>
                    <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--muted)]/50">
                      {renderPreviewContent(viewResource)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DrawerFooter className="border-t">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (viewResource) {
                    setPreviewResource(viewResource)
                    setPreviewDialogOpen(true)
                  }
                }}
              >
                Expand Preview
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (viewResource) {
                    handleEditClick(viewResource.id)
                    setViewDrawerOpen(false)
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Resource
              </Button>
            </div>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewResource && getContentTypeIcon(previewResource.content_type)}
              {previewResource?.title || "Resource Preview"}
            </DialogTitle>
            <DialogDescription>
              {previewResource?.description || "Preview of the resource content"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {renderPreviewContent(previewResource)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            {previewResource?.resource_url && (
              <Button
                onClick={() => window.open(previewResource.resource_url, "_blank")}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Open Original
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
