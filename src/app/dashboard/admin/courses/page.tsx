"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Loader2, RefreshCw, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { coursesApi, Course, CreateCourseData, UpdateCourseData } from "@/lib/api/courses-client"
import { dropdownClient } from "@/lib/api/dropdown-client"
import { CourseFormDialog } from "@/components/admin/course-form-dialog"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [specialties, setSpecialties] = useState<Array<{ id: string; name: string }>>([])
  const [programs, setPrograms] = useState<Array<{ id: string; name: string }>>([])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    confirmText?: string
    variant?: "default" | "destructive"
    action: (() => Promise<void>) | null
  }>({ open: false, title: "", description: "", action: null, variant: "default" })
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    loadDropdowns()
    loadCourses()
  }, [currentPage, searchQuery, statusFilter, specialtyFilter])

  const loadDropdowns = async () => {
    try {
      const [specialtiesRes, programsRes] = await Promise.all([
        dropdownClient.getSpecialities(),
        dropdownClient.getPrograms({}),
      ])

      if (specialtiesRes.success) {
        setSpecialties(specialtiesRes.data.map(s => ({ id: s.id, name: s.name })))
      }
      if (programsRes.success) {
        setPrograms(programsRes.data.map(p => ({ id: p.id, name: p.name })))
      }
    } catch (error) {
      console.error("Failed to load dropdowns:", error)
    }
  }

  const loadCourses = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: 12,
      }

      if (searchQuery) params.search = searchQuery
      if (statusFilter !== "all") params.status = statusFilter
      if (specialtyFilter !== "all") params.specialityId = specialtyFilter

      const response = await coursesApi.list(params)
      setCourses(response.data)
      setTotalPages(response?.pagination?.totalPages)
      setTotalCourses(response?.pagination?.total)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (data: CreateCourseData) => {
    try {
      await coursesApi.create(data)
      toast.success("Course created successfully")
      loadCourses()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create course")
      throw error
    }
  }

  const handleUpdateCourse = async (data: UpdateCourseData) => {
    if (!selectedCourse) return
    console.log("Updating course:", typeof data?.display_order)
    try {
      await coursesApi.update(selectedCourse.id, data)
      toast.success("Course updated successfully")
      loadCourses()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update course")
      throw error
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await coursesApi.toggleStatus(id)
      toast.success("Course status updated successfully")
      loadCourses()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to toggle course status")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await coursesApi.delete(id)
      toast.success("Course deleted successfully")
      loadCourses()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete course")
    }
  }

  const requestConfirmation = (config: Omit<typeof confirmState, "open" | "action"> & { action: () => Promise<void> }) => {
    setConfirmState({
      ...confirmState,
      open: true,
      title: config.title,
      description: config.description,
      confirmText: config.confirmText,
      variant: config.variant ?? "default",
      action: config.action,
    })
  }

  const closeConfirmDialog = () => {
    if (confirmLoading) return
    setConfirmState((prev) => ({ ...prev, open: false, action: null }))
  }

  const executeConfirmedAction = async () => {
    if (!confirmState.action) return
    setConfirmLoading(true)
    try {
      await confirmState.action()
      setConfirmState((prev) => ({ ...prev, open: false, action: null }))
    } finally {
      setConfirmLoading(false)
    }
  }

  const openCreateDialog = () => {
    setSelectedCourse(null)
    setDialogMode("create")
    setDialogOpen(true)
  }

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course)
    setDialogMode("edit")
    setDialogOpen(true)
  }

  const renderCoursesSkeleton = () => (
    <div className="max-w-7xl">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`course-skeleton-${idx}`}
            className="bg-[var(--card)] backdrop-blur-sm rounded-lg border border-[var(--border)] overflow-hidden"
          >
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
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
              Course Management
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-2xl">
              Manage your courses, modules, and course content for patient education programs
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={loadCourses}
              variant="outline"
              className="bg-[var(--card)]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)/80] hover:from-[var(--primary)/90] hover:to-[var(--primary)/70] text-white shadow-lg shadow-[var(--primary)]/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] backdrop-blur-sm rounded-lg border border-[var(--border)] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: any) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={specialtyFilter}
            onValueChange={(value) => {
              setSpecialtyFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {totalCourses > 0 && (
          <p className="text-sm text-[var(--muted-foreground)] mt-3">
            Showing {courses.length} of {totalCourses} courses
          </p>
        )}
      </div>

      {loading ? (
        renderCoursesSkeleton()
      ) : (
        <>
          <div className="max-w-7xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-[var(--card)] backdrop-blur-sm rounded-lg border border-[var(--border)] overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video bg-muted relative">
                    {course.course_image ? (
                      <img
                        src={course.course_image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--muted)]">
                        <span className="text-[var(--muted-foreground)] text-sm">No image</span>
                      </div>
                    )}
                    <Badge
                      variant={course.status === "active" ? "default" : "secondary"}
                      className="absolute top-2 right-2 bg-[var(--foreground)]/80 text-white"
                    >
                      {course.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <Link href={`/dashboard/admin/courses/manage/${course.id}`}>
                        <h3 className="font-semibold text-lg text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {course.description || "No description"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      {(course.duration_number !== undefined && course.duration_unit) || course.display_order !== undefined ? (
                        <div className="flex flex-col gap-2">
                          {(course.duration_number !== undefined && course.duration_unit) && (
                            <div>
                              <span className="text-muted-foreground">Duration: </span>
                              <span className="font-medium">
                                {course.duration_number} {course.duration_unit}
                              </span>
                            </div>
                          )}
                          {course.display_order !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Order: </span>
                              <span className="font-medium">{course.display_order}</span>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          requestConfirmation({
                            title: course.status === "active" ? "Deactivate course?" : "Activate course?",
                            description: `This will ${course.status === "active" ? "hide" : "show"} "${course.title}" for learners. You can change it again later.`,
                            confirmText: course.status === "active" ? "Deactivate" : "Activate",
                            action: () => handleToggleStatus(course.id),
                          })
                        }
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
                        onClick={() =>
                          requestConfirmation({
                            title: "Delete course?",
                            description: `This will permanently remove "${course.title}" and its content. This action cannot be undone.`,
                            confirmText: "Delete",
                            variant: "destructive",
                            action: () => handleDelete(course.id),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {courses.length === 0 && (
              <div className="text-center py-12 bg-[var(--card)] backdrop-blur-sm rounded-lg border border-[var(--border)]">
                <p className="text-muted-foreground">No courses found</p>
                <Button
                  onClick={openCreateDialog}
                  className="mt-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)/80] hover:from-[var(--primary)/90] hover:to-[var(--primary)/70] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <CourseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === "create" ? handleCreateCourse : handleUpdateCourse}
        course={selectedCourse}
        specialties={specialties}
        programs={programs}
        mode={dialogMode}
      />

      <AlertDialog
        open={confirmState.open}
        onOpenChange={(open) => (open ? setConfirmState((prev) => ({ ...prev, open: true })) : closeConfirmDialog())}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmState.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmState.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmDialog} disabled={confirmLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirmedAction}
              disabled={confirmLoading}
              className={confirmState.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : undefined}
            >
              {confirmLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                confirmState.confirmText || "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
