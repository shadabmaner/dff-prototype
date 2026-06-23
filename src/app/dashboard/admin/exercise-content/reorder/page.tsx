"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { GripVertical, ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCollections, useReorderCollections } from "@/hooks/use-collections"
import type { Collection } from "@/types/collection-api"
import Link from "next/link"

function SortableCollection({ collection }: { collection: Collection }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

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

      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 font-bold text-blue-600">
        {collection.sort_order}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900">{collection.name}</h3>
        {collection.description && (
          <p className="text-sm text-gray-500 truncate mt-1">{collection.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <Badge variant="secondary">{collection.item_count || 0} items</Badge>
          {collection.is_active ? (
            <Badge className="bg-green-500">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReorderCollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = React.useState<Collection[]>([])
  const [hasChanges, setHasChanges] = React.useState(false)

  const { data: collectionsData, isLoading } = useCollections({ is_active: true })
  const reorderMutation = useReorderCollections()

  React.useEffect(() => {
    if (collectionsData?.data) {
      setCollections([...collectionsData.data].sort((a, b) => a.sort_order - b.sort_order))
    }
  }, [collectionsData?.data])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCollections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const reorderedItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          sort_order: index + 1,
        }))

        setHasChanges(true)
        return reorderedItems
      })
    }
  }

  const handleSave = async () => {
    const order = collections.map((collection) => ({
      id: collection.id,
      sort_order: collection.sort_order,
    }))

    await reorderMutation.mutateAsync({ order })
    setHasChanges(false)
    router.push("/dashboard/admin/exercise-content")
  }

  const handleCancel = () => {
    router.push("/dashboard/admin/exercise-content")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading collections...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={handleCancel} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Admin Portal / Content Management / Reorder
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Reorder Collections</h1>
            <p className="text-sm text-slate-600 mt-2">
              Drag and drop collections to change their display order
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleCancel} className="border-slate-300 text-slate-700 hover:bg-slate-50">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || reorderMutation.isPending} className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <Save className="h-4 w-4 mr-2" />
              {reorderMutation.isPending ? "Saving..." : "Save Order"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/80 shadow-lg overflow-hidden">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-slate-500 mb-4">No active collections to reorder</p>
            <Link href="/dashboard/admin/exercise-content">
              <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white">Go to Collections</Button>
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={collections.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {collections.map((collection) => (
                    <SortableCollection key={collection.id} collection={collection} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {hasChanges && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  You have unsaved changes. Click "Save Order" to apply the new order.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
