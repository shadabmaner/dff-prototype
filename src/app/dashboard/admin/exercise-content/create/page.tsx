"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/admin/file-upload"

export default function CreateExercisePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Form Data:", formData)
    console.log("Cover Image:", coverImage)
    
    router.push("/dashboard/admin/exercise-content")
  }

  return (
    <div className="flex min-h-screen">
      
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard/admin/exercise-content">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Exercises
              </Button>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold">Create Exercise</h1>
            <p className="text-muted-foreground mt-1">
              Create a new exercise program
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card rounded-lg border p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Exercise Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter exercise name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Exercise Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter exercise description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <FileUpload
                label="Exercise Cover Image *"
                accept="image/*"
                preview
                onChange={(file) => setCoverImage(file)}
              />

              <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-sm font-medium">Next Steps</p>
                <p className="text-sm text-muted-foreground mt-1">
                  After creating the exercise, you'll be able to manage months and upload videos for each month.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/admin/exercise-content">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Create Exercise</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
