"use client"

import * as React from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation"
import { Activity, ArrowLeft, BadgeDollarSign, Loader2, Package, Plus, Users, Globe, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { useSuperAdmin } from "@/components/super-admin/super-admin-context"
import type { DeliveryModes, SpecialtyStaffMember } from "@/components/super-admin/types"
import { LANGUAGE_OPTIONS } from "@/components/super-admin/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  WORKFLOW_DURATION_TYPES,
  WORKFLOW_PROGRAM_STATUSES,
  type WorkflowDurationType,
  type WorkflowProgramStatus,
} from "@/constants/workflow-program"
import { useCreateWorkflowProgram } from "@/hooks/use-create-workflow-program"
import { useWorkflowPrograms, useWorkflowProgram } from "@/hooks/use-workflow-programs"
import type { WorkflowProgram, WorkflowProgramPricing } from "@/hooks/use-workflow-programs"

const DELIVERY_META: { key: keyof DeliveryModes; label: string; description: string }[] = [
  { key: "virtual", label: "Virtual consults", description: "Telehealth-ready clinicians" },
  { key: "inPerson", label: "In-person", description: "Clinic or hospital availability" },
  { key: "homeVisit", label: "Home visit", description: "At-home care pathways" },
]

const currencyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

export default function SpecialityDetailsBlueprint() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ id: string }>()
  const {
    specialties: { data, loading },
    addStaffMember,
  } = useSuperAdmin()

  const specialtyId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined
  const specialty = data.find((item) => item.id === specialtyId)

  const languages = React.useMemo(() => (specialty ? [...specialty.languages].sort() : []), [specialty])
  const availableLanguageOptions = React.useMemo(() => (languages.length ? languages : LANGUAGE_OPTIONS.map(o => o.value)), [languages])
  const deliveryFlags = React.useMemo(() => (specialty ? DELIVERY_META.map((meta) => ({ ...meta, enabled: specialty.deliveryModes[meta.key] })) : []), [specialty])

  const initialLanguage = searchParams?.get("language") ?? "ALL"
  const [activeTab, setActiveTab] = React.useState("plans")
  const [languageFilter, setLanguageFilter] = React.useState(initialLanguage)
  const [staffForm, setStaffForm] = React.useState({ name: "", role: "", availability: "AVAILABLE", patients: "0", nps: "70" })
  const [addingStaff, setAddingStaff] = React.useState(false)
  const [planDialogOpen, setPlanDialogOpen] = React.useState(false)
  const [programDetailOpen, setProgramDetailOpen] = React.useState(false)
  const [selectedProgramId, setSelectedProgramId] = React.useState<string | null>(null)

  type ProgramFormState = {
    name: string
    code: string
    description: string
    language: string
    status: WorkflowProgramStatus
    durationType: WorkflowDurationType
    durationValue: string
    durationExtraDays: string
    minBatchSize: string
    maxBatchSize: string
    autoGenerateBatch: boolean
    autoGenerateTriggerDay: string
    autoEnrollPatients: boolean
  }

  const initialProgramForm = React.useMemo<ProgramFormState>(
    () => ({
      name: "",
      code: "",
      description: "",
      language: availableLanguageOptions[0] ?? LANGUAGE_OPTIONS[0].value,
      status: WORKFLOW_PROGRAM_STATUSES[0],
      durationType: WORKFLOW_DURATION_TYPES[1] ?? WORKFLOW_DURATION_TYPES[0],
      durationValue: "12",
      durationExtraDays: "",
      minBatchSize: "10",
      maxBatchSize: "25",
      autoGenerateBatch: true,
      autoGenerateTriggerDay: "",
      autoEnrollPatients: false,
    }),
    [availableLanguageOptions],
  )
  const [programForm, setProgramForm] = React.useState<ProgramFormState>(initialProgramForm)
  const createWorkflowProgram = useCreateWorkflowProgram()
  const programSubmitting = createWorkflowProgram.isPending

  const planLanguages = React.useMemo(() => {
    if (!specialty) return ["ALL"]
    const available = new Set(specialty.languages)
    return ["ALL", ...Array.from(available)]
  }, [specialty])

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
  )

  const workflowPrograms = workflowProgramsData?.data?.items ?? []
  const totalWorkflowPrograms = workflowProgramsData?.data?.total ?? 0

  const queryProgramId = programDetailOpen ? selectedProgramId ?? undefined : undefined

  const { data: activeProgramDetail, isLoading: programDetailLoading } = useWorkflowProgram(queryProgramId)

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center text-muted-foreground">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading speciality catalogue…
        </div>
      </div>
    )
  }

  if (!specialty) return notFound()

  const handleStaffSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!staffForm.name.trim() || !staffForm.role.trim()) {
      toast.error("Name and role are required")
      return
    }
    try {
      setAddingStaff(true)
      await addStaffMember(specialty.id, {
        name: staffForm.name,
        role: staffForm.role,
        availability: staffForm.availability as SpecialtyStaffMember["availability"],
        patients: Number(staffForm.patients) || 0,
        nps: Number(staffForm.nps) || 0,
      })
      toast.success("Staff member added")
      setStaffForm({ name: "", role: "", availability: "AVAILABLE", patients: "0", nps: "70" })
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to add staff")
    } finally {
      setAddingStaff(false)
    }
  }

  const handleProgramSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!programForm.name.trim() || !programForm.code.trim()) {
      toast.error("Name and code are required")
      return
    }
    try {
      await createWorkflowProgram.mutateAsync({
        speciality_id: specialty.id,
        name: programForm.name.trim(),
        code: programForm.code.trim().toUpperCase(),
        description: programForm.description.trim() || undefined,
        duration_type_v2: programForm.durationType,
        duration_value: Number(programForm.durationValue) || 0,
        duration_extra_days: programForm.durationExtraDays ? Number(programForm.durationExtraDays) : undefined,
        language_code: programForm.language,
        min_batch_size: Number(programForm.minBatchSize) || 0,
        max_batch_size: Number(programForm.maxBatchSize) || 0,
        auto_generate_batch: programForm.autoGenerateBatch,
        auto_generate_trigger_day: programForm.autoGenerateTriggerDay ? Number(programForm.autoGenerateTriggerDay) : undefined,
        auto_enroll_patients: programForm.autoEnrollPatients,
        status: programForm.status,
      })
      toast.success("Workflow program initialized")
      setPlanDialogOpen(false)
      setProgramForm(initialProgramForm)
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to create workflow program")
    }
  }

  return (
    <div className="space-y-6 pb-20 px-4 md:px-0">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 md:p-10 shadow-2xl border border-white/5">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-primary/20 blur-[130px]" />
          <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/10 blur-[130px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" asChild className="gap-2 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em] px-4 h-9">
              <Link href={`/dashboard/super-admin/specialities/${specialty.id}`}>
                <ArrowLeft className="h-3 w-3" /> Back to hub
              </Link>
            </Button>
            <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">
              SPEC-{specialty.id.slice(0, 8)}
            </Badge>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-0.5 rounded-full bg-primary" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Blueprint</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {specialty.name} <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent">Lanes</span>
            </h1>
            <p className="max-w-2xl text-sm text-slate-400 font-medium leading-relaxed">
              Standard clinical orchestration for {languageFilter === 'ALL' ? 'all market' : `${languageFilter} market`} specific delivery parameters.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-2">
        <StatCard label="Programs" value={specialty.programs_count?.toString()} icon={<Package className="h-6 w-6" />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Clinicians" value={specialty.cliniciansCount.toString()} icon={<Users className="h-6 w-6" />} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard label="Current Status" value={specialty.status} icon={<Activity className="h-6 w-6" />} color="text-emerald-600" bg="bg-emerald-50" badge />
        <StatCard label="Last Updated" value="Market Active" valueOverride={new Date(specialty.lastUpdated).toLocaleDateString()} icon={<BadgeDollarSign className="h-6 w-6" />} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <Card className="fresh-card-alt border-none shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-8 border-b border-slate-100/50">
          <div>
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Governance Overview</CardTitle>
            <CardDescription className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Coverage, taxonomy, and delivery capabilities.</CardDescription>
          </div>
          <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-[9px] font-black uppercase tracking-widest px-5 h-10" onClick={() => router.push(`/dashboard/super-admin/specialities/${specialty.id}`)}>
            Intelligence Hub
          </Button>
        </CardHeader>
        <CardContent className="grid gap-10 p-8 lg:grid-cols-3">
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Presence Matrix</p>
            <div className="flex flex-wrap gap-2">
              {languages.length ? (
                languages.map((language) => (
                  <Badge key={language} variant="secondary" className="rounded-full px-3.5 py-1 text-[10px] font-bold bg-blue-50/50 text-blue-600 border-none shadow-sm">
                    {language}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-400 font-medium italic">No languages configured.</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Market Status</p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-primary text-xs">#1</div>
              <p className="text-lg font-black text-slate-900 tracking-tight">Prime Activation</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Delivery Vectors</p>
            <div className="flex flex-wrap gap-2">
              {deliveryFlags.map((mode) => (
                <Badge key={mode.key} variant={mode.enabled ? "default" : "outline"} className={cn("rounded-full px-3.5 py-1 text-[9px] font-black uppercase tracking-widest border-none shadow-sm transition-all", mode.enabled ? "bg-primary text-white" : "bg-slate-50/50 text-slate-400")}>
                  {mode.label} · {mode.enabled ? "LIVE" : "NULL"}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 w-full md:w-auto">
          <TabsTrigger value="plans" className="rounded-xl h-11 px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm text-[11px] font-black uppercase tracking-widest transition-all">Plan Catalogue</TabsTrigger>
          <TabsTrigger value="staff" className="rounded-xl h-11 px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm text-[11px] font-black uppercase tracking-widest transition-all">Staff & KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={languageFilter} onValueChange={(value) => setLanguageFilter(value)}>
                <SelectTrigger className="h-10 w-full sm:w-56 rounded-xl border-slate-100 bg-white shadow-sm font-medium text-xs">
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {planLanguages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language === "ALL" ? "All languages" : language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {languageFilter !== "ALL" && (
                <Button variant="ghost" size="sm" onClick={() => setLanguageFilter("ALL")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                  Clear
                </Button>
              )}
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Total · {totalWorkflowPrograms}
              </div>
            </div>
            <Dialog
              open={planDialogOpen}
              onOpenChange={(open) => {
                setPlanDialogOpen(open)
                if (!open) {
                  setProgramForm(initialProgramForm)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="h-10 px-6 rounded-xl bg-primary text-white shadow-md shadow-primary/10 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Initialize Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Initialize workflow program</DialogTitle>
                  <DialogDescription>Push a new program definition to the workflow service.</DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleProgramSubmit}>
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input value={programForm.name} onChange={(event) => setProgramForm((prev) => ({ ...prev, name: event.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Program code</Label>
                    <Input value={programForm.code} maxLength={10} onChange={(event) => setProgramForm((prev) => ({ ...prev, code: event.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea rows={3} value={programForm.description} onChange={(event) => setProgramForm((prev) => ({ ...prev, description: event.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Language</Label>
                    <Select value={programForm.language} onValueChange={(value) => setProgramForm((prev) => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguageOptions.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select
                        value={programForm.status}
                        onValueChange={(value: WorkflowProgramStatus) => setProgramForm((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKFLOW_PROGRAM_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Duration unit</Label>
                      <Select
                        value={programForm.durationType}
                        onValueChange={(value: WorkflowDurationType) => setProgramForm((prev) => ({ ...prev, durationType: value }))}
                      >
                        <SelectTrigger>
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
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label>Duration value</Label>
                      <Input type="number" min={0} value={programForm.durationValue} onChange={(event) => setProgramForm((prev) => ({ ...prev, durationValue: event.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Extra days (optional)</Label>
                      <Input type="number" min={0} value={programForm.durationExtraDays} onChange={(event) => setProgramForm((prev) => ({ ...prev, durationExtraDays: event.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Trigger day</Label>
                      <Input type="number" min={0} value={programForm.autoGenerateTriggerDay} onChange={(event) => setProgramForm((prev) => ({ ...prev, autoGenerateTriggerDay: event.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Min batch size</Label>
                      <Input type="number" min={0} value={programForm.minBatchSize} onChange={(event) => setProgramForm((prev) => ({ ...prev, minBatchSize: event.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Max batch size</Label>
                      <Input type="number" min={0} value={programForm.maxBatchSize} onChange={(event) => setProgramForm((prev) => ({ ...prev, maxBatchSize: event.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">Auto-generate batches</p>
                        <p className="text-xs text-muted-foreground">Create cohorts automatically</p>
                      </div>
                      <Switch checked={programForm.autoGenerateBatch} onCheckedChange={(checked) => setProgramForm((prev) => ({ ...prev, autoGenerateBatch: checked }))} />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">Auto-enroll patients</p>
                        <p className="text-xs text-muted-foreground">Enroll inbound leads automatically</p>
                      </div>
                      <Switch checked={programForm.autoEnrollPatients} onCheckedChange={(checked) => setProgramForm((prev) => ({ ...prev, autoEnrollPatients: checked }))} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={programSubmitting || !programForm.name.trim() || !programForm.code.trim()}>
                      {programSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Initialize program
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Workflow programs</h3>
                <p className="text-sm text-muted-foreground">
                  {languageFilter === "ALL"
                    ? "Live programs fetched from the workflow service across all languages."
                    : `Programs filtered to the ${languageFilter} market.`}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetchWorkflowPrograms()} className="text-[10px] font-black uppercase tracking-widest gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {workflowProgramsLoading ? (
              <Card className="border-dashed">
                <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading workflow programs…
                </CardContent>
              </Card>
            ) : workflowProgramsError ? (
              <Card className="border border-rose-100 bg-rose-50/50">
                <CardContent className="flex h-32 flex-col items-center justify-center text-sm text-rose-600 text-center gap-2">
                  Unable to load workflow programs.
                  <span className="text-xs text-rose-400">
                    {workflowProgramsErrorData instanceof Error ? workflowProgramsErrorData.message : "Please try again."}
                  </span>
                </CardContent>
              </Card>
            ) : workflowPrograms.length ? (
              workflowPrograms.map((program: any) => (
                <ProgramRow
                  key={program.id}
                  program={program}
                  specialtyName={specialty.name}
                  onInspect={(programId) => {
                    setSelectedProgramId(programId)
                    setProgramDetailOpen(true)
                  }}
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
          <ProgramDetailDialog
            open={programDetailOpen}
            onOpenChange={(open) => {
              setProgramDetailOpen(open)
              if (!open) setSelectedProgramId(null)
            }}
            program={activeProgramDetail ?? null}
            loading={programDetailLoading}
          />
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaffStat label="Active" value={specialty.staff.filter((member) => member.availability === "AVAILABLE").length.toString()} />
            <StaffStat label="Limited" value={specialty.staff.filter((member) => member.availability === "LIMITED").length.toString()} />
            <StaffStat label="OOO" value={specialty.staff.filter((member) => member.availability === "OOO").length.toString()} />
            <StaffStat
              label="Avg NPS"
              value={
                specialty.staff.length
                  ? Math.round(specialty.staff.reduce((sum, member) => sum + member.kpi.nps, 0) / specialty.staff.length).toString()
                  : "-"
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {specialty.staff.map((member) => (
              <Card key={member.id} className="group fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg font-black text-slate-900 tracking-tight">{member.name}</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">{member.role}</CardDescription>
                  </div>
                  <Badge className={cn(
                    "rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border-none shadow-sm transition-all",
                    member.availability === "AVAILABLE" ? "bg-emerald-500/10 text-emerald-600" :
                      member.availability === "LIMITED" ? "bg-amber-500/10 text-amber-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {member.availability}
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-8 pt-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Capacity</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">{member.kpi.patients}</span>
                      <span className="text-[10px] font-bold text-slate-400">Patients</span>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-slate-100 mx-6" />
                  <div className="flex-1 text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Satisfaction</p>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl font-black text-primary tracking-tight">{member.kpi.nps}</span>
                      <span className="text-[10px] font-bold text-slate-400">NPS</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add staff member</CardTitle>
              <CardDescription>Updates KPIs instantly for this speciality.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleStaffSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="staff-name">Name</Label>
                  <Input
                    id="staff-name"
                    value={staffForm.name}
                    onChange={(event) => setStaffForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Dr. Mehta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-role">Role</Label>
                  <Input
                    id="staff-role"
                    value={staffForm.role}
                    onChange={(event) => setStaffForm((prev) => ({ ...prev, role: event.target.value }))}
                    placeholder="Endocrinologist"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select value={staffForm.availability} onValueChange={(value) => setStaffForm((prev) => ({ ...prev, availability: value }))}>
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
                    onChange={(event) => setStaffForm((prev) => ({ ...prev, patients: event.target.value }))}
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
                    onChange={(event) => setStaffForm((prev) => ({ ...prev, nps: event.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={addingStaff || !staffForm.name.trim() || !staffForm.role.trim()} className="w-full md:w-auto">
                    {addingStaff && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add staff
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProgramRow({
  program,
  specialtyName,
  onInspect,
}: {
  program: WorkflowProgram
  specialtyName: string
  onInspect: (programId: string) => void
}) {
  return (
    <div className="group flex flex-wrap items-start justify-between gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1">
      <div className="space-y-3 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xl font-black text-slate-900 tracking-tight">{program.name}</p>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none">
            {program.language_code}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-0.5 rounded-full bg-slate-200" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Workflow · {specialtyName}</p>
        </div>
        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">{program.description ?? "No description available."}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] font-bold border-slate-100 bg-slate-50/50 text-slate-600">
            Duration · {program.duration_value} {program.duration_type}
          </Badge>
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] font-bold border-slate-100 bg-slate-50/50 text-slate-600">
            Batch · {program.min_batch_size} - {program.max_batch_size}
          </Badge>
          {program.auto_generate_batch && (
            <Badge className="rounded-full px-4 py-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border-none">Auto batch</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch gap-4 text-right">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Status</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{program.status}</p>
        </div>
        <Button
          variant="outline"
          className="h-11 px-6 rounded-xl border-slate-100 hover:border-primary/20 hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary"
          onClick={() => onInspect(program.id)}
        >
          Inspect Program
        </Button>
      </div>
    </div>
  )
}

function ProgramDetailDialog({
  open,
  onOpenChange,
  program,
  loading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  program?: (WorkflowProgram & { pricing?: WorkflowProgramPricing[] }) | null
  loading: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl space-y-4">
        <DialogHeader>
          <DialogTitle>{program?.name ?? "Workflow program"}</DialogTitle>
          <DialogDescription>Detailed metadata sourced from /api/v1/workflow-programs.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading program detail…
          </div>
        ) : program ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailField label="Code" value={program.code} />
              <DetailField label="Language" value={program.language_code} />
              <DetailField label="Duration" value={`${program.duration_value} ${program.duration_type}`} />
              <DetailField label="Min batch" value={program.min_batch_size.toString()} />
              <DetailField label="Max batch" value={program.max_batch_size.toString()} />
              <DetailField label="Auto enroll" value={program.auto_enroll_patients ? "Enabled" : "Disabled"} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed">{program.description ?? "No description available."}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">Pricing windows</Badge>
                <span className="text-xs text-slate-400">{program.pricing?.length ?? 0} entries</span>
              </div>
              {program.pricing?.length ? (
                <div className="space-y-3">
                  {program.pricing.map((pricing) => (
                    <div key={pricing.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-base font-bold text-slate-900">{pricing.currency} {pricing.base_price.toLocaleString("en-IN")}</p>
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-500">
                          {pricing.effective_from} → {pricing.effective_to ?? "Open"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Enrollment fee {pricing.enrollment_fee ? `${pricing.enrollment_fee} ${pricing.currency}` : "not set"}. Max discount {pricing.max_discount_percent ?? 0}% (₹{pricing.max_discount_amount ?? 0}).
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No pricing windows configured.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No program selected.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-base font-semibold text-slate-900 mt-1">{value ?? "—"}</p>
    </div>
  )
}

function StaffStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="fresh-card-alt border-none shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-1">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
        <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
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
  label: string
  value: string
  icon: React.ReactNode
  color: string
  bg: string
  valueOverride?: string
  badge?: boolean
}) {
  return (
    <Card className="group fresh-card-alt border-none shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2">
      <CardContent className="flex items-center gap-5 p-8">
        <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", bg)}>
          <div className={cn(color)}>{icon}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
          {badge ? (
            <Badge className={cn("rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm", value === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600")}>{value}</Badge>
          ) : (
            <p className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">{valueOverride ?? value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
