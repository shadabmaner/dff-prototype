"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Edit, Loader2, Layers, Calendar, Clock, FileText, Plus,
    Trash2, Save, Activity, BookOpen, Eye, Brain, ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    useMindsetTemplateById,
    useUpdatePhase,
    useDeletePhase,
    useAddDayDetail,
    useUpdateDayDetail,
    useAddActivity,
    useUpdateActivity,
} from "@/hooks/use-mindset-template"
import type { MindsetPhase, MindsetDayDetail, MindsetActivity } from "@/types/mindset-template"

export default function PhaseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const templateId = params.id as string
    const phaseId = params.phaseId as string

    const { data: templateData, isLoading, error } = useMindsetTemplateById(templateId)
    const updatePhaseMut = useUpdatePhase()
    const deletePhaseMut = useDeletePhase()
    const addDayMut = useAddDayDetail()
    const updateDayMut = useUpdateDayDetail()
    const addActivityMut = useAddActivity()
    const updateActivityMut = useUpdateActivity()

    // Phase edit
    const [showEditDialog, setShowEditDialog] = React.useState(false)
    const [phaseForm, setPhaseForm] = React.useState({ phase_number: "", phase_name: "", start_day: "", end_day: "", duration_days: "", unlock_day_of_week: "", resource_pdf_url: "", resource_status: "" })

    // Day Detail
    const [showDayDialog, setShowDayDialog] = React.useState(false)
    const [editingDay, setEditingDay] = React.useState<MindsetDayDetail | null>(null)
    const [dayForm, setDayForm] = React.useState({ day_number: "", phase_name: "", week_theme: "", title: "", content_en: "", content_mr: "", tips: "" })

    // Activity
    const [showActivityDialog, setShowActivityDialog] = React.useState(false)
    const [editingActivity, setEditingActivity] = React.useState<MindsetActivity | null>(null)
    const [activityDayId, setActivityDayId] = React.useState("")
    const [activityForm, setActivityForm] = React.useState({ activity_type: "journal", prompt_en: "", prompt_mr: "", options_en: "", options_mr: "", display_order: "1" })

    const template = templateData?.template ?? templateData?.data ?? templateData
    const phases: MindsetPhase[] = template?.phases ?? []
    const allDayDetails: MindsetDayDetail[] = template?.day_details ?? []
    const phase = phases.find((p: MindsetPhase) => p.id === phaseId)

    // Filter day details to this phase
    const phaseDays = React.useMemo(() => {
        if (!phase) return []
        return allDayDetails
            .filter((d: MindsetDayDetail) =>
                d.phase_name === phase.phase_name ||
                (d.day_number >= phase.start_day && d.day_number <= phase.end_day)
            )
            .sort((a, b) => a.day_number - b.day_number)
    }, [phase, allDayDetails])

    // ── Phase Edit ──────────────────────────────────────────
    const openEditPhase = () => {
        if (!phase) return
        setPhaseForm({ phase_number: String(phase.phase_number), phase_name: phase.phase_name, start_day: String(phase.start_day), end_day: String(phase.end_day), duration_days: String(phase.duration_days), unlock_day_of_week: String(phase.unlock_day_of_week), resource_pdf_url: phase.resource_pdf_url || "", resource_status: phase.resource_status || "" })
        setShowEditDialog(true)
    }

    const handleUpdatePhase = async () => {
        if (!phaseForm.phase_name) { toast.error("Phase name required"); return }
        try {
            await updatePhaseMut.mutateAsync({ phaseId, templateId, data: { phase_number: Number(phaseForm.phase_number), phase_name: phaseForm.phase_name, start_day: Number(phaseForm.start_day), end_day: Number(phaseForm.end_day), duration_days: Number(phaseForm.duration_days), unlock_day_of_week: Number(phaseForm.unlock_day_of_week), resource_pdf_url: phaseForm.resource_pdf_url || undefined, resource_status: phaseForm.resource_status || undefined } })
            toast.success("Phase updated"); setShowEditDialog(false)
        } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to update phase") }
    }

    const handleDeletePhase = async () => {
        try { await deletePhaseMut.mutateAsync({ phaseId, templateId }); toast.success("Phase deleted"); router.push(`/dashboard/admin/mindset-management/${templateId}`) }
        catch (e: any) { toast.error(e?.response?.data?.message || "Failed to delete phase") }
    }

    // ── Day Detail CRUD ─────────────────────────────────────
    const resetDayForm = () => { setDayForm({ day_number: "", phase_name: "", week_theme: "", title: "", content_en: "", content_mr: "", tips: "" }); setEditingDay(null) }
    const openAddDay = () => { resetDayForm(); setDayForm(f => ({ ...f, day_number: String((phaseDays.length ? phaseDays[phaseDays.length - 1].day_number + 1 : (phase?.start_day ?? 1))), phase_name: phase?.phase_name || "" })); setShowDayDialog(true) }
    const openEditDay = (d: MindsetDayDetail) => { setEditingDay(d); setDayForm({ day_number: String(d.day_number), phase_name: d.phase_name || "", week_theme: d.week_theme || "", title: d.title || "", content_en: d.content?.en || "", content_mr: d.content?.mr || "", tips: d.tips || "" }); setShowDayDialog(true) }

    const handleSaveDay = async () => {
        if (!dayForm.day_number) { toast.error("Day number required"); return }
        const content: Record<string, string> = {}; if (dayForm.content_en) content.en = dayForm.content_en; if (dayForm.content_mr) content.mr = dayForm.content_mr
        const payload = { day_number: Number(dayForm.day_number), phase_name: dayForm.phase_name || undefined, week_theme: dayForm.week_theme || undefined, title: dayForm.title || undefined, content: Object.keys(content).length ? content : undefined, tips: dayForm.tips || undefined }
        try {
            if (editingDay) { await updateDayMut.mutateAsync({ detailId: editingDay.id, templateId, data: payload }); toast.success("Day updated") }
            else { await addDayMut.mutateAsync({ templateId, data: payload }); toast.success("Day added") }
            setShowDayDialog(false); resetDayForm()
        } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save day") }
    }

    // ── Activity CRUD ───────────────────────────────────────
    const resetActivityForm = () => { setActivityForm({ activity_type: "journal", prompt_en: "", prompt_mr: "", options_en: "", options_mr: "", display_order: "1" }); setEditingActivity(null); setActivityDayId("") }
    const openAddActivity = (dayDetailId: string) => { resetActivityForm(); setActivityDayId(dayDetailId); setShowActivityDialog(true) }
    const openEditActivity = (act: MindsetActivity, dayDetailId: string) => { setEditingActivity(act); setActivityDayId(dayDetailId); setActivityForm({ activity_type: act.activity_type || "journal", prompt_en: act.prompt?.en || "", prompt_mr: act.prompt?.mr || "", options_en: act.options?.en?.join(", ") || "", options_mr: act.options?.mr?.join(", ") || "", display_order: String(act.display_order ?? 1) }); setShowActivityDialog(true) }

    const handleSaveActivity = async () => {
        if (!activityForm.activity_type) { toast.error("Activity type required"); return }
        const prompt: Record<string, string> = {}; if (activityForm.prompt_en) prompt.en = activityForm.prompt_en; if (activityForm.prompt_mr) prompt.mr = activityForm.prompt_mr
        const options: Record<string, string[]> = {}; if (activityForm.options_en) options.en = activityForm.options_en.split(",").map(s => s.trim()).filter(Boolean); if (activityForm.options_mr) options.mr = activityForm.options_mr.split(",").map(s => s.trim()).filter(Boolean)
        const payload = { activity_type: activityForm.activity_type, prompt: Object.keys(prompt).length ? prompt : undefined, options: Object.keys(options).length ? options : undefined, display_order: Number(activityForm.display_order) || 1 }
        try {
            if (editingActivity) { await updateActivityMut.mutateAsync({ activityId: editingActivity.id, templateId, data: payload }); toast.success("Activity updated") }
            else { await addActivityMut.mutateAsync({ detailId: activityDayId, templateId, data: payload }); toast.success("Activity added") }
            setShowActivityDialog(false); resetActivityForm()
        } catch (e: any) { toast.error(e?.response?.data?.message || "Failed to save activity") }
    }

    // ── Loading / Error ─────────────────────────────────────
    if (isLoading) return <div className="grid h-[60vh] place-items-center text-muted-foreground"><div className="flex items-center gap-2 text-sm font-semibold"><Loader2 className="h-4 w-4 animate-spin" /> Loading phase details…</div></div>
    if (error || !template) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><p className="text-red-600 font-semibold">{error ? error.message : "Template not found"}</p><Button variant="outline" onClick={() => router.push("/dashboard/admin/mindset-management")}><ArrowLeft className="h-4 w-4 mr-2" />Back to list</Button></div>
    if (!phase) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><p className="text-red-600 font-semibold">Phase not found</p><Button variant="outline" onClick={() => router.push(`/dashboard/admin/mindset-management/${templateId}`)}><ArrowLeft className="h-4 w-4 mr-2" />Back to program</Button></div>

    return (
        <div className="space-y-6 pb-20 px-4 md:px-0">
            {/* ── Hero ────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 md:p-10 shadow-2xl border border-white/5">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-indigo-500/20 blur-[130px]" />
                    <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-purple-500/10 blur-[130px]" />
                </div>
                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/admin/mindset-management/${templateId}`)} className="gap-2 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em] px-4 h-9">
                            <ArrowLeft className="h-3 w-3" /> Back to program
                        </Button>
                        <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">
                            PHASE-{phase.id.slice(0, 8)}
                        </Badge>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-0.5 rounded-full bg-indigo-400" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Phase {phase.phase_number} · {template.title}</p>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            {phase.phase_name}
                        </h1>
                        <p className="max-w-2xl text-sm text-slate-400 font-medium leading-relaxed">
                            Day {phase.start_day} to Day {phase.end_day} · {phase.duration_days} days duration · Unlocks on day {phase.unlock_day_of_week}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="rounded-xl border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-white text-[10px] font-black uppercase tracking-widest" onClick={handleDeletePhase} disabled={deletePhaseMut.isPending}>
                            {deletePhaseMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Trash2 className="h-3.5 w-3.5 mr-1" />Delete Phase</>}
                        </Button>
                        <Button size="sm" className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest px-5" onClick={openEditPhase}>
                            <Edit className="h-3.5 w-3.5 mr-1" />Edit Phase
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────── */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-2">
                <StatCard label="Phase Number" value={String(phase.phase_number)} icon={<Layers className="h-6 w-6" />} color="text-indigo-600" bg="bg-indigo-50" />
                <StatCard label="Duration" value={`${phase.duration_days} days`} icon={<Clock className="h-6 w-6" />} color="text-blue-600" bg="bg-blue-50" />
                <StatCard label="Day Range" value={`${phase.start_day} – ${phase.end_day}`} icon={<Calendar className="h-6 w-6" />} color="text-purple-600" bg="bg-purple-50" />
                <StatCard label="Day Details" value={String(phaseDays.length)} icon={<BookOpen className="h-6 w-6" />} color="text-emerald-600" bg="bg-emerald-50" />
            </div>

            {/* ── Phase Details Card ──────────────────────── */}
            <Card className="fresh-card-alt border-none shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-100/50">
                    <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Phase Configuration</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Resource and scheduling parameters.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-10 p-8 lg:grid-cols-3">
                    <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Schedule</p>
                        <div className="space-y-2">
                            <DetailField label="Start Day" value={String(phase.start_day)} />
                            <DetailField label="End Day" value={String(phase.end_day)} />
                            <DetailField label="Duration" value={`${phase.duration_days} days`} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Configuration</p>
                        <div className="space-y-2">
                            <DetailField label="Unlock Day" value={`Day ${phase.unlock_day_of_week} of week`} />
                            <DetailField label="Resource Status" value={phase.resource_status || "Not set"} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Resources</p>
                        <div className="space-y-2">
                            {phase.resource_pdf_url ? (
                                <a href={phase.resource_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-emerald-700 hover:bg-emerald-50 transition">
                                    <FileText className="h-5 w-5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">PDF Resource</p>
                                        <p className="text-sm font-semibold truncate">{phase.resource_pdf_url}</p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                </a>
                            ) : (
                                <DetailField label="PDF Resource" value="Not uploaded" />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Day Details for this Phase ──────────────── */}
            <Card className="fresh-card-alt border-none shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-8 border-b border-slate-100/50">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Day Details</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Content for days {phase.start_day} – {phase.end_day} in this phase.</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border border-slate-100">Total · {phaseDays.length}</div>
                        <Button onClick={openAddDay} className="h-10 px-6 rounded-xl bg-primary text-white shadow-md shadow-primary/10 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Add Day
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {phaseDays.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 border-2 border-dashed border-slate-200 rounded-2xl">
                            <BookOpen className="h-10 w-10 text-slate-300" />
                            <p className="text-sm font-bold text-slate-400">No day details for this phase yet</p>
                            <Button size="sm" variant="outline" onClick={openAddDay} className="text-xs mt-1"><Plus className="h-3.5 w-3.5 mr-1" />Add First Day</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {phaseDays.map(day => (
                                <div key={day.id} className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
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
                                            {day.content?.mr && <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl line-clamp-1 italic">{day.content.mr}</p>}
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
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ═══════ DIALOGS ═══════ */}

            {/* Phase Edit */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Edit Phase</DialogTitle><DialogDescription>Update phase configuration.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2"><Label>Phase Number</Label><Input type="number" value={phaseForm.phase_number} onChange={e => setPhaseForm(f => ({ ...f, phase_number: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>Phase Name *</Label><Input value={phaseForm.phase_name} onChange={e => setPhaseForm(f => ({ ...f, phase_name: e.target.value }))} /></div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="grid gap-2"><Label>Start Day</Label><Input type="number" value={phaseForm.start_day} onChange={e => setPhaseForm(f => ({ ...f, start_day: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>End Day</Label><Input type="number" value={phaseForm.end_day} onChange={e => setPhaseForm(f => ({ ...f, end_day: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>Duration</Label><Input type="number" value={phaseForm.duration_days} onChange={e => setPhaseForm(f => ({ ...f, duration_days: e.target.value }))} /></div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2"><Label>Unlock Day of Week</Label><Input type="number" min="1" max="7" value={phaseForm.unlock_day_of_week} onChange={e => setPhaseForm(f => ({ ...f, unlock_day_of_week: e.target.value }))} /></div>
                            <div className="grid gap-2"><Label>Resource Status</Label><Input value={phaseForm.resource_status} onChange={e => setPhaseForm(f => ({ ...f, resource_status: e.target.value }))} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Resource PDF URL</Label><Input value={phaseForm.resource_pdf_url} onChange={e => setPhaseForm(f => ({ ...f, resource_pdf_url: e.target.value }))} placeholder="https://..." /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button><Button onClick={handleUpdatePhase} disabled={updatePhaseMut.isPending}>{updatePhaseMut.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Update Phase"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Day Detail Add/Edit */}
            <Dialog open={showDayDialog} onOpenChange={o => { setShowDayDialog(o); if (!o) resetDayForm() }}>
                <DialogContent className="sm:max-w-[650px] bg-white max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingDay ? "Edit Day Detail" : "Add Day Detail"}</DialogTitle><DialogDescription>{editingDay ? "Update day content." : "Add content for a day in this phase."}</DialogDescription></DialogHeader>
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
                        <div className="grid gap-2"><Label>Prompt (English)</Label><Textarea value={activityForm.prompt_en} onChange={e => setActivityForm(f => ({ ...f, prompt_en: e.target.value }))} rows={2} /></div>
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

function StatCard({ label, value, icon, color, bg }: { label: string; value: string; icon: React.ReactNode; color: string; bg: string }) {
    return (
        <Card className="fresh-card-alt border-none shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", bg, color)}>{icon}</div>
                <div><p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p><p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p></div>
            </CardContent>
        </Card>
    )
}
