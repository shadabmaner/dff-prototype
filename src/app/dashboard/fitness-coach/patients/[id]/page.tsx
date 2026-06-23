"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User, Calendar, Clock, Apple, Activity, TrendingUp, ChevronLeft, ChevronRight,
  CheckCircle2, Utensils, ClipboardList, ArrowLeft, Stethoscope, Phone, Mail,
  Target, Info, HeartPulse, Video, PhoneCall, Dumbbell, ShoppingCart, RotateCcw,
  Brain, History, FileText, Edit, Plus, Ruler
} from "lucide-react";
import { toast } from "sonner";
import { usePatientClinicalDetails, usePatientDietPlan, usePatientCollectionProgress, usePatientMindsetLogs } from "@/hooks/use-patient";
import { usePatientMetricsHistory } from "@/hooks/use-patient-metrics";
import { useBookDoctorAppointment, useStaffSlots } from "@/hooks/use-doctor";
import GroceryListTab from "@/components/dietitian/GroceryListTab";
import { PatientLogsTabs } from "@/components/patient-logs/patient-logs-tabs";
import { RescheduleSheet } from "@/components/doctor/patient-details/RescheduleSheet";
import {
  PatientHeader,
  CareTeamSection,
  ConsultationTracking,
  AssessmentSubmissionsCard,
  WeightTrackingCard,
  AssessmentDrawer,
  SalesCallLogsCard,
  BodyMeasurementsDrawer,
} from "@/components/dietitian/patient-details";
import { cn } from "@/lib/utils";
import { DietPlanPhaseCard } from "@/components/dietitian/diet-plan-phase-card";

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientNameFromUrl = searchParams.get("name");

  const [showAssessmentDrawer, setShowAssessmentDrawer] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [dietPlanTab, setDietPlanTab] = useState<"plan" | "grocery">("plan");
  const [showRescheduleSheet, setShowRescheduleSheet] = useState(false);
  const [showGoalsDrawer, setShowGoalsDrawer] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null);
  const [showViewGoalDrawer,setShowViewGoalDrawer]=useState(false)
  const [showBodyMeasurementsDrawer, setShowBodyMeasurementsDrawer] = useState(false)
  
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: new Date().toISOString().split("T")[0],
    slotId: "",
    startTime: "",
    endTime: "",
    appointmentType: "consultation",
    reason: "",
    mode: "video" as "audio" | "video" | "offline",
    meetingLink: "",
    address: "",
  });

  const { data: clinicalData, isLoading: isLoadingPatient } = usePatientClinicalDetails(id);
  const { data: metricsData } = usePatientMetricsHistory(id);
  const { data: dietPlanData } = usePatientDietPlan(id);
  const { data: collectionProgress } = usePatientCollectionProgress(id);
  const { data: mindsetLogs } = usePatientMindsetLogs(id);
  const bookAppointment = useBookDoctorAppointment();
  const { data: slotsResponse, isLoading: isLoadingSlots } = useStaffSlots(rescheduleForm.appointmentDate);
  const slots = slotsResponse?.data || [];
  const availableSlots = slotsResponse?.data || [];
  const isLoadingSlotsData = isLoadingSlots;

  const patient = clinicalData?.data?.patient;
  const enrollment = clinicalData?.data?.enrollment;
  const activeDietPlan: any = clinicalData?.data?.active_diet_plan;
  const assessmentSubmissions = clinicalData?.data?.assessment_submissions || [];
  const bodyMeasurementGoals = clinicalData?.data?.body_measurement_goals || [];
  const latestBodyMeasurements = clinicalData?.data?.latest_body_measurements || null;
  const upcomingAppointments = clinicalData?.data?.upcoming_appointments || [];
const upcomingHistoryCall = upcomingAppointments.find(
    (app: any) => app.call_type === "history_call"
  );
  const exerciseLogs = useMemo(() => {
    if (!collectionProgress?.data || !Array.isArray(collectionProgress.data)) return [];
    return collectionProgress.data.flatMap((c: any) =>
      (c.items || []).map((i: any) => ({ ...i, collection_name: c.collection_name }))
    ).filter((i: any) => i.is_completed || i.is_unlocked)
      .sort((a: any, b: any) => (b.day_number - a.day_number));
  }, [collectionProgress]);

  const totalDays = dietPlanData?.data?.totalDays || dietPlanData?.data?.dayWisePlan?.length || 0;
  const daysPerPage = 30;
  const totalPages = Math.ceil(totalDays / daysPerPage) || 1;
  const currentPageStart = currentPage * daysPerPage + 1;

  const mealsForSelectedDay = useMemo(() => {
    const dayPlan = dietPlanData?.data?.dayWisePlan?.find((d: any) => d.day_number === selectedDay);
    return dayPlan?.meals || [];
  }, [dietPlanData, selectedDay]);

  const tipsForSelectedDay = dietPlanData?.data?.dayWisePlan?.find((d: any) => d.day_number === selectedDay)?.tips;

  // Phase logic from Dietitian portal
  const getPhaseForDay = (day: number) => {
    if (!dietPlanData?.data?.phases) return null;
    const phase = dietPlanData.data.phases.find(
      (p: any) => day >= p.start_day && day <= p.end_day
    );
    return phase?.phase_name || null;
  };

  const getPhaseColors = (phase: string | null, isSelected: boolean) => {
    if (isSelected) return "border-slate-900 bg-slate-900 text-white shadow-lg";
    if (!phase) return "border-slate-200 bg-white hover:border-slate-300";
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

  const calculateAge = (dob?: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };
  const patientAge = patient?.date_of_birth ? calculateAge(patient.date_of_birth) : null;

  const handleRescheduleCall = async () => {
    if (!rescheduleForm.slotId) {
      toast.error("Please select a time slot");
      return;
    }
    
    setIsRescheduling(true);
    try {
      await bookAppointment.mutateAsync({
        patientId: id,
        appointmentDate: rescheduleForm.appointmentDate,
        startTime: rescheduleForm.startTime,
        endTime: rescheduleForm.endTime,
        //@ts-ignore
        appointmentType: rescheduleForm.appointmentType as any,
        reason: rescheduleForm.reason,
        mode: rescheduleForm.mode,
        meetingLink: rescheduleForm.meetingLink || undefined,
      });
      toast.success("Call scheduled successfully");
      setShowRescheduleSheet(false);
      setRescheduleForm({
        appointmentDate: new Date().toISOString().split("T")[0],
        slotId: "",
        startTime: "",
        endTime: "",
        appointmentType: "consultation",
        reason: "",
        mode: "video" as "audio" | "video" | "offline",
        meetingLink: "",
        address: "",
      });
    } catch (e: any) {
      // Handle different error response structures
      let errorMessage = "Failed to schedule call";
      
      if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.data?.message) {
        errorMessage = e.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    if (field === "slotData") {
      setRescheduleForm(prev => ({
        ...prev,
        slotId: value.slotId,
        startTime: value.startTime,
        endTime: value.endTime,
      }));
    } else {
      setRescheduleForm(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCancelReschedule = () => {
    setShowRescheduleSheet(false);
    setRescheduleForm({
      appointmentDate: new Date().toISOString().split("T")[0],
      slotId: "",
      startTime: "",
      endTime: "",
      appointmentType: "consultation",
      reason: "",
      mode: "video" as "audio" | "video" | "offline",
      meetingLink: "",
      address: "",
    });
  };

  if (isLoadingPatient) {
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
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Patients
        </Button>
      </div>

      {/* Header Card */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {patient?.first_name?.[0]}{patient?.last_name?.[0]}
              </div>
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{patient?.first_name} {patient?.last_name}</h1>
                  <p className="text-sm text-slate-600 mt-1">Patient ID: {id.slice(0, 8)}...</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1"><Phone className="h-4 w-4" /> {patient?.phone || "N/A"}</div>
                  {patient?.email && <div className="flex items-center gap-1"><Mail className="h-4 w-4" /> {patient.email}</div>}
                  {patient?.city && <div className="flex items-center gap-1"><span className="text-slate-500">📍</span> {patient.city}, {patient.country}</div>}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {enrollment && (
                    <Badge className={`${enrollment.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      enrollment.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }`}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </Badge>
                  )}
                  {activeDietPlan?.journey_start_date && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                      Start: {new Date(activeDietPlan.journey_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Badge>
                  )}
                  {activeDietPlan?.journey_end_date && (
                    <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                      End: {new Date(activeDietPlan.journey_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Badge>
                  )}
                  {metricsData?.data?.weight_logs?.[0] && (
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      Weight: {metricsData?.data?.weight_logs[0].weight_kg} kg
                    </Badge>
                  )}
                  {patientAge && <Badge variant="outline" className="border-slate-300 text-slate-700">Age: {patientAge} years</Badge>}
                  {patient?.gender && <Badge variant="outline" className="border-slate-300 text-slate-700 capitalize">{patient.gender}</Badge>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setShowBodyMeasurementsDrawer(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
              >
                <Ruler className="h-4 w-4 mr-2" /> Body Measurements
              </Button>
              <Button
                onClick={() => setShowViewGoalDrawer(true)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
              >
                <Target className="h-4 w-4 mr-2" /> Assigned Goals
              </Button>
              <Button
                onClick={() => setShowAssessmentDrawer(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                <ClipboardList className="h-4 w-4 mr-2" /> Assessment Details
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRescheduleSheet(true)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Schedule Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Care Team */}
      <CareTeamSection enrollment={enrollment} />

      {/* Consultation Tracking */}
      <ConsultationTracking
        completedCalls={clinicalData?.data?.completed_appointments}
        historyCalls={clinicalData?.data?.history_calls || []}
        upcomingAppointments={upcomingAppointments}
      />
      
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
            {bodyMeasurementGoals.length > 0 ? (
              <div className="grid gap-4">
                {bodyMeasurementGoals.map((goal: any) => (
                  <Card key={goal.id} className="border border-slate-200 bg-slate-50/50 shadow-none hover:bg-slate-50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                          {goal.goal_type.replace(/_/g, " ")}
                        </p>
                        <p className="text-lg font-bold text-slate-900">
                          {goal.target_value}
                          <span className="text-sm font-medium text-slate-500 ml-1">
                            {goal.unit}
                          </span>
                        </p>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No assigned goals found</p>
              </div>
            )}

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
                   <p className="text-sm text-slate-600 max-w-md mx-auto">
                     This patient doesn't have an active diet plan yet.
                   </p>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <DietPlanPhaseCard
               activeDietPlan={activeDietPlan}
               patientId={id}
               readOnly={true}
             />
           )}

      {/* Patient Logs */}
      <PatientLogsTabs patientId={id} />
      <SalesCallLogsCard callLogs={clinicalData?.data?.call_logs || []} />

      {/* Modals and Drawers */}
      <RescheduleSheet
        open={showRescheduleSheet}
        onOpenChange={setShowRescheduleSheet}
        patientName={patient?.first_name ? `${patient.first_name} ${patient.last_name}` : "Patient"}
        rescheduleForm={rescheduleForm}
        availableSlots={availableSlots}
        isLoadingSlots={isLoadingSlotsData}
        isRescheduling={isRescheduling}
        hasExistingAppointment={!!rescheduleAppointmentId}
        onFormChange={handleFormChange}
        onReschedule={handleRescheduleCall}
        onCancel={handleCancelReschedule}
      />

      {/* Goals Drawer */}
      <Sheet open={showGoalsDrawer} onOpenChange={setShowGoalsDrawer}>
        <SheetContent className="sm:max-w-[440px] p-0 bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b p-6">
            <SheetTitle className="text-xl font-black text-slate-900 tracking-tight">Body Measurement Goals</SheetTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Target metrics for patient</p>
          </div>
          <div className="flex-1 p-6 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input placeholder="Target weight in kg" />
              </div>
              <div className="space-y-2">
                <Label>Chest (cm)</Label>
                <Input placeholder="Target chest measurement" />
              </div>
              <div className="space-y-2">
                <Label>Waist (cm)</Label>
                <Input placeholder="Target waist measurement" />
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t p-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowGoalsDrawer(false)} className="flex-1">Cancel</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">Set Goals</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AssessmentDrawer
                    open={showAssessmentDrawer}
                    onOpenChange={setShowAssessmentDrawer}
                    assessmentSubmissions={assessmentSubmissions}
                    selectedAssessment={selectedAssessment}
                    onSelectAssessment={setSelectedAssessment}
                  />

      <BodyMeasurementsDrawer
        open={showBodyMeasurementsDrawer}
        onOpenChange={setShowBodyMeasurementsDrawer}
        patientName={`${patient?.first_name} ${patient?.last_name}`}
        bodyMeasurementGoals={bodyMeasurementGoals}
        latestBodyMeasurements={latestBodyMeasurements}
      />
    </div>
  );
}
