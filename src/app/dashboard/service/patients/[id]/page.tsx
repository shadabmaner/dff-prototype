"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Calendar,
  Clock,
  FileText,
  Apple,
  Activity,
  TrendingUp,
  Plus,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  CheckCircle2,
  Loader2,
  Utensils,
  ClipboardList,
  ArrowLeft,
  Stethoscope,
  Phone,
  Mail,
  Target,
  Info,
  Video,
  PhoneCall,
  PlayCircle,
  Dumbbell,
  ShoppingCart,
  RotateCcw,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import { MondayCalendarPicker } from "@/components/dietitian/monday-calendar-picker";
import { apiClient } from "@/lib/api-client";
import { getDietTemplateById } from "@/lib/api/diet-template-client";
import { assignProviders } from "@/lib/api/service-client";
import { usePatientClinicalDetails, usePatientDietPlan, usePatientCollectionProgress, usePatientMindsetLogs } from "@/hooks/use-patient";
import { usePatientMetricsHistory } from "@/hooks/use-patient-metrics";
import {
  useAddMeal,
  useUpdateMeal,
  useDeleteMeal,
  useAddDayDetail,
  useUpdateDayDetail,
  useUpdateClinicalDayDetail,
} from "@/hooks/use-diet-template";
import { useUpdateClinicalMeal, useStartClinicalDietPlan, useAddClinicalMeal } from "@/hooks/use-clinical-diet-plan";
import { useSetBodyMeasurementGoals } from "@/hooks/use-body-measurement-goals";
import { useStaffSlots } from "@/hooks/use-dietitian-clinical";
import GroceryListTab from "@/components/dietitian/GroceryListTab";
import { PatientLogsTabs } from "@/components/patient-logs/patient-logs-tabs";
import type {
  FoodItem,
  MealType,
  CreateMealRequest,
  FoodItemOrChoice,
} from "@/types/diet-template";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { DietPlanPhaseCard } from "@/components/dietitian/diet-plan-phase-card";
import {
  PatientHeaderCard,
  AssignedStaffSection,
  ConsultationTracking,
  ExerciseLogsCard,
  DietPlanProgressCard,
  AssessmentSubmissionsCard,
  WeightTrackingCard,
  SalesCallLogsCard,
  AppointmentsTimeline,
  DietPlanAssignmentModal,
  AssignProvidersDialog,
  SetGoalDrawer,
  ViewGoalDrawer,
  AssessmentDrawer,
  AssessmentDetailsDrawer,
  HistoryCallDetailsDrawer,
} from "@/components/service/patient-details";
import { HistoryCallFormState, HistoryCallSheet, PREDEFINED_LOCATIONS } from "@/components/service/history-call-sheet";
import { HistoryCallRequest } from "@/types/service-api";
import { useRescheduleHistoryCall, useScheduleHistoryCall } from "@/hooks/use-service-api";
import { useStaffDropdown } from "@/hooks/use-dropdowns";

export default function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [showDietPlanModal, setShowDietPlanModal] = useState(false);
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [showMondayCalendar, setShowMondayCalendar] = useState(false);
  const [showAssessmentDrawer, setShowAssessmentDrawer] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [selectedHistoryCall, setSelectedHistoryCall] = useState<any>(null);
  const [showSalesLeadDrawer, setShowSalesLeadDrawer] = useState(false);
  const [dietPlanTab, setDietPlanTab] = useState<"plan" | "grocery">("plan");
  const [showRescheduleSheet, setShowRescheduleSheet] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null);
  const [showGoalsDrawer, setShowGoalsDrawer] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    slotId: "",
    appointmentType: "consultation",
    reason: "",
    mode: "video" as "audio" | "video",
    meetingLink: "",
  });
  const [showSetGoalDrawer, setShowSetGoalDrawer] = useState(false);
  const [showViewGoalDrawer, setShowViewGoalDrawer] = useState(false);
  const [goalForm, setGoalForm] = useState({
    weight_kg: "",
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    arm_cm: "",
    calf_cm: "",
    muscle_mass_percentage: "",
    target_date: "",
  });
  const [goalFormErrors, setGoalFormErrors] = useState<Record<string, string>>({});
  const scheduleHistoryCallMutation = useScheduleHistoryCall();
  const rescheduleHistoryCallMutation = useRescheduleHistoryCall()
  const [showAssignProvidersDialog, setShowAssignProvidersDialog] = useState(false);
  const [isAssigningProviders, setIsAssigningProviders] = useState(false);
  const [assignProvidersForm, setAssignProvidersForm] = useState({
    doctor_id: "",
    nutritionist_id: "",
    fitness_coach_id: "",
  });

  // Fetch patient clinical details using TanStack Query
  const {
    data: patientClinicalData,
    isLoading: isLoadingPatient,
    error: patientError,
    refetch: refetchPatientDetails,
  } = usePatientClinicalDetails(id);
  const { data: metricsData, isLoading: isLoadingMetrics } = usePatientMetricsHistory(id);
  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(rescheduleForm.appointmentDate);
  const availableSlots = slotsResponse?.data || [];

  const getProgramDay = (startDate: any) => {
    if (!startDate) return "Not Started";

    const start: any = new Date(startDate);
    const today: any = new Date();

    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    if (diffTime < 0) return "Not Started";
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return `Day ${diffDays}`;
  };

  const bodyMeasurementGoals = patientClinicalData?.data?.body_measurement_goals || [];

  // Fetch patient diet plan details using TanStack Query
  const {
    data: dietPlanData,
    isLoading: isLoadingDietPlanData,
    error: dietPlanError,
    refetch: refetchDietPlan,
  } = usePatientDietPlan(id);
  const { data: doctors = [], isLoading: isLoadingDoctors } = useStaffDropdown({ role: "doctor" })
  const { data: nutritionists = [], isLoading: isLoadingNutritionists } = useStaffDropdown({ role: "dietitian" })
  const { data: fitnessCoaches = [], isLoading: isLoadingFitnessCoaches } = useStaffDropdown({ role: "fitness_coach" })
  
  console.log("Staff dropdown data:", { doctors, nutritionists, fitnessCoaches })
  const { data: collectionProgress, isLoading: isLoadingCollectionProgress } = usePatientCollectionProgress(id);
  const { data: mindsetLogs } = usePatientMindsetLogs(id);
  console.log(mindsetLogs, "mindsetLogs")
  const exerciseLogs = useMemo(() => {
    if (!collectionProgress?.data || !Array.isArray(collectionProgress.data)) return [];

    // Flatten items from all collections
    const allItems = collectionProgress.data.flatMap((collection: any) =>
      (collection.items || []).map((item: any) => ({
        ...item,
        collection_name: collection.collection_name
      }))
    );

    // Filter to only show items that are either completed or unlocked
    // Usually "logs" should show what has happened
    return allItems
      .filter((item: any) => item.is_completed || item.is_unlocked)
      .sort((a: any, b: any) => {
        // Sort by completed_at desc, then by day_number desc as fallback
        if (a.completed_at && b.completed_at) {
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
        }
        if (a.completed_at) return -1;
        if (b.completed_at) return 1;
        return b.day_number - a.day_number;
      });
  }, [collectionProgress]);

  // Diet templates state
  const [dietTemplates, setDietTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  // Patient diet plan state
  const [patientDietPlan, setPatientDietPlan] = useState<any>(null);
  const [isLoadingDietPlan, setIsLoadingDietPlan] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [templateDetails, setTemplateDetails] = useState<any>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Meal and tip editing mutations
  const addMealMutation = useAddMeal();
  const updateMealMutation = useUpdateMeal();
  const updateClinicalMealMutation = useUpdateClinicalMeal();
  const addClinicalMealMutation = useAddClinicalMeal();
  const deleteMealMutation = useDeleteMeal();
  const addDayDetailMutation = useAddDayDetail();
  const updateDayDetailMutation = useUpdateDayDetail();
  const updateClinicalDayDetailMutation = useUpdateClinicalDayDetail();
  const startClinicalDietPlanMutation = useStartClinicalDietPlan();
  const setBodyGoalsMutation = useSetBodyMeasurementGoals();
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  // Meal editing state
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [showEditTipsDialog, setShowEditTipsDialog] = useState(false);
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
  const [isHistoryCallSubmitting, setIsHistoryCallSubmitting] = useState(false)
  const [showScheduleHistoryCallDrawer, setShowScheduleHistoryCallDrawer] = useState(false)
  const [historyCallPatient, setHistoryCallPatient] = useState<any | null>(null)
  const [historyCallForm, setHistoryCallForm] = useState<HistoryCallFormState>({
    doctor_id: "",
    nutritionist_id: "",
    fitness_coach_id: "",
    scheduled_date: "",
    scheduled_time: "",
    duration_mins: 45,
    mode: "video" as "video" | "audio" | "offline",
    notes: "",
    meeting_link: "",
    offline_location_id: "",
  })
  const MEAL_TYPES: MealType[] = [
    "EARLY_MORNING",
    "BREAKFAST",
    "MID_MORNING",
    "LUNCH",
    "EVENING_SNACK",
    "DINNER",
    "SNACK",
  ];

  // Extract patient and active diet plan from clinical data
  const patient = patientClinicalData?.data?.patient;
  const enrollment = patientClinicalData?.data?.enrollment;
  const activeDietPlan: any = patientClinicalData?.data?.active_diet_plan;
  const currentAppointments = patientClinicalData?.data?.current_appointments || [];
  const upcomingAppointments = patientClinicalData?.data?.upcoming_appointments || [];
  const completedAppointments = patientClinicalData?.data?.completed_appointments || [];
  const missingAppointments = (patientClinicalData?.data as any)?.missing_appointments || [];

  const upcomingHistoryCall = upcomingAppointments.find(
    (app: any) => app.call_type === "history_call"
  );

  const allAppointments = [
    ...currentAppointments,
    ...upcomingAppointments,
    ...completedAppointments,
    ...missingAppointments,
  ];
  const isHistoryCallShow = currentAppointments?.some((app: any) => app.call_type === "history_call") || upcomingAppointments?.some((app: any) => app.call_type === "history_call") || completedAppointments?.some((app: any) => app.call_type === "history_call") || missingAppointments?.some((app: any) => app.call_type === "history_call");
  const historyCallFormCount = currentAppointments?.filter((app: any) => app.call_type === "history_call").length + upcomingAppointments?.filter((app: any) => app.call_type === "history_call").length + completedAppointments?.filter((app: any) => app.call_type === "history_call").length + missingAppointments?.filter((app: any) => app.call_type === "history_call").length;
  const assessmentSubmissions =
    patientClinicalData?.data?.assessment_submissions || [];
  const exerciseJourney = activeDietPlan?.exercise_progress;
  const hasDietPlan = Boolean(
    activeDietPlan?.template_id || templateDetails?.data,
  );
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 16; hour++) {
      for (let minute = 0; minute < 60; minute += 20) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        slots.push(time)
      }
    }
    slots.push("17:00")
    return slots
  }
  const timeSlots = generateTimeSlots()

  const calculateAge = (dob?: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const patientAge = patient?.date_of_birth
    ? calculateAge(patient.date_of_birth)
    : null;

  // Helper function to normalize meal IDs by trimming spaces
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

  // Use dietPlanData from usePatientDietPlan hook, or fallback to fetching template
  useEffect(() => {
    const fetchData = async () => {
      // If dietPlanData exists and has the full structure, use it
      if (dietPlanData?.data?.dayWisePlan) {
        console.log("Using dietPlanData from patient diet plan endpoint");
        const normalizedData = normalizeMealIds(dietPlanData);
        setTemplateDetails(normalizedData);
        setIsLoadingTemplate(false);
        return;
      }

      // Fallback: If patient diet plan endpoint doesn't exist or has no data,
      // but we have a template_id, fetch the template directly
      if (!dietPlanData && activeDietPlan?.template_id && !dietPlanError) {
        console.log("dietPlanData not available yet, waiting...");
        return;
      }

      if (dietPlanError && activeDietPlan?.template_id) {
        console.log("Patient diet plan endpoint failed, fetching template directly");
        try {
          setIsLoadingTemplate(true);
          const response = await apiClient.get(
            `/diet-templates/${activeDietPlan.template_id}`
          );

          // Transform template response to match expected structure
          const transformedData = {
            data: response.data.data
          };

          const normalizedData = normalizeMealIds(transformedData);
          setTemplateDetails(normalizedData);
        } catch (error) {
          console.error("Error fetching template details:", error);
          toast.error("Failed to load diet plan", {
            description: "Please try again",
          });
        } finally {
          setIsLoadingTemplate(false);
        }
      }
    };

    fetchData();
  }, [dietPlanData, dietPlanError, activeDietPlan?.template_id]);

  // Fetch diet templates when modal opens
  useEffect(() => {
    const fetchDietTemplates = async () => {
      if (!showDietPlanModal) return;

      try {
        setIsLoadingTemplates(true);
        const response = await apiClient.get("/diet-templates", {
          params: {
            page: 1,
            limit: 100,
          },
        });
        console.log(response, "response");
        setDietTemplates(response.data.data || []);
      } catch (error: any) {
        console.error("Error fetching diet templates:", error);
        toast.error("Failed to load diet templates", {
          description: error?.message || "Please try again",
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchDietTemplates();
  }, [showDietPlanModal]);

  // Calculate meals and tips for selected day
  const daysPerPage = 30;
  // Use totalDays from API response
  const totalDays = templateDetails?.data?.totalDays || templateDetails?.data?.dayWisePlan?.length || 0;
  const totalPages = totalDays ? Math.ceil(totalDays / daysPerPage) : 1;
  const currentPageStart = currentPage * daysPerPage + 1;
  const currentPageEnd = Math.min((currentPage + 1) * daysPerPage, totalDays);

  const mealsForSelectedDay = useMemo(() => {
    if (!templateDetails?.data?.dayWisePlan) return [];
    const dayPlan = templateDetails.data.dayWisePlan.find(
      (d: any) => d.day_number === selectedDay
    );
    return dayPlan?.meals || [];
  }, [templateDetails, selectedDay]);

  const tipsForSelectedDay = useMemo(() => {
    if (!templateDetails?.data?.dayWisePlan) return null;
    const dayPlan = templateDetails.data.dayWisePlan.find(
      (d: any) => d.day_number === selectedDay
    );
    if (!dayPlan?.tips) return null;
    // Get day_detail_id from the first meal if available
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
    return phase?.phase_name || null;
  };

  // Phase color mapping
  const getPhaseColors = (phase: string | null, isSelected: boolean) => {
    if (isSelected) {
      return "border-slate-900 bg-slate-900 text-white shadow-lg";
    }

    if (!phase) {
      return "border-slate-200 bg-white hover:border-slate-300";
    }

    // Extract phase number from phase name (e.g., "Phase 1: Detox & Reset" -> "Phase 1")
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
        // Use the new clinical API endpoint
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
          sort_order: 0,
          condition_tags: []
        };
        await addClinicalMealMutation.mutateAsync({
          dietPlanId,
          data: payload,
        });
        toast.success("Meal added successfully");
      } else {
        // Fallback to template API if only template exists
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

      await Promise.all([refetchPatientDetails(), refetchDietPlan()]);
      resetMealForm();
      setShowAddMealDialog(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add meal");
    }
  };

  const handleSaveTips = async () => {
    if (!activeDietPlan?.template_id || !dayTips.trim()) {
      toast.error("Please enter tips");
      return;
    }

    try {
      if (tipsForSelectedDay?.id) {
        // Use the new clinical API endpoint
        await updateClinicalDayDetailMutation.mutateAsync({
          dayDetailId: tipsForSelectedDay.id,
          data: { tips: dayTips },
        });
        toast.success("Tips updated successfully");
      } else {
        // For new tips, still use the old template API
        await addDayDetailMutation.mutateAsync({
          templateId: activeDietPlan.template_id,
          data: { day_number: selectedDay, tips: dayTips },
        });
        toast.success("Tips added successfully");
      }
      setShowEditTipsDialog(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save tips");
    }
  };
  const openHistoryCallDrawer = (appointmentPatient: any) => {
    let scheduledDate = appointmentPatient.history_call_date || appointmentPatient.appointment_date
    let scheduledTime = appointmentPatient.history_call_time || appointmentPatient.start_time

    if (!scheduledDate || !scheduledTime) {
      const now = new Date()
      scheduledDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      scheduledTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      if (currentHours < 9) {
        scheduledTime = "09:00"
      } else if (currentHours >= 17) {
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)
        scheduledDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
        scheduledTime = "09:00"
      } else {
        const nextSlot = timeSlots.find(slot => {
          const [slotHour, slotMinute] = slot.split(':').map(Number)
          return slotHour > currentHours || (slotHour === currentHours && slotMinute > currentMinutes)
        })
        scheduledTime = nextSlot || "09:00"
      }
    } else {
      if (scheduledDate.includes('T')) scheduledDate = scheduledDate.split('T')[0]
      if (scheduledTime) scheduledTime = scheduledTime.slice(0, 5)
    }

    const staffArray: Array<{ staff_id: string; staff_type: string }> =
      Array.isArray(appointmentPatient.staff) ? appointmentPatient.staff : []
    const doctorFromArray = staffArray.find((s) => s.staff_type === "doctor")
    const dietitianFromArray = staffArray.find((s) => s.staff_type === "dietitian")
    const coachFromArray = staffArray.find((s) => s.staff_type === "fitness_coach")

    const resolvedDoctorId = doctorFromArray?.staff_id || appointmentPatient.doctor_id || ""
    const resolvedNutritionistId = dietitianFromArray?.staff_id || appointmentPatient.nutritionist_id || ""
    const resolvedFitnessCoachId = coachFromArray?.staff_id || appointmentPatient.fitness_coach_id || ""

    setHistoryCallPatient(appointmentPatient)
    setHistoryCallForm({
      doctor_id: resolvedDoctorId,
      nutritionist_id: resolvedNutritionistId,
      fitness_coach_id: resolvedFitnessCoachId,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      duration_mins: appointmentPatient.duration_mins || 45,
      mode: appointmentPatient.mode || "video",
      notes: appointmentPatient.notes || "",
      meeting_link: appointmentPatient.history_call_meeting_link || "",
      offline_location_id: "",
    })
    setShowScheduleHistoryCallDrawer(true)
  }

  const handleHistoryCallDrawerChange = (open: boolean) => {
    setShowScheduleHistoryCallDrawer(open)
    if (!open) {
      setIsHistoryCallSubmitting(false)
      setHistoryCallPatient(null)
      setHistoryCallForm({
        doctor_id: "",
        nutritionist_id: "",
        fitness_coach_id: "",
        scheduled_date: "",
        scheduled_time: "",
        duration_mins: 45,
        mode: "video" as "video" | "audio" | "offline",
        notes: "",
        meeting_link: "",
        offline_location_id: "",
      })
    }
  }

  const handleHistoryCallFormChange = <K extends keyof HistoryCallFormState>(
    field: K,
    value: HistoryCallFormState[K]
  ) => {
    setHistoryCallForm((prev) => ({ ...prev, [field]: value }))
  }

  const openAssignProvidersDialog = () => {
    const currentDoctorId = enrollment?.assigned_staff?.doctor?.id || ""
    const currentNutritionistId = enrollment?.assigned_staff?.nutritionist?.id || ""
    const currentFitnessCoachId = enrollment?.assigned_staff?.fitness_coach?.id || ""
    
    console.log("Opening assign providers dialog", {
      currentDoctorId,
      currentNutritionistId,
      currentFitnessCoachId,
      doctors,
      nutritionists,
      fitnessCoaches
    })
    
    setAssignProvidersForm({
      doctor_id: currentDoctorId,
      nutritionist_id: currentNutritionistId,
      fitness_coach_id: currentFitnessCoachId,
    })
    setShowAssignProvidersDialog(true)
  }

  const handleAssignProvidersSubmit = async () => {
    if (!assignProvidersForm.doctor_id || !assignProvidersForm.nutritionist_id || !assignProvidersForm.fitness_coach_id) {
      toast.error("Please select all providers", {
        description: "Doctor, nutritionist, and fitness coach are required",
      })
      return
    }

    setIsAssigningProviders(true)
    try {
      await assignProviders(id, assignProvidersForm)
      toast.success("Providers assigned successfully")
      setShowAssignProvidersDialog(false)
      refetchPatientDetails()
    } catch (error: any) {
      toast.error("Failed to assign providers", {
        description: error?.response?.data?.message || "Please try again",
      })
    } finally {
      setIsAssigningProviders(false)
    }
  }

  const handleHistoryCallSubmit = async () => {
    if (!historyCallPatient || isHistoryCallSubmitting) return

    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const [hours, minutes] = historyCallForm.scheduled_time.split(':').map(Number)

    if (hours < 9 || hours >= 17) {
      toast.error("Invalid call time", { description: "Please select a time between 9:00 AM and 5:00 PM." })
      return
    }
    if (historyCallForm.scheduled_date === todayStr) {
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      if (hours < currentHours || (hours === currentHours && minutes <= currentMinutes)) {
        toast.error("Invalid call time", { description: "For today, please select a time in the future." })
        return
      }
    }
    if (historyCallForm.mode === "offline" && !historyCallForm.offline_location_id) {
      toast.error("Please select an address", { description: "Address is required for in-person consultations." })
      return
    }

    const payload: HistoryCallRequest = {
      doctor_id: historyCallForm.doctor_id,
      nutritionist_id: historyCallForm.nutritionist_id,
      fitness_coach_id: historyCallForm.fitness_coach_id || undefined,
      scheduled_date: historyCallForm.scheduled_date,
      scheduled_time: historyCallForm.scheduled_time,
      duration_mins: historyCallForm.duration_mins,
      mode: historyCallForm.mode,
      notes: historyCallForm.notes || undefined,
    }
    if (historyCallForm.mode === "video") {
      const trimmedLink = historyCallForm.meeting_link?.trim()
      if (trimmedLink) payload.meeting_link = trimmedLink
    }
    if (historyCallForm.mode === "offline" && historyCallForm.offline_location_id) {
      const location = PREDEFINED_LOCATIONS[historyCallForm.offline_location_id]
      payload.offline_location = {
        city: location.city,
        address: location.address,
        pincode: location.pincode,
        displayName: location.displayName,
      }
    }

    const isRescheduleCall = Boolean(historyCallPatient.appointment_id)
    setIsHistoryCallSubmitting(true)

    if (isRescheduleCall) {
      rescheduleHistoryCallMutation.mutate(
        { appointmentId: historyCallPatient.appointment_id!, data: payload },
        {
          onSuccess: () => {
            toast.success("History call rescheduled", {
              description: `Rescheduled for ${historyCallForm.scheduled_date} at ${historyCallForm.scheduled_time}`,
            })
            setIsHistoryCallSubmitting(false)
            handleHistoryCallDrawerChange(false)
            refetchPatientDetails()
          },
          onError: (error: any) => {
            toast.error("Failed to reschedule call", { description: error?.message || "Please try again" })
            setIsHistoryCallSubmitting(false)
          },
        }
      )
    } else {
      scheduleHistoryCallMutation.mutate(
        { patientId: historyCallPatient.patient_id, data: payload },
        {
          onSuccess: () => {
            toast.success("History call scheduled", {
              description: `Scheduled for ${historyCallForm.scheduled_date} at ${historyCallForm.scheduled_time}`,
            })
            setIsHistoryCallSubmitting(false)
            handleHistoryCallDrawerChange(false)
            refetchPatientDetails()
          },
          onError: (error: any) => {
            toast.error("Failed to schedule call", {
              description: error?.response?.data?.message || error?.message || "Please try again",
            })
            setIsHistoryCallSubmitting(false)
          },
        }
      )
    }
  }
  const handleSendDietPlan = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a diet plan template");
      return;
    }

    if (!patient?.id) {
      toast.error("Patient information not available");
      return;
    }

    try {
      const payload = {
        patient_id: patient.id,
        title: "New",
        start_date: new Date().toISOString().split("T")[0],
      };

      await apiClient.post(
        `/diet-templates/${selectedTemplateId}/assign`,
        payload,
      );

      toast.success("Diet plan assigned successfully", {
        description: "The patient will receive the diet plan notification",
      });

      setShowDietPlanModal(false);

      // Refetch patient clinical details to get updated active_diet_plan
      window.location.reload();
    } catch (error: any) {
      console.error("Error assigning diet plan:", error);
      toast.error("Failed to assign diet plan", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again",
      });
    }
  };

  const handleStartDietPlan = async (selectedMonday: Date) => {
    const dietPlanId =
      (activeDietPlan as any)?.diet_plan_id || (activeDietPlan as any)?.id;

    if (!dietPlanId) {
      toast.error("No active diet plan to start");
      return;
    }

    try {
      await startClinicalDietPlanMutation.mutateAsync({
        dietPlanId,
        data: {
          journey_start_date: selectedMonday.toISOString().split("T")[0],
        },
      });

      toast.success(
        `Diet plan journey started from ${selectedMonday.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`,
      );
      setShowMondayCalendar(false);
    } catch (error: any) {
      console.error("Failed to start diet plan journey", error);
      toast.error(
        error?.response?.data?.message || "Failed to start the diet plan journey",
      );
    }
  };

  const validateGoalForm = () => {
    const errors: Record<string, string> = {};

    // Weight validation (20-500 kg)
    if (goalForm.weight_kg && (!/^\d+$/.test(goalForm.weight_kg) || parseFloat(goalForm.weight_kg) < 20 || parseFloat(goalForm.weight_kg) > 500)) {
      errors.weight_kg = "Weight must be between 20 and 500 kg";
    }

    // Chest measurement validation (50-200 cm)
    if (goalForm.chest_cm && (!/^\d+$/.test(goalForm.chest_cm) || parseFloat(goalForm.chest_cm) < 50 || parseFloat(goalForm.chest_cm) > 200)) {
      errors.chest_cm = "Chest measurement must be between 50 and 200 cm";
    }

    // Waist measurement validation (40-200 cm)
    if (goalForm.waist_cm && (!/^\d+$/.test(goalForm.waist_cm) || parseFloat(goalForm.waist_cm) < 40 || parseFloat(goalForm.waist_cm) > 200)) {
      errors.waist_cm = "Waist measurement must be between 40 and 200 cm";
    }

    // Hips measurement validation (50-200 cm)
    if (goalForm.hips_cm && (!/^\d+$/.test(goalForm.hips_cm) || parseFloat(goalForm.hips_cm) < 50 || parseFloat(goalForm.hips_cm) > 200)) {
      errors.hips_cm = "Hips measurement must be between 50 and 200 cm";
    }

    // Arm measurement validation (15-80 cm)
    if (goalForm.arm_cm && (!/^\d+$/.test(goalForm.arm_cm) || parseFloat(goalForm.arm_cm) < 15 || parseFloat(goalForm.arm_cm) > 80)) {
      errors.arm_cm = "Arm measurement must be between 15 and 80 cm";
    }

    // Calf measurement validation (15-80 cm)
    if (goalForm.calf_cm && (!/^\d+$/.test(goalForm.calf_cm) || parseFloat(goalForm.calf_cm) < 15 || parseFloat(goalForm.calf_cm) > 80)) {
      errors.calf_cm = "Calf measurement must be between 15 and 80 cm";
    }

    // Muscle mass percentage validation (1-100%)
    if (goalForm.muscle_mass_percentage && (!/^\d+$/.test(goalForm.muscle_mass_percentage) || parseFloat(goalForm.muscle_mass_percentage) < 1 || parseFloat(goalForm.muscle_mass_percentage) > 100)) {
      errors.muscle_mass_percentage = "Muscle mass must be between 1 and 100%";
    }

    // Target date validation (must be future date)
    if (goalForm.target_date) {
      const selectedDate = new Date(goalForm.target_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.target_date = "Target date must be in the future";
      }
    }

    setGoalFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSetGoal = async () => {
    if (!patient?.id) {
      toast.error("Patient information not available");
      return;
    }

    const hasAnyValue = Object.values(goalForm).some(value => value !== "");
    if (!hasAnyValue) {
      toast.error("Please enter at least one goal");
      return;
    }

    if (!validateGoalForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      const data: any = {};
      if (goalForm.weight_kg) data.weight_kg = parseFloat(goalForm.weight_kg);
      if (goalForm.chest_cm) data.chest_cm = parseFloat(goalForm.chest_cm);
      if (goalForm.waist_cm) data.waist_cm = parseFloat(goalForm.waist_cm);
      if (goalForm.hips_cm) data.hips_cm = parseFloat(goalForm.hips_cm);
      if (goalForm.arm_cm) data.arm_cm = parseFloat(goalForm.arm_cm);
      if (goalForm.calf_cm) data.calf_cm = parseFloat(goalForm.calf_cm);
      if (goalForm.muscle_mass_percentage) data.muscle_mass_percentage = parseFloat(goalForm.muscle_mass_percentage);
      if (goalForm.target_date) data.target_date = goalForm.target_date;

      await setBodyGoalsMutation.mutateAsync({
        patientId: patient.id,
        data,
      });

      toast.success("Goals set successfully");
      setShowSetGoalDrawer(false);
      setGoalForm({
        weight_kg: "",
        chest_cm: "",
        waist_cm: "",
        hips_cm: "",
        arm_cm: "",
        calf_cm: "",
        muscle_mass_percentage: "",
        target_date: "",
      });
      setGoalFormErrors({});
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to set goals");
    }
  };

  const handleRescheduleCall = async () => {
    if (!rescheduleForm.appointmentDate || !rescheduleForm.startTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsRescheduling(true);

    try {
      const payload: any = {
        patientId: id,
        staffType: "dietitian",
        staffId: enrollment?.assigned_staff?.nutritionist?.id || "",
        slotId: rescheduleForm.slotId || undefined,
        appointmentDate: rescheduleForm.appointmentDate,
        startTime: rescheduleForm.startTime,
        endTime: rescheduleForm.endTime,
        appointmentType: rescheduleForm.appointmentType,
        reason: rescheduleForm.reason || undefined,
        mode: rescheduleForm.mode,
      };

      if (rescheduleForm.mode === "video" && rescheduleForm.meetingLink) {
        payload.meetingLink = rescheduleForm.meetingLink;
      }

      await apiClient.post("/appointments", payload);

      toast.success("Call rescheduled successfully", {
        description: `New appointment on ${rescheduleForm.appointmentDate} at ${rescheduleForm.startTime}`,
      });

      setShowRescheduleSheet(false);
      setRescheduleAppointmentId(null);
      setRescheduleForm({
        appointmentDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        slotId: "",
        appointmentType: "consultation",
        reason: "",
        mode: "video" as "audio" | "video",
        meetingLink: "",
      });
      window.location.reload();
    } catch (error: any) {
      toast.error("Failed to schedule call", {
        description: error?.response?.data?.message || error?.message || "Please try again",
      });
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleRescheduleExisting = async (appointmentId: string) => {
    if (!rescheduleForm.appointmentDate || !rescheduleForm.startTime) {
      toast.error("Please select an available slot");
      return;
    }

    setIsRescheduling(true);

    try {
      const payload: any = {
        newDate: rescheduleForm.appointmentDate,
        newStartTime: rescheduleForm.startTime,
        newEndTime: rescheduleForm.endTime,
        slotId: rescheduleForm.slotId,
      };

      await apiClient.post(`/appointments/${appointmentId}/reschedule`, payload);

      toast.success("Appointment rescheduled successfully");

      setShowRescheduleSheet(false);
      setRescheduleAppointmentId(null);
      setRescheduleForm({
        appointmentDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        slotId: "",
        appointmentType: "consultation",
        reason: "",
        mode: "video" as "audio" | "video",
        meetingLink: "",
      });
      window.location.reload();
    } catch (error: any) {
      toast.error("Failed to reschedule call", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again",
      });
    } finally {
      setIsRescheduling(false);
    }
  };

  const renderAppointmentCard = (appointment: any) => {
    const isHistoryCall = appointment.call_type === 'history_call'
    const Icon = appointment.mode === 'video' ? Video : PhoneCall
    const appointmentDate = new Date(appointment.appointment_date || appointment.scheduled_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    appointmentDate.setHours(0, 0, 0, 0)
    const isToday = appointmentDate.getTime() === today.getTime()

    return (
      <div key={appointment.id} className="relative flex items-start gap-4">
        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${appointment.status === 'completed' ? 'bg-blue-100 border-2 border-blue-300' :
          appointment.status === 'confirmed' ? 'bg-emerald-100 border-2 border-emerald-300' :
            appointment.status === 'pending' ? 'bg-amber-100 border-2 border-amber-300' :
              'bg-slate-100 border-2 border-slate-300'
          }`}>
          <Icon className={`h-5 w-5 ${appointment.status === 'completed' ? 'text-blue-600' :
            appointment.status === 'confirmed' ? 'text-emerald-600' :
              appointment.status === 'pending' ? 'text-amber-600' :
                'text-slate-600'
            }`} />
        </div>
        <div className="flex-1 pb-6">
          <div
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
            onClick={() => setSelectedHistoryCall(appointment)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900 text-base">
                    {appointment.appointment_type?.charAt(0).toUpperCase() + appointment.appointment_type?.slice(1) || 'Appointment'}
                  </h4>
                  {isHistoryCall && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                      History Call
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-xs capitalize ${appointment.status === 'completed' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    appointment.status === 'confirmed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      appointment.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        appointment.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                          'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                    {appointment.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-slate-300 text-slate-700 capitalize">
                    {appointment.mode}
                  </Badge>
                  {appointment.call_type && (
                    <Badge variant="outline" className="text-xs border-slate-300 text-slate-700 capitalize">
                      {appointment.call_type.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                {appointment.reason && (
                  <p className="text-sm text-slate-600 mt-2">{appointment.reason}</p>
                )}
                {appointment.notes && (
                  <p className="text-xs text-slate-500 mt-2 italic">{appointment.notes}</p>
                )}
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between mt-4">
              <div className="grid grid-cols-3 gap-4 text-sm flex-1">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Date</p>
                  <div className="flex items-center gap-1 text-slate-900 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-600" />
                    {new Date(appointment.appointment_date || appointment.scheduled_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Time</p>
                  <div className="flex items-center gap-1 text-slate-900 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-600" />
                    {appointment.start_time?.slice(0, 5)} - {appointment.end_time?.slice(0, 5)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Duration</p>
                  <div className="flex items-center gap-1 text-slate-900 font-medium">
                    <Activity className="h-3.5 w-3.5 text-slate-600" />
                    {appointment.duration_mins} mins
                  </div>
                </div>
              </div>

              {(appointment.status === 'confirmed' || appointment.status === 'pending' || appointment.status === 'missing') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRescheduleAppointmentId(appointment.appointment_id || appointment.id);
                    setRescheduleForm({
                      ...rescheduleForm,
                      appointmentDate: (appointment.appointment_date || appointment.scheduled_date)?.split('T')[0] || new Date().toISOString().split('T')[0],
                      startTime: "",
                      endTime: "",
                      slotId: "",
                      appointmentType: appointment.appointment_type || "consultation",
                      mode: (appointment.mode as "audio" | "video") || "video",
                      meetingLink: appointment.meeting_link || "",
                    });
                    setShowRescheduleSheet(true);
                  }}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8 text-xs px-3"
                >
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                  Reschedule
                </Button>
              )
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoadingPatient) {
    return (
      <div className="space-y-6 p-6 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <Skeleton className="h-10 w-24" />
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Breadcrumb */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
      </div>

      {/* Patient Header Card */}
      <PatientHeaderCard
        patient={patient}
        id={id}
        enrollment={enrollment}
        patientAge={patientAge}
        bodyMeasurementGoals={bodyMeasurementGoals}
        metricsData={metricsData}
        assessmentSubmissions={assessmentSubmissions}
        isHistoryCallShow={isHistoryCallShow}
        onShowViewGoalDrawer={() => setShowViewGoalDrawer(true)}
        onShowAssessmentDrawer={() => setShowAssessmentDrawer(true)}
        onScheduleHistoryCall={() => {
          openHistoryCallDrawer({
            patient_id: id,
            first_name: patient?.first_name,
            last_name: patient?.last_name,
            doctor_id: enrollment?.assigned_staff?.doctor?.id,
            nutritionist_id: enrollment?.assigned_staff?.nutritionist?.id,
            fitness_coach_id: enrollment?.assigned_staff?.fitness_coach?.id,
          })
        }}
      />

      {/* Assigned Staff */}
      <AssignedStaffSection
        enrollment={enrollment}
        onOpenAssignProvidersDialog={openAssignProvidersDialog}
      />

      {/* Consultation Tracking */}
      <ConsultationTracking
        historyCallFormCount={historyCallFormCount}
        upcomingAppointments={upcomingAppointments}
        patientClinicalData={patientClinicalData}
      />

      {/* Patient Journey - Exercise & Diet */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Exercise Logs */}
        <ExerciseLogsCard
          isLoadingCollectionProgress={isLoadingCollectionProgress}
          exerciseLogs={exerciseLogs}
        />

        {/* Diet Plan Progress */}
        <DietPlanProgressCard
          activeDietPlan={activeDietPlan}
          getProgramDay={getProgramDay}
        />
      </div>

      {/* Assessment & Weight Tracking */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assessment Submissions */}
        <AssessmentSubmissionsCard
          isLoadingPatient={isLoadingPatient}
          assessmentSubmissions={assessmentSubmissions}
          onSetSelectedAssessment={setSelectedAssessment}
        />

        {/* Weight Tracking */}
        <WeightTrackingCard
          isLoadingMetrics={isLoadingMetrics}
          metricsData={metricsData}
        />
      </div>



      {/* Diet Plan & Grocery List Tabs */}
      {activeDietPlan && (
        <DietPlanPhaseCard
          activeDietPlan={activeDietPlan}
          patientId={id}
        />
      )}

      {/* Patient Logs Section */}
      {patient?.id && (
        <div className="mt-6">
          <PatientLogsTabs
            patientId={patient.id}
            minDate={activeDietPlan?.journey_start_date}
            maxDate={activeDietPlan?.end_date}
          />
        </div>
      )}
      {/* Sales Call Logs */}
      <SalesCallLogsCard
        isLoadingPatient={isLoadingPatient}
        patientClinicalData={patientClinicalData}
      />

      {/* Appointments Timeline */}
      <AppointmentsTimeline
        currentAppointments={currentAppointments}
        upcomingAppointments={upcomingAppointments}
        completedAppointments={completedAppointments}
        missingAppointments={missingAppointments}
        renderAppointmentCard={renderAppointmentCard}
      />


      {allAppointments && allAppointments.length > 0 && (
        <div className="space-y-4 hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900">Appointments</h2>
            </div>
          </div>
          <div className="grid gap-4">
            {allAppointments.map((appointment: any) => {
              const appointmentDate = new Date(appointment.appointment_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              appointmentDate.setHours(0, 0, 0, 0);
              const isToday = appointmentDate.getTime() === today.getTime();
              const isPast = appointmentDate < today;
              const isHistoryCall = appointment.call_type === "history_call";

              return (
                <Card
                  key={appointment.id}
                  className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 capitalize">
                                {appointment.appointment_type || "Consultation"}
                              </h3>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  appointment.status === "completed" &&
                                  "bg-emerald-50 text-emerald-700 border-emerald-200",
                                  appointment.status === "confirmed" &&
                                  "bg-blue-50 text-blue-700 border-blue-200",
                                  appointment.status === "pending" &&
                                  "bg-amber-50 text-amber-700 border-amber-200",
                                  appointment.status === "cancelled" &&
                                  "bg-red-50 text-red-700 border-red-200",
                                )}
                              >
                                {appointment.status}
                              </Badge>
                              {isHistoryCall && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  History Call
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">
                              {new Date(
                                appointment.appointment_date,
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Time
                            </p>
                            <p className="font-semibold text-slate-900">
                              {appointment.start_time?.slice(0, 5)} -{" "}
                              {appointment.end_time?.slice(0, 5)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Duration
                            </p>
                            <p className="font-semibold text-slate-900">
                              {appointment.duration_mins || 45} mins
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Mode
                            </p>
                            <p className="font-semibold text-slate-900 capitalize">
                              {appointment.mode || "--"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Type
                            </p>
                            <p className="font-semibold text-slate-900 capitalize">
                              {appointment.call_type?.replace("_", " ") ||
                                "Regular"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {isToday &&
                          appointment.status !== "completed" &&
                          appointment.status !== "cancelled" ? (
                          <div className="flex items-center gap-2">
                            {appointment.call_status === "started" && (
                              <Badge className="bg-rose-100 text-rose-700 border-rose-200 animate-pulse text-[10px] font-bold">
                                • LIVE
                              </Badge>
                            )}
                            <Button
                              onClick={async () => {
                                try {
                                  const res = await apiClient.post(`/appointments/${appointment.id}/join`);
                                  if (res.data?.data?.call_status === "started") {
                                    toast.error("Current another call is in progress please check that");
                                    return;
                                  }
                                  router.push(`/dashboard/dietitian/consultation/${id}`);
                                } catch (error) {
                                  toast.error("Failed to start session");
                                }
                              }}
                              className={`${appointment.call_status === "started" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
                            >
                              {appointment.call_status === "started" ? <PlayCircle className="h-4 w-4 mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
                              {appointment.call_status === "started" ? "Resume Session" : "Start Session"}
                            </Button>
                          </div>
                        ) : null
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {/* Send Diet Plan Modal */}
      <DietPlanAssignmentModal
        open={showDietPlanModal}
        onOpenChange={setShowDietPlanModal}
        dietTemplates={dietTemplates}
        isLoadingTemplates={isLoadingTemplates}
        selectedTemplateId={selectedTemplateId}
        onTemplateSelect={setSelectedTemplateId}
        onAssignTemplate={handleSendDietPlan}
      />

      {/* Edit Meal Modal */}
      <Dialog open={showEditMealModal} onOpenChange={setShowEditMealModal}>
        <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Edit Meal
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Update meal food items and notes. Use "Add Choice" to create OR
              options for food items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-meal-type"
                  className="text-sm font-semibold text-slate-700"
                >
                  Meal Type *
                </Label>
                <span className="text-xs text-slate-500 block mb-1">
                  Current: {mealType?.replace(/_/g, " ")}
                </span>
                <Select
                  value={mealType}
                  onValueChange={(v) => setMealType(v as MealType)}
                >
                  <SelectTrigger
                    id="edit-meal-type"
                    className="h-11 border-slate-300 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-meal-time"
                  className="text-sm font-semibold text-slate-700"
                >
                  Time *
                </Label>
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
                <Label className="text-sm font-semibold text-slate-700">
                  Food Items *
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFoodItem(false)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFoodItem(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Choice
                  </Button>
                </div>
              </div>

              {foodItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-200 rounded-lg bg-slate-50"
                >
                  {Array.isArray(item) ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-amber-700 uppercase">
                          Choice {idx + 1} (OR)
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFoodItem(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {item.map((choice, choiceIdx) => (
                        <div
                          key={choiceIdx}
                          className="grid grid-cols-[1fr_1fr_auto] gap-2"
                        >
                          <Input
                            placeholder="Food name"
                            value={choice.name}
                            onChange={(e) =>
                              updateFoodItem(
                                idx,
                                "name",
                                e.target.value,
                                choiceIdx,
                              )
                            }
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Input
                            placeholder="Quantity"
                            value={choice.quantity}
                            onChange={(e) =>
                              updateFoodItem(
                                idx,
                                "quantity",
                                e.target.value,
                                choiceIdx,
                              )
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
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addChoiceToItem(idx)}
                        className="w-full"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input
                        placeholder="Food name"
                        value={item.name}
                        onChange={(e) =>
                          updateFoodItem(idx, "name", e.target.value)
                        }
                        className="h-9 border-slate-300 bg-white"
                      />
                      <Input
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          updateFoodItem(idx, "quantity", e.target.value)
                        }
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
                <Label
                  htmlFor="edit-calories"
                  className="text-sm font-semibold text-slate-700"
                >
                  Calories
                </Label>
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
                <Label
                  htmlFor="edit-protein"
                  className="text-sm font-semibold text-slate-700"
                >
                  Protein (g)
                </Label>
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
                <Label
                  htmlFor="edit-carbs"
                  className="text-sm font-semibold text-slate-700"
                >
                  Carbs (g)
                </Label>
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
                <Label
                  htmlFor="edit-fats"
                  className="text-sm font-semibold text-slate-700"
                >
                  Fats (g)
                </Label>
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
              <Label
                htmlFor="edit-meal-reason"
                className="text-sm font-semibold text-slate-700"
              >
                Reason
              </Label>
              <span className="text-xs text-slate-500 block mb-1">
                Tell the patient why this meal is important
              </span>
              <Textarea
                id="edit-meal-reason"
                placeholder="Why this meal? e.g., Moong is source of protein and low calorie food."
                value={mealReason}
                onChange={(e) => setMealReason(e.target.value)}
                className="min-h-[60px] border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-meal-notes"
                className="text-sm font-semibold text-slate-700"
              >
                Notes
              </Label>
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
                setShowEditMealModal(false);
                setEditingMealId(null);
                setFoodItems([]);
                setMealNotes("");
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={updateClinicalMealMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editingMealId) {
                  toast.error("No meal selected for editing");
                  return;
                }

                if (foodItems.length === 0) {
                  toast.error("Please add at least one food item");
                  return;
                }

                try {
                  await updateClinicalMealMutation.mutateAsync({
                    mealId: editingMealId.trim().replace(/'+$/, ''),
                    data: {
                      meal_type: mealType,
                      meal_time: mealTime + ":00",
                      food_items: foodItems,
                      calories: calories ? Number(calories) : undefined,
                      protein_g: protein ? Number(protein) : undefined,
                      carbs_g: carbs ? Number(carbs) : undefined,
                      fats_g: fats ? Number(fats) : undefined,
                      notes: mealNotes || undefined,
                      reason: mealReason || undefined,
                    },
                  });

                  toast.success("Meal updated successfully");
                  setShowEditMealModal(false);
                  setEditingMealId(null);
                  setFoodItems([]);
                  setMealNotes("");
                } catch (error: any) {
                  toast.error(
                    error?.response?.data?.message || "Failed to update meal",
                  );
                }
              }}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={updateClinicalMealMutation.isPending}
            >
              {updateClinicalMealMutation.isPending ? (
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

      {/* Add Meal Dialog */}
      <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
        <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Add Meal - Day {selectedDay}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Add a new meal with food items. Use "Add Choice" to create OR
              options for food items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="meal-type"
                  className="text-sm font-semibold text-slate-700"
                >
                  Meal Type *
                </Label>
                <Select
                  value={mealType}
                  onValueChange={(v) => setMealType(v as MealType)}
                >
                  <SelectTrigger
                    id="meal-type"
                    className="h-11 border-slate-300 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="meal-time"
                  className="text-sm font-semibold text-slate-700"
                >
                  Time *
                </Label>
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
                <Label className="text-sm font-semibold text-slate-700">
                  Food Items *
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFoodItem(false)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFoodItem(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Choice
                  </Button>
                </div>
              </div>

              {foodItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-200 rounded-lg bg-slate-50"
                >
                  {Array.isArray(item) ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-amber-700 uppercase">
                          Choice {idx + 1} (OR)
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFoodItem(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {item.map((choice, choiceIdx) => (
                        <div
                          key={choiceIdx}
                          className="grid grid-cols-[1fr_1fr_auto] gap-2"
                        >
                          <Input
                            placeholder="Food name"
                            value={choice.name}
                            onChange={(e) =>
                              updateFoodItem(
                                idx,
                                "name",
                                e.target.value,
                                choiceIdx,
                              )
                            }
                            className="h-9 border-slate-300 bg-white"
                          />
                          <Input
                            placeholder="Quantity"
                            value={choice.quantity}
                            onChange={(e) =>
                              updateFoodItem(
                                idx,
                                "quantity",
                                e.target.value,
                                choiceIdx,
                              )
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
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addChoiceToItem(idx)}
                        className="w-full"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input
                        placeholder="Food name"
                        value={item.name}
                        onChange={(e) =>
                          updateFoodItem(idx, "name", e.target.value)
                        }
                        className="h-9 border-slate-300 bg-white"
                      />
                      <Input
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          updateFoodItem(idx, "quantity", e.target.value)
                        }
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
                <Label
                  htmlFor="calories"
                  className="text-sm font-semibold text-slate-700"
                >
                  Calories
                </Label>
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
                <Label
                  htmlFor="protein"
                  className="text-sm font-semibold text-slate-700"
                >
                  Protein (g)
                </Label>
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
                <Label
                  htmlFor="carbs"
                  className="text-sm font-semibold text-slate-700"
                >
                  Carbs (g)
                </Label>
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
                <Label
                  htmlFor="fats"
                  className="text-sm font-semibold text-slate-700"
                >
                  Fats (g)
                </Label>
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
              <Label
                htmlFor="meal-reason"
                className="text-sm font-semibold text-slate-700"
              >
                Reason
              </Label>
              <Textarea
                id="meal-reason"
                placeholder="Why this meal? e.g., Moong is source of protein and low calorie food."
                value={mealReason}
                onChange={(e) => setMealReason(e.target.value)}
                className="min-h-[60px] border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="meal-notes"
                className="text-sm font-semibold text-slate-700"
              >
                Notes
              </Label>
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
                setShowAddMealDialog(false);
                resetMealForm();
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

      {/* Edit Tips Dialog */}
      <Dialog open={showEditTipsDialog} onOpenChange={setShowEditTipsDialog}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Day {selectedDay} - Tips
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Add helpful tips and instructions for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
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
                className="min-h-[120px] border-slate-300 bg-white resize-none"
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
                updateDayDetailMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTips}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={
                addDayDetailMutation.isPending ||
                updateDayDetailMutation.isPending
              }
            >
              {addDayDetailMutation.isPending ||
                updateDayDetailMutation.isPending ? (
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

      {/* Assign Providers Dialog */}
      <AssignProvidersDialog
        open={showAssignProvidersDialog}
        onOpenChange={setShowAssignProvidersDialog}
        enrollment={enrollment}
        assignProvidersForm={assignProvidersForm}
        doctors={doctors}
        nutritionists={nutritionists}
        fitnessCoaches={fitnessCoaches}
        isLoadingDoctors={isLoadingDoctors}
        isLoadingNutritionists={isLoadingNutritionists}
        isLoadingFitnessCoaches={isLoadingFitnessCoaches}
        isAssigningProviders={isAssigningProviders}
        onDoctorChange={(value) => setAssignProvidersForm((prev) => ({ ...prev, doctor_id: value }))}
        onNutritionistChange={(value) => setAssignProvidersForm((prev) => ({ ...prev, nutritionist_id: value }))}
        onFitnessCoachChange={(value) => setAssignProvidersForm((prev) => ({ ...prev, fitness_coach_id: value }))}
        onSubmit={handleAssignProvidersSubmit}
      />

      {/* Monday Calendar Picker */}
      <MondayCalendarPicker
        open={showMondayCalendar}
        onOpenChange={setShowMondayCalendar}
        onSelectMonday={handleStartDietPlan}
        patientName={
          patient ? `${patient.first_name} ${patient.last_name}` : "Patient"
        }
      />

      {/* Set Goal Drawer */}
      <SetGoalDrawer
        open={showSetGoalDrawer}
        onOpenChange={setShowSetGoalDrawer}
        patient={patient}
        goalForm={goalForm}
        goalFormErrors={goalFormErrors}
        onGoalFormChange={(field, value) => {
          setGoalForm({ ...goalForm, [field]: value });
          if (goalFormErrors[field]) {
            setGoalFormErrors({ ...goalFormErrors, [field]: "" });
          }
        }}
        onClearError={(field) => {
          if (goalFormErrors[field]) {
            setGoalFormErrors({ ...goalFormErrors, [field]: "" });
          }
        }}
        onCancel={() => {
          setShowSetGoalDrawer(false);
          setGoalForm({
            weight_kg: "",
            chest_cm: "",
            waist_cm: "",
            hips_cm: "",
            arm_cm: "",
            calf_cm: "",
            muscle_mass_percentage: "",
            target_date: "",
          });
          setGoalFormErrors({});
        }}
        onSubmit={handleSetGoal}
        isPending={setBodyGoalsMutation.isPending}
      />

      {/* View Goal Drawer */}
      <ViewGoalDrawer
        open={showViewGoalDrawer}
        onOpenChange={setShowViewGoalDrawer}
        patient={patient}
        bodyMeasurementGoals={bodyMeasurementGoals}
      />

      {/* Assessment Drawer */}
      <AssessmentDrawer
        open={showAssessmentDrawer}
        onOpenChange={setShowAssessmentDrawer}
        patientClinicalData={patientClinicalData}
      />

      {/* Assessment Details Drawer (for clicking individual assessment) */}
      <AssessmentDetailsDrawer
        open={!!selectedAssessment}
        onOpenChange={(open) => !open && setSelectedAssessment(null)}
        selectedAssessment={selectedAssessment}
      />

      {/* History Call Details Drawer */}
      <HistoryCallDetailsDrawer
        open={!!selectedHistoryCall}
        onOpenChange={(open) => !open && setSelectedHistoryCall(null)}
        selectedHistoryCall={selectedHistoryCall}
      />

      {/* Reschedule Call Sheet */}
      <Sheet open={showRescheduleSheet} onOpenChange={setShowRescheduleSheet}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900">
              Reschedule Call
            </SheetTitle>
            <SheetDescription>
              Book a new consultation appointment for this patient
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 pb-20">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                <Info className="h-4 w-4" />
                <span>Scheduling new consultation for {patient?.first_name} {patient?.last_name}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate" className="text-sm font-semibold text-slate-700">
                    Appointment Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={rescheduleForm.appointmentDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setRescheduleForm({
                          ...rescheduleForm,
                          appointmentDate: e.target.value,
                          startTime: "", // Reset slots
                          endTime: "",
                          slotId: "",
                        })
                      }
                      className="pl-10 h-11 border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-semibold text-slate-700">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    {isLoadingSlots ? (
                      <div className="flex items-center gap-2 h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading slots...
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <Select
                        value={rescheduleForm.slotId}
                        onValueChange={(value) => {
                          const selectedSlot = availableSlots.find(s => s.id === value);
                          if (selectedSlot) {
                            setRescheduleForm({
                              ...rescheduleForm,
                              slotId: selectedSlot.id,
                              startTime: selectedSlot.start_time,
                              endTime: selectedSlot.end_time,
                            });
                          }
                        }}
                      >
                        <SelectTrigger id="startTime" className="h-11 border-slate-300 bg-white">
                          <SelectValue placeholder="Select available slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.start_time.split(':').slice(0, 2).join(':')} - {slot.end_time.split(':').slice(0, 2).join(':')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : rescheduleForm.appointmentDate ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-600">
                        No slots available for this date.
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                        Please select a date first.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appointmentType" className="text-sm font-semibold text-slate-700">Appointment Type</Label>
                  <Select
                    value={rescheduleForm.appointmentType}
                    onValueChange={(value) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        appointmentType: value,
                      })
                    }
                  >
                    <SelectTrigger id="appointmentType" className="h-11 border-slate-300 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode" className="text-sm font-semibold text-slate-700">Mode <span className="text-red-500">*</span></Label>
                  <Select
                    value={rescheduleForm.mode}
                    onValueChange={(value: "audio" | "video") =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        mode: value,
                        meetingLink: value === "audio" ? "" : rescheduleForm.meetingLink,
                      })
                    }
                  >
                    <SelectTrigger id="mode" className="h-11 border-slate-300 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {rescheduleForm.mode === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="meetingLink" className="text-sm font-semibold text-slate-700">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={rescheduleForm.meetingLink}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        meetingLink: e.target.value,
                      })
                    }
                    className="h-11 border-slate-300 bg-white"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-semibold text-slate-700">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Add reason for rescheduling..."
                  value={rescheduleForm.reason}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      reason: e.target.value,
                    })
                  }
                  className="min-h-[100px] border-slate-300 bg-white resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRescheduleSheet(false);
                  setRescheduleAppointmentId(null);
                }}
                className="flex-1 h-12 border-slate-300"
                disabled={isRescheduling}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (rescheduleAppointmentId) {
                    handleRescheduleExisting(rescheduleAppointmentId);
                  } else {
                    handleRescheduleCall();
                  }
                }}
                disabled={isRescheduling || !rescheduleForm.appointmentDate || !rescheduleForm.startTime}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                {isRescheduling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {rescheduleAppointmentId ? "Updating..." : "Scheduling..."}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    {rescheduleAppointmentId
                      ? "Update Call"
                      : "Schedule Call"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Assigned Goals Drawer */}
      <Sheet open={showGoalsDrawer} onOpenChange={setShowGoalsDrawer}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 p-0 rounded-l-2xl shadow-2xl border-l border-slate-200">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shadow-inner border border-emerald-100">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Active Goals
                </SheetTitle>
                <SheetDescription className="text-sm font-medium text-slate-500">
                  Target measurements for the patient
                </SheetDescription>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {bodyMeasurementGoals?.length > 0 ? (
              bodyMeasurementGoals.map((goal: any, index: number) => (
                <div key={goal.id || index} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-800 capitalize flex items-center gap-2">
                      {goal.goal_type?.replace(/_/g, " ")}
                    </p>
                    {goal.status && (
                      <Badge variant="outline" className="capitalize bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase font-bold tracking-wider rounded-md px-2 py-0.5 shadow-sm">
                        {goal.status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Target Value</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">
                        {goal.target_value} <span className="text-sm font-medium text-slate-500">{goal.unit}</span>
                      </p>
                    </div>
                    {goal.target_date && (
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Target Date</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-100 px-2 py-1.5 rounded-md border border-slate-200/60 shadow-sm">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                          {new Date(goal.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <Target className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No assigned goals</p>
                <p className="text-xs text-slate-500 mt-1">Check back later when goals are set.</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <HistoryCallSheet
        open={showScheduleHistoryCallDrawer}
        onOpenChange={handleHistoryCallDrawerChange}
        patient={historyCallPatient}
        form={historyCallForm}
        doctors={doctors}
        nutritionists={nutritionists}
        fitnessCoaches={fitnessCoaches}
        isSubmitting={isHistoryCallSubmitting}
        onFormChange={handleHistoryCallFormChange}
        onSubmit={handleHistoryCallSubmit}
      />
    </div>
  );
}
