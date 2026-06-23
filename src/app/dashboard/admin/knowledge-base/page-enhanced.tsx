"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DraggableList } from "@/components/admin/draggable-list"
import { SearchFilterBar } from "@/components/admin/search-filter-bar"
import { Pagination } from "@/components/admin/pagination"
import type { KnowledgeBase } from "@/types/admin"

const mockKnowledgeBase: KnowledgeBase[] = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  order: i + 1,
  name: `Knowledge Base Entry ${i + 1}`,
  description: `Description for entry ${i + 1}`,
  status: i % 3 === 0 ? "hidden" : "active",
  faqs: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}))

export default function KnowledgeBasePageEnhanced() {
  const [items, setItems] = useState(mockKnowledgeBase)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [items, searchQuery, statusFilter])

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredItems.slice(startIndex, endIndex)
  }, [filteredItems, currentPage, pageSize])

  const totalPages = Math.ceil(filteredItems.length / pageSize)

  const handleReorder = (reordered: KnowledgeBase[]) => {
    const startIndex = (currentPage - 1) * pageSize
    const updated = [...items]
    reordered.forEach((item, index) => {
      const originalIndex = items.findIndex(i => i.id === item.id)
      if (originalIndex !== -1) {
        updated[originalIndex] = { ...item, order: startIndex + index + 1 }
      }
    })
    setItems(updated)
  }

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "active" ? "hidden" : "active" }
          : item
      )
    )
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this knowledge base entry?")) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className="flex min-h-screen">
      
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Knowledge Base</h1>
              <p className="text-muted-foreground mt-1">
                Manage your knowledge base articles and resources
              </p>
            </div>
            <Link href="/dashboard/admin/knowledge-base/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Knowledge Base
              </Button>
            </Link>
          </div>

          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            placeholder="Search knowledge base..."
          />

          <div className="bg-card rounded-lg border p-6">
            <div className="mb-4">
              <div className="grid grid-cols-12 gap-4 px-12 py-2 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-1">Order</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            {paginatedItems.length > 0 ? (
              <>
                <DraggableList
                  items={paginatedItems}
                  onReorder={handleReorder}
                  getItemId={(item) => item.id}
                  renderItem={(item, index) => (
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 text-sm text-muted-foreground">
                        #{item.order}
                      </div>
                      <div className="col-span-3">
                        <h3 className="font-medium">{item.name}</h3>
                      </div>
                      <div className="col-span-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Badge
                          variant={item.status === "active" ? "default" : "secondary"}
                        >
                          {item.status === "active" ? "Active" : "Hidden"}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <Link href={`/dashboard/admin/knowledge-base/edit/${item.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(item.id)}
                        >
                          {item.status === "active" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredItems.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "No results found"
                    : "No knowledge base entries yet"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Link href="/dashboard/admin/knowledge-base/create">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Entry
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
