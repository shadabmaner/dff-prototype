"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Apple, Copy, Edit, Eye, Plus, Trash2, Search } from "lucide-react"
import { toast } from "sonner"

interface DietTemplate {
  id: string
  name: string
  description: string
  category: string
  duration: string
  calories: number
  createdDate: string
  usageCount: number
}

const templates: DietTemplate[] = [
  {
    id: "1",
    name: "Weight Loss Plan",
    description: "Balanced calorie-deficit plan for sustainable weight loss",
    category: "Weight Management",
    duration: "90 days",
    calories: 1500,
    createdDate: "Jan 15, 2026",
    usageCount: 45
  },
  {
    id: "2",
    name: "Obesity Program",
    description: "Comprehensive plan for obesity management with gradual calorie reduction",
    category: "Weight Management",
    duration: "180 days",
    calories: 1800,
    createdDate: "Dec 10, 2025",
    usageCount: 32
  },
  {
    id: "3",
    name: "PCOS Diet",
    description: "Low glycemic index diet optimized for PCOS management",
    category: "Hormonal Health",
    duration: "90 days",
    calories: 1600,
    createdDate: "Feb 1, 2026",
    usageCount: 28
  },
  {
    id: "4",
    name: "Diabetes Diet",
    description: "Blood sugar balancing diet for diabetes reversal",
    category: "Diabetes Management",
    duration: "120 days",
    calories: 1700,
    createdDate: "Jan 20, 2026",
    usageCount: 56
  },
  {
    id: "5",
    name: "Thyroid Care Plan",
    description: "Metabolism-supportive diet for thyroid health",
    category: "Hormonal Health",
    duration: "90 days",
    calories: 1650,
    createdDate: "Nov 5, 2025",
    usageCount: 21
  },
]

export function DietPlanTemplates() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<DietTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDuplicate = (template: DietTemplate) => {
    toast.success(`Template "${template.name}" duplicated`)
  }

  const handlePreview = (template: DietTemplate) => {
    setSelectedTemplate(template)
    setShowPreviewModal(true)
  }

  const handleAssignToPatient = () => {
    toast.success("Redirecting to patient selection...")
    setShowPreviewModal(false)
  }

  const handleCreateTemplate = () => {
    toast.success("New diet plan template created")
    setShowCreateModal(false)
  }

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diet Plan Templates</h2>
          <p className="text-muted-foreground">Pre-designed diet plans ready to customize and assign</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Apple className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">{template.category}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{template.duration}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Calories</p>
                  <p className="font-medium">{template.calories} kcal</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Used {template.usageCount} times
                </span>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handlePreview(template)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Diet Plan Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input placeholder="e.g., Keto Weight Loss Plan" />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input placeholder="e.g., Weight Management" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Brief description of the diet plan"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input placeholder="e.g., 90 days" />
              </div>
              <div className="space-y-2">
                <Label>Target Calories</Label>
                <Input type="number" placeholder="e.g., 1500" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedTemplate.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedTemplate.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Calories</p>
                  <p className="font-medium">{selectedTemplate.calories} kcal</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Times Used</p>
                  <p className="font-medium">{selectedTemplate.usageCount}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{selectedTemplate.description}</p>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Sample Day Structure</p>
                  <ul className="text-sm space-y-1">
                    <li>• Breakfast: 8:00 AM - 400 kcal</li>
                    <li>• Mid-Morning Snack: 10:30 AM - 150 kcal</li>
                    <li>• Lunch: 1:00 PM - 450 kcal</li>
                    <li>• Evening Snack: 4:00 PM - 150 kcal</li>
                    <li>• Dinner: 7:00 PM - 350 kcal</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Close
            </Button>
            <Button onClick={handleAssignToPatient}>
              Assign to Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
