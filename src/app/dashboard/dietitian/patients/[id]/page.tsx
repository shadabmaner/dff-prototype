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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  CheckCircle,
  Loader2,
  Utensils,
  ClipboardList,
  ArrowLeft,
  Stethoscope,
  Phone,
  Mail,
  Target,
  Info,
  HeartPulse,
  Video,
  PhoneCall,
  PlayCircle,
  TrendingUp as TrendingUpIcon,
  Dumbbell,
  ShoppingCart,
  RotateCcw,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import { MondayCalendarPicker } from "@/components/dietitian/monday-calendar-picker";
import { apiClient } from "@/lib/api-client";
import { getDietTemplateById } from "@/lib/api/diet-template-client";
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
import { GuidelinePdfsModal } from "@/components/dietitian/GuidelinePdfsModal";
import { DietPlanPhaseCard } from "@/components/dietitian/diet-plan-phase-card";
import {
  PatientHeader,
  CareTeamSection,
  ConsultationTracking,
  ExerciseLogsCard,
  DietPlanProgressCard,
  AssessmentSubmissionsCard,
  WeightTrackingCard,
  AppointmentsTimeline,
  SalesCallLogsCard,
  MindsetLogsCard,
  GoalSettingDrawer,
  BodyMeasurementsDrawer,
  RescheduleSheet,
  AssessmentDrawer,
  DietPlanModal,
  GuidelinesModal,
} from "@/components/dietitian/patient-details";

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
    mode: "video" as "audio" | "video" | "offline",
    meetingLink: "",
    address: "",
  });
  const [showSetGoalDrawer, setShowSetGoalDrawer] = useState(false);
  const [showViewGoalDrawer, setShowViewGoalDrawer] = useState(false);
  const [showBodyMeasurementsDrawer, setShowBodyMeasurementsDrawer] = useState(false);
  const [goalForm, setGoalForm] = useState({
    weight_kg: "",
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    arm_cm: "",
    calf_cm: "",
    muscle_mass_percentage: "",
  });
  const [goalFormErrors, setGoalFormErrors] = useState<{
    weight_kg: string;
    chest_cm: string;
    waist_cm: string;
    hips_cm: string;
    arm_cm: string;
    calf_cm: string;
    muscle_mass_percentage: string;
  }>({
    weight_kg: "",
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    arm_cm: "",
    calf_cm: "",
    muscle_mass_percentage: "",
  });
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingGoalValue, setEditingGoalValue] = useState<string>("");
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);

  // Fetch patient clinical details using TanStack Query
  const {
    data: patientClinicalData,
    isLoading: isLoadingPatient,
    isFetching: isFetchingPatient,
    error: patientError,
    refetch: refetchPatientDetails,
  } = usePatientClinicalDetails(id);
  const { data: metricsData } = usePatientMetricsHistory(id);
  const { data: slotsResponse, isLoading, isFetching } = useStaffSlots(rescheduleForm.appointmentDate);
  const isLoadingSlots = isLoading || isFetching;
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
  const latestBodyMeasurements = patientClinicalData?.data?.latest_body_measurements || null;
console.log(patientClinicalData?.data,"patientClinicalData?.data")
  // Fetch patient diet plan details using TanStack Query
  const {
    data: dietPlanData,
    isLoading: isLoadingDietPlanData,
    error: dietPlanError,
    refetch: refetchDietPlan,
  } = usePatientDietPlan(id);

  const { data: collectionProgress } = usePatientCollectionProgress(id);
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
 // Auto-select current day when activeDietPlan loads
  useEffect(() => {
    console.log("Auto-selection effect triggered:", {
      current_day: activeDietPlan?.current_day,
      total_days: activeDietPlan?.totalDays,
      selectedDay
    });
    
    if (activeDietPlan?.current_day) {
      const currentDay = activeDietPlan.current_day;
      const totalDays = activeDietPlan.totalDays || 30;
      
      console.log("Processing current day:", { currentDay, totalDays });
      
      // Ensure current day is within valid range
      if (currentDay > 0 && currentDay <= totalDays) {
        console.log("Setting selected day to:", currentDay);
        setSelectedDay(currentDay);
        
        // Auto-navigate to the page containing the current day
        const daysPerPage = 30;
        const targetPage = Math.floor((currentDay - 1) / daysPerPage);
        console.log("Setting page to:", targetPage, "for day:", currentDay);
        setCurrentPage(targetPage);
      }
    }
  }, [activeDietPlan?.current_day, activeDietPlan?.total_days]);
console.log(activeDietPlan,"selectedDayselectedDay")
  const allAppointments = [
    ...currentAppointments,
    ...upcomingAppointments,
    ...completedAppointments,
    ...missingAppointments,
  ];
  const assessmentSubmissions =
    patientClinicalData?.data?.assessment_submissions || [];
  const exerciseJourney = activeDietPlan?.exercise_progress;
  const hasDietPlan = Boolean(
    activeDietPlan?.template_id || templateDetails?.data,
  );

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
    console.log("Calculating meals for selected day:", { selectedDay, templateDetails: !!templateDetails });
    if (!templateDetails?.data?.dayWisePlan) {
      console.log("No dayWisePlan data available");
      return [];
    }
    const dayPlan = templateDetails.data.dayWisePlan.find(
      (d: any) => d.day_number === selectedDay
    );
    console.log("Found day plan for day", selectedDay, ":", dayPlan);
    const meals = dayPlan?.meals || [];
    console.log("Meals for day", selectedDay, ":", meals);
    return meals;
  }, [templateDetails, selectedDay]);

  const tipsForSelectedDay = useMemo(() => {
    if (!templateDetails?.data?.dayWisePlan) return null;
    const dayPlan = templateDetails.data.dayWisePlan.find(
      (d: any) => d.day_number == selectedDay
    );
    console.log(dayPlan, selectedDay, "dayPlan")
    if (!dayPlan?.tips) return null;
    // Get day_detail_id from the first meal if available
    const dayDetailId = dayPlan.meals?.[0]?.day_detail_id;
    return {
      tips: dayPlan.tips,
      id: dayDetailId
    };
  }, [templateDetails, selectedDay]);
  console.log(tipsForSelectedDay, "tipsForSelectedDay")
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
          // sort_order: 0,
          condition_tags: [],
          day_of_week:"EVERYDAY"
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
    console.log(tipsForSelectedDay?.id, tipsForSelectedDay, "tipsForSelectedDay?.id", "dietPlanDetails")

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
      await Promise.all([refetchPatientDetails(), refetchDietPlan()]);
      setShowEditTipsDialog(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save tips");
    }
  };

  const handleSendDietPlan = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a diet plan template");
      return;
    }

    if (!patient?.id) {
      toast.error("Patient information not available");
      return;
    }

    setShowDietPlanModal(false);

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

      // Refetch patient clinical details to get updated active_diet_plan
      await Promise.all([refetchPatientDetails(), refetchDietPlan()]);
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

    // Format date as YYYY-MM-DD in local time to avoid timezone issues
    const formatDateLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    try {
      await startClinicalDietPlanMutation.mutateAsync({
        dietPlanId,
        data: {
          journey_start_date: formatDateLocal(selectedMonday),
        },
      });

      toast.success(
        `Diet plan journey started from ${selectedMonday.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`,
      );
      await Promise.all([refetchPatientDetails(), refetchDietPlan()]);
      setShowMondayCalendar(false);
    } catch (error: any) {
      console.error("Failed to start diet plan journey", error);
      toast.error(
        error?.response?.data?.message || "Failed to start the diet plan journey",
      );
    }
  };

  const validateGoalForm = () => {
    // Clear existing errors first
    setGoalFormErrors({
      weight_kg: "",
      chest_cm: "",
      waist_cm: "",
      hips_cm: "",
      arm_cm: "",
      calf_cm: "",
      muscle_mass_percentage: "",
    });

    const errors: {
      weight_kg: string;
      chest_cm: string;
      waist_cm: string;
      hips_cm: string;
      arm_cm: string;
      calf_cm: string;
      muscle_mass_percentage: string;
    } = {
      weight_kg: "",
      chest_cm: "",
      waist_cm: "",
      hips_cm: "",
      arm_cm: "",
      calf_cm: "",
      muscle_mass_percentage: "",
    };

    // Weight validation (max 500 kg)
    if (goalForm.weight_kg && (!/^\d+$/.test(goalForm.weight_kg) || parseFloat(goalForm.weight_kg) > 500)) {
      errors.weight_kg = "Weight must be less than 500 kg";
    }

    // Chest measurement validation (max 200 cm)
    if (goalForm.chest_cm && (!/^\d+$/.test(goalForm.chest_cm) || parseFloat(goalForm.chest_cm) > 200)) {
      errors.chest_cm = "Chest measurement must be less than 200 cm";
    }

    // Waist measurement validation (max 200 cm)
    if (goalForm.waist_cm && (!/^\d+$/.test(goalForm.waist_cm) || parseFloat(goalForm.waist_cm) > 200)) {
      errors.waist_cm = "Waist measurement must be less than 200 cm";
    }

    // Hips measurement validation (max 200 cm)
    if (goalForm.hips_cm && (!/^\d+$/.test(goalForm.hips_cm) || parseFloat(goalForm.hips_cm) > 200)) {
      errors.hips_cm = "Hips measurement must be less than 200 cm";
    }


    // Muscle mass percentage validation (1-100%)
    if (goalForm.muscle_mass_percentage && (!/^\d+$/.test(goalForm.muscle_mass_percentage) || parseFloat(goalForm.muscle_mass_percentage) < 1 || parseFloat(goalForm.muscle_mass_percentage) > 100)) {
      errors.muscle_mass_percentage = "Muscle mass must be between 1 and 100%";
    }



    // If all fields are empty, form is valid
    const hasAnyValue = Object.values(goalForm).some(value => value.trim() !== "");
    if (!hasAnyValue) {
      setGoalFormErrors(errors);
      return true;
    }
    // Only count keys that have actual error messages (non-empty strings)
    const errorKeysWithMessages = Object.keys(errors).filter(key => errors[key as keyof typeof errors] !== "");
    setGoalFormErrors(errors);
    return errorKeysWithMessages.length === 0;
  };

  const handleSetGoal = async () => {
    if (!patient?.id) {
      toast.error("Patient information not available");
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

      await setBodyGoalsMutation.mutateAsync({
        patientId: patient.id,
        data,
      });

      toast.success("Goals set successfully");
      await refetchPatientDetails();
      setShowSetGoalDrawer(false);
      setGoalForm({
        weight_kg: "",
        chest_cm: "",
        waist_cm: "",
        hips_cm: "",
        arm_cm: "",
        calf_cm: "",
        muscle_mass_percentage: "",
      });
      setGoalFormErrors({
        weight_kg: "",
        chest_cm: "",
        waist_cm: "",
        hips_cm: "",
        arm_cm: "",
        calf_cm: "",
        muscle_mass_percentage: "",
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to set goals");
    }
  };

  const handleEditGoal = async (goalId: string, goalType: string, newValue: string) => {
    if (!patient?.id) {
      toast.error("Patient information not available");
      return;
    }

    if (!newValue || !/^\d+$/.test(newValue)) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      const data: any = {};
      // Map goal_type to correct field name
      let fieldName = goalType;
      if (goalType === 'muscle_mass' || goalType === 'muscle_mass_percentage') {
        fieldName = 'muscle_mass_percentage';
      } else if (goalType === 'weight_loss' || goalType === 'weight_kg') {
        fieldName = 'weight_kg';
      }
      data[fieldName] = parseFloat(newValue);

      await setBodyGoalsMutation.mutateAsync({
        patientId: patient.id,
        data,
      });

      toast.success("Goal updated successfully");
      await refetchPatientDetails();
      setEditingGoal(null);
      setEditingGoalValue("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update goal");
    }
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setEditingGoalValue("");
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

      if (rescheduleForm.mode === "offline" && rescheduleForm.slotId) {
        const selectedSlot = availableSlots.find((slot: any) => slot.id === rescheduleForm.slotId);
        if (selectedSlot?.offline_location) {
          payload.offline_location = selectedSlot.offline_location;
        }
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
        mode: "video" as "audio" | "video" | "offline",
        meetingLink: "",
        address: "",
      });
      await refetchPatientDetails();
      // window.location.reload();
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
        reason: rescheduleForm.reason || undefined,
        mode: rescheduleForm.mode,
        slotId: rescheduleForm.slotId,
      };
if (rescheduleForm.mode === "video" && rescheduleForm.meetingLink) {
        payload.meetingLink = rescheduleForm.meetingLink;
      }

      if (rescheduleForm.mode === "offline" && rescheduleForm.slotId) {
        const selectedSlot = availableSlots.find((slot: any) => slot.id === rescheduleForm.slotId);
        if (selectedSlot?.offline_location) {
          payload.offline_location = selectedSlot.offline_location;
        }
      }
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
        mode: "video" as "audio" | "video" | "offline",
        meetingLink: "",
        address: "",
      });
      await refetchPatientDetails();
      // window.location.reload();
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
                {appointment.staff_name && (
                  <div className="flex justify-end gap-1 text-sm text-slate-600 mt-1">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-medium">{appointment.staff_name}</span>
                    {appointment.staff_type && (
                      <span className="text-slate-500">({appointment.staff_type})</span>
                    )}
                  </div>
                )}
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

  if (isLoadingPatient || isFetchingPatient) {
    return (
      <div className="flex flex-col gap-5">
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-10 w-64" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <Skeleton className="h-7 w-32 mb-4" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <Skeleton className="h-7 w-40 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
      <PatientHeader
        patient={patient}
        enrollment={enrollment}
        patientAge={patientAge}
        metricsData={metricsData}
        bodyMeasurementGoals={bodyMeasurementGoals}
        activeDietPlan={activeDietPlan}
        upcomingHistoryCall={upcomingHistoryCall}
        patientId={id}
        onSetGoal={() => setShowSetGoalDrawer(true)}
        onViewGoal={() => setShowViewGoalDrawer(true)}
        onBodyMeasurements={() => setShowBodyMeasurementsDrawer(true)}
        onStartDietPlan={() => setShowMondayCalendar(true)}
        onSelectDietPlan={() => setShowDietPlanModal(true)}
        onViewGuidelines={() => setShowGuidelineModal(true)}
        onViewAssessment={() => setShowAssessmentDrawer(true)}
        onScheduleCall={() => {
          setRescheduleAppointmentId(null);
          setShowRescheduleSheet(true);
        }}
        isStartingDietPlan={startClinicalDietPlanMutation.isPending}
      />

      {/* Care Team */}
      <CareTeamSection enrollment={enrollment} />

      {/* Consultation Tracking */}
      <ConsultationTracking
      completedCalls={patientClinicalData?.data?.completed_appointments}
        historyCalls={patientClinicalData?.data?.history_calls || []}
        upcomingAppointments={upcomingAppointments}
      />

      {/* Patient Journey - Exercise & Diet */}
      {/* <div className="grid gap-6 lg:grid-cols-2">
        <ExerciseLogsCard exerciseLogs={exerciseLogs} />
        <DietPlanProgressCard
          activeDietPlan={activeDietPlan}
          getProgramDay={getProgramDay}
        />
      </div> */}

      {/* Assessment & Weight Tracking */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AssessmentSubmissionsCard
          assessmentSubmissions={assessmentSubmissions}
          onSelectAssessment={setSelectedAssessment}
        />
        <WeightTrackingCard metricsData={metricsData} />
      </div>



      {/* Diet Plan & Grocery List Tabs */}
      {!activeDietPlan ? (
        <Card className="border-slate-200 shadow-sm mt-6">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Apple className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Diet Plan Assigned</h3>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                This patient doesn't have an active diet plan yet. Assign a diet plan template to get started.
              </p>
              <Button 
                onClick={() => setShowDietPlanModal(true)}
                className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign Diet Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
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
      <SalesCallLogsCard callLogs={patientClinicalData?.data?.call_logs || []} />

      {/* Appointments Timeline */}
      <AppointmentsTimeline
        missingAppointments={missingAppointments}
        currentAppointments={currentAppointments}
        upcomingAppointments={upcomingAppointments}
        completedAppointments={completedAppointments}
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
      <DietPlanModal
        open={showDietPlanModal}
        onOpenChange={setShowDietPlanModal}
        dietTemplates={dietTemplates}
        selectedTemplateId={selectedTemplateId}
        isLoadingTemplates={isLoadingTemplates}
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
                resetMealForm();
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
                      // meal_type: mealType,
                      // meal_time: mealTime + ":00",
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
                  await Promise.all([refetchPatientDetails(), refetchDietPlan()]);
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
      <Dialog 
        open={showEditTipsDialog} 
        onOpenChange={(open) => {
          if (!open) {
            // Reset form when dialog is closed
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
      <GoalSettingDrawer
        open={showSetGoalDrawer}
        onOpenChange={setShowSetGoalDrawer}
        patientName={`${patient?.first_name} ${patient?.last_name}`}
        goalForm={goalForm}
        goalFormErrors={goalFormErrors}
        onGoalFormChange={(field, value) => {
          setGoalForm({ ...goalForm, [field]: value });
        }}
        onGoalFormErrorClear={(field) => {
          if (goalFormErrors[field as keyof typeof goalFormErrors]) {
            setGoalFormErrors({ ...goalFormErrors, [field]: "" });
          }
        }}
        onSave={handleSetGoal}
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
          });
          setGoalFormErrors({
        weight_kg: "",
        chest_cm: "",
        waist_cm: "",
        hips_cm: "",
        arm_cm: "",
        calf_cm: "",
        muscle_mass_percentage: "",
      });
        }}
        isLoading={setBodyGoalsMutation.isPending}
      />

      {/* View Goal Drawer */}
      <Sheet open={showViewGoalDrawer} onOpenChange={setShowViewGoalDrawer}>
        <SheetContent className="sm:max-w-[540px] p-0 bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Body Measurement Goals
            </SheetTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
              Assigned goals and targets for {patient?.first_name} {patient?.last_name}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-4">
              {[
                { type: 'weight_kg', label: 'Weight', unit: 'kg' },
                { type: 'chest_cm', label: 'Chest', unit: 'cm' },
                { type: 'waist_cm', label: 'Waist', unit: 'cm' },
                { type: 'hips_cm', label: 'Hips', unit: 'cm' },
                { type: 'arm_cm', label: 'Arm', unit: 'cm' },
                { type: 'thighs_cm', label: 'Thighs', unit: 'cm' },
                { type: 'calf_cm', label: 'Calf', unit: 'cm' },
                { type: 'muscle_mass_percentage', label: 'Muscle Mass', unit: '%' },
              ].map((param) => {
                const goal = bodyMeasurementGoals.find((g: any) =>
                  g.goal_type === param.type ||
                  (param.type === 'weight_kg' && g.goal_type === 'weight_loss') ||
                  (param.type === 'muscle_mass_percentage' && g.goal_type === 'muscle_mass')
                );
                const isEditing = editingGoal === param.type;

                return (
                  <Card key={param.type} className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {param.label}
                          </p>
                          {isEditing ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="text"
                                autoFocus
                                value={editingGoalValue}
                                onChange={(e) => setEditingGoalValue(e.target.value)}
                                className="h-9 w-full text-base font-bold border-2 focus:border-green-500"
                                placeholder={`Enter ${param.label.toLowerCase()}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditGoal(goal?.id || "", param.type, editingGoalValue);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleEditGoal(goal?.id || "", param.type, editingGoalValue)}
                                className="h-9 w-9 p-0 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm"
                                disabled={setBodyGoalsMutation.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-xl font-black text-slate-900 tracking-tight">
                                {goal ? goal.target_value : "--"}
                              </span>
                              <span className="text-xs font-bold text-slate-400 uppercase">
                                {param.unit}
                              </span>
                            </div>
                          )}
                        </div>
                        {!isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingGoal(param.type);
                              setEditingGoalValue(goal ? goal.target_value.toString() : "");
                            }}
                            className="h-9 w-9 p-0 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white border-t">
            <Button
              variant="outline"
              onClick={() => setShowViewGoalDrawer(false)}
              className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 h-11 font-bold rounded-xl"
            >
              Close Goals
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Body Measurements Drawer */}
      <BodyMeasurementsDrawer
        open={showBodyMeasurementsDrawer}
        onOpenChange={setShowBodyMeasurementsDrawer}
        patientName={`${patient?.first_name} ${patient?.last_name}`}
        bodyMeasurementGoals={bodyMeasurementGoals}
        latestBodyMeasurements={latestBodyMeasurements}
      />

      {/* Assessment Drawer */}
      <AssessmentDrawer
        open={showAssessmentDrawer}
        onOpenChange={setShowAssessmentDrawer}
        assessmentSubmissions={patientClinicalData?.data?.assessment_submissions || []}
        selectedAssessment={selectedAssessment}
        onSelectAssessment={setSelectedAssessment}
      />

      {/* History Call Details Drawer */}
      <Sheet open={!!selectedHistoryCall} onOpenChange={(open) => !open && setSelectedHistoryCall(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900">
              Appointment Details
            </SheetTitle>
            <SheetDescription>
              View appointment and consultation information
            </SheetDescription>
          </SheetHeader>

          {selectedHistoryCall && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 capitalize">
                    {selectedHistoryCall.appointment_type}
                  </h4>
                  <Badge className={`${selectedHistoryCall.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                    selectedHistoryCall.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                      'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                    {selectedHistoryCall.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {selectedHistoryCall.mode === 'video' ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <PhoneCall className="h-4 w-4" />
                  )}
                  <span className="capitalize">{selectedHistoryCall.mode} Call</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Staff Information</h4>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Name</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {selectedHistoryCall.staff_first_name} {selectedHistoryCall.staff_last_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Role</span>
                    <Badge variant="outline" className="capitalize">
                      {selectedHistoryCall.staff_type}
                    </Badge>
                  </div>
                  {selectedHistoryCall.staff_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-900">{selectedHistoryCall.staff_phone}</span>
                    </div>
                  )}
                  {selectedHistoryCall.staff_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-900">{selectedHistoryCall.staff_email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Appointment Details</h4>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Date</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(selectedHistoryCall.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Time</span>
                    <span className="font-semibold text-slate-900">
                      {selectedHistoryCall.start_time} - {selectedHistoryCall.end_time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-semibold text-slate-900">
                      {selectedHistoryCall.duration_mins} minutes
                    </span>
                  </div>
                </div>
              </div>

              {(selectedHistoryCall.reason || selectedHistoryCall.notes) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Additional Information</h4>
                  {selectedHistoryCall.reason && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 mb-1">Reason</p>
                      <p className="text-sm text-slate-900">{selectedHistoryCall.reason}</p>
                    </div>
                  )}
                  {selectedHistoryCall.notes && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 mb-1">Notes</p>
                      <p className="text-sm text-slate-900">{selectedHistoryCall.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reschedule Call Sheet */}
      <RescheduleSheet
        open={showRescheduleSheet}
        onOpenChange={setShowRescheduleSheet}
        patientName={`${patient?.first_name} ${patient?.last_name}`}
        rescheduleForm={rescheduleForm}
        availableSlots={availableSlots}
        isLoadingSlots={isLoadingSlots}
        isRescheduling={isRescheduling}
        hasExistingAppointment={!!rescheduleAppointmentId}
        onFormChange={(field, value) => {
          if (field === "appointmentDate") {
            setRescheduleForm({
              ...rescheduleForm,
              appointmentDate: value,
              startTime: "",
              endTime: "",
              slotId: "",
            });
          } else if (field === "mode" && (value === "audio" || value === "video")) {
            setRescheduleForm({
              ...rescheduleForm,
              mode: value,
              meetingLink: "",
              address: "",
            });
          } else if (field === "mode" && value === "in_person") {
            setRescheduleForm({
              ...rescheduleForm,
              mode: value,
              meetingLink: "",
              address: "",
            });
          } else if (field === "slotData") {
            // Handle combined slot data update
            setRescheduleForm({
              ...rescheduleForm,
              slotId: value.slotId,
              startTime: value.startTime,
              endTime: value.endTime,
            });
          } else {
            setRescheduleForm({
              ...rescheduleForm,
              [field]: value,
            });
          }
        }}
        onReschedule={() => {
          if (rescheduleAppointmentId) {
            handleRescheduleExisting(rescheduleAppointmentId);
          } else {
            handleRescheduleCall();
          }
        }}
        onCancel={() => {
          setShowRescheduleSheet(false);
          setRescheduleAppointmentId(null);
        }}
      />


      {activeDietPlan && (
        <GuidelinePdfsModal
          isOpen={showGuidelineModal}
          onClose={() => setShowGuidelineModal(false)}
          dietPlanId={(activeDietPlan as any)?.diet_plan_id || (activeDietPlan as any)?.id}
        />
      )}
    </div>
  );
}
