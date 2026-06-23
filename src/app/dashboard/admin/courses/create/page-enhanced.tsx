"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EnhancedFileUpload } from "@/components/admin/enhanced-file-upload"
import { useToast } from "@/components/ui/use-toast"

export default function CreateCoursePageEnhanced() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: "",
    description: "",
    priority: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault()
    setIsSaving(true)

    setTimeout(() => {
      console.log("Form Data:", formData)
      console.log("Image File:", imageFile)
      console.log("Status:", asDraft ? "draft" : "active")
      
      toast({
        title: asDraft ? "Draft Saved" : "Course Created",
        description: asDraft 
          ? "Your course has been saved as a draft" 
          : "Course has been created successfully",
      })
      
      setIsSaving(false)
      
      if (!asDraft) {
        router.push("/dashboard/admin/courses")
      }
    }, 1000)
  }

  const handleSaveDraft = (e: React.FormEvent) => {
    handleSubmit(e, true)
  }

  const isFormValid = formData.name && formData.duration && formData.price && formData.description

  return (
    <div className="flex min-h-screen">
      
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard/admin/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold">Create Course</h1>
            <p className="text-muted-foreground mt-1">
              Add a new course to your platform
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            <div className="bg-card rounded-lg border p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter course name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <EnhancedFileUpload
                label="Course Image *"
                accept="image/*"
                preview
                onChange={(file) => setImageFile(file)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 12 weeks"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 999"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter course description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="e.g., 1"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Lower number = higher priority in listing
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving || !formData.name}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>

              <div className="flex gap-3">
                <Link href="/dashboard/admin/courses">
                  <Button type="button" variant="outline" disabled={isSaving}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSaving || !isFormValid}>
                  {isSaving ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </div>
          </form>

          {formData.name && !isFormValid && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                💡 You can save this course as a draft to continue working on it later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
