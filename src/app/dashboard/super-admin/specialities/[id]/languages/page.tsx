  "use client";

import type { ReactNode } from "react";
import React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  BookOpenCheck,
  ClipboardList,
  FileCode2,
  Globe,
  Languages,
  Loader2,
  MapPin,
  PencilLine,
  Plus,
  Save,
  Search,
  Power,
  RefreshCw,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSuperAdmin } from "@/components/super-admin/super-admin-context";
import {
  LANGUAGE_OPTIONS,
  LANGUAGE_OPTION_VALUES,
  LANGUAGE_LABEL_LOOKUP,
  SpecialtyStaffMember,
} from "@/components/super-admin/types";
import { useSpecialityDetail } from "@/hooks/use-speciality-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Drawer } from "@/components/ui/drawer";
import { useWorkflowPrograms, WorkflowProgram, type WorkflowProgramPricing } from "@/hooks/use-workflow-programs";
import {
  useActivateWorkflowProgramPricing,
  useCreateWorkflowProgramPricing,
  useDeactivateWorkflowProgramPricing,
  useUpdateWorkflowProgramPricing,
  useWorkflowProgramPricing,
} from "@/hooks/use-workflow-program-pricing";
import {
  PricingWindowDrawerLayout,
  PricingWindowForm,
} from "@/components/super-admin/pricing/pricing-window-drawer";

type PricingDrawerMode = "list" | "create" | "edit";

const PLACEHOLDER_LANGUAGES = [
  {
    key: "placeholder-en",
    label: "English (Pilot)",
    plansCount: 3,
    staffCount: 8,
    live: false,
  },
  {
    key: "placeholder-hi",
    label: "Hindi (Discovery)",
    plansCount: 2,
    staffCount: 5,
    live: false,
  },
  {
    key: "placeholder-ta",
    label: "Tamil (Intake)",
    plansCount: 1,
    staffCount: 3,
    live: false,
  },
];

export default function SpecialityLanguageHub() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const {
    specialties: { data, loading },
    addLanguageToSpecialty,
    removeLanguageFromSpecialty,
    addStaffMember,
  } = useSuperAdmin();

  const [languageDraft, setLanguageDraft] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [removalBusy, setRemovalBusy] = React.useState<string | null>(null);
  const initialLanguage = searchParams?.get("language") ?? "ALL";
  const [activeTab, setActiveTab] = React.useState("plans");
  const [languageFilter, setLanguageFilter] = React.useState(initialLanguage);
  const [languageSearch, setLanguageSearch] = React.useState("");
  const [staffForm, setStaffForm] = React.useState({
    name: "",
    role: "",
    availability: "AVAILABLE",
    patients: "0",
    nps: "70",
  });
  const [addingStaff, setAddingStaff] = React.useState(false);
  const [addLanguageDialogOpen, setAddLanguageDialogOpen] = React.useState(false);
  const [languageToRemove, setLanguageToRemove] = React.useState<string | null>(null);
  const [pricingDrawerOpen, setPricingDrawerOpen] = React.useState(false);
  const [pricingDrawerMode, setPricingDrawerMode] = React.useState<PricingDrawerMode>("list");
  const [pricingProgram, setPricingProgram] = React.useState<WorkflowProgram | null>(null);
  const [pricingEntryToEdit, setPricingEntryToEdit] = React.useState<WorkflowProgramPricing | null>(null);
  const [pricingEntryPendingDeactivate, setPricingEntryPendingDeactivate] = React.useState<WorkflowProgramPricing | null>(null);
  const [pricingForm, setPricingForm] = React.useState({
    currency: "INR",
    basePrice: "",
    enrollmentFee: "",
    enrollmentFeeAdjustable: true,
    maxDiscountPercent: "",
    maxDiscountAmount: "",
    effectiveFrom: "",
    effectiveTo: "",
  });

  const preservedQuery = searchParams?.toString();

  const specialtyId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params?.id[0]
        : undefined;
  const initialSpecialty = React.useMemo(
    () => data.find((item) => item.id === specialtyId),
    [data, specialtyId],
  );
  const {
    data: detailSpecialty,
    isLoading: detailLoading,
    error: detailError,
  } = useSpecialityDetail(specialtyId, {
    enabled: Boolean(specialtyId),
    initialData: initialSpecialty,
  });
  const specialty = detailSpecialty ?? initialSpecialty;

  const specialtyLanguages = specialty?.languages ?? [];
  const languagesKey = specialtyLanguages.join("|");

  const planLanguages = React.useMemo(() => {
    if (!specialtyLanguages.length) {
      return ["ALL"];
    }
    const available = Array.from(new Set(specialtyLanguages));
    return ["ALL", ...available];
  }, [languagesKey]);

  const {
    data: workflowProgramsData,
    isLoading: workflowProgramsLoading,
    isError: workflowProgramsError,
    error: workflowProgramsErrorData,
    refetch: refetchWorkflowPrograms,
  } = useWorkflowPrograms(
    {
      specialityId: specialty?.id,
      language: languageFilter !== "ALL" ? languageFilter : undefined,
      page: 1,
      limit: 10,
    },
    { enabled: Boolean(specialty?.id) },
  );

  const workflowPrograms: any = workflowProgramsData?.data ?? [];
  // @ts-ignore
  const totalWorkflowPrograms: any = workflowProgramsData?.meta?.total ?? 0;

  const languages = React.useMemo(
    () => [...specialtyLanguages].sort(),
    [languagesKey],
  );
  const addableLanguages = React.useMemo(
    () => LANGUAGE_OPTION_VALUES.filter((option) => !languages.includes(option)),
    [languagesKey],
  );

  const {
    data: drawerPricingEntries = [],
    isLoading: drawerPricingLoading,
  } = useWorkflowProgramPricing(pricingProgram?.id, {
    enabled: pricingDrawerOpen && Boolean(pricingProgram?.id),
  });
  const createPricing = useCreateWorkflowProgramPricing();
  const deactivatePricing = useDeactivateWorkflowProgramPricing();
  const activatePricing = useActivateWorkflowProgramPricing();
  const updatePricing = useUpdateWorkflowProgramPricing();

  const resetPricingForm = React.useCallback(() => {
    setPricingForm({
      currency: "INR",
      basePrice: "",
      enrollmentFee: "",
      enrollmentFeeAdjustable: true,
      maxDiscountPercent: "",
      maxDiscountAmount: "",
      effectiveFrom: "",
      effectiveTo: "",
    });
  }, []);

  React.useEffect(() => {
    if (pricingDrawerMode === "edit" && pricingEntryToEdit) {
      setPricingForm({
        currency: pricingEntryToEdit.currency,
        basePrice: pricingEntryToEdit.base_price.toString(),
        enrollmentFee: pricingEntryToEdit.enrollment_fee?.toString() ?? "",
        enrollmentFeeAdjustable: pricingEntryToEdit.enrollment_fee_adjustable ?? true,
        maxDiscountPercent: pricingEntryToEdit.max_discount_percent?.toString() ?? "",
        maxDiscountAmount: pricingEntryToEdit.max_discount_amount?.toString() ?? "",
        effectiveFrom: pricingEntryToEdit.effective_from,
        effectiveTo: pricingEntryToEdit.effective_to ?? "",
      });
    } else {
      resetPricingForm();
    }
  }, [pricingProgram?.id, pricingDrawerMode, pricingEntryToEdit, resetPricingForm]);

  const handleOpenPricingDrawer = (
    program: WorkflowProgram,
    mode: PricingDrawerMode = "list",
  ) => {
    setPricingProgram(program);
    setPricingEntryToEdit(null);
    setPricingEntryPendingDeactivate(null);
    setPricingDrawerMode(mode);
    setPricingDrawerOpen(true);
  };

  const handleStartCreatePricing = () => {
    setPricingEntryToEdit(null);
    setPricingDrawerMode("create");
  };

  const handleEditPricingEntry = (entry: WorkflowProgramPricing) => {
    setPricingEntryToEdit(entry);
    setPricingDrawerMode("edit");
  };

  const handlePricingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pricingProgram) return;
    if (!pricingForm.basePrice || !pricingForm.effectiveFrom) {
      toast.error("Base price and effective from date are required");
      return;
    }
    const payload = {
      program_id: pricingProgram.id,
      currency: pricingForm.currency,
      base_price: Number(pricingForm.basePrice),
      enrollment_fee: pricingForm.enrollmentFee ? Number(pricingForm.enrollmentFee) : undefined,
      enrollment_fee_adjustable: pricingForm.enrollmentFeeAdjustable,
      max_discount_percent: pricingForm.maxDiscountPercent ? Number(pricingForm.maxDiscountPercent) : undefined,
      max_discount_amount: pricingForm.maxDiscountAmount ? Number(pricingForm.maxDiscountAmount) : undefined,
      effective_from: pricingForm.effectiveFrom,
      effective_to: pricingForm.effectiveTo || undefined,
    };
    try {
      if (pricingDrawerMode === "edit" && pricingEntryToEdit) {
        await updatePricing.mutateAsync({ pricingId: pricingEntryToEdit.id, payload });
        toast.success("Pricing updated");
      } else {
        await createPricing.mutateAsync(payload);
        toast.success("Pricing added");
      }
      resetPricingForm();
      setPricingEntryToEdit(null);
      setPricingDrawerMode("list");
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to add pricing");
    }
  };

  const handlePricingActivation = async (
    entryId: string,
    action: "activate" | "deactivate",
  ) => {
    if (!pricingProgram) return false;
    try {
      if (action === "deactivate") {
        await deactivatePricing.mutateAsync({
          programId: pricingProgram.id,
          pricingId: entryId,
        });
        toast.success("Pricing window deactivated");
      } else {
        await activatePricing.mutateAsync({
          programId: pricingProgram.id,
          pricingId: entryId,
        });
        toast.success("Pricing window activated");
      }
      return true;
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to update pricing state");
      return false;
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!pricingEntryPendingDeactivate) return;
    const success = await handlePricingActivation(pricingEntryPendingDeactivate.id, "deactivate");
    if (success) {
      setPricingEntryPendingDeactivate(null);
    }
  };

  if ((loading || detailLoading) && !specialty) {
    return (
      <div className="grid h-[60vh] place-items-center text-muted-foreground">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading speciality
          blueprint…
        </div>
      </div>
    );
  }

  function MissingSpecialityState({
    backHref,
    title,
    description,
  }: {
    backHref: string;
    title: string;
    description: string;
  }) {
    return (
      <div className="space-y-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to catalogue
        </Link>
        <Card className="border border-dashed border-border/60 rounded-[2rem]">
          <CardHeader className="flex flex-col items-center text-center p-10">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-center text-sm text-muted-foreground pb-10">
            <p>
              Try refreshing the catalogue or confirm that the speciality ID
              exists.
            </p>
            <Button asChild className="w-full sm:w-auto rounded-xl">
              <Link href={backHref}>Return to list</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!specialty) {
    if (detailError) {
      console.error(detailError);
    }
    return (
      <MissingSpecialityState
        backHref="/dashboard/super-admin/specialities"
        title="Speciality unavailable"
        description="We couldn't locate this speciality via API. It may have been archived or the ID is incorrect."
      />
    );
  }

  const languageCards = React.useMemo(() => {
    if (specialty.languageCoverage?.length) {
      return specialty.languageCoverage.map((entry) => ({
        key: entry.code,
        label: entry.name,
        plansCount: entry.programsCount,
        staffCount: entry.tracksCount,
        live: true,
        nativeName: entry.nativeName,
      }));
    }

    if (languages.length) {
      return languages.map((language: string) => ({
        key: language,
        label: LANGUAGE_LABEL_LOOKUP[language] ?? language,
        plansCount: specialty.plans.filter((plan) => plan.language === language)
          .length,
        staffCount: specialty.staff.filter(
          (member) => member.availability !== "OOO",
        ).length,
        live: true,
        nativeName: null,
      }));
    }

    return [];
  }, [languagesKey, specialty.languageCoverage, specialty.plans, specialty.staff]);

  const filteredLanguageCards = React.useMemo(() => {
    if (!languageSearch.trim()) {
      return languageCards;
    }
    const query = languageSearch.trim().toLowerCase();
    return languageCards.filter((language) => {
      const label = language.label?.toLowerCase() ?? "";
      const native = language.nativeName?.toLowerCase() ?? "";
      const key = language.key?.toLowerCase() ?? "";
      return label.includes(query) || native.includes(query) || key.includes(query);
    });
  }, [languageCards, languageSearch]);

  const totalLanguages = filteredLanguageCards.length;

  const hasLiveLanguages = languages.length > 0;
  const brandInitials = specialty.name
    ? specialty.name.slice(0, 2).toUpperCase()
    : "--";
  const heroStats = [
    {
      label: "Active languages",
      value: hasLiveLanguages
        ? languages.length.toString().padStart(2, "0")
        : "00",
      hint: hasLiveLanguages
        ? languages.slice(0, 3).join(" • ")
        : "Provision first lane",
    },
    {
      label: "Programs",
      value: specialty.programs_count?.toString().padStart(2, "0"),
      hint: "Blueprint units",
    },
  ];

  const handleAddLanguage = async () => {
    if (!languageDraft) return;
    if (languages.includes(languageDraft)) {
      toast.info(`${languageDraft} already exists`);
      return;
    }
    try {
      setBusy(true);
      await addLanguageToSpecialty(specialty.id, languageDraft);
      const label = LANGUAGE_LABEL_LOOKUP[languageDraft] ?? languageDraft;
      toast.success(`Added ${label}`);
      setLanguageDraft(null);
      setAddLanguageDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to add language");
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveLanguage = async (languageCode: string) => {
    if (!languageCode) return;
    try {
      setRemovalBusy(languageCode);
      await removeLanguageFromSpecialty(specialty.id, languageCode);
      const label = LANGUAGE_LABEL_LOOKUP[languageCode] ?? languageCode;
      toast.success(`Removed ${label}`);
      setLanguageToRemove(null);
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to remove language");
    } finally {
      setRemovalBusy(null);
    }
  };
  const handleStaffSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!staffForm.name.trim() || !staffForm.role.trim()) {
      toast.error("Name and role are required");
      return;
    }
    try {
      setAddingStaff(true);
      await addStaffMember(specialty.id, {
        name: staffForm.name,
        role: staffForm.role,
        availability:
          staffForm.availability as SpecialtyStaffMember["availability"],
        patients: Number(staffForm.patients) || 0,
        nps: Number(staffForm.nps) || 0,
      });
      toast.success("Staff member added");
      setStaffForm({
        name: "",
        role: "",
        availability: "AVAILABLE",
        patients: "0",
        nps: "70",
      });
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to add staff");
    } finally {
      setAddingStaff(false);
    }
  };

  const handleHeaderSave = React.useCallback(() => {
    toast.success("Language configuration saved");
  }, []);

  
  return (
    <div className="space-y-6 pb-20 px-4 md:px-0">
      <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 rounded-full border-slate-200 text-slate-600 hover:text-primary px-5 h-11 text-[10px] font-black uppercase tracking-[0.25em]"
              >
                <Link href={`/dashboard/super-admin/specialities${preservedQuery ? `?${preservedQuery}` : ""}`}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
              </Button>
      <section className="px-2 md:px-0">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-4 md:p-8 shadow-2xl border border-white/5">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-[25%] -right-[5%] h-[160%] w-[60%] rounded-full bg-primary/15 blur-[140px]" />
            <div className="absolute -bottom-[40%] -left-[20%] h-[160%] w-[70%] rounded-full bg-blue-500/10 blur-[140px]" />
          </div>
          <div className="relative z-10 flex flex-col gap-8">
            <div className="space-y-2">
              <div className="flex justify-between ">
                <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-xl shadow-primary/30 border border-white/10">
                  <Languages className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-200">Localisation Hub</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">Governance Surface</p>
                </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 overflow-hidden">
                    {specialty.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={specialty.iconUrl} alt={`${specialty.name} logo`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-black text-white/80">{brandInitials}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">HUB-{(specialty.code ?? specialty.id.slice(0, 8)).toUpperCase()}</p>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/70">{specialty.category ?? "Unclassified"}</p>
                  </div>
                </div>
              </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-[32px] font-black leading-tight text-white">
                  {specialty.name} <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent">Languages</span>
                </h1>
                <p className="mt-2 text-slate-300 text-sm md:text-base max-w-2xl font-medium">
                  {specialty.description ?? "Define your localisation coverage and orchestrate clinical programs across multilingual markets."}
                </p>
              </div>
              
              {hasLiveLanguages ? (
                <div className="flex flex-wrap gap-2">
                  {languages.slice(0, 4).map((language) => (
                    <Badge
                      key={language}
                      variant="outline"
                      className="rounded-full border-white/20 text-white/80 text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1"
                    >
                      {language}
                    </Badge>
                  ))}
                  {languages.length > 4 && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/20 text-white/70 text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1"
                    >
                      +{languages.length - 4}
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                  Awaiting first localisation lane
                </p>
              )}
            </div>
            
          </div>
        </div>
      </section>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-black/10 bg-indigo-500/[0.08] px-5 py-4 text-black/80">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-black/50">{stat.label}</p>
                <p className="text-3xl font-black text-black mt-2">{stat.value}</p>
                <p className="text-xs font-semibold text-black/60 mt-1">{stat.hint}</p>
              </div>
            ))}
          </div>

      <section className="px-2 md:px-0">
        <div className="rounded-[2rem] border border-slate-200 bg-indigo-500/[0.2]  p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                Language Coverage
              </p>
              <h2 className="text-xl font-black text-slate-900">Active localisation lanes · {totalLanguages}</h2>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={languageSearch}
                  onChange={(event) => setLanguageSearch(event.target.value)}
                  placeholder="Search languages..."
                  className="h-11 w-full rounded-2xl border-slate-100 bg-slate-50 pl-11 text-sm font-medium focus:bg-white focus:ring-primary/10"
                />
              </div>
              <Button
                className="h-11 cursor-pointer rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-primary/20"
                onClick={() => {
                  setLanguageDraft(addableLanguages[0] ?? null);
                  setAddLanguageDialogOpen(true);
                }}
                disabled={!addableLanguages.length}
              >
                <Plus className="mr-2 h-4 w-4" /> Add language
              </Button>
            </div>
          </div>
          <div className="flex w-full">
            {filteredLanguageCards.length ? (
               <div className="grid gap-6 w-full md:grid-cols-2 lg:grid-cols-3">
        {filteredLanguageCards.map((language) => (
          <Card
            key={language.key ?? language.label}
            className="group fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 rounded-[2.5rem] overflow-hidden"
          >
            <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">
                  {language.label}
                </CardTitle>
                {language.nativeName && (
                  <p className="text-xs text-slate-400 font-medium">{language.nativeName}</p>
                )}
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Market Segment
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {language.live && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 cursor-pointer rounded-2xl border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100"
                    disabled={removalBusy === language.key}
                    onClick={() => setLanguageToRemove(language.key)}
                    title={`Remove ${language.label}`}
                  >
                    {removalBusy === language.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                  <Globe className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors duration-500" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
            ) : languageCards.length ? (
              <p className="text-sm text-muted-foreground">
                No languages match “{languageSearch}”. Adjust your search or add a new localisation lane.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No languages live yet. Use the add language action to open your first localisation lane.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-1 px-2">
        <div className="rounded-3xl border border-slate-200/70 bg-indigo-500/[0.2] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                Brand Surface
              </p>
              <p className="text-lg font-black text-slate-900">
                {specialty.category ?? "Uncategorized"}
              </p>
            </div>
          </div>
          {specialty.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={specialty.coverImageUrl}
              alt={`${specialty.name} cover`}
              className="h-40 w-full rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="h-40 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400 grid place-items-center text-sm font-semibold">
              No cover uploaded
            </div>
          )}
          <p className="text-xs text-slate-500">
            Visual reference used across localisation lanes.
          </p>
        </div>
      </section>
     
      {!hasLiveLanguages && (
        <p className="text-sm text-muted-foreground">
          Showing sample lanes so you can preview the blueprint experience. Add
          a language above to swap in real data.
        </p>
      )}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 w-full md:w-auto">
          <TabsTrigger
            value="plans"
            className="rounded-xl h-11 px-8 data-[state=active]:bg-indigo-500/[0.3] data-[state=active]:shadow-sm text-[11px] font-black uppercase tracking-widest transition-all"
          >
            Program Catalogue
          </TabsTrigger>
          {/* <TabsTrigger
            value="staff"
            className="rounded-xl h-11 px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm text-[11px] font-black uppercase tracking-widest transition-all"
          >
            Staff & KPIs
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-indigo-500/[0.2] p-4 rounded-2xl border border-slate-100/50">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Total · {totalWorkflowPrograms || workflowPrograms.length}
              </div>
            </div>
            <Button
              asChild
              className="h-10 px-6 rounded-xl bg-primary text-white shadow-md shadow-primary/10 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
            >
              <Link
                href={`/dashboard/super-admin/specialities/${specialty.id}/workflow-programs/new${languageFilter && languageFilter !== "ALL" ? `?language=${languageFilter}` : ""}`}
              >
                <Plus className="mr-2 h-4 w-4" /> Add new plan
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Workflow programs
                </h3>
                <p className="text-sm text-muted-foreground">
                  {languageFilter === "ALL"
                    ? "Live programs fetched from the workflow service across all languages."
                    : `Programs filtered to the ${languageFilter} market.`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchWorkflowPrograms()}
                className="text-[10px] font-black uppercase cursor-pointer tracking-widest gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {workflowProgramsLoading ? (
              <Card className="border-dashed">
                <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                  workflow programs…
                </CardContent>
              </Card>
            ) : workflowProgramsError ? (
              <Card className="border border-rose-100 bg-rose-50/50">
                <CardContent className="flex h-32 flex-col items-center justify-center text-sm text-rose-600 text-center gap-2">
                  Unable to load workflow programs.
                  <span className="text-xs text-rose-400">
                    {workflowProgramsErrorData instanceof Error
                      ? workflowProgramsErrorData.message
                      : "Please try again."}
                  </span>
                </CardContent>
              </Card>
            ) : workflowPrograms.length ? (
              workflowPrograms.map((program: any) => (
                <ProgramRow
                  key={program.id}
                  program={program}
                  specialtyName={specialty.name}
                  specialtyId={specialty.id}
                  onCreatePricing={() => handleOpenPricingDrawer(program, "list")}
                />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground text-center">
                  No workflow programs found for this speciality and language.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaffStat
              label="Active"
              value={specialty.staff
                .filter((member) => member.availability === "AVAILABLE")
                .length.toString()}
            />
            <StaffStat
              label="Limited"
              value={specialty.staff
                .filter((member) => member.availability === "LIMITED")
                .length.toString()}
            />
            <StaffStat
              label="OOO"
              value={specialty.staff
                .filter((member) => member.availability === "OOO")
                .length.toString()}
            />
            <StaffStat
              label="Avg NPS"
              value={
                specialty.staff.length
                  ? Math.round(
                      specialty.staff.reduce(
                        (sum, member) => sum + member.kpi.nps,
                        0,
                      ) / specialty.staff.length,
                    ).toString()
                  : "-"
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {specialty.staff.map((member) => (
              <Card
                key={member.id}
                className="group fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg font-black text-slate-900 tracking-tight">
                      {member.name}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {member.role}
                    </CardDescription>
                  </div>
                  <Badge
                    className={cn(
                      "rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border-none shadow-sm transition-all",
                      member.availability === "AVAILABLE"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : member.availability === "LIMITED"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {member.availability}
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-8 pt-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                      Capacity
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {member.kpi.patients}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Patients
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-slate-100 mx-6" />
                  <div className="flex-1 text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                      Satisfaction
                    </p>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl font-black text-primary tracking-tight">
                        {member.kpi.nps}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        NPS
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add staff member</CardTitle>
              <CardDescription>
                Updates KPIs instantly for this speciality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={handleStaffSubmit}
              >
                <div className="space-y-2">
                  <Label htmlFor="staff-name">Name</Label>
                  <Input
                    id="staff-name"
                    value={staffForm.name}
                    onChange={(event) =>
                      setStaffForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Dr. Mehta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-role">Role</Label>
                  <Input
                    id="staff-role"
                    value={staffForm.role}
                    onChange={(event) =>
                      setStaffForm((prev) => ({
                        ...prev,
                        role: event.target.value,
                      }))
                    }
                    placeholder="Endocrinologist"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select
                    value={staffForm.availability}
                    onValueChange={(value) =>
                      setStaffForm((prev) => ({ ...prev, availability: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="LIMITED">Limited</SelectItem>
                      <SelectItem value="OOO">Out of Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-patients">Patients</Label>
                  <Input
                    id="staff-patients"
                    type="number"
                    min="0"
                    value={staffForm.patients}
                    onChange={(event) =>
                      setStaffForm((prev) => ({
                        ...prev,
                        patients: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-nps">NPS</Label>
                  <Input
                    id="staff-nps"
                    type="number"
                    min="0"
                    max="100"
                    value={staffForm.nps}
                    onChange={(event) =>
                      setStaffForm((prev) => ({
                        ...prev,
                        nps: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={
                      addingStaff ||
                      !staffForm.name.trim() ||
                      !staffForm.role.trim()
                    }
                    className="w-full md:w-auto"
                  >
                    {addingStaff && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add staff
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={addLanguageDialogOpen}
        onOpenChange={(open) => {
          setAddLanguageDialogOpen(open);
          if (!open) {
            setLanguageDraft(null);
          }
        }}
      >
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Add localisation language</DialogTitle>
            <DialogDescription className="text-slate-500">
              Select a language to enable for this speciality. Only unused languages are listed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={languageDraft ?? undefined}
              onValueChange={(value) => setLanguageDraft(value)}
              disabled={!addableLanguages.length || busy}
            >
              <SelectTrigger className="h-14 cursor-pointer rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm focus:bg-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.filter((option) => addableLanguages.includes(option.value)).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-3 sm:flex-row flex-col mt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-14 cursor-pointer rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
              onClick={() => setAddLanguageDialogOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-14 cursor-pointer rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20 text-[11px] font-black uppercase tracking-widest"
              onClick={() => void handleAddLanguage()}
              disabled={!languageDraft || busy}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add language
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(languageToRemove)}
        onOpenChange={(open) => {
          if (!open) {
            setLanguageToRemove(null);
          }
        }}
      >
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-[1.5rem] bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black text-slate-900">
              Remove language?
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 px-4">
              This will remove <strong>{LANGUAGE_LABEL_LOOKUP[languageToRemove ?? ""] ?? languageToRemove}</strong> from the speciality catalogue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:flex-row flex-col mt-8">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-14 cursor-pointer rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
              onClick={() => setLanguageToRemove(null)}
              disabled={Boolean(removalBusy)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 h-14 cursor-pointer rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100 text-[11px] font-black uppercase tracking-widest"
              onClick={() => languageToRemove && void handleRemoveLanguage(languageToRemove)}
              disabled={!languageToRemove || Boolean(removalBusy)}
            >
              {removalBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirm Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pricingEntryPendingDeactivate)}
        onOpenChange={(open) => {
          if (!open) {
            setPricingEntryPendingDeactivate(null);
          }
        }}
      >
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-[1.5rem] bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black text-slate-900">
              Deactivate pricing window?
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 px-4">
              This will immediately stop new enrollments from using the pricing window starting at
              {" "}
              <strong>{pricingEntryPendingDeactivate?.effective_from ? new Date(pricingEntryPendingDeactivate?.effective_from).toLocaleDateString("en-IN") : "the selected date"}</strong>.
              Existing enrollments will keep their agreed pricing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-slate-600 mt-6 text-center">
            <p className="font-semibold text-slate-900 text-lg">
              {pricingEntryPendingDeactivate?.currency} {pricingEntryPendingDeactivate?.base_price.toLocaleString("en-IN")}
            </p>
            <p>
              Enrollment fee {pricingEntryPendingDeactivate?.enrollment_fee ?? "—"} · Discount
              {" "}
              {pricingEntryPendingDeactivate?.max_discount_percent ?? 0}%
            </p>
          </div>
          <DialogFooter className="gap-3 sm:flex-row flex-col mt-8">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-14 cursor-pointer rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
              onClick={() => setPricingEntryPendingDeactivate(null)}
              disabled={deactivatePricing.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 h-14 cursor-pointer rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100 text-[11px] font-black uppercase tracking-widest"
              onClick={() => void handleConfirmDeactivate()}
              disabled={deactivatePricing.isPending}
            >
              {deactivatePricing.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deactivate window
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer
        open={pricingDrawerOpen}
        onOpenChange={(open) => {
          setPricingDrawerOpen(open);
          if (!open) {
            setPricingDrawerMode("list");
            setPricingEntryToEdit(null);
          }
        }}
      >
        <PricingWindowDrawerLayout
          mode={pricingDrawerMode}
          programName={pricingProgram?.name}
          programLanguage={pricingProgram?.language_code}
          programCode={pricingProgram?.code}
        >
          {pricingDrawerMode === "list" ? (
            <div className="space-y-5 px-6 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Pricing windows ({drawerPricingEntries.length})
                  </p>
                </div>
                <Button
                  className="rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-primary/20"
                  onClick={handleStartCreatePricing}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add pricing
                </Button>
              </div>

              {drawerPricingLoading ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading entries…
                </div>
              ) : drawerPricingEntries.length ? (
                <div className="space-y-4">
                  {drawerPricingEntries.map((entry) => {
                    const isActive = entry.is_active ?? entry.status === "ACTIVE";
                    return (
                      <div
                        key={entry.id}
                        className="rounded-[1.75rem] border border-slate-100 bg-white/90 p-5 shadow-[0_15px_30px_-20px_rgba(0,0,0,0.4)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-black text-slate-900">
                              {entry.currency} {entry.base_price.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs text-slate-500">
                              Enrollment fee {entry.enrollment_fee ?? "—"} · Discount {entry.max_discount_percent ?? 0}%
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                              isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500",
                            )}
                          >
                            {isActive ? "Active" : entry.status ?? "Inactive"}
                          </Badge>
                        </div>
                        <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50/70 p-4 text-xs text-slate-500 sm:grid-cols-2 md:grid-cols-3">
                          <div>
                            <p className="font-semibold text-slate-800">Enrollment fee</p>
                            <p>
                              {entry.enrollment_fee
                                ? `${entry.enrollment_fee} ${entry.currency}`
                                : "Not set"}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Discount</p>
                            <p>
                              {entry.max_discount_percent ?? 0}% · ₹{entry.max_discount_amount ?? 0}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Fee adjustable</p>
                            <p>{entry.enrollment_fee_adjustable ? "Allowed" : "Locked"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Created</p>
                            <p>{entry.created_at ? new Date(entry.created_at).toLocaleDateString() : "—"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Updated</p>
                            <p>{entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : "—"}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full border border-slate-200 text-slate-600 hover:text-primary"
                            onClick={() => handleEditPricingEntry(entry)}
                            aria-label="Edit pricing"
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-10 w-10 rounded-full border",
                              isActive
                                ? "border-rose-200 text-rose-500 hover:text-rose-600"
                                : "border-emerald-200 text-emerald-500 hover:text-emerald-600",
                            )}
                            onClick={() => {
                              if (isActive) {
                                setPricingEntryPendingDeactivate(entry);
                              } else {
                                void handlePricingActivation(entry.id, "activate");
                              }
                            }}
                            aria-label={isActive ? "Deactivate pricing" : "Activate pricing"}
                            disabled={deactivatePricing.isPending || activatePricing.isPending}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">
                  No pricing windows yet. Create the first one.
                </div>
              )}
            </div>
          ) : (
            <PricingWindowForm
              mode={pricingDrawerMode === "edit" ? "edit" : "create"}
              form={pricingForm}
              setForm={setPricingForm}
              onSubmit={handlePricingSubmit}
              onCancel={() => {
                setPricingDrawerMode("list");
                setPricingEntryToEdit(null);
              }}
              isPending={createPricing.isPending || updatePricing.isPending}
              submitLabel={pricingDrawerMode === "edit" ? "Update pricing" : "Save pricing"}
            />
          )}
        </PricingWindowDrawerLayout>
      </Drawer>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
  valueOverride,
  badge,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  valueOverride?: string;
  badge?: boolean;
}) {
  return (
    <Card className="group fresh-card-alt border-none shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2">
      <CardContent className="flex items-center gap-5 p-8">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
            bg,
          )}
        >
          <div className={cn(color)}>{icon}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            {label}
          </p>
          {badge ? (
            <Badge
              className={cn(
                "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                value === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-blue-500/10 text-blue-600",
              )}
            >
              {value}
            </Badge>
          ) : (
            <p className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {valueOverride ?? value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
function ProgramRow({
  program,
  specialtyName,
  specialtyId,
  onCreatePricing,
}: {
  program: WorkflowProgram;
  specialtyName: string;
  specialtyId: string;
  onCreatePricing: () => void;
}) {
  return (
    <div className="group flex flex-wrap items-start justify-between gap-6 rounded-[2rem] border border-slate-100 bg-indigo-500/[0.2] p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1">
      <div className="space-y-3 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xl font-black text-slate-900 tracking-tight">
            {program.name}
          </p>
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none"
          >
            {program.language_code}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-0.5 rounded-full bg-slate-200" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Workflow · {specialtyName}
          </p>
        </div>
        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
          {program.description ?? "No description available."}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge
            variant="outline"
            className="rounded-full px-4 py-1.5 text-[10px] font-bold border-slate-100 bg-slate-50/50 text-slate-600"
          >
            Duration · {program.duration_value} {program.duration_type}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-4 py-1.5 text-[10px] font-bold border-slate-100 bg-slate-50/50 text-slate-600"
          >
            Batch · {program.min_batch_size} - {program.max_batch_size}
          </Badge>
          {program.auto_generate_batch && (
            <Badge className="rounded-full px-4 py-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border-none">
              Auto batch
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch gap-4 text-right">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
            Status
          </p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">
            {program.status}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {/* <Button
            variant="ghost"
            className="h-11 px-4 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white"
            onClick={onCreatePricing}
          >
            Add pricing
          </Button> */}
          <Button
            variant="outline"
            asChild
            className="h-11 px-6 rounded-xl border-slate-100 hover:border-primary/20 hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Link
              href={`/dashboard/super-admin/specialities/${specialtyId}/workflow-programs/${program.id}${program.language_code ? `?language=${program.language_code}` : ""}`}
            >
              View Program
            </Link>
          </Button>
          {/* <Button
            asChild
            className="h-11 px-6 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-primary/20 hover:scale-105 transition-all"
          >
            <Link
              href={`/dashboard/super-admin/protocol-schedule/${program.id}?specialityId=${specialtyId}&planName=${encodeURIComponent(program.name)}&programId=${program.id}`}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Protocol
            </Link>
          </Button> */}
        </div>
      </div>
    </div>
  );
}

function StaffStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="fresh-card-alt border-none shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-1">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
          {label}
        </p>
        <p className="text-xl font-black text-slate-900 tracking-tight">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function StatCardNew({
  label,
  value,
  icon,
  color,
  bg,
  valueOverride,
  badge,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  valueOverride?: string;
  badge?: boolean;
}) {
  return (
    <Card className="group fresh-card-alt border-none shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2">
      <CardContent className="flex items-center gap-5 p-8">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
            bg,
          )}
        >
          <div className={cn(color)}>{icon}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            {label}
          </p>
          {badge ? (
            <Badge
              className={cn(
                "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                value === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-blue-500/10 text-blue-600",
              )}
            >
              {value}
            </Badge>
          ) : (
            <p className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {valueOverride ?? value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
