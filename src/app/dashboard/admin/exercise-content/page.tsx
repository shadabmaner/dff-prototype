"use client"

import * as React from "react"
import { Plus, Pencil, Trash2, ArrowUpDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { CollectionFormDrawer } from "@/components/collections/collection-form-drawer"
import { useCollections, useDeleteCollection } from "@/hooks/use-collections"
import type { Collection } from "@/types/collection-api"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExerciseContentPage() {
  const [specialityFilter, setSpecialityFilter] = React.useState<string>("")
  const [isActiveFilter, setIsActiveFilter] = React.useState<string>("true")
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedCollection, setSelectedCollection] = React.useState<Collection | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [collectionToDelete, setCollectionToDelete] = React.useState<Collection | null>(null)

  const { data: collectionsData, isLoading } = useCollections({
    speciality_id: specialityFilter || undefined,
    is_active: isActiveFilter === "all" ? undefined : isActiveFilter === "true",
  })

  const deleteMutation = useDeleteCollection()

  const collections = collectionsData?.data || []

  const handleCreateClick = () => {
    setSelectedCollection(null)
    setDrawerOpen(true)
  }

  const handleEditClick = (collection: Collection) => {
    setSelectedCollection(collection)
    setDrawerOpen(true)
  }

  const handleDeleteClick = (collection: Collection) => {
    setCollectionToDelete(collection)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (collectionToDelete) {
      deleteMutation.mutate(collectionToDelete.id)
      setCollectionToDelete(null)
    }
  }

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
              Exercise Content
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-2xl">
              Manage media collection programs and unlock strategies for patient journeys
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/admin/exercise-content/reorder">
              <Button variant="outline" className="border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reorder Collections
              </Button>
            </Link>
            <Button onClick={handleCreateClick} className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)/80] hover:from-[var(--primary)/90] hover:to-[var(--primary)/70] text-white shadow-lg shadow-[var(--primary)]/20">
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] backdrop-blur-sm rounded-lg border border-[var(--border)] shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="search"
              value={specialityFilter}
              onChange={(e) => setSpecialityFilter(e.target.value)}
              className="bg-[var(--card)] border-[var(--border)]"
            />
          </div>
          <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
            <SelectTrigger className="w-40 bg-[var(--card)] border-[var(--border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active Only</SelectItem>
              <SelectItem value="false">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[var(--card)] backdrop-blur-sm rounded-lg border border-[var(--border)] shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-5">
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] bg-[var(--card)]/60">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`collection-skeleton-${idx}`} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-4 w-10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
              ))}
            </div>
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-[var(--muted-foreground)] mb-4">No collections found</p>
            <Button onClick={handleCreateClick} className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)/80] hover:from-[var(--primary)/90] hover:to-[var(--primary)/70] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create First Collection
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--muted)]/80 border-b border-[var(--border)]">
                  <TableHead className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Order</TableHead>
                  <TableHead className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Items</TableHead>
                  <TableHead className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Unlock Strategy</TableHead>
                  <TableHead className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Item Unlock</TableHead>
                  <TableHead className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Created</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-[var(--border)]">
                {collections.map((collection) => (
                  <TableRow key={collection.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <TableCell className="font-semibold text-[var(--foreground)]">{collection.sort_order}</TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/admin/exercise-content/${collection.id}`}
                        className="hover:underline font-semibold text-[var(--primary)]"
                      >
                        {collection.name}
                      </Link>
                      {collection.description && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-[280px] whitespace-normal break-words">{collection.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-semibold">{collection.item_count || 0} items</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--muted-foreground)] capitalize">
                      {collection.collection_unlock_strategy.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--muted-foreground)] capitalize">
                      {collection.item_unlock_strategy.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      {collection.is_active ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                      ) : (
                        <Badge className="bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--muted-foreground)]">
                      {new Date(collection.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(collection)}
                          className="text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(collection)}
                          className="text-[var(--destructive)] border-[var(--destructive)]/20 hover:bg-[var(--destructive)]/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CollectionFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        collection={selectedCollection}
        defaultSpecialityId={specialityFilter}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Collection"
        description={`Are you sure you want to delete "${collectionToDelete?.name}"? This will also delete all items in this collection.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
