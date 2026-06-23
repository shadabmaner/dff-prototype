"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { DatePicker } from "@/components/CalenderPicker";
import { RescheduleSheet } from "@/components/dietitian/patient-details/RescheduleSheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  User,
  Calendar,
  Clock,
  FileText,
  Apple,
  Droplet,
  Activity,
  Moon,
  TrendingUp,
  Plus,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  UserPlus,
  CheckCircle2,
  Loader2,
  Utensils,
  ExternalLink,
  Info,
  Target,
  ShoppingCart,
  Brain,
  ClipboardList,
  MapPin,
  Link2,
  Phone,
  RotateCcw,
  PhoneCall,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MondayCalendarPicker } from "@/components/dietitian/monday-calendar-picker";
import { ReferStaffModal } from "@/components/dietitian/refer-staff-modal";
import { apiClient } from "@/lib/api-client";
import { usePatientClinicalDetails, usePatientDietPlan, usePatientMindsetLogs } from "@/hooks/use-patient";
import {
  useAddMeal,
  useUpdateMeal,
  useDeleteMeal,
  useAddDayDetail,
  useUpdateDayDetail,
  useUpdateClinicalDayDetail,
} from "@/hooks/use-diet-template";
import { useStaffSlots } from "@/hooks/use-dietitian-clinical";
import { useUpdateClinicalMeal, useStartClinicalDietPlan, useAddClinicalMeal } from "@/hooks/use-clinical-diet-plan";
import { useSetBodyMeasurementGoals } from "@/hooks/use-body-measurement-goals";
import GroceryListTab from "@/components/dietitian/GroceryListTab";
import type {
  FoodItem,
  MealType,
  CreateMealRequest,
  FoodItemOrChoice,
} from "@/types/diet-template";
import { title } from "process";
import { cn } from "@/lib/utils";
import { GuidelinePdfsModal } from "@/components/dietitian/GuidelinePdfsModal";
import { AppointmentsTimeline, SalesCallLogsCard } from "@/components/dietitian/patient-details";
import { Separator } from "@/components/ui/separator";
import { PatientLogsTabs } from "@/components/patient-logs/patient-logs-tabs";
import { DietPlanPhaseCard } from "@/components/dietitian/diet-plan-phase-card";
import { PrescriptionModal } from "@/components/doctor/prescription-modal";

type FoodItemEntry = {
  id: string;
  name: string;
  requirement: string;
  alternate: string;
  showAlternate: boolean;
};
const consultationModeOptions = [
  { value: "audio", label: "Telephonic - Audio", icon: Phone },
  { value: "video", label: "Online - Video", icon: Video },
  { value: "offline", label: "Offline - In Person", icon: MapPin },
]

export default function ConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params Promise for Next.js 15
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientNameFromUrl = searchParams.get("name");

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showDietPlanModal, setShowDietPlanModal] = useState(false);
  const [dietPlanTab, setDietPlanTab] = useState<"plan" | "grocery">("plan");

  // Consultation mode and meeting link (would come from appointment data)
  const [consultationMode, setConsultationMode] = useState<
    "video" | "audio" | "offline"
  >("audio");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [iframeStatus, setIframeStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [selectedDietType, setSelectedDietType] = useState<
    "15days" | "90days" | null
  >(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [showMondayCalendar, setShowMondayCalendar] = useState(false);
  const [showReferDoctorModal, setShowReferDoctorModal] = useState(false);
  const [showReferPhysioModal, setShowReferPhysioModal] = useState(false);
  const [showAssessmentDrawer, setShowAssessmentDrawer] = useState(false);
  const [isDietPlanEditable, setIsDietPlanEditable] = useState(true);
  const [isDietPlanConfirmed, setIsDietPlanConfirmed] = useState(false);
  const [foodItemEntries, setFoodItemEntries] = useState<FoodItemEntry[]>([]);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<
    string | null
  >(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: "",
    startTime: "",
    endTime: "",
    slotId: "",
    appointmentType: "consultation",
    mode: "video" as "audio" | "video" | "offline",
    meetingLink: "",
    address: "",
    reason: "",
  });
  const [showSetGoalDrawer, setShowSetGoalDrawer] = useState(false);
  const [showViewGoalDrawer, setShowViewGoalDrawer] = useState(false);
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
  const [goalForm, setGoalForm] = useState({
    weight_kg: "",
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    arm_cm: "",
    calf_cm: "",
    muscle_mass_percentage: "",
  });

  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingGoalValue, setEditingGoalValue] = useState("");
  const [goalFormErrors, setGoalFormErrors] = useState<Record<string, string>>({});
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);


  const handleIframeLoad = () => setIframeStatus("loaded");
  const handleIframeError = () => setIframeStatus("error");

  const handleOpenMeetingExternally = () => {
    if (normalizedMeetingLink) {
      window.open(normalizedMeetingLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleResumeCall = () => {
    setSessionEnded(false);
    setIframeStatus("loading");
  };

  // Fetch patient clinical details using TanStack Query
  const {
    data: patientClinicalData,
    isLoading: isLoadingPatient,
    isFetching: isFetchingPatient,
    error: patientError,
    refetch: refetchPatientDetails,
  } = usePatientClinicalDetails(id);
  console.log(patientClinicalData, "patientClinicalData")
  // Fetch patient diet plan details using TanStack Query
  const {
    data: dietPlanData,
    isLoading: isLoadingDietPlanData,
    error: dietPlanError,
    refetch: refetchDietPlan,
  } = usePatientDietPlan(id);

  const { data: mindsetLogs } = usePatientMindsetLogs(id);

  // Diet templates state
  const [dietTemplates, setDietTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  // Patient diet plan state
  const [patientDietPlan, setPatientDietPlan] = useState<any>(null);
  const [isLoadingDietPlan, setIsLoadingDietPlan] = useState(false);
  const [isAssigningDietPlan, setIsAssigningDietPlan] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [templateDetails, setTemplateDetails] = useState<any>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Meal and tip editing mutations
  const addMealMutation = useAddMeal();
  const updateMealMutation = useUpdateMeal();
  const updateClinicalMealMutation = useUpdateClinicalMeal();
  const addClinicalMealMutation = useAddClinicalMeal();
  const startClinicalDietPlanMutation = useStartClinicalDietPlan();
  const deleteMealMutation = useDeleteMeal();
  const setBodyGoalsMutation = useSetBodyMeasurementGoals();
  const addDayDetailMutation = useAddDayDetail();
  const updateDayDetailMutation = useUpdateDayDetail();
  const updateClinicalDayDetailMutation = useUpdateClinicalDayDetail();
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  // Slots fetching
  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(rescheduleForm.appointmentDate);
  const availableSlots = slotsResponse?.data || [];

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
  const current_appointments = patientClinicalData?.data?.current_appointments?.filter((item: any) => item.call_status === "started")?.[0];
  const upcomingAppointments = patientClinicalData?.data?.upcoming_appointments || [];
  const completedAppointments = patientClinicalData?.data?.completed_appointments || [];
  const missingAppointments = (patientClinicalData?.data as any)?.missing_appointments || [];
  const currentAppointments = patientClinicalData?.data?.current_appointments || [];

  //@ts-ignore
  const bodyMeasurementGoals = patientClinicalData?.data?.body_measurement_goals || [];

  const upcomingHistoryCall = useMemo(() => {
    return upcomingAppointments.find(
      (apt: any) =>
        apt.call_type !== "history_call" && apt.status === "confirmed",
    );
  }, [upcomingAppointments]);

  const missingItems = useMemo(() => {
    const missing = [];
    if (bodyMeasurementGoals.length === 0) missing.push("Health Goal");
    if (!upcomingHistoryCall) missing.push("Next Appointment");
    if (!activeDietPlan) {
      missing.push("Diet Plan");
    } else if (!activeDietPlan.journey_start_date) {
      missing.push("Diet Plan Initiation (Start Date)");
    }
    return missing;
  }, [bodyMeasurementGoals, upcomingHistoryCall, activeDietPlan]);

  const hasDietPlan = Boolean(
    activeDietPlan?.template_id || templateDetails?.data?.dayWisePlan,
  );

  // Helper function to normalize meal IDs by trimming spaces
  const normalizeMealIds = (responseData: any) => {
    if (!responseData?.data?.dayWisePlan) return responseData;

    const normalizedData = {
      ...responseData,
      data: {
        ...responseData.data,
        dayWisePlan: responseData.data.dayWisePlan.map((dayPlan: any) => ({
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

  const { normalizedMeetingLink, isIframeBlocked } = useMemo(() => {
    const rawLink =
      meetingLink ||
      current_appointments?.meetingLink ||
      current_appointments?.meeting_link ||
      current_appointments?.meeting_url;

    if (!rawLink) return { normalizedMeetingLink: "", isIframeBlocked: false };

    const formattedLink = /^https?:\/\//i.test(rawLink)
      ? rawLink
      : `https://${rawLink}`;

    // Detect domains known to block iframes via X-Frame-Options or CSP
    const blockedDomains = [
      "zoho.in",
      "zoho.com",
      "google.com/meet",
      "teams.microsoft.com",
      "meet.google.com",
      "zoom.us",
      "app.zoom",
    ];

    const isBlocked = blockedDomains.some((domain) =>
      formattedLink.toLowerCase().includes(domain),
    );

    let normalizedLink = formattedLink;

    // Normalize Zoom links for iframe embedding
    if (formattedLink.toLowerCase().includes("zoom.us")) {
      // Always favor zoom.us over app.zoom.us for iframes
      normalizedLink = normalizedLink.replace(/app\.zoom\.us/i, "zoom.us");

      // Handle standard /j/ and /s/ links: zoom.us/j/ID -> zoom.us/wc/ID/join
      if (normalizedLink.toLowerCase().includes("/j/")) {
        normalizedLink = normalizedLink.replace(/\/j\/(\d+)/i, "/wc/$1/join");
      } else if (normalizedLink.toLowerCase().includes("/s/")) {
        normalizedLink = normalizedLink.replace(/\/s\/(\d+)/i, "/wc/$1/join");
      }
      // Handle /wc/ID/start format: zoom.us/wc/ID/start -> zoom.us/wc/ID/join
      else if (normalizedLink.toLowerCase().includes("/wc/") && normalizedLink.toLowerCase().includes("/start")) {
        normalizedLink = normalizedLink.replace(/\/wc\/(\d+)\/start/i, "/wc/$1/join");
      }
    }

    return { normalizedMeetingLink: normalizedLink, isIframeBlocked: isBlocked };
  }, [meetingLink, current_appointments]);

  useEffect(() => {
    if (isIframeBlocked) {
      setIframeStatus("error");
    } else if (consultationMode === "video" && normalizedMeetingLink) {
      setIframeStatus("loading");
    }
  }, [consultationMode, normalizedMeetingLink, isIframeBlocked]);
  console.log(patientClinicalData?.data, "current_appointments")
  useEffect(() => {
    if (!current_appointments) return;

    if (current_appointments.mode) {
      setConsultationMode(current_appointments.mode);
    }

    const linkFromApi =
      current_appointments.meetingLink ||
      current_appointments.meeting_link ||
      current_appointments.meeting_url ||
      current_appointments.join_url ||
      "";

    setMeetingLink(linkFromApi);
  }, [current_appointments]);

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
            onClick={() => setShowRescheduleDialog(appointment)}
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

            </div>
          </div>
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
          day_of_week: "EVERYDAY",
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

      await Promise.all([
        refetchPatientDetails(),
        refetchDietPlan()
      ]);
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

      // Refetch both patient and diet plan to refresh the tips data
      await Promise.all([
        refetchPatientDetails(),
        refetchDietPlan()
      ]);

      setShowEditTipsDialog(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save tips");
    }
  };

  const handleEndConsultation = async () => {
    if (isEndingSession) return;

    try {
      setIsEndingSession(true);
      const appointmentId = current_appointments?.id || current_appointments?.appointment_id;
      // First leave the session to stop tracking
      await apiClient.post(`/appointments/${appointmentId}/leave`);
      // Then mark the appointment as completed
      toast.success("Consultation marked as completed");
      setSessionEnded(true);
      setShowEndSessionConfirm(false);
      router.push("/dashboard/doctor/appointments");
    } catch (error: any) {
      console.error("Error completing appointment", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to end session";
      toast.error(message);
    } finally {
      setIsEndingSession(false);
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
      setGoalFormErrors({});
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to set goals");
    }
  };

  const handleExitConsultation = () => {
    window.location.href = "/dashboard/dietitian/patients";
  };

  const handleReschedule = async () => {
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

      const response = await apiClient.post("/appointments", payload);

      toast.success("Appointment rescheduled successfully", {
        description: `New appointment on ${rescheduleForm.appointmentDate} at ${rescheduleForm.startTime}`,
      });

      setShowRescheduleDialog(false);
      setRescheduleForm({
        appointmentDate: "",
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
      toast.error("Failed to reschedule appointment", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again",
      });
    } finally {
      setIsRescheduling(false);
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

  const handleRescheduleExisting = async (appointmentId: string) => {
    if (!rescheduleForm.appointmentDate || !rescheduleForm.startTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsRescheduling(true);

    try {
      const payload: any = {
        newDate: rescheduleForm.appointmentDate,
        newStartTime: rescheduleForm.startTime,
        newEndTime: rescheduleForm.endTime,
        mode: rescheduleForm.mode,
      };
      if (rescheduleForm.mode === "video" && rescheduleForm.meetingLink) {
        payload.meeting_link = rescheduleForm.meetingLink;
      }
      if (rescheduleForm.mode === "offline" && rescheduleForm.slotId) {
        const selectedSlot = availableSlots.find((slot: any) => slot.id === rescheduleForm.slotId);
        if (selectedSlot?.offline_location) {
          payload.offline_location = selectedSlot.offline_location;
        }
      }

      const response = await apiClient.post(
        `/appointments/${appointmentId}/reschedule`,
        payload,
      );

      toast.success("Appointment rescheduled successfully", {
        description: `Updated to ${rescheduleForm.appointmentDate} at ${rescheduleForm.startTime}`,
      });

      setShowRescheduleDialog(false);
      setRescheduleForm({
        appointmentDate: "",
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
      toast.error("Failed to reschedule appointment", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again",
      });
    } finally {
      setIsRescheduling(false);
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

    try {
      setIsLoadingDietPlan(true);
      setIsAssigningDietPlan(true);

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
      await refetchPatientDetails();
      await refetchDietPlan();
    } catch (error: any) {
      console.error("Error assigning diet plan:", error);
      toast.error("Failed to assign diet plan", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again",
      });
    } finally {
      setIsLoadingDietPlan(false);
      setIsAssigningDietPlan(false);
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
        `Diet plan journey started on ${selectedMonday.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`,
      );
      await refetchPatientDetails();
      await refetchDietPlan();
      setShowMondayCalendar(false);
    } catch (error: any) {
      console.error("Failed to start diet plan journey", error);
      toast.error(
        error?.response?.data?.message || "Failed to start the diet plan journey",
      );
    }
  };

  const handleEditDietPlan = () => {
    if (isDietPlanConfirmed) {
      toast.error("Diet plan is already confirmed and cannot be edited");
      return;
    }
    setIsDietPlanEditable(true);
    toast.info("Diet plan is now editable");
  };

  const handleConfirmDietPlan = () => {
    setIsDietPlanConfirmed(true);
    setIsDietPlanEditable(false);
    toast.success("Diet plan confirmed and sent to patient");
  };

  const handleSaveNotes = () => {
    toast.success("Consultation notes saved");
  };

  const navigateDay = (direction: "prev" | "next") => {
    if (direction === "prev" && currentDay > 1) {
      setCurrentDay(currentDay - 1);
    } else if (direction === "next" && currentDay < 15) {
      setCurrentDay(currentDay + 1);
    }
  };

  const createFoodItemEntry = useMemo(
    () =>
      (item = "", parsedRequirement = ""): FoodItemEntry => ({
        id: `food-${Math.random().toString(36).slice(2, 9)}`,
        name: item,
        requirement: parsedRequirement,
        alternate: "",
        showAlternate: false,
      }),
    [],
  );

  useEffect(() => {
    setFoodItemEntries((prev) =>
      prev.map((entry) => ({
        ...entry,
        id: `food-${Math.random().toString(36).slice(2, 9)}`,
      })),
    );
  }, []);

  const parseFoodItemFromString = (item: string): FoodItemEntry => {
    const [namePart, ...rest] = item.split(" - ");
    const requirementPart = rest.length ? rest.join(" - ") : "";
    return createFoodItemEntry(namePart.trim(), requirementPart.trim());
  };

  useEffect(() => {
    if (!selectedMeal) {
      setFoodItemEntries([createFoodItemEntry()]);
      return;
    }

    const mapped = selectedMeal.foodItems.length
      ? selectedMeal.foodItems.map(parseFoodItemFromString)
      : [createFoodItemEntry()];

    setFoodItemEntries(mapped);
  }, [selectedMeal, createFoodItemEntry]);

  const buildFoodItemString = (entry: FoodItemEntry) =>
    entry.requirement ? `${entry.name} - ${entry.requirement}` : entry.name;

  const updateFoodItemEntry = (
    id: string,
    key: keyof Omit<FoodItemEntry, "id">,
    value: string | boolean,
  ) => {
    setFoodItemEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
            ...entry,
            [key]: value,
          }
          : entry,
      ),
    );
  };

  const addFoodItemEntry = () =>
    setFoodItemEntries((prev) => [...prev, createFoodItemEntry()]);
  const removeFoodItemEntry = (id: string) =>
    setFoodItemEntries((prev) =>
      prev.length === 1 ? prev : prev.filter((entry) => entry.id !== id),
    );

  const handleSaveTip = (day: number) => {
    toast.success(`Tip updated for Day ${day}`);
  };
  console.log(consultationMode, "consultationMode");
  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-50/60">
      {/* Header */}
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}


        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/doctor/appointments">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Consultation Session
              </h1>
              {isLoadingPatient || isFetchingPatient || isLoadingDietPlanData ? (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Loading patient details...
                  </p>
                </div>
              ) : patient ? (
                <p className="text-sm text-slate-500 mt-1">
                  {patient.first_name} {patient.last_name}{" "}
                </p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  Patient details unavailable
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {bodyMeasurementGoals.length > 0 ? (
              <Button
                variant="outline"
                onClick={() => setShowViewGoalDrawer(true)}
                className="border-green-300 text-green-700 hover:bg-green-50 shadow-sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Assigned Goal
              </Button>
            ) : (
              <></>
            )}


            {/* {activeDietPlan && (
              <Button
                onClick={() => setShowGuidelineModal(true)}
                className="bg-indigo-600 hover:bg-slate-900 text-white shadow-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Guidelines Pdfs
              </Button>
            )} */}

            <Button
              variant="outline"
              onClick={() => setShowPrescriptionModal(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 shadow-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Add New
            </Button>

            <Button variant="destructive" onClick={() => setShowEndSessionConfirm(true)}>
              <PhoneOff className="h-4 w-4 mr-1" />
              End Session
            </Button>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Call Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Container */}
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {sessionEnded ? (
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 aspect-video flex items-center justify-center px-6 text-center">
                  <div className="space-y-4 max-w-md mx-auto text-white">
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 mx-auto flex items-center justify-center">
                      <PhoneOff className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-semibold">
                        Consultation ended
                      </p>
                      <p className="text-sm text-slate-200">
                        Session recording and notes are saved. You can reopen
                        the video call or exit the consultation anytime.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowRescheduleDialog(true)}
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleExitConsultation}
                        className="bg-white text-slate-900 hover:bg-white/90"
                      >
                        Consultation Done
                      </Button>
                    </div>
                  </div>
                </div>
              ) : consultationMode === "video" && normalizedMeetingLink ? (
                <>
                  {/* Video Call iframe */}
                  <div className="relative bg-slate-900 aspect-video">
                    {iframeStatus !== "error" && (
                      <iframe
                        src={normalizedMeetingLink}
                        className="w-full h-full"
                        allow="camera *; microphone *; fullscreen *; speaker *; display-capture *; autoplay *; clipboard-read *; clipboard-write *; computed-pressure *"
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-presentation allow-top-navigation-by-user-activation"
                        referrerPolicy="origin"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        title="Video Consultation"
                      />
                    )}

                    {iframeStatus === "loading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
                        <div className="flex flex-col items-center gap-2 text-white">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <p className="text-sm text-slate-200">
                            Connecting to meeting...
                          </p>
                        </div>
                      </div>
                    )}

                    {iframeStatus === "error" && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900 px-6 text-center text-slate-100">
                        <div className="space-y-3">
                          <p className="text-base font-semibold">
                            This meeting link will not open here.
                          </p>
                          <p className="text-sm text-slate-300">
                            Please use the button below to open the session in a new
                            tab. Camera and microphone permissions will be
                            requested there.
                          </p>
                          <Button
                            onClick={handleOpenMeetingExternally}
                            variant="secondary"
                            className="bg-white/90 text-slate-900 hover:bg-white"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Meeting in New Tab
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Connection Status */}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-emerald-600 text-white">
                        <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                        Live Video Call
                      </Badge>
                    </div>


                  </div>

                  {/* Minimal Controls for iframe mode */}
                  <div className="bg-slate-900 p-4 flex items-center justify-center gap-3">
                    <Button
                      size="lg"
                      variant="destructive"
                      className="rounded-full w-14 h-14"
                      onClick={() => setShowEndSessionConfirm(true)}
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                  </div>
                </>
              ) : consultationMode === "audio" ? (
                <div className="p-6 bg-white">
                  <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-800/70 flex items-center justify-center border border-white/10">
                        <Mic className="h-9 w-9 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-lg font-semibold">
                          Audio consultation in progress
                        </p>
                        {patient ? (
                          <p className="text-slate-300 text-sm">
                            Talking with {patient.first_name}{" "}
                            {patient.last_name}
                          </p>
                        ) : (
                          <p className="text-slate-300 text-sm">
                            Fetching participant info…
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end">
                      <Badge className="bg-emerald-600 text-white capitalize w-fit">
                        <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                        {consultationMode} mode
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* In-person mode UI */}
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4 border-4 border-slate-600">
                        <User className="h-16 w-16 text-slate-300" />
                      </div>
                      {patient ? (
                        <>
                          <p className="text-white text-lg font-semibold">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-slate-300 text-sm capitalize">
                            {consultationMode} Consultation
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-300 text-sm">Loading...</p>
                      )}
                    </div>

                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-600 text-white capitalize">
                        <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                        {consultationMode} Session
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 flex items-center justify-center gap-3">
                    <Button
                      size="lg"
                      variant="destructive"
                      className="rounded-full w-14 h-14"
                      onClick={() => setShowEndSessionConfirm(true)}
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Adherence & Info Section */}
        <div className="space-y-6">
          {/* Patient Info Card */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              {isLoadingPatient || isFetchingPatient ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : patient ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-sm text-slate-500">{patient.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Gender:</span>
                      <span className="font-semibold text-xs capitalize">
                        {patient.gender || "N/A"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssessmentDrawer(true)}
                    className="w-full mt-4 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    View Assessment
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-sm text-slate-500">
                  Patient details unavailable
                </div>
              )}
            </CardContent>
          </Card>
          {/* Upcoming Consultation Card */}
          {upcomingHistoryCall && (
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-blue-900">
                        Upcoming Consultation
                      </CardTitle>
                      <p className="text-sm text-blue-700 mt-0.5">
                        {upcomingAppointments?.[0]?.call_type} Scheduled
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {upcomingHistoryCall.status.charAt(0).toUpperCase() +
                      upcomingHistoryCall.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 font-medium">Date</p>
                    <p className="text-sm font-semibold text-blue-900">
                      {upcomingAppointments?.[0]?.scheduled_date ? new Date(
                        upcomingAppointments[0].scheduled_date,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }) : "--"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 font-medium">Time</p>
                    <p className="text-sm font-semibold text-blue-900">
                      {upcomingHistoryCall.scheduled_time ||
                        upcomingAppointments?.[0]?.start_time}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 font-medium">
                      Duration
                    </p>
                    <p className="text-sm font-semibold text-blue-900">
                      {upcomingHistoryCall.duration_mins} mins
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 font-medium">Mode</p>
                    <p className="text-sm font-semibold text-blue-900 capitalize">
                      {upcomingHistoryCall.mode}
                    </p>
                  </div>
                </div>

                {upcomingHistoryCall.meeting_link && (
                  <div className="space-y-1 pt-2 border-t border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">
                      Meeting Link
                    </p>
                    <a
                      href={upcomingHistoryCall.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-700 hover:text-blue-900 underline break-all"
                    >
                      {upcomingHistoryCall.meeting_link}
                    </a>
                  </div>
                )}

                {upcomingHistoryCall.notes && (
                  <div className="space-y-1 pt-2 border-t border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">Notes</p>
                    <p className="text-sm text-blue-900">
                      {upcomingHistoryCall.notes}
                    </p>
                  </div>
                )}

                {/* <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRescheduleAppointmentId(upcomingHistoryCall.id);
                      setRescheduleForm({
                        appointmentDate: new Date(
                          upcomingHistoryCall.scheduled_date,
                        ).toISOString().split("T")[0],
                        startTime:
                          upcomingHistoryCall.scheduled_time ||
                          upcomingHistoryCall.start_time,
                        endTime: upcomingHistoryCall.end_time || "",
                        slotId: upcomingHistoryCall.slot_id || "",
                        appointmentType: upcomingHistoryCall.appointment_type,
                        reason: upcomingHistoryCall.reason || "",
                        mode: (upcomingHistoryCall.mode || "video") as "audio" | "video" | "offline",
                        meetingLink: upcomingHistoryCall.meeting_link || "",
                        address: upcomingHistoryCall.address || "",
                      });
                      setShowRescheduleDialog(true);
                    }}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Reschedule Appointment
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          )}
          {/* Adherence Tracking */}
          {/* <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Adherence Tracking</h3>
              {isLoadingPatient || isFetchingPatient ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Apple className="h-4 w-4 text-slate-700" />
                        <span className="text-sm font-medium">Diet</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">--</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-slate-700" />
                        <span className="text-sm font-medium">Water Intake</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">--</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-slate-700" />
                        <span className="text-sm font-medium">Exercise</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">--</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-slate-700" />
                        <span className="text-sm font-medium">Sleep</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">--</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-slate-700" />
                        <span className="text-sm font-medium">Stress Management</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">--</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* Quick Actions */}
        </div>
      </div>

      {/* Diet Plan & Grocery List Tabs */}
      {isAssigningDietPlan && (
        /* Skeleton loader — shown only while assign + refetch is in-flight */
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6 space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            {/* Summary cards skeleton */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
            </div>
            {/* Day selector skeleton */}
            <div className="rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-9 w-9 bg-slate-200 rounded animate-pulse" />
                  <div className="h-9 w-9 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
                ))}
              </div>
            </div>
            {/* Meals skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diet Plan & Grocery List Tabs */}
      {!activeDietPlan ? (
        <></>
      ) : (
        <DietPlanPhaseCard
          activeDietPlan={activeDietPlan}
          patientId={id}
          readOnly={true}
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
      {/* Send Diet Plan Modal */}
      <Dialog open={showDietPlanModal} onOpenChange={setShowDietPlanModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Diet Plan Template</DialogTitle>
            <DialogDescription>
              Choose a diet plan template to assign to the patient
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto max-h-[50vh]">
            {isLoadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <span className="ml-3 text-slate-600">
                  Loading templates...
                </span>
              </div>
            ) : dietTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No diet templates available</p>
                <p className="text-sm text-slate-500 mt-1">
                  Please create templates first
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {dietTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTemplateId === template.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900">
                            {template.title}
                          </h3>
                          {selectedTemplateId === template.id && (
                            <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-slate-600 mb-2">
                            {template.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {template.total_days && (
                            <Badge
                              variant="outline"
                              className="border-slate-300 text-slate-600"
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              {template.total_days} days
                            </Badge>
                          )}
                          {(template.target_calories_min ||
                            template.target_calories_max) && (
                              <Badge
                                variant="outline"
                                className="border-slate-300 text-slate-600"
                              >
                                {template.target_calories_min &&
                                  template.target_calories_max
                                  ? `${template.target_calories_min}-${template.target_calories_max} kcal/day`
                                  : template.target_calories_min
                                    ? `${template.target_calories_min}+ kcal/day`
                                    : `Up to ${template.target_calories_max} kcal/day`}
                              </Badge>
                            )}
                          {template.is_active && (
                            <Badge
                              variant="outline"
                              className="border-emerald-300 text-emerald-600 bg-emerald-50"
                            >
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-600">
                The diet plan will be assigned to the patient and they will
                receive notifications.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDietPlanModal(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendDietPlan}
              disabled={!selectedTemplateId || isLoadingTemplates}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-2" />
              Assign Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

                  // Refetch both patient and diet plan to refresh the meal data
                  await Promise.all([
                    refetchPatientDetails(),
                    refetchDietPlan()
                  ]);

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

      {/* Monday Calendar Picker */}
      <MondayCalendarPicker
        open={showMondayCalendar}
        onOpenChange={setShowMondayCalendar}
        onSelectMonday={handleStartDietPlan}
        patientName={
          patient ? `${patient.first_name} ${patient.last_name}` : "Patient"
        }
      />

      {/* Refer Doctor Modal */}
      <ReferStaffModal
        open={showReferDoctorModal}
        onOpenChange={setShowReferDoctorModal}
        patientName={
          patient ? `${patient.first_name} ${patient.last_name}` : "Patient"
        }
        patientId={patient?.id || id}
        //@ts-ignore
        defaultStaffId={enrollment?.assigned_staff?.doctor}
        role="doctor"
      />

      {/* Refer Physio Modal */}
      <ReferStaffModal
        open={showReferPhysioModal}
        onOpenChange={setShowReferPhysioModal}
        patientName={
          patient ? `${patient.first_name} ${patient.last_name}` : "Patient"
        }
        patientId={patient?.id || id}
        defaultStaffId={enrollment?.assigned_staff?.physio?.id}
        role="physio"
      />

      {/* Reschedule Sheet */}
      <RescheduleSheet
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
        patientName={patient ?
          (patient.first_name ||
            `${patient.first_name || ""} ${patient.last_name || ""}`.trim() ||
            `Patient #${patient.id?.slice(0, 6)}`)
          : ""
        }
        rescheduleForm={rescheduleForm}
        availableSlots={availableSlots}
        isLoadingSlots={isLoadingSlots}
        isRescheduling={isRescheduling}
        hasExistingAppointment={!!rescheduleAppointmentId}
        onFormChange={(field, value) => {
          if (field === "slotData") {
            // Handle slot data object
            setRescheduleForm({
              ...rescheduleForm,
              slotId: value.slotId,
              startTime: value.startTime,
              endTime: value.endTime,
            });
          } else {
            // Handle individual field changes
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
            handleReschedule();
          }
        }}
        onCancel={() => {
          setShowRescheduleDialog(false);
          setRescheduleForm({
            appointmentDate: "",
            startTime: "",
            endTime: "",
            slotId: "",
            appointmentType: "consultation",
            mode: "video",
            meetingLink: "",
            address: "",
            reason: "",
          });
        }}
      />

      {/* Assessment Dialog */}
      <Sheet open={showAssessmentDrawer} onOpenChange={setShowAssessmentDrawer}>
        <SheetContent className="sm:max-w-[580px] p-0 bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight">Patient Assessment</SheetTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
              View patient's assessment responses and medical information
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {patientClinicalData?.data?.assessment_submissions &&
              patientClinicalData.data.assessment_submissions.length > 0 ? (
              patientClinicalData.data.assessment_submissions.map(
                (assessment: any, idx: number) => (
                  <div key={assessment.id || idx} className="space-y-4">
                    {/* Assessment Header */}
                    <div className="pb-4 border-b border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {assessment.speciality_name || "Assessment"}
                        </h3>
                        <Badge
                          variant="outline"
                          className="border-slate-300 text-slate-600"
                        >
                          {new Date(assessment.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </Badge>
                      </div>
                    </div>

                    {/* Questions and Answers - New Structure with Sections */}
                    {assessment.questions_and_answers && assessment.questions_and_answers.length > 0 ? (
                      <div className="space-y-6">
                        {assessment.questions_and_answers.map((section: any, sectionIdx: number) => (
                          <div key={sectionIdx} className="space-y-4">
                            {/* Section Header */}
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                              <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                                {section.section_name}
                              </h4>
                            </div>

                            {/* Section Questions */}
                            <div className="space-y-3 pl-7">
                              {section.questions && section.questions.length > 0 ? (
                                section.questions.map((qa: any, qaIdx: number) => (
                                  <Card
                                    key={qaIdx}
                                    className="border border-slate-200 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <CardContent className="p-4">
                                      <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                                          {qa.question?.replace(/_/g, " ")}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-900">
                                          {Array.isArray(qa.answer)
                                            ? qa.answer.join(", ")
                                            : qa.answer || "Not answered"}
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <p className="text-xs text-slate-500 italic">No questions in this section</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Fallback to old structure if questions_and_answers is not available */
                      assessment.raw_responses_json?.data?.questions_and_ans &&
                      assessment.raw_responses_json.data.questions_and_ans.length > 0 ? (
                        <div className="space-y-4">
                          {assessment.raw_responses_json.data.questions_and_ans.map(
                            (qa: any, qaIdx: number) => (
                              <Card
                                key={qaIdx}
                                className="border border-slate-200 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                                      {qa.question?.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {Array.isArray(qa.ans)
                                        ? qa.ans.join(", ")
                                        : qa.ans || "Not answered"}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">
                            No assessment responses available
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ),
              )
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  No assessments found
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Patient has not completed any assessments yet
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Set Goal Dialog */}
      <Sheet open={showSetGoalDrawer} onOpenChange={setShowSetGoalDrawer}>
        <SheetContent className="sm:max-w-[540px] p-0 bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight">Set Body Measurement Goals</SheetTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
              Set weight and body measurement goals for {patient?.first_name} {patient?.last_name}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight_kg" className="font-black text-xs uppercase tracking-widest text-slate-500">
                Weight (kg) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="weight_kg"
                type="text"
                placeholder="Enter target weight in kg"
                value={goalForm.weight_kg}
                onChange={(e) => {
                  setGoalForm({ ...goalForm, weight_kg: e.target.value });
                  if (goalFormErrors.weight_kg) {
                    setGoalFormErrors({ ...goalFormErrors, weight_kg: "" });
                  }
                }}
                className={`h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white ${goalFormErrors.weight_kg ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {goalFormErrors.weight_kg && (
                <p className="text-sm text-red-600">{goalFormErrors.weight_kg}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="chest_cm" className="font-black text-xs uppercase tracking-widest text-slate-500">
                Chest (cm)
              </Label>
              <Input
                id="chest_cm"
                type="text"
                placeholder="Enter target chest measurement in cm"
                value={goalForm.chest_cm}
                onChange={(e) => {
                  setGoalForm({ ...goalForm, chest_cm: e.target.value });
                  if (goalFormErrors.chest_cm) {
                    setGoalFormErrors({ ...goalFormErrors, chest_cm: "" });
                  }
                }}
                className={`h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white ${goalFormErrors.chest_cm ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {goalFormErrors.chest_cm && (
                <p className="text-sm text-red-600">{goalFormErrors.chest_cm}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist_cm" className="font-black text-xs uppercase tracking-widest text-slate-500">
                Waist (cm)
              </Label>
              <Input
                id="waist_cm"
                type="text"
                placeholder="Enter target waist measurement in cm"
                value={goalForm.waist_cm}
                onChange={(e) => {
                  setGoalForm({ ...goalForm, waist_cm: e.target.value });
                  if (goalFormErrors.waist_cm) {
                    setGoalFormErrors({ ...goalFormErrors, waist_cm: "" });
                  }
                }}
                className={`h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white ${goalFormErrors.waist_cm ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {goalFormErrors.waist_cm && (
                <p className="text-sm text-red-600">{goalFormErrors.waist_cm}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hips_cm" className="font-black text-xs uppercase tracking-widest text-slate-500">
                Hips (cm)
              </Label>
              <Input
                id="hips_cm"
                type="text"
                placeholder="Enter target hips measurement in cm"
                value={goalForm.hips_cm}
                onChange={(e) => {
                  setGoalForm({ ...goalForm, hips_cm: e.target.value });
                  if (goalFormErrors.hips_cm) {
                    setGoalFormErrors({ ...goalFormErrors, hips_cm: "" });
                  }
                }}
                className={`h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white ${goalFormErrors.hips_cm ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {goalFormErrors.hips_cm && (
                <p className="text-sm text-red-600">{goalFormErrors.hips_cm}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="arm_cm" className="font-black text-xs uppercase tracking-widest text-slate-500">
                Arm (cm)
              </Label>
              <Input
                id="arm_cm"
                type="text"
                placeholder="Enter target arm measurement in cm"
                value={goalForm.arm_cm}
                onChange={(e) => {
                  setGoalForm({ ...goalForm, arm_cm: e.target.value });
                  if (goalFormErrors.arm_cm) {
                    setGoalFormErrors({ ...goalFormErrors, arm_cm: "" });
                  }
                }}
                className={`h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white ${goalFormErrors.arm_cm ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {goalFormErrors.arm_cm && (
                <p className="text-sm text-red-600">{goalFormErrors.arm_cm}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calf_cm" className="font-black text-xs uppercase tracking-widest text-slate-500">
                Calf (cm)
              </Label>
              <Input
                id="calf_cm"
                type="text"
                placeholder="Enter target calf measurement in cm"
                value={goalForm.calf_cm}
                onChange={(e) => {
                  setGoalForm({ ...goalForm, calf_cm: e.target.value });
                  if (goalFormErrors.calf_cm) {
                    setGoalFormErrors({ ...goalFormErrors, calf_cm: "" });
                  }
                }}
                className={`h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white ${goalFormErrors.calf_cm ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {goalFormErrors.calf_cm && (
                <p className="text-sm text-red-600">{goalFormErrors.calf_cm}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="muscle_mass_percentage" className="font-black text-xs uppercase tracking-widest text-slate-500">
                Muscle Mass (%)
              </Label>
              <Input
                id="muscle_mass_percentage"
                type="text"
                placeholder="Enter target muscle mass percentage"
                value={goalForm.muscle_mass_percentage}
                onChange={(e) => {
                  setGoalForm({ ...goalForm, muscle_mass_percentage: e.target.value });
                  if (goalFormErrors.muscle_mass_percentage) {
                    setGoalFormErrors({ ...goalFormErrors, muscle_mass_percentage: "" });
                  }
                }}
                className={`h-12 font-bold border-2 focus:border-indigo-600 transition-all rounded-xl bg-white ${goalFormErrors.muscle_mass_percentage ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {goalFormErrors.muscle_mass_percentage && (
                <p className="text-sm text-red-600">{goalFormErrors.muscle_mass_percentage}</p>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t p-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
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
                setGoalFormErrors({});
              }}
              disabled={setBodyGoalsMutation.isPending}
              className="flex-1 h-12 font-black border-2 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetGoal}
              disabled={setBodyGoalsMutation.isPending}
              className="flex-1 h-12 bg-gradient-to-r from-slate-900 to-slate-800 font-black shadow-xl rounded-xl"
            >
              {setBodyGoalsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Goals
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Goal Dialog */}
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
                  <Card key={param.type} className="border border-slate-200 bg-slate-50/50 shadow-none hover:bg-slate-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                            {param.label}
                          </p>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                autoFocus
                                value={editingGoalValue}
                                onChange={(e) => setEditingGoalValue(e.target.value)}
                                className="h-8 w-full text-sm font-bold border-2 focus:border-green-500"
                                placeholder={`Enter ${param.label.toLowerCase()}`}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleEditGoal(goal?.id || "", param.type, editingGoalValue)}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                                disabled={setBodyGoalsMutation.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 p-0 border-slate-300 hover:bg-slate-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-slate-900">
                              {goal ? goal.target_value : "--"}
                              <span className="text-sm font-medium text-slate-500 ml-1">
                                {param.unit}
                              </span>
                            </p>
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
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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

            <div className="pt-6">
              <Button
                variant="outline"
                onClick={() => setShowViewGoalDrawer(false)}
                className="w-full border-slate-300 hover:bg-slate-50 h-11 font-semibold"
              >
                Close View
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* End Session Confirmation */}
      <AlertDialog open={showEndSessionConfirm} onOpenChange={setShowEndSessionConfirm}>
        <AlertDialogContent className="bg-white border-2 border-slate-200 sm:max-w-[500px]">
          <AlertDialogHeader>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto sm:mx-0 ${missingItems.length > 0 ? "bg-amber-100" : "bg-red-100"}`}>
              {missingItems.length > 0 ? (
                <Info className="h-6 w-6 text-amber-600" />
              ) : (
                <PhoneOff className="h-6 w-6 text-red-600" />
              )}
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              {missingItems.length > 0 ? "Pending Tasks Found" : "End Consultation Session?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              {missingItems.length > 0 ? (
                <div className="space-y-3 pt-2">
                  <p className="font-medium text-slate-900">
                    The following critical items have not been configured for this patient:
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <ul className="space-y-2">
                      {missingItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                          <X className="h-3 w-3 text-red-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm">
                    Ending the session will mark the appointment as completed. Are you sure you want to proceed without completing these tasks?
                  </p>
                </div>
              ) : (
                "Are you sure you want to end this consultation? This will mark the appointment as completed and save all clinical records."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold">
              {missingItems.length > 0 ? "Keep Configuring" : "Continue Consultation"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndConsultation}
              disabled={isEndingSession}
              className={`${missingItems.length > 0 ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"} text-white font-semibold`}
            >
              {isEndingSession ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ending...
                </>
              ) : (
                missingItems.length > 0 ? "Yes, End Anyway" : "Yes, End Session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {activeDietPlan && (
        <GuidelinePdfsModal
          isOpen={showGuidelineModal}
          onClose={() => setShowGuidelineModal(false)}
          dietPlanId={(activeDietPlan as any)?.diet_plan_id || (activeDietPlan as any)?.id}
        />
      )}

      <PrescriptionModal
        open={showPrescriptionModal}
        onOpenChange={setShowPrescriptionModal}
        patientId={patient?.id || id}
        patientName={patient ? `${patient.first_name} ${patient.last_name}` : "Patient"}
        patientGender={patient?.gender}
      />
    </div>
  );
}
