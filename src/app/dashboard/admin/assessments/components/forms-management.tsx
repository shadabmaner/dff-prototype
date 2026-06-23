"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  useFormsBySpeciality,
  useQuestionsBySpeciality,
  useCreateForm,
  useUpdateForm,
  useDeleteForm,
  useLinkQuestionsToForm,
  useActivateForm,
  useFormById,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useUpdateFormQuestion,
  useSections,
} from "@/hooks/use-assessment"
import { useSpecialitiesQuery } from "@/hooks/use-specialities"
import { Plus, Edit, Trash2, Loader2, FormInput, CheckCircle2, Circle, List, Settings2, Info } from "lucide-react"
import { toast } from "sonner"
import type { AssessmentForm, CreateFormRequest } from "@/types/assessment"

function QuestionCard({ question, index }: { question: any, index: number }) {
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm ring-1 ring-slate-100 group transition-all hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-600 text-xs font-black shadow-inner border border-blue-100">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-black text-sm text-slate-900 tracking-tight">
              {question.label}
            </p>
            {question.required && (
              <Badge variant="outline" className="h-5 px-1.5 text-[8px] font-black uppercase text-red-600 bg-red-50 border-red-100">
                Required
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{question.field_key}</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">{question.type}</span>
          </div>
          {question.options && question.options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              {question.options
                .sort((a: any, b: any) => a.display_order - b.display_order)
                .map((option: any) => (
                  <div key={option.id} className="flex items-center gap-2 text-xs text-slate-600 font-bold bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                    <Circle className="h-1.5 w-1.5 text-blue-400 fill-blue-400" />
                    {option.option_text}
                  </div>
                ))}
            </div>
          )}
          {question.validation_json?.allow_other && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 text-[9px] font-black uppercase">
                "Other" Supported
              </Badge>
              {question.validation_json?.other_description_required && (
                <Badge variant="outline" className="border-slate-200 text-slate-500 text-[9px] font-black uppercase">
                  Details Required
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FormsManagement() {
  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<AssessmentForm | null>(null)
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null)
  const [linkingQuestionsFor, setLinkingQuestionsFor] = useState<AssessmentForm | null>(null)
  const [viewingForm, setViewingForm] = useState<AssessmentForm | null>(null)
  const [managingSectionsFor, setManagingSectionsFor] = useState<AssessmentForm | null>(null)

  const { data: specialitiesResponse, isLoading: loadingSpecialities } = useSpecialitiesQuery()
  const { data: formsResponse, isLoading: loadingForms } = useFormsBySpeciality(selectedSpeciality)
  const { data: questionsResponse } = useQuestionsBySpeciality(selectedSpeciality)
  const createMutation = useCreateForm()
  const updateMutation = useUpdateForm()
  const deleteMutation = useDeleteForm()
  const activateMutation = useActivateForm()

  const specialities = specialitiesResponse?.data || []
  const forms = Array.isArray((formsResponse as any)?.data?.data) ? (formsResponse as any).data.data : []
  const questions = Array.isArray((questionsResponse as any)?.data?.data) ? (questionsResponse as any).data.data : []

  const [formData, setFormData] = useState<CreateFormRequest>({
    speciality_id: "",
    name: "",
    version: 1,
    metadata: {},
  })

  const resetForm = () => {
    setFormData({
      speciality_id: selectedSpeciality || "",
      name: "",
      version: 1,
      metadata: {},
    })
  }

  const handleOpenDrawer = () => {
    resetForm()
    setEditingForm(null)
    setIsDrawerOpen(true)
  }

  const handleOpenEditDrawer = (form: AssessmentForm) => {
    setEditingForm(form)
    setFormData({
      speciality_id: form.speciality_id,
      name: form.name,
      version: form.version,
      metadata: form.metadata || {},
    })
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setEditingForm(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.speciality_id) {
      toast.error("Please select a speciality")
      return
    }

    if (!formData.name.trim()) {
      toast.error("Please enter a form name")
      return
    }

    try {
      if (editingForm) {
        await updateMutation.mutateAsync({ formId: editingForm.id, data: formData })
        toast.success("Form updated successfully")
      } else {
        await createMutation.mutateAsync(formData)
        toast.success("Form created successfully")
      }
      handleCloseDrawer()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save form")
    }
  }

  const handleDelete = async () => {
    if (!deleteFormId) return

    try {
      await deleteMutation.mutateAsync(deleteFormId)
      toast.success("Form deleted successfully")
      setDeleteFormId(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete form")
    }
  }

  const handleActivate = async (formId: string) => {
    try {
      await activateMutation.mutateAsync(formId)
      toast.success("Form activated successfully")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to activate form")
    }
  }

  return (
    <div className="space-y-8">
      {/* Speciality Selector */}
      <Card className="border-0 shadow-xl bg-white overflow-hidden rounded-2xl">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <FormInput className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 tracking-tight">Clinical Speciality</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Select a speciality to manage forms</p>
            </div>
          </div>
          <Select value={selectedSpeciality || ""} onValueChange={setSelectedSpeciality}>
            <SelectTrigger className="w-full max-w-md bg-slate-50/50 border-2 border-slate-200 h-12 shadow-sm focus:border-emerald-600 font-bold transition-all rounded-xl">
              <SelectValue placeholder="Select clinical speciality..." />
            </SelectTrigger>
            <SelectContent>
              {loadingSpecialities ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    <span className="font-bold">Loading specialities...</span>
                  </div>
                </SelectItem>
              ) : (
                specialities.map((speciality) => (
                  <SelectItem key={speciality.id} value={speciality.id}>
                    {speciality.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSpeciality && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Form Builder</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{forms.length} forms configured</p>
            </div>
            <Button 
              onClick={handleOpenDrawer} 
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-black shadow-xl shadow-slate-900/20 h-11 px-6 rounded-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Form
            </Button>
          </div>

          {loadingForms ? (
            <Card className="border-0 shadow-xl bg-white rounded-2xl">
              <CardContent className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[72px] w-full animate-pulse rounded-xl bg-slate-100" />
                ))}
              </CardContent>
            </Card>
          ) : !forms || forms.length === 0 ? (
            <Card className="border border-dashed border-slate-200 bg-white shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 rounded-2xl bg-slate-900/90 flex items-center justify-center mb-6 shadow-inner shadow-white/10">
                  <FormInput className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No Forms Found</h3>
                <p className="text-sm text-slate-500 mt-2 mb-8 max-w-md font-medium">Create your first clinical assessment form to start gathering structured patient data.</p>
                <Button onClick={handleOpenDrawer} variant="outline" className="border-slate-300 px-8 h-11 rounded-xl font-black hover:bg-slate-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Form
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {forms.map((form: AssessmentForm, index: number) => (
                  <motion.div
                    key={form.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Card className={cn(
                      "border-0 shadow-lg bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all group relative",
                      "ring-1 ring-slate-200/50"
                    )}>
                      <div className={cn(
                        "absolute left-0 top-0 h-full w-1.5",
                        form.is_active ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      <CardContent className="p-5 pl-6">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0",
                              form.is_active 
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white" 
                                : "bg-gradient-to-br from-slate-400 to-slate-500 text-white"
                            )}>
                              <FormInput className="h-6 w-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-1.5">
                                <h3 className="text-base font-black text-slate-900 truncate tracking-tight">
                                  {form.name}
                                </h3>
                                {form.is_active ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700 uppercase tracking-widest shrink-0">
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    Live
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                                    Draft
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Version</span>
                                  <span className="text-slate-900 font-black bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">v{form.version}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <List className="h-3 w-3 text-blue-500" />
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Questions</span>
                                  <span className="text-blue-600 font-black text-[11px]">{form.questions?.length || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all"
                                onClick={() => setViewingForm(form)}
                                title="View Preview"
                              >
                                <List className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                                onClick={() => setLinkingQuestionsFor(form)}
                                title="Manage Questions"
                              >
                                <Settings2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
                                onClick={() => handleOpenEditDrawer(form)}
                                title="Edit Form"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all"
                                onClick={() => setManagingSectionsFor(form)}
                                title="Manage Sections"
                              >
                                <List className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-slate-300 hover:bg-white hover:text-rose-600 hover:shadow-sm transition-all"
                                onClick={() => setDeleteFormId(form.id)}
                                title="Delete Form"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {!form.is_active && (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-black text-xs h-9 px-5 rounded-lg shadow-lg shadow-slate-900/20"
                                onClick={() => handleActivate(form.id)}
                                disabled={activateMutation.isPending}
                              >
                                {activateMutation.isPending && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                                Publish
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      <Sheet open={isDrawerOpen} onOpenChange={handleCloseDrawer}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <SheetHeader>
              <SheetTitle>{editingForm ? "Edit Form" : "Create New Form"}</SheetTitle>
              <SheetDescription>
                {editingForm
                  ? "Update the form details below"
                  : "Add a new assessment form"}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="speciality">
                  Speciality <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.speciality_id}
                  onValueChange={(value) => setFormData({ ...formData, speciality_id: value })}
                  disabled={!!editingForm}
                >
                  <SelectTrigger id="speciality">
                    <SelectValue placeholder="Select a speciality" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialities.map((speciality) => (
                      <SelectItem key={speciality.id} value={speciality.id}>
                        {speciality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Form Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Initial Health Assessment"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  type="number"
                  min="1"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={(formData.metadata as any)?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, description: e.target.value },
                    })
                  }
                  placeholder="Brief description of the form"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_time">Estimated Time (Optional)</Label>
                <Input
                  id="estimated_time"
                  value={(formData.metadata as any)?.estimated_time || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, estimated_time: e.target.value },
                    })
                  }
                  placeholder="e.g., 10 minutes"
                />
              </div>

              {!editingForm && (
                <div className="mt-4 flex items-start gap-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
              <Info className="h-4 w-4 text-blue-500 mt-1" />
              <p className="text-[11px] font-bold text-blue-600 leading-relaxed">
                After creating this form, you can <span className="underline">manage sections</span> and link questions to it by clicking the action icons on the form card.
              </p>
            </div>
              )}
            </div>

            <SheetFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDrawer}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingForm ? "Update" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteFormId} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form and all its configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {linkingQuestionsFor && (
        <QuestionLinker
          form={linkingQuestionsFor}
          questions={questions}
          onClose={() => setLinkingQuestionsFor(null)}
        />
      )}

      {viewingForm && (
        <FormViewer form={viewingForm} onClose={() => setViewingForm(null)} />
      )}

      {managingSectionsFor && (
        <SectionManager
          form={managingSectionsFor}
          onClose={() => setManagingSectionsFor(null)}
        />
      )}
    </div>
  )
}

function SectionManager({
  form,
  onClose,
}: {
  form: AssessmentForm
  onClose: () => void
}) {
  const { data: formResponse, isLoading } = useFormById(form.id)
  const formDetails = (formResponse as any)?.data?.data || (formResponse as any)?.data
  
  const { data: sectionsResponse, isLoading: isLoadingSections } = useSections(form.id)
  const sectionsList = Array.isArray((sectionsResponse as any)?.data?.data) 
    ? (sectionsResponse as any).data.data 
    : (Array.isArray((sectionsResponse as any)?.data) ? (sectionsResponse as any).data : [])
  
  const [newSectionName, setNewSectionName] = useState("")
  const [newSectionOrder, setNewSectionOrder] = useState<number>(1)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editSectionName, setEditSectionName] = useState("")
  const [editSectionOrder, setEditSectionOrder] = useState<number>(1)

  // Update newSectionOrder when sectionsList changes
  useEffect(() => {
    if (sectionsList.length > 0) {
      const maxOrder = Math.max(...sectionsList.map((s: any) => s.display_order || 0))
      setNewSectionOrder(maxOrder + 1)
    } else {
      setNewSectionOrder(1)
    }
  }, [sectionsList])

  const createSection = useCreateSection(form.id)
  const updateSection = useUpdateSection(form.id)
  const deleteSection = useDeleteSection(form.id)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSectionName.trim()) return
    try {
      await createSection.mutateAsync({
        form_id: form.id,
        name: newSectionName,
        display_order: newSectionOrder,
      })
      setNewSectionName("")
      toast.success("Section created")
    } catch (error) {
      toast.error("Failed to create section")
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editSectionName.trim()) return
    try {
      await updateSection.mutateAsync({
        sectionId: id,
        data: { 
          name: editSectionName,
          display_order: editSectionOrder
        },
      })
      setEditingSectionId(null)
      toast.success("Section updated")
    } catch (error) {
      toast.error("Failed to update section")
    }
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Manage Sections</SheetTitle>
          <SheetDescription>{form.name}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <form onSubmit={handleCreate} className="flex flex-col gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Section Name</Label>
                <Input
                  placeholder="e.g., Medical History"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="rounded-xl h-10 border-slate-200"
                />
              </div>
              <div className="col-span-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Order</Label>
                <Input
                  type="number"
                  min="1"
                  value={newSectionOrder}
                  onChange={(e) => setNewSectionOrder(parseInt(e.target.value) || 1)}
                  className="rounded-xl h-10 border-slate-200 text-center font-bold"
                />
              </div>
            </div>
            <Button type="submit" disabled={createSection.isPending} className="bg-slate-900 rounded-xl w-full h-10 font-bold">
              {createSection.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Section
                </>
              )}
            </Button>
          </form>

          <div className="space-y-3 pt-2">
            <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Existing Sections</Label>
            
            {isLoadingSections ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : sectionsList.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                No sections created yet
              </p>
            ) : (
              <div className="space-y-3">
                {[...sectionsList]
                  .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                  .map((section: any, idx: number) => {
                  const sid = section.id || section.section_id || `section-${idx}`;
                  const sname = section.name || section.section_name;
                  
                  return (
                    <div key={sid} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      {editingSectionId === sid ? (
                        <div className="flex flex-col gap-3 flex-1 p-1">
                          <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-3">
                              <Input
                                value={editSectionName}
                                onChange={(e) => setEditSectionName(e.target.value)}
                                className="h-9 rounded-lg border-blue-200"
                                autoFocus
                              />
                            </div>
                            <div className="col-span-1">
                              <Input
                                type="number"
                                min="1"
                                value={editSectionOrder}
                                onChange={(e) => setEditSectionOrder(parseInt(e.target.value) || 1)}
                                className="h-9 rounded-lg border-blue-200 text-center font-bold"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setEditingSectionId(null)} className="h-8 text-[11px] font-bold">
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => handleUpdate(sid)} className="h-8 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold px-4 rounded-lg">
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black border border-slate-200">
                              {section.display_order || idx + 1}
                            </div>
                            <div className="font-bold text-slate-900">{sname}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600" 
                              onClick={() => {
                                setEditingSectionId(sid)
                                setEditSectionName(sname)
                                setEditSectionOrder(section.display_order || idx + 1)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-slate-300 hover:text-rose-600"
                              onClick={() => deleteSection.mutate(sid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}



function QuestionLinker({
  form,
  questions,
  onClose,
}: {
  form: AssessmentForm
  questions: any[]
  onClose: () => void
}) {
  const { data: formResponse, isLoading } = useFormById(form.id)
  console.log("formResponse",formResponse)
  const formDetails = (formResponse as any)?.data?.data || (formResponse as any)?.data
  
  const { data: sectionsResponse } = useSections(form.id)
  const availableSections = Array.isArray((sectionsResponse as any)?.data?.data)
    ? (sectionsResponse as any).data.data
    : (Array.isArray((sectionsResponse as any)?.data) ? (sectionsResponse as any).data : [])

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [questionSections, setQuestionSections] = useState<Record<string, string>>({})
  const [questionOrders, setQuestionOrders] = useState<Record<string, number>>({})
  const linkMutation = useLinkQuestionsToForm()
  const updateLinkMutation = useUpdateFormQuestion()

  // Sync selected questions and their sections when form details are loaded
  useEffect(() => {
    // 1. Try to get questions from nested sections first (new structure)
    if (formDetails?.sections?.length > 0) {
      const allQuestions: any[] = []
      const sections: Record<string, string> = {}
      
      formDetails.sections.forEach((section: any) => {
        const sid = section.id || section.section_id
        if (section.questions?.length > 0 && sid) {
          section.questions.forEach((q: any) => {
            allQuestions.push(q.id)
            sections[q.id] = sid
          })
        }
      })
      
      if (allQuestions.length > 0) {
        setSelectedQuestions(allQuestions)
        setQuestionSections(sections)
        
        const orders: Record<string, number> = {}
        formDetails.sections.forEach((section: any) => {
          section.questions?.forEach((q: any) => {
            orders[q.id] = q.display_order || 0
          })
        })
        setQuestionOrders(orders)
        return // Found nested questions, no need to check flat array
      }
    }

    // 2. Fallback to flat questions list (original structure)
    if (formDetails?.questions) {
      setSelectedQuestions(formDetails.questions.map((q: any) => q.id))
      const sections: Record<string, string> = {}
      const orders: Record<string, number> = {}
      formDetails.questions.forEach((q: any) => {
        if (q.section_id) sections[q.id] = q.section_id
        orders[q.id] = q.display_order || 0
      })
      setQuestionSections(sections)
      setQuestionOrders(orders)
    }
  }, [formDetails])

  const handleToggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const isSelecting = !prev.includes(questionId)
      if (isSelecting && !questionOrders[questionId]) {
        // Assign a default order if none exists (current max + 1)
        const currentOrders = Object.values(questionOrders)
        const maxOrder = currentOrders.length > 0 ? Math.max(...currentOrders) : 0
        setQuestionOrders(prevOrders => ({ ...prevOrders, [questionId]: maxOrder + 1 }))
      }
      return isSelecting ? [...prev, questionId] : prev.filter((id) => id !== questionId)
    })
  }

  const handleSave = async () => {
    // Client-side validation: Check for display_order >= 1
    const invalidQuestions = selectedQuestions.filter(qId => (questionOrders[qId] || 0) < 1)
    
    if (invalidQuestions.length > 0) {
      toast.error("All selected questions must have a display order of at least 1")
      return
    }

    try {
      // Create bulk link request
      const questionsData = selectedQuestions.map(qId => ({
        question_id: qId,
        section_id: questionSections[qId] || undefined,
        display_order: questionOrders[qId] || 0
      }))

      await linkMutation.mutateAsync({
        formId: form.id,
        data: { questions: questionsData },
      })
      
      toast.success("Questions linked successfully")
      onClose()
    } catch (error: any) {
      // Display specific validation errors from backend if available
      const backendErrors = error?.response?.data?.errors
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        toast.error(backendErrors[0])
      } else {
        toast.error(error?.response?.data?.message || "Failed to link questions")
      }
    }
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Link Questions to Form</SheetTitle>
          <SheetDescription>{form.name}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <div className="text-sm text-slate-600">
            Select the questions you want to include in this form
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No questions available. Create questions first.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleToggleQuestion(question.id)}
                >
                  <Checkbox
                    checked={selectedQuestions.includes(question.id)}
                    onCheckedChange={() => handleToggleQuestion(question.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{question.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{question.field_key}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 capitalize">{question.type}</span>
                      {question.required && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-red-600">Required</span>
                        </>
                      )}
                    </div>
                    
                    {selectedQuestions.includes(question.id) && (
                      <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 shadow-sm transition-all" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-500 px-1">Section</Label>
                            {availableSections.length > 0 ? (
                              <Select 
                                value={questionSections[question.id] || "none"} 
                                onValueChange={(val) => setQuestionSections(prev => ({ ...prev, [question.id]: val === "none" ? "" : val }))}
                              >
                                <SelectTrigger className="h-9 bg-white border-slate-200 text-xs font-bold rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                  <SelectValue placeholder="Select a section..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                  <SelectItem value="none" className="text-xs font-medium text-slate-400 italic">No Section</SelectItem>
                                  {availableSections
                                    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                                    .map((s: any) => {
                                    const sid = s.id || s.section_id;
                                    return (
                                      <SelectItem key={sid} value={sid} className="text-xs font-bold text-slate-700">
                                        {s.name || s.section_name}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="h-9 flex items-center px-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 border-dashed">
                                No sections created
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                              <Label className="text-[10px] font-black uppercase text-slate-500">Display Order</Label>
                              {(questionOrders[question.id] || 0) < 1 && (
                                <span className="text-[8px] font-black text-rose-600 uppercase">Required</span>
                              )}
                            </div>
                            <Input 
                              type="number"
                              min="1"
                              className={cn(
                                "h-9 bg-white text-xs font-bold rounded-lg shadow-sm focus:ring-2 transition-all",
                                (questionOrders[question.id] || 0) < 1 
                                  ? "border-rose-500 focus:ring-rose-200" 
                                  : "border-slate-200 focus:ring-blue-500 text-slate-900"
                              )}
                              value={questionOrders[question.id] || 0}
                              onChange={(e) => setQuestionOrders(prev => ({ ...prev, [question.id]: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={linkMutation.isPending || selectedQuestions.length === 0}>
            {linkMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save ({selectedQuestions.length} selected)
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function FormViewer({ form, onClose }: { form: AssessmentForm; onClose: () => void }) {
  const { data: formResponse, isLoading: isLoadingForm } = useFormById(form.id)
  const formDetails = (formResponse as any)?.data?.data || (formResponse as any)?.data
  
  const { data: sectionsResponse, isLoading: isLoadingSections } = useSections(form.id)
  const sectionsList = Array.isArray((sectionsResponse as any)?.data?.data) 
    ? (sectionsResponse as any).data.data 
    : (Array.isArray((sectionsResponse as any)?.data) ? (sectionsResponse as any).data : [])

  const isLoading = isLoadingForm || isLoadingSections
  
  // Flatten all questions from formDetails (which might have them nested in sections)
  const allQuestions = formDetails?.questions || (formDetails?.sections?.flatMap((s: any) => s.questions || []) || [])

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{form.name}</SheetTitle>
          <SheetDescription>
            Version {form.version} • {form.is_active ? "Active" : "Inactive"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {form.metadata?.description && (
            <div>
              <Label className="text-sm font-semibold">Description</Label>
              <p className="text-sm text-slate-600 mt-1">{form.metadata.description}</p>
            </div>
          )}

          {form.metadata?.estimated_time && (
            <div>
              <Label className="text-sm font-semibold">Estimated Time</Label>
              <p className="text-sm text-slate-600 mt-1">{form.metadata.estimated_time}</p>
            </div>
          )}

          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : sectionsList.length > 0 ? (
              <div className="space-y-8">
                {[...sectionsList]
                  .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                  .map((section: any) => {
                    // Extract questions from formDetails that belong to this section
                    // We pull from formDetails.questions or from the nested questions in the section if available
                    const sectionId = section.id || section.section_id
                    const sectionQuestions = allQuestions.filter((q: any) => q.section_id === sectionId)
                    
                    if (sectionQuestions.length === 0) return null;

                    return (
                      <div key={sectionId || section.section_name} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-slate-900 text-white rounded-md px-3 py-1 font-black uppercase tracking-widest text-[10px]">
                            Section
                          </Badge>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight">
                            {section.name || section.section_name}
                          </h3>
                        </div>
                        
                        {sectionQuestions.length === 0 ? (
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider py-4 border-2 border-dashed rounded-xl text-center">No questions in this section</p>
                        ) : (
                          <div className="space-y-3">
                            {sectionQuestions
                              .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                              .map((question: any, idx: number) => (
                                <QuestionCard key={question.id} question={question} index={idx} />
                              ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                {/* Questions without sections or with invalid section IDs */}
                {(() => {
                  const sectionIds = new Set(sectionsList.map((s: any) => s.id || s.section_id));
                  const uncategorizedQuestions = allQuestions.filter((q: any) => 
                    !q.section_id || !sectionIds.has(q.section_id)
                  );

                  if (uncategorizedQuestions.length === 0) return null;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-slate-400 rounded-md px-3 py-1 font-black uppercase tracking-widest text-[10px]">
                          Uncategorized
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {uncategorizedQuestions
                          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                          .map((question: any, idx: number) => (
                            <QuestionCard key={question.id} question={question} index={idx} />
                          ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : !allQuestions || allQuestions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No questions linked to this form</p>
            ) : (
              <div className="space-y-3">
                {allQuestions
                  .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                  .map((question: any, index: number) => (
                    <QuestionCard key={question.id} question={question} index={index} />
                  ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
