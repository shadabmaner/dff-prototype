"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchFilterBar } from "@/components/admin/search-filter-bar"
import { Pagination } from "@/components/admin/pagination"
import type { Exercise } from "@/types/admin"

const mockExercises: any[] = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  name: `Exercise ${i + 1}`,
  description: `Description for exercise ${i + 1}`,
  coverImage: "/placeholder-exercise.jpg",
  months: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}))

export default function ExerciseContentPageEnhanced() {
  const [exercises, setExercises] = useState(mockExercises)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [exercises, searchQuery])

  const paginatedExercises = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredExercises.slice(startIndex, endIndex)
  }, [filteredExercises, currentPage, pageSize])

  const totalPages = Math.ceil(filteredExercises.length / pageSize)

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this exercise?")) {
      setExercises((prev) => prev.filter((exercise) => exercise.id !== id))
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
              <h1 className="text-3xl font-bold">Exercise Content</h1>
              <p className="text-muted-foreground mt-1">
                Manage exercises and monthly video content
              </p>
            </div>
            <Link href="/dashboard/admin/exercise-content/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Exercise
              </Button>
            </Link>
          </div>

          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search exercises..."
          />

          {paginatedExercises.length > 0 ? (
            <>
              <div className="grid gap-4 mb-6">
                {paginatedExercises.map((exercise) => (
                  <Link
                    key={exercise.id}
                    href={`/dashboard/admin/exercise-content/${exercise.id}`}
                    className="block"
                  >
                    <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={exercise.coverImage}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">
                            {exercise.name}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {exercise.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Months: <span className="font-medium">{exercise.months.length}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Videos: <span className="font-medium">
                                {exercise.months.reduce(
                                  (acc:any, month:any) => acc + month.videos.length,
                                  0
                                )}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                          <Link href={`/dashboard/admin/exercise-content/edit/${exercise.id}`}>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(exercise.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredExercises.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border">
              <p className="text-muted-foreground">
                {searchQuery ? "No results found" : "No exercises yet"}
              </p>
              {!searchQuery && (
                <Link href="/dashboard/admin/exercise-content/create">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Exercise
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
