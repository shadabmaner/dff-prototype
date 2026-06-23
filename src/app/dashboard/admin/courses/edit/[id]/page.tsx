"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/admin/file-upload"

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "Weight Loss Program",
    duration: "12 weeks",
    price: "999",
    description: "Comprehensive weight loss program with personalized meal plans",
    priority: "1",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Updating Course ID:", id)
    console.log("Form Data:", formData)
    console.log("Image File:", imageFile)
    
    router.push("/dashboard/admin/courses")
  }

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
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <p className="text-muted-foreground mt-1">
              Update course information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

              <FileUpload
                label="Course Image *"
                accept="image/*"
                preview
                value="/placeholder-course.jpg"
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

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/admin/courses">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Update Course</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
