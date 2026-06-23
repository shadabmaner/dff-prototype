"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
  useQuestionsBySpeciality,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useAddQuestionOption,
  useDeleteQuestionOption,
} from "@/hooks/use-assessment"
import { useSpecialitiesQuery } from "@/hooks/use-specialities"
import { ValidationRulesBuilder } from "./validation-rules-builder"
import { Plus, Edit, Trash2, Loader2, AlertCircle, FileQuestion, Settings, X, List, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import type { AssessmentQuestion, CreateQuestionRequest, QuestionOption } from "@/types/assessment"

export default function QuestionsManagement() {
  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null)
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)
  const [managingOptionsFor, setManagingOptionsFor] = useState<AssessmentQuestion | null>(null)

  const { data: specialitiesResponse, isLoading: loadingSpecialities } = useSpecialitiesQuery()
  const { data: questionsResponse, isLoading: loadingQuestions } = useQuestionsBySpeciality(selectedSpeciality)
  const createMutation = useCreateQuestion()
  const updateMutation = useUpdateQuestion()
  const deleteMutation = useDeleteQuestion()

  const specialities = specialitiesResponse?.data || []
  const questions = Array.isArray((questionsResponse as any)?.data?.data) ? (questionsResponse as any).data.data : []

  
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    speciality_id: "",
    field_key: "",
    label: "",
    type: "text",
    required: false,
    voice_prompt: "",
    validation_json: {},
  })

  const resetForm = () => {
    setFormData({
      speciality_id: selectedSpeciality || "",
      field_key: "",
      label: "",
      type: "text",
      required: false,
      voice_prompt: "",
      validation_json: {},
    })
  }

  const handleOpenDrawer = () => {
    resetForm()
    setEditingQuestion(null)
    setIsDrawerOpen(true)
  }

  const handleOpenEditDrawer = (question: AssessmentQuestion) => {
    setEditingQuestion(question)
    setFormData({
      speciality_id: question.speciality_id,
      field_key: question.field_key,
      label: question.label,
      type: question.type,
      required: question.required,
      voice_prompt: question.voice_prompt || "",
      validation_json: question.validation_json || {},
    })
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setEditingQuestion(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.speciality_id) {
      toast.error("Please select a speciality")
      return
    }

    if (!formData.field_key.trim()) {
      toast.error("Please enter a field key")
      return
    }

    if (!formData.label.trim()) {
      toast.error("Please enter a label")
      return
    }

    try {
      if (editingQuestion) {
        await updateMutation.mutateAsync({ questionId: editingQuestion.id, data: formData })
        toast.success("Question updated successfully")
      } else {
        await createMutation.mutateAsync(formData)
        toast.success("Question created successfully")
      }
      handleCloseDrawer()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save question")
    }
  }

  const handleDelete = async () => {
    if (!deleteQuestionId) return

    try {
      await deleteMutation.mutateAsync(deleteQuestionId)
      toast.success("Question deleted successfully")
      setDeleteQuestionId(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete question")
    }
  }

  const needsOptions = (type: string) => {
    return ["radio", "checkbox", "dropdown"].includes(type)
  }

  return (
    <div className="space-y-8">
      {/* Speciality Selector */}
      <Card className="border-0 shadow-xl bg-white overflow-hidden rounded-2xl">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-blue-600" />
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 tracking-tight">Clinical Speciality</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Select a speciality to manage questions</p>
            </div>
          </div>
          <Select value={selectedSpeciality || ""} onValueChange={setSelectedSpeciality}>
            <SelectTrigger className="w-full max-w-md bg-slate-50/50 border-2 border-slate-200 h-12 shadow-sm focus:border-indigo-600 font-bold transition-all rounded-xl">
              <SelectValue placeholder="Select clinical speciality..." />
            </SelectTrigger>
            <SelectContent>
              {loadingSpecialities ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
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
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Question Library</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{questions.length} questions configured</p>
            </div>
            <Button 
              onClick={handleOpenDrawer} 
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-black shadow-xl shadow-slate-900/20 h-11 px-6 rounded-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {loadingQuestions ? (
            <Card className="border-0 shadow-xl bg-white rounded-2xl">
              <CardContent className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[72px] w-full animate-pulse rounded-xl bg-slate-100" />
                ))}
              </CardContent>
            </Card>
          ) : !questions || questions.length === 0 ? (
            <Card className="border border-dashed border-slate-200 bg-white shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 rounded-2xl bg-slate-900/90 flex items-center justify-center mb-6 shadow-inner shadow-white/10">
                  <FileQuestion className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No Questions Found</h3>
                <p className="text-sm text-slate-500 mt-2 mb-8 max-w-md font-medium">This speciality doesn&apos;t have any assessment questions yet. Start building your clinical intake workflow.</p>
                <Button onClick={handleOpenDrawer} variant="outline" className="border-slate-300 px-8 h-11 rounded-xl font-black hover:bg-slate-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {questions.map((question: AssessmentQuestion, index: number) => (
                  <motion.div
                    key={question.id}
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
                        question.required 
                          ? "bg-rose-500" 
                          : "bg-blue-500"
                      )} />
                      <CardContent className="p-5 pl-6">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0",
                              question.required 
                                ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white" 
                                : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                            )}>
                              <FileQuestion className="h-6 w-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-1.5">
                                <h3 className="text-base font-black text-slate-900 truncate tracking-tight">
                                  {question.label}
                                </h3>
                                <span className={cn(
                                  "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0",
                                  question.required 
                                    ? "bg-rose-100 text-rose-700" 
                                    : "bg-emerald-100 text-emerald-700"
                                )}>
                                  {question.required ? "Required" : "Optional"}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Type</span>
                                  <span className="text-indigo-600 font-black capitalize bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">{question.type}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Key</span>
                                  <code className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-black text-[11px]">{question.field_key}</code>
                                </div>
                                {question.options && question.options.length > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <List className="h-3 w-3 text-purple-500" />
                                    <span className="text-purple-600 font-black text-[11px]">{question.options.length} opts</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                            {needsOptions(question.type) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                                onClick={() => setManagingOptionsFor(question)}
                                title="Manage Options"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
                              onClick={() => handleOpenEditDrawer(question)}
                              title="Edit Question"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-slate-300 hover:bg-white hover:text-rose-600 hover:shadow-sm transition-all"
                              onClick={() => setDeleteQuestionId(question.id)}
                              title="Delete Question"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Validation Rules Summary */}
                        {question.validation_json && Object.keys(question.validation_json).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                            {question.type === "number" && (
                              <>
                                {question.validation_json.min !== undefined && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Min</span>
                                    <span className="text-[10px] font-bold text-slate-700">{question.validation_json.min}</span>
                                  </div>
                                )}
                                {question.validation_json.max !== undefined && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Max</span>
                                    <span className="text-[10px] font-bold text-slate-700">{question.validation_json.max}</span>
                                  </div>
                                )}
                                {question.validation_json.isInteger && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <ShieldCheck className="h-3 w-3 text-indigo-500" />
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">Integer</span>
                                  </div>
                                )}
                                {question.validation_json.unit && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Unit</span>
                                    <span className="text-[10px] font-bold text-blue-700">{question.validation_json.unit}</span>
                                  </div>
                                )}
                              </>
                            )}
                            {question.type === "text" && (
                              <>
                                {question.validation_json.minLength !== undefined && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Min Len</span>
                                    <span className="text-[10px] font-bold text-slate-700">{question.validation_json.minLength}</span>
                                  </div>
                                )}
                                {question.validation_json.maxLength !== undefined && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Max Len</span>
                                    <span className="text-[10px] font-bold text-slate-700">{question.validation_json.maxLength}</span>
                                  </div>
                                )}
                                {question.validation_json.regex && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">
                                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">Regex</span>
                                    <code className="text-[9px] font-mono text-amber-700">{question.validation_json.regex}</code>
                                  </div>
                                )}
                              </>
                            )}
                            {question.type === "checkbox" && question.validation_json.maxSelections !== undefined && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Max Sel</span>
                                <span className="text-[10px] font-bold text-slate-700">{question.validation_json.maxSelections}</span>
                              </div>
                            )}
                            {question.validation_json.customMessage && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                                <AlertCircle className="h-3 w-3 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Custom Msg</span>
                              </div>
                            )}
                          </div>
                        )}
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
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <SheetHeader>
              <SheetTitle>{editingQuestion ? "Edit Question" : "Create New Question"}</SheetTitle>
              <SheetDescription>
                {editingQuestion
                  ? "Update the question details below"
                  : "Add a new assessment question"}
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
                  disabled={!!editingQuestion}
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
                <Label htmlFor="field_key">
                  Field Key <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="field_key"
                  value={formData.field_key}
                  onChange={(e) => setFormData({ ...formData, field_key: e.target.value })}
                  placeholder="e.g., height, weight, gender"
                  required
                />
                <p className="text-xs text-slate-500">Unique identifier for this question</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">
                  Label <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., What is your height?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Question Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                    <SelectItem value="radio">Radio (Single Choice)</SelectItem>
                    <SelectItem value="checkbox">Checkbox (Multiple Choice)</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-2">
                <Label htmlFor="required">Required Field</Label>
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice_prompt">Voice Prompt (Optional)</Label>
                <Textarea
                  id="voice_prompt"
                  value={formData.voice_prompt}
                  onChange={(e) => setFormData({ ...formData, voice_prompt: e.target.value })}
                  placeholder="e.g., Please tell me your height in centimeters"
                  rows={3}
                />
              </div>

              {["number", "text", "checkbox"].includes(formData.type) && (
                <div className="space-y-4">
                  <ValidationRulesBuilder
                    type={formData.type}
                    value={formData.validation_json || {}}
                    onChange={(newRules) => setFormData({ ...formData, validation_json: newRules })}
                  />
                </div>
              )}

              {needsOptions(formData.type) && !editingQuestion && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ℹ️ After creating this question, you can add options by clicking the settings icon on the question card.
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
                {editingQuestion ? "Update" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteQuestionId} onOpenChange={() => setDeleteQuestionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question and all its options.
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

      {managingOptionsFor && (
        <OptionsManager
          question={managingOptionsFor}
          onClose={() => setManagingOptionsFor(null)}
        />
      )}
    </div>
  )
}

function OptionsManager({ question, onClose }: { question: AssessmentQuestion; onClose: () => void }) {
  const [newOption, setNewOption] = useState({ option_text: "", option_value: "" })
  const addOptionMutation = useAddQuestionOption()
  const deleteOptionMutation = useDeleteQuestionOption()

  const handleAddOption = async () => {
    if (!newOption.option_text.trim() || !newOption.option_value.trim()) {
      toast.error("Please enter both option text and value")
      return
    }

    try {
      await addOptionMutation.mutateAsync({
        questionId: question.id,
        data: {
          option_text: newOption.option_text,
          option_value: newOption.option_value,
          display_order: (question.options?.length || 0) + 1,
        },
      })
      toast.success("Option added successfully")
      setNewOption({ option_text: "", option_value: "" })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add option")
    }
  }

  const handleDeleteOption = async (optionId: string) => {
    try {
      await deleteOptionMutation.mutateAsync({ questionId: question.id, optionId })
      toast.success("Option deleted successfully")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete option")
    }
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Manage Options</SheetTitle>
          <SheetDescription>{question.label}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-4">
            <Label>Add New Option</Label>
            <div className="space-y-3">
              <Input
                placeholder="Option Text (e.g., Male)"
                value={newOption.option_text}
                onChange={(e) => setNewOption({ ...newOption, option_text: e.target.value })}
              />
              <Input
                placeholder="Option Value (e.g., male)"
                value={newOption.option_value}
                onChange={(e) => setNewOption({ ...newOption, option_value: e.target.value })}
              />
              <Button
                onClick={handleAddOption}
                disabled={addOptionMutation.isPending}
                className="w-full"
              >
                {addOptionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Option
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Existing Options</Label>
            {!question.options || question.options.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No options added yet</p>
            ) : (
              <div className="space-y-2">
                {question.options
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.option_text}</p>
                        <p className="text-xs text-slate-500">Value: {option.option_value}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteOption(option.id)}
                        disabled={deleteOptionMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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
