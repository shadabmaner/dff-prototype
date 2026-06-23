"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Apple,
  Calendar,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  ShoppingCart,
  CheckCircle,
  X,
  Save,
  Loader2,
  Layers,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import GroceryListTab from "./GroceryListTab";
import { apiClient } from "@/lib/api-client";
import { usePatientDietPlan } from "@/hooks/use-patient";
import {
  useAddMeal,
  useUpdateMeal,
  useDeleteMeal,
  useAddDayDetail,
  useUpdateDayDetail,
  useUpdateClinicalDayDetail,
  useUpdatePhase,
} from "@/hooks/use-diet-template";
import { useUpdateClinicalMeal, useAddClinicalMeal, useDeleteClinicalMeal } from "@/hooks/use-clinical-diet-plan";
import type {
  FoodItem,
  MealType,
  CreateMealRequest,
  FoodItemOrChoice,
} from "@/types/diet-template";
import { cn } from "@/lib/utils";

interface DietPlanPhaseCardProps {
  activeDietPlan: any;
  patientId: string;
  readOnly?: boolean;
}

const MEAL_TYPES: MealType[] = [
  "EARLY_MORNING",
  "BREAKFAST",
  "MID_MORNING",
  "LUNCH",
  "EVENING_SNACK",
  "DINNER",
  "SNACK",
];

export function DietPlanPhaseCard({
  activeDietPlan,
  patientId,
  readOnly = false,
}: DietPlanPhaseCardProps) {
  // Tab state
  const [dietPlanTab, setDietPlanTab] = useState<"plan" | "grocery">("plan");
  
  // Pagination and selection state
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Modal/Dialog states
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [showEditTipsDialog, setShowEditTipsDialog] = useState(false);
  const [showEditPhaseDialog, setShowEditPhaseDialog] = useState(false);
  const [showDeleteMealDialog, setShowDeleteMealDialog] = useState(false);
  const [mealToDeleteId, setMealToDeleteId] = useState<string | null>(null);
  
  // Phase edit state
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [phaseName, setPhaseName] = useState("");
  const [phaseInstructions, setPhaseInstructions] = useState("");
  const [phaseGuidelines, setPhaseGuidelines] = useState("");
  
  // Meal form state
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
  const [mealTime, setMealTime] = useState("08:00");
  const [foodItems, setFoodItems] = useState<FoodItemOrChoice[]>([]);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [mealNotes, setMealNotes] = useState("");
  const [mealReason, setMealReason] = useState("");
  const [dayTips, setDayTips] = useState("");
  
  // Template state
  const [templateDetails, setTemplateDetails] = useState<any>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  
  // Fetch patient diet plan
  const { data: dietPlanData, error: dietPlanError, refetch: refetchDietPlan } = usePatientDietPlan(patientId);
  
  // Mutations
  const addMealMutation = useAddMeal();
  const updateMealMutation = useUpdateMeal();
  const deleteMealMutation = useDeleteMeal();
  const addClinicalMealMutation = useAddClinicalMeal();
  const updateClinicalMealMutation = useUpdateClinicalMeal();
  const deleteClinicalMealMutation = useDeleteClinicalMeal();
  const addDayDetailMutation = useAddDayDetail();
  const updateDayDetailMutation = useUpdateDayDetail();
  const updateClinicalDayDetailMutation = useUpdateClinicalDayDetail();
  const updatePhaseMutation = useUpdatePhase();

  // Helper function to normalize meal IDs
  const normalizeMealIds = (templateData: any) => {
    if (!templateData?.data?.dayWisePlan) return templateData;

    const normalizedData = {
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
    };

    return normalizedData;
  };

  // Fetch template details
  useEffect(() => {
    const fetchData = async () => {
      if (dietPlanData?.data?.dayWisePlan) {
        const normalizedData = normalizeMealIds(dietPlanData);
        setTemplateDetails(normalizedData);
        setIsLoadingTemplate(false);
        return;
      }

      if (!dietPlanData && activeDietPlan?.template_id && !dietPlanError) {
        return;
      }

      if (dietPlanError && activeDietPlan?.template_id) {
        try {
          setIsLoadingTemplate(true);
          const response = await apiClient.get(
            `/diet-templates/${activeDietPlan.template_id}`
          );

          const transformedData = {
            data: response.data.data
          };

          const normalizedData = normalizeMealIds(transformedData);
          setTemplateDetails(normalizedData);
        } catch (error) {
          console.error("Error fetching template details:", error);
          toast.error("Failed to load diet plan");
        } finally {
          setIsLoadingTemplate(false);
        }
      }
    };

    fetchData();
  }, [dietPlanData, dietPlanError, activeDietPlan?.template_id]);

  // Auto-select first phase on initial load
  useEffect(() => {
    if (templateDetails?.data?.phases?.length > 0 && !selectedPhaseId) {
      const firstPhase = templateDetails.data.phases[0];
      setSelectedPhaseId(firstPhase.id);
      
      // Auto-select first day of the first phase
      const firstDay = templateDetails.data?.dayWisePlan?.find(
        (d: any) => d.day_number >= firstPhase.start_day && d.day_number <= firstPhase.end_day
      )?.day_number || firstPhase.start_day;
      setSelectedDay(firstDay);
    }
  }, [templateDetails, selectedPhaseId]);

  // Reset pagination when phase changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedPhaseId]);

  // Auto-select current day and phase when activeDietPlan loads
  useEffect(() => {
    if (activeDietPlan?.current_day && templateDetails?.data?.phases) {
      const currentDay = activeDietPlan.current_day;
      const totalDays = activeDietPlan.totalDays || 30;
      
      if (currentDay > 0 && currentDay <= totalDays) {
        setSelectedDay(currentDay);
        
        // Find the phase that contains the current day
        const phaseForCurrentDay = templateDetails.data.phases.find(
          (p: any) => currentDay >= p.start_day && currentDay <= p.end_day
        );
        
        if (phaseForCurrentDay) {
          setSelectedPhaseId(phaseForCurrentDay.id);
        }
        
        const daysPerPage = 30;
        const targetPage = Math.floor((currentDay - 1) / daysPerPage);
        setCurrentPage(targetPage);
      }
    }
  }, [activeDietPlan?.current_day, activeDietPlan?.totalDays, templateDetails]);

  // Get selected phase details
  const selectedPhase = useMemo(() => {
    if (!selectedPhaseId || !templateDetails?.data?.phases) return null;
    return templateDetails.data.phases.find((p: any) => p.id === selectedPhaseId);
  }, [selectedPhaseId, templateDetails]);

  // Calculate pagination based on selected phase or all days
  const daysPerPage = 30;
  const totalDays = templateDetails?.data?.totalDays || templateDetails?.data?.dayWisePlan?.length || 0;
  
  // If a phase is selected, calculate days for that phase only
  const displayStartDay = selectedPhase ? selectedPhase.start_day : 1;
  const displayEndDay = selectedPhase ? selectedPhase.end_day : totalDays;
  const displayTotalDays = displayEndDay - displayStartDay + 1;
  
  const totalPages = displayTotalDays ? Math.ceil(displayTotalDays / daysPerPage) : 1;
  const currentPageStart = displayStartDay + (currentPage * daysPerPage);
  const currentPageEnd = Math.min(currentPageStart + daysPerPage - 1, displayEndDay);
  const daysInCurrentPage = currentPageEnd - currentPageStart + 1;

  // Calculate meals for selected day
  const mealsForSelectedDay = useMemo(() => {
    if (!templateDetails?.data?.dayWisePlan) return [];
    const dayPlan = templateDetails.data.dayWisePlan.find(
      (d: any) => d.day_number === selectedDay
    );
    return dayPlan?.meals || [];
  }, [templateDetails, selectedDay]);

  // Calculate tips for selected day
  const tipsForSelectedDay = useMemo(() => {
    if (!templateDetails?.data?.dayWisePlan) return null;
    const dayPlan = templateDetails.data.dayWisePlan.find(
      (d: any) => d.day_number == selectedDay
    );
    if (!dayPlan?.tips) return null;
    const dayDetailId = dayPlan.meals?.[0]?.day_detail_id;
    return {
      tips: dayPlan.tips,
      id: dayDetailId
    };
  }, [templateDetails, selectedDay]);

  // Helper function to get phase for a day
  const getPhaseForDay = (day: number) => {
    if (!templateDetails?.data?.phases) return null;
    const phase = templateDetails.data.phases.find(
      (p: any) => day >= p.start_day && day <= p.end_day
    );
    const phaseName = phase?.phase_name;
    // Handle phase_name as object (e.g., {en: "Phase 1"})
    if (typeof phaseName === 'object' && phaseName !== null) {
      return phaseName.en || phaseName.en_US || Object.values(phaseName)[0] || null;
    }
    return phaseName || null;
  };

  // Helper to get phase name as string
  const getPhaseNameString = (phaseName: any) => {
    if (typeof phaseName === 'string') return phaseName;
    if (typeof phaseName === 'object' && phaseName !== null) {
      return phaseName.en || phaseName.en_US || Object.values(phaseName)[0] || 'Phase';
    }
    return 'Phase';
  };

  // Phase color mapping
  const getPhaseColors = (phase: string | null, isSelected: boolean) => {
    if (isSelected) {
      return "border-slate-900 bg-slate-900 text-white shadow-lg";
    }

    if (!phase) {
      return "border-slate-200 bg-white hover:border-slate-300";
    }

    const phaseKey = phase.split(':')[0].trim();

    const colorMap: Record<string, string> = {
      "Phase 1": "border-emerald-300 bg-emerald-50 hover:border-emerald-400",
      "Phase 2": "border-blue-300 bg-blue-50 hover:border-blue-400",
      "Phase 3": "border-purple-300 bg-purple-50 hover:border-purple-400",
      "Phase 4": "border-amber-300 bg-amber-50 hover:border-amber-400",
      "Phase 5": "border-rose-300 bg-rose-50 hover:border-rose-400",
      "Phase 6": "border-cyan-300 bg-cyan-50 hover:border-cyan-400",
      "Phase 7": "border-indigo-300 bg-indigo-50 hover:border-indigo-400",
      "Phase 8": "border-pink-300 bg-pink-50 hover:border-pink-400",
    };

    return colorMap[phaseKey] || "border-slate-200 bg-slate-50 hover:border-slate-300";
  };

  // Render food item helper
  const renderFoodItem = (item: any) => {
    if (Array.isArray(item)) {
      return (
        <div className="flex items-start gap-2">
          <span className="text-slate-400">•</span>
          <div className="flex-1">
            {item.map((choice: any, idx: number) => (
              <span key={idx}>
                <span className="text-slate-700">{choice.name}</span>
                {choice.quantity && (
                  <span className="text-slate-500"> ({choice.quantity})</span>
                )}
                {idx < item.length - 1 && (
                  <span className="text-slate-400 mx-1">OR</span>
                )}
              </span>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-start gap-2">
        <span className="text-slate-400">•</span>
        <div className="flex-1">
          <span className="text-slate-700">{item.name}</span>
          {item.quantity && (
            <span className="text-slate-500"> ({item.quantity})</span>
          )}
        </div>
      </div>
    );
  };

  // Food item management functions
  const addFoodItem = (isChoice: boolean = false) => {
    if (isChoice) {
      setFoodItems([...foodItems, [{ name: "", quantity: "" }]]);
    } else {
      setFoodItems([...foodItems, { name: "", quantity: "" }]);
    }
  };

  const updateFoodItem = (
    index: number,
    field: keyof FoodItem,
    value: string,
    choiceIndex?: number,
  ) => {
    const newItems = [...foodItems];
    if (choiceIndex !== undefined && Array.isArray(newItems[index])) {
      const choices = newItems[index] as FoodItem[];
      choices[choiceIndex] = { ...choices[choiceIndex], [field]: value };
    } else if (!Array.isArray(newItems[index])) {
      newItems[index] = { ...(newItems[index] as FoodItem), [field]: value };
    }
    setFoodItems(newItems);
  };

  const addChoiceToItem = (index: number) => {
    const newItems = [...foodItems];
    if (Array.isArray(newItems[index])) {
      (newItems[index] as FoodItem[]).push({ name: "", quantity: "" });
    } else {
      newItems[index] = [
        newItems[index] as FoodItem,
        { name: "", quantity: "" },
      ];
    }
    setFoodItems(newItems);
  };

  const removeFoodItem = (index: number, choiceIndex?: number) => {
    const newItems = [...foodItems];
    if (choiceIndex !== undefined && Array.isArray(newItems[index])) {
      const choices = newItems[index] as FoodItem[];
      if (choices.length > 1) {
        choices.splice(choiceIndex, 1);
      } else {
        newItems.splice(index, 1);
      }
    } else {
      newItems.splice(index, 1);
    }
    setFoodItems(newItems);
  };

  const resetMealForm = () => {
    setMealType("BREAKFAST");
    setMealTime("08:00");
    setFoodItems([]);
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setMealNotes("");
    setMealReason("");
  };

  // Handle add meal
  const handleAddMeal = async () => {
    const dietPlanId = (activeDietPlan as any)?.diet_plan_id || (activeDietPlan as any)?.id;

    if (!activeDietPlan?.template_id && !dietPlanId) {
      toast.error("No active diet plan to add meal to");
      return;
    }

    if (foodItems.length === 0) {
      toast.error("Please add at least one food item");
      return;
    }

    try {
      if (dietPlanId) {
        const payload = {
          day_number: selectedDay,
          meal_type: mealType,
          start_time: mealTime + ":00",
          food_items: foodItems,
          calories: calories ? Number(calories) : undefined,
          protein_g: protein ? Number(protein) : undefined,
          carbs_g: carbs ? Number(carbs) : undefined,
          fats_g: fats ? Number(fats) : undefined,
          notes: mealNotes || undefined,
          reason: mealReason || undefined,
          is_veg: true,
          reminder_enabled: true,
          is_required: true,
          condition_tags: [],
          day_of_week:"EVERYDAY"
        };
        await addClinicalMealMutation.mutateAsync({
          dietPlanId,
          data: payload,
        });
        toast.success("Meal added successfully");
      } else {
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
        };

        await addMealMutation.mutateAsync({
          templateId: activeDietPlan.template_id,
          data: payload,
        });
        toast.success("Meal added successfully");
      }

      await refetchDietPlan();
      resetMealForm();
      setShowAddMealDialog(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add meal");
    }
  };

  // Handle save tips
  const handleSaveTips = async () => {
    if (!activeDietPlan?.template_id || !dayTips.trim()) {
      toast.error("Please enter tips");
      return;
    }

    try {
      if (tipsForSelectedDay?.id) {
        await updateClinicalDayDetailMutation.mutateAsync({
          dayDetailId: tipsForSelectedDay.id,
          data: { tips: dayTips },
        });
        toast.success("Tips updated successfully");
      } else {
        await addDayDetailMutation.mutateAsync({
          templateId: activeDietPlan.template_id,
          data: { day_number: selectedDay, tips: dayTips },
        });
        toast.success("Tips added successfully");
      }
      await refetchDietPlan();
      setShowEditTipsDialog(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save tips");
    }
  };

  // Handle update meal
  const handleUpdateMeal = async () => {
    const dietPlanId = (activeDietPlan as any)?.diet_plan_id || (activeDietPlan as any)?.id;

    if (!editingMealId) {
      toast.error("No meal selected for editing");
      return;
    }

    if (foodItems.length === 0) {
      toast.error("Please add at least one food item");
      return;
    }

    try {
      if (dietPlanId) {
        const payload = {
          meal_type: mealType,
          start_time: mealTime + ":00",
          food_items: foodItems,
          calories: calories ? Number(calories) : undefined,
          protein_g: protein ? Number(protein) : undefined,
          carbs_g: carbs ? Number(carbs) : undefined,
          fats_g: fats ? Number(fats) : undefined,
          notes: mealNotes || undefined,
          reason: mealReason || undefined,
        };
        await updateClinicalMealMutation.mutateAsync({
          mealId: editingMealId,
          data: payload,
        });
        toast.success("Meal updated successfully");
      } else {
        const payload: any = {
          meal_type: mealType,
          meal_time: mealTime + ":00",
          food_items: foodItems,
          calories: calories ? Number(calories) : undefined,
          protein_g: protein ? Number(protein) : undefined,
          carbs_g: carbs ? Number(carbs) : undefined,
          fats_g: fats ? Number(fats) : undefined,
          notes: mealNotes || undefined,
          reason: mealReason || undefined,
        };

        await updateMealMutation.mutateAsync({
          templateId: activeDietPlan.template_id,
          mealId: editingMealId,
          data: payload,
        });
        toast.success("Meal updated successfully");
      }

      await refetchDietPlan();
      resetMealForm();
      setEditingMealId(null);
      setShowEditMealModal(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update meal");
    }
  };

  // Phase edit handlers
  const openEditPhaseDialog = (phase: any) => {
    setEditingPhaseId(phase.id);
    setPhaseName(phase.phase_name);
    setPhaseInstructions(phase.instructions || "");
    setPhaseGuidelines(phase.guidelines || "");
    setShowEditPhaseDialog(true);
  };

  const handleAutoBullet = (e: React.KeyboardEvent<HTMLTextAreaElement>, fieldType: 'instructions' | 'guidelines') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      // Get the current line
      const lines = value.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Determine bullet type based on field
      const bullet = fieldType === 'instructions' ? '• ' : `${lines.length}. `;
      
      // Insert bullet at cursor position
      const newValue = value.substring(0, start) + '\n' + bullet + value.substring(end);
      
      // Update state
      if (fieldType === 'instructions') {
        setPhaseInstructions(newValue);
      } else {
        setPhaseGuidelines(newValue);
      }
      
      // Set cursor position after the bullet
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + bullet.length + 1;
      }, 0);
    }
  };

  const handleUpdatePhase = async () => {
    if (!editingPhaseId || !phaseName) {
      toast.error("Please fill phase name");
      return;
    }

    try {
      await updatePhaseMutation.mutateAsync({
        templateId: activeDietPlan?.template_id,
        phaseId: editingPhaseId,
        data: {
          phase_name: phaseName,
          instructions: phaseInstructions,
          guidelines: phaseGuidelines,
        },
      });
      toast.success("Phase updated successfully");
      setShowEditPhaseDialog(false);
      setEditingPhaseId(null);
      // Refetch template details
      if (activeDietPlan?.template_id) {
        const response = await apiClient.get(`/diet-templates/${activeDietPlan.template_id}`);
        const transformedData = { data: response.data.data };
        const normalizedData = normalizeMealIds(transformedData);
        setTemplateDetails(normalizedData);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update phase");
    }
  };

  const handleDeleteMeal = (mealId: string) => {
    setMealToDeleteId(mealId);
    setShowDeleteMealDialog(true);
  };

  const onConfirmDeleteMeal = async () => {
    if (!mealToDeleteId) return;

    try {
      const dietPlanId = (activeDietPlan as any)?.diet_plan_id || (activeDietPlan as any)?.id;

      if (dietPlanId) {
        // Use clinical API for diet plans
        await deleteClinicalMealMutation.mutateAsync({ mealId: mealToDeleteId.trim().replace(/'+$/, '') });
      } else {
        // Use template API for templates
        await deleteMealMutation.mutateAsync({
          templateId: activeDietPlan?.template_id,
          mealId: mealToDeleteId.trim().replace(/'+$/, '')
        });
      }

      toast.success("Meal deleted successfully");
      setShowDeleteMealDialog(false);
      setMealToDeleteId(null);

      await refetchDietPlan();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete meal");
    }
  };

  return (
    <>
      <Card className="border-slate-200 shadow-sm mt-6">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-0">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-base font-semibold text-slate-900">
              Diet Plan & Phase PDFs
            </CardTitle>
          </div>
          {/* Tab Navigation */}
          <div className="flex gap-1 -mb-px">
            <button
              onClick={() => setDietPlanTab("plan")}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                dietPlanTab === "plan"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Apple className="h-4 w-4" />
                <span>Diet Plan</span>
              </div>
            </button>
            <button
              onClick={() => setDietPlanTab("grocery")}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                dietPlanTab === "grocery"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Phase PDFs</span>
              </div>
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Diet Plan Tab Content */}
          {dietPlanTab === "plan" && (
            <div className="space-y-6">
              {/* Template Info Cards */}
              <div className="grid gap-5 md:grid-cols-4">
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-3 w-3 text-blue-600" />
                          <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">
                            Duration
                          </p>
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                          {totalDays} Days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Apple className="h-3 w-3 text-emerald-600" />
                          <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">
                            Total Meals
                          </p>
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                          {templateDetails?.data?.meals?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-3 w-3 text-amber-600" />
                          <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">
                            Calories
                          </p>
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                          {templateDetails?.data?.target_calories_min &&
                          templateDetails?.data?.target_calories_max
                            ? `${templateDetails.data.target_calories_min}-${templateDetails.data.target_calories_max}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-3 w-3 text-rose-600" />
                          <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">
                            Selected Day
                          </p>
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                          Day {selectedDay}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Phases Section */}
              {templateDetails?.data?.phases?.length > 0 && (
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
                          {templateDetails.data.phases.length} Phases spanning {totalDays} days
                        </p>
                      </div>
                    </div>

                    {/* Coverage Timeline */}
                    <div className="mb-10 space-y-3">
                      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                        <span>Day 1</span>
                        <span>Timeline Coverage</span>
                        <span>Day {totalDays}</span>
                      </div>
                      <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        {templateDetails.data.phases.map((phase: any, index: number) => {
                          const totalDaysCount = totalDays || 1;
                          const startPercent = ((phase.start_day - 1) / totalDaysCount) * 100;
                          const widthPercent = ((phase.end_day - phase.start_day + 1) / totalDaysCount) * 100;
                          
                          const phaseColors = [
                            "bg-blue-500", "bg-emerald-500", "bg-purple-500", 
                            "bg-amber-500", "bg-rose-500", "bg-cyan-500", 
                            "bg-indigo-500", "bg-pink-500"
                          ];
                          
                          return (
                            <div 
                              key={phase.id}
                              className={cn(
                                "absolute top-0 h-full transition-all hover:brightness-110 cursor-help border-r border-white/20 last:border-0",
                                phaseColors[index % phaseColors.length]
                              )}
                              style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                              title={`${getPhaseNameString(phase.phase_name)}: Day ${phase.start_day} to ${phase.end_day}`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Phase Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {templateDetails.data.phases.map((phase: any, index: number) => {
                        const phaseColors = [
                          { bg: "bg-blue-50", text: "text-blue-700", accent: "bg-blue-500", border: "border-blue-100", hover: "hover:border-blue-300" },
                          { bg: "bg-emerald-50", text: "text-emerald-700", accent: "bg-emerald-500", border: "border-emerald-100", hover: "hover:border-emerald-300" },
                          { bg: "bg-purple-50", text: "text-purple-700", accent: "bg-purple-500", border: "border-purple-100", hover: "hover:border-purple-300" },
                          { bg: "bg-amber-50", text: "text-amber-700", accent: "bg-amber-500", border: "border-amber-100", hover: "hover:border-amber-300" },
                          { bg: "bg-rose-50", text: "text-rose-700", accent: "bg-rose-500", border: "border-rose-100", hover: "hover:border-rose-300" },
                        ];
                        const color = phaseColors[index % phaseColors.length];
                        const isSelected = selectedPhaseId === phase.id;
                        
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
                              {!readOnly && (
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
                                </div>
                              )}
                            </div>
                            
                            <h3 className={cn("text-lg font-bold mb-1", isSelected ? "text-white" : "text-slate-900")}>
                              {getPhaseNameString(phase.phase_name)}
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
                                  setSelectedPhaseId(phase.id);
                                  const firstDay = templateDetails.data?.dayWisePlan?.find(
                                    (d: any) => d.day_number >= phase.start_day && d.day_number <= phase.end_day
                                  )?.day_number || phase.start_day;
                                  setSelectedDay(firstDay);
                                }}
                                variant={isSelected ? "secondary" : "outline"}
                                className={cn("flex-1 h-9 rounded-lg font-bold", isSelected ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-white border-slate-200")}
                              >
                                {isSelected ? "Active View" : "Select Phase"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Phase Instructions and Guidelines */}
              {selectedPhase && (selectedPhase.instructions || selectedPhase.guidelines) && (
                <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Info className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{getPhaseNameString(selectedPhase.phase_name)}</h3>
                        <p className="text-sm text-slate-500">Phase Instructions & Guidelines</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedPhase.instructions && (
                        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Instructions</h4>
                          </div>
                          <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                            <ul className="space-y-2 text-slate-600 text-sm leading-relaxed list-disc list-inside">
                              {selectedPhase.instructions.split('\n').map((line: string, idx: number) => (
                                <li key={idx}>{line}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {selectedPhase.guidelines && (
                        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Guidelines</h4>
                          </div>
                          <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                            <ol className="space-y-2 text-slate-600 text-sm leading-relaxed list-decimal list-inside">
                              {selectedPhase.guidelines.split('\n').map((line: string, idx: number) => (
                                <li key={idx}>{line}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Day Selector */}
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Select Day</h2>
                      {selectedPhase && (
                        <p className="text-sm text-slate-500 mt-1">
                          {getPhaseNameString(selectedPhase.phase_name)} (Days {selectedPhase.start_day}-{selectedPhase.end_day})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs border-slate-300 text-slate-700">
                        Page {currentPage + 1} of {totalPages}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 shadow-sm h-9 w-9 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                          }
                          disabled={currentPage === totalPages - 1}
                          className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 shadow-sm h-9 w-9 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Day Grid */}
                  <div className="grid grid-cols-10 gap-2">
                    {Array.from(
                      {
                        length: daysInCurrentPage,
                      },
                      (_, i) => {
                        const day = currentPageStart + i;
                        const phase = getPhaseForDay(day);
                        const isSelected = selectedDay === day;

                        let isPastDay = false;
                        let isToday = false;
                        if (activeDietPlan?.current_day) {
                          const currentDay = activeDietPlan.current_day;
                          if (day < currentDay) {
                            isPastDay = true;
                          } else if (day === currentDay) {
                            isToday = true;
                          }
                        }

                        let buttonClass = getPhaseColors(phase, isSelected);
                        if (isPastDay) {
                          buttonClass = isSelected
                            ? "border-slate-400 bg-slate-500 text-white"
                            : "border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300";
                        } else if (isToday) {
                          if (isSelected) {
                            buttonClass = "border-indigo-400 bg-emerald-800 text-white";
                          } else {
                            buttonClass =
                              "!bg-emerald-100 ring-2 ring-emerald-500 !bg-emerald-100";
                          }
                        }

                        return (
                          <div key={day} className="relative group">
                            <button
                              data-day={day}
                              onClick={() => setSelectedDay(day)}
                              className={`w-full p-3 rounded-lg border-2 transition-all text-center hover:shadow-md ${buttonClass}`}
                            >
                              <div className="flex flex-col items-center justify-center gap-1">
                                <div className="flex flex-col items-center justify-center">
                                  <div className="text-lg font-bold">{day}</div>
                                  {isToday && (
                                    <div className="text-sm text-emerald-500" >Today</div>
                                  )}
                                </div>
                               
                              </div>
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Day Content */}
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      Day {selectedDay} - Meals
                    </h2>
                    {!readOnly && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDayTips(tipsForSelectedDay?.tips || "");
                            setShowEditTipsDialog(true);
                          }}
                          className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {tipsForSelectedDay ? "Edit Tips" : "Add Tips"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            resetMealForm();
                            setShowAddMealDialog(true);
                          }}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Meal
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Day Tips */}
                  {tipsForSelectedDay && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs font-semibold text-amber-700 uppercase mb-2">
                        Daily Tips
                      </p>
                      <p className="text-sm text-slate-700">
                        {tipsForSelectedDay?.tips}
                      </p>
                    </div>
                  )}

                  {/* Meals List */}
                  {mealsForSelectedDay.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500 mb-4">No meals planned for this day</p>
                      {!readOnly && (
                        <Button
                          size="sm"
                          onClick={() => {
                            resetMealForm();
                            setShowAddMealDialog(true);
                          }}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Meal
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mealsForSelectedDay.map((meal: any, index: number) => (
                        <Card
                          key={meal.id || index}
                          className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-slate-50/30"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-slate-900 capitalize">
                                    {meal.meal_type?.replace("_", " ").toLowerCase()}
                                  </h3>
                                  {meal.is_completed && (
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">
                                  {meal.start_time?.slice(0, 5) || meal.meal_time?.slice(0, 5)}
                                </p>
                              </div>
                              <div className="flex justify-center items-end gap-2">
<div className="flex items-center gap-2">
                                {meal.calories && (
                                  <Badge
                                    variant="outline"
                                    className="border-slate-300 text-slate-700"
                                  >
                                    {meal.calories} kcal
                                  </Badge>
                                )}
                                {meal.protein_g && (
                                  <Badge
                                    variant="outline"
                                    className="border-slate-300 text-slate-700"
                                  >
                                    {meal.protein_g}g protein
                                  </Badge>
                                )}
                              </div>
                              {!readOnly && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingMealId(meal.id);
                                      setMealType(meal.meal_type);
                                      setMealTime(
                                        meal.start_time?.slice(0, 5) ||
                                        meal.meal_time?.slice(0, 5) ||
                                        "08:00"
                                      );
                                      setCalories(meal.calories?.toString() || "");
                                      setProtein(meal.protein_g?.toString() || "");
                                      setCarbs(meal.carbs_g?.toString() || "");
                                      setFats(meal.fats_g?.toString() || "");
                                      setMealNotes(meal.notes || "");
                                      setMealReason(meal.reason || "");
                                      const items = meal.food_items?.map((item: any) => {
                                        if (Array.isArray(item)) {
                                          return item.map((choice: any) => ({
                                            name: choice.name || "",
                                            quantity: choice.quantity || "",
                                          }));
                                        }
                                        return {
                                          name: item.name || "",
                                          quantity: item.quantity || "",
                                        };
                                      }) || [];
                                      setFoodItems(
                                        items.length > 0 ? items : [{ name: "", quantity: "" }]
                                      );
                                      setShowEditMealModal(true);
                                    }}
                                    className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400"
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteMeal(meal.id)}
                                    className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              )}
                              
                              </div>
                            </div>

                            <div className="space-y-2">
                              {meal.food_items?.map((item: any, idx: number) => (
                                <div key={idx}>{renderFoodItem(item)}</div>
                              ))}
                            </div>

                            {meal.notes && (
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500">{meal.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grocery List Tab Content */}
          {dietPlanTab === "grocery" && (
            <div>
              <GroceryListTab
                dietPlanId={
                  (activeDietPlan as any)?.diet_plan_id || (activeDietPlan as any)?.id
                }
                readOnly={readOnly}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Meal Dialog */}
      <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
        <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Add New Meal - Day {selectedDay}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Add food items and notes. Use "Add Choice" to create OR options for food items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meal-type" className="text-sm font-semibold text-slate-700">
                  Meal Type *
                </Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                  <SelectTrigger id="meal-type" className="h-11 border-slate-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal-time" className="text-sm font-semibold text-slate-700">
                  Time *
                </Label>
                <TimePicker
                  id="meal-time"
                  value={mealTime}
                  onChange={(time) => setMealTime(time)}
                  placeholder="Select meal time"
                  className="border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700">Food Items *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFoodItem(false)}
                    className="h-9 border-slate-300 text-slate-700 hover:bg-white"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFoodItem(true)}
                    className="h-9 border-slate-300 text-slate-700 hover:bg-white"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Choice
                  </Button>
                </div>
              </div>

              {foodItems.map((item, idx) => (
                <div key={idx} className="space-y-2 p-4 border border-slate-200 rounded-lg bg-slate-50">
                  {Array.isArray(item) ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold text-slate-600">
                          Choice {idx + 1} (OR Options)
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => addChoiceToItem(idx)}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add OR Option
                        </Button>
                      </div>
                      {item.map((choice, choiceIdx) => (
                        <div key={choiceIdx} className="flex gap-2 ml-4">
                          <Input
                            placeholder="Food name"
                            value={choice.name}
                            onChange={(e) =>
                              updateFoodItem(idx, "name", e.target.value, choiceIdx)
                            }
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Input
                            placeholder="Quantity"
                            value={choice.quantity}
                            onChange={(e) =>
                              updateFoodItem(idx, "quantity", e.target.value, choiceIdx)
                            }
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFoodItem(idx, choiceIdx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex gap-2">
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
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFoodItem(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories" className="text-sm font-semibold text-slate-700">
                  Calories
                </Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-sm font-semibold text-slate-700">
                  Protein (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="g"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-sm font-semibold text-slate-700">
                  Carbs (g)
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="g"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fats" className="text-sm font-semibold text-slate-700">
                  Fats (g)
                </Label>
                <Input
                  id="fats"
                  type="number"
                  placeholder="g"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Additional instructions or notes"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                className="min-h-[80px] border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold text-slate-700">
                Reason
              </Label>
              <Textarea
                id="reason"
                placeholder="Reason for this meal"
                value={mealReason}
                onChange={(e) => setMealReason(e.target.value)}
                className="min-h-[80px] border-slate-300 bg-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddMealDialog(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={addMealMutation.isPending || addClinicalMealMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMeal}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
              disabled={addMealMutation.isPending || addClinicalMealMutation.isPending}
            >
              {addMealMutation.isPending || addClinicalMealMutation.isPending ? (
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
      <Dialog open={showEditMealModal} onOpenChange={setShowEditMealModal}>
        <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Edit Meal
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Update meal food items and notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-meal-type" className="text-sm font-semibold text-slate-700">
                  Meal Type *
                </Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                  <SelectTrigger id="edit-meal-type" className="h-11 border-slate-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-meal-time" className="text-sm font-semibold text-slate-700">
                  Time *
                </Label>
                <TimePicker
                  id="edit-meal-time"
                  value={mealTime}
                  onChange={(time) => setMealTime(time)}
                  placeholder="Select meal time"
                  className="border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700">Food Items *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFoodItem(false)}
                    className="h-9 border-slate-300 text-slate-700 hover:bg-white"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFoodItem(true)}
                    className="h-9 border-slate-300 text-slate-700 hover:bg-white"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Choice
                  </Button>
                </div>
              </div>

              {foodItems.map((item, idx) => (
                <div key={idx} className="space-y-2 p-4 border border-slate-200 rounded-lg bg-slate-50">
                  {Array.isArray(item) ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold text-slate-600">
                          Choice {idx + 1} (OR Options)
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => addChoiceToItem(idx)}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add OR Option
                        </Button>
                      </div>
                      {item.map((choice, choiceIdx) => (
                        <div key={choiceIdx} className="flex gap-2 ml-4">
                          <Input
                            placeholder="Food name"
                            value={choice.name}
                            onChange={(e) =>
                              updateFoodItem(idx, "name", e.target.value, choiceIdx)
                            }
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Input
                            placeholder="Quantity"
                            value={choice.quantity}
                            onChange={(e) =>
                              updateFoodItem(idx, "quantity", e.target.value, choiceIdx)
                            }
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFoodItem(idx, choiceIdx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex gap-2">
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
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFoodItem(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-calories" className="text-sm font-semibold text-slate-700">
                  Calories
                </Label>
                <Input
                  id="edit-calories"
                  type="number"
                  placeholder="kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-protein" className="text-sm font-semibold text-slate-700">
                  Protein (g)
                </Label>
                <Input
                  id="edit-protein"
                  type="number"
                  placeholder="g"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-carbs" className="text-sm font-semibold text-slate-700">
                  Carbs (g)
                </Label>
                <Input
                  id="edit-carbs"
                  type="number"
                  placeholder="g"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fats" className="text-sm font-semibold text-slate-700">
                  Fats (g)
                </Label>
                <Input
                  id="edit-fats"
                  type="number"
                  placeholder="g"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className="h-11 border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes" className="text-sm font-semibold text-slate-700">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                placeholder="Additional instructions or notes"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                className="min-h-[80px] border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-reason" className="text-sm font-semibold text-slate-700">
                Reason
              </Label>
              <Textarea
                id="edit-reason"
                placeholder="Reason for this meal"
                value={mealReason}
                onChange={(e) => setMealReason(e.target.value)}
                className="min-h-[80px] border-slate-300 bg-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditMealModal(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={updateMealMutation.isPending || updateClinicalMealMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMeal}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={updateMealMutation.isPending || updateClinicalMealMutation.isPending}
            >
              {updateMealMutation.isPending || updateClinicalMealMutation.isPending ? (
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
      <Dialog 
        open={showEditTipsDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setDayTips("");
          }
          setShowEditTipsDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px] w-full bg-white overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Day {selectedDay} - Tips
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Add helpful tips and instructions for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 w-full overflow-hidden">
            <div className="space-y-2 w-full overflow-hidden">
              <Label
                htmlFor="tips"
                className="text-sm font-semibold text-slate-700"
              >
                Daily Tips *
              </Label>
              <Textarea
                id="tips"
                placeholder="e.g., In dhaniya jeera water add a few drops of lemon juice or a pinch of black pepper. Soak Emmer Wheat."
                value={dayTips}
                onChange={(e) => setDayTips(e.target.value)}
                className="min-h-[120px] w-full border-slate-300 bg-white !resize-none overflow-x-hidden break-all"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditTipsDialog(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={
                addDayDetailMutation.isPending ||
                updateDayDetailMutation.isPending ||
                updateClinicalDayDetailMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTips}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={
                addDayDetailMutation.isPending ||
                updateDayDetailMutation.isPending ||
                updateClinicalDayDetailMutation.isPending
              }
            >
              {addDayDetailMutation.isPending ||
                updateDayDetailMutation.isPending ||
                updateClinicalDayDetailMutation.isPending ? (
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

      {/* Edit Phase Dialog */}
      <Dialog open={showEditPhaseDialog} onOpenChange={setShowEditPhaseDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Edit Phase Details</DialogTitle>
            <DialogDescription className="text-slate-600">
              Update phase name, instructions, and guidelines.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phase-name" className="text-sm font-semibold text-slate-700">Phase Name *</Label>
              <Input
                id="edit-phase-name"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                className="h-11 border-slate-300 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phase-instructions" className="text-sm font-semibold text-slate-700">Phase Instructions</Label>
              <Textarea
                id="edit-phase-instructions"
                placeholder="Specific instructions for this phase..."
                value={phaseInstructions}
                onChange={(e) => setPhaseInstructions(e.target.value)}
                onKeyDown={(e) => handleAutoBullet(e, 'instructions')}
                className="min-h-[120px] border-slate-300 bg-white resize-none overflow-y-auto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phase-guidelines" className="text-sm font-semibold text-slate-700">Phase Guidelines</Label>
              <Textarea
                id="edit-phase-guidelines"
                placeholder="Specific guidelines for this phase..."
                value={phaseGuidelines}
                onChange={(e) => setPhaseGuidelines(e.target.value)}
                onKeyDown={(e) => handleAutoBullet(e, 'guidelines')}
                className="min-h-[120px] border-slate-300 bg-white resize-none overflow-y-auto"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditPhaseDialog(false);
                setEditingPhaseId(null);
                setPhaseName("");
                setPhaseInstructions("");
                setPhaseGuidelines("");
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

      {/* Delete Meal Confirmation Dialog */}
      <Dialog open={showDeleteMealDialog} onOpenChange={setShowDeleteMealDialog}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Delete Meal</DialogTitle>
            <DialogDescription className="text-slate-600">
              Are you sure you want to delete this meal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteMealDialog(false);
                setMealToDeleteId(null);
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={deleteMealMutation.isPending || deleteClinicalMealMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirmDeleteMeal}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMealMutation.isPending || deleteClinicalMealMutation.isPending}
            >
              {deleteMealMutation.isPending || deleteClinicalMealMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
