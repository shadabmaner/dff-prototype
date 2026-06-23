"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/admin/file-upload"
import { FAQBuilder } from "@/components/admin/faq-builder"
import type { FAQ } from "@/types/admin"

export default function ModuleContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    recipeDescription: "",
  })
  const [files, setFiles] = useState({
    video: null as File | null,
    pdf: null as File | null,
    image: null as File | null,
    doc: null as File | null,
  })
  const [faqs, setFaqs] = useState<FAQ[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Form Data:", formData)
    console.log("Files:", files)
    console.log("FAQs:", faqs)
    
    // Navigate back after submission
    window.history.back()
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href={`/dashboard/admin/courses/manage/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold">Add Module Content</h1>
            <p className="text-muted-foreground mt-1">
              Create content for this module with resources
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card rounded-lg border p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Content Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter content name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter content description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Media Upload</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FileUpload
                    label="Video"
                    accept="video/*"
                    onChange={(file) => setFiles({ ...files, video: file })}
                  />
                  <FileUpload
                    label="PDF"
                    accept=".pdf"
                    onChange={(file) => setFiles({ ...files, pdf: file })}
                  />
                  <FileUpload
                    label="Image"
                    accept="image/*"
                    preview
                    onChange={(file) => setFiles({ ...files, image: file })}
                  />
                  <FileUpload
                    label="DOC File"
                    accept=".doc,.docx"
                    onChange={(file) => setFiles({ ...files, doc: file })}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-2 mb-4">
                  <Label htmlFor="recipe">Recipe Description (Optional)</Label>
                  <Textarea
                    id="recipe"
                    placeholder="Enter recipe description if applicable"
                    value={formData.recipeDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, recipeDescription: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">FAQ Section</h3>
                <FAQBuilder faqs={faqs} onChange={setFaqs} />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href={`/dashboard/admin/courses/manage/${id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Create Content</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
