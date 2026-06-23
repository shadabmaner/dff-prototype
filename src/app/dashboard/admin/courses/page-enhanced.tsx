"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, EyeOff, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchFilterBar } from "@/components/admin/search-filter-bar"
import { Pagination } from "@/components/admin/pagination"
import type { Course } from "@/types/admin"

const mockCourses: Course[] = Array.from({ length: 15 }, (_, i) => ({
  id: String(i + 1),
  name: `Course ${i + 1}`,
  image: "/placeholder-course.jpg",
  duration: "12 weeks",
  price: 999 + i * 100,
  description: `Description for course ${i + 1}`,
  priority: i + 1,
  status: i % 4 === 0 ? "draft" : i % 3 === 0 ? "hidden" : "active",
  modules: [],
  faqs: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}))

export default function CoursesPageEnhanced() {
  const [courses, setCourses] = useState(mockCourses)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || course.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [courses, searchQuery, statusFilter])

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredCourses.slice(startIndex, endIndex)
  }, [filteredCourses, currentPage, pageSize])

  const totalPages = Math.ceil(filteredCourses.length / pageSize)

  const handleToggleStatus = (id: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === id
          ? { ...course, status: course.status === "active" ? "hidden" : "active" }
          : course
      )
    )
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      setCourses((prev) => prev.filter((course) => course.id !== id))
    }
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default"
      case "draft": return "secondary"
      case "hidden": return "outline"
      default: return "secondary"
    }
  }

  return (
    <div className="flex min-h-screen">
      
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Course Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your courses, modules, and course content
              </p>
            </div>
            <Link href="/dashboard/admin/courses/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>

          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            placeholder="Search courses..."
          />

          {paginatedCourses.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                {paginatedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={course.image}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        variant={getStatusColor(course.status) as any}
                        className="absolute top-2 right-2 capitalize"
                      >
                        {course.status}
                      </Badge>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{course.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration: </span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">₹</span>
                          <span className="font-medium">{course.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Priority: </span>
                          <span className="font-medium">{course.priority}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Modules: </span>
                          <span className="font-medium">{course.modules.length}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Link
                          href={`/dashboard/admin/courses/manage/${course.id}`}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </Link>
                        <Link href={`/dashboard/admin/courses/edit/${course.id}`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleStatus(course.id)}
                        >
                          {course.status === "active" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredCourses.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No results found"
                  : "No courses yet"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link href="/dashboard/admin/courses/create">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
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
