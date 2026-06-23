"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Database,
  Globe,
  Layout,
  Loader2,
  MoreVertical,
  Pencil,
  PlusCircle,
  Settings2,
  Trash2,
  DollarSign,
  TrendingUp,
  History,
  CheckCircle2,
  XCircle,
  Power,
  PowerOff,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { useWorkflowProgram } from "@/hooks/use-workflow-programs";
import { useUpdateWorkflowProgram } from "@/hooks/use-update-workflow-program";
import {
  useWorkflowProgramPlans,
  useCreateWorkflowProgramPlan,
  useUpdateWorkflowProgramPlan,
  useDeleteWorkflowProgramPlan,
  type WorkflowProgramPlan
} from "@/hooks/use-workflow-program-plans";
import {
  usePlanPricingHistory,
  useCreatePlanPricing,
  useDeactivatePlanPricing,
  type PlanPricing,
} from "@/hooks/use-plan-pricing";
import { useActivatePlan, useDeactivatePlan } from "@/hooks/use-plan-actions";
import { WORKFLOW_DURATION_TYPES, WORKFLOW_PROGRAM_STATUSES } from "@/constants/workflow-program";
import { cn } from "@/lib/utils";
import { useSuperAdmin } from "@/components/super-admin/super-admin-context";

export default function WorkflowProgramDetailPage() {
  const params = useParams<{ id: string; programId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const specialityId = params.id;
  const programId = params.programId;

  const { specialties: { data: specialtiesData } } = useSuperAdmin();
  const specialty = specialtiesData.find((item) => item.id === specialityId);

  const { data: program, isLoading, isError, error } = useWorkflowProgram(programId);
  const { data: plans = [], isLoading: plansLoading, refetch: refetchPlans } = useWorkflowProgramPlans(programId);

  const updateProgram = useUpdateWorkflowProgram();
  const createPlan = useCreateWorkflowProgramPlan();
  const updatePlan = useUpdateWorkflowProgramPlan();
  const deletePlan = useDeleteWorkflowProgramPlan();
  const activatePlan = useActivatePlan();
  const deactivatePlan = useDeactivatePlan();
  const createPricing = useCreatePlanPricing();
  const deactivatePricing = useDeactivatePlanPricing();

  const [planDrawerOpen, setPlanDrawerOpen] = React.useState(false);
  const [planDrawerMode, setPlanDrawerMode] = React.useState<"create" | "edit">("create");
  const [activePlan, setActivePlan] = React.useState<WorkflowProgramPlan | null>(null);
  const [planPendingDelete, setPlanPendingDelete] = React.useState<WorkflowProgramPlan | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const [pricingDrawerOpen, setPricingDrawerOpen] = React.useState(false);
  const [selectedPlanForPricing, setSelectedPlanForPricing] = React.useState<WorkflowProgramPlan | null>(null);
  const [planPendingActivate, setPlanPendingActivate] = React.useState<WorkflowProgramPlan | null>(null);
  const [planPendingDeactivate, setPlanPendingDeactivate] = React.useState<WorkflowProgramPlan | null>(null);
  const [pricingPendingDeactivate, setPricingPendingDeactivate] = React.useState<PlanPricing | null>(null);
  const [pricingHistoryOpen, setPricingHistoryOpen] = React.useState(false);
  const [pricingHistoryPlan, setPricingHistoryPlan] = React.useState<WorkflowProgramPlan | null>(null);

  const { data: pricingHistory = [], isLoading: pricingHistoryLoading } = usePlanPricingHistory(
    programId,
    pricingHistoryPlan?.id ?? "",
    Boolean(pricingHistoryOpen && pricingHistoryPlan?.id)
  );

  const formatCurrency = React.useCallback((value: string | number | null | undefined, currency = "INR") => {
    const amount = typeof value === "number" ? value : Number(value ?? 0);
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount || 0);
  }, []);

  const classifyPricingState = React.useCallback((pricing: PlanPricing) => {
    const today = new Date();
    const from = new Date(pricing.effective_from);
    const to = pricing.effective_to ? new Date(pricing.effective_to) : null;

    if (from > today) return "upcoming";
    if (to && to <= today) return "past";
    return "current";
  }, []);

  const planFormDefaults = React.useMemo(
    () => ({
      name: "",
      code: "",
      description: "",
      planType: "standard",
      durationOverrideDays: "90",
      isDefault: false,
      displayOrder: "1",
      status: "ACTIVE",
    }),
    []
  );

  const [planForm, setPlanForm] = React.useState(planFormDefaults);

  const pricingFormDefaults = React.useMemo(
    () => ({
      basePrice: "",
      currency: "INR",
      enrollmentFee: "0",
      enrollmentFeeAdjustable: true,
      maxDiscountPercent: "0",
      maxDiscountAmount: "0",
      emiMonths: "",
      emiInterestRate: "0",
      effectiveFrom: new Date().toISOString().split('T')[0],
    }),
    []
  );

  const [pricingForm, setPricingForm] = React.useState(pricingFormDefaults);

  const initialEditForm = React.useMemo(
    () => ({
      name: program?.name ?? "",
      code: program?.code ?? "",
      description: program?.description ?? "",
      language: program?.language_code ?? "",
      status: program?.status ?? WORKFLOW_PROGRAM_STATUSES[0],
      durationType: program?.duration_type_v2 ?? program?.duration_type ?? WORKFLOW_DURATION_TYPES[0],
      durationValue: program?.duration_value?.toString() ?? "0",
      durationExtraDays: program?.duration_extra_days?.toString() ?? "",
      triggerDay: program?.auto_generate_trigger_day?.toString() ?? "",
      minBatchSize: program?.min_batch_size?.toString() ?? "0",
      maxBatchSize: program?.max_batch_size?.toString() ?? "0",
      autoBatch: Boolean(program?.auto_generate_batch),
      autoEnroll: Boolean(program?.auto_enroll_patients),
    }),
    [program]
  );

  const [editForm, setEditForm] = React.useState(initialEditForm);

  React.useEffect(() => {
    if (program) {
      setEditForm(initialEditForm);
    }
  }, [program, initialEditForm]);

  React.useEffect(() => {
    if (!planDrawerOpen) {
      setPlanForm(planFormDefaults);
      setActivePlan(null);
    }
  }, [planDrawerOpen, planFormDefaults]);

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!programId) return;
    try {
      await updateProgram.mutateAsync({
        programId,
        payload: {
          name: editForm.name.trim(),
          code: editForm.code.trim().toUpperCase(),
          description: editForm.description.trim() || undefined,
          language_code: editForm.language,
          status: editForm.status as any,
          duration_type_v2: editForm.durationType as any,
          duration_value: Number(editForm.durationValue),
          duration_extra_days: Number(editForm.durationExtraDays) || 0,
          auto_generate_trigger_day: Number(editForm.triggerDay) || 0,
          min_batch_size: Number(editForm.minBatchSize) || 0,
          max_batch_size: Number(editForm.maxBatchSize) || 0,
          auto_generate_batch: editForm.autoBatch,
          auto_enroll_patients: editForm.autoEnroll,
        },
      });
      toast.success("Workflow program updated");
      setEditOpen(false);
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to update program");
    }
  };

  const handleOpenPlanDrawer = (mode: "create" | "edit", plan?: WorkflowProgramPlan) => {
    setPlanDrawerMode(mode);
    if (mode === "edit" && plan) {
      setActivePlan(plan);
      setPlanForm({
        name: plan.name ?? "",
        code: plan.code ?? "",
        description: plan.description ?? "",
        planType: plan.plan_type ?? "standard",
        durationOverrideDays: plan.duration_override_days?.toString() ?? "0",
        isDefault: Boolean(plan.is_default),
        displayOrder: plan.display_order?.toString() ?? "1",
        status: plan.status ?? "ACTIVE",
      });
    } else {
      setActivePlan(null);
      setPlanForm(planFormDefaults);
    }
    setPlanDrawerOpen(true);
  };

  const buildPlanPayload = () => {
    const durationValue = planForm.durationOverrideDays?.toString().trim() ?? "";
    const durationNumber = durationValue === "" ? null : Number(durationValue);

    return {
      name: planForm.name.trim(),
      code: planForm.code.trim().toUpperCase(),
      description: planForm.description.trim() || undefined,
      plan_type: planForm.planType,
      duration_override_days: durationNumber === null || Number.isNaN(durationNumber) ? null : durationNumber,
      is_default: planForm.isDefault,
      display_order: Number(planForm.displayOrder) || 1,
      // is_active: planForm.status === "ACTIVE",
    };
  };

  const handlePlanSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!planForm.name.trim() || !planForm.code.trim() || !programId) {
      toast.error("Name and code are required");
      return;
    }
    const payload = buildPlanPayload();
    try {
      if (planDrawerMode === "edit" && activePlan?.id) {
        await updatePlan.mutateAsync({
          programId,
          planId: activePlan.id,
          payload,
        });
        toast.success("Plan updated");
      } else {
        await createPlan.mutateAsync({
          programId,
          payload,
        });
        toast.success("New plan created");
      }
      setPlanDrawerOpen(false);
      refetchPlans();
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to save plan");
    }
  };

  const handleDeletePlan = async () => {
    if (!planPendingDelete || !programId) return;
    try {
      await deletePlan.mutateAsync({
        programId,
        planId: planPendingDelete.id,
      });
      toast.success("Plan deleted successfully");
      setPlanPendingDelete(null);
      refetchPlans();
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to delete plan");
    }
  };

  const handleActivatePlan = async () => {
    if (!planPendingActivate || !programId) return;
    try {
      await activatePlan.mutateAsync({
        programId,
        planId: planPendingActivate.id,
      });
      toast.success("Plan activated successfully");
      setPlanPendingActivate(null);
      refetchPlans();
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to activate plan");
    }
  };

  const handleDeactivatePlan = async () => {
    if (!planPendingDeactivate || !programId) return;
    try {
      await deactivatePlan.mutateAsync({
        programId,
        planId: planPendingDeactivate.id,
      });
      toast.success("Plan deactivated successfully");
      setPlanPendingDeactivate(null);
      refetchPlans();
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to deactivate plan");
    }
  };

  const handleOpenPricingDrawer = (plan: WorkflowProgramPlan) => {
    setSelectedPlanForPricing(plan);
    const cp = plan.current_pricing;
    setPricingForm({
      basePrice: cp?.base_price ?? "",
      currency: cp?.currency ?? pricingFormDefaults.currency,
      enrollmentFee: cp?.enrollment_fee ?? pricingFormDefaults.enrollmentFee,
      enrollmentFeeAdjustable: cp?.enrollment_fee_adjustable ?? pricingFormDefaults.enrollmentFeeAdjustable,
      maxDiscountPercent: cp?.max_discount_percent ?? pricingFormDefaults.maxDiscountPercent,
      maxDiscountAmount: cp?.max_discount_amount ?? pricingFormDefaults.maxDiscountAmount,
      emiMonths: cp?.emi_months?.toString() ?? "",
      emiInterestRate: cp?.emi_interest_rate ?? pricingFormDefaults.emiInterestRate,
      effectiveFrom: pricingFormDefaults.effectiveFrom,
    });
    setPricingDrawerOpen(true);
  };

  const handlePricingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPlanForPricing || !programId) return;

    if (!pricingForm.basePrice || Number(pricingForm.basePrice) <= 0) {
      toast.error("Base price is required");
      return;
    }

    if (selectedPlanForPricing.plan_type === "emi" && (!pricingForm.emiMonths || Number(pricingForm.emiMonths) <= 0)) {
      toast.error("EMI months is required for EMI plans");
      return;
    }

    const payload: any = {
      base_price: Number(pricingForm.basePrice),
      currency: pricingForm.currency,
      enrollment_fee: Number(pricingForm.enrollmentFee) || 0,
      enrollment_fee_adjustable: pricingForm.enrollmentFeeAdjustable,
      max_discount_percent: Number(pricingForm.maxDiscountPercent) || 0,
      max_discount_amount: Number(pricingForm.maxDiscountAmount) || 0,
      effective_from: pricingForm.effectiveFrom,
    };

    if (selectedPlanForPricing.plan_type === "emi") {
      payload.emi_months = Number(pricingForm.emiMonths);
      payload.emi_interest_rate = Number(pricingForm.emiInterestRate) || 0;
    }

    try {
      await createPricing.mutateAsync({
        programId,
        planId: selectedPlanForPricing.id,
        payload,
      });
      toast.success("Pricing created successfully");
      setPricingDrawerOpen(false);
      refetchPlans();
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to create pricing");
    }
  };

  const handleDeactivatePricing = async () => {
    if (!pricingPendingDeactivate || !programId || !selectedPlanForPricing) return;
    try {
      await deactivatePricing.mutateAsync({
        programId,
        planId: selectedPlanForPricing.id,
        pricingId: pricingPendingDeactivate.id,
      });
      toast.success("Pricing deactivated successfully");
      setPricingPendingDeactivate(null);
      refetchPlans();
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to deactivate pricing");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing data…</p>
      </div>
    );
  }

  if (isError || !program) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
        <Button
          variant="ghost"
          className="gap-2 rounded-full border border-dashed border-slate-200 text-slate-500 hover:bg-slate-50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Return to Specialty
        </Button>
        <div className="rounded-[3rem] border border-dashed border-rose-200 bg-rose-50/30 p-12 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-rose-300" />
          <h2 className="mb-2 text-2xl font-black text-rose-600">Sync Interrupted</h2>
          <p className="mb-8 text-sm text-rose-400/80">
            {error instanceof Error ? error.message : "The requested workflow program could not be established in the current context."}
          </p>
          <Button onClick={() => router.refresh()} className="rounded-2xl bg-rose-500 px-8 hover:bg-rose-600">
            Re-attempt Sync
          </Button>
        </div>
      </div>
    );
  }

  const backHref = `/dashboard/super-admin/specialities/${specialityId}/languages${program.language_code ? `?language=${program.language_code}` : ""}`;

  const brandInitials = specialty?.name
    ? specialty.name.slice(0, 2).toUpperCase()
    : program.name.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-24">
      {/* ── Hero Section ── */}
      <section className="space-y-6 pb-10 px-4 md:px-0">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 md:p-10 shadow-2xl border border-white/5">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-primary/20 blur-[130px]" />
            <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/10 blur-[130px]" />
          </div>

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/60">
                <Link href={backHref} className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
                <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/80">{program.code}</Badge>
                <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-emerald-200">{program.status}</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 shadow-xl shadow-primary/20 border border-white/10">
                    <Settings2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200 leading-none mb-1">Workflow Program</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-white/40 italic">Operations</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {program.name.split(" ").map((word, idx, arr) => (
                    <span key={idx} className={cn(idx === arr.length - 1 && "bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent")}>{word} </span>
                  ))}
                </h1>
                <p className="text-slate-400 text-sm font-medium max-w-xl leading-relaxed">
                  {program.description || "Configure the operational guardrails and subscription rails for this care workflow."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[0.35em] text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Language · {program.language_code || "EN"}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Duration · {program.duration_value} {program.duration_type}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Batch · {program.min_batch_size}-{program.max_batch_size}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:w-auto">
              <Button className="rounded-xl cursor-pointer bg-primary text-white shadow-lg shadow-primary/20 text-[9px] font-black uppercase tracking-widest px-6 h-10" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Program
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 text-[9px] font-black uppercase tracking-widest px-5 h-10">
                    <MoreVertical className="mr-2 h-4 w-4" /> Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                  <DropdownMenuItem onClick={() => setEditOpen(true)} className="rounded-xl p-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <Settings2 className="mr-3 h-4 w-4 text-primary" /> Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl p-3 text-[11px] font-bold uppercase tracking-wider text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                    <Trash2 className="mr-3 h-4 w-4" /> Archive Program
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      {/* ── Program Surface Section ── */}
      <section className="px-4 md:px-0 -mt-8">
        <Card className="fresh-card-alt border-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] rounded-[1.5rem] overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400">Clock Cycles</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">{program.duration_value} {program.duration_type_v2 || program.duration_type}</p>
                    <p className="text-[9px] font-bold text-slate-400">Total duration</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400">Governance</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">{program.min_batch_size} Min</p>
                    <p className="text-[9px] font-bold text-slate-400">Batch threshold</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400">Automation</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Layout className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {program.auto_generate_batch ? "Enabled" : "Manual"}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400">Workflow batching</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400">Updates</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">Sync</p>
                    <p className="text-[9px] font-bold text-slate-400">Catalogue integrity</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Program Plans Section ── */}
      <section className="px-4 md:px-0 mt-10">
        <Card className="fresh-card-alt border-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] rounded-[1.5rem] overflow-hidden">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Catalogue Hub</p>
              <CardTitle className="mt-1 text-2xl font-[900] tracking-tight text-slate-900 md:text-3xl">Program subscription plans</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Govern each subscription tier for enrolments under this workflow program.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">
                ACTIVE PLANS · {plans.length}
              </div>
              <Button
                className="h-12 px-8 cursor-pointer rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.35em] shadow-md shadow-slate-200 transition-all hover:bg-primary"
                onClick={() => handleOpenPlanDrawer("create")}
              >
                <PlusCircle className="mr-3 h-5 w-5" /> Create new plan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {plansLoading ? (
              <div className="flex h-48 items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-100 bg-white">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary/30" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Retrieving active plans…</p>
                </div>
              </div>
            ) : plans.length > 0 ? (
              <div className="grid gap-4">
                {plans.map((item) => {
                  const cp = item.current_pricing;
                  const planPrice = cp ? formatCurrency(cp.base_price, cp.currency) : null;
                  const emiLine = cp && item.plan_type === "emi" && cp.emi_months ? `${formatCurrency(Number(cp.base_price) / (cp.emi_months || 1), cp.currency)} /mo × ${cp.emi_months}` : null;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-white p-6 border border-slate-100 transition-all duration-500 hover:shadow-[0_25px_45px_-25px_rgba(0,0,0,0.25)]",
                        item.is_default && "ring-2 ring-primary bg-primary/[0.02] border-transparent",
                        item.is_active === false && "opacity-70"
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner", item.is_default ? "bg-primary text-white" : "bg-slate-50 text-slate-400")}>{item.name.slice(0, 1)}</div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900">{item.name}</h3>
                            {item.is_default && (
                              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.4em]">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-500 line-clamp-1">{item.description || "No plan description provided."}</p>
                          <div className="flex items-center gap-3 pt-1 flex-wrap">
                            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">ID: {item.code}</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">Order: {item.display_order}</span>
                            <Badge variant={item.is_active === false ? "outline" : "secondary"} className={cn("text-[8px] font-black uppercase tracking-[0.4em]", item.is_active === false ? "border-slate-200 text-slate-500" : "bg-emerald-50 text-emerald-600 border-none")}>{item.is_active === false ? "Inactive" : "Active"}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-wrap items-center gap-8 text-center md:text-left">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-300">Validity</p>
                          <p className="text-base font-black text-slate-900">{item.duration_override_days ?? program.duration_value} Days</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-300">Type</p>
                          <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-200 text-slate-900 text-[8px] font-black uppercase tracking-[0.35em] px-2 py-0.5">{item.plan_type}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-300">Pricing</p>
                          {cp ? (
                            <div className="flex flex-col items-start">
                              <span className="text-base font-black text-slate-900">{planPrice}</span>
                              <span className="text-[10px] font-bold text-slate-500">Effective {cp.effective_from}</span>
                              {emiLine && <span className="text-[10px] font-bold text-emerald-600">{emiLine}</span>}
                            </div>
                          ) : (
                            <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-[0.3em]">No pricing set</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                          onClick={() => 
                            //@ts-ignore
                            router.push(`/dashboard/super-admin/specialities/${specialityId}/workflow-programs/${programId}/protocols?programName=${encodeURIComponent(program.name)}&specialityName=${encodeURIComponent(program.speciality_id.name || 'Speciality')}&planId=${item.id}&planName=${encodeURIComponent(item.name)}`)}
                        >
                          <ChevronRight className="mr-2 h-4 w-4" /> Protocol Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                          onClick={() => handleOpenPricingDrawer(item)}
                        >
                          <DollarSign className="mr-2 h-4 w-4" /> Add Pricing
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                          onClick={() => {
                            setSelectedPlanForPricing(item);
                            setPricingHistoryPlan(item);
                            setPricingHistoryOpen(true);
                          }}
                        >
                          <History className="mr-2 h-4 w-4" /> History
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                          onClick={() => handleOpenPlanDrawer("edit", item)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        
                        {item.is_active === false ? (
                          <Button
                            size="sm"
                            className="rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setPlanPendingActivate(item)}
                          >
                            <Power className="mr-2 h-4 w-4" /> Activate
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-500"
                            onClick={() => setPlanPendingDeactivate(item)}
                          >
                            <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white py-20 text-center shadow-inner">
                <div className="mb-6 h-20 w-20 rounded-[1.75rem] bg-slate-50 text-slate-200 flex items-center justify-center">
                  <Database className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-2xl font-black text-slate-900">Catalogue is Empty</h3>
                <p className="mx-auto max-w-sm text-sm font-medium text-slate-500 leading-relaxed">
                  Start by establishing a new subscription plan for this program to begin enrollment operations.
                </p>
                <Button
                  className="mt-6 rounded-2xl bg-slate-900 px-10 h-12 text-[10px] font-black uppercase tracking-[0.35em] hover:bg-primary shadow-lg hover:shadow-primary/20"
                  onClick={() => handleOpenPlanDrawer("create")}
                >
                  Create first plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Dialogs & Drawers ── */}

      <Dialog open={Boolean(planPendingDelete)} onOpenChange={(open) => !open && setPlanPendingDelete(null)}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-[1.5rem] bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black text-slate-900">Delete this plan?</DialogTitle>
            <DialogDescription className="text-center text-slate-500 px-4">
              You are about to permanently remove <strong>{planPendingDelete?.name}</strong>. This will affect new enrollments using this plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3 sm:flex-row flex-col">
            <Button
              variant="ghost"
              className="flex-1 rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
              onClick={() => setPlanPendingDelete(null)}
            >
              Keep plan
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100"
              onClick={() => void handleDeletePlan()}
              disabled={deletePlan.isPending}
            >
              {deletePlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(planPendingActivate)} onOpenChange={(open) => !open && setPlanPendingActivate(null)}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-[1.5rem] bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black text-slate-900">Activate this plan?</DialogTitle>
            <DialogDescription className="text-center text-slate-500 px-4">
              This will make {planPendingActivate?.name} visible to sales and enrollment flows.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:flex-row flex-col mt-8">
            <Button
              variant="ghost"
              className="flex-1 h-14 cursor-pointer rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
              onClick={() => setPlanPendingActivate(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-14 cursor-pointer rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 text-white text-[11px] font-black uppercase tracking-widest"
              onClick={() => void handleActivatePlan()}
              disabled={activatePlan.isPending}
            >
              {activatePlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(planPendingDeactivate)} onOpenChange={(open) => !open && setPlanPendingDeactivate(null)}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-[1.5rem] bg-amber-50 text-amber-500 flex items-center justify-center">
              <PowerOff className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black text-slate-900">Deactivate this plan?</DialogTitle>
            <DialogDescription className="text-center text-slate-500 px-4">
              This will hide the plan from sales. Existing enrollments remain unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:flex-row flex-col mt-8">
            <Button
              variant="ghost"
              className="flex-1 h-14 cursor-pointer rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
              onClick={() => setPlanPendingDeactivate(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-14 cursor-pointer rounded-2xl bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100 text-white text-[11px] font-black uppercase tracking-widest"
              onClick={() => void handleDeactivatePlan()}
              disabled={deactivatePlan.isPending}
            >
              {deactivatePlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pricingHistoryOpen} onOpenChange={(open) => {
        setPricingHistoryOpen(open);
        if (!open) {
          setPricingHistoryPlan(null);
          setPricingPendingDeactivate(null);
        }
      }}>
        <DialogContent className="max-w-7xl min-w-4xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Plan Pricing History</DialogTitle>
            <DialogDescription>
              Complete timeline of past, current, and upcoming pricing entries for {pricingHistoryPlan?.name}.
            </DialogDescription>
          </DialogHeader>
          {pricingHistoryLoading ? (
            <div className="flex h-40 items-center justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : pricingHistory.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-slate-500">No pricing entries yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Price</TableHead>
                  <TableHead>Effective</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingHistory.map((entry) => {
                  const state = classifyPricingState(entry);
                  return (
                    <TableRow key={entry.id} className={cn(state === "current" && "bg-emerald-50")}>
                      <TableCell className="font-semibold">{formatCurrency(entry.base_price, entry.currency)}</TableCell>
                      <TableCell className="space-y-1 text-sm text-slate-600">
                        <div>From: {new Date(entry.effective_from).toLocaleDateString()}</div>
                        <div>To: {entry.effective_to ? new Date(entry.effective_to).toLocaleDateString() : "Open-ended"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-[9px] font-black uppercase tracking-[0.3em]", state === "current" ? "bg-emerald-100 text-emerald-700" : state === "upcoming" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700")}>{state}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {state !== "current" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50"
                            onClick={() => {
                              setSelectedPlanForPricing(pricingHistoryPlan);
                              setPricingPendingDeactivate(entry);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                          </Button>
                        ):<div>N/A</div>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pricingPendingDeactivate)} onOpenChange={(open) => !open && setPricingPendingDeactivate(null)}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-[1.5rem] bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black text-slate-900">Deactivate pricing entry?</DialogTitle>
            <DialogDescription className="text-center text-slate-500 px-4">
              This will deactivate the pricing effective from {pricingPendingDeactivate?.effective_from}. It is intended for upcoming or past entries.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:flex-row flex-col mt-8">
            <Button
              variant="ghost"
              className="flex-1 h-14 cursor-pointer rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
              onClick={() => setPricingPendingDeactivate(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-14 cursor-pointer rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100 text-[11px] font-black uppercase tracking-widest"
              onClick={() => void handleDeactivatePricing()}
              disabled={deactivatePricing.isPending}
            >
              {deactivatePricing.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={pricingDrawerOpen} onOpenChange={setPricingDrawerOpen} direction="right">
        <DrawerContent className="h-full w-full max-w-7xl overflow-y-auto border-l bg-white/95 backdrop-blur-xl sm:max-w-7xl">
          <div className="w-full px-6 pb-12 pt-10 md:px-8">
            <DrawerHeader className="px-0 pb-10">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.5em] text-primary">Pricing Console</p>
              <DrawerTitle className="text-4xl font-[1000] tracking-tight text-slate-900 leading-tight">
                {selectedPlanForPricing?.current_pricing ? "Revise Pricing" : "Add Pricing"}
              </DrawerTitle>
              <DrawerDescription className="pt-2 text-lg font-medium text-slate-500">
                {selectedPlanForPricing ? `Configure pricing for ${selectedPlanForPricing.name}.` : "Configure pricing for the selected plan."}
              </DrawerDescription>
            </DrawerHeader>

            <form onSubmit={handlePricingSubmit} className="space-y-10">
              <div className="space-y-8">
                <div className="grid gap-8 md:grid-cols-1">
                  <div className="space-y-3">
                    <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Base Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                      value={pricingForm.basePrice}
                      onChange={(e) => setPricingForm({ ...pricingForm, basePrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Currency</Label>
                    <Input
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                      value={pricingForm.currency}
                      onChange={(e) => setPricingForm({ ...pricingForm, currency: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-1">
                  <div className="space-y-3">
                    <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Enrollment Fee</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                      value={pricingForm.enrollmentFee}
                      onChange={(e) => setPricingForm({ ...pricingForm, enrollmentFee: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Effective From</Label>
                    <Input
                      type="date"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                      value={pricingForm.effectiveFrom}
                      onChange={(e) => setPricingForm({ ...pricingForm, effectiveFrom: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-1">
                  <div className="space-y-3">
                    <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Max Discount %</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                      value={pricingForm.maxDiscountPercent}
                      onChange={(e) => setPricingForm({ ...pricingForm, maxDiscountPercent: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Max Discount Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                      value={pricingForm.maxDiscountAmount}
                      onChange={(e) => setPricingForm({ ...pricingForm, maxDiscountAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border border-slate-100 bg-slate-50/30 p-6">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">Enrollment fee adjustable</p>
                    <p className="text-[10px] font-bold text-slate-400">Allow fee flexibility during enrolment.</p>
                  </div>
                  <Switch
                    checked={pricingForm.enrollmentFeeAdjustable}
                    onCheckedChange={(checked) => setPricingForm({ ...pricingForm, enrollmentFeeAdjustable: checked })}
                  />
                </div>

                {selectedPlanForPricing?.plan_type === "emi" && (
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">EMI Months</Label>
                      <Input
                        type="number"
                        min="1"
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                        value={pricingForm.emiMonths}
                        onChange={(e) => setPricingForm({ ...pricingForm, emiMonths: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">EMI Interest Rate</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                        value={pricingForm.emiInterestRate}
                        onChange={(e) => setPricingForm({ ...pricingForm, emiInterestRate: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-16 flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
                  onClick={() => setPricingDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-16 flex-1 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all hover:bg-primary hover:shadow-primary/20 hover:scale-[1.02]"
                  disabled={createPricing.isPending}
                >
                  {createPricing.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Save Pricing"}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={planDrawerOpen} onOpenChange={setPlanDrawerOpen} direction="right">
        <DrawerContent className="h-full min-w-lg max-w-7xl overflow-y-auto border-l bg-white/95 backdrop-blur-xl sm:max-w-7xl">
          <div className="w-full px-6 pb-12 pt-10 md:px-8">
            <DrawerHeader className="px-0 pb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-3">Subscription Lab</p>
              <DrawerTitle className="text-4xl font-[1000] tracking-tight text-slate-900 leading-tight">
                {planDrawerMode === "create" ? "Establish New Plan" : `Edit Plan: ${activePlan?.name}`}
              </DrawerTitle>
              <DrawerDescription className="text-lg font-medium text-slate-500 pt-2">
                Configure the enrollment parameters and clinical validity for this subscription tier.
              </DrawerDescription>
            </DrawerHeader>

            <form onSubmit={handlePlanSubmit} className="space-y-10">
              <div className="space-y-8">
                <div className="grid gap-8 md:grid-cols-1">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan Display Name</Label>
                    <Input
                      placeholder="e.g. Standard Clinical Tier"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Universal Code</Label>
                    <Input
                      placeholder="e.g. STD_PLAN_01"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0 disabled:opacity-50"
                      value={planForm.code}
                      onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                      disabled={planDrawerMode === "edit"}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan Description & Value Prop</Label>
                  <Textarea
                    placeholder="Describe the clinical benefits and scope of this plan..."
                    className="min-h-[120px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0 resize-none"
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-8 md:grid-cols-1">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan Tier</Label>
                    <Select value={planForm.planType} onValueChange={(v) => setPlanForm({ ...planForm, planType: v })}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="emi">EMI</SelectItem>
                        <SelectItem value="subsidised">Subsidised</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Duration (Days)</Label>
                    <Input
                      type="number"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                      value={planForm.durationOverrideDays}
                      onChange={(e) => setPlanForm({ ...planForm, durationOverrideDays: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority Order</Label>
                    <Input
                      type="number"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white focus:ring-0"
                      value={planForm.displayOrder}
                      onChange={(e) => setPlanForm({ ...planForm, displayOrder: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border border-slate-100 bg-slate-50/30 p-6">
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={planForm.isDefault}
                      onCheckedChange={(checked) => setPlanForm({ ...planForm, isDefault: checked })}
                    />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">Set as default tier</p>
                      <p className="text-[10px] font-bold text-slate-400">Mark this as the primary plan for new patients</p>
                    </div>
                  </div>
                  <div className="space-y-2 min-w-[150px]">
                    <Select value={planForm.status} onValueChange={(v) => setPlanForm({ ...planForm, status: v })}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-16 flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
                  onClick={() => setPlanDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-16 flex-1 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all hover:bg-primary hover:shadow-primary/20 hover:scale-[1.02]"
                  disabled={createPlan.isPending || updatePlan.isPending}
                >
                  {createPlan.isPending || updatePlan.isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : planDrawerMode === "create" ? (
                    "Initialize Plan"
                  ) : (
                    "Save Configurations"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={editOpen} onOpenChange={setEditOpen} direction="right">
        <DrawerContent className="h-full w-full max-w-5xl overflow-y-auto border-l bg-white/95 backdrop-blur-xl sm:max-w-5xl">
          <div className="w-full px-6 pb-12 pt-10 md:px-8">
            <DrawerHeader className="px-0 pb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-3">Governance Studio</p>
              <DrawerTitle className="text-4xl font-[1000] tracking-tight text-slate-900">Configure Program</DrawerTitle>
              <DrawerDescription className="text-lg font-medium text-slate-500 pt-2">
                Modify the institutional parameters and clinical logic for this workflow.
              </DrawerDescription>
            </DrawerHeader>

            <form onSubmit={handleEditSubmit} className="space-y-10">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Program Public Name</Label>
                  <Input
                    className="h-14 rounded-2xl shadow-sm focus:ring-0"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Internal Reference Code</Label>
                  <Input
                    className="h-14 rounded-2xl shadow-sm focus:ring-0"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cycle Strategy</Label>
                  <Select value={editForm.durationType} onValueChange={(v) => setEditForm({ ...editForm, durationType: v })}>
                    <SelectTrigger className="h-14 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {WORKFLOW_DURATION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Value</Label>
                  <Input
                    type="number"
                    className="h-14 rounded-2xl"
                    value={editForm.durationValue}
                    onChange={(e) => setEditForm({ ...editForm, durationValue: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Buffer Days</Label>
                  <Input
                    type="number"
                    className="h-14 rounded-2xl"
                    value={editForm.durationExtraDays}
                    onChange={(e) => setEditForm({ ...editForm, durationExtraDays: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trigger Offset</Label>
                  <Input
                    type="number"
                    className="h-14 rounded-2xl"
                    value={editForm.triggerDay}
                    onChange={(e) => setEditForm({ ...editForm, triggerDay: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Min Batch</Label>
                  <Input
                    type="number"
                    className="h-14 rounded-2xl"
                    value={editForm.minBatchSize}
                    onChange={(e) => setEditForm({ ...editForm, minBatchSize: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max Batch</Label>
                  <Input
                    type="number"
                    className="h-14 rounded-2xl"
                    value={editForm.maxBatchSize}
                    onChange={(e) => setEditForm({ ...editForm, maxBatchSize: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-12 rounded-[2rem] border border-slate-100 bg-slate-50/30 p-8">
                <div className="flex items-center gap-4">
                  <Switch checked={editForm.autoBatch} onCheckedChange={(v) => setEditForm({ ...editForm, autoBatch: v })} />
                  <Label className="text-[10px] font-black uppercase tracking-widest">Auto Batch</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch checked={editForm.autoEnroll} onCheckedChange={(v) => setEditForm({ ...editForm, autoEnroll: v })} />
                  <Label className="text-[10px] font-black uppercase tracking-widest">Auto Enroll</Label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-16 flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-16 flex-1 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-primary"
                  disabled={updateProgram.isPending}
                >
                  {updateProgram.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Changes"}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}