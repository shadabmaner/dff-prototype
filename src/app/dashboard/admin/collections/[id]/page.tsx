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
import { Plus, Pencil, Trash2, GripVertical, ArrowLeft, Video, FileText, Image, Headphones, Link as LinkIcon} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { CollectionItemFormDrawer } from "@/components/collections/collection-item-form-drawer"
import {
  useCollectionById,
  useDeleteCollectionItem,
  useReorderCollectionItems,
} from "@/hooks/use-collections"
import type { CollectionItem } from "@/types/collection-api"
import Link from "next/link"

function SortableItem({ item, onEdit, onDelete }: { 
  item: CollectionItem
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
        <MediaIcon className="h-5 w-5 text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
          {!item.is_active && <Badge variant="secondary">Inactive</Badge>}
        </div>
        {item.description && (
          <p className="text-sm text-gray-500 truncate mt-1">{item.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {item.step_label && (
            <span className="px-2 py-1 bg-gray-100 rounded">{item.step_label}</span>
          )}
          {item.duration_seconds && (
            <span>{Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, '0')}</span>
          )}
          <span className="capitalize">{item.media_type}</span>
          {item.media_source === "s3" && <Badge variant="outline" className="text-xs">S3</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  )
}

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params?.id as string

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<CollectionItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<CollectionItem | null>(null)
  const [items, setItems] = React.useState<CollectionItem[]>([])

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
    setSelectedItem(null)
    setDrawerOpen(true)
  }

  const handleEditClick = (item: CollectionItem) => {
    setSelectedItem(item)
    setDrawerOpen(true)
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading collection...</div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500">Collection not found</p>
        <Link href="/dashboard/admin/collections">
          <Button className="mt-4">Back to Collections</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/dashboard/admin/collections">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
            {collection.description && (
              <p className="text-sm text-gray-500 mt-1">{collection.description}</p>
            )}
          </div>
          <Button onClick={handleAddClick} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Items:</span>
            <Badge variant="secondary">{items.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Collection Unlock:</span>
            <Badge>{collection.collection_unlock_strategy.replace(/_/g, " ")}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Item Unlock:</span>
            <Badge>{collection.item_unlock_strategy.replace(/_/g, " ")}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Status:</span>
            {collection.is_active ? (
              <Badge className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500">No items in this collection</p>
            <Button onClick={handleAddClick} className="mt-4" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 max-w-4xl">
                {items.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <CollectionItemFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        collectionId={collectionId}
        item={selectedItem}
      />

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
    </div>
  )
}
