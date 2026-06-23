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

export default function CollectionsPage() {
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
    <div className="flex flex-col h-full">
      <div className="border-b bg-[var(--card)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Collections</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Manage media collection programs for patients
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/collections/reorder">
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reorder
              </Button>
            </Link>
            <Button onClick={handleCreateClick} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Speciality ID"
              value={specialityFilter}
              onChange={(e) => setSpecialityFilter(e.target.value)}
              className="w-64"
            />
          </div>
          <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
            <SelectTrigger className="w-40">
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

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[var(--muted-foreground)]">Loading collections...</div>
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-[var(--muted-foreground)]">No collections found</p>
            <Button onClick={handleCreateClick} className="mt-4" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create First Collection
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Unlock Strategy</TableHead>
                <TableHead>Item Unlock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">{collection.sort_order}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/admin/collections/${collection.id}`}
                      className="hover:underline font-medium text-[var(--primary)]"
                    >
                      {collection.name}
                    </Link>
                    {collection.description && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{collection.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{collection.item_count || 0} items</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {collection.collection_unlock_strategy.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="text-sm">
                    {collection.item_unlock_strategy.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell>
                    {collection.is_active ? (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    {new Date(collection.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(collection)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(collection)}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
