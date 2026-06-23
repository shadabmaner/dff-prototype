"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Edit, Loader2, Brain, Calendar, Globe, Tag, Target, Sparkles, Save, Plus, Trash2,
    Layers, BookOpen, ChevronDown, ChevronUp, FileText, Clock, Activity, Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    useMindsetTemplateById, useUpdateMindsetTemplate, useDeleteMindsetTemplate,
    useAddPhase, useUpdatePhase, useDeletePhase,
    useAddDayDetail, useUpdateDayDetail,
    useAddActivity, useUpdateActivity,
} from "@/hooks/use-mindset-template"
import type { MindsetPhase, MindsetDayDetail, MindsetActivity } from "@/types/mindset-template"

export default function MindsetTemplateDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: templateData, isLoading, error } = useMindsetTemplateById(id)
    const updateMutation = useUpdateMindsetTemplate()
    const deleteMutation = useDeleteMindsetTemplate()
    const addPhaseMut = useAddPhase()
    const updatePhaseMut = useUpdatePhase()
    const deletePhaseMut = useDeletePhase()
    const addDayMut = useAddDayDetail()
    const updateDayMut = useUpdateDayDetail()
    const addActivityMut = useAddActivity()
    const updateActivityMut = useUpdateActivity()

    const [activeTab, setActiveTab] = React.useState("phases")
    const [showEditDialog, setShowEditDialog] = React.useState(false)
    const [editForm, setEditForm] = React.useState({ title: "", description: "", total_days: "21", program_type: "", theme: "", tagline: "", language_code: "en" })

    // Phase state
    const [showPhaseDialog, setShowPhaseDialog] = React.useState(false)
    const [editingPhase, setEditingPhase] = React.useState<MindsetPhase | null>(null)
    const [phaseForm, setPhaseForm] = React.useState({ phase_number: "", phase_name: "", start_day: "", end_day: "", duration_days: "", unlock_day_of_week: "", resource_pdf_url: "", resource_status: "" })
    const [deletePhaseId, setDeletePhaseId] = React.useState<string | null>(null)

    // Day Detail state
    const [showDayDialog, setShowDayDialog] = React.useState(false)
    const [editingDay, setEditingDay] = React.useState<MindsetDayDetail | null>(null)
    const [dayForm, setDayForm] = React.useState({ day_number: "", phase_name: "", week_theme: "", title: "", content_en: "", content_mr: "", tips: "" })

    // Activity state
    const [showActivityDialog, setShowActivityDialog] = React.useState(false)
    const [editingActivity, setEditingActivity] = React.useState<MindsetActivity | null>(null)
    const [activityDayId, setActivityDayId] = React.useState("")
    const [activityForm, setActivityForm] = React.useState({ activity_type: "journal", prompt_en: "", prompt_mr: "", options_en: "", options_mr: "", display_order: "1" })

    const template = templateData?.template ?? templateData?.data ?? templateData
    const phases: MindsetPhase[] = template?.phases ?? []
    const dayDetails: MindsetDayDetail[] = template?.day_details ?? []

    const openEditDialog = () => {
        if (!template) return
        setEditForm({ title: template.title || "", description: template.description || "", total_days: String(template.total_days || 21), program_type: template.program_type || "", theme: template.theme || "", tagline: template.tagline || "", language_code: template.language_code || "en" })
        setShowEditDialog(true)
    }

    const handleUpdate = async () => {
        if (!editForm.title) { toast.error("Title is required"); return }
        try {
            await updateMutation.mutateAsync({ id, data: { title: editForm.title, description: editForm.description || undefined, total_days: Number(editForm.total_days), program_type: editForm.program_type || undefined, theme: editForm.theme || undefined, tagline: editForm.tagline || undefined, language_code: editForm.language_code || undefined } })
            toast.success("Template updated"); setShowEditDialog(false)
        } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to update") }
    }

    const handleDelete = async () => {
        try { await deleteMutation.mutateAsync(id); toast.success("Template deleted"); router.push("/dashboard/admin/mindset-management") }
        catch (e: any) { toast.error(e?.response?.data?.message || "Failed to delete") }
    }

    // Phase CRUD
    const resetPhaseForm = () => { setPhaseForm({ phase_number: "", phase_name: "", start_day: "", end_day: "", duration_days: "", unlock_day_of_week: "", resource_pdf_url: "", resource_status: "" }); setEditingPhase(null) }
    const openAddPhase = () => { resetPhaseForm(); setPhaseForm(f => ({ ...f, phase_number: String(phases.length + 1) })); setShowPhaseDialog(true) }
    const openEditPhase = (p: MindsetPhase) => { setEditingPhase(p); setPhaseForm({ phase_number: String(p.phase_number), phase_name: p.phase_name, start_day: String(p.start_day), end_day: String(p.end_day), duration_days: String(p.duration_days), unlock_day_of_week: String(p.unlock_day_of_week), resource_pdf_url: p.resource_pdf_url || "", resource_status: p.resource_status || "" }); setShowPhaseDialog(true) }

    const handleSavePhase = async () => {
        if (!phaseForm.phase_name || !phaseForm.phase_number) { toast.error("Phase name & number required"); return }
        try {
            const payload = { phase_number: Number(phaseForm.phase_number), phase_name: phaseForm.phase_name, start_day: Number(phaseForm.start_day), end_day: Number(phaseForm.end_day), duration_days: Number(phaseForm.duration_days), unlock_day_of_week: Number(phaseForm.unlock_day_of_week), resource_pdf_url: phaseForm.resource_pdf_url || undefined }
            if (editingPhase) { await updatePhaseMut.mutateAsync({ phaseId: editingPhase.id, templateId: id, data: { ...payload, resource_status: phaseForm.resource_status || undefined } }); toast.success("Phase updated") }
            else { await addPhaseMut.mutateAsync({ templateId: id, data: payload }); toast.success("Phase added") }
            setShowPhaseDialog(false); resetPhaseForm()
        } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save phase") }
    }

    const handleDeletePhase = async (phaseId: string) => {
        try { await deletePhaseMut.mutateAsync({ phaseId, templateId: id }); toast.success("Phase deleted"); setDeletePhaseId(null) }
        catch (e: any) { toast.error(e?.response?.data?.message || "Failed to delete phase") }
    }

    // Day Detail CRUD
    const resetDayForm = () => { setDayForm({ day_number: "", phase_name: "", week_theme: "", title: "", content_en: "", content_mr: "", tips: "" }); setEditingDay(null) }
    const openAddDay = () => { resetDayForm(); setDayForm(f => ({ ...f, day_number: String(dayDetails.length + 1) })); setShowDayDialog(true) }
    const openEditDay = (d: MindsetDayDetail) => { setEditingDay(d); setDayForm({ day_number: String(d.day_number), phase_name: d.phase_name || "", week_theme: d.week_theme || "", title: d.title || "", content_en: d.content?.en || "", content_mr: d.content?.mr || "", tips: d.tips || "" }); setShowDayDialog(true) }

    const handleSaveDay = async () => {
        if (!dayForm.day_number) { toast.error("Day number required"); return }
        const content: Record<string, string> = {}; if (dayForm.content_en) content.en = dayForm.content_en; if (dayForm.content_mr) content.mr = dayForm.content_mr
        const payload = { day_number: Number(dayForm.day_number), phase_name: dayForm.phase_name || undefined, week_theme: dayForm.week_theme || undefined, title: dayForm.title || undefined, content: Object.keys(content).length ? content : undefined, tips: dayForm.tips || undefined }
        try {
            if (editingDay) { await updateDayMut.mutateAsync({ detailId: editingDay.id, templateId: id, data: payload }); toast.success("Day updated") }
            else { await addDayMut.mutateAsync({ templateId: id, data: payload }); toast.success("Day added") }
            setShowDayDialog(false); resetDayForm()
        } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save day") }
    }

    // Activity CRUD
    const resetActivityForm = () => { setActivityForm({ activity_type: "journal", prompt_en: "", prompt_mr: "", options_en: "", options_mr: "", display_order: "1" }); setEditingActivity(null); setActivityDayId("") }
    const openAddActivity = (dayDetailId: string) => { resetActivityForm(); setActivityDayId(dayDetailId); setShowActivityDialog(true) }
    const openEditActivity = (act: MindsetActivity, dayDetailId: string) => { setEditingActivity(act); setActivityDayId(dayDetailId); setActivityForm({ activity_type: act.activity_type || "journal", prompt_en: act.prompt?.en || "", prompt_mr: act.prompt?.mr || "", options_en: act.options?.en?.join(", ") || "", options_mr: act.options?.mr?.join(", ") || "", display_order: String(act.display_order ?? 1) }); setShowActivityDialog(true) }

    const handleSaveActivity = async () => {
        if (!activityForm.activity_type) { toast.error("Activity type required"); return }
        const prompt: Record<string, string> = {}; if (activityForm.prompt_en) prompt.en = activityForm.prompt_en; if (activityForm.prompt_mr) prompt.mr = activityForm.prompt_mr
        const options: Record<string, string[]> = {}; if (activityForm.options_en) options.en = activityForm.options_en.split(",").map(s => s.trim()).filter(Boolean); if (activityForm.options_mr) options.mr = activityForm.options_mr.split(",").map(s => s.trim()).filter(Boolean)
        const payload = { activity_type: activityForm.activity_type, prompt: Object.keys(prompt).length ? prompt : undefined, options: Object.keys(options).length ? options : undefined, display_order: Number(activityForm.display_order) || 1 }
        try {
            if (editingActivity) { await updateActivityMut.mutateAsync({ activityId: editingActivity.id, templateId: id, data: payload }); toast.success("Activity updated") }
            else { await addActivityMut.mutateAsync({ detailId: activityDayId, templateId: id, data: payload }); toast.success("Activity added") }
            setShowActivityDialog(false); resetActivityForm()
        } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save activity") }
    }

    if (isLoading) return <div className="grid h-[60vh] place-items-center text-muted-foreground"><div className="flex items-center gap-2 text-sm font-semibold"><Loader2 className="h-4 w-4 animate-spin" /> Loading mindset program…</div></div>
    if (error || !template) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><p className="text-red-600 font-semibold">{error ? error.message : "Template not found"}</p><Button variant="outline" onClick={() => router.push("/dashboard/admin/mindset-management")}><ArrowLeft className="h-4 w-4 mr-2" />Back to list</Button></div>

    const sortedPhases = [...phases].sort((a, b) => a.phase_number - b.phase_number)
    const sortedDays = [...dayDetails].sort((a, b) => a.day_number - b.day_number)

    return (
        <div className="space-y-6 pb-20 px-4 md:px-0">
            {/* ── Hero ────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 md:p-10 shadow-2xl border border-white/5">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-purple-500/20 blur-[130px]" />
                    <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-indigo-500/10 blur-[130px]" />
                </div>
                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/admin/mindset-management")} className="gap-2 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em] px-4 h-9">
                            <ArrowLeft className="h-3 w-3" /> Back to list
                        </Button>
                        <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">
                            MST-{template.id?.slice(0, 8)}
                        </Badge>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-0.5 rounded-full bg-purple-400" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">Mindset Blueprint</p>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            {template.title} <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">Program</span>
                        </h1>
                        {template.tagline && <p className="max-w-2xl text-sm text-slate-400 font-medium leading-relaxed italic">&ldquo;{template.tagline}&rdquo;</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { icon: Calendar, label: `${template.total_days} Days` },
                            template.program_type && { icon: Target, label: template.program_type },
                            template.theme && { icon: Sparkles, label: template.theme },
                            template.language_code && { icon: Globe, label: template.language_code.toUpperCase() },
                            { icon: Layers, label: `${phases.length} Phases` },
                            { icon: BookOpen, label: `${dayDetails.length} Days` },
                        ].filter(Boolean).map((b: any, i) => (
                            <Badge key={i} variant="outline" className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-white/10 bg-white/5 text-white/60 border-none shadow-sm">
                                <b.icon className="h-3 w-3 mr-1" />{b.label}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="rounded-xl border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-white text-[10px] font-black uppercase tracking-widest" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</>}
                        </Button>
                        <Button size="sm" className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest px-5" onClick={openEditDialog}>
                            <Edit className="h-3.5 w-3.5 mr-1" />Edit Template
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────── */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-2">
                <StatCard label="Total Days" value={String(template.total_days)} icon={<Calendar className="h-6 w-6" />} color="text-blue-600" bg="bg-blue-50" />
                <StatCard label="Phases" value={String(phases.length)} icon={<Layers className="h-6 w-6" />} color="text-indigo-600" bg="bg-indigo-50" />
                <StatCard label="Day Details" value={String(dayDetails.length)} icon={<BookOpen className="h-6 w-6" />} color="text-purple-600" bg="bg-purple-50" />
                <StatCard label="Status" value={template.is_active ? "Active" : "Inactive"} icon={<Activity className="h-6 w-6" />} color="text-emerald-600" bg="bg-emerald-50" badge />
            </div>

            {/* ── Governance Card ─────────────────────────── */}
            <Card className="fresh-card-alt border-none shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-8 border-b border-slate-100/50">
                    <div><CardTitle className="text-xl font-black text-slate-900 tracking-tight">Program Overview</CardTitle><CardDescription className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Configuration, metadata, and delivery parameters.</CardDescription></div>
                </CardHeader>
                <CardContent className="grid gap-10 p-8 lg:grid-cols-3">
                    <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Program Details</p>
                        <div className="space-y-2">
                            <DetailField label="Description" value={template.description || "Not set"} />
                            <DetailField label="Program Type" value={template.program_type || "Not set"} />
                            <DetailField label="Theme" value={template.theme || "Not set"} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Identifiers</p>
                        <div className="space-y-2">
                            <DetailField label="ID" value={template.id} />
                            <DetailField label="Speciality" value={template.speciality_id || "Not assigned"} />
                            <DetailField label="Language" value={template.language_code?.toUpperCase() || "EN"} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Timestamps</p>
                        <div className="space-y-2">
                            <DetailField label="Created" value={new Date(template.created_at).toLocaleDateString()} />
                            <DetailField label="Updated" value={new Date(template.updated_at).toLocaleDateString()} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Tabs ────────────────────────────────────── */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 w-full md:w-auto">
                    <TabsTrigger value="phases" className="rounded-xl h-11 px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm text-[11px] font-black uppercase tracking-widest transition-all">Phases · {phases.length}</TabsTrigger>
                    <TabsTrigger value="days" className="rounded-xl h-11 px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm text-[11px] font-black uppercase tracking-widest transition-all">Day Details · {dayDetails.length}</TabsTrigger>
                </TabsList>

                {/* ── Phases Tab ──────────────────────────── */}
                <TabsContent value="phases" className="space-y-6">
                    <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total · {phases.length}</div>
                        <Button onClick={openAddPhase} className="h-10 px-6 rounded-xl bg-primary text-white shadow-md shadow-primary/10 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Add Phase
                        </Button>
                    </div>
                    {sortedPhases.length === 0 ? (
                        <Card className="border-dashed"><CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">No phases configured. Add your first phase to get started.</CardContent></Card>
                    ) : sortedPhases.map(phase => (
                        <div key={phase.id} className="group flex flex-wrap items-start justify-between gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                            <div className="space-y-3 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm shadow-md">{phase.phase_number}</div>
                                    <p className="text-xl font-black text-slate-900 tracking-tight">{phase.phase_name}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] font-bold border-slate-100 bg-slate-50/50 text-slate-600">Day {phase.start_day} – {phase.end_day}</Badge>
                                    <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] font-bold border-slate-100 bg-slate-50/50 text-slate-600">{phase.duration_days} days</Badge>
                                    <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] font-bold border-slate-100 bg-slate-50/50 text-slate-600">Unlock day {phase.unlock_day_of_week}</Badge>
                                    {phase.resource_pdf_url && <Badge className="rounded-full px-4 py-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border-none"><FileText className="h-3 w-3 mr-1" />PDF</Badge>}
                                    {phase.resource_status && <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] font-bold">{phase.resource_status}</Badge>}
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-between self-stretch gap-4">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => openEditPhase(phase)}><Edit className="h-3.5 w-3.5 mr-1" />Edit</Button>
                                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 border-red-200 hover:bg-red-50" onClick={() => setDeletePhaseId(phase.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                                <Link href={`/dashboard/admin/mindset-management/${id}/phases/${phase.id}`}>
                                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-100 hover:border-primary/20 hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                                        <Eye className="h-3.5 w-3.5 mr-2" />View Phase Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </TabsContent>

                {/* ── Day Details Tab ─────────────────────── */}
                <TabsContent value="days" className="space-y-6">
                    <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total · {dayDetails.length}</div>
                        <Button onClick={openAddDay} className="h-10 px-6 rounded-xl bg-primary text-white shadow-md shadow-primary/10 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Add Day
                        </Button>
                    </div>
                    {sortedDays.length === 0 ? (
                        <Card className="border-dashed"><CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">No day details yet. Add content for each day.</CardContent></Card>
                    ) : sortedDays.map(day => (
                        <div key={day.id} className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white font-black text-xs shadow">{day.day_number}</div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 tracking-tight">{day.title || `Day ${day.day_number}`}</p>
                                            {day.phase_name && <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{day.phase_name}</p>}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {day.week_theme && <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-bold border-slate-100">🎯 {day.week_theme}</Badge>}
                                        {day.tips && <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-bold border-amber-100 text-amber-600">💡 {day.tips}</Badge>}
                                    </div>
                                    {day.content?.en && <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl line-clamp-2">{day.content.en}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => openAddActivity(day.id)}><Plus className="h-3.5 w-3.5 mr-1" />Activity</Button>
                                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => openEditDay(day)}><Edit className="h-3.5 w-3.5 mr-1" />Edit</Button>
                                </div>
                            </div>
                            {/* Activities */}
                            {day.activities && day.activities.length > 0 && (
                                <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Activities · {day.activities.length}</p>
                                    {day.activities.sort((a, b) => a.display_order - b.display_order).map(act => (
                                        <div key={act.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 hover:bg-slate-50 transition cursor-pointer" onClick={() => openEditActivity(act, day.id)}>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest">{act.activity_type}</Badge>
                                                <p className="text-sm font-medium text-slate-700 line-clamp-1">{act.prompt?.en || "No prompt"}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-bold">#{act.display_order}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </TabsContent>
            </Tabs>

            {/* ═══════ DIALOGS ═══════ */}

            {/* Template Edit */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Edit Mindset Program</DialogTitle><DialogDescription>Update program details.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label>Title *</Label><Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
                        <div className="grid gap-2"><Label>Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2"><Label>Total Days</Label><Input type="number" value={editForm.total_days} onChange={e => setEditForm(f => ({ ...f, total_days: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>Program Type</Label><Input value={editForm.program_type} onChange={e => setEditForm(f => ({ ...f, program_type: e.target.value }))} /></div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2"><Label>Theme</Label><Input value={editForm.theme} onChange={e => setEditForm(f => ({ ...f, theme: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>Language</Label><Select value={editForm.language_code} onValueChange={v => setEditForm(f => ({ ...f, language_code: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="hi">Hindi</SelectItem><SelectItem value="te">Telugu</SelectItem><SelectItem value="ta">Tamil</SelectItem><SelectItem value="kn">Kannada</SelectItem></SelectContent></Select></div>
                        </div>
                        <div className="grid gap-2"><Label>Tagline</Label><Input value={editForm.tagline} onChange={e => setEditForm(f => ({ ...f, tagline: e.target.value }))} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button><Button onClick={handleUpdate} disabled={updateMutation.isPending}>{updateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Phase Add/Edit */}
            <Dialog open={showPhaseDialog} onOpenChange={o => { setShowPhaseDialog(o); if (!o) resetPhaseForm() }}>
                <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingPhase ? "Edit Phase" : "Add Phase"}</DialogTitle><DialogDescription>{editingPhase ? "Update phase details." : "Add a new phase."}</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2"><Label>Phase Number *</Label><Input type="number" value={phaseForm.phase_number} onChange={e => setPhaseForm(f => ({ ...f, phase_number: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>Phase Name *</Label><Input value={phaseForm.phase_name} onChange={e => setPhaseForm(f => ({ ...f, phase_name: e.target.value }))} placeholder="Phase 1: Awareness" /></div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="grid gap-2"><Label>Start Day</Label><Input type="number" value={phaseForm.start_day} onChange={e => setPhaseForm(f => ({ ...f, start_day: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>End Day</Label><Input type="number" value={phaseForm.end_day} onChange={e => setPhaseForm(f => ({ ...f, end_day: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>Duration</Label><Input type="number" value={phaseForm.duration_days} onChange={e => setPhaseForm(f => ({ ...f, duration_days: e.target.value }))} /></div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2"><Label>Unlock Day of Week</Label><Input type="number" min="1" max="7" value={phaseForm.unlock_day_of_week} onChange={e => setPhaseForm(f => ({ ...f, unlock_day_of_week: e.target.value }))} /></div>
                            {editingPhase && <div className="grid gap-2"><Label>Resource Status</Label><Input value={phaseForm.resource_status} onChange={e => setPhaseForm(f => ({ ...f, resource_status: e.target.value }))} /></div>}
                        </div>
                        <div className="grid gap-2"><Label>Resource PDF URL</Label><Input value={phaseForm.resource_pdf_url} onChange={e => setPhaseForm(f => ({ ...f, resource_pdf_url: e.target.value }))} placeholder="https://..." /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => { setShowPhaseDialog(false); resetPhaseForm() }}>Cancel</Button><Button onClick={handleSavePhase} disabled={addPhaseMut.isPending || updatePhaseMut.isPending}>{(addPhaseMut.isPending || updatePhaseMut.isPending) ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : editingPhase ? "Update Phase" : "Add Phase"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Phase Delete */}
            <Dialog open={!!deletePhaseId} onOpenChange={() => setDeletePhaseId(null)}>
                <DialogContent className="sm:max-w-[400px] bg-white"><DialogHeader><DialogTitle>Delete Phase</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setDeletePhaseId(null)}>Cancel</Button><Button variant="destructive" onClick={() => deletePhaseId && handleDeletePhase(deletePhaseId)} disabled={deletePhaseMut.isPending}>{deletePhaseMut.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : "Delete Phase"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Day Detail Add/Edit */}
            <Dialog open={showDayDialog} onOpenChange={o => { setShowDayDialog(o); if (!o) resetDayForm() }}>
                <DialogContent className="sm:max-w-[650px] bg-white max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingDay ? "Edit Day Detail" : "Add Day Detail"}</DialogTitle><DialogDescription>{editingDay ? "Update day content." : "Add content for a day."}</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2"><Label>Day Number *</Label><Input type="number" value={dayForm.day_number} onChange={e => setDayForm(f => ({ ...f, day_number: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>Phase Name</Label><Input value={dayForm.phase_name} onChange={e => setDayForm(f => ({ ...f, phase_name: e.target.value }))} /></div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2"><Label>Week Theme</Label><Input value={dayForm.week_theme} onChange={e => setDayForm(f => ({ ...f, week_theme: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>Title</Label><Input value={dayForm.title} onChange={e => setDayForm(f => ({ ...f, title: e.target.value }))} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Content (English)</Label><Textarea value={dayForm.content_en} onChange={e => setDayForm(f => ({ ...f, content_en: e.target.value }))} rows={3} /></div>
                        <div className="grid gap-2"><Label>Content (Marathi / Regional)</Label><Textarea value={dayForm.content_mr} onChange={e => setDayForm(f => ({ ...f, content_mr: e.target.value }))} rows={3} /></div>
                        <div className="grid gap-2"><Label>Tips</Label><Input value={dayForm.tips} onChange={e => setDayForm(f => ({ ...f, tips: e.target.value }))} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => { setShowDayDialog(false); resetDayForm() }}>Cancel</Button><Button onClick={handleSaveDay} disabled={addDayMut.isPending || updateDayMut.isPending}>{(addDayMut.isPending || updateDayMut.isPending) ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : editingDay ? "Update Day" : "Add Day"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Activity Add/Edit */}
            <Dialog open={showActivityDialog} onOpenChange={o => { setShowActivityDialog(o); if (!o) resetActivityForm() }}>
                <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingActivity ? "Edit Activity" : "Add Activity"}</DialogTitle><DialogDescription>{editingActivity ? "Update activity details." : "Add an activity to this day."}</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2"><Label>Activity Type *</Label><Select value={activityForm.activity_type} onValueChange={v => setActivityForm(f => ({ ...f, activity_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="journal">Journal</SelectItem><SelectItem value="reflection">Reflection</SelectItem><SelectItem value="exercise">Exercise</SelectItem><SelectItem value="quiz">Quiz</SelectItem><SelectItem value="meditation">Meditation</SelectItem></SelectContent></Select></div>
                            <div className="grid gap-2"><Label>Display Order</Label><Input type="number" value={activityForm.display_order} onChange={e => setActivityForm(f => ({ ...f, display_order: e.target.value }))} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Prompt (English)</Label><Textarea value={activityForm.prompt_en} onChange={e => setActivityForm(f => ({ ...f, prompt_en: e.target.value }))} rows={2} placeholder="Write about three things you appreciate..." /></div>
                        <div className="grid gap-2"><Label>Prompt (Marathi / Regional)</Label><Textarea value={activityForm.prompt_mr} onChange={e => setActivityForm(f => ({ ...f, prompt_mr: e.target.value }))} rows={2} /></div>
                        <div className="grid gap-2"><Label>Options EN (comma-separated)</Label><Input value={activityForm.options_en} onChange={e => setActivityForm(f => ({ ...f, options_en: e.target.value }))} placeholder="Option 1, Option 2" /></div>
                        <div className="grid gap-2"><Label>Options MR (comma-separated)</Label><Input value={activityForm.options_mr} onChange={e => setActivityForm(f => ({ ...f, options_mr: e.target.value }))} placeholder="पर्याय 1, पर्याय 2" /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => { setShowActivityDialog(false); resetActivityForm() }}>Cancel</Button><Button onClick={handleSaveActivity} disabled={addActivityMut.isPending || updateActivityMut.isPending}>{(addActivityMut.isPending || updateActivityMut.isPending) ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : editingActivity ? "Update Activity" : "Add Activity"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function DetailField({ label, value }: { label: string; value?: string }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-slate-900 mt-1 break-all">{value ?? "—"}</p>
        </div>
    )
}

function StatCard({ label, value, icon, color, bg, badge }: { label: string; value: string; icon: React.ReactNode; color: string; bg: string; badge?: boolean }) {
    return (
        <Card className="fresh-card-alt border-none shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", bg, color)}>{icon}</div>
                <div><p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
                    {badge ? <Badge className="mt-1 rounded-full px-3 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-600 border-none">{value}</Badge> : <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>}
                </div>
            </CardContent>
        </Card>
    )
}
