"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, Target, Clock3, Users2 } from "lucide-react";
import { toast } from "sonner";

import { useSuperAdmin } from "@/components/super-admin/super-admin-context";
import {
  LANGUAGE_LABEL_LOOKUP,
  LANGUAGE_OPTION_VALUES,
} from "@/components/super-admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { WORKFLOW_DURATION_TYPES, WORKFLOW_PROGRAM_STATUSES } from "@/constants/workflow-program";
import { useCreateWorkflowProgram } from "@/hooks/use-create-workflow-program";
import { useSpecialityDetail } from "@/hooks/use-speciality-detail";

type PlanFormState = {
  name: string;
  code: string;
  description: string;
  durationType: (typeof WORKFLOW_DURATION_TYPES)[number];
  durationValue: string;
  triggerDay: string;
  maxBatchSize: string;
  autoEnrollPatients: boolean;
};

const NAME_REGEX = /^[A-Za-z ]+$/;
const CODE_REGEX = /^[A-Za-z0-9-]+$/;
const MIN_BATCH_SIZE = 1;

export default function WorkflowProgramInitializerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    specialties: { data, loading },
  } = useSuperAdmin();

  const specialityId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;

  const initialSpecialty = React.useMemo(
    () => data.find((item) => item.id === specialityId),
    [data, specialityId],
  );

  const {
    data: detailSpecialty,
    isLoading: detailLoading,
    error: detailError,
  } = useSpecialityDetail(specialityId, {
    enabled: Boolean(specialityId),
    initialData: initialSpecialty,
  });

  const specialty = detailSpecialty ?? initialSpecialty;
  const specialtyLanguages = specialty?.languages ?? [];
  const languagesKey = specialtyLanguages.join("|");
  const languages = React.useMemo(
    () => [...specialtyLanguages].sort(),
    [languagesKey],
  );

  const availableLanguageOptions =
    languages.length > 0 ? languages : LANGUAGE_OPTION_VALUES;
  const languageQuery = searchParams?.get("language") ?? undefined;
  const resolvedInitialLanguage = React.useMemo(() => {
    if (languageQuery && availableLanguageOptions.includes(languageQuery)) {
      return languageQuery;
    }
    if (availableLanguageOptions.length) {
      return availableLanguageOptions[0];
    }
    return LANGUAGE_OPTION_VALUES[0] ?? "en";
  }, [availableLanguageOptions, languageQuery]);

  const fallbackDurationType =
    (WORKFLOW_DURATION_TYPES[1] ?? WORKFLOW_DURATION_TYPES[0] ?? "DAYS") as (typeof WORKFLOW_DURATION_TYPES)[number];
  const defaultStatus = WORKFLOW_PROGRAM_STATUSES[0] ?? "DRAFT";
  const languageLabel =
    LANGUAGE_LABEL_LOOKUP[resolvedInitialLanguage] ?? resolvedInitialLanguage.toUpperCase();

  const initialPlanForm = React.useMemo<PlanFormState>(
    () => ({
      name: "",
      code: "",
      description: "",
      durationType: fallbackDurationType,
      durationValue: "3",
      maxBatchSize: "50",
      triggerDay: "1",
      autoEnrollPatients: true,
    }),
    [fallbackDurationType],
  );

  const [planForm, setPlanForm] = React.useState<PlanFormState>(initialPlanForm);
  React.useEffect(() => {
    setPlanForm(initialPlanForm);
  }, [initialPlanForm]);

  const createWorkflowProgram = useCreateWorkflowProgram();
  const creatingPlan = createWorkflowProgram.isPending;

  if ((loading || detailLoading) && !specialty) {
    return (
      <div className="grid h-[70vh] place-items-center text-muted-foreground">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading speciality blueprint…
        </div>
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

  const specialityLanguagesHref = `/dashboard/super-admin/specialities/${specialty.id}/languages`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = planForm.name.trim();
    const trimmedCode = planForm.code.trim().toUpperCase();

    if (!trimmedName || !NAME_REGEX.test(trimmedName)) {
      toast.error("Name can contain only letters and spaces");
      return;
    }

    if (!trimmedCode || !CODE_REGEX.test(trimmedCode)) {
      toast.error("Code can contain letters, numbers, and hyphens only");
      return;
    }

    const durationValueNumber = Number(planForm.durationValue);
    if (!durationValueNumber || durationValueNumber <= 0) {
      toast.error("Enter a valid duration value");
      return;
    }

    const triggerDayNumber = Number(planForm.triggerDay);
    if (!triggerDayNumber || triggerDayNumber < 1) {
      toast.error("Trigger day must be at least 1");
      return;
    }

    const maxBatchNumber = Math.max(Number(planForm.maxBatchSize) || MIN_BATCH_SIZE, MIN_BATCH_SIZE);

    try {
      await createWorkflowProgram.mutateAsync({
        speciality_id: specialty.id,
        name: trimmedName,
        code: trimmedCode,
        description: planForm.description.trim() || undefined,
        duration_type_v2: planForm.durationType,
        duration_value: durationValueNumber,
        duration_extra_days: undefined,
        language_code: resolvedInitialLanguage,
        min_batch_size: MIN_BATCH_SIZE,
        max_batch_size: maxBatchNumber,
        auto_generate_batch: false,
        auto_generate_trigger_day: triggerDayNumber,
        auto_enroll_patients: planForm.autoEnrollPatients,
        status: defaultStatus,
      });

      toast.success("Workflow program created");
      setPlanForm(initialPlanForm);
      const target = `${specialityLanguagesHref}?language=${resolvedInitialLanguage}`;
      router.push(target);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to create workflow program");
    }
  };

  const handleNameChange = (value: string) => {
    if (value === "" || NAME_REGEX.test(value)) {
      setPlanForm((prev) => ({ ...prev, name: value }));
    }
  };

  const handleCodeChange = (value: string) => {
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setPlanForm((prev) => ({ ...prev, code: sanitized }));
  };

  const resolvedLanguages = languages.length ? languages : [resolvedInitialLanguage];
  const previewDurationLabel = `${planForm.durationValue || "--"} ${planForm.durationType?.toLowerCase()}`;
  const previewTriggerLabel = planForm.triggerDay ? `Day ${planForm.triggerDay}` : "Day 1";
  const previewAutoEnroll = planForm.autoEnrollPatients ? "Auto" : "Manual";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <Link href={specialityLanguagesHref}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to speciality hub
            </Link>
          </Button>
          <Badge className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white">
            {specialty.status}
          </Badge>
        </div>

        <section className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-8 text-white shadow-[0_60px_120px_-80px_rgba(255,255,255,0.8)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" /> Launch Blueprint
              </div>
              <div>
                <h1 className="text-3xl md:text-[44px] font-black leading-tight text-white">
                  Launch a new workflow lane for {specialty.name}
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-white/80">
                  Only the essentials: define a human-readable name, a rigid code, the pitch, and the core cadence. Everything ships instantly to the speciality’s language hub.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
                {resolvedLanguages.slice(0, 4).map((code) => (
                  <span key={code} className="rounded-full border border-white/20 px-3 py-1">
                    {LANGUAGE_LABEL_LOOKUP[code] ?? code}
                  </span>
                ))}
                {resolvedLanguages.length > 4 && (
                  <span className="rounded-full border border-white/20 px-3 py-1">+{resolvedLanguages.length - 4}</span>
                )}
              </div>
            </div>
            <div className="grid gap-3 rounded-3xl border border-white/15 bg-white/10 p-6 text-sm font-semibold text-white/90">
              <div className="flex items-center justify-between gap-8">
                <span>Status</span>
                <span>{defaultStatus}</span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span>Language</span>
                <span>{languageLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span>Programs live</span>
                <span>{specialty.programs_count}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            <Card className="rounded-3xl border border-white/10 bg-white/90 p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.9)]">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-900">
                  <Target className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-600">Live preview</p>
                  <div className="space-y-1 text-slate-500">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Duration</p>
                    <p className="text-lg font-black text-slate-900">{previewDurationLabel}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Trigger</p>
                      <p className="text-base font-black text-slate-900">{previewTriggerLabel}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Enrollment</p>
                      <p className="text-base font-black text-slate-900">{previewAutoEnroll}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border border-white/10 bg-white/90 p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.9)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Deploy checklist</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Keep the name conversational and code ANSI-safe.
                </li>
                <li className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-amber-500" />
                  Trigger day must be within program range.
                </li>
                <li className="flex items-center gap-3">
                  <Users2 className="h-4 w-4 text-emerald-600" />
                  Auto enroll only if ops can fulfill instantly.
                </li>
              </ul>
            </Card>
          </div>

          <Card className="rounded-3xl border border-white/10 bg-white shadow-[0_25px_60px_-45px_rgba(15,23,42,0.9)]">
            <CardContent className="p-6">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <FormSection title="General details" description="Name, code, and the program promise.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={planForm.name}
                        maxLength={60}
                        onChange={(event) => handleNameChange(event.target.value)}
                        placeholder="Metabolic Reset"
                      />
                      <p className="text-xs text-slate-400">Letters and spaces only.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Program code</Label>
                      <Input
                        value={planForm.code}
                        maxLength={12}
                        onChange={(event) => handleCodeChange(event.target.value)}
                        placeholder="DR-MR-01"
                      />
                      <p className="text-xs text-slate-400">Letters, numbers, and hyphen.</p>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        value={planForm.description}
                        onChange={(event) =>
                          setPlanForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        placeholder="Describe the promise, focus, or key differentiation for this workflow program."
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Schedule" description="Duration blueprint and trigger point.">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Duration unit</Label>
                      <Select
                        value={planForm.durationType}
                        onValueChange={(value: PlanFormState["durationType"]) =>
                          setPlanForm((prev) => ({ ...prev, durationType: value }))
                        }
                      >
                        <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKFLOW_DURATION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <NumberField
                      label="Duration value"
                      value={planForm.durationValue}
                      onChange={(value) =>
                        setPlanForm((prev) => ({ ...prev, durationValue: value }))
                      }
                    />
                    <div className="space-y-2">
                      <Label>Trigger day</Label>
                      <Input
                        type="number"
                        min={1}
                        value={planForm.triggerDay}
                        onChange={(event) =>
                          setPlanForm((prev) => ({ ...prev, triggerDay: event.target.value }))
                        }
                        placeholder="1"
                        className="h-11 rounded-2xl"
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Capacity" description="Keep cohorts lean. Minimum is fixed to 1 participant.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <NumberField
                      label="Max batch size"
                      value={planForm.maxBatchSize}
                      onChange={(value) =>
                        setPlanForm((prev) => ({ ...prev, maxBatchSize: value }))
                      }
                    />
                    <div className="space-y-2">
                      <Label>Auto-enroll patients</Label>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Enable by default</p>
                          <p className="text-xs text-slate-500">New inquiries join automatically</p>
                        </div>
                        <Switch
                          checked={planForm.autoEnrollPatients}
                          onCheckedChange={(checked) =>
                            setPlanForm((prev) => ({ ...prev, autoEnrollPatients: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </FormSection>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 rounded-2xl px-6"
                    disabled={creatingPlan}
                    onClick={() => setPlanForm(initialPlanForm)}
                  >
                    Reset fields
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 rounded-2xl px-8 text-[11px] font-black uppercase tracking-[0.25em]"
                    disabled={creatingPlan}
                  >
                    {creatingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create program
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-white/70 p-5 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.45)]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-2xl"
      />
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
    <div className="space-y-6 px-4">
      <Button
        variant="outline"
        size="sm"
        asChild
        className="w-fit gap-2 rounded-full border-slate-200 text-slate-600 hover:text-primary"
      >
        <Link href={backHref}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to catalogue
        </Link>
      </Button>
      <Card className="rounded-[2rem] border border-dashed border-slate-200 bg-white/80">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">{title}</CardTitle>
          <CardDescription className="text-base text-slate-500">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          <p>Try refreshing the catalogue or confirm that the speciality ID exists.</p>
          <Button asChild className="rounded-full px-6 py-2">
            <Link href={backHref}>Return to list</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
