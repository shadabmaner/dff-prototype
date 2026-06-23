"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, Pencil, Trash2, GripVertical, ArrowLeft, Video, FileText, Image, Headphones, Link as LinkIcon, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  useCollectionById,
  useDeleteCollectionItem,
  useReorderCollectionItems,
} from "@/hooks/use-collections"
import type { CollectionItem } from "@/types/collection-api"
import Link from "next/link"
import { CollectionItemViewDrawer } from "@/components/collections/collection-item-view-drawer"
import { Skeleton } from "@/components/ui/skeleton"

function SortableItem({ item, onView, onEdit, onDelete }: { 
  item: CollectionItem
  onView: (item: CollectionItem) => void
  onEdit: (item: CollectionItem) => void
  onDelete: (item: CollectionItem) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const MediaIcon = {
    video: Video,
    pdf: FileText,
    image: Image,
    audio: Headphones,
    link: LinkIcon,
  }[item.media_type] || Video

  const renderMediaPreview = () => {
    if (item.media_type === "video" && item.media_url) {
      return (
        <div className="relative w-32 h-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-950/70">
          <video
            src={item.media_url}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            controls={false}
            poster={item.thumbnail_url || undefined}
          />
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 text-[10px] font-semibold text-white">
            Preview
          </span>
        </div>
      )
    }

    if (item.media_type === "image" && (item.thumbnail_url || item.media_url)) {
      return (
        <div className="w-32 h-20 overflow-hidden rounded-xl border border-slate-200">
          <img
            src={item.thumbnail_url || item.media_url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      )
    }

    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
        <MediaIcon className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-shrink-0">
        {renderMediaPreview()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 truncate">{item.title}</h3>
          {!item.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
        </div>
        {item.description && (
          <p className="text-sm text-slate-600 truncate mt-1">{item.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          {item.step_label && (
            <span className="px-2 py-1 bg-slate-100 rounded font-medium">{item.step_label}</span>
          )}
          {item.duration_seconds && (
            <span className="font-medium">{Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, '0')}</span>
          )}
          <Badge variant="outline" className="text-xs capitalize">{item.media_type}</Badge>
          {item.media_source === "s3" && <Badge variant="outline" className="text-xs">S3</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(item)}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(item)}
          className="text-slate-700 border-slate-300 hover:bg-slate-50"
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(item)}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete
        </Button>
      </div>
    </div>
  )
}

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<CollectionItem | null>(null)
  const [items, setItems] = React.useState<CollectionItem[]>([])
  const [viewDrawerOpen, setViewDrawerOpen] = React.useState(false)
  const [itemToView, setItemToView] = React.useState<CollectionItem | null>(null)

  const { data: collectionData, isLoading } = useCollectionById(collectionId)
  const deleteMutation = useDeleteCollectionItem()
  const reorderMutation = useReorderCollectionItems()

  const collection = collectionData?.data

  React.useEffect(() => {
    if (collection?.items) {
      setItems([...collection.items].sort((a, b) => a.display_order - b.display_order))
    }
  }, [collection?.items])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const reorderedItems = arrayMove(items, oldIndex, newIndex)

        const order = reorderedItems.map((item, index) => ({
          id: item.id,
          display_order: index + 1,
        }))

        reorderMutation.mutate({
          collectionId,
          payload: { order },
        })

        return reorderedItems
      })
    }
  }

  const handleAddClick = () => {
    router.push(`/dashboard/admin/exercise-content/${collectionId}/items/new`)
  }

  const handleViewClick = (item: CollectionItem) => {
    setItemToView(item)
    setViewDrawerOpen(true)
  }

  const handleEditClick = (itemId: string) => {
    router.push(`/dashboard/admin/exercise-content/${collectionId}/items/${itemId}/edit`)
  }

  const handleDeleteClick = (item: CollectionItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id)
      setItemToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-32" />
          </div>
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={`chip-${idx}`} className="h-6 w-32 rounded-full" />
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/80 shadow-lg overflow-hidden">
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`item-skeleton-${idx}`} className="flex items-center gap-4 rounded-xl border border-slate-100/80 bg-white/70 p-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-20 w-32 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-80" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500">Collection not found</p>
        <Link href="/dashboard/admin/exercise-content">
          <Button className="mt-4">Back to Collections</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/dashboard/admin/exercise-content">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Admin Portal / Content Management / Collection Items
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{collection.name}</h1>
            {collection.description && (
              <p className="text-sm text-slate-600 mt-2">{collection.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/admin/exercise-content/${collectionId}/analytics`}>
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                Analytics
              </Button>
            </Link>
            <Button onClick={handleAddClick} className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Collection Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Items:</span>
            <Badge variant="secondary" className="font-semibold">{items.length}</Badge>
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Collection Unlock:</span>
            <Badge variant="outline" className="capitalize">{collection.collection_unlock_strategy.replace(/_/g, " ")}</Badge>
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Item Unlock:</span>
            <Badge variant="outline" className="capitalize">{collection.item_unlock_strategy.replace(/_/g, " ")}</Badge>
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Status:</span>
            {collection.is_active ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
            ) : (
              <Badge className="bg-slate-50 text-slate-700 border-slate-200">Inactive</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/80 shadow-lg overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-slate-500 mb-4">No items in this collection</p>
            <Button onClick={handleAddClick} className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {items.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      onView={handleViewClick}
                      onEdit={(item) => handleEditClick(item.id)}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Item"
        description={`Are you sure you want to delete "${itemToDelete?.title}"?`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <CollectionItemViewDrawer
        open={viewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
        item={itemToView}
      />
    </div>
  )
}

