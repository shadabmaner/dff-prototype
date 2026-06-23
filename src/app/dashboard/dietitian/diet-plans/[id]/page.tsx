"use client"

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Edit, Save, ChevronLeft, ChevronRight, User, Clock, Target, TrendingUp, Loader2, Utensils, X, AlertCircle, Info, Upload, Layers, Calendar, FileSpreadsheet, Trash2, CalendarPlus, Home, Lock, Unlock } from "lucide-react"
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { useDietTemplateById, useAddMeal, useAddDayDetail, useImportDietTemplate, useAddPhase, useUpdatePhase, useUpdateMealV1, useUpdateDayDetailV1, useDeleteMealV1, useAddPhaseDay, useDeepDeletePhase, useDeleteDietTemplate } from "@/hooks/use-diet-template"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { FoodItem, MealType, CreateMealRequest, FoodItemOrChoice, Phase } from "@/types/diet-template"

const MEAL_TYPES: MealType[] = [
  "EARLY_MORNING",
  "BREAKFAST",
  "MID_MORNING",
  "LUNCH",
  "EVENING_SNACK",
  "DINNER",
  "SNACK",
];

export default function DietPlanDetails() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  
  const { data: template, isLoading, error } = useDietTemplateById(templateId)
  const addMealMutation = useAddMeal()
  const updateMealV1Mutation = useUpdateMealV1()
  const deleteMealV1Mutation = useDeleteMealV1()
  const addDayDetailMutation = useAddDayDetail()
  const updateDayDetailV1Mutation = useUpdateDayDetailV1()
  const importMutation = useImportDietTemplate()
  const addPhaseMutation = useAddPhase()
  const updatePhaseMutation = useUpdatePhase()
  const addPhaseDayMutation = useAddPhaseDay()
  const deepDeletePhaseMutation = useDeepDeletePhase()
  const deleteDietTemplateMutation = useDeleteDietTemplate()
  
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null)
  const [showAddMealDialog, setShowAddMealDialog] = useState(false)
  const [showEditMealDialog, setShowEditMealDialog] = useState(false)
  const [showEditTipsDialog, setShowEditTipsDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showAddPhaseDialog, setShowAddPhaseDialog] = useState(false)
  const [showEditPhaseDialog, setShowEditPhaseDialog] = useState(false)
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<'full' | 'content'>('full')
  const [currentPage, setCurrentPage] = useState(0)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  
  // Delete confirm dialog state
  const [showDeleteMealDialog, setShowDeleteMealDialog] = useState(false)
  const [mealToDeleteId, setMealToDeleteId] = useState<string | null>(null)
  
  // Phase and Template delete dialog states
  const [showDeletePhaseDialog, setShowDeletePhaseDialog] = useState(false)
  const [phaseToDeleteId, setPhaseToDeleteId] = useState<string | null>(null)
  const [showDeleteTemplateDialog, setShowDeleteTemplateDialog] = useState(false)
  
  // Add/Edit Meal form states
  const [mealType, setMealType] = useState<MealType>("BREAKFAST")
  const [mealTime, setMealTime] = useState("08:00")
  const [foodItems, setFoodItems] = useState<FoodItemOrChoice[]>([])
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [mealNotes, setMealNotes] = useState("")
  const [mealReason, setMealReason] = useState("")
  
  // Day tips state
  const [dayTips, setDayTips] = useState("")
  
  // Import state
  const [importFile, setImportFile] = useState<File | null>(null)
  const [clearExisting, setClearExisting] = useState(false)
  const [importPhaseId, setImportPhaseId] = useState<string>("")

  // Phase form states
  const [phaseName, setPhaseName] = useState("")
  const [phaseStartDay, setPhaseStartDay] = useState("")
  const [phaseEndDay, setPhaseEndDay] = useState("")
  const [phaseNumber, setPhaseNumber] = useState("")
  const [phaseInstructions, setPhaseInstructions] = useState("")
  const [phaseGuidelines, setPhaseGuidelines] = useState("")
  


  // Helper function to normalize meal IDs by trimming spaces
  const normalizeMealIds = (templateData: any) => {
    if (!templateData?.data?.dayWisePlan) return templateData
    
    return {
      ...templateData,
      data: {
        ...templateData.data,
        dayWisePlan: templateData.data.dayWisePlan.map((dayPlan: any) => ({
          ...dayPlan,
          meals: dayPlan.meals?.map((meal: any) => ({
            ...meal,
            id: meal.id?.trim().replace(/'+$/, '') || meal.id,
          })) || [],
        })),
      },
    }
  }

  // Normalize template data to remove trailing spaces from meal IDs
  const normalizedTemplate = useMemo(() => {
    return normalizeMealIds(template)
  }, [template])

  // Auto-select first phase on initial load
  useEffect(() => {
    if (normalizedTemplate?.data?.phases?.length > 0 && !selectedPhaseId) {
      const firstPhase = normalizedTemplate.data.phases[0]
      setSelectedPhaseId(firstPhase.id)
      
      // Auto-select first day of the first phase
      const firstDay = normalizedTemplate.data?.dayWisePlan?.find(
        (d: any) => d.day_number >= firstPhase.start_day && d.day_number <= firstPhase.end_day
      )?.day_number || firstPhase.start_day
      setSelectedDay(firstDay)
    }
  }, [normalizedTemplate, selectedPhaseId])

  const daysPerPage = 30
  const totalPages = normalizedTemplate ? Math.ceil(normalizedTemplate?.data?.total_days / daysPerPage) : 1
  const currentPageStart = currentPage * daysPerPage + 1
  const currentPageEnd = Math.min((currentPage + 1) * daysPerPage, normalizedTemplate?.total_days || 0)
  console.log(normalizedTemplate,"template")
  const mealsForSelectedDay = useMemo(() => {
    if (!normalizedTemplate?.data?.dayWisePlan) return []
    const dayPlan = normalizedTemplate.data.dayWisePlan.find(
      (d: any) => d.day_number === selectedDay
    )
    return dayPlan?.meals || []
  }, [normalizedTemplate, selectedDay])
  
  const tipsForSelectedDay = useMemo(() => {
    if (!normalizedTemplate?.data?.dayWisePlan) return null
    const dayPlan = normalizedTemplate.data.dayWisePlan.find(
      (d: any) => d.day_number === selectedDay
    )
    if (!dayPlan?.tips) return null
    // Get day_detail_id from the first meal if available
    const dayDetailId = dayPlan.meals?.[0]?.day_detail_id
    return {
      tips: dayPlan.tips,
      id: dayDetailId
    }
  }, [normalizedTemplate, selectedDay])
  
  // Helper function to get phase for a day
  const getPhaseForDay = (day: number) => {
    if (!normalizedTemplate?.data?.phases) return null
    const phase = normalizedTemplate.data.phases.find(
      (p: any) => day >= p.start_day && day <= p.end_day
    )
    return phase?.phase_name || null
  }

  // Phase color mapping
  const getPhaseColors = (phase: string | null, isSelected: boolean) => {
    if (isSelected) {
      return "border-slate-900 bg-slate-900 text-white shadow-lg"
    }
    
    if (!phase) {
      return "border-slate-200 bg-white hover:border-slate-300"
    }

    // Extract phase number from phase name (e.g., "Phase 1: Detox & Reset" -> "Phase 1")
    const phaseKey = phase.split(':')[0].trim()

    const colorMap: Record<string, string> = {
      "Phase 1": "border-emerald-300 bg-emerald-50 hover:border-emerald-400",
      "Phase 2": "border-blue-300 bg-blue-50 hover:border-blue-400",
      "Phase 3": "border-purple-300 bg-purple-50 hover:border-purple-400",
      "Phase 4": "border-amber-300 bg-amber-50 hover:border-amber-400",
      "Phase 5": "border-rose-300 bg-rose-50 hover:border-rose-400",
      "Phase 6": "border-cyan-300 bg-cyan-50 hover:border-cyan-400",
      "Phase 7": "border-indigo-300 bg-indigo-50 hover:border-indigo-400",
      "Phase 8": "border-pink-300 bg-pink-50 hover:border-pink-400",
    }

    return colorMap[phaseKey] || "border-slate-200 bg-slate-50 hover:border-slate-300"
  }

  // Helper to get all days covered by existing phases
  const getCoveredDays = () => {
    if (!normalizedTemplate?.data?.phases) return new Set()
    const covered = new Set<number>()
    normalizedTemplate.data.phases.forEach((p: any) => {
      for (let d = p.start_day; d <= p.end_day; d++) {
        covered.add(d)
      }
    })
    return covered
  }

  // Helper to calculate remaining uncovered days
  const getRemainingDays = () => {
    if (!normalizedTemplate?.data?.total_days) return []
    const covered = getCoveredDays()
    const remaining: number[] = []
    for (let d = 1; d <= normalizedTemplate.data.total_days; d++) {
      if (!covered.has(d)) remaining.push(d)
    }
    return remaining
  }

  // Helper to get next phase number
  const getNextPhaseNumber = () => {
    if (!normalizedTemplate?.data?.phases?.length) return 1
    return Math.max(...normalizedTemplate.data.phases.map((p: any) => p.phase_number)) + 1
  }

  // Helper to find contiguous ranges in remaining days
  const getContiguousRanges = (days: number[]) => {
    if (days.length === 0) return []
    const ranges: { start: number; end: number }[] = []
    let start = days[0]
    let end = days[0]
    for (let i = 1; i < days.length; i++) {
      if (days[i] === end + 1) {
        end = days[i]
      } else {
        ranges.push({ start, end })
        start = days[i]
        end = days[i]
      }
    }
    ranges.push({ start, end })
    return ranges
  }

  const handleAddPhase = async () => {
    if (!templateId || !phaseName || !phaseStartDay || !phaseEndDay || !phaseNumber) {
      toast.error("Please fill all phase fields")
      return
    }

    const startDay = Number(phaseStartDay)
    const endDay = Number(phaseEndDay)
    const totalDays = normalizedTemplate?.data?.total_days || 0

    if (startDay < 1 || endDay > totalDays || startDay > endDay) {
      toast.error(`Invalid day range. Must be between 1 and ${totalDays}`)
      return
    }

    // Check for overlap with existing phases
    const covered = getCoveredDays()
    for (let d = startDay; d <= endDay; d++) {
      if (covered.has(d)) {
        toast.error(`Day ${d} is already covered by another phase`)
        return
      }
    }



    try {
      const result = await addPhaseMutation.mutateAsync({
        templateId,
        data: {
          phase_number: Number(phaseNumber),
          phase_name: phaseName,
          start_day: startDay,
          end_day: endDay,
          instructions: phaseInstructions,
          guidelines: phaseGuidelines,
          grocery_list_config: {},
          diet_pdf_config: {}
        }
      })
      toast.success("Phase added successfully")
      setShowAddPhaseDialog(false)
      resetPhaseForm()
      
      // Auto-select the newly created phase
      if (result?.data?.id) {
        setSelectedPhaseId(result.data.id)
        setSelectedDay(startDay)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add phase")
    }
  }

  const resetPhaseForm = () => {
    setPhaseName("")
    setPhaseStartDay("")
    setPhaseEndDay("")
    setPhaseNumber("")
    setPhaseInstructions("")
    setPhaseGuidelines("")

  }

  const openAddPhaseDialog = () => {
    const remaining = getRemainingDays()
    if (remaining.length === 0) {
      toast.info("All days are already covered by phases")
      return
    }
    const ranges = getContiguousRanges(remaining)
    const nextRange = ranges[0]
    setPhaseNumber(getNextPhaseNumber().toString())
    setPhaseStartDay(nextRange?.start?.toString() || "")
    setPhaseEndDay(nextRange?.end?.toString() || "")
    setPhaseName(`Phase ${getNextPhaseNumber()}`)
    setShowAddPhaseDialog(true)
  }

  const handleUpdatePhase = async () => {
    if (!templateId || !editingPhaseId || !phaseName || !phaseStartDay || !phaseEndDay || !phaseNumber) {
      toast.error("Please fill all phase fields")
      return
    }



    try {
      await updatePhaseMutation.mutateAsync({
        templateId,
        phaseId: editingPhaseId,
        data: {
          phase_name: phaseName,
          instructions: phaseInstructions,
          guidelines: phaseGuidelines,
          grocery_list_config: {},
          diet_pdf_config: {}
        }
      })
      toast.success("Phase updated successfully")
      setShowEditPhaseDialog(false)
      setEditingPhaseId(null)
      resetPhaseForm()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update phase")
    }
  }

  const openEditPhaseDialog = (phase: any, mode: 'full' | 'content' = 'full') => {
    setEditMode(mode)
    setEditingPhaseId(phase.id)
    setPhaseName(phase.phase_name)
    setPhaseNumber(phase.phase_number.toString())
    setPhaseStartDay(phase.start_day.toString())
    setPhaseEndDay(phase.end_day.toString())
    setPhaseInstructions(phase.instructions || "")
    setPhaseGuidelines(phase.guidelines || "")

    setShowEditPhaseDialog(true)
  }
  
  const addFoodItem = (isChoice: boolean = false) => {
    if (isChoice) {
      setFoodItems([...foodItems, [{ name: "", quantity: "" }]])
    } else {
      setFoodItems([...foodItems, { name: "", quantity: "" }])
    }
  }
  
  const updateFoodItem = (index: number, field: keyof FoodItem, value: string, choiceIndex?: number) => {
    const newItems = [...foodItems]
    if (choiceIndex !== undefined && Array.isArray(newItems[index])) {
      const choices = newItems[index] as FoodItem[]
      choices[choiceIndex] = { ...choices[choiceIndex], [field]: value }
    } else if (!Array.isArray(newItems[index])) {
      newItems[index] = { ...(newItems[index] as FoodItem), [field]: value }
    }
    setFoodItems(newItems)
  }
  
  const addChoiceToItem = (index: number) => {
    const newItems = [...foodItems]
    if (Array.isArray(newItems[index])) {
      (newItems[index] as FoodItem[]).push({ name: "", quantity: "" })
    } else {
      newItems[index] = [newItems[index] as FoodItem, { name: "", quantity: "" }]
    }
    setFoodItems(newItems)
  }
  
  const removeFoodItem = (index: number, choiceIndex?: number) => {
    const newItems = [...foodItems]
    if (choiceIndex !== undefined && Array.isArray(newItems[index])) {
      const choices = newItems[index] as FoodItem[]
      if (choices.length > 1) {
        choices.splice(choiceIndex, 1)
      } else {
        newItems.splice(index, 1)
      }
    } else {
      newItems.splice(index, 1)
    }
    setFoodItems(newItems)
  }
  
  const handleAddMeal = async () => {
    if (!templateId || foodItems.length === 0) {
      toast.error("Please add at least one food item")
      return
    }
    
    try {
      const payload: CreateMealRequest = {
        day_number: selectedDay,
        meal_type: mealType,
        meal_time: mealTime + ":00",
        food_items: foodItems,
        calories: calories ? Number(calories) : undefined,
        protein_g: protein ? Number(protein) : undefined,
        carbs_g: carbs ? Number(carbs) : undefined,
        fats_g: fats ? Number(fats) : undefined,
        notes: mealNotes || undefined,
        reason: mealReason || undefined,
      }
      
      await addMealMutation.mutateAsync({ templateId, data: payload })
      toast.success("Meal added successfully")
      resetMealForm()
      setShowAddMealDialog(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add meal")
    }
  }
  
  const handleEditMeal = async () => {
    if (!templateId || !editingMealId || foodItems.length === 0) {
      toast.error("Please add at least one food item")
      return
    }
    
    try {
      const cleanId = editingMealId.trim().replace(/'+$/, '')
      const payload = {
        meal_type: mealType,
        meal_time: mealTime + ":00",
        food_items: foodItems,
        calories: calories ? Number(calories) : undefined,
        protein_g: protein ? Number(protein) : undefined,
        carbs_g: carbs ? Number(carbs) : undefined,
        fats_g: fats ? Number(fats) : undefined,
        notes: mealNotes || undefined,
        reason: mealReason || undefined,
      }
      
      await updateMealV1Mutation.mutateAsync({
        mealId: cleanId,
        data: payload,
        templateId,
      })
      toast.success("Meal updated successfully")
      resetMealForm()
      setShowEditMealDialog(false)
      setEditingMealId(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update meal")
    }
  }
  
  const handleDeleteMeal = (mealId: string) => {
    setMealToDeleteId(mealId)
    setShowDeleteMealDialog(true)
  }

  const onConfirmDeleteMeal = async () => {
    if (!mealToDeleteId || !templateId) return

    try {
      await deleteMealV1Mutation.mutateAsync({ 
        mealId: mealToDeleteId.trim().replace(/'+$/, ''), 
        templateId 
      })
      toast.success("Meal deleted successfully")
      setShowDeleteMealDialog(false)
      setMealToDeleteId(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete meal")
    }
  }

  const handleAddDayToPhase = async (phaseId: string) => {
    try {
      await addPhaseDayMutation.mutateAsync({ templateId, phaseId })
      toast.success("Additional day added to phase successfully")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add day to phase")
    }
  }

  const handleDeletePhase = (phaseId: string) => {
    setPhaseToDeleteId(phaseId)
    setShowDeletePhaseDialog(true)
  }

  const onConfirmDeletePhase = async () => {
    if (!phaseToDeleteId || !templateId) return

    try {
      await deepDeletePhaseMutation.mutateAsync({ templateId, phaseId: phaseToDeleteId })
      toast.success("Phase and all its content deleted successfully")
      setShowDeletePhaseDialog(false)
      setPhaseToDeleteId(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete phase")
    }
  }

  const handleDeepDeleteTemplate = () => {
    setShowDeleteTemplateDialog(true)
  }

  const onConfirmDeleteTemplate = async () => {
    try {
      await deleteDietTemplateMutation.mutateAsync(templateId)
      toast.success("Diet template deleted successfully")
      router.push("/dashboard/dietitian/diet-plans")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete template")
    }
  }

  const openEditMealDialog = (meal: any) => {
    setEditingMealId(meal.id?.trim().replace(/'+$/, '') || meal.id)
    setMealType(meal.meal_type)
    setMealTime(meal.meal_time.slice(0, 5))
    setFoodItems(meal.food_items)
    setCalories(meal.calories?.toString() || "")
    setProtein(meal.protein_g?.toString() || "")
    setCarbs(meal.carbs_g?.toString() || "")
    setFats(meal.fats_g?.toString() || "")
    setMealNotes(meal.notes || "")
    setMealReason(meal.reason || "")
    setShowEditMealDialog(true)
  }
  
  const handleSaveTips = async () => {
    if (!templateId || !dayTips.trim()) {
      toast.error("Please enter tips")
      return
    }
    
    try {
      if (tipsForSelectedDay) {
        await updateDayDetailV1Mutation.mutateAsync({
          detailId: tipsForSelectedDay.id,
          data: { tips: dayTips },
          templateId,
        })
        toast.success("Tips updated successfully")
      } else {
        await addDayDetailMutation.mutateAsync({
          templateId,
          data: { day_number: selectedDay, tips: dayTips }
        })
        toast.success("Tips added successfully")
      }
      setShowEditTipsDialog(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save tips")
    }
  }
  
  const resetMealForm = () => {
    setEditingMealId(null)
    setMealType("BREAKFAST")
    setMealTime("08:00")
    setFoodItems([])
    setCalories("")
    setProtein("")
    setCarbs("")
    setFats("")
    setMealNotes("")
    setMealReason("")
  }
  
  const renderFoodItem = (item: FoodItemOrChoice) => {
    console.log(item,"item")
    if (Array.isArray(item)) {
      return (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-700 uppercase">Choose One:</p>
          {item.map((choice, idx) => (
            <p key={idx} className="text-sm text-slate-700 pl-4">
              • {choice.name}  {choice.quantity && <>- {choice.quantity}</>}
            </p>
          ))}
        </div>
      )
    } else {
      return <p className="text-sm text-slate-700">• {item.name} - {item.quantity}</p>
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }
  
  if (error || !template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">Error loading template</p>
          <p className="text-sm text-slate-600 mt-2">{error?.message || "Template not found"}</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">

      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-600 hover:text-slate-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{template?.data?.title}</h1>
            <p className="text-sm text-slate-600 mt-2">{template?.data?.description || `${template?.data?.total_days}-day nutrition protocol`}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* <Button 
              size="sm"
              variant="outline"
              onClick={() => {
                setImportFile(null)
                setClearExisting(false)
                setImportPhaseId("")
                setShowImportDialog(true)
              }}
              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV/XLSX
            </Button> */}
            <Badge className={cn(
              "px-3 py-1.5 font-semibold",
              template?.data?.is_active 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-50 text-slate-700 border border-slate-200"
            )}>
              {template?.data?.is_active ? "Active" : "Inactive"}
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDeepDeleteTemplate}
              disabled={deleteDietTemplateMutation.isPending}
              className="h-9 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold border-rose-100"
            >
              {deleteDietTemplateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Template
            </Button>
          </div>
        </div>
      </div>      {/* Phases & Duration Section */}
      <Card className="border-0 bg-white/40 backdrop-blur-md shadow-2xl overflow-hidden ring-1 ring-slate-200/50">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Dietary Phases</h2>
              </div>
              <p className="text-slate-500 text-sm ml-11">
                {normalizedTemplate?.data?.phases?.length || 0} Phases spanning {normalizedTemplate?.data?.total_days} days
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 mr-2">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Days</p>
                  <p className="text-sm font-bold text-slate-700">{normalizedTemplate?.data?.total_days}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Phases</p>
                  <p className="text-sm font-bold text-slate-700">{normalizedTemplate?.data?.phases?.length || 0}</p>
                </div>
              </div>
              
              <Button 
                onClick={openAddPhaseDialog}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 ring-4 ring-slate-900/5"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Phase
              </Button>
            </div>
          </div>

          {/* Coverage Timeline */}
          <div className="mb-10 space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              <span>Day 1</span>
              <span>Timeline Coverage</span>
              <span>Day {normalizedTemplate?.data?.total_days}</span>
            </div>
            <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              {normalizedTemplate?.data?.phases?.map((phase: any, index: number) => {
                const totalDays = normalizedTemplate.data.total_days || 1
                const startPercent = ((phase.start_day - 1) / totalDays) * 100
                const widthPercent = ((phase.end_day - phase.start_day + 1) / totalDays) * 100
                
                // Vibrant phase colors
                const phaseColors = [
                  "bg-blue-500", "bg-emerald-500", "bg-purple-500", 
                  "bg-amber-500", "bg-rose-500", "bg-cyan-500", 
                  "bg-indigo-500", "bg-pink-500"
                ]
                
                return (
                  <div 
                    key={phase.id}
                    className={cn(
                      "absolute top-0 h-full transition-all hover:brightness-110 cursor-help border-r border-white/20 last:border-0",
                      phaseColors[index % phaseColors.length]
                    )}
                    style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                    title={`${phase.phase_name}: Day ${phase.start_day} to ${phase.end_day}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Phase Cards Grid */}
          {!normalizedTemplate?.data?.phases?.length ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <Calendar className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Structure Your Diet Plan</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                Divide your protocol into specific phases (e.g., Induction, Maintenance) to provide better tracking for your patients.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowImportDialog(true)}
                  className="w-full sm:w-auto h-11 px-8 rounded-xl border-slate-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <Button 
                  onClick={openAddPhaseDialog}
                  className="w-full sm:w-auto h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Define Phase 1
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {normalizedTemplate.data.phases.map((phase: any, index: number) => {
                const phaseColors = [
                  { bg: "bg-blue-50", text: "text-blue-700", accent: "bg-blue-500", border: "border-blue-100", hover: "hover:border-blue-300" },
                  { bg: "bg-emerald-50", text: "text-emerald-700", accent: "bg-emerald-500", border: "border-emerald-100", hover: "hover:border-emerald-300" },
                  { bg: "bg-purple-50", text: "text-purple-700", accent: "bg-purple-500", border: "border-purple-100", hover: "hover:border-purple-300" },
                  { bg: "bg-amber-50", text: "text-amber-700", accent: "bg-amber-500", border: "border-amber-100", hover: "hover:border-amber-300" },
                  { bg: "bg-rose-50", text: "text-rose-700", accent: "bg-rose-500", border: "border-rose-100", hover: "hover:border-rose-300" },
                ]
                const color = phaseColors[index % phaseColors.length]
                const isSelected = selectedPhaseId === phase.id
                
                return (
                  <div 
                    key={phase.id}
                    className={cn(
                      "group relative border-2 rounded-2xl p-6 transition-all duration-300",
                      isSelected ? "border-slate-900 bg-slate-900 shadow-2xl scale-[1.02]" : cn(color.bg, color.border, color.hover, "bg-white/50 shadow-sm")
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
                        isSelected ? "bg-white/10 text-white" : cn(color.accent, "text-white")
                      )}>
                        {phase.phase_number}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => openEditPhaseDialog(phase)}
                          title="Edit Phase Details"
                          className={cn("h-8 w-8 rounded-lg", isSelected ? "text-white hover:bg-white/10" : "text-blue-600 hover:bg-blue-50")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => {
                            setImportFile(null)
                            setClearExisting(true)
                            setImportPhaseId(phase.id)
                            setShowImportDialog(true)
                          }}
                          title="Import specifically for this phase"
                          className={cn("h-8 w-8 rounded-lg", isSelected ? "text-white hover:bg-white/10" : "text-slate-400 hover:bg-slate-100")}
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleAddDayToPhase(phase.id)}
                          title="Add an extra day to this phase"
                          disabled={addPhaseDayMutation.isPending}
                          className={cn("h-8 w-8 rounded-lg", isSelected ? "text-white hover:bg-white/10" : "text-emerald-600 hover:bg-emerald-50")}
                        >
                          {addPhaseDayMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CalendarPlus className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDeletePhase(phase.id)}
                          title="Deep Delete Phase (removes all content)"
                          disabled={deepDeletePhaseMutation.isPending}
                          className={cn("h-8 w-8 rounded-lg", isSelected ? "text-white hover:bg-white/10" : "text-rose-600 hover:bg-rose-50")}
                        >
                          {deepDeletePhaseMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className={cn("text-lg font-bold mb-1", isSelected ? "text-white" : "text-slate-900")}>
                      {phase.phase_name}
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full", 
                        isSelected ? "bg-white/20 text-blue-200" : "bg-white text-slate-500 border border-slate-100 shadow-sm")}>
                        <Calendar className="h-3 w-3" />
                        Day {phase.start_day} - {phase.end_day}
                      </div>
                      <div className={cn("text-xs font-medium", isSelected ? "text-slate-400" : "text-slate-400")}>
                        {phase.end_day - phase.start_day + 1} Days
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedPhaseId(phase.id)
                          const firstDay = normalizedTemplate.data?.dayWisePlan?.find(
                            (d: any) => d.day_number >= phase.start_day && d.day_number <= phase.end_day
                          )?.day_number || phase.start_day
                          setSelectedDay(firstDay)
                        }}
                        variant={isSelected ? "secondary" : "outline"}
                        className={cn("flex-1 h-9 rounded-lg font-bold", isSelected ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-white border-slate-200")}
                      >
                        {isSelected ? "Active View" : "Select Phase"}
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setImportPhaseId(phase.id)
                          setShowImportDialog(true)
                        }}
                        variant="ghost"
                        className={cn("px-3 h-9 rounded-lg", isSelected ? "text-white hover:bg-white/10" : cn(color.text, "hover:bg-white"))}
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Coverage Warning */}
          {normalizedTemplate?.data?.phases?.length > 0 && getRemainingDays().length > 0 && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/30">
              <div className="flex items-start gap-4 p-5">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900">Protocol Discontinuity Detected</h4>
                  <p className="text-sm text-amber-700/80 mt-1 leading-relaxed">
                    There are <span className="font-bold">{getRemainingDays().length} uncovered days</span> in this diet plan. 
                    Structure these days into phases to ensure a complete patient journey.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getContiguousRanges(getRemainingDays()).map((r, i) => (
                      <span key={i} className="px-3 py-1 bg-white/60 border border-amber-200 rounded-lg text-xs font-bold text-amber-700 shadow-sm">
                        {r.start === r.end ? `Day ${r.start}` : `Days ${r.start}-${r.end}`}
                      </span>
                    ))}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={openAddPhaseDialog}
                  className="hidden sm:flex border-amber-200 bg-white text-amber-700 hover:bg-amber-50 hover:border-amber-300"
                >
                  Cover Remaining
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Info Cards */}
      <Card className="border-0 bg-white/60 backdrop-blur-md shadow-xl overflow-hidden ring-1 ring-slate-200/50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Info className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Template Specifications</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 shadow-sm hover:shadow-md transition-all overflow-hidden group hover:-translate-y-1 duration-300 ring-1 ring-blue-200/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-700 font-black">Duration</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{template?.data?.total_days} <span className="text-sm font-medium text-slate-500">Days</span></p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shadow-sm hover:shadow-md transition-all overflow-hidden group hover:-translate-y-1 duration-300 ring-1 ring-emerald-200/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Utensils className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-black">Meals</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{template?.data?.dayWisePlan.length} <span className="text-sm font-medium text-slate-500">Days Active</span></p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-sm hover:shadow-md transition-all overflow-hidden group hover:-translate-y-1 duration-300 ring-1 ring-amber-200/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Target className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-black">Calories</p>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {template?.data?.target_calories_min && template?.data?.target_calories_max 
                    ? `${template?.data?.target_calories_min}-${template?.data?.target_calories_max}` 
                    : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 shadow-sm hover:shadow-md transition-all overflow-hidden group hover:-translate-y-1 duration-300 ring-1 ring-rose-200/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <TrendingUp className="h-4 w-4 text-rose-600" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-rose-700 font-black">Context</p>
                </div>
                <p className="text-2xl font-black text-slate-900">Day {selectedDay}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

     {/* Phase and Day Selector */}
      {normalizedTemplate?.data?.phases?.length > 0 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardContent className="p-6 space-y-6">
            {/* Phase Chips - From Server */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Phase</h3>
              <div className="flex flex-wrap gap-2">
                {normalizedTemplate.data.phases.map((phase: any) => {
                  const isSelected = selectedPhaseId === phase.id
                  return (
                    <button
                      key={phase.id}
                      onClick={() => {
                        setSelectedPhaseId(phase.id)
                        // Auto-select first day of this phase from server data
                        const firstDay = normalizedTemplate.data?.dayWisePlan?.find(
                          (d: any) => d.day_number >= phase.start_day && d.day_number <= phase.end_day
                        )?.day_number || phase.start_day
                        setSelectedDay(firstDay)
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                      )}
                    >
                      <span className="font-semibold">{phase.phase_number}.</span>
                      <span className="ml-1">{phase.phase_name}</span>
                      <span className="ml-2 text-xs opacity-70">
                        ({phase.start_day}-{phase.end_day})
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Day Tabs - From Server dayWisePlan */}
            {selectedPhaseId && normalizedTemplate?.data?.phases && normalizedTemplate?.data?.dayWisePlan && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">Days</h3>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleAddDayToPhase(selectedPhaseId!)}
                    disabled={addPhaseDayMutation.isPending}
                    className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold"
                  >
                    {addPhaseDayMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    ) : (
                      <CalendarPlus className="h-3.5 w-3.5 mr-2" />
                    )}
                    Add Day to Phase
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {normalizedTemplate.data.dayWisePlan
                    .filter((dayPlan: any) => {
                      const phase = normalizedTemplate.data?.phases?.find((p: any) => p.id === selectedPhaseId)
                      if (!phase) return false
                      return dayPlan.day_number >= phase.start_day && dayPlan.day_number <= phase.end_day
                    })
                    .map((dayPlan: any) => (
                      <button
                        key={dayPlan.day_number}
                        onClick={() => setSelectedDay(dayPlan.day_number)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                          selectedDay === dayPlan.day_number
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                        )}
                      >
                        Day {dayPlan.day_number}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Day Details */}
      {normalizedTemplate?.data?.phases?.length > 0 && selectedPhaseId && (
        <Card className="border-0 bg-white/80 backdrop-blur-md shadow-2xl overflow-hidden ring-1 ring-slate-200/50">
          <div className="h-1.5 w-full bg-slate-100">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(selectedDay / normalizedTemplate.data.total_days) * 100}%` }} />
          </div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 font-black text-xl">
                  {selectedDay}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Day Content</h2>
                  <p className="text-sm text-slate-500 font-medium">Nutrition protocol for the selected day</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setDayTips(tipsForSelectedDay?.tips || "")
                    setShowEditTipsDialog(true)
                  }}
                  className="h-11 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold"
                >
                  <Edit className="h-4 w-4 mr-2 text-indigo-500" />
                  {tipsForSelectedDay ? "Edit Daily Tips" : "Add Daily Tips"}
                </Button>
                <Button 
                  size="lg"
                  onClick={() => setShowAddMealDialog(true)}
                  className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 font-bold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Meal
                </Button>
              </div>
            </div>

            {/* Day Tips */}
            {tipsForSelectedDay && (
              <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Info className="h-12 w-12 text-amber-600" />
                </div>
                <div className="relative">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Special Instructions for Patients(Tip)
                  </p>
                  <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-line">{tipsForSelectedDay.tips?.replace(/\.\s+/g, ".\n")}</p>
                </div>
              </div>
            )}

            {/* Meals List */}
            {mealsForSelectedDay.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                  <Utensils className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-400">Nutritional Void</h3>
                <p className="text-sm text-slate-400 mt-2">No meals have been strategically placed for Day {selectedDay} yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {mealsForSelectedDay.map((meal:any) => (
                  <Card key={meal.id} className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300 ring-1 ring-slate-100 rounded-2xl overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        <div className="p-6 md:w-64 bg-slate-50/50 flex flex-col justify-center items-center text-center">
                          <Badge className="mb-3 px-3 py-1 bg-blue-600 text-white border-0 font-bold tracking-tight">
                            {meal.meal_type.replace(/_/g, " ")}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-slate-900 font-black text-lg">
                            <Clock className="h-4 w-4 text-blue-500" />
                            {meal.meal_time.slice(0, 5)}
                          </div>
                        </div>
                        
                        <div className="p-6 flex-1 bg-white">
                          <div className="flex justify-between items-start mb-6">
                            <div className="space-y-3 flex-1">
                              {meal.food_items.map((item:any, idx:any) => (
                                <div key={idx} className="flex items-start gap-3">
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                  <div className="flex-1">{renderFoodItem(item)}</div>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col gap-2 scale-90 origin-top-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditMealDialog(meal)}
                                className="border-slate-200 hover:bg-slate-50 text-slate-600 font-bold h-9"
                              >
                                <Edit className="h-3.5 w-3.5 mr-2" />
                                Modify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteMeal(meal.id)}
                                className="border-rose-200 hover:bg-rose-50 text-rose-600 font-bold h-9"
                                disabled={deleteMealV1Mutation.isPending}
                              >
                                {deleteMealV1Mutation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete
                                  </>
                                )}
                              </Button>
                              <div className="flex flex-col gap-1.5">
                                {meal.calories && (
                                  <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-wider text-center ring-1 ring-indigo-100">
                                    {meal.calories} KCAL
                                  </div>
                                )}
                                {meal.protein_g && (
                                  <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider text-center ring-1 ring-emerald-100">
                                    {meal.protein_g}G PRO
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {(meal.notes || meal.reason) && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                              {meal.reason && (
                                <div className="flex items-start gap-2">
                                  <Target className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
                                  <p className="text-xs text-slate-600 font-semibold italic">Goal: {meal.reason}</p>
                                </div>
                              )}
                              {meal.notes && (
                                <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                                  {meal.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}



      {/* Add Meal Dialog */}
      <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
        <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Add Meal - Day {selectedDay}</DialogTitle>
            <DialogDescription className="text-slate-600">
              Add a new meal with food items. Use "Add Choice" to create OR options for food items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meal-type" className="text-sm font-semibold text-slate-700">Meal Type *</Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                  <SelectTrigger id="meal-type" className="h-11 border-slate-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meal-time" className="text-sm font-semibold text-slate-700">Time *</Label>
                <Input
                  id="meal-time"
                  type="time"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700">Food Items *</Label>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => addFoodItem(false)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => addFoodItem(true)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Choice
                  </Button>
                </div>
              </div>
              
              {foodItems.map((item, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  {Array.isArray(item) ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-amber-700 uppercase">Choice {idx + 1} (OR)</p>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeFoodItem(idx)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {item.map((choice, choiceIdx) => (
                        <div key={choiceIdx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                          <Input
                            placeholder="Food name"
                            value={choice.name}
                            onChange={(e) => updateFoodItem(idx, "name", e.target.value, choiceIdx)}
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Input
                            placeholder="Quantity"
                            value={choice.quantity}
                            onChange={(e) => updateFoodItem(idx, "quantity", e.target.value, choiceIdx)}
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeFoodItem(idx, choiceIdx)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="outline" onClick={() => addChoiceToItem(idx)} className="w-full">
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input
                        placeholder="Food name"
                        value={item.name}
                        onChange={(e) => updateFoodItem(idx, "name", e.target.value)}
                        className="h-9 border-slate-300 bg-white"
                      />
                      <Input
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateFoodItem(idx, "quantity", e.target.value)}
                        className="h-9 border-slate-300 bg-white"
                      />
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeFoodItem(idx)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories" className="text-sm font-semibold text-slate-700">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="275"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="h-9 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-sm font-semibold text-slate-700">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="14"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="h-9 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-sm font-semibold text-slate-700">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="30"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="h-9 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fats" className="text-sm font-semibold text-slate-700">Fats (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  placeholder="10"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className="h-9 border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal-reason" className="text-sm font-semibold text-slate-700">Reason</Label>
              <Textarea
                id="meal-reason"
                placeholder="Why this meal? e.g., Moong is source of protein and low calorie food."
                value={mealReason}
                onChange={(e) => setMealReason(e.target.value)}
                className="min-h-[60px] border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal-notes" className="text-sm font-semibold text-slate-700">Notes</Label>
              <Textarea
                id="meal-notes"
                placeholder="Additional notes or instructions..."
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                className="min-h-[60px] border-slate-300 bg-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddMealDialog(false)
                resetMealForm()
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={addMealMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMeal}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={addMealMutation.isPending}
            >
              {addMealMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Meal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meal Dialog */}
      <Dialog open={showEditMealDialog} onOpenChange={setShowEditMealDialog}>
        <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Edit Meal - Day {selectedDay}</DialogTitle>
            <DialogDescription className="text-slate-600">
              Update meal food items and notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-meal-type" className="text-sm font-semibold text-slate-700">Meal Type *</Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                  <SelectTrigger id="edit-meal-type" className="h-11 border-slate-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-meal-time" className="text-sm font-semibold text-slate-700">Time *</Label>
                <Input
                  id="edit-meal-time"
                  type="time"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700">Food Items *</Label>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => addFoodItem(false)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => addFoodItem(true)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Choice
                  </Button>
                </div>
              </div>
              
              {foodItems.map((item, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  {Array.isArray(item) ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-amber-700 uppercase">Choice {idx + 1} (OR)</p>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeFoodItem(idx)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {item.map((choice, choiceIdx) => (
                        <div key={choiceIdx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                          <Input
                            placeholder="Food name"
                            value={choice.name}
                            onChange={(e) => updateFoodItem(idx, "name", e.target.value, choiceIdx)}
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Input
                            placeholder="Quantity"
                            value={choice.quantity}
                            onChange={(e) => updateFoodItem(idx, "quantity", e.target.value, choiceIdx)}
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeFoodItem(idx, choiceIdx)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="outline" onClick={() => addChoiceToItem(idx)} className="w-full">
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input
                        placeholder="Food name"
                        value={item.name}
                        onChange={(e) => updateFoodItem(idx, "name", e.target.value)}
                        className="h-9 border-slate-300 bg-white"
                      />
                      <Input
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateFoodItem(idx, "quantity", e.target.value)}
                        className="h-9 border-slate-300 bg-white"
                      />
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeFoodItem(idx)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-calories" className="text-sm font-semibold text-slate-700">Calories</Label>
                <Input
                  id="edit-calories"
                  type="number"
                  placeholder="275"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="h-9 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-protein" className="text-sm font-semibold text-slate-700">Protein (g)</Label>
                <Input
                  id="edit-protein"
                  type="number"
                  placeholder="14"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="h-9 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-carbs" className="text-sm font-semibold text-slate-700">Carbs (g)</Label>
                <Input
                  id="edit-carbs"
                  type="number"
                  placeholder="30"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="h-9 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fats" className="text-sm font-semibold text-slate-700">Fats (g)</Label>
                <Input
                  id="edit-fats"
                  type="number"
                  placeholder="10"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className="h-9 border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-meal-reason" className="text-sm font-semibold text-slate-700">Reason</Label>
              <Textarea
                id="edit-meal-reason"
                placeholder="Why this meal? e.g., Moong is source of protein and low calorie food."
                value={mealReason}
                onChange={(e) => setMealReason(e.target.value)}
                className="min-h-[60px] border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-meal-notes" className="text-sm font-semibold text-slate-700">Notes</Label>
              <Textarea
                id="edit-meal-notes"
                placeholder="Additional notes or instructions..."
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                className="min-h-[60px] border-slate-300 bg-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditMealDialog(false)
                resetMealForm()
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={updateMealV1Mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditMeal}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={updateMealV1Mutation.isPending}
            >
              {updateMealV1Mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Meal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tips Dialog */}
      <Dialog open={showEditTipsDialog} onOpenChange={setShowEditTipsDialog}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Day {selectedDay} - Tips</DialogTitle>
            <DialogDescription className="text-slate-600">
              Add helpful tips and instructions for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tips" className="text-sm font-semibold text-slate-700">Daily Tips *</Label>
              <Textarea
                id="tips"
                placeholder="e.g., In dhaniya jeera water add a few drops of lemon juice or a pinch of black pepper. Soak Emmer Wheat."
                value={dayTips}
                onChange={(e) => setDayTips(e.target.value)}
                className="min-h-[120px] border-slate-300 bg-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditTipsDialog(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={addDayDetailMutation.isPending || updateDayDetailV1Mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTips}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={addDayDetailMutation.isPending || updateDayDetailV1Mutation.isPending}
            >
              {(addDayDetailMutation.isPending || updateDayDetailV1Mutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Tips
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Meal Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteMealDialog}
        onOpenChange={setShowDeleteMealDialog}
        title="Delete Meal"
        description="Are you sure you want to delete this meal from the diet plan? This action cannot be undone."
        confirmText="Delete Meal"
        variant="destructive"
        onConfirm={onConfirmDeleteMeal}
        isLoading={deleteMealV1Mutation.isPending}
      />

      {/* Delete Phase Confirmation Dialog */}
      <ConfirmDialog
        open={showDeletePhaseDialog}
        onOpenChange={setShowDeletePhaseDialog}
        title="Deep Delete Phase"
        description="Are you sure you want to delete this phase? This will permanently remove all days, meals, and tips within this phase range. This action cannot be undone."
        confirmText="Deep Delete"
        variant="destructive"
        onConfirm={onConfirmDeletePhase}
        isLoading={deepDeletePhaseMutation.isPending}
      />

      {/* Delete Template Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteTemplateDialog}
        onOpenChange={setShowDeleteTemplateDialog}
        title="Deep Delete Template"
        description="Are you sure you want to delete this entire diet template? All phases, meals, and content will be permanently removed. This action can only be performed if the template is not currently assigned to any patients."
        confirmText="Permanently Delete Template"
        variant="destructive"
        onConfirm={onConfirmDeleteTemplate}
        isLoading={deleteDietTemplateMutation.isPending}
      />

      {/* Import CSV/XLSX Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Import Diet Data</DialogTitle>
            <DialogDescription className="text-slate-600">
              Upload a CSV or Excel file to import diet template data. The file should contain meal information with columns for day, meal type, food items, quantities, etc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-file" className="text-sm font-semibold text-slate-700">Select File (CSV or XLSX) *</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="h-11 border-slate-300 bg-white cursor-pointer"
              />
              {importFile && (
                <p className="text-xs text-emerald-600 font-medium">
                  Selected: {importFile.name}
                </p>
              )}
            </div>

            {/* Phase Selector */}
            {normalizedTemplate?.data?.phases?.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="import-phase" className="text-sm font-semibold text-slate-700">Target Phase (Optional)</Label>
                <Select value={importPhaseId} onValueChange={setImportPhaseId}>
                  <SelectTrigger id="import-phase" className="h-11 border-slate-300 bg-white">
                    <SelectValue placeholder="Select a phase to import into (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases (Default)</SelectItem>
                    {normalizedTemplate.data.phases.map((phase: any) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.phase_number}. {phase.phase_name} (Days {phase.start_day}-{phase.end_day})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  If selected, meals will be imported only for days within this phase range. 
                  <span className="block mt-1 font-semibold text-blue-600">
                    Note: Day numbers in Excel should be relative to phase start (Day 1, 2...).
                  </span>
                </p>
              </div>
            )}

            {importPhaseId && importPhaseId !== "all" && (
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-sm text-blue-800">
                <p className="font-bold flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Phase-Wise Import Mode Active
                </p>
                <ul className="mt-2 list-disc list-inside text-xs space-y-1 opacity-90">
                  <li>Day 1 in Excel = Start of phase</li>
                  <li>Columns for phase info will be ignored</li>
                  <li>Import limited to phase day range</li>
                </ul>
              </div>
            )}

            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <input
                type="checkbox"
                id="clear-existing"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="mt-1 h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
              />
              <div>
                <Label htmlFor="clear-existing" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Clear existing data
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  If checked, all existing meals for this template will be removed before importing the new data.
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Expected File Format</p>
              <p className="text-xs text-slate-600">
                The file should contain columns like: Day, Meal Type, Meal Time, Food Items, Quantity, Calories, Protein, Carbs, Fats, Notes
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false)
                setImportFile(null)
                setClearExisting(false)
                setImportPhaseId("")
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={importMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!importFile || !templateId) {
                  toast.error("Please select a file to import")
                  return
                }
                
                try {
                  await importMutation.mutateAsync({ 
                    file: importFile, 
                    templateId, 
                    clearExisting,
                    phaseId: importPhaseId && importPhaseId !== "all" ? importPhaseId : undefined
                  })
                  toast.success("Diet data imported successfully")
                  setShowImportDialog(false)
                  setImportFile(null)
                  setClearExisting(false)
                  setImportPhaseId("")
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || "Failed to import diet data")
                }
              }}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={!importFile || importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Phase Dialog */}
      <Dialog open={showAddPhaseDialog} onOpenChange={setShowAddPhaseDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Add New Phase</DialogTitle>
            <DialogDescription className="text-slate-600">
              Create a phase for the remaining uncovered days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phase-number" className="text-sm font-semibold text-slate-700">Phase Number *</Label>
              <Input
                id="phase-number"
                type="number"
                min={1}
                placeholder="4"
                value={phaseNumber}
                onChange={(e) => setPhaseNumber(e.target.value)}
                className="h-11 border-slate-300 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phase-name" className="text-sm font-semibold text-slate-700">Phase Name *</Label>
              <Input
                id="phase-name"
                placeholder="e.g., Consolidation Phase"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                className="h-11 border-slate-300 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-day" className="text-sm font-semibold text-slate-700">Start Day *</Label>
                <Input
                  id="start-day"
                  type="number"
                  min={1}
                  max={normalizedTemplate?.data?.total_days || 999}
                  placeholder="30"
                  value={phaseStartDay}
                  onChange={(e) => setPhaseStartDay(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-day" className="text-sm font-semibold text-slate-700">End Day *</Label>
                <Input
                  id="end-day"
                  type="number"
                  min={1}
                  max={normalizedTemplate?.data?.total_days || 999}
                  placeholder="60"
                  value={phaseEndDay}
                  onChange={(e) => setPhaseEndDay(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phase-instructions" className="text-sm font-semibold text-slate-700">Phase Instructions</Label>
              <Textarea
                id="phase-instructions"
                placeholder="Specific instructions for this phase..."
                value={phaseInstructions}
                onChange={(e) => setPhaseInstructions(e.target.value)}
                className="min-h-[100px] border-slate-300 bg-white resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phase-guidelines" className="text-sm font-semibold text-slate-700">Phase Guidelines</Label>
              <Textarea
                id="phase-guidelines"
                placeholder="Specific guidelines for this phase..."
                value={phaseGuidelines}
                onChange={(e) => setPhaseGuidelines(e.target.value)}
                className="min-h-[100px] border-slate-300 bg-white resize-none"
              />
            </div>


          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddPhaseDialog(false)
                resetPhaseForm()
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={addPhaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPhase}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={addPhaseMutation.isPending}
            >
              {addPhaseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Phase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Phase Dialog */}
      <Dialog open={showEditPhaseDialog} onOpenChange={setShowEditPhaseDialog}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Edit Phase Details</DialogTitle>
            <DialogDescription className="text-slate-600">
              Update phase name and instructions. Duration and sequence are fixed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phase-name" className="text-sm font-semibold text-slate-700">Phase Name *</Label>
                <Input
                  id="edit-phase-name"
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Phase #</Label>
                <div className="h-11 flex items-center px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                  {phaseNumber}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">Start Day</Label>
                <div className="h-11 flex items-center px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                  {phaseStartDay}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase">End Day</Label>
                <div className="h-11 flex items-center px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                  {phaseEndDay}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase-instructions" className="text-sm font-semibold text-slate-700">Phase Instructions</Label>
              <Textarea
                id="phase-instructions"
                placeholder="Specific instructions for this phase..."
                value={phaseInstructions}
                onChange={(e) => setPhaseInstructions(e.target.value)}
                className="min-h-[120px] border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase-guidelines" className="text-sm font-semibold text-slate-700">Phase Guidelines</Label>
              <Textarea
                id="phase-guidelines"
                placeholder="Specific guidelines for this phase..."
                value={phaseGuidelines}
                onChange={(e) => setPhaseGuidelines(e.target.value)}
                className="min-h-[120px] border-slate-300 bg-white resize-none"
              />
            </div>


          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditPhaseDialog(false)
                setEditingPhaseId(null)
                resetPhaseForm()
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={updatePhaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePhase}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={updatePhaseMutation.isPending}
            >
              {updatePhaseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Phase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
